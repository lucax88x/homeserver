#!/usr/bin/env npx zx
/**
 * SSH to a server by name
 * Usage: zx ssh.mts [server-name]
 * If no server name provided, lists available servers
 */

import { spawn } from "node:child_process";
import { log } from "./lib.mts";
import { servers } from "./servers.mts";

const serverName = process.argv[3];

if (!serverName) {
	console.log("Available servers:");
	for (const [name, server] of Object.entries(servers)) {
		console.log(`  ${name}: ${server.ip} (${server.domain})`);
	}
	process.exit(0);
}

const server = servers[serverName];

if (!server) {
	log.error(`Unknown server: ${serverName}`);
	console.log("Available servers:");
	for (const name of Object.keys(servers)) {
		console.log(`  ${name}`);
	}
	process.exit(1);
}

log.info(`Connecting to ${serverName} (${server.ip})`);

const ssh = spawn("ssh", ["-t", `root@${server.ip}`], {
	stdio: "inherit",
});

ssh.on("close", (code) => {
	process.exit(code ?? 0);
});
