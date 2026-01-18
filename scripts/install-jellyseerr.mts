#!/usr/bin/env npx zx
import { $ } from "zx";
/**
 * Install Jellyseerr LXC
 * https://community-scripts.github.io/ProxmoxVE/scripts?id=jellyseerr
 * Media request management for Jellyfin
 * Access at http://<ip>:5055
 */
import { ct, env, log } from "./lib.mts";

$.verbose = true;

const hostname = env("JELLYSEERR_HOSTNAME", "jellyseerr");

if (await ct.exists(hostname)) {
	log.skip(`Jellyseerr '${hostname}' already exists`);
	process.exit(0);
}

log.install("Jellyseerr...");

ct.setVars({
	cpu: parseInt(env("JELLYSEERR_CPU", "2")),
	ram: parseInt(env("JELLYSEERR_RAM", "2048")),
	disk: parseInt(env("JELLYSEERR_DISK", "8")),
	hostname,
});

await ct.runScript("jellyseerr");
log.ok("Jellyseerr installed (http://<ip>:5055)");
