import { NextResponse } from "next/server";
import { z } from "zod";

import { createAccessToken, ACCESS_COOKIE_NAME } from "@/lib/auth";
import { hasActivePurchase } from "@/lib/storage";

export const runtime = "nodejs";

const claimSchema = z.object({
  email: z.string().email()
});

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = claimSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ success: false, message: "Provide a valid purchase email." }, { status: 400 });
  }

  const hasPurchase = await hasActivePurchase(parsed.data.email);

  if (!hasPurchase) {
    return NextResponse.json(
      {
        success: false,
        message:
          "No active purchase found for this email yet. If checkout was recent, wait 30-60 seconds and retry after webhook delivery."
      },
      { status: 404 }
    );
  }

  const token = await createAccessToken(parsed.data.email);
  const response = NextResponse.json({
    success: true,
    message: "Access granted. Redirecting to your dashboard."
  });

  response.cookies.set({
    name: ACCESS_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 31,
    path: "/"
  });

  return response;
}
