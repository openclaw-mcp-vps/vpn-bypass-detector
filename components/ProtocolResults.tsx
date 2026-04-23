"use client";

import { Activity, TimerReset } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ProtocolSeriesPoint = {
  label: string;
  resilienceScore: number;
  averageLatencyMs: number;
  successRate: number;
};

type ProtocolResultsProps = {
  data: ProtocolSeriesPoint[];
};

export function ProtocolResults({ data }: ProtocolResultsProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Protocol Performance Curve</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ left: 0, right: 8, top: 6, bottom: 6 }}>
                <XAxis dataKey="label" tick={{ fill: "#9fb0c3", fontSize: 12 }} interval={0} angle={-10} height={52} />
                <YAxis tick={{ fill: "#9fb0c3", fontSize: 12 }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0b1320",
                    border: "1px solid #2a3d55",
                    borderRadius: "8px",
                    color: "#e6edf3"
                  }}
                />
                <Line type="monotone" dataKey="resilienceScore" stroke="#2ea043" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        {data.map((entry) => (
          <Card key={entry.label}>
            <CardHeader>
              <CardTitle className="text-base">{entry.label}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-[#cbd5df]">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-[#2ea043]" />
                <span>Resilience: {entry.resilienceScore}/100</span>
              </div>
              <div className="flex items-center gap-2">
                <TimerReset className="h-4 w-4 text-[#58a6ff]" />
                <span>Average latency: {entry.averageLatencyMs} ms</span>
              </div>
              <p>Observed pass rate: {entry.successRate}%</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
