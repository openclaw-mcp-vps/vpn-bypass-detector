import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ArrowRight, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { verifyAccessToken, ACCESS_COOKIE_NAME } from "@/lib/auth";
import { listRecentReportsByOwner } from "@/lib/storage";

export const metadata = {
  title: "Dashboard"
};

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
  const access = await verifyAccessToken(token);

  if (!access) {
    redirect("/?paywall=1");
  }

  const recentReports = await listRecentReportsByOwner(access.email, 10);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-10 md:px-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-[#f0f6fc]">VPN Bypass Dashboard</h1>
          <p className="mt-2 text-[#9fb0c3]">Signed in for {access.email}. Run targeted tests and track censorship resilience.</p>
        </div>
        <Button asChild>
          <Link href="/test">
            New Test Run
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <Card className="mb-6 border-[#2d3f56] bg-[#0d1a2b]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShieldAlert className="h-5 w-5 text-[#f2cc60]" />
            Operational guidance
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-[#c7d4e2]">
          Re-run tests before any high-risk activity window. National filtering rules can change quickly, especially during
          elections, protests, or coordinated platform restrictions.
        </CardContent>
      </Card>

      <section>
        <h2 className="mb-3 text-xl font-semibold">Recent reports</h2>
        {recentReports.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-[#9fb0c3]">
              No report yet. Run your first real-time test to generate protocol and provider rankings.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {recentReports.map((report) => (
              <Card key={report.id}>
                <CardHeader>
                  <CardTitle className="text-base">{report.regionName}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-[#c9d6e3]">
                  <p>{report.executiveSummary}</p>
                  <p className="text-[#9fb0c3]">{new Date(report.createdAt).toLocaleString()}</p>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/results/${report.id}`}>Open report</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
