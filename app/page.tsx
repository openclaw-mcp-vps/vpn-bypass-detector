import Link from "next/link";
import { ArrowRight, GlobeLock, Shield, Signal, Wallet } from "lucide-react";

import { AccessGate } from "@/components/AccessGate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type HomePageProps = {
  searchParams?: Promise<{
    paywall?: string | string[];
  }>;
};

const faqItems = [
  {
    question: "How is this different from generic VPN speed tests?",
    answer:
      "Speed tests only show bandwidth. VPN Bypass Detector actively probes censorship techniques like DNS poisoning, SNI blocking, and DPI resets so you see whether a connection survives real blocks."
  },
  {
    question: "Does the platform run tests in real time?",
    answer:
      "Yes. Every test run performs live network probes, then combines those observations with region-specific censorship intelligence to produce actionable resilience scores."
  },
  {
    question: "How do I unlock access after payment?",
    answer:
      "Complete Stripe checkout, then enter the same checkout email in the unlock box. If your payment event reached the webhook, a secure cookie unlocks the dashboard instantly."
  },
  {
    question: "Who should use this product?",
    answer:
      "Journalists, researchers, activists, remote teams, and anyone who needs reliable access in regions with rapidly changing internet controls."
  }
];

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const paywallFlag = resolvedSearchParams?.paywall;
  const showPaywallNotice = typeof paywallFlag === "string" ? paywallFlag.length > 0 : Array.isArray(paywallFlag);
  const stripePaymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;

  return (
    <main className="min-h-screen bg-[#0d1117]">
      <section className="section-grid border-b border-[#243449] px-6 py-20 md:px-12">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="mb-4 inline-flex items-center rounded-full border border-[#2a3d55] bg-[#0f172a] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#8fb3d9]">
              Privacy Tools • $9/month
            </p>
            <h1 className="text-balance text-4xl font-semibold leading-tight text-[#f0f6fc] md:text-6xl">
              Test VPN effectiveness against government blocks.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-[#b5c6d8]">
              Know exactly which VPN protocol/provider combinations still work in high-censorship regions before you rely on
              them.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href={stripePaymentLink}>
                  Start Pro Access
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/test">See Live Tester</Link>
              </Button>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">5 censorship methods</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#9fb0c3]">DNS poisoning, SNI filtering, IP blocks, DPI resets, and keyword filtering.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Region-specific scoring</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#9fb0c3]">Results account for local censorship pressure, not generic global averages.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Actionable output</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#9fb0c3]">Clear provider/protocol ranking with recommendations for safer fallback paths.</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-5">
            <AccessGate />
            {showPaywallNotice ? (
              <p className="rounded-lg border border-[#5f2e31] bg-[#2a1114] px-4 py-3 text-sm text-[#ffb4b4]">
                Your dashboard is paywalled. Complete checkout and unlock with your purchase email.
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-18 md:px-12">
        <h2 className="text-3xl font-semibold text-[#f0f6fc]">Why this exists</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <GlobeLock className="h-5 w-5 text-[#58a6ff]" />
                Problem
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-[#b4c3d3]">
              VPN marketing claims do not reflect censorship realities on the ground. People in restricted countries risk
              exposure when “working” VPNs silently fail.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Signal className="h-5 w-5 text-[#f2cc60]" />
                Solution
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-[#b4c3d3]">
              Run live bypass probes across censorship techniques, compare provider/protocol resilience, and pick the safest
              route for your region.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5 text-[#3fb950]" />
                Outcome
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-[#b4c3d3]">
              Less guessing, fewer lockouts, and a repeatable workflow for keeping secure access available as blocks evolve.
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="pricing" className="border-y border-[#243449] bg-[#0c1422] px-6 py-16 md:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#9fb0c3]">Pricing</p>
          <h2 className="text-4xl font-semibold text-[#f0f6fc]">Simple pricing for high-stakes connectivity</h2>
          <p className="mt-4 text-[#b5c6d8]">
            One Pro plan includes unlimited tests, historical report access, and region recommendation updates.
          </p>
          <div className="mx-auto mt-8 max-w-md rounded-2xl border border-[#2a3d55] bg-[#0f172a] p-8 text-left">
            <div className="mb-4 flex items-end gap-2">
              <span className="text-5xl font-semibold text-[#f0f6fc]">$9</span>
              <span className="pb-1 text-sm text-[#9fb0c3]">/month</span>
            </div>
            <ul className="space-y-2 text-sm text-[#cfdae5]">
              <li>• Unlimited censorship bypass tests</li>
              <li>• Provider/protocol ranking with resilience scoring</li>
              <li>• Region-tailored recommendations</li>
              <li>• Cookie-based paid dashboard access</li>
            </ul>
            <Button asChild className="mt-6 w-full" size="lg">
              <a href={stripePaymentLink}>
                <Wallet className="mr-2 h-4 w-4" />
                Buy Pro Access
              </a>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16 md:px-12">
        <h2 className="text-3xl font-semibold text-[#f0f6fc]">FAQ</h2>
        <div className="mt-6 space-y-3">
          {faqItems.map((item) => (
            <Card key={item.question}>
              <CardHeader>
                <CardTitle className="text-base">{item.question}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-[#b9c8d9]">{item.answer}</CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
