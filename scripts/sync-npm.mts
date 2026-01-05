#!/usr/bin/env npx zx
/**
 * Sync proxy hosts to Nginx Proxy Manager via API
 * Creates/updates proxy hosts from configs/npm/hosts.csv
 */
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { $ } from "zx";
import { ct, env, log } from "./lib.mts";

$.verbose = false;

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoDir = dirname(__dirname);
const hostsFile = join(repoDir, "configs/npm/hosts.csv");
const hostname = env("NPM_HOSTNAME", "nginx-proxy-manager");
const domain = env("DOMAIN", "home.trazzi");
const npmEmail = env("NPM_EMAIL", "admin@example.com");
const npmPassword = env("NPM_PASSWORD", "changeme");

interface ProxyHost {
	subdomain: string;
	forwardHost: string;
	forwardPort: number;
	ssl: boolean;
	websockets: boolean;
}

interface NpmProxyHost {
	id: number;
	domain_names: string[];
}

// Get container IP
const ctid = await ct.id(hostname);
if (!ctid) {
	log.error(`Container '${hostname}' not found`);
	process.exit(1);
}

const npmIp = await ct.ip(ctid);
if (!npmIp) {
	log.error(`Could not get IP for container ${ctid}`);
	process.exit(1);
}

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
const token = tokenData.token;

if (!token) {
	log.error("Failed to authenticate. Check NPM_EMAIL and NPM_PASSWORD");
	console.log("[HINT] Default credentials: admin@example.com / changeme");
	process.exit(1);
}

log.ok("Authenticated");

// Get existing proxy hosts
const existingResponse = await fetch(`${npmUrl}/nginx/proxy-hosts`, {
	headers: { Authorization: `Bearer ${token}` },
});
const existingHosts = (await existingResponse.json()) as NpmProxyHost[];

// Create proxy host
async function createProxyHost(host: ProxyHost): Promise<void> {
	const domainName = `${host.subdomain}.${domain}`;

	// Check if already exists
	const existing = existingHosts.find((h) =>
		h.domain_names.includes(domainName),
	);

	if (existing) {
		console.log(`[SKIP] ${domainName} already exists (ID: ${existing.id})`);
		return;
	}

	log.create(`${domainName} -> ${host.forwardHost}:${host.forwardPort}`);

	const payload = {
		domain_names: [domainName],
		forward_scheme: "http",
		forward_host: host.forwardHost,
		forward_port: host.forwardPort,
		block_exploits: true,
		allow_websocket_upgrade: host.websockets,
		access_list_id: 0,
		certificate_id: 0,
		ssl_forced: false,
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

	const response = await fetch(`${npmUrl}/nginx/proxy-hosts`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	});

	const result = (await response.json()) as { id?: number };
	console.log(result.id ?? "FAILED");
}

// Parse hosts file
const hostsContent = await readFile(hostsFile, "utf-8");
const hosts: ProxyHost[] = hostsContent
	.split("\n")
	.filter((line) => line.trim() && !line.startsWith("#"))
	.map((line) => {
		const [subdomain, forwardHost, forwardPort, ssl, websockets] =
			line.split(",");
		return {
			subdomain: subdomain.trim(),
			forwardHost: forwardHost.trim(),
			forwardPort: parseInt(forwardPort.trim()),
			ssl: ssl.trim() === "true",
			websockets: websockets.trim() === "true",
		};
	});

console.log("");
log.sync("Processing proxy hosts...");

for (const host of hosts) {
	await createProxyHost(host);
}

console.log("");
log.ok("Proxy hosts synced");
console.log("");
console.log("[NEXT] To enable Let's Encrypt:");
console.log(`  1. Open NPM web UI: http://${npmIp}:81`);
console.log("  2. Edit each proxy host -> SSL tab");
console.log("  3. Request new SSL certificate -> Let's Encrypt");
console.log("  4. Enable 'Force SSL' and 'HTTP/2 Support'");
