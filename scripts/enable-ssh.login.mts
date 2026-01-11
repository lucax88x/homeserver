#!/usr/bin/env npx zx

/**
 * Enable SSH root login and password authentication
 * Run this directly on the target machine
 */

import { $, question } from "zx";
import { log } from "./lib.mts";

$.verbose = true;

const hostname = (await $`hostname`.quiet()).stdout.trim();
const confirm = await question(
	`You are on "${hostname}". Proceed with enabling SSH login? [y/N] `,
);

if (confirm.toLowerCase() !== "y") {
	log.info("Aborted");
	process.exit(0);
}

log.info("Enabling SSH root login and password authentication");

// Enable PermitRootLogin
await $`sed -i 's/^#*PermitRootLogin.*/PermitRootLogin yes/' /etc/ssh/sshd_config`;

// Enable PasswordAuthentication
await $`sed -i 's/^#*PasswordAuthentication.*/PasswordAuthentication yes/' /etc/ssh/sshd_config`;

// Restart SSH service (try both sshd and ssh for compatibility)
await $`systemctl restart sshd 2>/dev/null || systemctl restart ssh`;

log.ok("SSH login enabled");
