import "server-only";
import { createUserClient } from "@/lib/supabase/server";

export type SessionUser = {
  id: string;
  email: string;
  displayName: string;
};

export async function getOptionalUser(): Promise<SessionUser | null> {
  const supabase = await createUserClient();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  const email = data.user.email ?? "";
  const fallback = email.split("@")[0] || "Student";
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", data.user.id)
    .maybeSingle();
  return {
    id: data.user.id,
    email,
    displayName: profile?.display_name || fallback,
  };
}
