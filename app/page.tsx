import { BarChart3, LockKeyhole, Radar, ShieldAlert, Wifi } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "How is this different from generic VPN review sites?",
    a: "Review sites measure speed from open networks. VPN Bypass Detector scores survival under censorship tactics like DNS poisoning, SNI filtering, and active DPI interference.",
  },
  {
    q: "Can this guarantee I stay connected in my country?",
    a: "No tool can guarantee that because blocks change quickly, but you get a ranked protocol/provider playbook based on current pressure profiles and live service probes.",
  },
  {
    q: "Which countries are covered?",
    a: "The tester supports country-code targeting and ships profiles for the highest-pressure regions, including China, Iran, Russia, Turkey, UAE, and Egypt.",
  },
  {
    q: "What do I get for $9/month?",
    a: "Unlimited test runs, protocol-level comparisons, node-by-node risk scoring, and continuously refreshed recommendation logic for censorship-heavy environments.",
  },
];

export default function HomePage() {
  const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8 sm:px-8 lg:px-10">
      <header className="mb-16 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/40 px-5 py-4 backdrop-blur">
        <p className="font-[family-name:var(--font-heading)] text-lg font-semibold text-slate-100">
          VPN Bypass Detector
        </p>
        <div className="flex items-center gap-3">
          <a href="/unlock" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            I already paid
          </a>
          <a href={paymentLink} className={cn(buttonVariants({ size: "sm" }))}>
            Buy access
          </a>
        </div>
      </header>

      <section className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-end">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-wide text-cyan-200">
            <Radar className="h-3.5 w-3.5" />
            Privacy Tools
          </div>
          <h1 className="font-[family-name:var(--font-heading)] text-4xl font-bold leading-tight text-slate-50 sm:text-5xl lg:text-6xl">
            Test VPN effectiveness against government blocks
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-300">
            Stop guessing which VPN works in restricted countries. Run censorship-focused protocol tests and get live, ranked guidance before your current setup fails.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href={paymentLink} className={cn(buttonVariants({ size: "lg" }))}>
              Start for $9/month
            </a>
            <a href="/unlock" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
              Unlock existing purchase
            </a>
          </div>
        </div>

        <Card className="overflow-hidden border-cyan-500/25 bg-gradient-to-br from-slate-950/90 to-slate-900/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-200">
              <BarChart3 className="h-5 w-5" />
              What you get instantly
            </CardTitle>
            <CardDescription>
              A practical answer to one question: which protocol still connects when filtering is aggressive?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-300">
            <p>1. Country-specific restriction profiles tied to real censorship patterns.</p>
            <p>2. Provider and protocol ranking by projected bypass success.</p>
            <p>3. Node-level risk notes to pick fallback options before shutdowns happen.</p>
          </CardContent>
        </Card>
      </section>

      <section id="problem" className="mt-24">
        <h2 className="font-[family-name:var(--font-heading)] text-3xl font-semibold text-slate-100">Why standard VPN advice fails in restricted countries</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShieldAlert className="h-4 w-4 text-rose-300" />
                Blocks change weekly
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300">
              Government filters rotate signature rules and endpoint bans faster than most provider status pages update.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <LockKeyhole className="h-4 w-4 text-amber-300" />
                Protocols behave differently
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300">
              WireGuard may be fast but visible. Obfuscated OpenVPN can survive longer under DPI, at the cost of speed.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wifi className="h-4 w-4 text-cyan-300" />
                Trial-and-error is risky
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300">
              Repeated failed attempts can expose patterns. You need a tested ranking and fallback chain before connecting.
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="solution" className="mt-24">
        <h2 className="font-[family-name:var(--font-heading)] text-3xl font-semibold text-slate-100">How VPN Bypass Detector works</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Restriction-aware simulation</CardTitle>
              <CardDescription>
                Each run combines country baselines with the censorship mode you choose: DNS poisoning, DPI blocking, SNI filtering, IP bans, or throttling.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Global node pressure model</CardTitle>
              <CardDescription>
                We score providers across multiple node environments, then report both bypass probability and operational risk for each protocol pairing.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Live probe impact</CardTitle>
              <CardDescription>
                Real-time checks against frequently targeted services adjust the model to reflect active network pressure at test time.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Actionable recommendation</CardTitle>
              <CardDescription>
                You get a primary provider/protocol plus a fallback recommendation so you can switch quickly when an endpoint is burned.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      <section id="pricing" className="mt-24">
        <Card className="border-cyan-500/30 bg-gradient-to-b from-cyan-500/10 via-slate-900/40 to-slate-950/60">
          <CardHeader>
            <CardTitle className="font-[family-name:var(--font-heading)] text-3xl">Simple pricing for people who need reliable access</CardTitle>
            <CardDescription className="text-base text-slate-300">
              $9/month for unlimited tests and always-on censorship bypass scoring.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <p className="text-sm text-slate-300">Built for users in high-risk regions who cannot afford connection guesswork.</p>
            </div>
            <a href={paymentLink} className={cn(buttonVariants({ size: "lg" }))}>
              Buy now with Stripe
            </a>
          </CardContent>
        </Card>
      </section>

      <section id="faq" className="mt-24">
        <h2 className="font-[family-name:var(--font-heading)] text-3xl font-semibold text-slate-100">FAQ</h2>
        <div className="mt-6 space-y-4">
          {faqs.map((item) => (
            <Card key={item.q}>
              <CardHeader>
                <CardTitle className="text-lg">{item.q}</CardTitle>
                <CardDescription className="text-sm leading-relaxed text-slate-300">{item.a}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
