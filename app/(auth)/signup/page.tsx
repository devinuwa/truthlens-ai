import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";

export const instant = false;
export const metadata = { title: "Sign up" };

export default function SignUpPage() {
  return (
    <main id="main" className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/5">
      <h1 className="text-3xl font-bold">Create an account</h1>
      <p className="mt-2 text-sm text-muted">
        An account lets you save reports and opportunities. You do not need one to try a check or read a lesson.
      </p>
      <div className="mt-6">
        <AuthForm mode="signup" nextPath="/home" />
      </div>
      <p className="mt-4 text-sm">
        Already registered? <Link className="font-semibold text-primary" href="/login">Sign in</Link>
      </p>
    </main>
  );
}
