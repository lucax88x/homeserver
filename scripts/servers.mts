/**
 * Server configuration for home network services
 */

export const domain = "trazzi.lol";

export interface Port {
	port: number;
	description: string;
	type: "http" | "dns" | "other";
}

export interface Server {
	ip: string;
	domains: string[];
	ports: Port[];
	title: string;
	icon: string;
}

export const servers: Record<string, Server> = {
	proxmox: {
		ip: "192.168.178.64",
		domains: [`proxmox.${domain}`],
		ports: [{ port: 8006, description: "web interface", type: "http" }],
		title: "Proxmox",
		icon: "si:proxmox",
	},
	ad: {
		ip: "192.168.178.39",
		domains: [`ad.${domain}`],
		ports: [
			{ port: 3000, description: "setup", type: "other" },
			{ port: 80, description: "admin", type: "http" },
			{ port: 53, description: "dns", type: "dns" },
		],
		title: "AdGuard Home",
		icon: "si:adguard",
	},
	npm: {
		ip: "192.168.178.38",
		domains: [`npm.${domain}`],
		ports: [{ port: 81, description: "admin", type: "http" }],
		title: "Nginx Proxy Manager",
		icon: "si:nginx",
	},
	ha: {
		ip: "192.168.178.37",
		domains: [`ha.${domain}`],
		ports: [{ port: 8123, description: "web interface", type: "http" }],
		title: "Home Assistant",
		icon: "si:homeassistant",
	},
	glance: {
		ip: "192.168.178.40",
		domains: [`glance.${domain}`, domain],
		ports: [{ port: 8080, description: "web interface", type: "http" }],
		title: "Glance",
		icon: "si:glance",
	},
	jellyfin: {
		ip: "192.168.178.41",
		domains: [`jellyfin.${domain}`],
		ports: [{ port: 8096, description: "web interface", type: "http" }],
		title: "Jellyfin",
		icon: "si:jellyfin",
	},
	tailscale: {
		ip: "192.168.178.42",
		domains: [`tailscale.${domain}`],
		ports: [],
		title: "Tailscale",
		icon: "si:tailscale",
	},
	aiostreams: {
		ip: "192.168.178.45",
		domains: [`aiostreams.${domain}`],
		ports: [{ port: 3000, description: "web interface", type: "http" }],
		title: "AIOStreams",
		icon: "si:stremio",
	},
	bazarr: {
		ip: "192.168.178.47",
		domains: [`bazarr.${domain}`],
		ports: [{ port: 6767, description: "web interface", type: "http" }],
		title: "Bazarr",
		icon: "si:bazarr",
	},
	radarr: {
		ip: "192.168.178.45",
		domains: [`radarr.${domain}`],
		ports: [{ port: 7878, description: "web interface", type: "http" }],
		title: "Radarr",
		icon: "si:radarr",
	},
	sonarr: {
		ip: "192.168.178.46",
		domains: [`sonarr.${domain}`],
		ports: [{ port: 8989, description: "web interface", type: "http" }],
		title: "Sonarr",
		icon: "si:sonarr",
	},
	jellyseerr: {
		ip: "192.168.178.43",
		domains: [`jellyseerr.${domain}`],
		ports: [{ port: 5055, description: "web interface", type: "http" }],
		title: "Jellyseerr",
		icon: "si:jellyfin",
	},
	prowlarr: {
		ip: "192.168.178.44",
		domains: [`prowlarr.${domain}`],
		ports: [{ port: 9696, description: "web interface", type: "http" }],
		title: "Prowlarr",
		icon: "si:prowlarr",
	},
	rdtclient: {
		ip: "192.168.178.48",
		domains: [`rdtclient.${domain}`],
		ports: [{ port: 6500, description: "web interface", type: "http" }],
		title: "RDTClient",
		icon: "si:realdebrid",
	},
};
