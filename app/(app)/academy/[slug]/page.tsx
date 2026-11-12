import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { LessonPlayer } from "@/components/academy/lesson-player";
import { ContentFallback } from "@/components/layout/content-fallback";
import { loadQuizAttempts } from "@/lib/academy/attempts";
import { isIntroLesson, neighbourSlugs, readingSlugs, toPublicLesson } from "@/lib/academy/curriculum";
import { getLesson } from "@/lib/academy/lessons";
import { canAccessLesson, passRatio } from "@/lib/academy/progress";
import { getOptionalUser } from "@/lib/auth/current-user";

export function generateStaticParams() {
  return readingSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: getLesson(slug)?.title ?? "Lesson" };
}

export default function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<ContentFallback label="Lesson" />}>
      <LessonContent params={params} />
    </Suspense>
  );
}

async function LessonContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) notFound();
  const user = await getOptionalUser();
  const { records, ratio } = user ? await loadQuizAttempts() : { records: [], ratio: passRatio() };
  const neighbours = neighbourSlugs(slug);
  const previous = neighbours.previous ? getLesson(neighbours.previous) : undefined;
  const next = neighbours.next ? getLesson(neighbours.next) : undefined;
  const intro = isIntroLesson(slug);
  const unlocked = intro || canAccessLesson(slug, records, ratio);

  if (!unlocked) {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/5">
        <p className="text-sm font-semibold text-muted">Locked lesson</p>
        <h1 className="mt-1 text-3xl font-bold">{lesson.title}</h1>
        <p className="mt-3 text-sm leading-6">
          {previous
            ? `This lesson opens after you pass “${previous.title}”. The passing score is ${Math.round(ratio * 100)}%.`
            : "This lesson is not open yet."}
          {!user ? " Sign in so a passing quiz can be saved on your account." : " A link to this page does not skip the quiz."}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link className="inline-flex min-h-11 items-center rounded-full bg-primary px-4 font-semibold text-white" href="/academy">
            Back to the path
          </Link>
          {previous ? (
            <Link className="inline-flex min-h-11 items-center font-semibold text-primary" href={`/academy/${previous.slug}`}>
              Go to {previous.title}
            </Link>
          ) : null}
          {!user ? (
            <Link className="inline-flex min-h-11 items-center font-semibold text-primary" href="/login?next=/academy">
              Sign in
            </Link>
          ) : null}
        </div>
      </div>
    );
  }

  const publicLesson = toPublicLesson(lesson);
  const nextOpen = next ? intro || isIntroLesson(next.slug) || canAccessLesson(next.slug, records, ratio) : false;

  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-sm text-muted">
        <Link className="font-semibold text-primary" href="/academy">
          Academy
        </Link>
        {" / "}
        {publicLesson.chapterTitle}
        {" / "}
        {lesson.title}
      </p>
      <p className="mt-3 text-sm font-semibold text-muted">{lesson.minutes} minute read</p>
      <h1 className="mt-1 text-3xl font-bold">{lesson.title}</h1>
      <p className="mt-2 text-sm leading-6 text-muted">{lesson.summary}</p>
      <section className="mt-4 rounded-3xl bg-sky/15 p-4">
        <h2 className="font-bold">In this lesson</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          {publicLesson.objectives.map((objective) => (
            <li key={objective}>{objective}</li>
          ))}
        </ul>
      </section>
      <div className="mt-5">
        <LessonPlayer
          lesson={publicLesson}
          signedIn={Boolean(user)}
          passPercent={Math.round(ratio * 100)}
          practiceOnly={intro}
          previous={previous ? { slug: previous.slug, title: previous.title } : null}
          nextLockedTitle={next && !nextOpen ? next.title : null}
        />
      </div>
    </div>
  );
}
