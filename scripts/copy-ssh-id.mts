#!/usr/bin/env npx zx

/**
 * Copy SSH public key to all servers
 */

import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { $, question } from "zx";
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

for (const [name, server] of Object.entries(servers)) {
	const confirm = await question(`Copy SSH key to ${name} (${server.ip} / ${server.domain})? [y/N] `);
	if (confirm.toLowerCase() !== "y") {
		log.skip(`Skipping ${name}`);
		continue;
	}

	try {
		await $`ssh-copy-id -i ${keyPath} ${user}@${server.ip}`;
		log.ok(`SSH key copied to ${name} via IP`);
	} catch (error) {
		log.error(`Failed to copy SSH key to ${name} via IP: ${error}`);
	}

	try {
		await $`ssh-copy-id -i ${keyPath} ${user}@${server.domain}`;
		log.ok(`SSH key copied to ${name} via domain`);
	} catch (error) {
		log.error(`Failed to copy SSH key to ${name} via domain: ${error}`);
	}
}

log.ok("Done copying SSH keys to all servers");
