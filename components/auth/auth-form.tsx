"use client";

import { useState, type FormEvent } from "react";
import { Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { NEXT_COOKIE, authCallbackUrl } from "@/lib/auth/callback-url";
import { safeNext } from "@/lib/security/safe-redirect";
import { createBrowserSupabase } from "@/lib/supabase/client";

export function AuthForm({ mode, nextPath }: { mode: "login" | "signup"; nextPath: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<"form" | "gmail" | null>(null);

  function callbackUrl() {
    rememberNext(nextPath);
    return authCallbackUrl(window.location.origin);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    const supabase = createBrowserSupabase();
    if (!supabase) {
      setError("Sign-in needs a Supabase project. Add the URL and anon key in .env.local, then restart the app.");
      return;
    }
    setBusy("form");
    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName || email.split("@")[0] },
            emailRedirectTo: callbackUrl(),
          },
        });
        if (signUpError) {
          setError(plainAuthError(signUpError.message));
          return;
        }
        if (data.session) {
          router.push(nextPath);
          router.refresh();
          return;
        }
        if (data.user && (data.user.identities?.length ?? 0) === 0) {
          setError("This email already has an account. Sign in with it instead.");
          return;
        }
        setMessage(checkEmailMessage(email));
        return;
      }
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        const unconfirmed =
          signInError.code === "email_not_confirmed" || signInError.message.toLowerCase().includes("not confirmed");
        if (unconfirmed) {
          const { error: resendError } = await supabase.auth.resend({
            type: "signup",
            email,
            options: { emailRedirectTo: callbackUrl() },
          });
          if (resendError) {
            setError(plainAuthError(resendError.message));
            return;
          }
          setMessage(checkEmailMessage(email));
          return;
        }
        setError(plainAuthError(signInError.message));
        return;
      }
      router.push(nextPath);
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function continueWithGmail() {
    setError("");
    setMessage("");
    const supabase = createBrowserSupabase();
    if (!supabase) {
      setError("Sign-in needs a Supabase project. Add the URL and anon key in .env.local, then restart the app.");
      return;
    }
    setBusy("gmail");
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl(),
        queryParams: { prompt: "select_account" },
      },
    });
    if (oauthError) {
      setError(
        oauthError.message.toLowerCase().includes("not enabled")
          ? "Gmail sign-in is not switched on in Supabase yet. Use email and a password, or enable the Google provider."
          : oauthError.message,
      );
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      <Button type="button" variant="secondary" className="w-full" onClick={continueWithGmail} disabled={busy !== null}>
        <Mail aria-hidden="true" size={18} />
        {busy === "gmail" ? "Opening Gmail…" : "Continue with Gmail"}
      </Button>
      <p className="text-sm text-muted">
        This opens Google so you can choose a Gmail account. TruthLens receives the name and email Google shares. It does not receive your Gmail password.
      </p>
      <p className="text-center text-sm text-muted">or use email</p>
      <form onSubmit={onSubmit} className="space-y-4">
      {mode === "signup" ? (
        <Field id="display-name" label="What should we call you?" value={displayName} onChange={setDisplayName} autoComplete="nickname" />
      ) : null}
      <Field id="email" label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" required />
      <Field
        id="password"
        label="Password"
        type="password"
        value={password}
        onChange={setPassword}
        autoComplete={mode === "signup" ? "new-password" : "current-password"}
        required
      />
      {error ? (
        <p role="alert" className="rounded-2xl bg-coral/30 p-3 text-sm font-semibold text-danger">
          {error}
        </p>
      ) : null}
      {message ? (
        <p role="status" className="rounded-2xl bg-sun/70 p-3 text-sm">
          {message}
        </p>
      ) : null}
      <Button type="submit" disabled={busy !== null}>
        {busy === "form" ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
      </Button>
    </form>
    </div>
  );
}

function checkEmailMessage(email: string) {
  return `Check ${email} for a message from TruthLens. Open the link, then come back and sign in. If it does not arrive, look in spam and wait a few minutes before trying again.`;
}

function plainAuthError(message: string) {
  const text = message.toLowerCase();
  if (text.includes("invalid") && text.includes("email")) {
    return "That email address is not accepted. Use a real inbox, such as Gmail.";
  }
  if (text.includes("rate limit") || text.includes("too many")) {
    return "Too many account emails were sent. Wait about an hour, then try again.";
  }
  return message;
}

function rememberNext(nextPath: string) {
  const value = encodeURIComponent(safeNext(nextPath));
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${NEXT_COOKIE}=${value}; Path=/; Max-Age=600; SameSite=Lax${secure}`;
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  required,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <label htmlFor={id} className="block text-sm font-semibold">
      {label}
      <input
        id={id}
        type={type}
        value={value}
        required={required}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 min-h-11 w-full rounded-2xl border border-ink/10 px-3 font-normal"
      />
    </label>
  );
}
