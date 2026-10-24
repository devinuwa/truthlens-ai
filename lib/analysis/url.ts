import {
  BASE_LIMITATION,
  CONFIDENCE_MEANING,
  type AnalysisResult,
  type Assessment,
  type ConfidenceLevel,
  type Indicator,
  type IndicatorStrength,
  type ModelNote,
} from "@/lib/analysis/types";

const SHORTENERS = new Set([
  "bit.ly",
  "tinyurl.com",
  "t.co",
  "goo.gl",
  "cutt.ly",
  "rb.gy",
  "is.gd",
  "shorturl.at",
  "ow.ly",
  "buff.ly",
  "rebrand.ly",
  "tiny.cc",
]);

const BRANDS: Record<string, string[]> = {
  google: ["google.com", "google.com.ng", "google.co.uk"],
  whatsapp: ["whatsapp.com", "wa.me"],
  instagram: ["instagram.com"],
  tiktok: ["tiktok.com"],
  facebook: ["facebook.com", "fb.com", "facebookmail.com"],
  microsoft: ["microsoft.com", "live.com", "office.com", "outlook.com"],
  apple: ["apple.com", "icloud.com"],
  paypal: ["paypal.com"],
  netflix: ["netflix.com"],
};

const MULTI_PART_SUFFIXES = new Set([
  "com.ng",
  "org.ng",
  "edu.ng",
  "gov.ng",
  "co.uk",
  "org.uk",
  "ac.uk",
  "com.au",
  "co.za",
]);

const SUSPICIOUS_SUFFIXES = new Set(["zip", "mov", "tk", "ml", "gq", "cf", "ga"]);

export type UrlFeatures = {
  length: number;
  subdomainCount: number;
  hasIpHost: boolean;
  hasUserInfo: boolean;
  isHttps: boolean;
  hyphenCount: number;
  digitRatio: number;
  percentEncodingCount: number;
  isShortener: boolean;
  isPrivateHost: boolean;
  hasPunycode: boolean;
  suspiciousSuffix: boolean;
  sensitivePath: boolean;
};

export class UrlRejectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UrlRejectedError";
  }
}

const LOOKALIKE_DIGITS: Record<string, string> = {
  "0": "o",
  "1": "l",
  "3": "e",
  "4": "a",
  "5": "s",
};

function foldLookalikeDigits(hostname: string): string {
  return hostname.replace(/[01345]/g, (character) => LOOKALIKE_DIGITS[character] ?? character);
}

function registrableDomain(hostname: string): string {
  const labels = hostname.split(".").filter(Boolean);
  if (labels.length < 2) return hostname;
  const lastTwo = labels.slice(-2).join(".");
  if (MULTI_PART_SUFFIXES.has(lastTwo) && labels.length >= 3) {
    return labels.slice(-3).join(".");
  }
  return lastTwo;
}

function isIpHost(hostname: string): boolean {
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) return true;
  return hostname.includes(":") || hostname.startsWith("[");
}

function ipv4ToParts(hostname: string): number[] | null {
  const match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!match) return null;
  const parts = match.slice(1).map(Number);
  if (parts.some((part) => part > 255)) return null;
  return parts;
}

export function isPrivateOrLocalHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) return true;
  if (host === "metadata.google.internal") return true;
  if (host === "::1" || host === "0:0:0:0:0:0:0:1") return true;
  const parts = ipv4ToParts(host);
  if (!parts) return false;
  const [a, b] = parts;
  if (a === 10 || a === 127 || a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  return false;
}

