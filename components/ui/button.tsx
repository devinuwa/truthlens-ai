import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

const styles = {
  primary: "bg-primary text-white hover:bg-primary-dark",
  secondary: "bg-white text-ink border border-sky/70 hover:border-primary",
  ghost: "bg-transparent text-ink hover:bg-white",
  sun: "bg-sun text-ink hover:brightness-95",
} as const;

type ButtonProps = ComponentProps<"button"> & { variant?: keyof typeof styles };

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        styles[variant],
        className,
      )}
      {...props}
    />
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & { variant?: keyof typeof styles };

export function ButtonLink({ variant = "primary", className, ...props }: ButtonLinkProps) {
  return (
    <Link
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition",
        styles[variant],
        className,
      )}
      {...props}
    />
  );
}
