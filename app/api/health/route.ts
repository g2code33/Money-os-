import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "../../../lib/db";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "MoneyOS Cloud",
    version: "0.1.0",
    database: isSupabaseConfigured ? "supabase" : "demo-mode"
  });
}
