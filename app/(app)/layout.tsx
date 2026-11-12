import { Suspense, type ReactNode } from "react";
import { AccountFooter, AccountPending } from "@/components/layout/account-footer";
import { AppShell } from "@/components/layout/app-shell";
import { getOptionalUser } from "@/lib/auth/current-user";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell account={<AccountArea />} mobileAccount={<AccountArea />}>
      {children}
    </AppShell>
  );
}

function AccountArea() {
  return (
    <Suspense fallback={<AccountPending />}>
      <AccountSlot />
    </Suspense>
  );
}

async function AccountSlot() {
  const user = await getOptionalUser();
  return <AccountFooter user={user} />;
}
