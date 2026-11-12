"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  FileText,
  FileUp,
  GraduationCap,
  House,
  Link2,
  Menu,
  Search,
  Settings,
  X,
} from "lucide-react";
import { Suspense, useEffect, useState, type MouseEvent, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { BrandLink } from "@/components/brand/mark";
import { ContentFallback } from "@/components/layout/content-fallback";
import { cn } from "@/lib/cn";

const items = [
  { href: "/home", label: "Home", icon: House },
  { href: "/check-message", label: "Check a Message", icon: Search },
  { href: "/check-link", label: "Check a Link", icon: Link2 },
  { href: "/check-file", label: "Check a File", icon: FileUp },
  { href: "/opportunities", label: "Scholarships & Opportunities", icon: GraduationCap },
  { href: "/reports", label: "My Reports", icon: FileText },
  { href: "/academy", label: "Digital Safety Academy", icon: BookOpen },
  { href: "/settings", label: "Settings", icon: Settings },
];

type ShellProps = {
  account: ReactNode;
  mobileAccount: ReactNode;
  children: ReactNode;
};

export function AppShell(props: ShellProps) {
  return (
    <Suspense fallback={<ShellFrame {...props} pathname={null} />}>
      <ShellWithPath {...props} />
    </Suspense>
  );
}

function ShellWithPath(props: ShellProps) {
  const pathname = usePathname();
  return <ShellFrame {...props} pathname={pathname} />;
}

function ShellFrame({
  account,
  mobileAccount,
  children,
  pathname,
}: ShellProps & { pathname: string | null }) {
  const [open, setOpen] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    setPendingPath(null);
    setShowSkeleton(false);
  }, [pathname]);

  useEffect(() => {
    if (!pendingPath) return;
    const timer = window.setTimeout(() => setShowSkeleton(true), 120);
    return () => window.clearTimeout(timer);
  }, [pendingPath]);

  function onClickCapture(event: MouseEvent<HTMLDivElement>) {
    if (event.metaKey || event.altKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    const anchor = (event.target as HTMLElement).closest("a");
    if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
    const href = anchor.getAttribute("href");
    if (!href || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("#")) return;
    const path = href.split(/[?#]/)[0] || "/";
    if (path === pathname) return;
    flushSync(() => {
      setPendingPath(path);
    });
  }

  const currentPath = pendingPath ?? pathname;
  const pendingLabel = currentPath
    ? items.find((item) => currentPath === item.href || currentPath.startsWith(`${item.href}/`))?.label
    : undefined;

  const nav = (
    <nav aria-label="Main" className="flex flex-1 flex-col gap-1">
      {items.map((item) => {
        const active = currentPath === item.href || (currentPath?.startsWith(`${item.href}/`) ?? false);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            onClick={() => setOpen(false)}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-full px-3 text-sm font-bold",
              active ? "bg-ink text-white" : "text-ink hover:bg-lilac",
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
    <div className="min-h-screen md:grid md:grid-cols-[280px_1fr]" onClickCapture={onClickCapture}>
      <aside className="hidden bg-white md:flex md:min-h-screen md:flex-col md:p-5">
        <div className="px-2 py-2">
          <BrandLink />
        </div>
        <div className="mt-6 flex flex-1 flex-col">{nav}</div>
        {account}
      </aside>
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between bg-white/80 px-4 py-3 backdrop-blur md:hidden">
          <BrandLink />
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-lilac"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          </button>
        </header>
        {open ? (
          <div id="mobile-nav" className="bg-white px-4 py-4 md:hidden">
            {nav}
            <div className="mt-4">{mobileAccount}</div>
          </div>
        ) : null}
        {pendingPath ? (
          <div className="h-1 w-full bg-primary/15" role="progressbar" aria-valuetext="Loading the next page">
            <div className="h-full w-1/2 animate-pulse bg-primary" />
          </div>
        ) : null}
        <main id="main" aria-busy={pendingPath ? true : undefined} className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">
          {showSkeleton ? <ContentFallback label={pendingLabel ?? "Loading"} /> : children}
        </main>
      </div>
    </div>
  );
}

