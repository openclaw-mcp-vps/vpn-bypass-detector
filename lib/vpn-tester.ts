import crypto from "node:crypto";

import axios from "axios";

import {
  CENSORSHIP_METHODS,
  CENSORSHIP_REGIONS,
  VPN_PROVIDERS,
  VPN_PROTOCOLS,
  getMethodById,
  getProviderById,
  getProtocolById,
  getRegionByCode
} from "@/lib/censorship-db";

export type VPNTestRequest = {
  regionCode: string;
  providerIds: string[];
  protocolIds: string[];
  ownerEmail: string;
};

export type MethodProbeResult = {
  methodId: string;
  methodName: string;
  target: string;
  success: boolean;
  latencyMs: number;
  details: string;
};

export type ProviderProtocolResult = {
  providerId: string;
  providerName: string;
  protocolId: string;
  protocolName: string;
  successRate: number;
  averageLatencyMs: number;
  resilienceScore: number;
  checks: MethodProbeResult[];
};

export type CensorshipSummary = {
  methodId: string;
  methodName: string;
  passRate: number;
  averageLatencyMs: number;
  failures: number;
};

export type VPNTestReport = {
  id: string;
  createdAt: string;
  regionCode: string;
  regionName: string;
  ownerEmail: string;
  providerResults: ProviderProtocolResult[];
  methodSummaries: CensorshipSummary[];
  recommendations: string[];
  executiveSummary: string;
};

function clamp(input: number, min: number, max: number) {
  return Math.max(min, Math.min(max, input));
}

