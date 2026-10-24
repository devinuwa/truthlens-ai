import { NextResponse } from "next/server";
import { getMlUrl, getPublicSupabaseConfig } from "@/lib/env";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "truthlens-web",
    supabaseConfigured: Boolean(getPublicSupabaseConfig()),
    modelServiceConfigured: Boolean(getMlUrl()),
  });
}
