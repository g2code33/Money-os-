import { buildToEarnLoop } from "./business-loop";
import { requiresApproval, getDefaultAutoApprovalLevel } from "./permissions";
import type { Plan, Task } from "./types";

export function createInitialCeoPlan(input?: { mission?: string }): Plan {
  const mission = input?.mission?.trim() || "Find one profitable pharmacy/software opportunity and reach the first $1 revenue milestone.";

  const tasks: Task[] = [
    {
      id: crypto.randomUUID(),
      title: "Discover painful pharmacy operations problems with evidence of payment demand",
      owner: "Research Agent",
      status: "todo",
      riskLevel: 1,
      createdAt: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      title: "Validate top opportunities using competitor pricing, interviews, or paid pilots",
      owner: "Research Agent",
      status: "todo",
      riskLevel: 1,
      createdAt: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      title: "Draft MVP scope for the highest scoring opportunity",
      owner: "Builder Agent",
      status: "todo",
      riskLevel: 2,
      createdAt: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      title: "Create a simple offer and landing-page copy for early customers",
      owner: "Business Agent",
      status: "todo",
      riskLevel: 2,
      createdAt: new Date().toISOString()
    }
  ];

  const publishNeedsApproval = requiresApproval(4, getDefaultAutoApprovalLevel());

  return {
    mission,
    assumptions: [
      "MoneyOS is cloud-first so weak devices only need a browser.",
      "The first measurable business objective is $1 real revenue, not vague automation.",
      "Loop engineering is used to force every project through discover, validate, build, launch, sell, measure, and learn.",
      "Graph engineering is used to model agents, tools, permissions, and feedback paths instead of letting actions become chaotic."
    ],
    tasks,
    risks: [
      "AI API usage can create costs, so budget caps are required.",
      "Publishing, customer contact, deployment, and financial actions require approval.",
      "Research must separate evidence from guesses."
    ],
    nextApproval: publishNeedsApproval
      ? {
          id: crypto.randomUUID(),
          action: "Allow MoneyOS to deploy or publish generated assets",
          requestedBy: "AI CEO",
          permissionLevel: 4,
          reason: "Deployment changes public systems and must be reviewed first.",
          status: "pending"
        }
      : undefined
  };
}
