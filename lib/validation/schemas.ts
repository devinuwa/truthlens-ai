import { z } from "zod";
import { MESSAGE_CATEGORIES } from "@/lib/analysis/types";

export const messageRequestSchema = z.object({
  text: z.string().trim().min(1, "Paste a message first.").max(4000, "That message is too long. Use 4000 characters or fewer."),
  category: z.enum(MESSAGE_CATEGORIES).default("auto"),
});

export const urlRequestSchema = z.object({
  url: z.string().trim().min(1, "Paste a link first.").max(2048, "That link is too long to check."),
});

export const reportSaveSchema = z.object({
  kind: z.enum(["message", "url"]),
  label: z.string().trim().max(80).optional(),
  category: z.string().trim().max(80),
  assessment: z.enum(["suspicious_indicators_found", "no_major_indicators", "insufficient_evidence"]),
  assessmentLabel: z.string().trim().min(1).max(80),
  confidenceLevel: z.enum(["low", "medium", "high"]).nullable(),
  indicators: z
    .array(
      z.object({
        id: z.string().max(80),
        category: z.string().max(80),
        title: z.string().max(160),
        explanation: z.string().max(600),
        evidence: z.string().max(180),
        strength: z.enum(["weak", "moderate", "strong"]),
      }),
    )
    .max(20),
  recommendations: z.array(z.string().max(400)).max(12),
  limitations: z.string().max(2000),
  storeSource: z.boolean().default(false),
  sourceText: z.string().max(4000).optional(),
});

export const displayNameSchema = z
  .string()
  .trim()
  .min(1, "Add a display name.")
  .max(40, "Use 40 characters or fewer.")
  .regex(/^[\p{L}\p{N} .'-]+$/u, "Use letters, numbers, and simple punctuation only.");

export const opportunityWriteSchema = z.object({
  title: z.string().trim().min(3).max(140),
  provider: z.string().trim().min(2).max(120),
  opportunityType: z.enum(["scholarship", "grant", "competition", "internship"]),
  region: z.string().trim().min(2).max(80),
  eligibility: z.string().trim().min(8).max(500),
  summary: z.string().trim().min(8).max(500),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  applicationUrl: z.string().url().max(300),
  sourceUrl: z.string().url().max(300),
  lastVerified: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  verificationStatus: z.enum(["official_checked", "not_yet_checked", "demonstration"]),
  isSample: z.boolean(),
});

export const quizSubmitSchema = z.object({
  lessonSlug: z.string().trim().min(1).max(80),
  score: z.number().int().min(0).max(20),
  total: z.number().int().min(1).max(20),
});

export function issueMessages(error: z.ZodError): string[] {
  return error.issues.map((issue) => issue.message);
}
