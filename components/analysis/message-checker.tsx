"use client";

import { useState, type FormEvent } from "react";
import { ResultPanel } from "@/components/analysis/result-panel";
import { Button } from "@/components/ui/button";
import { MESSAGE_CATEGORIES, type AnalysisResult, type MessageCategory } from "@/lib/analysis/types";

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
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch("/api/analyze/message", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text, category }),
      });
      const payload = (await response.json()) as AnalysisResult & { error?: string };
      if (!response.ok) {
        setError(payload.error || "The message could not be checked.");
        return;
      }
      setResult(payload);
    } catch {
      setError("The check could not reach the server. Try again.");
    } finally {
      setLoading(false);
    }
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
            onChange={(event) => setText(event.target.value)}
            required
            maxLength={4000}
            rows={compact ? 5 : 8}
            placeholder="Paste only the part you want checked. Leave out passwords and identity numbers."
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
          <p className="mt-2 text-sm text-muted">Other categories are still checked, so a different risk is not ignored.</p>
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Checking…" : "Check this message"}
        </Button>
        {error ? (
          <p role="alert" className="text-sm font-semibold text-danger">
            {error}
          </p>
        ) : null}
      </form>
      {result ? (
        <ResultPanel
          result={result}
          sourceText={text}
          signedIn={signedIn}
          resetHref="/check-message"
          resetLabel="Check another message"
          onReset={() => {
            setResult(null);
            setText("");
          }}
        />
      ) : null}
    </div>
  );
}
