import crypto from "node:crypto";

export function verifyStripeWebhookSignature(rawBody: string, signatureHeader: string | null) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret || !signatureHeader) {
    return false;
  }

  const parts = signatureHeader.split(",").map((part) => part.trim());
  const timestamp = parts.find((part) => part.startsWith("t="))?.slice(2);
  const providedSignature = parts.find((part) => part.startsWith("v1="))?.slice(3);

  if (!timestamp || !providedSignature) {
    return false;
  }

  const payload = `${timestamp}.${rawBody}`;
  const expectedSignature = crypto.createHmac("sha256", secret).update(payload).digest("hex");

  const providedBuffer = Buffer.from(providedSignature, "hex");
  const expectedBuffer = Buffer.from(expectedSignature, "hex");

  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(providedBuffer, expectedBuffer);
}

export function extractPaidEmail(event: unknown): string | null {
  if (!event || typeof event !== "object") {
    return null;
  }

  const payload = event as {
    type?: string;
    data?: {
      object?: {
        customer_email?: string;
        customer_details?: { email?: string };
        receipt_email?: string;
      };
    };
    meta?: {
      custom_data?: {
        user_email?: string;
      };
    };
  };

  const fromStripe =
    payload.data?.object?.customer_details?.email ??
    payload.data?.object?.customer_email ??
    payload.data?.object?.receipt_email;

  const fromLemon = payload.meta?.custom_data?.user_email;

  return fromStripe ?? fromLemon ?? null;
}

export function isPaymentConfirmed(event: unknown) {
  if (!event || typeof event !== "object") {
    return false;
  }

  const payload = event as { type?: string };
  const allowedEventTypes = new Set([
    "checkout.session.completed",
    "invoice.paid",
    "payment_intent.succeeded",
    "order_created",
    "subscription_payment_success"
  ]);

  return payload.type ? allowedEventTypes.has(payload.type) : false;
}
