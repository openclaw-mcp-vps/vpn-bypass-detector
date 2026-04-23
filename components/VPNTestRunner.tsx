"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { AlertTriangle, Loader2, Play, Radar } from "lucide-react";

import { EffectivenessChart } from "@/components/EffectivenessChart";
import { ProviderComparison } from "@/components/ProviderComparison";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type CensorshipMode, type VPNTestRun } from "@/types/vpn";

const COUNTRY_OPTIONS = [
  { code: "IR", label: "Iran" },
  { code: "CN", label: "China" },
  { code: "RU", label: "Russia" },
  { code: "TR", label: "Turkey" },
  { code: "AE", label: "United Arab Emirates" },
  { code: "EG", label: "Egypt" },
  { code: "KZ", label: "Kazakhstan" },
];

const MODE_OPTIONS: Array<{ value: CensorshipMode; label: string; description: string }> = [
  {
    value: "dpi-blocking",
    label: "DPI blocking",
    description: "Detects protocols that survive active packet inspection and reset attacks.",
  },
  {
    value: "dns-poisoning",
    label: "DNS poisoning",
    description: "Tests resilience to manipulated DNS results and resolver interception.",
  },
  {
    value: "sni-filtering",
    label: "SNI filtering",
    description: "Evaluates handshake camouflage against TLS hostname filtering.",
  },
  {
    value: "ip-blacklist",
    label: "IP blacklist",
    description: "Ranks providers by endpoint rotation depth and blacklist survivability.",
  },
  {
    value: "protocol-throttling",
    label: "Protocol throttling",
    description: "Measures speed retention when traffic shaping targets VPN signatures.",
  },
];

export function VPNTestRunner() {
  const [country, setCountry] = useState<string>("IR");
  const [mode, setMode] = useState<CensorshipMode>("dpi-blocking");
  const [run, setRun] = useState<VPNTestRun | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedMode = useMemo(
    () => MODE_OPTIONS.find((item) => item.value === mode),
    [mode],
  );

  async function startTest() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/vpn-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ country, mode }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error || "Unable to run test");
      }

      const payload = (await response.json()) as VPNTestRun;
      setRun(payload);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-8">
      <header>
        <p className="inline-flex items-center gap-2 rounded-full border border-cyan-400/35 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-wide text-cyan-200">
          <Radar className="h-3.5 w-3.5" />
          Test engine
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-heading)] text-4xl font-bold text-slate-100">
          Run a censorship bypass test
        </h1>
        <p className="mt-3 max-w-3xl text-slate-300">
          Choose the target country and block type. The engine blends global node simulation with live service probes to produce protocol and provider rankings.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Test configuration</CardTitle>
          <CardDescription>
            {selectedMode?.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <label className="space-y-2 text-sm">
            <span className="text-slate-400">Target country</span>
            <select
              value={country}
              onChange={(event) => setCountry(event.target.value)}
              className="h-10 w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              {COUNTRY_OPTIONS.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label} ({option.code})
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm">
            <span className="text-slate-400">Censorship type</span>
            <select
              value={mode}
              onChange={(event) => setMode(event.target.value as CensorshipMode)}
              className="h-10 w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              {MODE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <Button onClick={startTest} disabled={loading} className="md:min-w-44">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {loading ? "Running test" : "Start test"}
          </Button>
        </CardContent>
      </Card>

      {error ? (
        <Card className="border-rose-500/35 bg-rose-950/20">
          <CardContent className="flex items-center gap-2 pt-6 text-rose-200">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </CardContent>
        </Card>
      ) : null}

      {run ? (
        <>
          <Card className="border-cyan-500/30">
            <CardHeader>
              <CardTitle>Recommendation</CardTitle>
              <CardDescription>
                {format(new Date(run.createdAt), "PPP p")} · overall effectiveness {run.overallSuccessRate}%
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-slate-200">{run.recommendation}</p>
              <div className="grid gap-3 md:grid-cols-3">
                {run.probes.map((probe) => (
                  <div key={probe.service} className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-sm">
                    <p className="font-semibold text-slate-100">{probe.service}</p>
                    <p className={probe.reachable ? "text-emerald-300" : "text-rose-300"}>
                      {probe.reachable ? "Reachable" : "Blocked or unstable"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {probe.statusCode ? `HTTP ${probe.statusCode}` : probe.error || "No response"}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <EffectivenessChart results={run.providerResults} />
          <ProviderComparison results={run.providerResults} />
        </>
      ) : null}
    </section>
  );
}
