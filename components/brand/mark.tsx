import Link from "next/link";
import { Shield } from "lucide-react";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 font-semibold text-ink">
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white shadow-sm">
        <Shield aria-hidden="true" size={22} />
      </span>
      {compact ? <span className="sr-only">TruthLens AI</span> : <span>TruthLens AI</span>}
    </span>
  );
}

export function BrandLink() {
  return (
    <Link href="/" className="rounded-2xl focus-visible:outline-offset-4">
      <BrandMark />
    </Link>
  );
}
