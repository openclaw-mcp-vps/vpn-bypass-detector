import { createHmac, timingSafeEqual } from "node:crypto";

export const ACCESS_COOKIE_NAME = "vpn_access";
const ACCESS_TTL_SECONDS = 60 * 60 * 24 * 31;

interface AccessPayload {
  email: string;
  issuedAt: number;
}

function signingSecret(): string {
  return process.env.STRIPE_WEBHOOK_SECRET || "local-dev-secret-change-me";
}

export function createAccessToken(emailInput: string): string {
  const email = emailInput.trim().toLowerCase();
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = `${email}|${issuedAt}`;
  const signature = createHmac("sha256", signingSecret()).update(payload).digest("hex");

  return Buffer.from(`${payload}|${signature}`).toString("base64url");
}

export function readAccessToken(token: string | null | undefined): AccessPayload | null {
  if (!token) {
    return null;
  }

  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const parts = decoded.split("|");
    if (parts.length !== 3) {
      return null;
    }

    const [email, issuedAtRaw, signature] = parts;
    const issuedAt = Number.parseInt(issuedAtRaw, 10);
    if (!email || Number.isNaN(issuedAt) || !signature) {
      return null;
    }

    const payload = `${email}|${issuedAtRaw}`;
    const expected = createHmac("sha256", signingSecret()).update(payload).digest("hex");

    const expectedBuffer = Buffer.from(expected, "utf8");
    const signatureBuffer = Buffer.from(signature, "utf8");
    if (expectedBuffer.length !== signatureBuffer.length) {
      return null;
    }

    if (!timingSafeEqual(expectedBuffer, signatureBuffer)) {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    if (issuedAt + ACCESS_TTL_SECONDS < now) {
      return null;
    }

    return { email, issuedAt };
  } catch {
    return null;
  }
}

export function hasValidAccess(token: string | null | undefined): boolean {
  return !!readAccessToken(token);
}
