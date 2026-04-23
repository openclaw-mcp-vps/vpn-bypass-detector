import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { CensorshipMap } from "@/components/CensorshipMap";
import { ProtocolResults } from "@/components/ProtocolResults";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { verifyAccessToken, ACCESS_COOKIE_NAME } from "@/lib/auth";
import { getTestReport } from "@/lib/storage";

type ResultPageProps = {
  params: Promise<{
    testId: string;
  }>;
};

export async function generateMetadata({ params }: ResultPageProps) {
  const { testId } = await params;
  return {
    title: `Test ${testId}`,
    description: "Detailed VPN bypass test report"
  };
}

export default async function ResultsPage({ params }: ResultPageProps) {
  const { testId } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
  const access = await verifyAccessToken(token);

  if (!access) {
    redirect("/?paywall=1");
  }

  const report = await getTestReport(testId);

  if (!report) {
    notFound();
  }

  if (report.ownerEmail.toLowerCase() !== access.email.toLowerCase()) {
    notFound();
  }

  const methodChartData = report.methodSummaries.map((summary) => ({
    methodName: summary.methodName,
    passRate: summary.passRate,
    averageLatencyMs: summary.averageLatencyMs
  }));

  const protocolChartData = report.providerResults.map((entry) => ({
    label: `${entry.providerName} • ${entry.protocolName}`,
    resilienceScore: entry.resilienceScore,
    averageLatencyMs: entry.averageLatencyMs,
    successRate: entry.successRate
  }));

  const topResult = report.providerResults[0];

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl space-y-6 px-6 py-10 md:px-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-[#f0f6fc]">Report: {report.regionName}</h1>
          <p className="mt-2 text-[#9fb0c3]">Generated {new Date(report.createdAt).toLocaleString()}.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/test">Run another test</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </div>

      <Card className="border-[#2d3f56] bg-[#0d1a2b]">
        <CardHeader>
          <CardTitle className="text-xl">Executive summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-[#d0dae5]">
          <p>{report.executiveSummary}</p>
          <p>
            Top route now: <span className="font-semibold text-[#3fb950]">{topResult.providerName}</span> using
            <span className="font-semibold text-[#3fb950]"> {topResult.protocolName}</span> ({topResult.resilienceScore}/100).
          </p>
        </CardContent>
      </Card>

      <CensorshipMap data={methodChartData} />
      <ProtocolResults data={protocolChartData} />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-[#c8d6e4]">
            {report.recommendations.map((recommendation) => (
              <li key={recommendation}>• {recommendation}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </main>
  );
}
