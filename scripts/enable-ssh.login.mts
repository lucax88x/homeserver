#!/usr/bin/env npx zx

/**
 * Print commands to enable SSH root login and password authentication
 */

console.log("Run these commands INSIDE the LXC container:\n");
console.log(`sed -i 's/^#*PermitRootLogin.*/PermitRootLogin yes/' /etc/ssh/sshd_config`);
console.log(`sed -i 's/^#*PasswordAuthentication.*/PasswordAuthentication yes/' /etc/ssh/sshd_config`);
console.log(`systemctl restart sshd 2>/dev/null || systemctl restart ssh`);
