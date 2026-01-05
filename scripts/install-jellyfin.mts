#!/usr/bin/env npx zx
import { $ } from "zx";
/**
 * Install Jellyfin Media Server LXC
 * https://community-scripts.github.io/ProxmoxVE/scripts?id=jellyfin
 * Access at http://<ip>:8096
 */
import { ct, env, log } from "./lib.mts";

$.verbose = true;

const hostname = env("JELLYFIN_HOSTNAME", "jellyfin");

if (await ct.exists(hostname)) {
	log.skip(`Jellyfin '${hostname}' already exists`);
	process.exit(0);
}

log.install("Jellyfin...");

ct.setVars({
	cpu: parseInt(env("JELLYFIN_CPU", "2")),
	ram: parseInt(env("JELLYFIN_RAM", "2048")),
	disk: parseInt(env("JELLYFIN_DISK", "8")),
	hostname,
});

await ct.runScript("jellyfin");
log.ok("Jellyfin installed (http://<ip>:8096)");
