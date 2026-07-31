import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runGovernorCycle } from "../../../../lib/governor";
import { persistGovernorCycle } from "../../../../lib/db";

const schema = z.object({
  mission: z.string().max(800).optional(),
  automationMode: z.enum(["supervised", "auto-green-yellow", "maximum-safe"]).optional()
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const cycle = await runGovernorCycle(parsed.data);
  const persisted = await persistGovernorCycle(cycle);
  return NextResponse.json({ cycle, persisted });
}

export async function GET() {
  const cycle = await runGovernorCycle({});
  return NextResponse.json({ cycle, persisted: false });
}
