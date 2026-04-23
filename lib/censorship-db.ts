export type CensorshipMethod = {
  id: string;
  name: string;
  description: string;
  probeType: "https" | "dns" | "browser";
  targets: string[];
  weight: number;
};

export type VPNProtocol = {
  id: string;
  name: string;
  defaultPort: number;
  obfuscationStrength: number;
  notes: string;
};

export type VPNProvider = {
  id: string;
  name: string;
  headquarters: string;
  reliabilityScore: number;
  audited: boolean;
  protocols: string[];
  highlights: string[];
};

export type CensorshipRegion = {
  code: string;
  label: string;
  pressureIndex: number;
  commonTechniques: string[];
  recommendedProtocols: string[];
  notes: string;
};

export const CENSORSHIP_METHODS: CensorshipMethod[] = [
  {
    id: "dns_poisoning",
    name: "DNS Poisoning",
    description: "Detects resolver tampering against privacy and news domains.",
    probeType: "dns",
    targets: ["signal.org", "wikipedia.org"],
    weight: 0.2
  },
  {
    id: "sni_filtering",
    name: "SNI Filtering",
    description: "Checks if standard TLS handshakes are interrupted when SNI reveals target domains.",
    probeType: "https",
    targets: ["https://www.bbc.com", "https://www.wikipedia.org"],
    weight: 0.2
  },
  {
    id: "ip_blocking",
    name: "IP Blocking",
    description: "Measures access to globally anycasted infrastructure that is frequently blocked.",
    probeType: "https",
    targets: ["https://1.1.1.1/cdn-cgi/trace", "https://api.ipify.org?format=json"],
    weight: 0.15
  },
  {
    id: "dpi_reset",
    name: "DPI Reset Injection",
    description: "Looks for injected resets when traffic matches common VPN signatures.",
    probeType: "browser",
    targets: ["https://www.cloudflare.com", "https://httpbin.org/get?topic=vpn"],
    weight: 0.25
  },
  {
    id: "keyword_filtering",
    name: "Keyword Filtering",
    description: "Tests whether politically sensitive query terms trigger selective blocking.",
    probeType: "https",
    targets: ["https://httpbin.org/get?q=encrypted%20messaging", "https://httpbin.org/get?q=digital%20rights"],
    weight: 0.2
  }
];

export const VPN_PROTOCOLS: VPNProtocol[] = [
  {
    id: "wireguard",
    name: "WireGuard",
    defaultPort: 51820,
    obfuscationStrength: 0.63,
    notes: "Fast and modern; best when wrapped with stealth transport."
  },
  {
    id: "openvpn_tcp",
    name: "OpenVPN TCP 443",
    defaultPort: 443,
    obfuscationStrength: 0.76,
    notes: "Reliable under aggressive filtering because it mimics normal HTTPS flows."
  },
  {
    id: "ikev2",
    name: "IKEv2/IPSec",
    defaultPort: 500,
    obfuscationStrength: 0.44,
    notes: "Stable on mobile but often fingerprinted by national firewalls."
  },
  {
    id: "shadowsocks",
    name: "Shadowsocks",
    defaultPort: 8388,
    obfuscationStrength: 0.85,
    notes: "Strong evasion profile against keyword and DPI based disruption."
  },
  {
    id: "obfs4",
    name: "Obfs4 Bridge",
    defaultPort: 9001,
    obfuscationStrength: 0.93,
    notes: "Best resilience where TLS fingerprinting and protocol blocking are intense."
  }
];

export const VPN_PROVIDERS: VPNProvider[] = [
  {
    id: "protonvpn",
    name: "Proton VPN",
    headquarters: "Switzerland",
    reliabilityScore: 0.89,
    audited: true,
    protocols: ["wireguard", "openvpn_tcp", "ikev2"],
    highlights: ["Stealth mode", "No-logs audit", "Strong bridge infrastructure"]
  },
  {
    id: "mullvad",
    name: "Mullvad",
    headquarters: "Sweden",
    reliabilityScore: 0.86,
    audited: true,
    protocols: ["wireguard", "openvpn_tcp"],
    highlights: ["Anonymous account model", "Consistent obfuscation updates"]
  },
  {
    id: "ivpn",
    name: "IVPN",
    headquarters: "Gibraltar",
    reliabilityScore: 0.83,
    audited: true,
    protocols: ["wireguard", "openvpn_tcp", "obfs4"],
    highlights: ["Multi-hop routes", "Anti-censorship relays"]
  },
  {
    id: "outline",
    name: "Outline",
    headquarters: "Open-source",
    reliabilityScore: 0.78,
    audited: true,
    protocols: ["shadowsocks"],
    highlights: ["Self-hosted control", "High adaptability in blocked regions"]
  }
];

export const CENSORSHIP_REGIONS: CensorshipRegion[] = [
  {
    code: "CN",
    label: "Mainland China",
    pressureIndex: 0.95,
    commonTechniques: ["dns_poisoning", "sni_filtering", "dpi_reset", "keyword_filtering"],
    recommendedProtocols: ["obfs4", "shadowsocks", "openvpn_tcp"],
    notes: "Rapidly changing filtering patterns with frequent protocol fingerprint updates."
  },
  {
    code: "IR",
    label: "Iran",
    pressureIndex: 0.92,
    commonTechniques: ["dns_poisoning", "ip_blocking", "dpi_reset", "keyword_filtering"],
    recommendedProtocols: ["obfs4", "openvpn_tcp", "shadowsocks"],
    notes: "Regular nation-wide throttling windows and selective protocol outages."
  },
  {
    code: "RU",
    label: "Russia",
    pressureIndex: 0.81,
    commonTechniques: ["dns_poisoning", "ip_blocking", "sni_filtering"],
    recommendedProtocols: ["openvpn_tcp", "wireguard", "obfs4"],
    notes: "Registry-level blocking plus coordinated VPN provider bans."
  },
  {
    code: "AE",
    label: "UAE",
    pressureIndex: 0.69,
    commonTechniques: ["sni_filtering", "dpi_reset"],
    recommendedProtocols: ["openvpn_tcp", "wireguard"],
    notes: "VoIP restrictions and selective disruption during political events."
  },
  {
    code: "TR",
    label: "Turkey",
    pressureIndex: 0.63,
    commonTechniques: ["dns_poisoning", "sni_filtering", "keyword_filtering"],
    recommendedProtocols: ["openvpn_tcp", "wireguard", "shadowsocks"],
    notes: "Burst-style censorship spikes around elections and social unrest."
  }
];

export function getRegionByCode(code: string) {
  return CENSORSHIP_REGIONS.find((region) => region.code === code);
}

export function getMethodById(id: string) {
  return CENSORSHIP_METHODS.find((method) => method.id === id);
}

export function getProtocolById(id: string) {
  return VPN_PROTOCOLS.find((protocol) => protocol.id === id);
}

export function getProviderById(id: string) {
  return VPN_PROVIDERS.find((provider) => provider.id === id);
}
