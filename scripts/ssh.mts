#!/usr/bin/env npx zx
/**
 * SSH to a server by name
 * Usage: zx ssh.mts [server-name]
 * If no server name provided, lists available servers
 */

import { $ } from "zx";
import { log } from "./lib.mts";
import { servers } from "./servers.mts";

$.verbose = true;

const serverName = process.argv[3];

if (!serverName) {
	console.log("Available servers:");
	for (const [name, ip] of Object.entries(servers)) {
		console.log(`  ${name}: ${ip}`);
	}
	process.exit(0);
}

const ip = servers[serverName];

if (!ip) {
	log.error(`Unknown server: ${serverName}`);
	console.log("Available servers:");
	for (const name of Object.keys(servers)) {
		console.log(`  ${name}`);
	}
	process.exit(1);
}

log.info(`Connecting to ${serverName} (${ip})`);
await $`ssh root@${ip}`.stdio("inherit", "inherit", "inherit");
