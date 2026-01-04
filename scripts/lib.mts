/**
 * Common functions for Proxmox helper scripts
 */
import { $ } from "zx";

$.verbose = false;

export const SCRIPTS_URL =
	process.env.SCRIPTS_URL ??
	"https://raw.githubusercontent.com/community-scripts/ProxmoxVE/main";

export const log = {
	skip: (msg: string) => console.log(`[SKIP] ${msg}`),
	install: (msg: string) => console.log(`[INSTALL] ${msg}`),
	ok: (msg: string) => console.log(`[OK] ${msg}`),
	error: (msg: string) => console.log(`[ERROR] ${msg}`),
	info: (msg: string) => console.log(`[INFO] ${msg}`),
	sync: (msg: string) => console.log(`[SYNC] ${msg}`),
	create: (msg: string) => console.log(`[CREATE] ${msg}`),
	auth: (msg: string) => console.log(`[AUTH] ${msg}`),
};

/** Check if a container with given hostname exists */
export async function ctExists(hostname: string): Promise<boolean> {
	try {
		const result = await $`pct list 2>/dev/null | grep -qw ${hostname}`;
		return result.exitCode === 0;
	} catch {
		return false;
	}
}

/** Check if a VM with given name exists */
export async function vmExists(name: string): Promise<boolean> {
	try {
		const result = await $`qm list 2>/dev/null | grep -qw ${name}`;
		return result.exitCode === 0;
	} catch {
		return false;
	}
}

/** Get container ID by hostname */
export async function getCtId(hostname: string): Promise<string | null> {
	try {
		const result =
			await $`pct list 2>/dev/null | grep -w ${hostname} | awk '{print $1}'`;
		const ctid = result.stdout.trim();
		return ctid || null;
	} catch {
		return null;
	}
}

/** Get container IP by ID */
export async function getCtIp(ctid: string): Promise<string | null> {
	try {
		const result = await $`pct exec ${ctid} -- hostname -I | awk '{print $1}'`;
		const ip = result.stdout.trim();
		return ip || null;
	} catch {
		return null;
	}
}

/** Run a community script for LXC container */
export async function runCtScript(scriptName: string): Promise<void> {
	await $`curl -fsSL ${SCRIPTS_URL}/ct/${scriptName}.sh | bash`;
}

/** Run a community script for VM */
export async function runVmScript(scriptName: string): Promise<void> {
	await $`curl -fsSL ${SCRIPTS_URL}/vm/${scriptName}.sh | bash`;
}

/** Set environment variables for container creation */
export function setCtVars(options: {
	unprivileged?: number;
	cpu?: number;
	ram?: number;
	disk?: number;
	hostname: string;
	net?: string;
	ssh?: string;
}): void {
	process.env.var_unprivileged = String(options.unprivileged ?? 1);
	process.env.var_cpu = String(options.cpu ?? 1);
	process.env.var_ram = String(options.ram ?? 512);
	process.env.var_disk = String(options.disk ?? 2);
	process.env.var_hostname = options.hostname;
	process.env.var_net = options.net ?? "dhcp";
	process.env.var_ssh = options.ssh ?? "no";
}

/** Get environment variable with default */
export function env(name: string, defaultValue: string): string {
	return process.env[name] ?? defaultValue;
}
