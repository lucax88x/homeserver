#!/usr/bin/env npx zx
/**
 * Sync Glance configuration to container
 * Config auto-reloads, no restart needed
 */

import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { $ } from "zx";
import { ct, log } from "./lib.mts";

$.verbose = true;

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoDir = dirname(__dirname);
const configSrc = join(repoDir, "configs/glance/glance.yml");
const hostname = "glance";

// Get container ID
const ctId = await ct.id(hostname);
if (!ctId) {
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

log.sync(`Glance config -> ${hostname} (CT ${ctId})`);

await $`echo ${configContent} | pct exec ${ctId} -- tee /opt/glance/glance.yml > /dev/null`;

log.ok("Glance config synced (auto-reloads on save)");
