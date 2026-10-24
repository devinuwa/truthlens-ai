import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/settings/settings-form";
import { getOptionalUser } from "@/lib/auth/current-user";
import { getPublicSupabaseConfig } from "@/lib/env";

export const instant = false;
export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  if (!getPublicSupabaseConfig()) {
    return (
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/5">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="mt-3 text-sm">
          Account settings appear after Supabase is configured. Guest checks do not need an account. See the README for the environment variables.
        </p>
      </section>
    );
  }
  const user = await getOptionalUser();
  if (!user) redirect("/login?next=/settings");

  return (
    <div className="space-y-4">
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/5">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="mt-2 text-sm text-muted">Signed in as {user.email}</p>
        <SettingsForm displayName={user.displayName} />
      </section>
      <section className="rounded-3xl bg-sun/50 p-6 text-sm">
        <h2 className="font-bold">Privacy choices</h2>
        <p className="mt-2">
          Saving a report stores the result. The original text is stored only when you tick that box on the result, and only as a short excerpt. Delete the report from My Reports to remove it.
        </p>
        <p className="mt-2">This app does not collect your school, phone number, or precise location.</p>
      </section>
    </div>
  );
}
