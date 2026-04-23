"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Radar } from "lucide-react";

import { VPNProviderCard } from "@/components/VPNProviderCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CENSORSHIP_REGIONS, VPN_PROVIDERS, VPN_PROTOCOLS } from "@/lib/censorship-db";

export function TestRunner() {
  const router = useRouter();
  const [regionCode, setRegionCode] = useState(CENSORSHIP_REGIONS[0]?.code ?? "CN");
  const [selectedProviders, setSelectedProviders] = useState<string[]>(VPN_PROVIDERS.slice(0, 3).map((p) => p.id));
  const [selectedProtocols, setSelectedProtocols] = useState<string[]>(["openvpn_tcp", "obfs4"]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const region = useMemo(
    () => CENSORSHIP_REGIONS.find((entry) => entry.code === regionCode) ?? CENSORSHIP_REGIONS[0],
    [regionCode]
  );

  const compatibleProtocols = useMemo(() => {
    return VPN_PROTOCOLS.filter((protocol) =>
      selectedProviders.some((providerId) => {
        const provider = VPN_PROVIDERS.find((entry) => entry.id === providerId);
        return provider?.protocols.includes(protocol.id);
      })
    );
  }, [selectedProviders]);

  const toggleProvider = (providerId: string) => {
    setSelectedProviders((current) =>
      current.includes(providerId) ? current.filter((id) => id !== providerId) : [...current, providerId]
    );
  };

  const toggleProtocol = (protocolId: string) => {
    setSelectedProtocols((current) =>
      current.includes(protocolId) ? current.filter((id) => id !== protocolId) : [...current, protocolId]
    );
  };

  const runTest = async () => {
    if (selectedProviders.length === 0 || selectedProtocols.length === 0) {
      setError("Select at least one provider and one protocol to start a run.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          regionCode,
          providerIds: selectedProviders,
          protocolIds: selectedProtocols
        })
      });

      const payload = (await response.json()) as { testId?: string; message?: string };

      if (!response.ok || !payload.testId) {
        throw new Error(payload.message ?? "Unable to run VPN test right now");
      }

      router.push(`/results/${payload.testId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected test error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Configure your censorship test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <label htmlFor="region" className="mb-2 block text-sm font-medium text-[#d2dae3]">
              Target region profile
            </label>
            <select
              id="region"
              value={regionCode}
              onChange={(event) => setRegionCode(event.target.value)}
              className="w-full rounded-lg border border-[#33465d] bg-[#0b1320] px-3 py-2 text-sm text-[#e6edf3] outline-none focus:border-[#2ea043]"
            >
              {CENSORSHIP_REGIONS.map((entry) => (
                <option key={entry.code} value={entry.code}>
                  {entry.label}
                </option>
              ))}
            </select>
            {region ? (
              <p className="mt-2 text-sm text-[#9fb0c3]">
                Pressure index: {Math.round(region.pressureIndex * 100)}%. Typical controls: {region.commonTechniques.length}
              </p>
            ) : null}
          </div>

          <div>
            <h3 className="mb-2 text-sm font-medium text-[#d2dae3]">Protocol selection</h3>
            <div className="flex flex-wrap gap-2">
              {compatibleProtocols.map((protocol) => {
                const active = selectedProtocols.includes(protocol.id);
                return (
                  <button
                    key={protocol.id}
                    type="button"
                    onClick={() => toggleProtocol(protocol.id)}
                    className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                      active
                        ? "border-[#2ea043] bg-[#1a3524] text-[#bce6c4]"
                        : "border-[#33465d] bg-[#0b1320] text-[#b6c5d4] hover:border-[#3c536e]"
                    }`}
                  >
                    {protocol.name}
                  </button>
                );
              })}
            </div>
          </div>

          <Button onClick={runTest} disabled={loading} size="lg" className="w-full md:w-auto">
            {loading ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Running probes...
              </>
            ) : (
              <>
                <Radar className="mr-2 h-4 w-4" />
                Start Real-Time Test
              </>
            )}
          </Button>

          {error ? <p className="text-sm text-[#f85149]">{error}</p> : null}
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Choose VPN providers</h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {VPN_PROVIDERS.map((provider) => (
            <VPNProviderCard
              key={provider.id}
              provider={provider}
              selected={selectedProviders.includes(provider.id)}
              onToggle={toggleProvider}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
