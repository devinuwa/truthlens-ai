import { connection } from "next/server";
import { LearningPath } from "@/components/academy/learning-path";
import { loadQuizAttempts } from "@/lib/academy/attempts";
import { buildCourseProgress, passRatio } from "@/lib/academy/progress";
import { getOptionalUser } from "@/lib/auth/current-user";

export const instant = false;
export const metadata = { title: "Digital Safety Academy" };

export default async function AcademyPage() {
  await connection();
  const user = await getOptionalUser();
  const { records, ratio } = user ? await loadQuizAttempts() : { records: [], ratio: passRatio() };
  const progress = buildCourseProgress(records, ratio);
  return <LearningPath progress={progress} signedIn={Boolean(user)} />;
}
