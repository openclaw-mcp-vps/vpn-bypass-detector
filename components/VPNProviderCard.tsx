import { ShieldCheck, ShieldX } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { VPNProvider } from "@/lib/censorship-db";

type VPNProviderCardProps = {
  provider: VPNProvider;
  selected: boolean;
  onToggle: (providerId: string) => void;
};

export function VPNProviderCard({ provider, selected, onToggle }: VPNProviderCardProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(provider.id)}
      className={`w-full text-left transition-transform duration-200 hover:-translate-y-0.5 ${selected ? "ring-2 ring-[#2ea043]/70" : ""}`}
    >
      <Card className="h-full border-[#2b3b4f] bg-[#0f172a]/80">
        <CardHeader className="pb-4">
          <div className="mb-2 flex items-center justify-between">
            <CardTitle className="text-base md:text-lg">{provider.name}</CardTitle>
            {provider.audited ? (
              <ShieldCheck className="h-5 w-5 text-[#3fb950]" aria-label="Audited provider" />
            ) : (
              <ShieldX className="h-5 w-5 text-[#f85149]" aria-label="Not audited" />
            )}
          </div>
          <p className="text-xs uppercase tracking-wide text-[#9fb0c3]">HQ: {provider.headquarters}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-[#d2dae3]">Reliability score: {Math.round(provider.reliabilityScore * 100)}%</p>
          <ul className="space-y-1 text-sm text-[#9fb0c3]">
            {provider.highlights.map((highlight) => (
              <li key={highlight}>• {highlight}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </button>
  );
}
