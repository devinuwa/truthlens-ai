import { describe, expect, it } from "vitest";
import { analyzeMessage } from "@/lib/analysis/message";
import { groqModelId, chooseProvider } from "@/lib/analysis/providers/explain";
import { parseReading } from "@/lib/analysis/providers/reading";
import { messageRequestSchema } from "@/lib/validation/schemas";
import type { CaseClassification, RiskLevel } from "@/lib/analysis/types";

const cases: Array<{ name: string; text: string; risk: RiskLevel; classification: CaseClassification }> = [
  { name: "bank otp reply", text: "URGENT: Your bank account will be suspended today. To reactivate it, reply with the OTP sent to your phone. Do not delay.", risk: "high", classification: "account_takeover" },
  { name: "bvn whatsapp", text: "WhatsApp message from Access Bank: send your BVN and the code we texted you or the account closes in 30 minutes.", risk: "high", classification: "account_takeover" },
  { name: "scholarship fee", text: "Congratulations! You have been shortlisted for a Federal Government scholarship. Pay N5000 processing fee today to secure your slot. Send payment to this personal account.", risk: "high", classification: "scholarship_scam" },
  { name: "job fee", text: "You have been selected for a UN job in Abuja. Pay the processing fee to this GTBank account before Friday or the offer goes to someone else.", risk: "high", classification: "job_recruitment_scam" },
  { name: "cbn transfer", text: "I am a CBN officer. Your account is flagged. Transfer the balance to the safe account I will send you.", risk: "high", classification: "impersonation" },
  { name: "password link", text: "Click http://bit.ly/access-login and enter your password to stop the debit.", risk: "high", classification: "phishing" },
  { name: "photo threat", text: "Send me a nude or I will share the photo with your school.", risk: "high", classification: "cyberbullying" },
  { name: "secrecy photo", text: "Don't tell your parents. Send the picture tonight. You are the only one I trust.", risk: "high", classification: "social_engineering" },
  { name: "prize fee", text: "You have won a car. Pay 15000 delivery fee to claim it. A gift card is also accepted.", risk: "high", classification: "advance_fee_fraud" },
  { name: "investment", text: "Send 20000 today and I will return 80000 tomorrow. It is guaranteed.", risk: "high", classification: "financial_fraud" },
  { name: "uniform fee", text: "The recruiter said pay for the medical test and the uniform before the interview. Use my personal account.", risk: "high", classification: "job_recruitment_scam" },
  { name: "airtime secret", text: "Your brother is in trouble. Send airtime now and do not tell your mum.", risk: "high", classification: "social_engineering" },
  { name: "shortlist only", text: "You have been shortlisted for a scholarship. Reply with your full name and school.", risk: "medium", classification: "social_engineering" },
  { name: "bank call", text: "Hi, this is your bank. Call me when you can.", risk: "medium", classification: "impersonation" },
  { name: "short link", text: "The form is here: https://bit.ly/sch-form", risk: "medium", classification: "malicious_link" },
  { name: "insult", text: "You are stupid and nobody likes you.", risk: "medium", classification: "cyberbullying" },
  { name: "grant later", text: "Congratulations, you have been selected for a grant. We will email the details later.", risk: "medium", classification: "social_engineering" },
  { name: "class dues", text: "Please pay the class dues of 2000 naira to the class captain today.", risk: "uncertain", classification: "suspicious_payment" },
  { name: "club", text: "The club meets on Thursday after school in the library. Bring your notebook.", risk: "low", classification: "apparently_low_risk" },
  { name: "waec", text: "Congratulations on your WAEC result. The school ceremony is Friday in the hall.", risk: "low", classification: "apparently_low_risk" },
  { name: "otp warning", text: "Access Bank will never ask for your OTP or password. If someone asks, do not send it.", risk: "low", classification: "apparently_low_risk" },
  { name: "free scholarship", text: "Federal scholarship applications are open. There is no fee. Use the board's website that you look up yourself. Do not pay anyone who messages you.", risk: "low", classification: "apparently_low_risk" },
  { name: "hiring", text: "We are hiring a junior assistant. Apply on the company careers page. No payment is required.", risk: "low", classification: "apparently_low_risk" },
  { name: "mum", text: "Hi mum, I'll be home by 6. Can you keep rice for me?", risk: "low", classification: "apparently_low_risk" },
  { name: "login code notice", text: "Your login code is on the way. Do not share it with anyone, including people who say they are from the bank.", risk: "low", classification: "apparently_low_risk" },
  { name: "interview", text: "The interview is Thursday at 10. Bring a pen. We do not charge candidates.", risk: "low", classification: "apparently_low_risk" },
  { name: "library", text: "Reminder: your library book is due Friday. There is no fee if you return it on time.", risk: "low", classification: "apparently_low_risk" },
  { name: "debit notice", text: "A debit of N2,000 was posted to your account. If this was not you, open the bank app you already use. This alert will not ask for an OTP.", risk: "low", classification: "apparently_low_risk" },
  { name: "salary notice", text: "Your salary has been paid into your account. This is only a notification. We will not ask you to send a code.", risk: "low", classification: "apparently_low_risk" },
  { name: "match", text: "Are you coming to the match after school tomorrow?", risk: "low", classification: "apparently_low_risk" },
  { name: "hi", text: "hi", risk: "uncertain", classification: "insufficient_evidence" },
  { name: "call scholarship", text: "Call me about the scholarship.", risk: "uncertain", classification: "insufficient_evidence" },
  { name: "send today", text: "Can you send it today?", risk: "uncertain", classification: "insufficient_evidence" },
  { name: "congratulations only", text: "Congratulations!", risk: "uncertain", classification: "insufficient_evidence" },
  { name: "please confirm", text: "Please confirm.", risk: "uncertain", classification: "insufficient_evidence" },
];

