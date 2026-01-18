#!/usr/bin/env npx zx
import { $ } from "zx";
/**
 * Install Sonarr LXC
 * https://community-scripts.github.io/ProxmoxVE/scripts?id=sonarr
 * TV series collection manager for Usenet and BitTorrent
 * Access at http://<ip>:8989
 */
import { ct, env, log } from "./lib.mts";

$.verbose = true;

const hostname = env("SONARR_HOSTNAME", "sonarr");

if (await ct.exists(hostname)) {
	log.skip(`Sonarr '${hostname}' already exists`);
	process.exit(0);
}

log.install("Sonarr...");

ct.setVars({
	cpu: parseInt(env("SONARR_CPU", "2")),
	ram: parseInt(env("SONARR_RAM", "1024")),
	disk: parseInt(env("SONARR_DISK", "4")),
	hostname,
});

await ct.runScript("sonarr");
log.ok("Sonarr installed (http://<ip>:8989)");
