import Link from "next/link";
import { Shield } from "lucide-react";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 font-extrabold tracking-tight text-primary">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-lilac text-primary">
        <Shield aria-hidden="true" size={22} />
      </span>
      {compact ? <span className="sr-only">TruthLens AI</span> : <span className="whitespace-nowrap">TruthLens</span>}
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
