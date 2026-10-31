"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { PublicLesson } from "@/lib/academy/curriculum";

type Feedback = {
  score: number;
  total: number;
  passed: boolean;
  correct: boolean[];
  explanations: string[];
  stored: boolean;
  note: string;
  nextSlug: string | null;
  nextTitle: string | null;
};

export function LessonPlayer({
  lesson,
  signedIn,
  passPercent,
  previous,
  nextLockedTitle,
}: {
  lesson: PublicLesson;
  signedIn: boolean;
  passPercent: number;
  previous: { slug: string; title: string } | null;
  nextLockedTitle: string | null;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<number[]>(lesson.questions.map(() => -1));
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function finish() {
    if (answers.some((answer) => answer < 0)) {
      setNote("Answer every question first.");
      return;
    }
    setBusy(true);
    setNote("");
    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ lessonSlug: lesson.slug, answers }),
      });
      const payload = (await response.json()) as Feedback & { error?: string };
      if (!response.ok) {
        setNote(payload.error ?? "The quiz could not be marked.");
        return;
      }
      setFeedback(payload);
      if (payload.stored) router.refresh();
    } finally {
      setBusy(false);
    }
  }

  function retry() {
    setFeedback(null);
    setAnswers(lesson.questions.map(() => -1));
    setNote("");
  }

  return (
    <article className="space-y-5">
      <nav aria-label="Lesson" className="flex flex-wrap gap-3 text-sm">
        {previous ? (
          <Link className="font-semibold text-primary" href={`/academy/${previous.slug}`}>
            Previous: {previous.title}
          </Link>
        ) : null}
      </nav>
      {lesson.sections.map((section) => (
        <section key={section.heading} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-ink/5">
          <h2 className="text-xl font-bold">{section.heading}</h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph} className="mt-3 text-sm leading-6">
              {paragraph}
            </p>
          ))}
          {section.example ? (
            <p className="mt-3 rounded-2xl bg-sun/50 p-3 text-sm">
              <span className="font-semibold">Example: </span>
              {section.example}
            </p>
          ) : null}
        </section>
      ))}
      <a href="#quiz" className="inline-flex min-h-11 items-center rounded-full bg-primary px-4 font-semibold text-white">
        Take quiz
      </a>
      <section id="quiz" className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-ink/5">
        <h2 className="text-xl font-bold">Quiz</h2>
        <p className="mt-2 text-sm text-muted">A score of {passPercent}% opens the next lesson. You can try again if you miss it.</p>
        <ol className="mt-4 space-y-5">
          {lesson.questions.map((question, questionIndex) => (
            <li key={question.prompt}>
              <fieldset disabled={feedback !== null}>
                <legend className="font-semibold">{question.prompt}</legend>
                <div className="mt-2 space-y-2">
                  {question.choices.map((choice, choiceIndex) => (
                    <label key={choice} className="flex min-h-11 items-center gap-3 rounded-2xl bg-canvas px-3 text-sm">
                      <input
                        type="radio"
                        name={`q-${questionIndex}`}
                        checked={answers[questionIndex] === choiceIndex}
                        onChange={() => {
                          const next = [...answers];
                          next[questionIndex] = choiceIndex;
                          setAnswers(next);
                        }}
                      />
                      {choice}
                    </label>
                  ))}
                </div>
              </fieldset>
              {feedback ? (
                <p className={`mt-2 text-sm ${feedback.correct[questionIndex] ? "text-teal" : "text-danger"}`}>
                  {feedback.correct[questionIndex] ? "Matched the safer choice." : "Not the safer choice."} {feedback.explanations[questionIndex]}
                </p>
              ) : null}
            </li>
          ))}
        </ol>
        {feedback ? (
          <div className="mt-4 space-y-3">
            <p className="font-semibold">
              {feedback.score} of {feedback.total}. {feedback.passed ? "That is a pass." : `That is below ${passPercent}%. The next lesson stays locked.`}
            </p>
            <p className="text-sm text-muted">{feedback.note}</p>
            {feedback.passed && feedback.nextSlug && feedback.nextTitle ? (
              <Link className="inline-flex min-h-11 items-center font-semibold text-primary" href={`/academy/${feedback.nextSlug}`}>
                Next: {feedback.nextTitle}
              </Link>
            ) : null}
            {!feedback.passed ? (
              <Button type="button" variant="secondary" onClick={retry}>
                Try the quiz again
              </Button>
            ) : null}
          </div>
        ) : (
          <Button type="button" className="mt-4" onClick={() => void finish()} disabled={busy}>
            {busy ? "Marking…" : "Submit quiz"}
          </Button>
        )}
        {note ? (
          <p className="mt-2 text-sm font-semibold text-danger" role="alert">
            {note}
          </p>
        ) : null}
        {!signedIn ? <p className="mt-3 text-sm text-muted">Sign in before you submit if you want this attempt saved. A guest score does not open the next lesson.</p> : null}
      </section>
      {nextLockedTitle ? <p className="text-sm text-muted">Next lesson: {nextLockedTitle}. It opens after you pass this quiz.</p> : null}
    </article>
  );
}
