import axios from "axios";

import { type CensorshipMode, type RestrictionScenario, type ServiceProbe, type TestNode } from "@/types/vpn";

const COUNTRY_BASELINES: Record<string, number> = {
  CN: 91,
  IR: 89,
  RU: 78,
  AE: 63,
  TR: 66,
  EG: 61,
  KZ: 64,
  SY: 87,
  TM: 90,
};

const MODE_SERVICE_MAP: Record<CensorshipMode, string[]> = {
  "dns-poisoning": ["Google Search", "Cloudflare DNS", "Wikipedia"],
  "dpi-blocking": ["Telegram Web", "Signal CDN", "YouTube"],
  "sni-filtering": ["Wikipedia", "BBC", "GitHub"],
  "ip-blacklist": ["Signal CDN", "Telegram Web", "Wikipedia"],
  "protocol-throttling": ["YouTube", "WhatsApp Web", "Speedtest"],
};

const PROBE_TARGETS: Array<{ service: string; url: string }> = [
  { service: "Google Search", url: "https://www.google.com/generate_204" },
  { service: "Cloudflare DNS", url: "https://1.1.1.1/help" },
  { service: "Wikipedia", url: "https://www.wikipedia.org" },
  { service: "Telegram Web", url: "https://web.telegram.org" },
  { service: "Signal CDN", url: "https://updates.signal.org" },
  { service: "YouTube", url: "https://www.youtube.com" },
  { service: "BBC", url: "https://www.bbc.com" },
  { service: "GitHub", url: "https://github.com" },
  { service: "WhatsApp Web", url: "https://web.whatsapp.com" },
  { service: "Speedtest", url: "https://www.speedtest.net" },
];

export const GLOBAL_TEST_NODES: TestNode[] = [
  {
    id: "tehran-home-isp",
    city: "Tehran",
    country: "IR",
    region: "Middle East",
    baselineRestriction: 90,
    latencyMs: 210,
    jitterMs: 58,
  },
  {
    id: "beijing-mobile-core",
    city: "Beijing",
    country: "CN",
    region: "East Asia",
    baselineRestriction: 94,
    latencyMs: 228,
    jitterMs: 63,
  },
  {
    id: "moscow-fiber-lastmile",
    city: "Moscow",
    country: "RU",
    region: "Eastern Europe",
    baselineRestriction: 78,
    latencyMs: 185,
    jitterMs: 47,
  },
  {
    id: "istanbul-consumer-broadband",
    city: "Istanbul",
    country: "TR",
    region: "Europe/Asia",
    baselineRestriction: 67,
    latencyMs: 160,
    jitterMs: 39,
  },
  {
    id: "dubai-commercial-isp",
    city: "Dubai",
    country: "AE",
    region: "Middle East",
    baselineRestriction: 64,
    latencyMs: 151,
    jitterMs: 32,
  },
  {
    id: "frankfurt-control",
    city: "Frankfurt",
    country: "DE",
    region: "Western Europe",
    baselineRestriction: 15,
    latencyMs: 96,
    jitterMs: 14,
  },
  {
    id: "singapore-control",
    city: "Singapore",
    country: "SG",
    region: "Southeast Asia",
    baselineRestriction: 18,
    latencyMs: 102,
    jitterMs: 16,
  },
];

export function buildRestrictionScenario(countryInput: string, mode: CensorshipMode): RestrictionScenario {
  const country = countryInput.trim().toUpperCase();
  const countryBaseline = COUNTRY_BASELINES[country] ?? 60;

  const modePenalty: Record<CensorshipMode, number> = {
    "dns-poisoning": 6,
    "dpi-blocking": 12,
    "sni-filtering": 9,
    "ip-blacklist": 7,
    "protocol-throttling": 11,
  };

  const severity = clamp(countryBaseline + modePenalty[mode], 35, 99);

  return {
    country,
    mode,
    severity,
    blockedServices: MODE_SERVICE_MAP[mode],
    notes:
      "Results combine simulated in-country restrictions with live external service probes. Use them as a directional bypass ranking, not legal advice.",
  };
}

export async function runCensorshipProbes(mode: CensorshipMode): Promise<ServiceProbe[]> {
  const targets = PROBE_TARGETS.filter((target) => MODE_SERVICE_MAP[mode].includes(target.service));

  const probeResults = await Promise.all(
    targets.map(async (target) => {
      const startedAt = Date.now();
      try {
        const response = await axios.get(target.url, {
          timeout: 3200,
          maxRedirects: 2,
          validateStatus: () => true,
          headers: {
            "User-Agent": "vpn-bypass-detector/1.0",
          },
        });

        return {
          service: target.service,
          url: target.url,
          reachable: response.status < 500,
          statusCode: response.status,
          latencyMs: Date.now() - startedAt,
        } satisfies ServiceProbe;
      } catch (error) {
        const reason = error instanceof Error ? error.message : "Unknown network error";
        return {
          service: target.service,
          url: target.url,
          reachable: false,
          statusCode: null,
          latencyMs: Date.now() - startedAt,
          error: reason,
        } satisfies ServiceProbe;
      }
    }),
  );

  return probeResults;
}

export function restrictionPressureForNode(node: TestNode, scenario: RestrictionScenario): number {
  const locationPenalty = node.country === scenario.country ? 14 : 0;
  const baselineBlend = (node.baselineRestriction * 0.55) + (scenario.severity * 0.45);
  return clamp(Math.round(baselineBlend + locationPenalty), 10, 99);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
