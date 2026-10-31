import { gemmaModelId } from "@/lib/analysis/gemma";
import { applyModelReading } from "@/lib/analysis/message";
import {
  READING_SYSTEM,
  parseReading,
  providerFailure,
  readingNote,
  readingPrompt,
} from "@/lib/analysis/providers/reading";
import type { AnalysisResult, ModelNote } from "@/lib/analysis/types";
import { getGeminiApiKey, getGemmaModelOverride, getGroqApiKey, getGroqModelOverride } from "@/lib/env";

const GROQ_MODELS = new Set([
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "openai/gpt-oss-20b",
  "openai/gpt-oss-120b",
]);

const GROQ_DEFAULT = "llama-3.3-70b-versatile";

export function groqModelId(override?: string | null): string {
  const value = override?.trim() ?? "";
  return GROQ_MODELS.has(value) ? value : GROQ_DEFAULT;
}

export type ProviderChoice = "gemini" | "groq" | "rules";

export function chooseProvider(env: Record<string, string | undefined> = process.env): ProviderChoice {
  const requested = env.TRUTHLENS_AI_PROVIDER?.trim().toLowerCase();
  const gemini = Boolean(env.GEMINI_API_KEY?.trim());
  const groq = Boolean(env.GROQ_API_KEY?.trim());
  if (requested === "gemini") return gemini ? "gemini" : "rules";
  if (requested === "groq") return groq ? "groq" : "rules";
  if (gemini) return "gemini";
  if (groq) return "groq";
  return "rules";
}

export async function explainAnalysis(text: string, result: AnalysisResult): Promise<AnalysisResult> {
  const evidence = result.brief?.evidence.map((item) => item.title) ?? result.indicators.map((item) => item.title);
  const choice = chooseProvider();
  if (choice === "rules") {
    const requested = process.env.TRUTHLENS_AI_PROVIDER?.trim().toLowerCase();
    const note = requested === "groq"
      ? "Groq was selected, but no Groq API key is set on the server. The assessment above is from the built-in checks only."
      : requested === "gemini"
        ? "Gemini was selected, but no Gemini API key is set on the server. The assessment above is from the built-in checks only."
        : "No AI provider is configured. The assessment above is from the built-in checks only.";
    return applyModelReading(result, providerFailure("rules", note), null);
  }

  const model = choice === "gemini"
    ? await askGemini(text, evidence)
    : await askGroq(text, evidence);
  const interpretation = model.status === "scored" ? model.note : null;
  return applyModelReading(result, model, interpretation);
}

async function askGemini(text: string, evidence: string[]): Promise<ModelNote> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return providerFailure("rules", "No Gemini API key is set.");
  const modelId = gemmaModelId(getGemmaModelOverride());
  const payload = {
    systemInstruction: { parts: [{ text: READING_SYSTEM }] },
    contents: [{ role: "user", parts: [{ text: readingPrompt(text, evidence) }] }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 700,
      responseMimeType: "application/json",
      thinkingConfig: { thinkingLevel: "minimal" },
    },
  };
  let raw = await postJson(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent`,
    { "content-type": "application/json", "x-goog-api-key": apiKey },
    payload,
  );
  if (!raw.ok) {
    const { responseMimeType: _mime, ...generationConfig } = payload.generationConfig;
    raw = await postJson(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent`,
      { "content-type": "application/json", "x-goog-api-key": apiKey },
      { ...payload, generationConfig },
    );
  }
  if (!raw.ok) return providerFailure("gemini", "The Gemini reading did not come back. The assessment above is from the built-in checks only. You can try the reading again.");
  const textOut = geminiText(raw.body);
  const reading = textOut ? parseReading(textOut, text) : null;
  if (!reading) return providerFailure("gemini", "Gemini answered in a form this app could not use. The assessment above is from the built-in checks only. You can try the reading again.");
  return readingNote(reading, "gemini", modelId);
}

async function askGroq(text: string, evidence: string[]): Promise<ModelNote> {
  const apiKey = getGroqApiKey();
  if (!apiKey) return providerFailure("rules", "No Groq API key is set.");
  const modelId = groqModelId(getGroqModelOverride());
  const raw = await postJson(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    {
      model: modelId,
      temperature: 0.2,
      max_tokens: 700,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: READING_SYSTEM },
        { role: "user", content: readingPrompt(text, evidence) },
      ],
    },
  );
  if (!raw.ok) return providerFailure("groq", "The Groq reading did not come back. The assessment above is from the built-in checks only. You can try the reading again.");
  const textOut = groqText(raw.body);
  const reading = textOut ? parseReading(textOut, text) : null;
  if (!reading) return providerFailure("groq", "Groq answered in a form this app could not use. The assessment above is from the built-in checks only. You can try the reading again.");
  return readingNote(reading, "groq", modelId);
}

async function postJson(url: string, headers: Record<string, string>, body: unknown): Promise<{ ok: boolean; body: unknown }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25_000);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
      cache: "no-store",
    });
    if (!response.ok) return { ok: false, body: null };
    return { ok: true, body: await response.json() };
  } catch {
    return { ok: false, body: null };
  } finally {
    clearTimeout(timer);
  }
}

function geminiText(body: unknown): string {
  const payload = body as { candidates?: Array<{ content?: { parts?: Array<{ text?: string; thought?: boolean }> } }> };
  const parts = payload.candidates?.[0]?.content?.parts ?? [];
  return parts.filter((part) => part.thought !== true && typeof part.text === "string").map((part) => part.text).join("\n").trim();
}

function groqText(body: unknown): string {
  const payload = body as { choices?: Array<{ message?: { content?: string } }> };
  return payload.choices?.[0]?.message?.content?.trim() ?? "";
}
