"use client";

import { type FormEvent, useState } from "react";
import { LoaderCircle, Lock, Unlock } from "lucide-react";

import { Button } from "@/components/ui/button";

export function AccessGate() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onClaim = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!email.includes("@")) {
      setError("Enter the same email used in Stripe checkout.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/access/claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      const payload = (await response.json()) as { message?: string; success?: boolean };

      if (!response.ok || !payload.success) {
        setError(payload.message ?? "No active purchase found for this email yet.");
      } else {
        setMessage(payload.message ?? "Access unlocked. Redirecting to dashboard...");
        window.location.href = "/dashboard";
      }
    } catch {
      setError("Unable to verify your purchase right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-[#2a3d55] bg-[#0f172a]/80 p-5">
      <div className="mb-4 flex items-center gap-2 text-[#dbe5ef]">
        <Lock className="h-4 w-4 text-[#2ea043]" />
        <h3 className="font-semibold">Unlock your paid workspace</h3>
      </div>
      <p className="mb-4 text-sm text-[#9fb0c3]">
        After checkout, enter your purchase email to activate the cookie-based Pro access on this device.
      </p>
      <form onSubmit={onClaim} className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="name@securemail.com"
          className="w-full rounded-lg border border-[#33465d] bg-[#0b1320] px-3 py-2.5 text-sm text-[#e6edf3] outline-none transition-colors focus:border-[#2ea043]"
          autoComplete="email"
          required
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              Verifying purchase...
            </>
          ) : (
            <>
              <Unlock className="mr-2 h-4 w-4" />
              Unlock Dashboard
            </>
          )}
        </Button>
      </form>
      {message ? <p className="mt-3 text-sm text-[#3fb950]">{message}</p> : null}
      {error ? <p className="mt-3 text-sm text-[#f85149]">{error}</p> : null}
    </div>
  );
}
