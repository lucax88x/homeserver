#!/usr/bin/env npx zx
import { $ } from "zx";
/**
 * Install Bazarr LXC
 * https://community-scripts.github.io/ProxmoxVE/scripts?id=bazarr
 * Subtitle management for Sonarr and Radarr
 * Access at http://<ip>:6767
 */
import { ct, env, log } from "./lib.mts";

$.verbose = true;

const hostname = env("BAZARR_HOSTNAME", "bazarr");

if (await ct.exists(hostname)) {
	log.skip(`Bazarr '${hostname}' already exists`);
	process.exit(0);
}

log.install("Bazarr...");

ct.setVars({
	cpu: parseInt(env("BAZARR_CPU", "2")),
	ram: parseInt(env("BAZARR_RAM", "1024")),
	disk: parseInt(env("BAZARR_DISK", "4")),
	hostname,
});

await ct.runScript("bazarr");
log.ok("Bazarr installed (http://<ip>:6767)");
