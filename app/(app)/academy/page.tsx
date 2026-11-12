import { Suspense } from "react";
import { KnowledgeBase } from "@/components/academy/knowledge-base";
import { LearningPath } from "@/components/academy/learning-path";
import { ContentFallback } from "@/components/layout/content-fallback";
import { loadQuizAttempts } from "@/lib/academy/attempts";
import { buildCourseProgress, passRatio } from "@/lib/academy/progress";
import { getOptionalUser } from "@/lib/auth/current-user";

export const metadata = { title: "Digital Safety Academy" };

export default function AcademyPage() {
  return (
    <div className="space-y-10">
      <KnowledgeBase />
      <Suspense fallback={<ContentFallback label="Your progress" />}>
        <AcademyContent />
      </Suspense>
    </div>
  );
}

async function AcademyContent() {
  const user = await getOptionalUser();
  const { records, ratio } = user ? await loadQuizAttempts() : { records: [], ratio: passRatio() };
  const progress = buildCourseProgress(records, ratio);
  return <LearningPath progress={progress} signedIn={Boolean(user)} />;
}