function counts(predictedPositive: boolean, expectedPositive: boolean) {
  return { tp: predictedPositive && expectedPositive, fp: predictedPositive && !expectedPositive, fn: !predictedPositive && expectedPositive, tn: !predictedPositive && !expectedPositive };
}

describe("message cases", () => {
  it("labels the practice set and reports agreement with those labels", () => {
    let tp = 0;
    let fp = 0;
    let fn = 0;
    let tn = 0;
    for (const item of cases) {
      const result = analyzeMessage(item.text);
      expect(result.brief?.risk, item.name).toBe(item.risk);
      expect(result.brief?.classification, item.name).toBe(item.classification);
      expect(result.limitations.toLowerCase()).toContain("cannot guarantee");
      const expectedPositive = item.risk === "high" || item.risk === "medium";
      const predictedPositive = result.brief?.risk === "high" || result.brief?.risk === "medium";
      const row = counts(predictedPositive, expectedPositive);
      tp += Number(row.tp);
      fp += Number(row.fp);
      fn += Number(row.fn);
      tn += Number(row.tn);
    }
    const precision = tp / (tp + fp);
    const recall = tp / (tp + fn);
    const specificity = tn / (tn + fp);
    expect(cases.length).toBeGreaterThanOrEqual(30);
    expect(precision).toBe(1);
    expect(recall).toBe(1);
    expect(fp / cases.length).toBe(0);
    expect(fn / cases.length).toBe(0);
    expect(specificity).toBe(1);
    expect((tp + tn) / cases.length).toBe(1);
  });

  it("does not treat a familiar sender as a reason to unlock a payment request", () => {
    const result = analyzeMessage(cases[0].text, "auto", undefined, { knowsSender: "yes" });
    expect(result.brief?.risk).toBe("high");
    expect(result.brief?.contextNote.toLowerCase()).toContain("copied");
  });

  it("tells someone who already paid to contact the bank through an official channel", () => {
    const result = analyzeMessage(cases[2].text, "auto", undefined, { alreadyPaid: "yes" });
    expect(result.brief?.risk).toBe("high");
    expect(result.recommendedActions.join(" ").toLowerCase()).toContain("bank");
  });

  it("can lower an unexpected shortlist when the student was already expecting it", () => {
    const result = analyzeMessage(cases[12].text, "auto", undefined, { expected: "yes" });
    expect(result.brief?.risk).toBe("low");
  });

  it("raises an unexpected shortlist when the student was not expecting it", () => {
    const result = analyzeMessage(cases[12].text, "auto", undefined, { expected: "no" });
    expect(result.brief?.risk).toBe("high");
  });

  it("rejects an empty message and a message over the limit", () => {
    expect(messageRequestSchema.safeParse({ text: "   ", category: "auto" }).success).toBe(false);
    expect(messageRequestSchema.safeParse({ text: "A real note.", category: "auto" }).success).toBe(true);
    expect(messageRequestSchema.safeParse({ text: "x".repeat(4001), category: "auto" }).success).toBe(false);
  });

  it("drops an AI reading that calls the message safe or invents a code", () => {
    const source = "Pay the processing fee today.";
    expect(parseReading('{"summary":"This message is completely safe.","interpretation":"Nothing to see."}', source)).toBeNull();
    expect(parseReading('{"summary":"It asks for a fee.","interpretation":"Send 99999 to account 123456."}', source)).toBeNull();
    const kept = parseReading('{"summary":"It asks for a fee today.","interpretation":"That combination is a reason to pause.","avoid":["Do not pay a stranger."],"verification":["Find the official page yourself."]}', source);
    expect(kept?.summary).toContain("fee");
  });

  it("keeps Groq on a current production model id", () => {
    expect(groqModelId("mixtral-8x7b-32768")).toBe("llama-3.3-70b-versatile");
    expect(groqModelId("llama-3.3-70b-versatile")).toBe("llama-3.3-70b-versatile");
    expect(chooseProvider({ GEMINI_API_KEY: "present" })).toBe("gemini");
    expect(chooseProvider({ GROQ_API_KEY: "present" })).toBe("groq");
    expect(chooseProvider({ TRUTHLENS_AI_PROVIDER: "groq" })).toBe("rules");
  });
});
