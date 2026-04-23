import { createHash } from "node:crypto";

import {
  GLOBAL_TEST_NODES,
  buildRestrictionScenario,
  clamp,
  restrictionPressureForNode,
  runCensorshipProbes,
} from "@/lib/censorship-detector";
import { type CensorshipMode, type NodeFinding, type ProviderTestResult, type VPNTestRun } from "@/types/vpn";

interface ProtocolModel {
  id: string;
  label: string;
  obfuscation: number;
  censorshipResistance: number;
  speedRetention: number;
  dnsStealth: number;
  dpiEvasion: number;
  sniCamouflage: number;
  throttlingTolerance: number;
}

interface ProviderModel {
  id: string;
  name: string;
  reliability: number;
  stealthInfrastructure: number;
  networkDepth: number;
  protocolTuning: Array<{ protocolId: string; tuningBonus: number }>;
}

const PROTOCOLS: Record<string, ProtocolModel> = {
  wireguard: {
    id: "wireguard",
    label: "WireGuard",
    obfuscation: 48,
    censorshipResistance: 68,
    speedRetention: 92,
    dnsStealth: 62,
    dpiEvasion: 58,
    sniCamouflage: 44,
    throttlingTolerance: 69,
  },
  "openvpn-tcp": {
    id: "openvpn-tcp",
    label: "OpenVPN TCP",
    obfuscation: 74,
    censorshipResistance: 81,
    speedRetention: 66,
    dnsStealth: 71,
    dpiEvasion: 76,
    sniCamouflage: 69,
    throttlingTolerance: 72,
  },
  "openvpn-obfs": {
    id: "openvpn-obfs",
    label: "OpenVPN + Obfs",
    obfuscation: 92,
    censorshipResistance: 93,
    speedRetention: 54,
    dnsStealth: 83,
    dpiEvasion: 94,
    sniCamouflage: 88,
    throttlingTolerance: 86,
  },
  shadowsocks: {
    id: "shadowsocks",
    label: "Shadowsocks",
    obfuscation: 86,
    censorshipResistance: 84,
    speedRetention: 78,
    dnsStealth: 79,
    dpiEvasion: 81,
    sniCamouflage: 84,
    throttlingTolerance: 73,
  },
  stealth: {
    id: "stealth",
    label: "Stealth VPN",
    obfuscation: 95,
    censorshipResistance: 91,
    speedRetention: 62,
    dnsStealth: 87,
    dpiEvasion: 92,
    sniCamouflage: 90,
    throttlingTolerance: 81,
  },
  ikev2: {
    id: "ikev2",
    label: "IKEv2",
    obfuscation: 41,
    censorshipResistance: 52,
    speedRetention: 83,
    dnsStealth: 57,
    dpiEvasion: 49,
    sniCamouflage: 38,
    throttlingTolerance: 59,
  },
};

const PROVIDERS: ProviderModel[] = [
  {
    id: "mullvad",
    name: "Mullvad",
    reliability: 88,
    stealthInfrastructure: 78,
    networkDepth: 72,
    protocolTuning: [
      { protocolId: "wireguard", tuningBonus: 6 },
      { protocolId: "openvpn-obfs", tuningBonus: 8 },
    ],
  },
  {
    id: "proton-vpn",
    name: "Proton VPN",
    reliability: 87,
    stealthInfrastructure: 82,
    networkDepth: 78,
    protocolTuning: [
      { protocolId: "stealth", tuningBonus: 9 },
      { protocolId: "wireguard", tuningBonus: 4 },
      { protocolId: "openvpn-tcp", tuningBonus: 5 },
    ],
  },
  {
    id: "nordvpn",
    name: "NordVPN",
    reliability: 84,
    stealthInfrastructure: 79,
    networkDepth: 90,
    protocolTuning: [
      { protocolId: "openvpn-obfs", tuningBonus: 7 },
      { protocolId: "wireguard", tuningBonus: 5 },
      { protocolId: "ikev2", tuningBonus: 3 },
    ],
  },
  {
    id: "surfshark",
    name: "Surfshark",
    reliability: 80,
    stealthInfrastructure: 74,
    networkDepth: 84,
    protocolTuning: [
      { protocolId: "openvpn-obfs", tuningBonus: 6 },
      { protocolId: "wireguard", tuningBonus: 4 },
      { protocolId: "shadowsocks", tuningBonus: 6 },
    ],
  },
  {
    id: "ivpn",
    name: "IVPN",
    reliability: 83,
    stealthInfrastructure: 73,
    networkDepth: 66,
    protocolTuning: [
      { protocolId: "wireguard", tuningBonus: 4 },
      { protocolId: "openvpn-tcp", tuningBonus: 5 },
    ],
  },
  {
    id: "psiphon",
    name: "Psiphon",
    reliability: 79,
    stealthInfrastructure: 89,
    networkDepth: 63,
    protocolTuning: [
      { protocolId: "shadowsocks", tuningBonus: 8 },
      { protocolId: "stealth", tuningBonus: 8 },
    ],
  },
];

function modeFit(mode: CensorshipMode, protocol: ProtocolModel): number {
  switch (mode) {
    case "dns-poisoning":
      return (protocol.dnsStealth * 0.65) + (protocol.obfuscation * 0.35);
    case "dpi-blocking":
      return (protocol.dpiEvasion * 0.7) + (protocol.obfuscation * 0.3);
    case "sni-filtering":
      return (protocol.sniCamouflage * 0.75) + (protocol.obfuscation * 0.25);
    case "ip-blacklist":
      return (protocol.censorshipResistance * 0.55) + (protocol.obfuscation * 0.45);
    case "protocol-throttling":
      return (protocol.throttlingTolerance * 0.6) + (protocol.speedRetention * 0.4);
    default:
      return 50;
  }
}

