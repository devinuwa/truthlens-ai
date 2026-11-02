import Link from "next/link";
import { BrandLink } from "@/components/brand/mark";
import { getOptionalUser } from "@/lib/auth/current-user";

export async function SiteHeader() {
  const user = await getOptionalUser();
  return (
    <header className="sticky top-0 z-30 border-b border-ink/5 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <div className="shrink-0">
          <BrandLink />
        </div>
        <nav aria-label="Primary" className="flex items-center justify-end gap-1 text-sm font-semibold">
          <Link href="/#check" className="hidden rounded-2xl px-3 py-2 hover:bg-canvas sm:inline">Check</Link>
          <Link href="/academy" className="rounded-2xl px-2 py-2 hover:bg-canvas sm:px-3">Academy</Link>
          <Link href="/opportunities" className="hidden rounded-2xl px-3 py-2 hover:bg-canvas md:inline">Opportunities</Link>
          {user ? (
            <Link href="/home" className="rounded-2xl bg-primary px-3 py-2 text-white hover:bg-primary-dark">Open app</Link>
          ) : (
            <>
              <Link href="/login" className="rounded-2xl px-2 py-2 hover:bg-canvas sm:px-3">Sign in</Link>
              <Link href="/signup" className="rounded-2xl bg-primary px-3 py-2 text-white hover:bg-primary-dark">Sign up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
