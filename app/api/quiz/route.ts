import { NextResponse } from "next/server";
import { loadQuizAttempts } from "@/lib/academy/attempts";
import { getLesson } from "@/lib/academy/lessons";
import { neighbourSlugs } from "@/lib/academy/curriculum";
import { canAccessLesson, isPassingScore, passRatio } from "@/lib/academy/progress";
import { getOptionalUser } from "@/lib/auth/current-user";
import { createUserClient } from "@/lib/supabase/server";
import { issueMessages, quizSubmitSchema } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send the quiz answers as JSON." }, { status: 400 });
  }
  const parsed = quizSubmitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: issueMessages(parsed.error)[0] ?? "Check the answers and try again." }, { status: 400 });
  }
  const lesson = getLesson(parsed.data.lessonSlug);
  if (!lesson || parsed.data.answers.length !== lesson.questions.length) {
    return NextResponse.json({ error: "That lesson quiz does not match." }, { status: 400 });
  }

  const user = await getOptionalUser();
  const { records, ratio } = user ? await loadQuizAttempts() : { records: [], ratio: passRatio() };
  if (!canAccessLesson(lesson.slug, records, ratio)) {
    return NextResponse.json({ error: "This lesson is still locked. Pass the previous quiz first." }, { status: 403 });
  }

  const correct = lesson.questions.map((question, index) => parsed.data.answers[index] === question.correctIndex);
  const score = correct.filter(Boolean).length;
  const total = lesson.questions.length;
  const passed = isPassingScore(score, total, ratio);
  const explanations = lesson.questions.map((question) => question.explanation);
  const next = neighbourSlugs(lesson.slug).next;
  const nextLesson = next ? getLesson(next) : undefined;

  if (!user) {
    return NextResponse.json({
      score,
      total,
      passed,
      correct,
      explanations,
      stored: false,
      note: "This score is not saved. Sign in and pass the quiz to open the next lesson.",
      nextSlug: null,
      nextTitle: null,
    });
  }

  const supabase = await createUserClient();
  if (!supabase) {
    return NextResponse.json({
      score,
      total,
      passed,
      correct,
      explanations,
      stored: false,
      note: "Accounts are not configured, so this score was not saved.",
      nextSlug: null,
      nextTitle: null,
    });
  }

  const rpc = await supabase.rpc("submit_academy_quiz", { p_slug: lesson.slug, p_answers: parsed.data.answers });
  if (!rpc.error) {
    const saved = readRpc(rpc.data);
    return NextResponse.json({
      score: saved?.score ?? score,
      total: saved?.total ?? total,
      passed: saved?.passed ?? passed,
      correct,
      explanations,
      stored: true,
      note: (saved?.passed ?? passed) ? "Saved. The next lesson is open." : "Saved. You can try the quiz again.",
      nextSlug: (saved?.passed ?? passed) ? nextLesson?.slug ?? null : null,
      nextTitle: (saved?.passed ?? passed) ? nextLesson?.title ?? null : null,
    });
  }

  if (!missingQuizFunction(rpc.error.message, rpc.error.code)) {
    if (rpc.error.message.toLowerCase().includes("locked")) {
      return NextResponse.json({ error: "This lesson is still locked. Pass the previous quiz first." }, { status: 403 });
    }
    return NextResponse.json({ error: "The score could not be saved." }, { status: 500 });
  }

  const inserted = await supabase.from("quiz_attempts").insert({
    user_id: user.id,
    lesson_slug: lesson.slug,
    score,
    total,
  });
  if (inserted.error) {
    return NextResponse.json({ error: "The score could not be saved." }, { status: 500 });
  }
  return NextResponse.json({
    score,
    total,
    passed,
    correct,
    explanations,
    stored: true,
    note: passed ? "Saved. The next lesson is open." : "Saved. You can try the quiz again.",
    nextSlug: passed ? nextLesson?.slug ?? null : null,
    nextTitle: passed ? nextLesson?.title ?? null : null,
  });
}

function readRpc(data: unknown): { score: number; total: number; passed: boolean } | null {
  const value = typeof data === "string" ? safeParse(data) : data;
  if (!value || typeof value !== "object") return null;
  const row = value as { score?: unknown; total?: unknown; passed?: unknown };
  if (typeof row.score !== "number" || typeof row.total !== "number" || typeof row.passed !== "boolean") return null;
  return { score: row.score, total: row.total, passed: row.passed };
}

function safeParse(value: string): unknown {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

function missingQuizFunction(message: string, code?: string): boolean {
  return code === "PGRST202" || message.includes("Could not find the function") || message.includes("schema cache");
}
