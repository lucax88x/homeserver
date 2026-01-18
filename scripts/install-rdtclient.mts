#!/usr/bin/env npx zx
import { $ } from "zx";
/**
 * Install RDTClient LXC
 * https://community-scripts.github.io/ProxmoxVE/scripts?id=rdtclient
 * Real-Debrid torrent client proxy (emulates qBittorrent API for Sonarr/Radarr)
 * Access at http://<ip>:6500
 */
import { ct, env, log } from "./lib.mts";

$.verbose = true;

const hostname = env("RDTCLIENT_HOSTNAME", "rdtclient");

if (await ct.exists(hostname)) {
	log.skip(`RDTClient '${hostname}' already exists`);
	process.exit(0);
}

log.install("RDTClient...");

ct.setVars({
	cpu: parseInt(env("RDTCLIENT_CPU", "1")),
	ram: parseInt(env("RDTCLIENT_RAM", "1024")),
	disk: parseInt(env("RDTCLIENT_DISK", "4")),
	hostname,
});

await ct.runScript("rdtclient");
log.ok("RDTClient installed (http://<ip>:6500)");
