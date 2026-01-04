#!/usr/bin/env npx zx
/**
 * Install Nginx Proxy Manager LXC
 * https://community-scripts.github.io/ProxmoxVE/scripts?id=nginxproxymanager
 * Default login: admin@example.com / changeme
 */
import { log, ct, env } from "./lib.mts";

const hostname = env("NPM_HOSTNAME", "nginx-proxy-manager");

if (await ct.exists(hostname)) {
  log.skip(`Nginx Proxy Manager '${hostname}' already exists`);
  process.exit(0);
}

log.install("Nginx Proxy Manager...");

ct.setVars({
  cpu: parseInt(env("NPM_CPU", "1")),
  ram: parseInt(env("NPM_RAM", "1024")),
  disk: parseInt(env("NPM_DISK", "4")),
  hostname,
});

await ct.runScript("nginxproxymanager");
log.ok("Nginx Proxy Manager installed (admin@example.com / changeme)");
