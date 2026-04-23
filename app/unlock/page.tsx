"use client";

import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function UnlockPage() {
  const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const buttonLabel = useMemo(() => {
    if (status === "loading") {
      return "Checking purchase";
    }
    if (status === "success") {
      return "Access granted";
    }
    return "Unlock dashboard";
  }, [status]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/access/grant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(data.message || "Purchase not found");
      }

      setStatus("success");
      setMessage("Access enabled. Redirecting to dashboard...");
      window.setTimeout(() => {
        window.location.href = "/dashboard";
      }, 600);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to unlock your account.");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-10 sm:px-8">
      <Card className="w-full border-cyan-500/25 bg-slate-950/80">
        <CardHeader>
          <CardTitle className="font-[family-name:var(--font-heading)] text-3xl">Unlock your VPN test access</CardTitle>
          <CardDescription className="text-base text-slate-300">
            Use the same email address you used during checkout. Once Stripe webhook confirmation arrives, access is granted instantly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-sm text-slate-300">
            <p className="font-semibold text-slate-200">Access flow</p>
            <p className="mt-2">1. Complete checkout through Stripe Payment Link.</p>
            <p>2. Webhook records your purchase email.</p>
            <p>3. Enter that email here to set your secure access cookie.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block text-sm font-medium text-slate-300" htmlFor="email">
              Purchase email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={status === "loading"}>
                {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                {buttonLabel}
              </Button>
              <a href={paymentLink} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-900">
                Buy with Stripe
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </form>

          {message ? (
            <p className={status === "error" ? "text-sm text-rose-300" : "text-sm text-emerald-300"}>{message}</p>
          ) : null}
        </CardContent>
      </Card>
    </main>
  );
}
