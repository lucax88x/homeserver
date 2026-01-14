/**
 * Server configuration for home network services
 */

export const domain = "trazzi.lol";

export interface Port {
	port: number;
	description: string;
}

export interface Server {
	ip: string;
	domain: string;
	ports: Port[];
	title: string;
	icon: string;
}

export const servers: Record<string, Server> = {
	proxmox: {
		ip: "192.168.178.64",
		domain: `proxmox.${domain}`,
		ports: [{ port: 8006, description: "web interface" }],
		title: "Proxmox",
		icon: "si:proxmox",
	},
	ad: {
		ip: "192.168.178.39",
		domain: `ad.${domain}`,
		ports: [
			{ port: 3000, description: "setup" },
			{ port: 80, description: "admin" },
			{ port: 53, description: "dns" },
		],
		title: "AdGuard Home",
		icon: "si:adguard",
	},
	npm: {
		ip: "192.168.178.38",
		domain: `npm.${domain}`,
		ports: [{ port: 81, description: "admin" }],
		title: "Nginx Proxy Manager",
		icon: "si:nginx",
	},
	ha: {
		ip: "192.168.178.37",
		domain: `ha.${domain}`,
		ports: [{ port: 8123, description: "web interface" }],
		title: "Home Assistant",
		icon: "si:homeassistant",
	},
	glance: {
		ip: "192.168.178.40",
		domain: `glance.${domain}`,
		ports: [{ port: 8080, description: "web interface" }],
		title: "Glance",
		icon: "si:glance",
	},
	jellyfin: {
		ip: "192.168.178.41",
		domain: `jellyfin.${domain}`,
		ports: [{ port: 8096, description: "web interface" }],
		title: "Jellyfin",
		icon: "si:jellyfin",
	},
	tailscale: {
		ip: "192.168.178.42",
		domain: `tailscale.${domain}`,
		ports: [],
		title: "Tailscale",
		icon: "si:tailscale",
	},
};
