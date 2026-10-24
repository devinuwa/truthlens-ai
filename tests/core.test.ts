import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { analyzeMessage } from "@/lib/analysis/message";
import { analyzeUrl, UrlRejectedError } from "@/lib/analysis/url";
import { scoreQuiz, getLesson } from "@/lib/academy/lessons";
import { filterOpportunities } from "@/lib/opportunities/filter";
import { SAMPLE_OPPORTUNITIES } from "@/lib/opportunities/sample-data";
import { ownedReportScope } from "@/lib/reports/repository";
import { resetRateLimits, takeRateLimit } from "@/lib/security/rate-limit";
import { safeNext } from "@/lib/security/safe-redirect";
import { isAdminEmail } from "@/lib/env";

describe("message analysis", () => {
  it("asks for more text when the message is too short to judge", () => {
    const result = analyzeMessage("hi");
    expect(result.assessment).toBe("insufficient_evidence");
    expect(result.indicators).toHaveLength(0);
    expect(result.assessmentLabel).toBe("Insufficient evidence");
  });

  it("stays quiet on an ordinary note and still refuses a safety certificate", () => {
    const result = analyzeMessage("The club meets on Thursday after school in the library. Bring your notebook.");
    expect(result.assessment).toBe("no_major_indicators");
    expect(result.limitations.toLowerCase()).toContain("safe");
  });

  it("explains a phishing and urgency pattern without calling it proven fraud", () => {
    const result = analyzeMessage(
      "Your account is suspended. Send the one-time code immediately or you will lose access.",
    );
    expect(result.assessment).toBe("suspicious_indicators_found");
    expect(result.indicators.map((item) => item.id)).toEqual(
      expect.arrayContaining(["credential-request", "account-threat", "urgency"]),
    );
    expect(result.confidence.level).not.toBeNull();
    expect(result.limitations.toLowerCase()).toContain("not proof");
  });

  it("flags a fee attached to an unexpected scholarship", () => {
    const result = analyzeMessage("You have been selected for a scholarship. Pay the processing fee today.");
    expect(result.indicators.some((item) => item.category === "fake_opportunity" || item.id === "payment-request")).toBe(true);
  });

  it("hides abusive wording in the evidence line", () => {
    const result = analyzeMessage("You are stupid and I will hurt you if you tell the teacher.");
    const insult = result.indicators.find((item) => item.id === "insult");
    expect(insult?.evidence.toLowerCase()).not.toContain("stupid");
    expect(result.indicators.some((item) => item.id === "threat")).toBe(true);
  });
});

describe("url analysis", () => {
  it("rejects non-web schemes before any fetch could happen", () => {
    expect(() => analyzeUrl("javascript:alert(1)")).toThrow(UrlRejectedError);
    expect(() => analyzeUrl("file:///C:/Windows/win.ini")).toThrow(UrlRejectedError);
  });

  it("flags a private address and does not describe the site as visited", () => {
    const result = analyzeUrl("http://127.0.0.1/admin");
    expect(result.indicators.some((item) => item.id === "private-host")).toBe(true);
    expect(result.limitations.toLowerCase()).toContain("not visited");
    expect(result.recommendedActions.join(" ").toLowerCase()).toContain("did not open");
  });

  it("flags a lookalike brand domain", () => {
    const result = analyzeUrl("https://accounts.google.com.secure-login.example.net/verify");
    expect(result.indicators.some((item) => item.id === "brand-google")).toBe(true);
    expect(result.assessment).toBe("suspicious_indicators_found");
  });

  it("flags a digit-swapped brand spelling without calling it confirmed fraud", () => {
    const result = analyzeUrl("http://paypa1-secure.login.example.com/verify");
    const lookalike = result.indicators.find((item) => item.id === "brand-lookalike-paypal");
    expect(lookalike?.strength).toBe("strong");
    expect(lookalike?.explanation.toLowerCase()).toContain("not proof");
    expect(result.assessment).toBe("suspicious_indicators_found");
  });

  it("does not treat the official brand domain as a lookalike", () => {
    const result = analyzeUrl("https://www.paypal.com/");
    expect(result.indicators.some((item) => item.id.startsWith("brand"))).toBe(false);
  });

  it("does not invent a threat for a plain https address", () => {
    const result = analyzeUrl("https://example.com/about");
    expect(result.assessment).toBe("no_major_indicators");
  });

  it("rejects a broken address", () => {
    expect(() => analyzeUrl("not a link")).toThrow(UrlRejectedError);
  });
});

