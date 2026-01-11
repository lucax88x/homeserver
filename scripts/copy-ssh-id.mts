#!/usr/bin/env npx zx

/**
 * Copy SSH public key to all servers
 */

import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { $ } from "zx";
import { log } from "./lib.mts";
import { servers } from "./servers.mts";

$.verbose = true;

log.info("Starting to copy SSH keys to all servers");

const keyPath = join(homedir(), ".ssh", "id_ed25519.pub");

if (!existsSync(keyPath)) {
	log.error(`SSH key not found at ${keyPath}`);
	process.exit(1);
}
const user = "root";

for (const [name, ip] of Object.entries(servers)) {
	log.info(`Copying SSH key to ${name} (${ip})`);
	try {
		await $`ssh-copy-id -i ${keyPath} ${user}@${ip}`;
		log.ok(`SSH key copied to ${name}`);
	} catch (error) {
		log.error(`Failed to copy SSH key to ${name}: ${error}`);
	}
}

log.ok("Done copying SSH keys to all servers");
