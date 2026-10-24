import { getMlUrl } from "@/lib/env";
import type { ModelNote } from "@/lib/analysis/types";

const UNAVAILABLE: ModelNote = {
  status: "unavailable",
  note: "The optional model service is not configured. This result uses the transparent checks only.",
};

export async function askMessageModel(text: string): Promise<ModelNote> {
  const base = getMlUrl();
  if (!base) return UNAVAILABLE;
  return callModel(base, "/analyze-message", { text });
}

export async function askUrlModel(url: string): Promise<ModelNote> {
  const base = getMlUrl();
  if (!base) return UNAVAILABLE;
  return callModel(base, "/analyze-url", { url });
}

async function callModel(base: string, path: string, body: Record<string, string>): Promise<ModelNote> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2500);
  try {
    const response = await fetch(new URL(path, base), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
      cache: "no-store",
    });
    if (!response.ok) {
      return {
        status: "error",
        note: "The model service did not answer successfully. The checks above still stand on their own.",
      };
    }
    const payload = (await response.json()) as Partial<ModelNote>;
    if (payload.status !== "scored" && payload.status !== "unavailable" && payload.status !== "error") {
      return { status: "error", note: "The model service returned a response this app could not use." };
    }
    return {
      status: payload.status,
      note: typeof payload.note === "string" ? payload.note : "The model service returned no explanation.",
      label: typeof payload.label === "string" ? payload.label : undefined,
      score: typeof payload.score === "number" ? payload.score : undefined,
    };
  } catch {
    return {
      status: "error",
      note: "The model service could not be reached. The checks above still stand on their own.",
    };
  } finally {
    clearTimeout(timer);
  }
}