function deterministicNoise(seed: string): number {
  const hash = createHash("sha256").update(seed).digest("hex").slice(0, 8);
  const numeric = Number.parseInt(hash, 16) / 0xffffffff;
  return (numeric * 2) - 1;
}

function average(values: number[]): number {
  if (!values.length) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function standardDeviation(values: number[]): number {
  if (values.length < 2) {
    return 0;
  }
  const mean = average(values);
  const variance = average(values.map((value) => (value - mean) ** 2));
  return Math.sqrt(variance);
}

function summarizeFinding(nodeLabel: string, pressure: number, modeScore: number): string {
  if (pressure > 85 && modeScore > 80) {
    return `${nodeLabel}: obfuscation remains resilient under high-state filtering.`;
  }
  if (pressure > 85) {
    return `${nodeLabel}: high risk of active probing and rapid endpoint burn.`;
  }
  if (modeScore > 80) {
    return `${nodeLabel}: protocol-specific camouflage keeps sessions stable.`;
  }
  return `${nodeLabel}: moderate bypass success with occasional handshake resets.`;
}

export async function runVpnBypassSuite(targetCountry: string, mode: CensorshipMode): Promise<VPNTestRun> {
  const scenario = buildRestrictionScenario(targetCountry, mode);
  const probes = await runCensorshipProbes(mode);

  const reachableCount = probes.filter((probe) => probe.reachable).length;
  const reachabilityRatio = probes.length ? reachableCount / probes.length : 0.5;
  const externalPressure = clamp((1 - reachabilityRatio) * 28, 0, 28);

  const providerResults: ProviderTestResult[] = [];

  for (const provider of PROVIDERS) {
    for (const tunedProtocol of provider.protocolTuning) {
      const protocol = PROTOCOLS[tunedProtocol.protocolId];
      if (!protocol) {
        continue;
      }

      const modeScore = modeFit(mode, protocol);
      const nodeFindings: NodeFinding[] = GLOBAL_TEST_NODES.map((node) => {
        const nodePressure = restrictionPressureForNode(node, scenario);
        const jitter = deterministicNoise(
          `${provider.id}:${protocol.id}:${node.id}:${scenario.country}:${scenario.mode}`,
        ) * 9;

        const baseScore =
          (provider.reliability * 0.38)
          + (provider.stealthInfrastructure * 0.22)
          + (provider.networkDepth * 0.12)
          + (protocol.censorshipResistance * 0.18)
          + (protocol.obfuscation * 0.1)
          + tunedProtocol.tuningBonus;

        const simulatedSuccess = clamp(
          Math.round(baseScore + (modeScore * 0.24) - (nodePressure * 0.63) - externalPressure + jitter),
          5,
          99,
        );

        const riskScore = clamp(Math.round(100 - simulatedSuccess + (nodePressure * 0.12)), 1, 99);

        return {
          nodeId: node.id,
          nodeLabel: `${node.city}, ${node.country}`,
          simulatedSuccess,
          riskScore,
          reasoning: summarizeFinding(`${node.city}, ${node.country}`, nodePressure, modeScore),
        };
      });

      const nodeScores = nodeFindings.map((finding) => finding.simulatedSuccess);
      const successProbability = Math.round(average(nodeScores));
      const variability = standardDeviation(nodeScores);
      const confidence = clamp(
        Math.round(58 + (provider.networkDepth * 0.2) + (probes.length * 4.5) - (variability * 1.1)),
        35,
        97,
      );

      const estimatedLatencyMs = Math.round(
        average(GLOBAL_TEST_NODES.map((node) => node.latencyMs))
          + ((100 - protocol.speedRetention) * 2.1)
          + ((scenario.severity - 50) * 0.9),
      );

      const speedRetentionPercent = clamp(
        Math.round(protocol.speedRetention - (scenario.severity * 0.22) - externalPressure + (provider.networkDepth * 0.1)),
        15,
        95,
      );

      providerResults.push({
        providerId: provider.id,
        providerName: provider.name,
        protocol: protocol.label,
        successProbability,
        confidence,
        estimatedLatencyMs,
        speedRetentionPercent,
        nodeFindings,
        summary:
          `${provider.name} over ${protocol.label} is projected at ${successProbability}% bypass success in ${scenario.country} `
          + `for ${scenario.mode.replace("-", " ")}.`,
      });
    }
  }

  providerResults.sort((a, b) => b.successProbability - a.successProbability);

  const topThree = providerResults.slice(0, 3);
  const overallSuccessRate = Math.round(average(topThree.map((result) => result.successProbability)));

  const primary = providerResults[0];
  const secondary = providerResults[1];
  const recommendation = primary
    ? `${primary.providerName} (${primary.protocol}) leads for ${scenario.country} with ${primary.successProbability}% projected success. `
      + (secondary
        ? `Keep ${secondary.providerName} (${secondary.protocol}) as fallback in case endpoints are burned.`
        : "Rotate endpoints every 48 hours to reduce detection risk.")
    : "No provider profile matched the requested scenario.";

  return {
    runId: `run_${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
    targetCountry: scenario.country,
    scenario,
    probes,
    overallSuccessRate,
    recommendation,
    providerResults,
  };
}
