import Link from "next/link";
import { BrandLink } from "@/components/brand/mark";
import { getOptionalUser } from "@/lib/auth/current-user";

export async function SiteHeader() {
  const user = await getOptionalUser();
  return (
    <header className="sticky top-0 z-30 bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4">
        <div className="shrink-0">
          <BrandLink />
        </div>
        <nav aria-label="Primary" className="flex items-center justify-end gap-1 text-sm font-bold">
          <Link href="/#check" className="hidden rounded-full px-3 py-2 hover:bg-white sm:inline">Check</Link>
          <Link href="/academy" className="rounded-full px-2 py-2 hover:bg-white sm:px-3">Academy</Link>
          <Link href="/opportunities" className="hidden rounded-full px-3 py-2 hover:bg-white md:inline">Opportunities</Link>
          {user ? (
            <Link href="/home" className="rounded-full bg-ink px-4 py-2 text-white hover:bg-black">Open app</Link>
          ) : (
            <>
              <Link href="/login" className="rounded-full px-2 py-2 hover:bg-white sm:px-3">Sign in</Link>
              <Link href="/signup" className="rounded-full bg-ink px-4 py-2 text-white hover:bg-black">Sign up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
