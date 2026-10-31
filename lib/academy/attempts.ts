import "server-only";
import { passRatio, type QuizAttemptRecord } from "@/lib/academy/progress";
import { createUserClient } from "@/lib/supabase/server";

export async function loadQuizAttempts(): Promise<{ records: QuizAttemptRecord[]; ratio: number }> {
  const ratio = passRatio();
  const supabase = await createUserClient();
  if (!supabase) return { records: [], ratio };
  const settings = await supabase.from("academy_settings").select("pass_ratio").eq("id", 1).maybeSingle();
  const rawRatio = settings.data?.pass_ratio;
  const parsedRatio = typeof rawRatio === "number" ? rawRatio : typeof rawRatio === "string" ? Number(rawRatio) : ratio;
  const storedRatio = Number.isFinite(parsedRatio) ? parsedRatio : ratio;
  const { data } = await supabase.from("quiz_attempts").select("lesson_slug, score, total, completed_at");
  const records = (data ?? []).map((row) => ({
    lessonSlug: String(row.lesson_slug),
    score: Number(row.score),
    total: Number(row.total),
    completedAt: String(row.completed_at),
  }));
  return { records, ratio: storedRatio > 0 && storedRatio <= 1 ? storedRatio : ratio };
}
