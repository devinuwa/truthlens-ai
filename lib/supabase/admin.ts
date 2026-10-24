import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getPublicSupabaseConfig, getServiceRoleKey } from "@/lib/env";

export function createAdminClient() {
  const config = getPublicSupabaseConfig();
  const serviceRoleKey = getServiceRoleKey();
  if (!config || !serviceRoleKey) {
    throw new Error("The service role key is not configured.");
  }
  return createClient(config.url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
