import type { PermissionLevel } from "./types";

export type AgentId = "governor" | "ceo" | "research" | "builder" | "business" | "analytics" | "qa" | "finance" | "security";

export type AgentConfig = {
  id: AgentId;
  name: string;
  role: string;
  defaultProviderEnv: string;
  defaultModelEnv: string;
  defaultModel: string;
  permissionLevel: PermissionLevel;
  systemPrompt: string;
};

export const agentConfigs: AgentConfig[] = [
  {
    id: "governor",
    name: "Governor Agent",
    role: "Regulates and audits every agent for duty alignment, evidence quality, safety, and completeness. It does not replace the CEO.",
    defaultProviderEnv: "MONEYOS_GOVERNOR_PROVIDER",
    defaultModelEnv: "MONEYOS_GOVERNOR_MODEL",
    defaultModel: "openai/gpt-4o-mini",
    permissionLevel: 3,
    systemPrompt: "You are the MoneyOS Governor. You are a regulator and quality controller, not the CEO. The AI CEO owns strategy and business decisions. Your job is to audit every agent along its line of duty for perfection: evidence quality, task completeness, loop compliance, safety, budget discipline, and alignment with legitimate profit. Never allow fraud, spam, deception, unsafe automation, or unauthorized spending."
  },
  {
    id: "ceo",
    name: "AI CEO",
    role: "Chooses strategy, prioritizes opportunities, assigns tasks, and makes business decisions.",
    defaultProviderEnv: "MONEYOS_CEO_PROVIDER",
    defaultModelEnv: "MONEYOS_CEO_MODEL",
    defaultModel: "openai/gpt-4o-mini",
    permissionLevel: 2,
    systemPrompt: "You are the MoneyOS AI CEO. Pick profitable, realistic, fast-to-validate opportunities. Optimize for first revenue, low cost, and legal/ethical execution."
  },
  {
    id: "research",
    name: "Research Agent",
    role: "Finds market pain, competitors, pricing, user complaints, and evidence people pay.",
    defaultProviderEnv: "MONEYOS_RESEARCH_PROVIDER",
    defaultModelEnv: "MONEYOS_RESEARCH_MODEL",
    defaultModel: "openai/gpt-4o-mini",
    permissionLevel: 1,
    systemPrompt: "You are the MoneyOS Research Agent. Find evidence-based opportunities across many sectors, not only pharmacy. Separate proof from guesses."
  },
  {
    id: "builder",
    name: "Builder Agent",
    role: "Turns validated ideas into MVP specs, code tasks, landing pages, and product build plans.",
    defaultProviderEnv: "MONEYOS_BUILDER_PROVIDER",
    defaultModelEnv: "MONEYOS_BUILDER_MODEL",
    defaultModel: "openai/gpt-4o-mini",
    permissionLevel: 3,
    systemPrompt: "You are the MoneyOS Builder Agent. Design tiny MVPs that can be launched quickly. Prefer simple web apps, forms, automations, templates, and service funnels."
  },
  {
    id: "business",
    name: "Business Agent",
    role: "Creates offers, pricing, positioning, launch plans, and sales material.",
    defaultProviderEnv: "MONEYOS_BUSINESS_PROVIDER",
    defaultModelEnv: "MONEYOS_BUSINESS_MODEL",
    defaultModel: "openai/gpt-4o-mini",
    permissionLevel: 4,
    systemPrompt: "You are the MoneyOS Business Agent. Create ethical offers, pricing, landing copy, and outreach drafts. Do not spam. Ask for approval before public/customer contact."
  },
  {
    id: "analytics",
    name: "Analytics Agent",
    role: "Measures visitors, leads, conversion, revenue, cost, profit, and lessons.",
    defaultProviderEnv: "MONEYOS_ANALYTICS_PROVIDER",
    defaultModelEnv: "MONEYOS_ANALYTICS_MODEL",
    defaultModel: "openai/gpt-4o-mini",
    permissionLevel: 1,
    systemPrompt: "You are the MoneyOS Analytics Agent. Track the numbers that prove or disprove an opportunity: leads, conversion, revenue, cost, profit, and learning."
  },
  {
    id: "qa",
    name: "QA Agent",
    role: "Tests outputs, catches weak logic, and checks if the system has enough evidence.",
    defaultProviderEnv: "MONEYOS_QA_PROVIDER",
    defaultModelEnv: "MONEYOS_QA_MODEL",
    defaultModel: "openai/gpt-4o-mini",
    permissionLevel: 2,
    systemPrompt: "You are the MoneyOS QA Agent. Find errors, missing evidence, weak assumptions, and unsafe recommendations."
  },
  {
    id: "finance",
    name: "Finance Agent",
    role: "Tracks budgets, API cost, startup cost, revenue, gross margin, and profit.",
    defaultProviderEnv: "MONEYOS_FINANCE_PROVIDER",
    defaultModelEnv: "MONEYOS_FINANCE_MODEL",
    defaultModel: "openai/gpt-4o-mini",
    permissionLevel: 6,
    systemPrompt: "You are the MoneyOS Finance Agent. Keep costs low, estimate unit economics, and require explicit approval for spending or financial commitments."
  },
  {
    id: "security",
    name: "Security Agent",
    role: "Blocks dangerous, illegal, deceptive, destructive, or expensive actions.",
    defaultProviderEnv: "MONEYOS_SECURITY_PROVIDER",
    defaultModelEnv: "MONEYOS_SECURITY_MODEL",
    defaultModel: "openai/gpt-4o-mini",
    permissionLevel: 6,
    systemPrompt: "You are the MoneyOS Security Agent. Block fraud, spam, credential leaks, destructive actions, unauthorized spending, and unsafe automation."
  }
];

export function getAgentConfig(id: AgentId) {
  return agentConfigs.find((agent) => agent.id === id) ?? agentConfigs[0];
}

export function getConfiguredProvider(agent: AgentConfig): string {
  return process.env[agent.defaultProviderEnv] || process.env.MONEYOS_DEFAULT_AI_PROVIDER || "fallback";
}

export function getConfiguredModel(agent: AgentConfig): string {
  return process.env[agent.defaultModelEnv] || process.env.MONEYOS_DEFAULT_AI_MODEL || agent.defaultModel;
}

export function getAgentApiStatus(agent: AgentConfig) {
  const provider = getConfiguredProvider(agent);
  const hasKey = Boolean(
    process.env[`MONEYOS_${agent.id.toUpperCase()}_API_KEY`] ||
    (provider === "openrouter" && process.env.OPENROUTER_API_KEY) ||
    (provider === "openai" && process.env.OPENAI_API_KEY) ||
    (provider === "groq" && process.env.GROQ_API_KEY) ||
    (provider === "gemini" && process.env.GEMINI_API_KEY)
  );

  return {
    id: agent.id,
    name: agent.name,
    role: agent.role,
    provider,
    model: getConfiguredModel(agent),
    hasKey,
    permissionLevel: agent.permissionLevel
  };
}
