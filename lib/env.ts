export type PublicSupabaseConfig = {
  url: string;
  anonKey: string;
};

export function getPublicSupabaseConfig(): PublicSupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

export function getServiceRoleKey(): string | null {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return key || null;
}

export function getMlUrl(): string | null {
  const value = process.env.TRUTHLENS_ML_URL?.trim();
  return value || null;
}

export function getGeminiApiKey(): string | null {
  const value = process.env.GEMINI_API_KEY?.trim();
  return value || null;
}

export function getGemmaModelOverride(): string | null {
  const value = process.env.GOOGLE_GEMMA_MODEL?.trim();
  return value || null;
}

export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined, allowlist = adminEmails()): boolean {
  if (!email) return false;
  return allowlist.includes(email.trim().toLowerCase());
}
