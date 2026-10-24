import Link from "next/link";
import { BrandLink } from "@/components/brand/mark";

export function SiteHeader() {
  return (
    <header className="border-b border-ink/5 bg-card/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <BrandLink />
        <nav aria-label="Account" className="flex items-center gap-2 text-sm font-semibold">
          <Link href="/login" className="rounded-2xl px-3 py-2 hover:bg-canvas">
            Sign in
          </Link>
          <Link href="/signup" className="rounded-2xl bg-primary px-3 py-2 text-white hover:bg-primary-dark">
            Sign up
          </Link>
        </nav>
      </div>
    </header>
  );
}