export function extractUrlFeatures(url: URL): UrlFeatures {
  const hostname = url.hostname.toLowerCase();
  const labels = hostname.split(".").filter(Boolean);
  const digits = (url.href.match(/\d/g) ?? []).length;
  return {
    length: url.href.length,
    subdomainCount: Math.max(0, labels.length - registrableDomain(hostname).split(".").length),
    hasIpHost: isIpHost(hostname),
    hasUserInfo: url.username.length > 0 || url.password.length > 0,
    isHttps: url.protocol === "https:",
    hyphenCount: (hostname.match(/-/g) ?? []).length,
    digitRatio: digits / Math.max(url.href.length, 1),
    percentEncodingCount: (url.href.match(/%[0-9a-f]{2}/gi) ?? []).length,
    isShortener: SHORTENERS.has(registrableDomain(hostname)) || SHORTENERS.has(hostname),
    isPrivateHost: isPrivateOrLocalHost(hostname),
    hasPunycode: hostname.startsWith("xn--") || hostname.includes(".xn--"),
    suspiciousSuffix: SUSPICIOUS_SUFFIXES.has(labels.at(-1) ?? ""),
    sensitivePath: /(login|verify|account|wallet|password|update|secure|signin|wp-admin)/i.test(
      `${url.pathname}${url.search}`,
    ),
  };
}

function addIndicator(
  list: Indicator[],
  id: string,
  title: string,
  explanation: string,
  evidence: string,
  strength: IndicatorStrength,
) {
  list.push({
    id,
    category: "phishing",
    title,
    explanation,
    evidence,
    strength,
  });
}

