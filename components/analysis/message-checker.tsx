"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ResultPanel } from "@/components/analysis/result-panel";
import { Button } from "@/components/ui/button";
import {
  MESSAGE_CATEGORIES,
  type AnalysisContext,
  type AnalysisResult,
  type FollowUpId,
  type MessageCategory,
} from "@/lib/analysis/types";

const labels: Record<MessageCategory, string> = {
  auto: "Check everything",
  scam: "Scam language",
  phishing: "Phishing and passwords",
  fake_opportunity: "Fake scholarship or job",
  payment_or_personal_information: "Money or personal details",
  urgency: "Pressure and urgency",
  harassment: "Harassment",
  manipulation: "Manipulation",
};

const channelLabels: Record<NonNullable<AnalysisContext["channel"]>, string> = {
  sms: "A text message",
  whatsapp: "WhatsApp",
  email: "Email",
  social: "Social media",
  in_person: "In person",
  other: "Somewhere else",
  unknown: "I'm not sure",
};

export function MessageChecker({
  signedIn,
  compact = false,
  initialText = "",
}: {
  signedIn: boolean;
  compact?: boolean;
  initialText?: string;
}) {
  const [text, setText] = useState(initialText);
  const [category, setCategory] = useState<MessageCategory>("auto");
  const [context, setContext] = useState<AnalysisContext>({});
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result) resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [result]);

  async function checkMessage() {
    const trimmed = text.trim();
    if (!trimmed) {
      setError("Paste a message first.");
      setResult(null);
      return;
    }
    if (trimmed.length > 4000) {
      setError("That message is too long. Use 4000 characters or fewer.");
      return;
    }
    setLoading(true);
    setError("");
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 50_000);
    try {
      const response = await fetch("/api/analyze/message", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: trimmed, category, context }),
        signal: controller.signal,
      });
      const raw = await response.text();
      let payload: (AnalysisResult & { error?: string }) | null = null;
      try {
        payload = JSON.parse(raw) as AnalysisResult & { error?: string };
      } catch {
        setError("The server sent a response this page could not read. Your message is still in the box.");
        return;
      }
      if (!response.ok || !payload || !payload.assessment) {
        setError(payload?.error || "The message could not be checked. Your text is still in the box.");
        return;
      }
      setResult(payload);
    } catch (caught) {
      const aborted = caught instanceof DOMException && caught.name === "AbortError";
      setError(aborted
        ? "The check took too long. Your message is still in the box. Try again."
        : "The check could not reach the server. Your message is still in the box. Try again.");
    } finally {
      window.clearTimeout(timer);
      setLoading(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void checkMessage();
  }

  function setAnswer(id: FollowUpId, value: string) {
    setContext((current) => ({ ...current, [id]: value }));
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="message-text" className="text-sm font-semibold">
            Paste the message
          </label>
          <textarea
            id="message-text"
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setContext({});
            }}
            maxLength={4000}
            rows={compact ? 5 : 8}
            placeholder="Paste or type the message. Leave out passwords and identity numbers."
            className="mt-2 w-full rounded-2xl border border-ink/10 bg-canvas px-3 py-3 text-base"
          />
        </div>
        <div>
          <label htmlFor="message-category" className="text-sm font-semibold">
            What should we focus on?
          </label>
          <select
            id="message-category"
            value={category}
            onChange={(event) => setCategory(event.target.value as MessageCategory)}
            className="mt-2 min-h-11 w-full rounded-2xl border border-ink/10 bg-white px-3"
          >
            {MESSAGE_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {labels[item]}
              </option>
            ))}
          </select>
          <p className="mt-2 text-sm text-muted">Other checks still run, so a different risk is not ignored.</p>
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Checking…" : "Check this message"}
        </Button>
        {loading ? (
          <p role="status" className="text-sm text-muted">
            Checking the wording. A reading can take a few seconds. You can leave this page open.
          </p>
        ) : null}
        {error ? (
          <p role="alert" className="text-sm font-semibold text-danger">
            {error}
          </p>
        ) : null}
      </form>
      {result ? (
        <div ref={resultRef}>
          <ResultPanel
            result={result}
            sourceText={text}
            signedIn={signedIn}
            resetHref="/check-message"
            resetLabel="Check another message"
            onRetry={() => void checkMessage()}
            onReset={() => {
              setResult(null);
              setError("");
              setContext({});
            }}
          />
          {result.brief && result.brief.followUps.length > 0 ? (
            <form
              className="mt-4 space-y-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-ink/5"
              onSubmit={(event) => {
                event.preventDefault();
                void checkMessage();
              }}
            >
              <h3 className="font-bold">Add a detail that could change the reading</h3>
              <p className="text-sm text-muted">Answer only what you know. The message stays in the box.</p>
              {result.brief.followUps.map((question) => (
                <fieldset key={question.id} className="space-y-2">
                  <legend className="text-sm font-semibold">{question.question}</legend>
                  {question.id === "channel" ? (
                    <select
                      className="min-h-11 w-full rounded-2xl border border-ink/10 bg-white px-3"
                      value={context.channel ?? ""}
                      onChange={(event) => setAnswer("channel", event.target.value)}
                    >
                      <option value="">Choose one</option>
                      {Object.entries(channelLabels).map(([value, name]) => (
                        <option key={value} value={value}>{name}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {(["yes", "no", "unsure"] as const).map((value) => (
                        <label key={value} className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-canvas px-3 text-sm">
                          <input
                            type="radio"
                            name={question.id}
                            value={value}
                            checked={context[question.id] === value}
                            onChange={() => setAnswer(question.id, value)}
                          />
                          {value === "yes" ? "Yes" : value === "no" ? "No" : "I'm not sure"}
                        </label>
                      ))}
                    </div>
                  )}
                </fieldset>
              ))}
              <Button type="submit" disabled={loading}>
                {loading ? "Checking…" : "Update the check"}
              </Button>
            </form>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
