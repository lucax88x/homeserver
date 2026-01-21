/**
 * Glance dashboard configuration template
 * Used by generate-glance.mts to create glance.yml
 */

import type { Server } from "../../scripts/servers.mts";

export interface GlanceSite {
	title: string;
	url: string;
	icon: string;
}

export interface GlanceLink {
	title: string;
	url: string;
	icon: string;
}

export interface GlanceConfig {
	server: {
		port: number;
		proxied: boolean;
	};
	theme: {
		"background-color": string;
		"primary-color": string;
		"positive-color": string;
		"negative-color": string;
	};
	pages: Array<{
		name: string;
		columns: Array<{
			size: string;
			widgets: Array<Record<string, unknown>>;
		}>;
	}>;
}

export function createGlanceConfig(
	servers: Record<string, Server>,
	adguardServer: Server,
): GlanceConfig {
	const monitorableServers = Object.values(servers).filter(
		(server) => server.ports.length > 0,
	);

	const monitorSites: GlanceSite[] = monitorableServers.map((server) => ({
		title: server.title,
		url: `https://${server.domains[0]}`,
		icon: server.icon,
	}));

	const bookmarkLinks: GlanceLink[] = monitorableServers.map((server) => ({
		title: server.title,
		url: `https://${server.domains[0]}`,
		icon: server.icon,
	}));

	return {
		server: {
			port: 8080,
			proxied: true,
		},
		theme: {
			"background-color": "25 14 14",
			"primary-color": "217 92 83",
			"positive-color": "115 54 76",
			"negative-color": "0 70 70",
		},
		pages: [
			{
				name: "Home",
				columns: [
					{
						size: "small",
						widgets: [
							{
								type: "clock",
								"hour-format": "24h",
								timezones: [
									{
										timezone: "Europe/Rome",
										label: "Home",
									},
								],
							},
							{
								type: "weather",
								location: "Rome, Italy",
								"hour-format": "24h",
							},
						],
					},
					{
						size: "full",
						widgets: [
							{
								type: "monitor",
								cache: "1m",
								title: "Services",
								sites: monitorSites,
							},
							{
								type: "bookmarks",
								groups: [
									{
										title: "Services",
										links: bookmarkLinks,
									},
								],
							},
						],
					},
					{
						size: "small",
						widgets: [
							{
								type: "dns-stats",
								service: "adguard",
								url: `http://${adguardServer.ip}:3000`,
							},
						],
					},
				],
			},
		],
	};
}
