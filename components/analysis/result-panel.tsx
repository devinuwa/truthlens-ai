"use client";

import { CircleCheck, CircleHelp, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import type { AnalysisResult } from "@/lib/analysis/types";

export function ResultPanel({
  result,
  sourceText,
  signedIn,
  resetHref,
  resetLabel,
  onReset,
}: {
  result: AnalysisResult;
  sourceText: string;
  signedIn: boolean;
  resetHref: string;
  resetLabel: string;
  onReset: () => void;
}) {
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState("");
  const [storeSource, setStoreSource] = useState(false);
  const [label, setLabel] = useState("");

  const tone =
    result.assessment === "suspicious_indicators_found"
      ? "danger"
      : result.assessment === "no_major_indicators"
        ? "teal"
        : "sun";
  const Icon =
    result.assessment === "suspicious_indicators_found"
      ? TriangleAlert
      : result.assessment === "no_major_indicators"
        ? CircleCheck
        : CircleHelp;

  async function saveReport() {
    setSaveState("saving");
    setSaveError("");
    const response = await fetch("/api/reports", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        kind: result.kind,
        label,
        category: result.focusCategory,
        assessment: result.assessment,
        assessmentLabel: result.assessmentLabel,
        confidenceLevel: result.confidence.level,
        indicators: result.indicators,
        recommendations: result.recommendedActions,
        limitations: result.limitations,
        storeSource,
        sourceText: storeSource ? sourceText : undefined,
      }),
    });
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setSaveError(payload?.error || "The report could not be saved.");
      setSaveState("error");
      return;
    }
    setSaveState("saved");
  }

  return (
    <div className="mt-6 space-y-4" aria-live="polite">
      <div className="rounded-3xl border border-ink/10 bg-white p-5">
        <div className="flex flex-wrap items-center gap-3">
          <Icon aria-hidden="true" className={tone === "danger" ? "text-danger" : tone === "teal" ? "text-teal" : "text-ink"} />
          <h2 className="text-xl font-bold">{result.assessmentLabel}</h2>
          <Badge tone={tone === "danger" ? "danger" : tone === "teal" ? "teal" : "sun"}>{result.assessmentLabel}</Badge>
        </div>
        {result.confidence.level ? (
          <p className="mt-3 text-sm text-muted">
            <span className="font-semibold text-ink">Indicator strength: {result.confidence.level}.</span>{" "}
            {result.confidence.meaning}
          </p>
        ) : (
          <p className="mt-3 text-sm text-muted">{result.confidence.meaning}</p>
        )}
      </div>

      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-ink/5">
        <h3 className="font-bold">What was noticed</h3>
        {result.indicators.length === 0 ? (
          <p className="mt-2 text-sm text-muted">
            None of the built-in warning patterns matched. That is not a certificate of safety.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {result.indicators.map((indicator) => (
              <li key={indicator.id} className="rounded-2xl bg-canvas p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{indicator.title}</p>
                  <Badge tone={indicator.strength === "strong" ? "coral" : indicator.strength === "moderate" ? "sun" : "sky"}>
                    {indicator.strength} signal
                  </Badge>
                </div>
                <p className="mt-2 text-sm">{indicator.explanation}</p>
                <p className="mt-2 text-sm text-muted">
                  <span className="font-semibold text-ink">From the text: </span>
                  {indicator.evidence}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-3xl bg-sky/15 p-5">
        <h3 className="font-bold">What you can do next</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">
          {result.recommendedActions.map((action) => (
            <li key={action}>{action}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-3xl bg-sun/40 p-5 text-sm">
        <h3 className="font-bold">Model note</h3>
        <p className="mt-2">
          {modelStatusLabel(result.model.status)}
          {typeof result.model.score === "number" ? ` · score ${result.model.score.toFixed(2)}` : ""}
          {result.model.label ? ` · ${result.model.label}` : ""}
        </p>
        <p className="mt-2">{result.model.note}</p>
        <p className="mt-3 text-muted">{result.limitations}</p>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="button" variant="secondary" onClick={onReset}>
          {resetLabel}
        </Button>
        <ButtonLink href={resetHref} variant="ghost">
          Open the full checker
        </ButtonLink>
      </div>

      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-ink/5">
        <h3 className="font-bold">Save report</h3>
        {signedIn ? (
          <form
            className="mt-3 space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              void saveReport();
            }}
          >
            <label className="block text-sm font-semibold" htmlFor="report-label">
              Short label
            </label>
            <input
              id="report-label"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              maxLength={80}
              placeholder="For example: scholarship chat"
              className="min-h-11 w-full rounded-2xl border border-ink/10 px-3"
            />
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                className="mt-1 h-5 w-5"
                checked={storeSource}
                onChange={(event) => setStoreSource(event.target.checked)}
              />
              <span>
                Also store a short excerpt of what I pasted. This is optional. The excerpt stays on your account until
                you delete the report. Leave this unticked to save only the result.
              </span>
            </label>
            <Button type="submit" disabled={saveState === "saving"}>
              {saveState === "saving" ? "Saving…" : "Save report"}
            </Button>
            {saveState === "saved" ? <p className="text-sm font-semibold text-teal">Saved to My Reports.</p> : null}
            {saveError ? (
              <p className="text-sm font-semibold text-danger" role="alert">
                {saveError}
              </p>
            ) : null}
          </form>
        ) : (
          <p className="mt-2 text-sm text-muted">
            Guest checks are not stored. <a className="font-semibold text-primary" href="/signup">Create an account</a>{" "}
            when you want a private history you can delete.
          </p>
        )}
      </section>
    </div>
  );
}

function modelStatusLabel(status: AnalysisResult["model"]["status"]): string {
  if (status === "scored") return "Separate reading";
  if (status === "error") return "Could not be used";
  return "Not connected";
}
