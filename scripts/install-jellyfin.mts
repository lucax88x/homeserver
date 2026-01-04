#!/usr/bin/env npx zx
/**
 * Install Jellyfin Media Server LXC
 * https://community-scripts.github.io/ProxmoxVE/scripts?id=jellyfin
 * Access at http://<ip>:8096
 */
import { log, ctExists, runCtScript, setCtVars, env } from "./lib.mts";

const hostname = env("JELLYFIN_HOSTNAME", "jellyfin");

if (await ctExists(hostname)) {
  log.skip(`Jellyfin '${hostname}' already exists`);
  process.exit(0);
}

log.install("Jellyfin...");

setCtVars({
  cpu: parseInt(env("JELLYFIN_CPU", "2")),
  ram: parseInt(env("JELLYFIN_RAM", "2048")),
  disk: parseInt(env("JELLYFIN_DISK", "8")),
  hostname,
});

await runCtScript("jellyfin");
log.ok("Jellyfin installed (http://<ip>:8096)");
