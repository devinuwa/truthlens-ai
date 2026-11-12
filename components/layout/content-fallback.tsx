export function ContentFallback({ label }: { label: string }) {
  return (
    <div aria-busy="true" className="space-y-4">
      <h1 className="text-3xl font-bold">{label}</h1>
      <p className="text-sm text-muted">Loading…</p>
      <div className="h-40 animate-pulse rounded-3xl bg-white shadow-sm ring-1 ring-ink/5" />
      <div className="h-24 animate-pulse rounded-3xl bg-white shadow-sm ring-1 ring-ink/5" />
    </div>
  );
}
