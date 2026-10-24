import {
  BASE_LIMITATION,
  CONFIDENCE_MEANING,
  type AnalysisResult,
  type Assessment,
  type ConfidenceLevel,
  type Indicator,
  type IndicatorStrength,
  type MessageCategory,
  type ModelNote,
} from "@/lib/analysis/types";

type Rule = {
  id: string;
  category: Exclude<MessageCategory, "auto">;
  title: string;
  explanation: string;
  strength: IndicatorStrength;
  pattern: RegExp;
  redact?: boolean;
};

const RULES: Rule[] = [
  {
    id: "credential-request",
    category: "phishing",
    title: "Asks for a password or security code",
    explanation:
      "A genuine school, bank, or app will not ask you to send a password, one-time code, or card security number in a chat or email.",
    strength: "strong",
    pattern:
      /\b(password|passcode|one[-\s]?time code|otp|verification code|login details|bank pin|cvv|card number)\b/i,
  },
  {
    id: "account-threat",
    category: "phishing",
    title: "Says an account has a problem",
    explanation:
      "Messages that say an account is locked, suspended, or unusual often try to rush you into a fake login page.",
    strength: "moderate",
    pattern:
      /\b(account (is |has been )?(suspended|locked|compromised|restricted)|unusual (activity|sign-?in)|verify your account|confirm your identity)\b/i,
  },
  {
    id: "wallet-secret",
    category: "phishing",
    title: "Asks for a wallet or recovery secret",
    explanation:
      "A seed phrase or private key is the password to money or an account. Anyone who asks for it can take control.",
    strength: "strong",
    pattern: /\b(seed phrase|recovery phrase|private key|wallet phrase)\b/i,
  },
  {
    id: "payment-request",
    category: "payment_or_personal_information",
    title: "Asks for money or a transfer",
    explanation:
      "Requests for a fee, gift card, airtime, or bank transfer are a common part of scholarship, job, and prize scams.",
    strength: "strong",
    pattern:
      /\b(send (the )?money|wire transfer|gift cards?|airtime|bank transfer|processing fee|registration fee|pay (to|a) (apply|claim|release)|transfer .{0,24}(naira|usd|dollars))\b/i,
  },
  {
    id: "identity-numbers",
    category: "payment_or_personal_information",
    title: "Asks for identity or bank numbers",
    explanation:
      "BVN, NIN, account numbers, and similar details are enough for another person to pretend to be you. Do not send them in a message.",
    strength: "strong",
    pattern:
      /\b(bvn|nin|national identification|account number|sort code|routing number|ssn|social security)\b/i,
  },
  {
    id: "urgency",
    category: "urgency",
    title: "Pushes you to act immediately",
    explanation:
      "A short deadline is often used so you do not have time to ask questions or check the sender.",
    strength: "moderate",
    pattern:
      /\b(urgent|immediately|right now|act now|last chance|final warning|within \d+ (minutes|hours)|limited time|expires? today)\b/i,
  },
  {
    id: "prize-claim",
    category: "scam",
    title: "Claims you won something unexpected",
    explanation:
      "Prize, lottery, and inheritance messages are suspicious when you did not enter. A real award can be checked on the organiser's own website.",
    strength: "strong",
    pattern:
      /\b(you have won|you've won|lottery|inheritance|claim your prize|selected (as |to be )?a winner|congratulations,? you)\b/i,
  },
  {
    id: "guaranteed-money",
    category: "scam",
    title: "Promises easy or guaranteed money",
    explanation:
      "Guaranteed income, especially from a stranger, is a warning sign. Legitimate opportunities still have conditions and do not need secrecy.",
    strength: "moderate",
    pattern:
      /\b(100% guaranteed|guaranteed (scholarship|income|job)|earn \d[\d,]* .{0,20}(a |per )?(day|week)|no interview required|work from home and earn)\b/i,
  },
  {
    id: "opportunity-fee",
    category: "fake_opportunity",
    title: "A scholarship, job, or grant asks for a fee",
    explanation:
      "Real educational programmes may have eligibility rules, but a stranger asking you to pay a fee to unlock a scholarship or job is a known scam pattern. This check does not prove the offer is fake. It means you should verify it on an official page.",
    strength: "strong",
    pattern:
      /\b(scholarship|grant|internship|job offer|you have been selected).{0,80}\b(fee|payment|deposit|airtime|transfer)\b|\b(fee|payment|deposit).{0,80}\b(scholarship|grant|internship|job offer)\b/i,
  },
  {
    id: "opportunity-bait",
    category: "fake_opportunity",
    title: "An unexpected award or selection",
    explanation:
      "Being told you were selected for a scholarship or job you do not remember applying for is a reason to slow down and look up the organisation yourself.",
    strength: "moderate",
    pattern:
      /\b(selected for (a |the )?(scholarship|internship|grant)|scholarship (has been |was )?awarded|congratulations.{0,40}(scholarship|internship|grant))\b/i,
  },
  {
    id: "threat",
    category: "harassment",
    title: "Contains a threat",
    explanation:
      "Threats are a sign to stop replying and get help. TruthLens cannot know whether the sender will act on the words. Tell a trusted adult if you feel unsafe.",
    strength: "strong",
    pattern:
      /\b(i will (hurt|beat|kill|find) you|i('ll| will) (leak|share) your|kill yourself|kys)\b/i,
    redact: true,
  },
  {
    id: "insult",
    category: "harassment",
    title: "Contains insulting language",
    explanation:
      "Insults can be part of bullying. One rude word does not prove what the sender meant, and it does not mean you did something wrong. You can leave the conversation and tell someone you trust.",
    strength: "weak",
    pattern: /\b(stupid|idiot|loser|worthless|dumb|moron)\b/i,
    redact: true,
  },
  {
    id: "secrecy",
    category: "manipulation",
    title: "Asks you to keep a secret from adults",
    explanation:
      "Someone who tells you not to talk to a parent, teacher, or friend may be trying to isolate you. A safe offer or friendship does not require that secret.",
    strength: "strong",
    pattern:
      /\b(don'?t tell (your )?(parents|mum|mom|dad|teacher|anyone)|keep (this|it)( a)? secret|this stays between us|nobody (else )?can know)\b/i,
  },
  {
    id: "private-photo",
    category: "manipulation",
    title: "Asks for a private photo",
    explanation:
      "Do not send personal or body photos to someone who pressures you, even if they say it is a joke or a dare. Tell a trusted adult. You will not be in trouble for asking for help.",
    strength: "strong",
    pattern: /\b(send (me )?(a )?(photo|picture|pic|nude)|your (nudes|body pic))\b/i,
  },
  {
    id: "emotional-pressure",
    category: "manipulation",
    title: "Uses emotional pressure",
    explanation:
      "Phrases that say you will disappoint someone, get in trouble, or are the only person who can help are pressure tactics. You can pause and ask someone else before you act.",
    strength: "moderate",
    pattern:
      /\b(if you (really )?(love|care)|you will (get in trouble|regret)|only you can help|i('ll| will) be (so )?disappointed|everyone will (hate|laugh))\b/i,
  },
];

const CATEGORY_LABELS: Record<Exclude<MessageCategory, "auto">, string> = {
  scam: "Scam language",
  phishing: "Phishing and credential theft",
  fake_opportunity: "Fake scholarship or job offers",
  payment_or_personal_information: "Payment or personal information",
  urgency: "Urgency and pressure",
  harassment: "Harassment or abusive language",
  manipulation: "Manipulation and secrecy",
};

const STRENGTH_WEIGHT: Record<IndicatorStrength, number> = {
  weak: 1,
  moderate: 2,
  strong: 3,
};

const ADULT_HELP =
  "If someone is asking for money, passwords, photos, or is frightening you, stop and tell a trusted adult, a teacher, or a suitable local helpline. Asking for help is the right step. You are not to blame.";

function snippet(text: string, rule: Rule, match: RegExpMatchArray): string {
  const index = match.index ?? 0;
  let start = Math.max(0, index - 18);
  let end = Math.min(text.length, index + match[0].length + 18);
  if (start > 0) {
    const boundary = text.indexOf(" ", start);
    if (boundary !== -1 && boundary < index) start = boundary + 1;
  }
  if (end < text.length) {
    const boundary = text.lastIndexOf(" ", end);
    if (boundary > index) end = boundary;
  }
  let excerpt = text.slice(start, end).replace(/\s+/g, " ").trim();
  if (rule.redact) {
    excerpt = excerpt.replace(rule.pattern, "[language hidden]");
  }
  return excerpt;
}

export function detectMessageIndicators(text: string): Indicator[] {
  const found: Indicator[] = [];
  for (const rule of RULES) {
    const match = text.match(rule.pattern);
    if (!match) continue;
    found.push({
      id: rule.id,
      category: rule.category,
      title: rule.title,
      explanation: rule.explanation,
      evidence: snippet(text, rule, match),
      strength: rule.strength,
    });
  }
  return found;
}

function confidenceFor(weight: number, strongCount: number): ConfidenceLevel {
  if (weight >= 6 || strongCount >= 2) return "high";
  if (weight >= 3) return "medium";
  return "low";
}

function actionsFor(indicators: Indicator[]): string[] {
  const categories = new Set(indicators.map((item) => item.category));
  const actions = [
    "Do not send money, passwords, identity numbers, or private photos in reply.",
    "Do not tap a link in the message. If an organisation is named, find its website yourself through a search or a bookmark you already trust.",
  ];
  if (categories.has("phishing") || categories.has("payment_or_personal_information")) {
    actions.push(
      "If you already shared a password or code, change it from the official app or website and tell a trusted adult.",
    );
  }
  if (categories.has("fake_opportunity") || categories.has("scam")) {
    actions.push(
      "Compare the offer with the organisation's official page. A real scholarship or job can be confirmed without paying a stranger.",
    );
  }
  if (categories.has("harassment")) {
    actions.push(
      "You can stop replying, block the sender, and keep a copy of the message somewhere private if you need to report it.",
    );
  }
  if (categories.has("manipulation") || categories.has("urgency")) {
    actions.push("Give yourself time. Pressure to decide today is a reason to pause, not a reason to hurry.");
  }
  actions.push(ADULT_HELP);
  return actions;
}

function limitationsFor(indicators: Indicator[]): string {
  const extra: string[] = [BASE_LIMITATION];
  if (indicators.some((item) => item.category === "harassment")) {
    extra.push(
      "Insulting or threatening words are reported as language patterns. They do not prove what the sender intended.",
    );
  }
  if (indicators.some((item) => item.category === "scam" || item.category === "fake_opportunity")) {
    extra.push(
      "Suspicious wording is not the same as a confirmed fraud. TruthLens does not contact the sender or the named organisation.",
    );
  }
  extra.push(
    "These checks are transparent rules. They are separate from any machine-learning score, and they miss new wording that is not in the rule list.",
  );
  return extra.join(" ");
}

export function analyzeMessage(
  text: string,
  focus: MessageCategory = "auto",
  model?: ModelNote,
): AnalysisResult {
  const trimmed = text.trim();
  const indicators = trimmed ? detectMessageIndicators(trimmed) : [];
  const weight = indicators.reduce((sum, item) => sum + STRENGTH_WEIGHT[item.strength], 0);
  const strongCount = indicators.filter((item) => item.strength === "strong").length;

  let assessment: Assessment;
  if (!trimmed || (indicators.length === 0 && trimmed.length < 24)) {
    assessment = "insufficient_evidence";
  } else if (indicators.length === 0) {
    assessment = "no_major_indicators";
  } else {
    assessment = "suspicious_indicators_found";
  }

  const labels: Record<Assessment, string> = {
    suspicious_indicators_found: "Suspicious indicators found",
    no_major_indicators: "No major indicators detected",
    insufficient_evidence: "Insufficient evidence",
  };

  const focusNote =
    focus === "auto"
      ? "Automatic check across scam, phishing, fake opportunities, payment requests, urgency, harassment, and manipulation."
      : `You asked to focus on ${CATEGORY_LABELS[focus]}. The other categories were still checked so a different risk was not ignored.`;

  const modelNote: ModelNote = model ?? {
    status: "unavailable",
    note: "No machine-learning score was added. The result above comes only from the listed language checks.",
  };

  return {
    kind: "message",
    assessment,
    assessmentLabel: labels[assessment],
    confidence: {
      level: assessment === "suspicious_indicators_found" ? confidenceFor(weight, strongCount) : null,
      meaning: CONFIDENCE_MEANING,
    },
    categoriesConsidered: Object.values(CATEGORY_LABELS),
    focusCategory: focus,
    indicators,
    recommendedActions:
      assessment === "suspicious_indicators_found"
        ? actionsFor(indicators)
        : [
            "You can still check the sender through a channel you already trust.",
            "If the message asks for money, a password, or secrecy, treat that as a reason to pause even when this check is quiet.",
            focusNote,
            ADULT_HELP,
          ],
    limitations: `${limitationsFor(indicators)} ${focusNote}`,
    model: modelNote,
  };
}
