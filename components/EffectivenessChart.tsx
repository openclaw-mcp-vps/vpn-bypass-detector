"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type ProviderTestResult } from "@/types/vpn";

interface EffectivenessChartProps {
  results: ProviderTestResult[];
}

function colorForScore(score: number): string {
  if (score >= 80) {
    return "#22d3ee";
  }
  if (score >= 65) {
    return "#38bdf8";
  }
  if (score >= 50) {
    return "#f59e0b";
  }
  return "#fb7185";
}

export function EffectivenessChart({ results }: EffectivenessChartProps) {
  const chartData = results.slice(0, 8).map((result) => ({
    label: `${result.providerName.split(" ")[0]} (${result.protocol.split(" ")[0]})`,
    success: result.successProbability,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Bypass success by provider/protocol</CardTitle>
      </CardHeader>
      <CardContent className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 12, right: 12, left: -18, bottom: 6 }}>
            <CartesianGrid stroke="rgba(148,163,184,0.15)" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="#9aa8b7"
              tick={{ fontSize: 11 }}
              interval={0}
              angle={-12}
              height={56}
              textAnchor="end"
            />
            <YAxis domain={[0, 100]} stroke="#9aa8b7" tick={{ fontSize: 11 }} />
            <Tooltip
              cursor={{ fill: "rgba(34, 211, 238, 0.08)" }}
              contentStyle={{
                borderRadius: 10,
                border: "1px solid rgba(30,41,59,1)",
                background: "rgba(15,23,42,0.95)",
                color: "#e2e8f0",
              }}
            />
            <Bar dataKey="success" radius={[8, 8, 0, 0]}>
              {chartData.map((entry) => (
                <Cell key={entry.label} fill={colorForScore(entry.success)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
