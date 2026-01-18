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
	aiostreams: {
		ip: "192.168.178.43",
		domain: `aiostreams.${domain}`,
		ports: [{ port: 3000, description: "web interface" }],
		title: "AIOStreams",
		icon: "si:stremio",
	},
	bazarr: {
		ip: "192.168.178.44",
		domain: `bazarr.${domain}`,
		ports: [{ port: 6767, description: "web interface" }],
		title: "Bazarr",
		icon: "si:bazarr",
	},
	radarr: {
		ip: "192.168.178.45",
		domain: `radarr.${domain}`,
		ports: [{ port: 7878, description: "web interface" }],
		title: "Radarr",
		icon: "si:radarr",
	},
	sonarr: {
		ip: "192.168.178.46",
		domain: `sonarr.${domain}`,
		ports: [{ port: 8989, description: "web interface" }],
		title: "Sonarr",
		icon: "si:sonarr",
	},
	jellyseerr: {
		ip: "192.168.178.47",
		domain: `jellyseerr.${domain}`,
		ports: [{ port: 5055, description: "web interface" }],
		title: "Jellyseerr",
		icon: "si:jellyfin",
	},
	prowlarr: {
		ip: "192.168.178.48",
		domain: `prowlarr.${domain}`,
		ports: [{ port: 9696, description: "web interface" }],
		title: "Prowlarr",
		icon: "si:prowlarr",
	},
	rdtclient: {
		ip: "192.168.178.49",
		domain: `rdtclient.${domain}`,
		ports: [{ port: 6500, description: "web interface" }],
		title: "RDTClient",
		icon: "si:realdebrid",
	},
};