export function analyzeUrl(raw: string, model?: ModelNote): AnalysisResult {
  const trimmed = raw.trim();
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new UrlRejectedError("That does not look like a valid link. Include the full address, starting with https://.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new UrlRejectedError(
      "Only http and https links can be checked. Other link types, including file, javascript, and data links, are blocked and were not opened.",
    );
  }

  const features = extractUrlFeatures(url);
  const hostname = url.hostname.toLowerCase();
  const domain = registrableDomain(hostname);
  const indicators: Indicator[] = [];

  if (features.isPrivateHost) {
    addIndicator(
      indicators,
      "private-host",
      "Points at a private or local address",
      "This address is used inside a home, school, or office network, or on this computer. TruthLens did not connect to it. Do not open a link like this from a stranger.",
      hostname,
      "strong",
    );
  }
  if (features.hasIpHost && !features.isPrivateHost) {
    addIndicator(
      indicators,
      "ip-host",
      "Uses a numeric address instead of a name",
      "Ordinary school, bank, and scholarship sites usually use a name such as school.edu. A raw number address is harder to recognise and is often used to hide the destination.",
      hostname,
      "strong",
    );
  }
  if (features.hasUserInfo) {
    addIndicator(
      indicators,
      "user-info",
      "Hides the real destination behind an @ sign",
      "Text before an @ sign can look like a trusted name while the browser goes to the site after the @ sign.",
      url.href.slice(0, 120),
      "strong",
    );
  }
  if (features.isShortener) {
    addIndicator(
      indicators,
      "shortener",
      "Uses a link shortener",
      "A shortener hides the real address until the link is opened. TruthLens does not open it. Ask the sender for the full address or look up the organisation yourself.",
      domain,
      "moderate",
    );
  }
  if (features.hasPunycode) {
    addIndicator(
      indicators,
      "punycode",
      "Uses special characters that can imitate letters",
      "Some addresses use lookalike characters so a name appears familiar. Compare it, character by character, with the official site.",
      hostname,
      "strong",
    );
  }
  if (features.subdomainCount >= 3) {
    addIndicator(
      indicators,
      "many-subdomains",
      "Has an unusually long chain of names",
      "Extra words before the real domain can make a link look official. The registrable domain, near the end of the name, is the part that matters.",
      hostname,
      "moderate",
    );
  }
  if (features.suspiciousSuffix) {
    addIndicator(
      indicators,
      "suspicious-suffix",
      "Uses a web ending that is often abused",
      "The ending of this address appears often in throwaway scam sites. That does not prove this site is harmful, but it is a reason to be careful.",
      hostname,
      "moderate",
    );
  }
  if (features.percentEncodingCount >= 6 || /%25/i.test(url.href)) {
    addIndicator(
      indicators,
      "heavy-encoding",
      "Contains a lot of encoded characters",
      "Many percent signs can hide the readable address. If you cannot read where the link goes, do not open it.",
      `${features.percentEncodingCount} encoded parts`,
      "moderate",
    );
  }
  if (features.sensitivePath && (features.hasIpHost || features.subdomainCount >= 2 || !features.isHttps)) {
    addIndicator(
      indicators,
      "sensitive-path",
      "The path talks about login or payment",
      "Words such as login, verify, or wallet are normal on real sites, and suspicious when the rest of the address is already hard to trust.",
      url.pathname.slice(0, 80),
      "weak",
    );
  }
  if (!features.isHttps) {
    addIndicator(
      indicators,
      "not-https",
      "Does not use HTTPS",
      "HTTPS does not mean a site is honest, but a login or payment page without it is a warning sign.",
      url.protocol,
      "weak",
    );
  }
  if (features.length > 180) {
    addIndicator(
      indicators,
      "long-url",
      "The address is very long",
      "A very long address can hide the real domain in the middle of the text. Read the name just before the first single slash.",
      `${features.length} characters`,
      "weak",
    );
  }

  const foldedHost = foldLookalikeDigits(hostname);
  for (const [brand, official] of Object.entries(BRANDS)) {
    const mentionsExact = hostname.includes(brand);
    const mentionsFolded = !mentionsExact && foldedHost.includes(brand);
    if (!mentionsExact && !mentionsFolded) continue;
    const allowed = official.some((item) => domain === item || hostname === item || hostname.endsWith(`.${item}`));
    if (!allowed && mentionsExact) {
      addIndicator(
        indicators,
        `brand-${brand}`,
        `The name mentions ${brand}, but the domain is different`,
        `The address contains the word "${brand}" while the registered domain is ${domain}. That is a common lookalike pattern. Open ${official[0]} yourself if you meant that service.`,
        hostname,
        "strong",
      );
    }
    if (!allowed && mentionsFolded) {
      addIndicator(
        indicators,
        `brand-lookalike-${brand}`,
        `The name looks similar to ${brand}`,
        `Swapping common lookalike digits (0 for o, 1 for l, 3 for e, 4 for a, 5 for s) turns part of this address into "${brand}". The registered domain is still ${domain}. That is a lookalike pattern, not proof of who runs the site. Open ${official[0]} yourself if you meant that service.`,
        hostname,
        "strong",
      );
    }
  }

  const weight = indicators.reduce((sum, item) => sum + (item.strength === "strong" ? 3 : item.strength === "moderate" ? 2 : 1), 0);
  const strongCount = indicators.filter((item) => item.strength === "strong").length;
  let assessment: Assessment = "no_major_indicators";
  if (indicators.length > 0) assessment = "suspicious_indicators_found";

  const confidence: ConfidenceLevel | null =
    assessment === "no_major_indicators"
      ? null
      : weight >= 6 || strongCount >= 2
        ? "high"
        : weight >= 3
          ? "medium"
          : "low";

  const actions = [
    "TruthLens did not open, download, or sign in to this address.",
    "Read the domain yourself. The registered domain is the end of the name, not the words at the beginning.",
    "If you need the organisation, type its address from a brochure, a previous bookmark, or a search result you recognise.",
    "Do not enter a password or pay anyone because of this link alone.",
  ];
  if (features.isPrivateHost) {
    actions.unshift("Leave this address closed. It refers to a private network, and this app will not fetch it.");
  }

  return {
    kind: "url",
    assessment,
    assessmentLabel:
      assessment === "suspicious_indicators_found"
        ? "Suspicious indicators found"
        : "No major indicators detected",
    confidence: { level: confidence, meaning: CONFIDENCE_MEANING },
    categoriesConsidered: ["Link structure", "Lookalike names", "Shorteners", "Private addresses"],
    focusCategory: "url",
    indicators,
    recommendedActions: actions,
    limitations: `${BASE_LIMITATION} A quiet result only means these structural checks did not fire. The site was not visited, and a normal-looking address can still be dishonest. HTTPS and a familiar word in the name are not proof of safety.`,
    model: model ?? {
      status: "unavailable",
      note: "No machine-learning score was added. The result comes from the structural checks listed above.",
    },
  };
}
