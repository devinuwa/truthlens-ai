import Link from "next/link";

const links = [
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "https://github.com/devinuwa/truthlens-ai", label: "GitHub" },
  { href: "https://github.com/devinuwa/truthlens-ai/blob/main/LICENSE", label: "MIT licence" },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-ink/5 bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 devinuwa. TruthLens AI is open source under the MIT licence.</p>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-4 gap-y-2">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-ink">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
