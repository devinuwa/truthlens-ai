"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { scoreQuiz, type Lesson } from "@/lib/academy/lessons";

const STORAGE_KEY = "truthlens.lessonProgress";

export function LessonPlayer({ lesson, signedIn }: { lesson: Lesson; signedIn: boolean }) {
  const [answers, setAnswers] = useState<number[]>(lesson.questions.map(() => -1));
  const [submitted, setSubmitted] = useState(false);
  const [note, setNote] = useState("");

  const result = submitted ? scoreQuiz(lesson, answers) : null;

  async function finish() {
    if (answers.some((answer) => answer < 0)) {
      setNote("Answer every question first.");
      return;
    }
    const scored = scoreQuiz(lesson, answers);
    setSubmitted(true);
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}") as Record<string, number>;
    stored[lesson.slug] = scored.score;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    if (!signedIn) {
      setNote("Completed on this device. Sign in if you want the score stored on your account.");
      return;
    }
    const response = await fetch("/api/quiz", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ lessonSlug: lesson.slug, score: scored.score, total: scored.total }),
    });
    setNote(response.ok ? "Score saved to your account." : "The score is on this device, but it could not be saved to your account.");
  }

  return (
    <article className="space-y-5">
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
      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-ink/5">
        <h2 className="text-xl font-bold">Check your understanding</h2>
        <ol className="mt-4 space-y-5">
          {lesson.questions.map((question, questionIndex) => (
            <li key={question.prompt}>
              <fieldset>
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
              {result ? (
                <p className={`mt-2 text-sm ${result.correct[questionIndex] ? "text-teal" : "text-danger"}`}>
                  {result.correct[questionIndex] ? "Matched the safer choice." : "Not the safer choice."} {question.explanation}
                </p>
              ) : null}
            </li>
          ))}
        </ol>
        <Button type="button" className="mt-4" onClick={() => void finish()} disabled={submitted}>
          {submitted ? "Lesson checked" : "Check answers"}
        </Button>
        {result ? (
          <p className="mt-3 font-semibold">
            {result.score} of {result.total} safer choices. {result.score === result.total ? "Lesson complete." : "You can reread the lesson and try the ideas in real messages."}
          </p>
        ) : null}
        {note ? <p className="mt-2 text-sm text-muted">{note}</p> : null}
      </section>
    </article>
  );
}
