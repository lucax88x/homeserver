#!/usr/bin/env npx zx
import { $ } from "zx";
/**
 * Install Radarr LXC
 * https://community-scripts.github.io/ProxmoxVE/scripts?id=radarr
 * Movie collection manager for Usenet and BitTorrent
 * Access at http://<ip>:7878
 */
import { ct, env, log } from "./lib.mts";

$.verbose = true;

const hostname = env("RADARR_HOSTNAME", "radarr");

if (await ct.exists(hostname)) {
	log.skip(`Radarr '${hostname}' already exists`);
	process.exit(0);
}

log.install("Radarr...");

ct.setVars({
	cpu: parseInt(env("RADARR_CPU", "2")),
	ram: parseInt(env("RADARR_RAM", "1024")),
	disk: parseInt(env("RADARR_DISK", "4")),
	hostname,
});

await ct.runScript("radarr");
log.ok("Radarr installed (http://<ip>:7878)");
