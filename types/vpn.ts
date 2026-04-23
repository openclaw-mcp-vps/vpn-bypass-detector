export type CensorshipMode =
  | "dns-poisoning"
  | "dpi-blocking"
  | "sni-filtering"
  | "ip-blacklist"
  | "protocol-throttling";

export interface TestNode {
  id: string;
  city: string;
  country: string;
  region: string;
  baselineRestriction: number;
  latencyMs: number;
  jitterMs: number;
}

export interface RestrictionScenario {
  country: string;
  mode: CensorshipMode;
  severity: number;
  blockedServices: string[];
  notes: string;
}

export interface ServiceProbe {
  service: string;
  url: string;
  reachable: boolean;
  statusCode: number | null;
  latencyMs: number | null;
  error?: string;
}

export interface NodeFinding {
  nodeId: string;
  nodeLabel: string;
  simulatedSuccess: number;
  riskScore: number;
  reasoning: string;
}

export interface ProviderTestResult {
  providerId: string;
  providerName: string;
  protocol: string;
  successProbability: number;
  confidence: number;
  estimatedLatencyMs: number;
  speedRetentionPercent: number;
  nodeFindings: NodeFinding[];
  summary: string;
}

export interface VPNTestRun {
  runId: string;
  createdAt: string;
  targetCountry: string;
  scenario: RestrictionScenario;
  probes: ServiceProbe[];
  overallSuccessRate: number;
  recommendation: string;
  providerResults: ProviderTestResult[];
}

export interface AccessGrant {
  email: string;
  grantedAt: string;
  lastPaymentId?: string;
}
