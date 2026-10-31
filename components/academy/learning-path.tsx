"use client";

import Link from "next/link";
import { Check, ChevronDown, Circle, LockKeyhole, RotateCcw } from "lucide-react";
import { useState } from "react";
import type { CourseProgress, LessonStatus } from "@/lib/academy/progress";
import { cn } from "@/lib/cn";

const statusLabel: Record<LessonStatus, string> = {
  available: "Available",
  in_progress: "In progress",
  completed: "Completed",
  locked: "Locked",
};

export function LearningPath({ progress, signedIn }: { progress: CourseProgress; signedIn: boolean }) {
  const openChapter = progress.chapters.find((chapter) => chapter.lessons.some((lesson) => lesson.slug === progress.next?.slug))?.slug
    ?? progress.chapters[0]?.slug
    ?? "";
  const [open, setOpen] = useState(openChapter);
  const passPercent = Math.round(progress.passRatio * 100);

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="order-2 lg:order-1">
        <p className="text-sm font-semibold text-primary">Digital Safety Academy</p>
        <h1 className="mt-1 text-3xl font-bold">Your Digital Safety Learning Path</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Work through the lessons in order. Pass a quiz at {passPercent}% to open the next one. The lessons explain warning signs. They do not replace a trusted adult when something feels serious.
        </p>
        <div className="mt-5 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-ink/5">
          <div className="flex items-end justify-between gap-3">
            <p className="font-semibold">Overall progress</p>
            <p className="text-sm text-muted">
              {progress.completed} / {progress.total} lessons completed
            </p>
          </div>
          <div
            className="mt-3 h-3 overflow-hidden rounded-full bg-canvas"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={progress.total}
            aria-valuenow={progress.completed}
            aria-label="Course progress"
          >
            <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${progress.percent}%` }} />
          </div>
          {!signedIn ? (
            <p className="mt-3 text-sm text-muted">
              You can open the first lesson now. <Link className="font-semibold text-primary" href="/signup">Create an account</Link> to save a pass and unlock the rest.
            </p>
          ) : null}
        </div>

        <ol className="mt-6 space-y-4">
          {progress.chapters.map((chapter, chapterIndex) => {
            const expanded = open === chapter.slug;
            const done = chapter.lessons.filter((lesson) => lesson.status === "completed").length;
            return (
              <li key={chapter.slug} className="rounded-3xl bg-white shadow-sm ring-1 ring-ink/5">
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-4 py-4 text-left"
                  aria-expanded={expanded}
                  onClick={() => setOpen(expanded ? "" : chapter.slug)}
                >
                  <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold", chapter.status === "locked" ? "bg-canvas text-muted" : "bg-primary/10 text-primary")}>
                    {chapterIndex + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold">{chapter.title}</span>
                    <span className="mt-0.5 block text-sm text-muted">
                      {done} / {chapter.lessons.length} lessons · {statusLabel[chapter.status]}
                    </span>
                  </span>
                  <ChevronDown aria-hidden="true" className={cn("shrink-0 text-muted transition-transform duration-200", expanded && "rotate-180")} />
                </button>
                {expanded ? (
                  <div className="border-t border-ink/5 px-4 py-4">
                    <p className="text-sm text-muted">{chapter.description}</p>
                    <ol className="mt-4 space-y-3 border-l-2 border-primary/20 pl-4">
                      {chapter.lessons.map((lesson) => (
                        <li key={lesson.slug} className="relative">
                          <LessonRow lesson={lesson} passPercent={passPercent} />
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>
      </div>

      <aside className="order-1 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-primary/20 lg:sticky lg:top-4 lg:order-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Next lesson</p>
        {progress.next ? (
          <>
            <h2 className="mt-2 text-xl font-bold">{progress.next.title}</h2>
            <p className="mt-1 text-sm text-muted">{progress.currentChapterTitle}</p>
            <p className="mt-3 text-sm leading-6">{progress.next.summary}</p>
            <p className="mt-2 text-sm text-muted">{progress.next.minutes} min read</p>
            <Link href={`/academy/${progress.next.slug}`} className="mt-4 inline-flex min-h-11 items-center rounded-full bg-primary px-4 font-semibold text-white">
              {progress.next.status === "in_progress" ? "Continue lesson" : "Open lesson"}
            </Link>
          </>
        ) : (
          <>
            <h2 className="mt-2 text-xl font-bold">You have finished this path</h2>
            <p className="mt-3 text-sm leading-6">
              Every lesson in this course has a passing quiz. That is practice with these examples. It is not a promise that every message you see later is safe.
            </p>
          </>
        )}
      </aside>
    </div>
  );
}

function LessonRow({
  lesson,
  passPercent,
}: {
  lesson: CourseProgress["chapters"][number]["lessons"][number];
  passPercent: number;
}) {
  const body = (
    <>
      <StatusIcon status={lesson.status} />
      <span className="min-w-0 flex-1">
        <span className="block font-semibold">{lesson.title}</span>
        <span className="mt-0.5 block text-sm text-muted">
          {statusLabel[lesson.status]}
          {lesson.bestScore !== null && lesson.bestTotal !== null ? ` · best ${lesson.bestScore}/${lesson.bestTotal}` : ""}
          {lesson.attempts > 0 ? ` · ${lesson.attempts} ${lesson.attempts === 1 ? "attempt" : "attempts"}` : ""}
        </span>
        {lesson.status === "locked" ? (
          <span className="mt-1 block text-sm text-muted">Pass the previous lesson at {passPercent}% to open this one.</span>
        ) : null}
      </span>
    </>
  );

  if (lesson.status === "locked") {
    return <div className="flex items-start gap-3 rounded-2xl bg-canvas/80 p-3 text-muted">{body}</div>;
  }

  return (
    <Link
      href={`/academy/${lesson.slug}`}
      className={cn(
        "flex items-start gap-3 rounded-2xl p-3 transition-colors duration-200",
        lesson.status === "available" || lesson.status === "in_progress" ? "bg-primary/5 ring-1 ring-primary/30" : "hover:bg-canvas",
      )}
      aria-current={lesson.status === "available" || lesson.status === "in_progress" ? "step" : undefined}
    >
      {body}
    </Link>
  );
}

function StatusIcon({ status }: { status: LessonStatus }) {
  const shell =
    status === "completed"
      ? "bg-teal/20 text-ink"
      : status === "in_progress"
        ? "bg-sun text-ink"
        : status === "locked"
          ? "bg-canvas text-muted"
          : "bg-primary/15 text-primary";
  const Icon = status === "completed" ? Check : status === "in_progress" ? RotateCcw : status === "locked" ? LockKeyhole : Circle;
  return (
    <span className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full", shell)}>
      <Icon aria-hidden="true" size={16} />
    </span>
  );
}