describe("opportunities", () => {
  it("filters demonstration records and keeps them labelled as samples", () => {
    expect(SAMPLE_OPPORTUNITIES.every((item) => item.isSample)).toBe(true);
    expect(SAMPLE_OPPORTUNITIES.some((item) => item.verificationStatus === "official_checked")).toBe(false);
    const nigeria = filterOpportunities(SAMPLE_OPPORTUNITIES, { region: "Nigeria", timing: "open" }, "2026-10-24");
    expect(nigeria.every((item) => item.region === "Nigeria")).toBe(true);
    expect(nigeria.some((item) => item.deadline && item.deadline < "2026-10-24")).toBe(false);
  });
});

describe("academy scoring", () => {
  it("counts only the marked safer choice", () => {
    const lesson = getLesson("spotting-phishing");
    expect(lesson).toBeTruthy();
    if (!lesson) return;
    const correct = scoreQuiz(
      lesson,
      lesson.questions.map((question) => question.correctIndex),
    );
    expect(correct.score).toBe(lesson.questions.length);
    const wrong = scoreQuiz(lesson, lesson.questions.map(() => 0));
    expect(wrong.score).toBeLessThan(lesson.questions.length);
  });
});

describe("access control helpers", () => {
  it("scopes a report delete to the signed-in user", () => {
    expect(ownedReportScope("user-a", "report-1").filters).toEqual({ user_id: "user-a", id: "report-1" });
    expect(() => ownedReportScope("")).toThrow();
  });

  it("allows only relative redirect targets", () => {
    expect(safeNext("/home")).toBe("/home");
    expect(safeNext("https://evil.example")).toBe("/home");
    expect(safeNext("//evil.example")).toBe("/home");
    expect(safeNext("/\\evil")).toBe("/home");
  });

  it("limits repeated checks", () => {
    resetRateLimits();
    for (let i = 0; i < 30; i += 1) expect(takeRateLimit("tester", 1_000).ok).toBe(true);
    expect(takeRateLimit("tester", 1_000).ok).toBe(false);
  });

  it("does not treat a stranger as an admin", () => {
    expect(isAdminEmail("student@example.com", ["teacher@example.com"])).toBe(false);
    expect(isAdminEmail("Teacher@Example.com", ["teacher@example.com"])).toBe(true);
  });
});

describe("security review of the repository text", () => {
  it("keeps private-table policies tied to the owner", () => {
    const sql = readFileSync("supabase/migrations/20261024120000_init.sql", "utf8");
    const chunks = sql.split(/create policy/i).slice(1);
    const privateTables = ["profiles", "analysis_reports", "saved_opportunities", "quiz_attempts"];
    for (const table of privateTables) {
      const blocks = chunks
        .filter((chunk) => chunk.toLowerCase().includes(`on public.${table} for`))
        .map((chunk) => chunk.split(";")[0]?.toLowerCase() ?? "");
      expect(blocks.length).toBeGreaterThan(0);
      for (const block of blocks) {
        expect(block).not.toContain("using (true)");
        expect(block).not.toContain("auth.uid() is not null");
        expect(block).toContain("auth.uid()");
      }
    }
    expect(sql).toContain("(select auth.uid()) = user_id");
    expect(sql).toContain("(select auth.uid()) = id");
    expect(sql).toContain("sample_not_marked_official");
    expect(sql).toContain("full_name");
  });

  it("does not fetch user-supplied urls from the checker", () => {
    const source = readFileSync("lib/analysis/url.ts", "utf8");
    expect(source).not.toContain("fetch(");
    expect(source).not.toContain("http.request");
  });

  it("does not put the service role key in client components", () => {
    const roots = ["app", "components"];
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) walk(path);
        else if (/\.(tsx|ts)$/.test(entry.name)) files.push(path);
      }
    };
    roots.forEach(walk);
    const clients = files.filter((file) => readFileSync(file, "utf8").includes('"use client"'));
    for (const file of clients) {
      const source = readFileSync(file, "utf8");
      expect(source).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
      expect(source).not.toContain("createAdminClient");
    }
  });
});
