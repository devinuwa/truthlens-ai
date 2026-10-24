import Link from "next/link";
import { LESSONS } from "@/lib/academy/lessons";

export const metadata = { title: "Digital Safety Academy" };

export default function AcademyPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Digital Safety Academy</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Short lessons with a few questions. They explain warning signs. They do not replace a trusted adult when something feels serious.
      </p>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {LESSONS.map((lesson) => (
          <li key={lesson.slug} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-ink/5">
            <p className="text-xs font-semibold text-muted">{lesson.minutes} min</p>
            <h2 className="mt-1 text-lg font-bold">{lesson.title}</h2>
            <p className="mt-2 text-sm text-muted">{lesson.summary}</p>
            <Link href={`/academy/${lesson.slug}`} className="mt-3 inline-flex min-h-11 items-center font-semibold text-primary">
              Open lesson
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
