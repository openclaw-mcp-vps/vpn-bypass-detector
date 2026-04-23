"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type CensorshipMapPoint = {
  methodName: string;
  passRate: number;
  averageLatencyMs: number;
};

type CensorshipMapProps = {
  data: CensorshipMapPoint[];
};

export function CensorshipMap({ data }: CensorshipMapProps) {
  return (
    <div className="rounded-xl border border-[#233041] bg-[#0f172a]/70 p-4 md:p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-[#e6edf3]">Censorship Method Heatmap</h2>
        <p className="text-sm text-[#9fb0c3]">Higher pass rate means more sessions successfully bypassed that censorship layer.</p>
      </div>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 8 }}>
            <CartesianGrid stroke="#223247" strokeDasharray="4 4" />
            <XAxis dataKey="methodName" tick={{ fill: "#9fb0c3", fontSize: 12 }} interval={0} angle={-12} height={56} />
            <YAxis tick={{ fill: "#9fb0c3", fontSize: 12 }} domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0b1320",
                border: "1px solid #2a3d55",
                borderRadius: "8px",
                color: "#e6edf3"
              }}
            />
            <Bar dataKey="passRate" fill="#2ea043" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
