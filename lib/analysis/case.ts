import { analyzeUrl, UrlRejectedError } from "@/lib/analysis/url";
import {
  ASSESSMENT_DISCLAIMER,
  type AnalysisContext,
  type CaseClassification,
  type EvidenceItem,
  type FollowUpQuestion,
  type RiskLevel,
  type SafetyBrief,
} from "@/lib/analysis/types";

type Severity = "harmful" | "caution" | "note" | "protective";

type Hit = {
  id: string;
  severity: Severity;
  title: string;
  detail: string;
  quote: string;
  hint: CaseClassification;
};

const ADULT_HELP =
  "If this involves money, a password, a private photo, or a threat, tell a trusted adult or a teacher. Asking for help is the right step. You are not to blame.";

export function buildSafetyBrief(text: string, context?: AnalysisContext): SafetyBrief {
  const trimmed = text.trim();
  const hits = trimmed ? collectHits(trimmed) : [];
  const topics = topicFlags(trimmed);
  let risk = riskFrom(hits, trimmed.length);
  let classification = classificationFrom(hits, topics, risk);
  const notes: string[] = [];

  if (context?.alreadyPaid === "yes") {
    notes.push("You said money has already been sent.");
    if (risk === "low" || risk === "uncertain") risk = "medium";
  }
  if (context?.alreadySharedSecret === "yes") {
    notes.push("You said a code, password, or identity number was already shared.");
    risk = "high";
    if (classification === "apparently_low_risk" || classification === "insufficient_evidence") {
      classification = "account_takeover";
    }
  }
  if (context?.expected === "no" && topics.opportunity && risk === "medium" && !hits.some((hit) => hit.severity === "harmful")) {
    notes.push("You were not expecting this scholarship or job message.");
    risk = "high";
  }
  if (
    context?.expected === "yes" &&
    risk === "medium" &&
    !hits.some((hit) => hit.severity === "harmful") &&
    topics.opportunity
  ) {
    notes.push("You said you were already expecting this offer. The wording still needs an official page you find yourself.");
    risk = "low";
    classification = "apparently_low_risk";
  }
  if (context?.knowsSender === "yes" && (risk === "high" || risk === "medium")) {
    notes.push("A familiar name can be copied. Knowing the sender does not make a request for money, a code, or secrecy something to trust.");
  }
  if (context?.knowsSender === "no") {
    notes.push("You do not know the sender.");
  }
  if (context?.channel === "whatsapp") {
    notes.push("On WhatsApp, the display name can be changed to look like a bank, a school, or a friend.");
  }
  if (context?.channel === "sms") {
    notes.push("An SMS sender name can be faked. The name on the text is not proof of who sent it.");
  }
  if (context?.channel === "email" || context?.channel === "social") {
    notes.push("The place a message arrived is not proof the sender is the organisation they name.");
  }

  const evidence = hits.map(toEvidence);
  const warningSigns = hits.filter((hit) => hit.severity === "harmful" || hit.severity === "caution" || hit.severity === "note").map((hit) => hit.title);
  const missing = missingFor(trimmed, hits, topics, context);
  const actions = actionsFor(hits, topics, risk, context);
  const avoid = avoidFor(hits, topics);
  const verification = verificationFor(hits, topics);

  return {
    risk,
    riskLabel: riskLabel(risk),
    classification,
    classificationLabel: classificationLabel(classification),
    confidence: confidenceFor(hits, risk),
    verdict: verdictFor(risk, classification),
    summary: summaryFor(trimmed, hits, risk, classification),
    evidence,
    warningSigns,
    missing,
    contextNote: notes.join(" "),
    actions,
    avoid,
    verification,
    limitations: `${ASSESSMENT_DISCLAIMER} A matching pattern is a warning sign, not proof of who sent the message or what they will do. These checks did not contact the sender or open a link. A low risk reading is not a promise that the message is safe.`,
    followUps: followUpsFor(hits, topics, risk, context),
    interpretation: null,
    source: "rules",
  };
}

