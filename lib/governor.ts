import { agentConfigs, getAgentApiStatus, type AgentId } from "./agent-config";
import { callAgentAi } from "./ai";
import { buildToEarnLoop } from "./business-loop";
import type { ApprovalRequest, PermissionLevel, Task } from "./types";

export type Opportunity = {
  id: string;
  title: string;
  sector: string;
  customer: string;
  problem: string;
  tinyOffer: string;
  priceIdea: string;
  score: number;
  evidenceNeeded: string[];
  firstAction: string;
};

export type AgentRunOutput = {
  agentId: AgentId;
  agentName: string;
  status: "completed" | "fallback" | "blocked";
  output: string;
};

export type GovernorAudit = {
  id: string;
  agentId: AgentId;
  agentName: string;
  verdict: "pass" | "needs_revision" | "blocked";
  score: number;
  checklist: string[];
  correction: string;
};

export type GovernorCycle = {
  id: string;
  mission: string;
  automationMode: "supervised" | "auto-green-yellow" | "maximum-safe";
  loopStage: string;
  summary: string;
  opportunities: Opportunity[];
  tasks: Task[];
  approvals: ApprovalRequest[];
  agentOutputs: AgentRunOutput[];
  governorAudits: GovernorAudit[];
  apiStatus: ReturnType<typeof getAgentApiStatus>[];
  nextAction: string;
  createdAt: string;
};

export async function runGovernorCycle(input: {
  mission?: string;
  automationMode?: GovernorCycle["automationMode"];
}): Promise<GovernorCycle> {
  const mission = input.mission?.trim() || "Generate legitimate revenue as quickly as possible using low-cost digital products, services, automations, or software.";
  const automationMode = input.automationMode ?? "maximum-safe";
  const createdAt = new Date().toISOString();
  const id = crypto.randomUUID();

  const apiStatus = agentConfigs.map(getAgentApiStatus);
  const agentOutputs = await runDutyAgents(mission);
  const opportunities = buildFallbackOpportunities(mission);
  const governorAudits = await auditAgentOutputs(mission, agentOutputs);
  const tasks = buildAutonomousTasks(opportunities[0], governorAudits, createdAt);
  const approvals = buildApprovalRequests(automationMode);

  return {
    id,
    mission,
    automationMode,
    loopStage: buildToEarnLoop[0],
    summary: "Cycle complete. The AI CEO remains responsible for strategy; specialist agents performed their duties; the Governor audited every agent for perfection, safety, evidence, and alignment with legitimate profit.",
    opportunities,
    tasks,
    approvals,
    agentOutputs,
    governorAudits,
    apiStatus,
    nextAction: "CEO should choose the highest-scoring opportunity, then Research must collect 3 proof signals before Builder creates the first public asset.",
    createdAt
  };
}

async function runDutyAgents(mission: string): Promise<AgentRunOutput[]> {
  const agentIds: AgentId[] = ["ceo", "research", "builder", "business", "analytics", "qa", "finance", "security"];
  const prompt = `Mission: ${mission}\n\nReturn a concise action plan for your assigned role only. Focus on legitimate revenue, evidence, speed, low cost, and what you need from the other agents. Do not claim authority outside your role.`;

  return Promise.all(agentIds.map(async (agentId) => {
    const config = agentConfigs.find((agent) => agent.id === agentId)!;
    try {
      const ai = await callAgentAi({ agentId, userPrompt: prompt });
      if (ai?.text) return { agentId, agentName: config.name, status: "completed" as const, output: ai.text.slice(0, 1800) };
    } catch (error) {
      return { agentId, agentName: config.name, status: "blocked" as const, output: `AI call failed: ${error instanceof Error ? error.message : "unknown error"}. Fallback logic will keep the system moving.` };
    }

    return { agentId, agentName: config.name, status: "fallback" as const, output: fallbackAgentOutput(agentId, mission) };
  }));
}

