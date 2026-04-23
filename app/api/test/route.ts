import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getAccessFromRequest } from "@/lib/auth";
import { saveTestReport } from "@/lib/storage";
import { runVPNTestSuite } from "@/lib/vpn-tester";

export const runtime = "nodejs";

const testPayloadSchema = z.object({
  regionCode: z.string().min(2),
  providerIds: z.array(z.string()).min(1).max(5),
  protocolIds: z.array(z.string()).min(1).max(5)
});

export async function POST(request: NextRequest) {
  const access = await getAccessFromRequest(request);

  if (!access) {
    return NextResponse.json({ message: "Paid access is required." }, { status: 402 });
  }

  const body = await request.json().catch(() => null);
  const parsed = testPayloadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid test configuration." }, { status: 400 });
  }

  try {
    const report = await runVPNTestSuite({
      ...parsed.data,
      ownerEmail: access.email
    });

    await saveTestReport(report);

    return NextResponse.json({
      testId: report.id,
      createdAt: report.createdAt,
      summary: report.executiveSummary
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Unable to complete test run."
      },
      { status: 500 }
    );
  }
}
