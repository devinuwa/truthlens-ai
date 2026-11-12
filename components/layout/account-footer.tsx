import Link from "next/link";
import { LogOut, UserRound } from "lucide-react";
import type { SessionUser } from "@/lib/auth/current-user";

export function AccountPending() {
  return (
    <div className="rounded-2xl bg-canvas p-3 text-sm" aria-busy="true">
      <p className="font-semibold">Loading your account…</p>
    </div>
  );
}

export function AccountFooter({ user }: { user: SessionUser | null }) {
  if (!user) {
    return (
      <div className="rounded-2xl bg-canvas p-3 text-sm">
        <p className="flex items-center gap-2 font-semibold">
          <UserRound aria-hidden="true" size={16} /> Guest mode
        </p>
        <p className="mt-1 text-muted">You can try the checks. Sign in to save reports.</p>
        <Link href="/login" className="mt-2 inline-flex min-h-11 items-center font-semibold text-primary">
          Sign in
        </Link>
      </div>
    );
  }
  return (
    <div className="rounded-2xl bg-canvas p-3 text-sm">
      <p className="font-semibold">{user.displayName}</p>
      <p className="truncate text-muted">{user.email}</p>
      <form action="/auth/signout" method="post">
        <button type="submit" className="mt-2 inline-flex min-h-11 items-center gap-2 font-semibold text-primary">
          <LogOut aria-hidden="true" size={16} /> Sign out
        </button>
      </form>
    </div>
  );
}
