import { getAgentConfig, getConfiguredModel, getConfiguredProvider, type AgentId } from "./agent-config";

export type AgentAiResult = {
  text: string;
  provider: string;
  model: string;
  usedFallback: boolean;
};

type CallAgentInput = {
  agentId: AgentId;
  userPrompt: string;
  temperature?: number;
};

export async function callAgentAi(input: CallAgentInput): Promise<AgentAiResult | null> {
  const agent = getAgentConfig(input.agentId);
  const provider = getConfiguredProvider(agent).toLowerCase();
  const model = getConfiguredModel(agent);
  const apiKey = process.env[`MONEYOS_${agent.id.toUpperCase()}_API_KEY`] || getProviderKey(provider);

  if (!apiKey || provider === "fallback") return null;

  if (["openrouter", "openai", "groq"].includes(provider)) {
    return callOpenAiCompatible({ provider, model, apiKey, systemPrompt: agent.systemPrompt, userPrompt: input.userPrompt, temperature: input.temperature ?? 0.3 });
  }

  if (provider === "gemini") {
    return callGemini({ model, apiKey, systemPrompt: agent.systemPrompt, userPrompt: input.userPrompt, temperature: input.temperature ?? 0.3 });
  }

  return null;
}

function getProviderKey(provider: string): string | undefined {
  if (provider === "openrouter") return process.env.OPENROUTER_API_KEY;
  if (provider === "openai") return process.env.OPENAI_API_KEY;
  if (provider === "groq") return process.env.GROQ_API_KEY;
  if (provider === "gemini") return process.env.GEMINI_API_KEY;
  return undefined;
}

function getCompatibleEndpoint(provider: string) {
  if (provider === "openrouter") return "https://openrouter.ai/api/v1/chat/completions";
  if (provider === "groq") return "https://api.groq.com/openai/v1/chat/completions";
  return "https://api.openai.com/v1/chat/completions";
}

async function callOpenAiCompatible(input: {
  provider: string;
  model: string;
  apiKey: string;
  systemPrompt: string;
  userPrompt: string;
  temperature: number;
}): Promise<AgentAiResult> {
  const response = await fetch(getCompatibleEndpoint(input.provider), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${input.apiKey}`,
      ...(input.provider === "openrouter" ? { "HTTP-Referer": "https://moneyos.local", "X-Title": "MoneyOS" } : {})
    },
    body: JSON.stringify({
      model: input.model,
      temperature: input.temperature,
      messages: [
        { role: "system", content: input.systemPrompt },
        { role: "user", content: input.userPrompt }
      ]
    })
  });

  if (!response.ok) throw new Error(`${input.provider} API error: ${response.status} ${await response.text()}`);
  const data = await response.json();
  return {
    text: data.choices?.[0]?.message?.content ?? "",
    provider: input.provider,
    model: input.model,
    usedFallback: false
  };
}

async function callGemini(input: {
  model: string;
  apiKey: string;
  systemPrompt: string;
  userPrompt: string;
  temperature: number;
}): Promise<AgentAiResult> {
  const model = input.model.startsWith("gemini-") ? input.model : "gemini-1.5-flash";
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${input.apiKey}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      generationConfig: { temperature: input.temperature },
      contents: [{ role: "user", parts: [{ text: `${input.systemPrompt}\n\n${input.userPrompt}` }] }]
    })
  });

  if (!response.ok) throw new Error(`gemini API error: ${response.status} ${await response.text()}`);
  const data = await response.json();
  return {
    text: data.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text ?? "").join("") ?? "",
    provider: "gemini",
    model,
    usedFallback: false
  };
}
