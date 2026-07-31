import { NextResponse } from "next/server";
import { agentConfigs, getAgentApiStatus } from "../../../../lib/agent-config";

export async function GET() {
  return NextResponse.json({ agents: agentConfigs.map(getAgentApiStatus) });
}
