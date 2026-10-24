"use client";

import { useActionState } from "react";
import { updateDisplayName } from "@/app/(app)/settings/actions";

export function SettingsForm({ displayName }: { displayName: string }) {
  const [state, action, pending] = useActionState(updateDisplayName, { ok: false });
  return (
    <form action={action} className="mt-4 space-y-3">
      <label htmlFor="displayName" className="block text-sm font-semibold">
        Display name
        <input
          id="displayName"
          name="displayName"
          defaultValue={displayName}
          maxLength={40}
          className="mt-1 min-h-11 w-full rounded-2xl border border-ink/10 px-3 font-normal"
        />
      </label>
      <button type="submit" disabled={pending} className="inline-flex min-h-11 items-center rounded-2xl bg-primary px-4 text-sm font-semibold text-white disabled:opacity-60">
        {pending ? "Saving…" : "Save name"}
      </button>
      {state.error ? <p className="text-sm font-semibold text-danger">{state.error}</p> : null}
      {state.ok ? <p className="text-sm font-semibold text-teal">Name saved.</p> : null}
    </form>
  );
}
