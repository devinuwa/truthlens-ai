"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  FileText,
  GraduationCap,
  House,
  Link2,
  LogOut,
  Menu,
  Search,
  Settings,
  UserRound,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { BrandLink } from "@/components/brand/mark";
import type { SessionUser } from "@/lib/auth/current-user";
import { cn } from "@/lib/cn";

const items = [
  { href: "/home", label: "Home", icon: House },
  { href: "/check-message", label: "Check a Message", icon: Search },
  { href: "/check-link", label: "Check a Link", icon: Link2 },
  { href: "/opportunities", label: "Scholarships & Opportunities", icon: GraduationCap },
  { href: "/reports", label: "My Reports", icon: FileText },
  { href: "/academy", label: "Digital Safety Academy", icon: BookOpen },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ user, children }: { user: SessionUser | null; children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav aria-label="Main" className="flex flex-1 flex-col gap-1">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            onClick={() => setOpen(false)}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-2xl px-3 text-sm font-semibold",
              active ? "bg-primary text-white" : "text-ink hover:bg-canvas",
            )}
          >
            <Icon aria-hidden="true" size={18} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen md:grid md:grid-cols-[280px_1fr]">
      <aside className="hidden border-r border-ink/5 bg-card md:flex md:min-h-screen md:flex-col md:p-4">
        <div className="px-2 py-2">
          <BrandLink />
        </div>
        <div className="mt-6 flex flex-1 flex-col">{nav}</div>
        <AccountFooter user={user} />
      </aside>
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-ink/5 bg-card/95 px-4 py-3 backdrop-blur md:hidden">
          <BrandLink />
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-canvas"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          </button>
        </header>
        {open ? (
          <div id="mobile-nav" className="border-b border-ink/5 bg-card px-4 py-4 md:hidden">
            {nav}
            <div className="mt-4">
              <AccountFooter user={user} />
            </div>
          </div>
        ) : null}
        <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function AccountFooter({ user }: { user: SessionUser | null }) {
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
