import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { safeNext } from "@/lib/security/safe-redirect";

export const instant = false;
export const metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const nextPath = safeNext(params.next, "/home");
  return (
    <main id="main" className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/5">
      <h1 className="text-3xl font-bold">Sign in</h1>
      <p className="mt-2 text-sm text-muted">Your reports stay on your account. Guest checks still work without signing in.</p>
      {params.error === "not-configured" ? (
        <p className="mt-4 rounded-2xl bg-sun/70 p-3 text-sm">
          Accounts need NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY. You can still use the message and link checks.
        </p>
      ) : null}
      {params.error === "link-invalid" ? (
        <p className="mt-4 rounded-2xl bg-coral/30 p-3 text-sm">That confirmation link could not be used. Request a new one from the sign-up page.</p>
      ) : null}
      {params.error === "gmail-cancelled" ? (
        <p className="mt-4 rounded-2xl bg-sun/70 p-3 text-sm">Gmail sign-in did not finish. You can try again, or use email and a password.</p>
      ) : null}
      <div className="mt-6">
        <AuthForm mode="login" nextPath={nextPath} />
      </div>
      <p className="mt-4 text-sm">
        New here? <Link className="font-semibold text-primary" href="/signup">Create an account</Link>
      </p>
      <p className="mt-2 text-sm">
        <Link className="font-semibold text-primary" href="/check-message">Continue as a guest</Link>
      </p>
    </main>
  );
}
