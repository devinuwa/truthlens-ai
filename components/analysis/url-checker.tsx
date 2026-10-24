"use client";

import { useState, type FormEvent } from "react";
import { ResultPanel } from "@/components/analysis/result-panel";
import { Button } from "@/components/ui/button";
import type { AnalysisResult } from "@/lib/analysis/types";

export function UrlChecker({ signedIn }: { signedIn: boolean }) {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch("/api/analyze/url", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const payload = (await response.json()) as AnalysisResult & { error?: string };
      if (!response.ok) {
        setError(payload.error || "The link could not be checked.");
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
          <label htmlFor="url-input" className="text-sm font-semibold">
            Paste the link
          </label>
          <input
            id="url-input"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            required
            maxLength={2048}
            inputMode="url"
            placeholder="https://"
            className="mt-2 min-h-11 w-full rounded-2xl border border-ink/10 bg-canvas px-3"
          />
          <p className="mt-2 text-sm text-muted">
            The link is not opened. Only its address is read for warning signs such as lookalike names, shorteners, and private-network addresses.
          </p>
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Checking…" : "Check this link"}
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
          sourceText={url}
          signedIn={signedIn}
          resetHref="/check-link"
          resetLabel="Check another link"
          onReset={() => {
            setResult(null);
            setUrl("");
          }}
        />
      ) : null}
    </div>
  );
}