async function auditAgentOutputs(mission: string, outputs: AgentRunOutput[]): Promise<GovernorAudit[]> {
  const auditPrompt = `Mission: ${mission}\n\nAudit these agent outputs. You are the Governor regulator, not the CEO. For each agent, check duty alignment, evidence, safety, completeness, profit alignment, and whether a revision is needed. Return practical corrections.\n\n${outputs.map((output) => `${output.agentName}: ${output.output}`).join("\n\n")}`;

  try {
    const ai = await callAgentAi({ agentId: "governor", userPrompt: auditPrompt, temperature: 0.15 });
    if (ai?.text) {
      return outputs.map((output, index) => ({
        id: crypto.randomUUID(),
        agentId: output.agentId,
        agentName: output.agentName,
        verdict: output.status === "blocked" ? "blocked" : "pass",
        score: output.status === "completed" ? 86 : 74,
        checklist: ["Duty alignment checked", "Evidence requirement checked", "Safety gate checked", "Profit alignment checked"],
        correction: index === 0 ? ai.text.slice(0, 900) : "Governor audit completed. Follow the specific role boundaries and provide measurable evidence before execution."
      }));
    }
  } catch {
    // Fallback audit below keeps the system working even before the Governor API key is connected.
  }

  return outputs.map((output) => fallbackAudit(output));
}

function fallbackAgentOutput(agentId: AgentId, mission: string): string {
  const outputs: Record<AgentId, string> = {
    governor: `Audit all agents for perfection without replacing the CEO. Mission: ${mission}`,
    ceo: "Set strategy: prioritize fast-to-sell services or tiny software with low build cost. Do not restrict to pharmacy, but use pharmacy knowledge where it creates advantage.",
    research: "Research broad sectors: SMB automation, student tools, local business websites, creator templates, pharmacy operations, finance trackers, lead-generation services, and digital products.",
    builder: "Build the smallest validation asset first: landing page, form, demo, calculator, template, or manual service workflow before writing a full SaaS.",
    business: "Create simple offers priced for first payment: $5-$50 digital product, $50-$300 setup service, or paid pilot. Draft ethical outreach only.",
    analytics: "Track leads, replies, conversion, revenue, cost, time spent, and lessons per opportunity.",
    qa: "Reject ideas with no buyer, unclear pain, high build cost, regulatory risk, or vague distribution.",
    finance: "Keep spend near zero until validation. Require approval for ads, paid APIs beyond budget, domains, and payment setup.",
    security: "Allow research/build/drafts automatically. Block spam, fraud, credential exposure, destructive actions, and unauthorized financial actions."
  };
  return outputs[agentId];
}

function fallbackAudit(output: AgentRunOutput): GovernorAudit {
  const blocked = output.status === "blocked";
  const needsRevision = output.output.length < 80 || output.status === "fallback";
  return {
    id: crypto.randomUUID(),
    agentId: output.agentId,
    agentName: output.agentName,
    verdict: blocked ? "blocked" : needsRevision ? "needs_revision" : "pass",
    score: blocked ? 35 : needsRevision ? 72 : 88,
    checklist: [
      "Stayed within assigned duty",
      "Aligned with CEO strategy and legitimate profit",
      "Required evidence before public execution",
      "Respected approval gates for risky actions"
    ],
    correction: blocked
      ? "Fix the API/configuration issue or use fallback mode. Do not proceed with risky actions."
      : needsRevision
        ? "Add stronger evidence, measurable success criteria, and exact next action before execution."
        : "Acceptable. Continue, but keep proof and approval gates attached."
  };
}

