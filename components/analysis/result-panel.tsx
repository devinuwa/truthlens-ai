"use client";

import { CircleCheck, CircleHelp, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { ASSESSMENT_DISCLAIMER, type AnalysisResult, type RiskLevel } from "@/lib/analysis/types";

export function ResultPanel({
  result,
  sourceText,
  signedIn,
  resetHref,
  resetLabel,
  onReset,
  onRetry,
}: {
  result: AnalysisResult;
  sourceText: string;
  signedIn: boolean;
  resetHref: string;
  resetLabel: string;
  onReset: () => void;
  onRetry?: () => void;
}) {
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState("");
  const [storeSource, setStoreSource] = useState(false);
  const [label, setLabel] = useState("");

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
      {result.brief ? <MessageBrief result={result} onRetry={onRetry} /> : <LegacyResult result={result} />}

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

function MessageBrief({ result, onRetry }: { result: AnalysisResult; onRetry?: () => void }) {
  const brief = result.brief;
  if (!brief) return null;
  const tone = toneFor(brief.risk);
  const Icon = brief.risk === "high" ? TriangleAlert : brief.risk === "low" ? CircleCheck : CircleHelp;
  const facts = brief.evidence.filter((item) => item.kind === "fact");

  return (
    <>
      <div className={`rounded-3xl border p-5 ${tone.panel}`}>
        <div className="flex flex-wrap items-center gap-3">
          <Icon aria-hidden="true" className={tone.icon} />
          <h2 className="text-xl font-bold">{brief.riskLabel}</h2>
          <Badge tone={tone.badge}>{brief.classificationLabel}</Badge>
        </div>
        <p className="mt-3 text-base">{brief.verdict}</p>
        <p className="mt-2 text-sm text-muted">
          <span className="font-semibold text-ink">Confidence: {brief.confidence}.</span> {result.confidence.meaning}
        </p>
        <p className="mt-3 text-sm">{ASSESSMENT_DISCLAIMER}</p>
      </div>

      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-ink/5">
        <h3 className="font-bold">Why this assessment was made</h3>
        <p className="mt-2 text-sm">{brief.summary}</p>
        {brief.warningSigns.length > 0 ? (
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
            {brief.warningSigns.map((sign) => (
              <li key={sign}>{sign}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted">No warning request showed up in the wording. That is not a certificate of safety.</p>
        )}
      </section>

      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-ink/5">
        <h3 className="font-bold">Evidence in the message</h3>
        <p className="mt-1 text-sm text-muted">These lines are quotes or close excerpts from what you pasted. They are not a guess about the sender.</p>
        {facts.length === 0 ? (
          <p className="mt-3 text-sm">Nothing in the wording was strong enough to quote as a warning.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {facts.map((item) => (
              <li key={item.id} className="rounded-2xl bg-canvas p-4">
                <p className="font-semibold">{item.title}</p>
                <p className="mt-2 text-sm">{item.detail}</p>
                {item.quote ? (
                  <p className="mt-2 text-sm text-muted">
                    <span className="font-semibold text-ink">From the text: </span>
                    {item.quote}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-3xl border border-primary/20 bg-primary/5 p-5">
        <h3 className="font-bold">AI reading</h3>
        <p className="mt-1 text-sm text-muted">This is an interpretation. It is separate from the quotes above, and it does not change the risk level.</p>
        {result.model.status === "scored" ? (
          <p className="mt-3 text-sm">{result.model.note}</p>
        ) : (
          <div className="mt-3 space-y-3">
            <p className="text-sm font-semibold text-danger" role="alert">{result.model.note}</p>
            {onRetry ? (
              <Button type="button" variant="secondary" onClick={onRetry}>
                Try the reading again
              </Button>
            ) : null}
          </div>
        )}
        {brief.contextNote ? (
          <p className="mt-3 text-sm">
            <span className="font-semibold">From what you added: </span>
            {brief.contextNote}
          </p>
        ) : null}
      </section>

      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-ink/5">
        <h3 className="font-bold">What remains uncertain</h3>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
          {brief.missing.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-3xl bg-sky/15 p-5">
        <h3 className="font-bold">What you can do next</h3>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm">
          {brief.actions.map((action) => (
            <li key={action}>{action}</li>
          ))}
        </ol>
        <h4 className="mt-4 font-semibold">What to avoid</h4>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          {brief.avoid.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-ink/5">
        <h3 className="font-bold">How to check it yourself</h3>
        <p className="mt-1 text-sm text-muted">These are steps you can take. TruthLens has not verified the organisation.</p>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm">
          {brief.verification.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>
    </>
  );
}

function LegacyResult({ result }: { result: AnalysisResult }) {
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

  return (
    <>
      <div className="rounded-3xl border border-ink/10 bg-white p-5">
        <div className="flex flex-wrap items-center gap-3">
          <Icon aria-hidden="true" className={tone === "danger" ? "text-danger" : tone === "teal" ? "text-teal" : "text-ink"} />
          <h2 className="text-xl font-bold">{result.assessmentLabel}</h2>
          <Badge tone={tone === "danger" ? "danger" : tone === "teal" ? "teal" : "sun"}>{result.assessmentLabel}</Badge>
        </div>
        <p className="mt-3 text-sm text-muted">
          {result.confidence.level ? (
            <span className="font-semibold text-ink">Indicator strength: {result.confidence.level}. </span>
          ) : null}
          {result.confidence.meaning}
        </p>
      </div>
      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-ink/5">
        <h3 className="font-bold">What was noticed</h3>
        {result.indicators.length === 0 ? (
          <p className="mt-2 text-sm text-muted">None of the built-in warning patterns matched. That is not a certificate of safety.</p>
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
    </>
  );
}

function toneFor(risk: RiskLevel): { panel: string; icon: string; badge: "danger" | "sun" | "teal" | "sky" } {
  if (risk === "high") return { panel: "border-danger/30 bg-white", icon: "text-danger", badge: "danger" };
  if (risk === "medium") return { panel: "border-sun bg-white", icon: "text-ink", badge: "sun" };
  if (risk === "low") return { panel: "border-teal/40 bg-white", icon: "text-teal", badge: "teal" };
  return { panel: "border-ink/10 bg-white", icon: "text-ink", badge: "sky" };
}

function modelStatusLabel(status: AnalysisResult["model"]["status"]): string {
  if (status === "scored") return "Separate reading";
  if (status === "error") return "Could not be used";
  return "Not connected";
}
