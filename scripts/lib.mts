/**
 * Common functions for Proxmox helper scripts
 */
import { $, chalk } from "zx";

$.verbose = true;

export const SCRIPTS_URL =
	process.env.SCRIPTS_URL ??
	"https://raw.githubusercontent.com/community-scripts/ProxmoxVE/main";

export const colors = {
	name: chalk.cyan.bold,
	ip: chalk.yellow,
	domain: chalk.green,
	port: chalk.magenta,
	description: chalk.gray,
	label: chalk.white.bold,
};

export const log = {
	skip: (msg: string) => console.log(chalk.gray(`[SKIP] ${msg}`)),
	install: (msg: string) => console.log(chalk.blue(`[INSTALL] ${msg}`)),
	ok: (msg: string) => console.log(chalk.green(`[OK] ${msg}`)),
	error: (msg: string) => console.log(chalk.red(`[ERROR] ${msg}`)),
	info: (msg: string) => console.log(chalk.cyan(`[INFO] ${msg}`)),
	sync: (msg: string) => console.log(chalk.yellow(`[SYNC] ${msg}`)),
	create: (msg: string) => console.log(chalk.magenta(`[CREATE] ${msg}`)),
	auth: (msg: string) => console.log(chalk.blue(`[AUTH] ${msg}`)),
};

/** Assert that a command exists, exit if not (ensures we're in Proxmox shell) */
async function assertCommand(cmd: string): Promise<void> {
	try {
		await $`which ${cmd}`.quiet();
	} catch {
		log.error(
			`Command '${cmd}' not found. Are you running this on a Proxmox host?`,
		);
		process.exit(1);
	}
}

/** Check if a container with given hostname exists */
async function ctExists(hostname: string): Promise<boolean> {
	await assertCommand("pct");

	try {
		const result = await $`pct list 2>/dev/null | grep -qw ${hostname}`;
		return result.exitCode === 0;
	} catch {
		return false;
	}
}

/** Check if a VM with given name exists */
async function vmExists(name: string): Promise<boolean> {
	await assertCommand("qm");

	try {
		const result = await $`qm list 2>/dev/null | grep -qw ${name}`;
		return result.exitCode === 0;
	} catch {
		return false;
	}
}

/** Get container ID by hostname */
async function getCtId(hostname: string): Promise<string | null> {
	await assertCommand("pct");

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
async function getCtIp(ctid: string): Promise<string | null> {
	await assertCommand("pct");

	try {
		const result = await $`pct exec ${ctid} -- hostname -I | awk '{print $1}'`;
		const ip = result.stdout.trim();
		return ip || null;
	} catch {
		return null;
	}
}

/** Run a community script for LXC container */
async function runCtScript(scriptName: string): Promise<void> {
	await $`curl -fsSL ${SCRIPTS_URL}/ct/${scriptName}.sh | bash`;
}

/** Run a community script for VM */
async function runVmScript(scriptName: string): Promise<void> {
	await $`curl -fsSL ${SCRIPTS_URL}/vm/${scriptName}.sh | bash`;
}

/** Set environment variables for container creation */
function setCtVars(options: {
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

export const vm = {
	exists: vmExists,
	runScript: runVmScript,
};

export const ct = {
	exists: ctExists,
	id: getCtId,
	ip: getCtIp,
	runScript: runCtScript,
	setVars: setCtVars,
};

/** Get environment variable with default */
export function env(name: string, defaultValue: string): string {
	return process.env[name] ?? defaultValue;
}
