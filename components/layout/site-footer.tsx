import Link from "next/link";

const links = [
  { href: "/#check", label: "Check" },
  { href: "/academy", label: "Academy" },
  { href: "/opportunities", label: "Opportunities" },
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "https://github.com/devinuwa/truthlens-ai/issues", label: "Contact" },
  { href: "https://github.com/devinuwa/truthlens-ai", label: "GitHub" },
  { href: "https://github.com/devinuwa/truthlens-ai/blob/main/LICENSE", label: "MIT licence" },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 text-sm text-muted sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-extrabold text-primary">TruthLens</p>
          <p className="mt-2 max-w-sm">© 2026 devinuwa. TruthLens AI is open source under the MIT licence.</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-4 gap-y-2 font-semibold">
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
