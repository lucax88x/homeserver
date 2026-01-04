#!/usr/bin/env npx zx
/**
 * Install Portainer LXC
 * https://community-scripts.github.io/ProxmoxVE/scripts?id=portainer
 * Access at https://<ip>:9443
 */
import { log, ctExists, runCtScript, setCtVars, env } from "./lib.mts";

const hostname = env("PORTAINER_HOSTNAME", "portainer");

if (await ctExists(hostname)) {
  log.skip(`Portainer '${hostname}' already exists`);
  process.exit(0);
}

log.install("Portainer...");

setCtVars({
  cpu: parseInt(env("PORTAINER_CPU", "1")),
  ram: parseInt(env("PORTAINER_RAM", "1024")),
  disk: parseInt(env("PORTAINER_DISK", "4")),
  hostname,
});

await runCtScript("portainer");
log.ok("Portainer installed (https://<ip>:9443)");
