import { createHmac, timingSafeEqual } from "node:crypto";

import * as LemonSqueezySDK from "@lemonsqueezy/lemonsqueezy.js";

interface SuccessfulCheckout {
  email: string;
  paymentId: string | undefined;
}

export function initializeLemonSqueezySdk() {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  if (!apiKey) {
    return;
  }

  const maybeSetup = (LemonSqueezySDK as { lemonSqueezySetup?: (args: { apiKey: string }) => void }).lemonSqueezySetup;
  if (typeof maybeSetup === "function") {
    maybeSetup({ apiKey });
  }
}

function safeCompare(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left, "utf8");
  const rightBuffer = Buffer.from(right, "utf8");
  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }
  return timingSafeEqual(leftBuffer, rightBuffer);
}

function verifyStripeStyleSignature(rawBody: string, signatureHeader: string, secret: string): boolean {
  const fields = Object.fromEntries(
    signatureHeader
      .split(",")
      .map((part) => part.split("="))
      .filter((entry): entry is [string, string] => entry.length === 2),
  );

  const timestamp = fields.t;
  const expectedSignature = fields.v1;
  if (!timestamp || !expectedSignature) {
    return false;
  }

  const signedPayload = `${timestamp}.${rawBody}`;
  const computed = createHmac("sha256", secret).update(signedPayload).digest("hex");
  return safeCompare(computed, expectedSignature);
}

export function verifyIncomingWebhook(rawBody: string, signatureHeader: string | null, secret: string | undefined): boolean {
  if (!signatureHeader || !secret) {
    return false;
  }

  if (signatureHeader.includes("v1=") && signatureHeader.includes("t=")) {
    return verifyStripeStyleSignature(rawBody, signatureHeader, secret);
  }

  const computed = createHmac("sha256", secret).update(rawBody).digest("hex");
  return safeCompare(computed, signatureHeader.trim());
}

function readNestedString(payload: Record<string, unknown>, path: string[]): string | undefined {
  let current: unknown = payload;

  for (const key of path) {
    if (!current || typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }

  return typeof current === "string" ? current : undefined;
}

export function extractSuccessfulCheckout(payload: unknown): SuccessfulCheckout | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const event = payload as Record<string, unknown>;
  const eventType = typeof event.type === "string" ? event.type : undefined;
  const eventName = typeof event.meta === "object" && event.meta
    ? (event.meta as Record<string, unknown>).event_name
    : undefined;

  if (eventType === "checkout.session.completed") {
    const email = readNestedString(event, ["data", "object", "customer_details", "email"])
      ?? readNestedString(event, ["data", "object", "customer_email"]);
    const paymentId = readNestedString(event, ["data", "object", "id"]);

    if (email) {
      return { email: email.toLowerCase(), paymentId };
    }
    return null;
  }

  if (eventName === "order_created") {
    const email = readNestedString(event, ["data", "attributes", "user_email"])
      ?? readNestedString(event, ["data", "attributes", "customer_email"]);
    const paymentId = readNestedString(event, ["data", "id"]);

    if (email) {
      return { email: email.toLowerCase(), paymentId };
    }
  }

  return null;
}
