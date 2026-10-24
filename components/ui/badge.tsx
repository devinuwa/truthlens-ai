import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const tones = {
  neutral: "bg-canvas text-ink",
  sky: "bg-sky/25 text-ink",
  teal: "bg-teal/20 text-ink",
  sun: "bg-sun/80 text-ink",
  coral: "bg-coral/30 text-ink",
  danger: "bg-danger/10 text-danger",
} as const;

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: keyof typeof tones }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold", tones[tone])}>
      {children}
    </span>
  );
}
