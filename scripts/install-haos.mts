#!/usr/bin/env npx zx
/**
 * Install Home Assistant OS VM
 * https://community-scripts.github.io/ProxmoxVE/scripts?id=haos-vm
 */
import { log, vm } from "./lib.mts";

const VM_NAME = "haos";

if (await vm.exists(VM_NAME)) {
	log.skip(`Home Assistant OS VM '${VM_NAME}' already exists`);
	process.exit(0);
}

log.install("Home Assistant OS VM...");
await vm.runScript("haos-vm");
log.ok("Home Assistant OS installed");
