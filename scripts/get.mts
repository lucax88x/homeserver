#!/usr/bin/env npx zx
/**
 * Get IP address of a server by name
 * Usage: zx get-ip.mts [server-name]
 * If no server name provided, lists available servers
 */

import { colors, log } from "./lib.mts";
import { servers } from "./servers.mts";

const serverName = process.argv[3];

if (!serverName) {
	console.log(colors.label("Available servers:"));
	for (const [name, server] of Object.entries(servers)) {
		console.log(`  ${colors.name(name)}: ${colors.ip(server.ip)} (${colors.domain(server.domains[0])})`);
		for (const { port, description } of server.ports) {
			console.log(`    - ${colors.port(port)}: ${colors.description(description)}`);
		}
	}
	process.exit(0);
}

const server = servers[serverName];

if (!server) {
	log.error(`Unknown server: ${serverName}`);
	console.log(colors.label("Available servers:"));
	for (const name of Object.keys(servers)) {
		console.log(`  ${colors.name(name)}`);
	}
	process.exit(1);
}

console.log(`${colors.label("IP:")} ${colors.ip(server.ip)}`);
console.log(`${colors.label("Domain:")} ${colors.domain(server.domains[0])}`);
if (server.ports.length > 0) {
	console.log(colors.label("Ports:"));
	for (const { port, description } of server.ports) {
		console.log(`  ${colors.port(port)}: ${colors.description(description)}`);
	}
}
