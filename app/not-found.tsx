import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="mx-auto max-w-lg px-4 py-20">
      <h1 className="text-3xl font-bold">That page is not here</h1>
      <p className="mt-3 text-sm text-muted">The link may be old, or the record may have been removed.</p>
      <Link href="/" className="mt-4 inline-flex min-h-11 items-center font-semibold text-primary">
        Back to the start
      </Link>
    </main>
  );
}
