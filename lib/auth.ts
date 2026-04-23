import { SignJWT, jwtVerify } from "jose";
import type { NextRequest } from "next/server";

export const ACCESS_COOKIE_NAME = "vpn_bypass_access";
const COOKIE_TTL_SECONDS = 60 * 60 * 24 * 31;

type AccessCookiePayload = {
  email: string;
  plan: "pro";
};

function getSigningSecret() {
  const secret = process.env.STRIPE_WEBHOOK_SECRET ?? "local-dev-secret-change-this";
  return new TextEncoder().encode(secret);
}

export async function createAccessToken(email: string) {
  return await new SignJWT({ email, plan: "pro" } satisfies AccessCookiePayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${COOKIE_TTL_SECONDS}s`)
    .sign(getSigningSecret());
}

export async function verifyAccessToken(token: string | undefined | null) {
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getSigningSecret());
    const email = payload.email;
    const plan = payload.plan;

    if (typeof email !== "string" || plan !== "pro") {
      return null;
    }

    return {
      email,
      plan
    } as AccessCookiePayload;
  } catch {
    return null;
  }
}

export async function getAccessFromRequest(request: NextRequest) {
  const token = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
  return verifyAccessToken(token);
}

export async function hasPaidAccess(cookieStore: { get: (name: string) => { value: string } | undefined }) {
  const token = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
  const payload = await verifyAccessToken(token);
  return payload !== null;
}
