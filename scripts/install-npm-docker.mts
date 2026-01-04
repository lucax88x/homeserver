#!/usr/bin/env npx zx
/**
 * Install Nginx Proxy Manager (Docker version)
 * Uses jc21/nginx-proxy-manager:latest
 */
import { log } from "./lib.mts";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { $ } from "zx";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoDir = dirname(__dirname);
const composeFile = join(repoDir, "configs/npm/compose.yaml");

log.install("Nginx Proxy Manager (Docker)...");

// Check if docker is available
try {
  await $`docker --version`;
} catch {
  log.error("Docker is not installed or not found in PATH.");
  process.exit(1);
}

// Deploy with docker compose
try {
  await $`docker compose -f ${composeFile} up -d`;
  log.ok("Nginx Proxy Manager (Docker) installed and running.");
  console.log("Admin UI: http://localhost:81");
  console.log("Default credentials: admin@example.com / changeme");
} catch (error) {
  log.error(`Failed to deploy: ${error}`);
  process.exit(1);
}
