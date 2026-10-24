"use client";

import Link from "next/link";
import { Bookmark, Calendar, GraduationCap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { filterOpportunities } from "@/lib/opportunities/filter";
import { isExpired, verificationLabel, type Opportunity, type OpportunityType } from "@/lib/opportunities/types";
import { OPPORTUNITY_REGIONS, OPPORTUNITY_TYPES } from "@/lib/opportunities/sample-data";

const STORAGE_KEY = "truthlens.savedOpportunities";

function readLocal(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]") as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function OpportunityBrowser({
  initial,
  demonstration,
  source,
  warning,
  saved,
  signedIn,
}: {
  initial: Opportunity[];
  demonstration: Opportunity[];
  source: "demonstration" | "database" | "empty" | "error";
  warning: string | null;
  saved: string[];
  signedIn: boolean;
}) {
  const [items, setItems] = useState(initial);
  const [showingDemo, setShowingDemo] = useState(source === "demonstration");
  const [text, setText] = useState("");
  const [type, setType] = useState<OpportunityType | "all">("all");
  const [region, setRegion] = useState("all");
  const [timing, setTiming] = useState<"all" | "open" | "expired">("all");
  const [verification, setVerification] = useState<"all" | Opportunity["verificationStatus"]>("all");
  const [savedIds, setSavedIds] = useState<string[]>(saved);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!signedIn) setSavedIds(readLocal());
  }, [signedIn]);

  const filtered = useMemo(
    () => filterOpportunities(items, { text, type, region, timing, verification }),
    [items, text, type, region, timing, verification],
  );

  async function toggleSave(slug: string) {
    const already = savedIds.includes(slug);
    if (!signedIn) {
      const next = already ? savedIds.filter((item) => item !== slug) : [...savedIds, slug];
      setSavedIds(next);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setNotice(already ? "Removed on this device." : "Saved on this device. Sign in to keep it on your account.");
      return;
    }
    const response = await fetch(already ? `/api/bookmarks?slug=${encodeURIComponent(slug)}` : "/api/bookmarks", {
      method: already ? "DELETE" : "POST",
      headers: { "content-type": "application/json" },
      body: already ? undefined : JSON.stringify({ slug }),
    });
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setNotice(payload?.error || "The save could not be changed.");
      return;
    }
    setSavedIds(already ? savedIds.filter((item) => item !== slug) : [...savedIds, slug]);
    setNotice(already ? "Removed from your account." : "Saved to your account.");
  }

  return (
    <div className="space-y-4">
      {warning ? <p className="rounded-2xl bg-sun/70 p-4 text-sm">{warning}</p> : null}
      {showingDemo ? (
        <p className="rounded-2xl bg-coral/20 p-4 text-sm">
          These records are demonstration data. The organisations are fictional. Do not apply, pay, or share personal details because of them.
        </p>
      ) : null}
      {source === "empty" || source === "error" ? (
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            setItems(demonstration);
            setShowingDemo(true);
          }}
        >
          Show demonstration data
        </Button>
      ) : null}
      <form className="grid gap-3 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-ink/5 md:grid-cols-2" onSubmit={(event) => event.preventDefault()}>
        <label className="text-sm font-semibold md:col-span-2">
          Search
          <input
            value={text}
            onChange={(event) => setText(event.target.value)}
            className="mt-1 min-h-11 w-full rounded-2xl border border-ink/10 px-3 font-normal"
            placeholder="Title, provider, or region"
          />
        </label>
        <Select label="Type" value={type} onChange={(value) => setType(value as OpportunityType | "all")} options={["all", ...OPPORTUNITY_TYPES]} />
        <Select label="Location or eligibility" value={region} onChange={setRegion} options={["all", ...OPPORTUNITY_REGIONS]} />
        <Select label="Application status" value={timing} onChange={(value) => setTiming(value as typeof timing)} options={["all", "open", "expired"]} />
        <Select
          label="Verification"
          value={verification}
          onChange={(value) => setVerification(value as typeof verification)}
          options={["all", "demonstration", "not_yet_checked", "official_checked"]}
        />
      </form>
      {notice ? <p className="text-sm font-semibold">{notice}</p> : null}
      {filtered.length === 0 ? (
        <p className="rounded-3xl bg-white p-6 text-sm text-muted">No opportunities match those filters.</p>
      ) : (
        <ul className="grid gap-4">
          {filtered.map((item) => (
            <li key={item.slug} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-ink/5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="sky">{item.opportunityType}</Badge>
                <Badge tone={item.isSample ? "sun" : "teal"}>{verificationLabel(item)}</Badge>
                {isExpired(item.deadline) ? <Badge tone="coral">Expired</Badge> : <Badge tone="teal">Deadline open or unlisted</Badge>}
              </div>
              <h2 className="mt-3 text-xl font-bold">
                <Link href={`/opportunities/${item.slug}`} className="hover:text-primary">
                  {item.title}
                </Link>
              </h2>
              <p className="mt-1 text-sm text-muted">{item.provider}</p>
              <p className="mt-3 text-sm">{item.summary}</p>
              <p className="mt-3 flex items-center gap-2 text-sm">
                <Calendar aria-hidden="true" size={16} />
                {item.deadline ? `Deadline ${item.deadline}` : "No deadline listed"}
                <GraduationCap aria-hidden="true" size={16} />
                {item.region}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={`/opportunities/${item.slug}`} className="inline-flex min-h-11 items-center rounded-2xl bg-primary px-4 text-sm font-semibold text-white">
                  View details
                </Link>
                <button
                  type="button"
                  onClick={() => void toggleSave(item.slug)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-ink/10 px-4 text-sm font-semibold"
                >
                  <Bookmark aria-hidden="true" size={16} />
                  {savedIds.includes(item.slug) ? "Saved" : "Save"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="text-sm font-semibold">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 min-h-11 w-full rounded-2xl border border-ink/10 bg-white px-3 font-normal"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option.replace(/_/g, " ")}
          </option>
        ))}
      </select>
    </label>
  );
}
