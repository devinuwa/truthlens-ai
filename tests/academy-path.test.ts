import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { curriculumLessons, everyListedLessonIsReal, orderedSlugs, toPublicLesson } from "@/lib/academy/curriculum";
import { getLesson, scoreQuiz } from "@/lib/academy/lessons";
import {
  buildCourseProgress,
  canAccessLesson,
  isPassingScore,
  lessonStatus,
  type QuizAttemptRecord,
} from "@/lib/academy/progress";

const ratio = 0.8;

function pass(slug: string, at = "2026-10-31T00:00:00.000Z"): QuizAttemptRecord {
  return { lessonSlug: slug, score: 3, total: 3, completedAt: at };
}

function fail(slug: string, at = "2026-10-31T00:00:00.000Z"): QuizAttemptRecord {
  return { lessonSlug: slug, score: 2, total: 3, completedAt: at };
}

describe("academy quiz gate", () => {
  it("uses the existing lessons and hides the answer key from the public lesson", () => {
    expect(everyListedLessonIsReal()).toBe(true);
    expect(orderedSlugs()).toHaveLength(8);
    const lesson = getLesson("spotting-phishing");
    expect(lesson).toBeTruthy();
    if (!lesson) return;
    const pub = JSON.stringify(toPublicLesson(lesson));
    expect(pub).not.toContain("correctIndex");
    expect(pub).not.toContain("explanation");
  });

  it("needs every answer right on a three-question quiz at 80 percent", () => {
    expect(isPassingScore(3, 3, ratio)).toBe(true);
    expect(isPassingScore(2, 3, ratio)).toBe(false);
    const lesson = getLesson("pressure-tactics");
    expect(lesson).toBeTruthy();
    if (!lesson) return;
    const correct = scoreQuiz(lesson, lesson.questions.map((question) => question.correctIndex));
    expect(isPassingScore(correct.score, correct.total, ratio)).toBe(true);
    const wrong = scoreQuiz(lesson, lesson.questions.map(() => 0));
    expect(isPassingScore(wrong.score, wrong.total, ratio)).toBe(false);
  });

  it("locks every lesson after the first until the previous quiz is passed", () => {
    expect(lessonStatus("pressure-tactics", [], ratio)).toBe("available");
    expect(canAccessLesson("spotting-phishing", [], ratio)).toBe(false);
    expect(lessonStatus("spotting-phishing", [fail("pressure-tactics")], ratio)).toBe("locked");
    expect(lessonStatus("pressure-tactics", [fail("pressure-tactics")], ratio)).toBe("in_progress");
    expect(canAccessLesson("spotting-phishing", [pass("pressure-tactics")], ratio)).toBe(true);
  });

  it("keeps a later failure from locking a lesson that was already passed", () => {
    const records = [pass("pressure-tactics", "2026-10-31T00:00:00.000Z"), fail("pressure-tactics", "2026-10-31T01:00:00.000Z")];
    expect(lessonStatus("pressure-tactics", records, ratio)).toBe("completed");
    expect(canAccessLesson("spotting-phishing", records, ratio)).toBe(true);
  });

  it("opens the next chapter only after the previous chapter is passed", () => {
    const progress = buildCourseProgress([pass("pressure-tactics")], ratio);
    expect(progress.completed).toBe(1);
    expect(progress.percent).toBe(13);
    expect(progress.next?.slug).toBe("spotting-phishing");
    expect(progress.chapters[0]?.status).toBe("completed");
    expect(progress.chapters[1]?.status).toBe("available");
    expect(progress.chapters[1]?.lessons[0]?.status).toBe("available");
    expect(progress.chapters[1]?.lessons[1]?.status).toBe("locked");
    expect(progress.chapters[2]?.status).toBe("locked");
  });

  it("counts attempts and the completion time from the saved records", () => {
    const records = [fail("pressure-tactics", "2026-10-31T00:00:00.000Z"), pass("pressure-tactics", "2026-10-31T02:00:00.000Z")];
    const progress = buildCourseProgress(records, ratio);
    const first = progress.chapters[0]?.lessons[0];
    expect(first?.attempts).toBe(2);
    expect(first?.completedAt).toBe("2026-10-31T02:00:00.000Z");
    expect(first?.bestScore).toBe(3);
  });

  it("stores the answer key in the database and rejects a direct score insert", () => {
    const sql = readFileSync("supabase/migrations/20261031100000_academy_path.sql", "utf8");
    expect(sql).toContain('raise exception \'locked\'');
    expect(sql).toContain('drop policy if exists "insert own quiz attempts"');
    expect(sql).toContain("revoke all on public.lesson_keys");
    expect(sql).toContain("0.8");
    for (const lesson of curriculumLessons()) {
      const key = lesson.questions.map((question) => question.correctIndex).join(", ");
      expect(sql).toContain(`'${lesson.slug}', array[${key}]`);
    }
  });
});
