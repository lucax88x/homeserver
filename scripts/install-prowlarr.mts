#!/usr/bin/env npx zx
import { $ } from "zx";
/**
 * Install Prowlarr LXC
 * https://community-scripts.github.io/ProxmoxVE/scripts?id=prowlarr
 * Indexer manager for Usenet and BitTorrent
 * Access at http://<ip>:9696
 */
import { ct, env, log } from "./lib.mts";

$.verbose = true;

const hostname = env("PROWLARR_HOSTNAME", "prowlarr");

if (await ct.exists(hostname)) {
	log.skip(`Prowlarr '${hostname}' already exists`);
	process.exit(0);
}

log.install("Prowlarr...");

ct.setVars({
	cpu: parseInt(env("PROWLARR_CPU", "1")),
	ram: parseInt(env("PROWLARR_RAM", "512")),
	disk: parseInt(env("PROWLARR_DISK", "4")),
	hostname,
});

await ct.runScript("prowlarr");
log.ok("Prowlarr installed (http://<ip>:9696)");
