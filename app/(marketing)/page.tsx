import { BookOpen, GraduationCap, Link2, Search, Shield } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

const features = [
  {
    title: "Check messages",
    text: "Paste a chat or email and see which words look like a scam, a phishing request, pressure, or harassment.",
    icon: Search,
  },
  {
    title: "Inspect links",
    text: "Read the address itself. TruthLens does not open the website, download anything, or sign you in.",
    icon: Link2,
  },
  {
    title: "Find opportunities",
    text: "Browse sample scholarships and programmes with the source, the deadline, and a clear verification label.",
    icon: GraduationCap,
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-16">
      <section className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="inline-flex rounded-full bg-sky/30 px-3 py-1 text-sm font-semibold">For students and young internet users</p>
          <h1 className="mt-4 max-w-xl text-4xl font-bold tracking-tight sm:text-5xl">Think before you click. Stay smart online.</h1>
          <p className="mt-4 max-w-xl text-lg text-muted">
            TruthLens AI helps you notice warning signs in messages and links, then points you toward safer next steps and clearly labelled educational opportunities.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/check-message">Check a Message</ButtonLink>
            <ButtonLink href="/opportunities" variant="secondary">
              Explore Scholarships
            </ButtonLink>
          </div>
        </div>
        <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-ink/5">
          <div className="mx-auto flex h-44 w-44 items-center justify-center rounded-[2rem] bg-primary text-white">
            <Shield aria-hidden="true" size={96} strokeWidth={1.5} />
          </div>
          <p className="mt-4 text-center text-sm text-muted">A quiet result is not a promise that something is safe. Read the reasons.</p>
        </div>
      </section>

      <section className="mt-14 grid gap-4 md:grid-cols-3" aria-label="Features">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <article key={feature.title} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-ink/5">
              <Icon aria-hidden="true" className="text-primary" />
              <h2 className="mt-3 text-xl font-bold">{feature.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{feature.text}</p>
            </article>
          );
        })}
      </section>

      <section className="mt-14 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/5">
          <h2 className="text-2xl font-bold">How it works</h2>
          <ol className="mt-4 space-y-3 text-sm leading-6">
            <li><span className="font-semibold">1. Paste.</span> Add a message or a link. Leave out passwords and identity numbers.</li>
            <li><span className="font-semibold">2. Read the indicators.</span> Each warning explains the pattern that matched, in plain language.</li>
            <li><span className="font-semibold">3. Decide with a person you trust.</span> Use the next steps, and check official sources yourself when money or safety is involved.</li>
          </ol>
        </div>
        <aside className="rounded-3xl bg-sun/70 p-6">
          <BookOpen aria-hidden="true" />
          <h2 className="mt-3 text-xl font-bold">Safety tip</h2>
          <p className="mt-2 text-sm leading-6">
            If a message tells you to keep a secret from a parent or teacher, that is a reason to pause and tell a trusted adult. You will not be in trouble for asking.
          </p>
          <ButtonLink href="/academy" variant="secondary" className="mt-4 bg-white">
            Open the Academy
          </ButtonLink>
        </aside>
      </section>
    </div>
  );
}
