import { NextResponse } from "next/server";
import { getOptionalUser } from "@/lib/auth/current-user";
import { getLesson } from "@/lib/academy/lessons";
import { createUserClient } from "@/lib/supabase/server";
import { issueMessages, quizSubmitSchema } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  const user = await getOptionalUser();
  if (!user) return NextResponse.json({ stored: false, note: "Sign in if you want this score saved to your account." });
  const supabase = await createUserClient();
  if (!supabase) return NextResponse.json({ stored: false, note: "Accounts are not configured yet." });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send the quiz result as JSON." }, { status: 400 });
  }
  const parsed = quizSubmitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: issueMessages(parsed.error)[0] ?? "That result could not be saved." }, { status: 400 });
  }
  const lesson = getLesson(parsed.data.lessonSlug);
  if (!lesson || parsed.data.total !== lesson.questions.length || parsed.data.score > parsed.data.total) {
    return NextResponse.json({ error: "That lesson result does not match the quiz." }, { status: 400 });
  }
  const { error } = await supabase.from("quiz_attempts").insert({
    user_id: user.id,
    lesson_slug: lesson.slug,
    score: parsed.data.score,
    total: parsed.data.total,
  });
  if (error) return NextResponse.json({ error: "The score could not be saved." }, { status: 500 });
  return NextResponse.json({ stored: true });
}
