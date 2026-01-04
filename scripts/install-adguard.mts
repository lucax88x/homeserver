#!/usr/bin/env npx zx
/**
 * Install AdGuard Home LXC
 * https://community-scripts.github.io/ProxmoxVE/scripts?id=adguard
 * Access at http://<ip>:3000 (setup) then http://<ip>:80
 */
import { log, ctExists, runCtScript, setCtVars, env } from "./lib.mts";

const hostname = env("ADGUARD_HOSTNAME", "adguard");

if (await ctExists(hostname)) {
  log.skip(`AdGuard Home '${hostname}' already exists`);
  process.exit(0);
}

log.install("AdGuard Home...");

setCtVars({
  cpu: parseInt(env("ADGUARD_CPU", "1")),
  ram: parseInt(env("ADGUARD_RAM", "512")),
  disk: parseInt(env("ADGUARD_DISK", "2")),
  hostname,
});

await runCtScript("adguard");
log.ok("AdGuard Home installed (http://<ip>:3000 for setup)");