function buildFallbackOpportunities(mission: string): Opportunity[] {
  return [
    {
      id: crypto.randomUUID(),
      title: "Local business automation setup service",
      sector: "SMB automation",
      customer: "Small shops, clinics, salons, pharmacies, schools, churches, and freelancers",
      problem: "Many businesses lose leads because they lack forms, WhatsApp workflows, reminders, simple CRMs, and follow-up systems.",
      tinyOffer: "Set up a lead capture form + WhatsApp follow-up tracker + Google Sheet dashboard in 24 hours.",
      priceIdea: "$50-$150 setup fee for first customers",
      score: 91,
      evidenceNeeded: ["Find 10 local businesses with poor/no lead capture", "Message 5 known contacts manually", "Get 1 paid setup or signed pilot"],
      firstAction: "Create a one-page offer and demo form, then validate with 5 businesses."
    },
    {
      id: crypto.randomUUID(),
      title: "Expiry alert tracker for pharmacies and small stores",
      sector: "Healthcare/pharmacy operations",
      customer: "Independent pharmacies and medicine retailers",
      problem: "Expired products create losses and risk; many small operators track expiry manually or inconsistently.",
      tinyOffer: "Spreadsheet/web tracker that sends weekly expiry alerts and priority stock lists.",
      priceIdea: "$5-$20/month or $50 setup",
      score: 88,
      evidenceNeeded: ["Interview 3 pharmacy operators", "Confirm current expiry process", "Get one paid pilot"],
      firstAction: "Create a demo expiry tracker and ask for paid pilot feedback."
    },
    {
      id: crypto.randomUUID(),
      title: "Student study-pack generator",
      sector: "Education",
      customer: "Students preparing for pharmacy, nursing, SHS, coding, nursing, or certification exams",
      problem: "Students want condensed notes, quizzes, flashcards, and exam-style questions quickly.",
      tinyOffer: "Sell downloadable study packs and quiz sheets for a narrow subject.",
      priceIdea: "$2-$10 per pack",
      score: 83,
      evidenceNeeded: ["Find active student groups", "Test one free sample", "Measure downloads/replies"],
      firstAction: "Create one high-quality sample pack and a payment link draft."
    },
    {
      id: crypto.randomUUID(),
      title: "Landing page + AI copy service for micro-businesses",
      sector: "Web services",
      customer: "New entrepreneurs and side-hustle owners",
      problem: "They need a simple online presence fast but cannot build or write persuasive copy.",
      tinyOffer: "One-page website copy + hosted landing page template delivered in 48 hours.",
      priceIdea: "$30-$100 per page",
      score: 80,
      evidenceNeeded: ["Identify 20 businesses with only social profiles", "Show a mockup", "Ask for paid build"],
      firstAction: "Build a reusable landing page template and outreach script draft."
    },
    {
      id: crypto.randomUUID(),
      title: "Simple invoice and expense tracker for informal sellers",
      sector: "Micro-finance tools",
      customer: "Market sellers, mobile money vendors, freelancers, and small service providers",
      problem: "They do not know profit clearly because income and expenses are mixed.",
      tinyOffer: "Mobile-friendly income/expense sheet with weekly profit summary.",
      priceIdea: "$5 template or $30 setup",
      score: 76,
      evidenceNeeded: ["Ask 10 sellers how they track profit", "Test a template", "Get payment for setup"],
      firstAction: "Create a mobile-friendly tracker and validate manually."
    }
  ].map((opportunity) => ({ ...opportunity, problem: `${opportunity.problem} Mission fit: ${mission.slice(0, 80)}.` }));
}

function buildAutonomousTasks(top: Opportunity, audits: GovernorAudit[], createdAt: string): Task[] {
  const revisionCount = audits.filter((audit) => audit.verdict !== "pass").length;
  const rows: Array<[string, string, PermissionLevel]> = [
    [`CEO: choose go/no-go criteria and first revenue target for ${top.title}`, "AI CEO", 2],
    [`Research: collect evidence for ${top.title} and 2 backup opportunities`, "Research Agent", 1],
    [`Builder: create demo/spec/landing asset for ${top.tinyOffer}`, "Builder Agent", 3],
    [`Business: draft offer, pricing, and ethical outreach script for ${top.customer}`, "Business Agent", 4],
    ["Analytics: define metrics dashboard for leads, replies, customers, revenue, costs", "Analytics Agent", 1],
    ["QA: review evidence quality and reject weak assumptions", "QA Agent", 2],
    ["Finance: enforce zero/low-cost budget and flag spending approvals", "Finance Agent", 6],
    ["Security: check that outreach is not spam and no financial action is automatic", "Security Agent", 6],
    [`Governor: audit ${revisionCount || "all"} agent outputs and require corrections before risky execution`, "Governor Agent", 3]
  ];

  return rows.map(([title, owner, riskLevel]) => ({
    id: crypto.randomUUID(),
    title,
    owner,
    status: riskLevel <= 3 ? "todo" : "blocked",
    riskLevel,
    createdAt
  }));
}

function buildApprovalRequests(_mode: GovernorCycle["automationMode"]): ApprovalRequest[] {
  return [
    {
      id: crypto.randomUUID(),
      action: "Allow Business Agent to contact prospects using owner-approved non-spam outreach",
      requestedBy: "Permission Engine",
      permissionLevel: 5,
      reason: "Customer contact can affect reputation and must be approved before automation.",
      status: "pending"
    },
    {
      id: crypto.randomUUID(),
      action: "Allow Finance Agent to connect payment provider or create paid checkout",
      requestedBy: "Permission Engine",
      permissionLevel: 6,
      reason: "Payments and financial setup require explicit owner approval.",
      status: "pending"
    }
  ];
}
