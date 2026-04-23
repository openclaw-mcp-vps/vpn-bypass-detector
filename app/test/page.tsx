import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { TestRunner } from "@/components/TestRunner";
import { Button } from "@/components/ui/button";
import { verifyAccessToken, ACCESS_COOKIE_NAME } from "@/lib/auth";

export const metadata = {
  title: "Run Test"
};

export default async function TestPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
  const access = await verifyAccessToken(token);

  if (!access) {
    redirect("/?paywall=1");
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-10 md:px-10">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-[#f0f6fc]">Real-Time VPN Test Runner</h1>
          <p className="mt-2 text-[#9fb0c3]">
            Build a region-aware test matrix and run live probes against modern censorship controls.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
      <TestRunner />
    </main>
  );
}
