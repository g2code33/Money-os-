import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createInitialCeoPlan } from "../../../../lib/ceo";
import { isSupabaseConfigured, persistCeoPlan } from "../../../../lib/db";

const schema = z.object({
  mission: z.string().max(500).optional()
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const plan = createInitialCeoPlan(parsed.data);
  const persisted = await persistCeoPlan(plan.mission, plan);

  return NextResponse.json({
    plan,
    mode: isSupabaseConfigured ? "supabase" : "demo",
    persisted
  });
}

export async function GET() {
  const plan = createInitialCeoPlan();
  return NextResponse.json({
    plan,
    mode: isSupabaseConfigured ? "supabase" : "demo",
    persisted: false
  });
}
