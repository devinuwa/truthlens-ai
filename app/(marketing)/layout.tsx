import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { BrandLink } from "@/components/brand/mark";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

function HeaderFallback() {
  return (
    <header className="sticky top-0 z-30 border-b border-ink/5 bg-white/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <BrandLink />
        <nav aria-label="Primary" className="flex items-center justify-end gap-1 text-sm font-semibold">
          <Link href="/#check" className="hidden rounded-2xl px-3 py-2 hover:bg-canvas sm:inline">Check</Link>
          <Link href="/academy" className="rounded-2xl px-2 py-2 hover:bg-canvas sm:px-3">Academy</Link>
          <Link href="/login" className="rounded-2xl px-2 py-2 hover:bg-canvas sm:px-3">Sign in</Link>
          <Link href="/signup" className="rounded-2xl bg-primary px-3 py-2 text-white">Sign up</Link>
        </nav>
      </div>
    </header>
  );
}

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={<HeaderFallback />}>
        <SiteHeader />
      </Suspense>
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
