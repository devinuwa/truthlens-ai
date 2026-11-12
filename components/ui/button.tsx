import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

const styles = {
  primary: "bg-ink text-white hover:bg-black",
  secondary: "bg-white text-ink shadow-sm hover:bg-lilac",
  ghost: "bg-transparent text-ink hover:bg-white",
  sun: "bg-lilac text-primary hover:bg-white",
} as const;

type ButtonProps = ComponentProps<"button"> & { variant?: keyof typeof styles };

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60",
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
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-bold transition",
        styles[variant],
        className,
      )}
      {...props}
    />
  );
}
