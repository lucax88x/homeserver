#!/usr/bin/env npx zx
import { $ } from "zx";
/**
 * Install AIOStreams LXC
 * https://github.com/Viren070/AIOStreams
 * Stremio addon aggregator - consolidates multiple addons and debrid services
 * Access at http://<ip>:3000
 */
import { ct, env, log } from "./lib.mts";

$.verbose = true;

const hostname = env("AIOSTREAMS_HOSTNAME", "aiostreams");

if (await ct.exists(hostname)) {
	log.skip(`AIOStreams '${hostname}' already exists`);
	process.exit(0);
}

log.install("AIOStreams (Docker-based)...");

// Use Docker community script as base
ct.setVars({
	cpu: parseInt(env("AIOSTREAMS_CPU", "2")),
	ram: parseInt(env("AIOSTREAMS_RAM", "2048")),
	disk: parseInt(env("AIOSTREAMS_DISK", "8")),
	hostname,
});

// Create Docker LXC
await ct.runScript("docker");

// Wait for container to be ready
log.info("Waiting for container to be ready...");
await $`sleep 10`;

// Get container ID
const ctid = await ct.id(hostname);
if (!ctid) {
	log.error("Failed to get container ID");
	process.exit(1);
}

log.info(`Container ID: ${ctid}`);

// Generate a secret key for AIOStreams
const secretKey =
	await $`openssl rand -hex 32`.then((r) => r.stdout.trim());

// Create app directory and compose file in container
log.info("Setting up AIOStreams...");

const composeContent = `services:
  aiostreams:
    image: ghcr.io/viren070/aiostreams:latest
    container_name: aiostreams
    restart: unless-stopped
    ports:
      - 3000:3000
    environment:
      - SECRET_KEY=${secretKey}
      - BASE_URL=\${BASE_URL:-http://localhost:3000}
      - DATABASE_URI=sqlite://./data/db.sqlite
    volumes:
      - ./data:/app/data`;

// Execute setup commands inside the container
await $`pct exec ${ctid} -- mkdir -p /opt/aiostreams`;
await $`pct exec ${ctid} -- bash -c ${`cat > /opt/aiostreams/compose.yaml << 'EOF'
${composeContent}
EOF`}`;

// Start AIOStreams with docker compose
log.info("Starting AIOStreams container...");
await $`pct exec ${ctid} -- bash -c "cd /opt/aiostreams && docker compose up -d"`;

// Wait for container to start
await $`sleep 5`;

// Check if running
const status =
	await $`pct exec ${ctid} -- docker ps --filter name=aiostreams --format "{{.Status}}"`.then(
		(r) => r.stdout.trim(),
	);
log.info(`Container status: ${status}`);

log.ok("AIOStreams installed (http://<ip>:3000)");
log.info("Configure BASE_URL in /opt/aiostreams/compose.yaml for production use");
