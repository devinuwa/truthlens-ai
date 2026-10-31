import { CHAPTERS, orderedSlugs } from "@/lib/academy/curriculum";
import { getLesson } from "@/lib/academy/lessons";

export const DEFAULT_PASS_RATIO = 0.8;

export type LessonStatus = "locked" | "available" | "in_progress" | "completed";

export type QuizAttemptRecord = {
  lessonSlug: string;
  score: number;
  total: number;
  completedAt: string;
};

export function passRatio(raw = process.env.ACADEMY_PASS_RATIO): number {
  if (!raw) return DEFAULT_PASS_RATIO;
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0 || value > 1) return DEFAULT_PASS_RATIO;
  return value;
}

export function isPassingScore(score: number, total: number, ratio = passRatio()): boolean {
  if (total <= 0 || score < 0 || score > total) return false;
  return score / total >= ratio;
}

export function attemptsFor(records: QuizAttemptRecord[], slug: string): QuizAttemptRecord[] {
  return records
    .filter((record) => record.lessonSlug === slug)
    .slice()
    .sort((a, b) => a.completedAt.localeCompare(b.completedAt));
}

export function lessonStatus(slug: string, records: QuizAttemptRecord[], ratio = passRatio()): LessonStatus {
  const order = orderedSlugs();
  const index = order.indexOf(slug);
  if (index < 0) return "locked";
  const earlier = order.slice(0, index);
  const earlierOpen = earlier.every((item) => attemptsFor(records, item).some((attempt) => isPassingScore(attempt.score, attempt.total, ratio)));
  if (!earlierOpen) return "locked";
  const mine = attemptsFor(records, slug);
  if (mine.some((attempt) => isPassingScore(attempt.score, attempt.total, ratio))) return "completed";
  if (mine.length > 0) return "in_progress";
  return "available";
}

export function canAccessLesson(slug: string, records: QuizAttemptRecord[], ratio = passRatio()): boolean {
  const status = lessonStatus(slug, records, ratio);
  return status === "available" || status === "in_progress" || status === "completed";
}

export type PathLesson = {
  slug: string;
  title: string;
  minutes: number;
  summary: string;
  status: LessonStatus;
  attempts: number;
  bestScore: number | null;
  bestTotal: number | null;
  completedAt: string | null;
};

export type PathChapter = {
  slug: string;
  title: string;
  description: string;
  status: LessonStatus;
  lessons: PathLesson[];
};

export type CourseProgress = {
  completed: number;
  total: number;
  percent: number;
  chapters: PathChapter[];
  next: PathLesson | null;
  currentChapterTitle: string | null;
  passRatio: number;
};

export function buildCourseProgress(records: QuizAttemptRecord[], ratio = passRatio()): CourseProgress {
  const chapters: PathChapter[] = CHAPTERS.map((chapter) => {
    const lessons = chapter.lessonSlugs.map((slug) => {
      const lesson = getLesson(slug);
      const mine = attemptsFor(records, slug);
      const passing = mine.filter((attempt) => isPassingScore(attempt.score, attempt.total, ratio));
      const best = mine.reduce<{ score: number; total: number } | null>((winner, attempt) => {
        if (!winner || attempt.score / attempt.total > winner.score / winner.total) {
          return { score: attempt.score, total: attempt.total };
        }
        return winner;
      }, null);
      return {
        slug,
        title: lesson?.title ?? slug,
        minutes: lesson?.minutes ?? 0,
        summary: lesson?.summary ?? "",
        status: lessonStatus(slug, records, ratio),
        attempts: mine.length,
        bestScore: best?.score ?? null,
        bestTotal: best?.total ?? null,
        completedAt: passing[0]?.completedAt ?? null,
      };
    });
    const statuses = lessons.map((lesson) => lesson.status);
    let status: LessonStatus = "available";
    if (statuses.every((item) => item === "locked")) status = "locked";
    else if (statuses.every((item) => item === "completed")) status = "completed";
    else if (statuses.some((item) => item === "in_progress" || item === "completed")) status = "in_progress";
    return {
      slug: chapter.slug,
      title: chapter.title,
      description: chapter.description,
      status,
      lessons,
    };
  });
  const flat = chapters.flatMap((chapter) => chapter.lessons);
  const completed = flat.filter((lesson) => lesson.status === "completed").length;
  const next = flat.find((lesson) => lesson.status === "available" || lesson.status === "in_progress") ?? null;
  const currentChapterTitle = next
    ? chapters.find((chapter) => chapter.lessons.some((lesson) => lesson.slug === next.slug))?.title ?? null
    : chapters.at(-1)?.title ?? null;
  return {
    completed,
    total: flat.length,
    percent: flat.length === 0 ? 0 : Math.round((completed / flat.length) * 100),
    chapters,
    next,
    currentChapterTitle,
    passRatio: ratio,
  };
}
