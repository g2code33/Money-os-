import { NextRequest, NextResponse } from "next/server";
import { runGovernorCycle } from "../../../../lib/governor";
import { persistGovernorCycle } from "../../../../lib/db";

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cycle = await runGovernorCycle({
    mission: process.env.MONEYOS_AUTOMATION_MISSION || "Generate legitimate revenue across ethical niches using low-cost software, services, automations, or digital products.",
    automationMode: "maximum-safe"
  });
  const persisted = await persistGovernorCycle(cycle);
  return NextResponse.json({ ok: true, persisted, cycle });
}
