import { NextRequest, NextResponse } from "next/server";

import { ACCESS_COOKIE_NAME, createAccessToken } from "@/lib/access";
import { hasAccessGrant } from "@/lib/access-store";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON request body." }, { status: 400 });
  }

  const email = typeof (body as { email?: unknown }).email === "string"
    ? (body as { email: string }).email.trim().toLowerCase()
    : "";

  if (!email || !email.includes("@")) {
    return NextResponse.json({ message: "Enter a valid purchase email address." }, { status: 400 });
  }

  const grantExists = await hasAccessGrant(email);
  if (!grantExists) {
    return NextResponse.json(
      {
        message: "No paid subscription found for this email yet. Wait for webhook delivery or contact support.",
      },
      { status: 404 },
    );
  }

  const token = createAccessToken(email);
  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: ACCESS_COOKIE_NAME,
    value: token,
    maxAge: 60 * 60 * 24 * 31,
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
