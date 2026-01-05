#!/usr/bin/env npx zx
/**
 * Sync Glance configuration to container
 * Config auto-reloads, no restart needed
 */

import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { $ } from "zx";
import { ct, env, log } from "./lib.mts";

$.verbose = false;

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoDir = dirname(__dirname);
const configSrc = join(repoDir, "configs/glance/glance.yml");
const hostname = env("GLANCE_HOSTNAME", "glance");
const domain = env("DOMAIN", "home.trazzi");

// Get container ID
const ctid = await ct.id(hostname);
if (!ctid) {
	log.error(`Container '${hostname}' not found`);
	process.exit(1);
}

// Read and substitute environment variables in config
let configContent: string;
try {
	configContent = await readFile(configSrc, "utf-8");
} catch {
	log.error(`Config file not found: ${configSrc}`);
	process.exit(1);
}

// Simple env var substitution for ${VAR} syntax
configContent = configContent.replace(/\$\{(\w+)\}/g, (_, varName) => {
	return process.env[varName] ?? (varName === "DOMAIN" ? domain : "");
});

log.sync(`Glance config -> ${hostname} (CT ${ctid})`);

// Write config to container
$.verbose = false;
await $`echo ${configContent} | pct exec ${ctid} -- tee /opt/glance/glance.yml > /dev/null`;

log.ok("Glance config synced (auto-reloads on save)");
