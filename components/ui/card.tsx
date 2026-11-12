import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("rounded-[28px] bg-card p-5 shadow-[0_18px_50px_-32px_rgba(80,40,120,0.65)] sm:p-6", className)}>{children}</section>;
}
