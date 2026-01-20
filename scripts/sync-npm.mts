#!/usr/bin/env npx zx
/**
 * Sync proxy hosts to Nginx Proxy Manager via API
 * Creates/updates proxy hosts from configs/npm/hosts.csv
 * based on swagger https://github.com/NginxProxyManager/nginx-proxy-manager/tree/develop/backend/schema
 */
import { diff } from "deep-object-diff";
import { $, question } from "zx";
import { log } from "./lib.mts";
import { type Server, servers } from "./servers.mts";

$.verbose = true;

const npmEmail = process.env.NPM_EMAIL;
const npmPassword = process.env.NPM_PASSWORD;

if (!npmEmail || !npmPassword) {
	log.error("NPM_EMAIL and NPM_PASSWORD environment variables are required");
	process.exit(1);
}

interface NpmProxyHost {
	id: number;
	domain_names: string[];
	forward_scheme: string;
	forward_host: string;
	forward_port: number;
	block_exploits: boolean;
	allow_websocket_upgrade: boolean;
	ssl_forced: boolean;
	http2_support: boolean;
	hsts_enabled: boolean;
	hsts_subdomains: boolean;
	caching_enabled: boolean;
}

const npmIp = servers["npm"].ip;

const npmUrl = `http://${npmIp}:81/api`;
log.info(`NPM API: ${npmUrl}`);

// Authenticate
log.auth("Logging in to NPM...");

const tokenResponse = await fetch(`${npmUrl}/tokens`, {
	method: "POST",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify({ identity: npmEmail, secret: npmPassword }),
});

const tokenData = (await tokenResponse.json()) as { token?: string };

if (tokenResponse.status !== 200) {
	log.error(
		`Failed to authenticate. ${tokenResponse.status} ${tokenResponse.statusText}`,
	);
	process.exit(1);
}

if (!tokenData.token) {
	log.error("Failed to authenticate. Missing token");
	process.exit(1);
}

const token = tokenData.token;

log.ok("Authenticated");

// Get existing proxy hosts
const existingResponse = await fetch(`${npmUrl}/nginx/proxy-hosts`, {
	headers: { Authorization: `Bearer ${token}` },
});
const existingHosts = (await existingResponse.json()) as NpmProxyHost[];

log.info("existing proxy hosts found");
// log.info(JSON.stringify(existingHosts));

// Create proxy host
async function createProxyHost(server: Server): Promise<void> {
	const existing = existingHosts.find((h) =>
		server.domains.some((d) => h.domain_names.includes(d)),
	);

	const httpPort = server.ports.find((p) => p.type === "http");

	if (!httpPort) {
		log.skip(`${server.domains.join(", ")} has no http port`);
		return;
	}

	const payload = {
		domain_names: server.domains,
		forward_scheme: "http",
		forward_host: server.ip,
		forward_port: httpPort.port,
		block_exploits: true,
		allow_websocket_upgrade: false,
		access_list_id: 0,
		certificate_id: 22,
		ssl_forced: true,
		http2_support: true,
		hsts_enabled: false,
		hsts_subdomains: false,
		meta: {
			letsencrypt_agree: true,
			dns_challenge: false,
		},
		advanced_config: "",
		locations: [],
		caching_enabled: false,
	};

	if (existing) {
		const comparable = {
			domain_names: existing.domain_names,
			forward_scheme: existing.forward_scheme,
			forward_host: existing.forward_host,
			forward_port: existing.forward_port,
			block_exploits: existing.block_exploits,
			allow_websocket_upgrade: existing.allow_websocket_upgrade,
			ssl_forced: existing.ssl_forced,
			http2_support: existing.http2_support,
			hsts_enabled: existing.hsts_enabled,
			hsts_subdomains: existing.hsts_subdomains,
			caching_enabled: existing.caching_enabled,
		};

		const payloadComparable = {
			domain_names: payload.domain_names,
			forward_scheme: payload.forward_scheme,
			forward_host: payload.forward_host,
			forward_port: payload.forward_port,
			block_exploits: payload.block_exploits,
			allow_websocket_upgrade: payload.allow_websocket_upgrade,
			ssl_forced: payload.ssl_forced,
			http2_support: payload.http2_support,
			hsts_enabled: payload.hsts_enabled,
			hsts_subdomains: payload.hsts_subdomains,
			caching_enabled: payload.caching_enabled,
		};

		const differences = diff(comparable, payloadComparable);

		if (Object.keys(differences).length > 0) {
			log.error(
				`${server.domains.join(", ")} (ID: ${existing.id}) has configuration drift:`,
			);

			log.error(JSON.stringify(differences, null, 2));
		} else {
			log.skip(
				`${server.domains.join(", ")} already exists (ID: ${existing.id})`,
			);
		}

		return;
	}

	log.create(`${server.domains.join(", ")} -> ${server.ip}:${httpPort.port}`);

	const confirm = await question("Create this proxy host? [y/N] ");

	if (confirm.toLowerCase() !== "y") {
		log.skip("Skipped");
		return;
	}

	const response = await fetch(`${npmUrl}/nginx/proxy-hosts`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	});

	if (response.status === 200) {
		const result = (await response.json()) as { id?: number };

		log.info(`created with id ${result.id}`);
		return;
	}

	log.error(
		`Failed to create ${server.domains.join(", ")}: ${response.status} ${response.statusText}`,
	);
}

// Parse hosts file
log.info("");
log.sync("Processing proxy hosts...");

for (const key in servers) {
	const server = servers[key];

	await createProxyHost(server);
}

log.info("");
log.ok("Proxy hosts synced");
log.info("");
