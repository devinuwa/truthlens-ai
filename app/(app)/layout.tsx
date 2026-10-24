import type { ReactNode } from "react";
import { Suspense } from "react";
import { connection } from "next/server";
import { AppShell } from "@/components/layout/app-shell";
import { getOptionalUser } from "@/lib/auth/current-user";

export const instant = false;

export default async function AppLayout({ children }: { children: ReactNode }) {
  await connection();
  const user = await getOptionalUser();
  return (
    <AppShell user={user}>
      <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>{children}</Suspense>
    </AppShell>
  );
}
