import { agentConfigs, getAgentApiStatus } from "./agent-config";
import { getSupabaseAdmin, isSupabaseConfigured } from "./db";

export type IntegrationStatus = {
  vercel: {
    detected: boolean;
    env: string;
    url?: string;
    analyticsPlugin: boolean;
    speedInsightsPlugin: boolean;
    cronConfigured: boolean;
    cronSecretConfigured: boolean;
  };
  supabase: {
    configured: boolean;
    connected: boolean;
    mode: "cloud" | "demo";
    error?: string;
  };
  ai: ReturnType<typeof getAgentApiStatus>[];
};

export async function getIntegrationStatus(): Promise<IntegrationStatus> {
  const supabase = getSupabaseAdmin();
  let connected = false;
  let error: string | undefined;

  if (supabase) {
    const result = await supabase.from("agents").select("id", { count: "exact", head: true });
    connected = !result.error;
    error = result.error?.message;
  }

  return {
    vercel: {
      detected: Boolean(process.env.VERCEL),
      env: process.env.VERCEL_ENV || "local",
      url: process.env.VERCEL_URL,
      analyticsPlugin: true,
      speedInsightsPlugin: true,
      cronConfigured: true,
      cronSecretConfigured: Boolean(process.env.CRON_SECRET)
    },
    supabase: {
      configured: isSupabaseConfigured,
      connected,
      mode: connected ? "cloud" : "demo",
      error
    },
    ai: agentConfigs.map(getAgentApiStatus)
  };
}
