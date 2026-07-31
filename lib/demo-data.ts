import type { Agent, ApprovalRequest, BusinessGoal, Task } from "./types";

export const demoGoal: BusinessGoal = {
  id: "goal-first-dollar",
  title: "Generate the first $1 of legitimate revenue",
  objectiveMetric: "profit_usd",
  targetValue: 1,
  timeframe: "30 days"
};

export const demoAgents: Agent[] = [
  { id: "ceo", name: "AI CEO", role: "Strategy, planning, prioritization", status: "active", autonomyLevel: 1 },
  { id: "research", name: "Research Agent", role: "Opportunity discovery and competitor evidence", status: "active", autonomyLevel: 1 },
  { id: "builder", name: "Builder Agent", role: "MVP specs, code plans, implementation", status: "waiting", autonomyLevel: 2 },
  { id: "business", name: "Business Agent", role: "Offers, pricing, landing pages, customer pipeline", status: "waiting", autonomyLevel: 2 },
  { id: "analytics", name: "Analytics Agent", role: "Revenue, cost, conversion, lessons", status: "active", autonomyLevel: 1 }
];

export const demoTasks: Task[] = [
  {
    id: "task-001",
    title: "Research pharmacy expiry-management pain points in Ghanaian operations",
    owner: "Research Agent",
    status: "running",
    riskLevel: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: "task-002",
    title: "List competitors and pricing for pharmacy inventory/expiry tools",
    owner: "Research Agent",
    status: "todo",
    riskLevel: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: "task-003",
    title: "Score top 3 tiny MVPs by demand, difficulty, cost, revenue, advantage",
    owner: "AI CEO",
    status: "todo",
    riskLevel: 1,
    createdAt: new Date().toISOString()
  }
];

export const demoApprovals: ApprovalRequest[] = [
  {
    id: "approval-001",
    action: "Connect production payment provider",
    requestedBy: "Finance/Analytics Agent",
    permissionLevel: 6,
    reason: "Financial integrations are red-zone actions and must be explicitly approved.",
    status: "pending"
  }
];
