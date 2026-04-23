import { NextRequest, NextResponse } from "next/server";

import { ACCESS_COOKIE_NAME, readAccessToken } from "@/lib/access";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
  const payload = readAccessToken(token);

  return NextResponse.json({
    hasAccess: Boolean(payload),
    email: payload?.email ?? null,
  });
}
