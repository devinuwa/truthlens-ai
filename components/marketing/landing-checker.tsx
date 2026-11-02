"use client";

import { FileUp, Link2, MessageSquareText } from "lucide-react";
import { useEffect, useState, type DragEvent, type FormEvent, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { ResultPanel } from "@/components/analysis/result-panel";
import { Button } from "@/components/ui/button";
import type { AnalysisResult } from "@/lib/analysis/types";
import { BANK_OTP_EXAMPLE } from "@/lib/content/demo-message";
import { clientUploadIssue } from "@/lib/uploads/files";

const SCHOLARSHIP_EXAMPLE =
  "Congratulations! You have been shortlisted for a Federal Government scholarship. Pay N5000 processing fee today to secure your slot. Send payment to this personal account.";

type Tab = "message" | "url" | "file";

export function LoadExample({ label, text }: { label: string; text: string }) {
  return (
    <button
      type="button"
      className="mt-4 inline-flex min-h-11 items-center rounded-2xl bg-primary px-4 text-sm font-semibold text-white"
      onClick={() => {
        window.dispatchEvent(new CustomEvent("truthlens-example", { detail: { tab: "message", text } }));
      }}
    >
      {label}
    </button>
  );
}

const TABS: Tab[] = ["message", "url", "file"];

export function LandingChecker({
  signedIn,
  mode = "all",
  framed = true,
}: {
  signedIn: boolean;
  mode?: "all" | "file";
  framed?: boolean;
}) {
  const [tab, setTab] = useState<Tab>(mode === "file" ? "file" : "message");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [excerpt, setExcerpt] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    function onExample(event: Event) {
      const detail = (event as CustomEvent<{ tab?: Tab; text?: string; url?: string }>).detail;
      if (!detail) return;
      setTab(detail.tab ?? "message");
      if (detail.text) setText(detail.text);
      if (detail.url) setUrl(detail.url);
      setResult(null);
      setError("");
      document.getElementById("check")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    window.addEventListener("truthlens-example", onExample);
    return () => window.removeEventListener("truthlens-example", onExample);
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (tab === "message" && !text.trim()) {
      setError("Paste a message first.");
      return;
    }
    if (tab === "url" && !url.trim()) {
      setError("Paste a link first.");
      return;
    }
    if (tab === "file" && files.length === 0) {
      setError("Choose a PNG, JPG, WEBP, or PDF.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 55_000);
    try {
      const response = tab === "file" ? await sendFile(files, controller.signal) : await sendJson(tab, text, url, controller.signal);
      const raw = await response.text();
      let payload: (AnalysisResult & { error?: string; sourceExcerpt?: string }) | null = null;
      try {
        payload = JSON.parse(raw) as AnalysisResult & { error?: string };
      } catch {
        setError("The server sent a response this page could not read. Nothing was stored.");
        return;
      }
      if (!response.ok || !payload?.assessment) {
        setError(payload?.error || "The check could not be completed.");
        return;
      }
      setExcerpt(typeof payload.sourceExcerpt === "string" ? payload.sourceExcerpt : "");
      setResult(payload);
    } catch (caught) {
      const aborted = caught instanceof DOMException && caught.name === "AbortError";
      setError(aborted ? "The check took too long. You can try again." : "The check could not reach the server. You can try again.");
    } finally {
      window.clearTimeout(timer);
      setLoading(false);
    }
  }

  function addFiles(list: FileList | File[]) {
    const next = [...list].slice(0, 4);
    const issue = clientUploadIssue(next.map((file) => ({ name: file.name, type: file.type, size: file.size })));
    if (issue) {
      setError(issue);
      setFiles([]);
      return;
    }
    setError("");
    setFiles(next);
  }

  function onTabKey(event: ReactKeyboardEvent) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const index = TABS.indexOf(tab);
    const step = event.key === "ArrowRight" ? 1 : TABS.length - 1;
    chooseTab(TABS[(index + step) % TABS.length]);
  }

  function chooseTab(next: Tab) {
    setTab(next);
    setError("");
    setResult(null);
  }

  const sourceText = tab === "file" ? excerpt : tab === "url" ? url : text;
  const fullCheckerHref = tab === "url" ? "/check-link" : tab === "file" ? "/check-file" : "/check-message";
  const shell = framed
    ? "scroll-mt-24 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-ink/10 sm:p-6"
    : "scroll-mt-24";

  return (
    <div id="check" className={shell}>
      {mode === "all" ? (
        <div className="grid grid-cols-3 gap-2 rounded-2xl bg-canvas p-1" role="tablist" aria-label="What to check" onKeyDown={onTabKey}>
          <TabButton current={tab} id="message" icon={MessageSquareText} label="Message" onClick={chooseTab} />
          <TabButton current={tab} id="url" icon={Link2} label="Link" onClick={chooseTab} />
          <TabButton current={tab} id="file" icon={FileUp} label="File" onClick={chooseTab} />
        </div>
      ) : null}
      <form onSubmit={onSubmit} className={mode === "all" ? "mt-4 space-y-4" : "space-y-4"}>
        {tab === "message" ? (
          <div>
            <label htmlFor="landing-message" className="text-sm font-semibold">Paste a suspicious message</label>
            <textarea
              id="landing-message"
              value={text}
              onChange={(event) => setText(event.target.value)}
              maxLength={4000}
              rows={6}
              placeholder="Paste or type the message. Leave out passwords and identity numbers."
              className="mt-2 w-full rounded-2xl border border-ink/10 bg-canvas px-3 py-3 text-base"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              <ExampleButton label="Bank OTP example" onClick={() => setText(BANK_OTP_EXAMPLE)} />
              <ExampleButton label="Scholarship fee example" onClick={() => setText(SCHOLARSHIP_EXAMPLE)} />
            </div>
          </div>
        ) : null}
        {tab === "url" ? (
          <div>
            <label htmlFor="landing-url" className="text-sm font-semibold">Enter a website address</label>
            <input
              id="landing-url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              maxLength={2048}
              inputMode="url"
              placeholder="https://"
              className="mt-2 min-h-11 w-full rounded-2xl border border-ink/10 bg-canvas px-3"
            />
            <p className="mt-2 text-sm text-muted">The address is read for warning signs. The website is not opened.</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <ExampleButton label="Ordinary address" onClick={() => setUrl("https://example.com/about")} />
              <ExampleButton label="Shortened address" onClick={() => setUrl("https://bit.ly/truthlens-example")} />
            </div>
          </div>
        ) : null}
        {tab === "file" ? (
          <Dropzone files={files} onFiles={addFiles} />
        ) : null}
        <Button type="submit" disabled={loading}>
          {loading ? "Checking…" : "Check this"}
        </Button>
        {loading ? <p role="status" className="text-sm text-muted">Reading what you submitted. This can take a few seconds.</p> : null}
        {error ? <p role="alert" className="text-sm font-semibold text-danger">{error}</p> : null}
      </form>
      {result ? (
        <ResultPanel
          result={result}
          sourceText={sourceText}
          sourceKind={tab === "file" ? "file" : tab === "url" ? "url" : "message"}
          signedIn={signedIn}
          resetHref={mode === "file" ? "/check-message" : fullCheckerHref}
          fullCheckerLabel={mode === "file" ? "Check a pasted message" : "Open the full checker"}
          resetLabel="Clear this result"
          onReset={() => setResult(null)}
        />
      ) : null}
    </div>
  );
}

function TabButton({ current, id, label, icon: Icon, onClick }: {
  current: Tab;
  id: Tab;
  label: string;
  icon: typeof MessageSquareText;
  onClick: (id: Tab) => void;
}) {
  const selected = current === id;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-2 text-sm font-semibold ${selected ? "bg-white text-ink shadow-sm" : "text-muted"}`}
      onClick={() => onClick(id)}
    >
      <Icon aria-hidden="true" size={16} />
      {label}
    </button>
  );
}

function ExampleButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="min-h-11 rounded-full bg-canvas px-3 text-sm font-semibold text-primary">
      {label}
    </button>
  );
}

function Dropzone({ files, onFiles }: { files: File[]; onFiles: (files: FileList | File[]) => void }) {
  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    if (event.dataTransfer.files.length > 0) onFiles(event.dataTransfer.files);
  }
  return (
    <div>
      <label
        htmlFor="landing-file"
        onDragOver={(event) => event.preventDefault()}
        onDrop={onDrop}
        className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-primary/40 bg-canvas px-4 py-6 text-center"
      >
        <FileUp aria-hidden="true" className="text-primary" />
        <span className="mt-2 text-sm font-semibold">Drop a screenshot or PDF, or choose a file</span>
        <span className="mt-1 text-sm text-muted">PNG, JPG, or WEBP up to 5 MB. One PDF up to 10 MB and 5 pages. Up to 3 images.</span>
        <input
          id="landing-file"
          type="file"
          accept="image/png,image/jpeg,image/webp,application/pdf,.png,.jpg,.jpeg,.webp,.pdf"
          multiple
          className="sr-only"
          onChange={(event) => {
            if (event.target.files) onFiles(event.target.files);
          }}
        />
      </label>
      {files.length > 0 ? (
        <ul className="mt-2 text-sm">
          {files.map((file) => (
            <li key={`${file.name}-${file.size}`}>{file.name} · {Math.ceil(file.size / 1024)} KB</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

async function sendJson(tab: Tab, text: string, url: string, signal: AbortSignal) {
  if (tab === "url") {
    return fetch("/api/analyze/url", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url }),
      signal,
    });
  }
  return fetch("/api/analyze/message", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text, category: "auto" }),
    signal,
  });
}

async function sendFile(files: File[], signal: AbortSignal) {
  const body = new FormData();
  for (const file of files) body.append("files", file);
  return fetch("/api/analyze/upload", { method: "POST", body, signal });
}
