"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type ProviderTestResult } from "@/types/vpn";

interface ProviderComparisonProps {
  results: ProviderTestResult[];
}

export function ProviderComparison({ results }: ProviderComparisonProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Provider comparison</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              <th className="px-3 py-2">Rank</th>
              <th className="px-3 py-2">Provider</th>
              <th className="px-3 py-2">Protocol</th>
              <th className="px-3 py-2">Success</th>
              <th className="px-3 py-2">Confidence</th>
              <th className="px-3 py-2">Latency</th>
              <th className="px-3 py-2">Speed retained</th>
            </tr>
          </thead>
          <tbody>
            {results.slice(0, 10).map((result, index) => (
              <tr key={`${result.providerId}-${result.protocol}`} className="border-b border-slate-900/80 text-slate-200">
                <td className="px-3 py-3">#{index + 1}</td>
                <td className="px-3 py-3 font-semibold">{result.providerName}</td>
                <td className="px-3 py-3">{result.protocol}</td>
                <td className="px-3 py-3 text-cyan-300">{result.successProbability}%</td>
                <td className="px-3 py-3">{result.confidence}%</td>
                <td className="px-3 py-3">{result.estimatedLatencyMs}ms</td>
                <td className="px-3 py-3">{result.speedRetentionPercent}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
