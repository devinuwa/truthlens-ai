import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("rounded-3xl bg-card p-5 shadow-sm ring-1 ring-ink/5 sm:p-6", className)}>{children}</section>;
}
