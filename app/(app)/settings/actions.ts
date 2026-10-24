"use server";

import { revalidatePath } from "next/cache";
import { getOptionalUser } from "@/lib/auth/current-user";
import { createUserClient } from "@/lib/supabase/server";
import { displayNameSchema, issueMessages } from "@/lib/validation/schemas";

export type NameState = { error?: string; ok?: boolean };

export async function updateDisplayName(_previous: NameState, formData: FormData): Promise<NameState> {
  const parsed = displayNameSchema.safeParse(formData.get("displayName"));
  if (!parsed.success) return { error: issueMessages(parsed.error)[0] ?? "Check the name and try again." };
  const user = await getOptionalUser();
  if (!user) return { error: "Sign in first." };
  const supabase = await createUserClient();
  if (!supabase) return { error: "Accounts are not configured yet." };
  const { error } = await supabase.from("profiles").update({ display_name: parsed.data }).eq("id", user.id);
  if (error) return { error: "The name could not be saved." };
  revalidatePath("/settings");
  revalidatePath("/home");
  return { ok: true };
}
