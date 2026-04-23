import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { VPNTestRunner } from "@/components/VPNTestRunner";
import { ACCESS_COOKIE_NAME, readAccessToken } from "@/lib/access";

export default async function TestPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_COOKIE_NAME)?.value;

  if (!readAccessToken(token)) {
    redirect("/unlock");
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-8 sm:px-8 lg:px-10">
      <VPNTestRunner />
    </main>
  );
}
