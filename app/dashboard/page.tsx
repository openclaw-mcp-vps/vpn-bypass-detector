import { formatDistanceToNowStrict } from "date-fns";
import { ChartSpline, PlayCircle } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ACCESS_COOKIE_NAME, readAccessToken } from "@/lib/access";
import { readRecentRuns } from "@/lib/test-history";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
  const access = readAccessToken(token);

  if (!access) {
    redirect("/unlock");
  }

  const recentRuns = await readRecentRuns(10);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-8 sm:px-8 lg:px-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-cyan-300">Member dashboard</p>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-slate-100">
            Censorship bypass intelligence
          </h1>
          <p className="mt-2 text-sm text-slate-400">Signed in as {access.email}</p>
        </div>
        <a href="/test" className={cn(buttonVariants({ size: "lg" }))}>
          <PlayCircle className="h-4 w-4" />
          Run new test
        </a>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Stored test runs</CardDescription>
            <CardTitle className="text-3xl">{recentRuns.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Top signal</CardDescription>
            <CardTitle className="text-lg text-cyan-200">
              {recentRuns[0] ? `${recentRuns[0].overallSuccessRate}% bypass resilience` : "No tests yet"}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Next action</CardDescription>
            <CardTitle className="text-lg">Run tests after major block events</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <section className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartSpline className="h-5 w-5 text-cyan-300" />
              Recent runs
            </CardTitle>
            <CardDescription>
              Your latest simulations, sorted by most recent run.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentRuns.length === 0 ? (
              <p className="text-sm text-slate-400">
                You have no completed runs yet. Open the tester and launch your first country scenario.
              </p>
            ) : (
              <div className="space-y-3">
                {recentRuns.map((run) => (
                  <div
                    key={run.runId}
                    className="flex flex-col justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-4 md:flex-row md:items-center"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-100">
                        {run.targetCountry} / {run.scenario.mode}
                      </p>
                      <p className="text-xs text-slate-400">
                        {run.recommendation}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-semibold text-cyan-200">{run.overallSuccessRate}%</p>
                      <p className="text-xs text-slate-500">
                        {formatDistanceToNowStrict(new Date(run.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