async function runHttpsProbe(target: string): Promise<MethodProbeResult> {
  const startedAt = Date.now();

  try {
    const response = await axios.get(target, {
      timeout: 5000,
      validateStatus: () => true,
      maxRedirects: 3
    });

    return {
      methodId: "",
      methodName: "",
      target,
      success: response.status >= 200 && response.status < 400,
      latencyMs: Date.now() - startedAt,
      details: `HTTP ${response.status}`
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Connection failed";
    return {
      methodId: "",
      methodName: "",
      target,
      success: false,
      latencyMs: Date.now() - startedAt,
      details: message
    };
  }
}

async function runDnsProbe(hostname: string): Promise<MethodProbeResult> {
  const startedAt = Date.now();

  try {
    const response = await axios.get("https://cloudflare-dns.com/dns-query", {
      params: {
        name: hostname,
        type: "A"
      },
      headers: {
        accept: "application/dns-json"
      },
      timeout: 4500,
      validateStatus: () => true
    });

    const hasAnswer = Array.isArray(response.data?.Answer) && response.data.Answer.length > 0;

    return {
      methodId: "",
      methodName: "",
      target: hostname,
      success: hasAnswer,
      latencyMs: Date.now() - startedAt,
      details: hasAnswer ? "DNS answer returned" : "No DNS answer"
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "DNS probe failed";
    return {
      methodId: "",
      methodName: "",
      target: hostname,
      success: false,
      latencyMs: Date.now() - startedAt,
      details: message
    };
  }
}

async function runBrowserProbe(target: string): Promise<MethodProbeResult> {
  if (process.env.ENABLE_BROWSER_PROBE !== "1") {
    const fallback = await runHttpsProbe(target);
    return {
      ...fallback,
      details: `${fallback.details}; browser probe skipped (set ENABLE_BROWSER_PROBE=1 to enable)`
    };
  }

  const startedAt = Date.now();

  try {
    const puppeteer = await import("puppeteer");
    const browser = await puppeteer.default.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(7000);
    const response = await page.goto(target, { waitUntil: "domcontentloaded" });
    await browser.close();

    return {
      methodId: "",
      methodName: "",
      target,
      success: Boolean(response && response.status() < 400),
      latencyMs: Date.now() - startedAt,
      details: response ? `Browser HTTP ${response.status()}` : "No browser response"
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Browser probe failed";
    return {
      methodId: "",
      methodName: "",
      target,
      success: false,
      latencyMs: Date.now() - startedAt,
      details: message
    };
  }
}

async function runSingleCheck(methodId: string, target: string) {
  const method = getMethodById(methodId);

  if (!method) {
    return null;
  }

  const probeResult =
    method.probeType === "dns"
      ? await runDnsProbe(target)
      : method.probeType === "browser"
        ? await runBrowserProbe(target)
        : await runHttpsProbe(target);

  return {
    ...probeResult,
    methodId: method.id,
    methodName: method.name
  } satisfies MethodProbeResult;
}

function scoreCombination(params: {
  rawPassRate: number;
  avgLatencyMs: number;
  providerReliability: number;
  protocolObfuscation: number;
  pressureIndex: number;
}) {
  const latencyFactor = clamp(1 - params.avgLatencyMs / 2000, 0.45, 1);

  const composite =
    params.rawPassRate * 0.5 +
    params.providerReliability * 0.2 +
    params.protocolObfuscation * 0.25 +
    latencyFactor * 0.05;

  const pressurePenalty = params.pressureIndex * 10;

  return clamp(Math.round(composite * 100 - pressurePenalty), 1, 99);
}

function buildRecommendations(report: VPNTestReport) {
  const best = [...report.providerResults].sort((a, b) => b.resilienceScore - a.resilienceScore).slice(0, 3);

  const methodWeakness = [...report.methodSummaries].sort((a, b) => a.passRate - b.passRate).slice(0, 2);

  const recommendations = [
    `${best[0]?.providerName ?? "Top provider"} with ${best[0]?.protocolName ?? "stealth transport"} currently gives the highest resilience score (${best[0]?.resilienceScore ?? "N/A"}/100).`,
    `Most difficult controls in this region are ${methodWeakness.map((method) => method.methodName).join(" and ")}; prioritize providers with active bridge rotation.`,
    "Run a fresh test before high-risk activity windows because censorship enforcement patterns can change within hours."
  ];

  return recommendations;
}

export async function runVPNTestSuite(input: VPNTestRequest): Promise<VPNTestReport> {
  const region = getRegionByCode(input.regionCode);

  if (!region) {
    throw new Error("Unsupported region code");
  }

  const providers = VPN_PROVIDERS.filter((provider) => input.providerIds.includes(provider.id));
  const protocols = VPN_PROTOCOLS.filter((protocol) => input.protocolIds.includes(protocol.id));

  if (providers.length === 0 || protocols.length === 0) {
    throw new Error("At least one provider and one protocol must be selected");
  }

  const providerResults: ProviderProtocolResult[] = [];

  for (const provider of providers) {
    for (const protocol of protocols) {
      if (!provider.protocols.includes(protocol.id)) {
        continue;
      }

      const checkPromises: Promise<MethodProbeResult | null>[] = [];

      for (const methodId of region.commonTechniques) {
        const method = getMethodById(methodId);

        if (!method) {
          continue;
        }

        for (const target of method.targets) {
          checkPromises.push(runSingleCheck(method.id, target));
        }
      }

      const checks = (await Promise.all(checkPromises)).filter((check): check is MethodProbeResult => check !== null);

      if (checks.length === 0) {
        continue;
      }

      const successfulChecks = checks.filter((check) => check.success).length;
      const rawPassRate = successfulChecks / checks.length;
      const averageLatencyMs = Math.round(checks.reduce((acc, check) => acc + check.latencyMs, 0) / checks.length);
      const resilienceScore = scoreCombination({
        rawPassRate,
        avgLatencyMs: averageLatencyMs,
        providerReliability: provider.reliabilityScore,
        protocolObfuscation: protocol.obfuscationStrength,
        pressureIndex: region.pressureIndex
      });

      providerResults.push({
        providerId: provider.id,
        providerName: provider.name,
        protocolId: protocol.id,
        protocolName: protocol.name,
        successRate: Math.round(rawPassRate * 100),
        averageLatencyMs,
        resilienceScore,
        checks
      });
    }
  }

  if (providerResults.length === 0) {
    throw new Error("No compatible provider/protocol combinations found");
  }

  const methodSummaries: CensorshipSummary[] = region.commonTechniques
    .map((methodId) => {
      const method = getMethodById(methodId);

      if (!method) {
        return null;
      }

      const methodChecks = providerResults.flatMap((result) => result.checks.filter((check) => check.methodId === method.id));

      if (methodChecks.length === 0) {
        return null;
      }

      const passRate = Math.round(
        (methodChecks.filter((check) => check.success).length / Math.max(methodChecks.length, 1)) * 100
      );
      const averageLatencyMs = Math.round(
        methodChecks.reduce((acc, check) => acc + check.latencyMs, 0) / Math.max(methodChecks.length, 1)
      );

      return {
        methodId: method.id,
        methodName: method.name,
        passRate,
        averageLatencyMs,
        failures: methodChecks.filter((check) => !check.success).length
      } satisfies CensorshipSummary;
    })
    .filter((summary): summary is CensorshipSummary => summary !== null);

  const topResult = [...providerResults].sort((a, b) => b.resilienceScore - a.resilienceScore)[0];

  const report: VPNTestReport = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    regionCode: region.code,
    regionName: region.label,
    ownerEmail: input.ownerEmail.toLowerCase(),
    providerResults: providerResults.sort((a, b) => b.resilienceScore - a.resilienceScore),
    methodSummaries,
    recommendations: [],
    executiveSummary: `${topResult.providerName} + ${topResult.protocolName} ranked highest with ${topResult.resilienceScore}/100 resilience in ${region.label}.`
  };

  report.recommendations = buildRecommendations(report);

  return report;
}

export function listRegions() {
  return CENSORSHIP_REGIONS;
}

export function listProviders() {
  return VPN_PROVIDERS;
}

export function listProtocols() {
  return VPN_PROTOCOLS;
}

export function listMethods() {
  return CENSORSHIP_METHODS;
}
