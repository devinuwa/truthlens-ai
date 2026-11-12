import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <div className="hero-wash mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-10">{children}</div>;
}
