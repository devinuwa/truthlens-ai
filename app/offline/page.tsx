import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Offline" };

export default function OfflinePage() {
  return (
    <main id="main" className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-16">
      <p className="text-sm font-bold text-primary">TruthLens</p>
      <h1 className="mt-3 text-4xl font-extrabold tracking-tight">You are offline</h1>
      <p className="mt-4 text-sm leading-6 text-muted">
        Pages you already opened can still be read, including the cybersecurity lessons saved with the Academy. A new check, a quiz score, signing in, and saving a report need a connection.
      </p>
      <Link href="/" className="mt-6 inline-flex min-h-12 items-center font-bold text-primary">
        Back to the start
      </Link>
    </main>
  );
}
