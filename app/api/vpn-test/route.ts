import { NextRequest, NextResponse } from "next/server";

import { ACCESS_COOKIE_NAME, hasValidAccess } from "@/lib/access";
import { saveTestRun } from "@/lib/test-history";
import { runVpnBypassSuite } from "@/lib/vpn-tester";
import { type CensorshipMode } from "@/types/vpn";

const ALLOWED_MODES: CensorshipMode[] = [
  "dns-poisoning",
  "dpi-blocking",
  "sni-filtering",
  "ip-blacklist",
  "protocol-throttling",
];

function isMode(value: unknown): value is CensorshipMode {
  return typeof value === "string" && ALLOWED_MODES.includes(value as CensorshipMode);
}

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
  if (!hasValidAccess(accessToken)) {
    return NextResponse.json(
      { error: "Payment required. Unlock access before running tests." },
      { status: 402 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const country = typeof (body as { country?: unknown }).country === "string"
    ? (body as { country: string }).country.toUpperCase().trim()
    : "";
  const mode = (body as { mode?: unknown }).mode;

  if (!country || country.length !== 2) {
    return NextResponse.json({ error: "Country must be a two-letter ISO code." }, { status: 400 });
  }

  if (!isMode(mode)) {
    return NextResponse.json({ error: "Unsupported censorship mode." }, { status: 400 });
  }

  try {
    const run = await runVpnBypassSuite(country, mode);
    await saveTestRun(run);
    return NextResponse.json(run);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
