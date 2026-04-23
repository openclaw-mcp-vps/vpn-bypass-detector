import { NextRequest, NextResponse } from "next/server";

import { upsertAccessGrant } from "@/lib/access-store";
import {
  extractSuccessfulCheckout,
  initializeLemonSqueezySdk,
  verifyIncomingWebhook,
} from "@/lib/lemonsqueezy";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  initializeLemonSqueezySdk();

  const rawBody = await request.text();
  const signature = request.headers.get("x-signature") ?? request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  const verified = verifyIncomingWebhook(rawBody, signature, secret);
  if (!verified) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Malformed JSON payload." }, { status: 400 });
  }

  const checkout = extractSuccessfulCheckout(payload);
  if (checkout?.email) {
    await upsertAccessGrant(checkout.email, checkout.paymentId);
  }

  return NextResponse.json({
    received: true,
    granted: Boolean(checkout?.email),
  });
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "webhook-listener",
  });
}
