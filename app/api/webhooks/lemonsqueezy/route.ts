import { NextResponse } from "next/server";

import { extractPaidEmail, isPaymentConfirmed, verifyStripeWebhookSignature } from "@/lib/lemonsqueezy";
import { upsertPurchase } from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature") ?? request.headers.get("x-signature");

  if (!verifyStripeWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ ok: false, message: "Invalid webhook signature." }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as { type?: string };

  if (!isPaymentConfirmed(event)) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const email = extractPaidEmail(event);

  if (!email) {
    return NextResponse.json({ ok: false, message: "No customer email in webhook payload." }, { status: 400 });
  }

  await upsertPurchase({
    email,
    source: "stripe",
    eventType: event.type ?? "unknown",
    active: true
  });

  return NextResponse.json({ ok: true });
}
