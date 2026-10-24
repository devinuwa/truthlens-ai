import { notFound } from "next/navigation";
import { LessonPlayer } from "@/components/academy/lesson-player";
import { getLesson, LESSONS } from "@/lib/academy/lessons";
import { getOptionalUser } from "@/lib/auth/current-user";

export const instant = false;

export function generateStaticParams() {
  return LESSONS.map((lesson) => ({ slug: lesson.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: getLesson(slug)?.title ?? "Lesson" };
}

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) notFound();
  const user = await getOptionalUser();
  return (
    <div>
      <p className="text-sm font-semibold text-muted">{lesson.minutes} minute lesson</p>
      <h1 className="mt-1 text-3xl font-bold">{lesson.title}</h1>
      <p className="mt-2 text-sm text-muted">{lesson.summary}</p>
      <div className="mt-5">
        <LessonPlayer lesson={lesson} signedIn={Boolean(user)} />
      </div>
    </div>
  );
}