function collectHits(text: string): Hit[] {
  const hits: Hit[] = [];
  const credential = firstRequest(
    text,
    /\b(reply|send|share|forward|enter|type|provide|give|tell)\b[\s\S]{0,50}\b(otp|one[-\s]?time (?:code|password)|password|passcode|pin|bvn|nin|cvv|card number|verification code)\b/i,
  );
  const protectiveSecret = text.match(
    /\b(?:do not|don't|never)\s+(?:share|send|give|reply with|provide|tell)[\s\S]{0,40}\b(?:otp|password|passcode|pin|bvn|code)\b|\b(?:will not|won't|never)\s+ask\b[\s\S]{0,30}\b(?:otp|password|passcode|pin|bvn|code)\b/i,
  );
  if (credential) {
    hits.push({
      id: "credential-request",
      severity: "harmful",
      title: "It asks you to send a code, password, or identity number",
      detail: "A bank, school, or app can send you a code. They should not ask you to type that code into a chat or a page you opened from the message.",
      quote: clip(text, credential),
      hint: "account_takeover",
    });
  } else if (protectiveSecret) {
    hits.push({
      id: "protective-secret",
      severity: "protective",
      title: "It tells you not to share a code or password",
      detail: "That instruction is a protective one. It still does not prove the sender is the organisation named in the message.",
      quote: clip(text, protectiveSecret[0]),
      hint: "apparently_low_risk",
    });
  }

  const accountThreat = text.match(
    /\b(account|wallet)\b[\s\S]{0,40}\b(suspended|locked|blocked|compromised|restricted|flagged)\b|\b(suspended|locked|blocked)\b[\s\S]{0,30}\b(account|wallet)\b/i,
  );
  if (accountThreat) {
    hits.push({
      id: "account-threat",
      severity: "caution",
      title: "It says an account is in trouble",
      detail: "A real bank can warn you in its own app. A message that uses a lock or a suspension to hurry you is a common lure.",
      quote: clip(text, accountThreat[0]),
      hint: "phishing",
    });
  }

  const payment = paymentQuote(text);
  if (payment) {
    const aggravated = aggravatesPayment(text);
    hits.push({
      id: aggravated ? "payment-request" : "unspecified-payment",
      severity: aggravated ? "harmful" : "note",
      title: aggravated ? "It asks for a payment to unlock something or to move money" : "It mentions a payment without enough context",
      detail: aggravated
        ? "An upfront fee, a personal account, a gift card, or a transfer to 'keep an account safe' is a known harm pattern. A real school or employer can explain a charge on its own website."
        : "Some payments between people you know are real, such as class dues. This message does not give an official channel to check.",
      quote: clip(text, payment),
      hint: "suspicious_payment",
    });
  }

  const selection = text.match(
    /\b(you have been (?:shortlisted|selected)|you've been selected|you have won|you've won|claim your prize|selected as a winner)\b/i,
  );
  if (selection && !hits.some((hit) => hit.id === "payment-request")) {
    hits.push({
      id: "unexpected-selection",
      severity: "caution",
      title: "It says you were chosen or that you won",
      detail: "Being told you won, or that you were selected for something you do not remember applying for, is a reason to look up the organisation yourself.",
      quote: clip(text, selection[0]),
      hint: "social_engineering",
    });
  }

  const identity = text.match(
    /\b(i am|this is|we are)\b[\s\S]{0,40}\b(your bank|from (?:the |your )?bank|cbn|central bank|police|efcc|principal|federal government|a recruiter)\b/i,
  );
  if (identity) {
    hits.push({
      id: "impersonation-claim",
      severity: hits.some((hit) => hit.severity === "harmful") ? "note" : "caution",
      title: "The sender claims an official or trusted role",
      detail: "Anyone can type a title. The claim is not the same as proof of identity.",
      quote: clip(text, identity[0]),
      hint: "impersonation",
    });
  }

  const secrecy = text.match(
    /\b(don'?t tell (?:your )?(?:parents|mum|mom|dad|teacher|anyone)|keep (?:this|it)(?: a)? secret|this stays between us|do not tell your)\b/i,
  );
  if (secrecy) {
    hits.push({
      id: "secrecy",
      severity: "harmful",
      title: "It asks you to keep a secret from adults",
      detail: "A safe offer does not need you to hide it from a parent or a teacher. Secrecy is a way to isolate you.",
      quote: clip(text, secrecy[0]),
      hint: "social_engineering",
    });
  }

  const photo = text.match(/\b(send (?:me )?(?:a )?(?:photo|picture|pic|nude)|your nudes)\b/i);
  if (photo) {
    hits.push({
      id: "private-photo",
      severity: "harmful",
      title: "It asks for a private photo",
      detail: "Do not send personal or body photos to someone who pressures you. Tell a trusted adult. You will not be in trouble for asking for help.",
      quote: clip(text, photo[0], true),
      hint: "social_engineering",
    });
  }

  const threat = text.match(
    /\b(i will (?:hurt|beat|kill|find) you|i(?:'ll| will) (?:leak|share)|kill yourself|kys)\b/i,
  );
  if (threat) {
    hits.push({
      id: "threat",
      severity: "harmful",
      title: "It contains a threat",
      detail: "Stop replying. Keep a copy of the message somewhere private and tell a trusted adult. Do not meet the sender or try to argue with them.",
      quote: clip(text, threat[0], true),
      hint: "cyberbullying",
    });
  }

  const insult = text.match(/\byou (?:are|'re) (?:so )?(?:stupid|an idiot|a loser|worthless|dumb)\b/i);
  if (insult) {
    hits.push({
      id: "insult",
      severity: "caution",
      title: "It insults you",
      detail: "One rude message does not mean you did something wrong. You can leave the chat and tell someone you trust.",
      quote: clip(text, insult[0], true),
      hint: "cyberbullying",
    });
  }

  const urgency = text.match(
    /\b(urgent|immediately|right now|do not delay|last chance|final warning|within \d+ (?:minutes|hours)|expires? today|\btoday\b)\b/i,
  );
  if (urgency && hits.some((hit) => hit.severity === "harmful" || hit.severity === "caution")) {
    hits.push({
      id: "urgency",
      severity: "note",
      title: "It pushes you to act quickly",
      detail: "A short deadline is often there so you do not have time to ask someone. A real office can wait while you check.",
      quote: clip(text, urgency[0]),
      hint: "social_engineering",
    });
  }

  for (const link of text.match(/https?:\/\/[^\s)]+/gi) ?? []) {
    hits.push(...linkHits(link));
  }
  return hits;
}

function linkHits(link: string): Hit[] {
  try {
    const result = analyzeUrl(link);
    return result.indicators.slice(0, 2).map((indicator) => ({
      id: indicator.id,
      severity: indicator.strength === "strong" ? "harmful" : "caution",
      title: indicator.title,
      detail: `${indicator.explanation} The link was not opened.`,
      quote: link.slice(0, 160),
      hint: "malicious_link" as const,
    }));
  } catch (error) {
    if (error instanceof UrlRejectedError) {
      return [{
        id: "blocked-link",
        severity: "harmful",
        title: "The message contains a link type this app will not open",
        detail: error.message,
        quote: link.slice(0, 80),
        hint: "malicious_link",
      }];
    }
    return [];
  }
}

function paymentQuote(text: string): string | null {
  const direct = firstRequest(
    text,
    /\b(pay|send|transfer|deposit)\b[\s\S]{0,60}\b(fee|naira|₦|money|airtime|gift cards?|account|bitcoin|crypto)\b|\b(processing fee|registration fee|activation fee|delivery fee)\b|\b(send|pay|transfer)\b[\s\S]{0,24}\d[\d,]{2,}\b/i,
  );
  if (direct) return direct;
  if (!aggravatesPayment(text)) return null;
  return firstRequest(text, /\b(pay|send|transfer|deposit)\b[\s\S]{0,90}/i);
}

function aggravatesPayment(text: string): boolean {
  return /\b(scholarship|grant|job|interview|recruit|uniform|medical test|prize|lottery|inheritance|won|guaranteed|personal account|gift card|airtime|bitcoin|crypto|processing fee|registration fee|delivery fee|activation fee|safe account|secret)\b/i.test(text)
    || /\b(don'?t tell|do not tell)\b/i.test(text);
}

function firstRequest(text: string, pattern: RegExp): string | null {
  const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
  const global = new RegExp(pattern.source, flags);
  for (const match of text.matchAll(global)) {
    const index = match.index ?? 0;
    const before = text.slice(Math.max(0, index - 12), index);
    if (/\b(no|not|never|don't|dont|without)\b/i.test(before)) continue;
    if (/\b(no|not|never|don't|dont)\b/i.test(match[0])) continue;
    return match[0];
  }
  return null;
}

function topicFlags(text: string) {
  return {
    bank: /\b(bank|otp|bvn|cbn|opay|palmpay|gtbank|uba|zenith|access bank)\b/i.test(text),
    opportunity: /\b(scholarship|grant|job|interview|recruit|internship)\b/i.test(text),
    scholarship: /\b(scholarship|grant)\b/i.test(text),
    job: /\b(job|interview|recruit|uniform|hiring)\b/i.test(text),
    prize: /\b(prize|lottery|inheritance|you have won|you've won)\b/i.test(text),
    investment: /\b(guaranteed|profit|i will return|double your|invest)\b/i.test(text),
  };
}

function riskFrom(hits: Hit[], length: number): RiskLevel {
  if (hits.some((hit) => hit.severity === "harmful")) return "high";
  if (hits.some((hit) => hit.severity === "caution")) return "medium";
  if (hits.some((hit) => hit.id === "unspecified-payment")) return "uncertain";
  if (length < 40) return "uncertain";
  return "low";
}

function classificationFrom(hits: Hit[], topics: ReturnType<typeof topicFlags>, risk: RiskLevel): CaseClassification {
  if (risk === "low") return "apparently_low_risk";
  if (risk === "uncertain" && !hits.some((hit) => hit.id === "unspecified-payment")) return "insufficient_evidence";
  if (hits.some((hit) => hit.id === "threat" || hit.id === "insult")) return "cyberbullying";
  if (hits.some((hit) => hit.id === "private-photo" || hit.id === "secrecy")) return "social_engineering";
  if (hits.some((hit) => hit.id === "credential-request") && topics.bank) return "account_takeover";
  if (hits.some((hit) => hit.id === "credential-request")) return "phishing";
  if (hits.some((hit) => hit.id === "payment-request") && topics.scholarship) return "scholarship_scam";
  if (hits.some((hit) => hit.id === "payment-request") && topics.job) return "job_recruitment_scam";
  if (hits.some((hit) => hit.id === "payment-request") && topics.prize) return "advance_fee_fraud";
  if (hits.some((hit) => hit.id === "payment-request") && topics.investment) return "financial_fraud";
  if (hits.some((hit) => hit.id === "impersonation-claim") && hits.some((hit) => hit.id === "payment-request")) return "impersonation";
  if (hits.some((hit) => hit.id === "payment-request")) return "suspicious_payment";
  if (hits.some((hit) => hit.id === "unspecified-payment")) return "suspicious_payment";
  if (hits.some((hit) => hit.hint === "malicious_link")) return "malicious_link";
  if (hits.some((hit) => hit.id === "impersonation-claim")) return "impersonation";
  if (hits.some((hit) => hit.id === "unexpected-selection")) return "social_engineering";
  if (hits.some((hit) => hit.id === "account-threat")) return "phishing";
  return risk === "uncertain" ? "insufficient_evidence" : "apparently_low_risk";
}

function confidenceFor(hits: Hit[], risk: RiskLevel): "low" | "medium" | "high" {
  const strong = hits.filter((hit) => hit.severity === "harmful").length;
  if (risk === "uncertain") return "low";
  if (strong >= 2) return "high";
  if (strong === 1 || risk === "medium") return "medium";
  return "low";
}

function riskLabel(risk: RiskLevel): string {
  if (risk === "high") return "High risk";
  if (risk === "medium") return "Medium risk";
  if (risk === "low") return "Low risk";
  return "Uncertain";
}

function classificationLabel(classification: CaseClassification): string {
  const labels: Record<CaseClassification, string> = {
    phishing: "Phishing",
    financial_fraud: "Financial fraud",
    impersonation: "Impersonation",
    scholarship_scam: "Scholarship scam",
    job_recruitment_scam: "Job or recruitment scam",
    advance_fee_fraud: "Advance-fee fraud",
    suspicious_payment: "Suspicious payment request",
    account_takeover: "Account takeover attempt",
    malicious_link: "Misleading link",
    social_engineering: "Social engineering",
    cyberbullying: "Cyberbullying or online abuse",
    apparently_low_risk: "Apparently low risk",
    insufficient_evidence: "Insufficient evidence",
  };
  return labels[classification];
}

function verdictFor(risk: RiskLevel, classification: CaseClassification): string {
  if (risk === "high") return `High risk. The wording asks for something that can cost money, a secret, or your safety. This reading is about ${classificationLabel(classification).toLowerCase()}.`;
  if (risk === "medium") return `Medium risk. Something in the wording needs a pause, and the message does not prove who sent it.`;
  if (risk === "low") return "Low risk from the wording alone. That is not a guarantee the sender is who they claim to be.";
  return "Uncertain. There is not enough in this message to judge it.";
}

function summaryFor(text: string, hits: Hit[], risk: RiskLevel, classification: CaseClassification): string {
  if (!text) return "The box was empty.";
  if (risk === "uncertain" && hits.length === 0) return "The message is too short, or it does not say what the sender wants you to do.";
  if (risk === "low" && hits.every((hit) => hit.severity === "protective" || hit.severity === "note")) {
    return "The wording does not ask you to pay, send a code, or keep a secret. The sender is still unverified.";
  }
  if (risk === "low") return "No request for money, a code, a secret, or a threat showed up in the wording.";
  const lead = hits.find((hit) => hit.severity === "harmful") ?? hits[0];
  return `${lead.title}. This is grouped as ${classificationLabel(classification).toLowerCase()} from the wording, not from a check with the named organisation.`;
}

function missingFor(text: string, hits: Hit[], topics: ReturnType<typeof topicFlags>, context?: AnalysisContext): string[] {
  const missing = ["Who actually sent this, and whether they control the organisation they name."];
  if (topics.opportunity) missing.push("An official page or announcement you looked up yourself, rather than a link or account number inside the message.");
  if (hits.some((hit) => hit.id === "payment-request" || hit.id === "unspecified-payment")) {
    missing.push("Whether the organisation's own process asks for this payment, and whether the account belongs to that organisation.");
  }
  if (!/https?:\/\//i.test(text) && (topics.bank || topics.opportunity)) {
    missing.push("A website address you can compare with one published by the organisation.");
  }
  if (text.trim().length < 40) missing.push("What the sender wants you to do, and where the message arrived.");
  if (!context?.channel) missing.push("Where the message arrived.");
  return missing.slice(0, 5);
}

function actionsFor(hits: Hit[], topics: ReturnType<typeof topicFlags>, risk: RiskLevel, context?: AnalysisContext): string[] {
  const actions: string[] = [];
  if (context?.alreadyPaid === "yes") {
    actions.push("Contact your bank or the payment app now, using a number on your card or in the official app. Do not use a phone number from this message.");
  }
  if (context?.alreadySharedSecret === "yes" || hits.some((hit) => hit.id === "credential-request")) {
    actions.push("Do not send an OTP, password, BVN, NIN, or card number. If you already sent one, change the password from the official app and tell a trusted adult.");
  }
  if (hits.some((hit) => hit.id === "payment-request" || hit.id === "unspecified-payment")) {
    actions.push("Do not send the money, airtime, or gift card. A fee to unlock a scholarship, a job, or a prize is a reason to stop.");
  }
  if (hits.some((hit) => hit.id === "private-photo" || hit.id === "secrecy" || hit.id === "threat")) {
    actions.push("Stop replying. Keep a copy of the message somewhere private and tell a trusted adult. Do not meet the sender or try to argue with them. You are not in trouble for being pressured.");
  }
  if (topics.bank) {
    actions.push("If a bank is named, open the bank's own app or call the number on your card. Do not use a number or a link from this message.");
  }
  if (topics.opportunity) {
    actions.push("Look up the scholarship or employer yourself. A real offer can be confirmed on an official page without paying a stranger.");
  }
  if (hits.some((hit) => hit.hint === "malicious_link")) {
    actions.push("Do not open the link. If you need the organisation, type its address from a place you already trust.");
  }
  if (risk === "low" || risk === "uncertain") {
    actions.push("You can still pause if the message later asks for money, a code, or secrecy.");
  }
  actions.push(ADULT_HELP);
  return unique(actions).slice(0, 8);
}

function avoidFor(hits: Hit[], topics: ReturnType<typeof topicFlags>): string[] {
  const avoid = ["Do not reply with a secret, a code, or a copy of an identity document."];
  if (hits.some((hit) => hit.id === "payment-request" || hit.id === "unspecified-payment") || topics.opportunity) {
    avoid.push("Do not pay a processing fee, a registration fee, or a 'slot' fee to a personal account.");
  }
  if (hits.some((hit) => hit.hint === "malicious_link")) avoid.push("Do not open the link to see where it goes.");
  if (hits.some((hit) => hit.id === "threat" || hit.id === "private-photo" || hit.id === "secrecy")) {
    avoid.push("Do not confront the sender, meet them, or send a photo to calm them down.");
  }
  avoid.push("Do not treat a familiar name, a logo, or the word 'official' as proof.");
  return unique(avoid).slice(0, 5);
}

function verificationFor(hits: Hit[], topics: ReturnType<typeof topicFlags>): string[] {
  const steps = [
    "Find the organisation's website or app yourself. Do not start from a link in the message.",
    "Compare any phone number or account name with details published on that official page.",
  ];
  if (topics.opportunity) steps.push("Check a scholarship or job announcement on the organisation's own site. An unexpected selection with a fee is a reason to doubt the message.");
  if (topics.bank) steps.push("Use the bank app you installed yourself, or the number printed on your card. Staff there will not ask you to read out an OTP.");
  if (hits.some((hit) => hit.hint === "malicious_link")) {
    steps.push("Read the domain only if it is written out in full. A shortened link hides the destination, and this app did not open it.");
  }
  return steps.slice(0, 4);
}

function followUpsFor(hits: Hit[], topics: ReturnType<typeof topicFlags>, risk: RiskLevel, context?: AnalysisContext): FollowUpQuestion[] {
  const questions: FollowUpQuestion[] = [];
  if ((hits.some((hit) => hit.id === "payment-request" || hit.id === "unspecified-payment")) && !context?.alreadyPaid) {
    questions.push({ id: "alreadyPaid", question: "Have you already sent money, airtime, or a gift card because of this message?" });
  }
  if (hits.some((hit) => hit.id === "credential-request") && !context?.alreadySharedSecret) {
    questions.push({ id: "alreadySharedSecret", question: "Have you already sent a code, password, BVN, or other identity number?" });
  }
  if (topics.opportunity && !context?.expected && risk !== "low") {
    questions.push({ id: "expected", question: "Were you already expecting this scholarship, grant, or job message?" });
  }
  if ((risk === "high" || risk === "medium") && !context?.knowsSender) {
    questions.push({ id: "knowsSender", question: "Do you know the sender in person?" });
  }
  if ((risk === "high" || risk === "medium") && !context?.channel && questions.length < 3) {
    questions.push({ id: "channel", question: "Where did this message arrive?" });
  }
  return questions.slice(0, 3);
}

function toEvidence(hit: Hit): EvidenceItem {
  return {
    id: hit.id,
    kind: "fact",
    title: hit.title,
    detail: hit.detail,
    quote: hit.quote,
  };
}

function clip(text: string, match: string, redactLanguage = false): string {
  const index = text.toLowerCase().indexOf(match.toLowerCase().slice(0, 24));
  const start = Math.max(0, index);
  let excerpt = (index >= 0 ? text.slice(start, start + match.length + 24) : match).replace(/\s+/g, " ").trim();
  excerpt = excerpt.replace(/\d[\d,]{3,}/g, "••••");
  if (redactLanguage) excerpt = excerpt.replace(/\b(stupid|idiot|loser|worthless|dumb|nude|nudes|kys)\b/gi, "[language hidden]");
  return excerpt.slice(0, 160);
}

function unique(items: string[]): string[] {
  return [...new Set(items)];
}
