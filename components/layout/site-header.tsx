import Link from "next/link";
import { BrandLink } from "@/components/brand/mark";

export function SiteHeader() {
  return (
    <header className="border-b border-ink/5 bg-card/80">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-3">
        <div className="shrink-0">
          <BrandLink />
        </div>
        <nav aria-label="Primary" className="flex flex-wrap items-center justify-end gap-1 text-sm font-semibold">
          <Link href="/#check" className="rounded-2xl px-3 py-2 hover:bg-canvas">Check</Link>
          <Link href="/academy" className="rounded-2xl px-3 py-2 hover:bg-canvas">Academy</Link>
          <Link href="/opportunities" className="hidden rounded-2xl px-3 py-2 hover:bg-canvas sm:inline">Opportunities</Link>
          <Link href="/login" className="rounded-2xl px-3 py-2 hover:bg-canvas">Sign in</Link>
          <Link href="/signup" className="rounded-2xl bg-primary px-3 py-2 text-white hover:bg-primary-dark">Sign up</Link>
        </nav>
      </div>
    </header>
  );
}
