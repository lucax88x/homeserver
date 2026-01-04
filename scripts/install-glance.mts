#!/usr/bin/env npx zx
/**
 * Install Glance Dashboard LXC
 * https://community-scripts.github.io/ProxmoxVE/scripts?id=glance
 * Access at http://<ip>:8080
 */
import { log, ctExists, runCtScript, setCtVars, env } from "./lib.mts";

const hostname = env("GLANCE_HOSTNAME", "glance");

if (await ctExists(hostname)) {
  log.skip(`Glance '${hostname}' already exists`);
  process.exit(0);
}

log.install("Glance...");

setCtVars({
  cpu: parseInt(env("GLANCE_CPU", "1")),
  ram: parseInt(env("GLANCE_RAM", "512")),
  disk: parseInt(env("GLANCE_DISK", "2")),
  hostname,
});

await runCtScript("glance");
log.ok("Glance installed (http://<ip>:8080)");
