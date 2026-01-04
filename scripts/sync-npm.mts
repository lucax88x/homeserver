#!/usr/bin/env npx zx
/**
 * Sync proxy hosts to Nginx Proxy Manager via API
 * Creates/updates proxy hosts from configs/npm/hosts.yaml
 */
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { log, ct, env } from "./lib.mts";
import { YAML } from "zx";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoDir = dirname(__dirname);
const hostsFile = join(repoDir, "configs/npm/hosts.yaml");
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

interface NpmCertificate {
  id: number;
  nice_name: string;
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

// Get existing resources
const existingHosts = (await (
  await fetch(`${npmUrl}/nginx/proxy-hosts`, {
    headers: { Authorization: `Bearer ${token}` },
  })
).json()) as NpmProxyHost[];

const existingCerts = (await (
  await fetch(`${npmUrl}/nginx/certificates`, {
    headers: { Authorization: `Bearer ${token}` },
  })
).json()) as NpmCertificate[];

// Helper to get or create certificate
async function getOrCreateCertificate(domainName: string): Promise<number> {
  const existing = existingCerts.find((c) =>
    c.domain_names.includes(domainName)
  );
  if (existing) {
    return existing.id;
  }

  log.info(`Requesting Let's Encrypt certificate for ${domainName}...`);
  const payload = {
    provider: "letsencrypt",
    nice_name: domainName,
    domain_names: [domainName],
    meta: {
      letsencrypt_email: npmEmail,
      letsencrypt_agree: true,
      dns_challenge: false,
    },
  };

  const response = await fetch(`${npmUrl}/nginx/certificates`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.text();
    log.error(`Failed to create certificate for ${domainName}: ${err}`);
    return 0;
  }

  const result = (await response.json()) as { id: number };
  log.ok(`Certificate created (ID: ${result.id})`);
  return result.id;
}

// Create proxy host
async function createProxyHost(host: ProxyHost): Promise<void> {
  const domainName = `${host.subdomain}.${domain}`;

  // Check if already exists
  const existing = existingHosts.find((h) =>
    h.domain_names.includes(domainName)
  );

  if (existing) {
    console.log(`[SKIP] ${domainName} already exists (ID: ${existing.id})`);
    return;
  }

  log.create(`${domainName} -> ${host.forwardHost}:${host.forwardPort}`);

  let certificateId = 0;
  if (host.ssl) {
    certificateId = await getOrCreateCertificate(domainName);
  }

  const payload = {
    domain_names: [domainName],
    forward_scheme: "http",
    forward_host: host.forwardHost,
    forward_port: host.forwardPort,
    block_exploits: true,
    allow_websocket_upgrade: host.websockets,
    access_list_id: 0,
    certificate_id: certificateId,
    ssl_forced: host.ssl,
    http2_support: host.ssl,
    hsts_enabled: false,
    hsts_subdomains: false,
    meta: {
      letsencrypt_agree: false, // Not needed here if we use existing cert
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

  if (!response.ok) {
    const err = await response.text();
    log.error(`Failed to create proxy host ${domainName}: ${err}`);
    return;
  }

  const result = (await response.json()) as { id?: number };
  console.log(`[OK] Created host ID: ${result.id ?? "UNKNOWN"}`);
}

// Parse hosts file
const hostsContent = await readFile(hostsFile, "utf-8");
const hosts = YAML.parse(hostsContent) as ProxyHost[];

console.log("");
log.sync(`Processing ${hosts.length} proxy hosts...`);

for (const host of hosts) {
  await createProxyHost(host);
}

console.log("");
log.ok("Proxy hosts synced");
