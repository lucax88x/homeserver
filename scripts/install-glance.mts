#!/usr/bin/env npx zx
import { $ } from "zx";
/**
 * Install Glance Dashboard LXC
 * https://community-scripts.github.io/ProxmoxVE/scripts?id=glance
 * Access at http://<ip>:8080
 */
import { ct, env, log } from "./lib.mts";

$.verbose = true;

const hostname = env("GLANCE_HOSTNAME", "glance");

if (await ct.exists(hostname)) {
	log.skip(`Glance '${hostname}' already exists`);
	process.exit(0);
}

log.install("Glance...");

ct.setVars({
	cpu: parseInt(env("GLANCE_CPU", "1")),
	ram: parseInt(env("GLANCE_RAM", "512")),
	disk: parseInt(env("GLANCE_DISK", "2")),
	hostname,
});

await ct.runScript("glance");
log.ok("Glance installed (http://<ip>:8080)");
