export type GraphNode = {
  id: string;
  label: string;
  type: "human" | "control" | "agent" | "engine" | "external";
};

export type GraphEdge = {
  from: string;
  to: string;
  label: string;
  approvalGate?: boolean;
  auditEdge?: boolean;
};

export const moneyOsGraph = {
  nodes: [
    { id: "you", label: "You", type: "human" },
    { id: "dashboard", label: "Cloud Control Center", type: "control" },
    { id: "ceo", label: "AI CEO", type: "agent" },
    { id: "governor", label: "Governor Auditor", type: "agent" },
    { id: "research", label: "Research Agent", type: "agent" },
    { id: "builder", label: "Builder Agent", type: "agent" },
    { id: "business", label: "Business Agent", type: "agent" },
    { id: "analytics", label: "Analytics Agent", type: "agent" },
    { id: "qa", label: "QA Agent", type: "agent" },
    { id: "finance", label: "Finance Agent", type: "agent" },
    { id: "security", label: "Security Agent", type: "agent" },
    { id: "permissions", label: "Permission Engine", type: "engine" },
    { id: "memory", label: "Supabase Memory", type: "engine" },
    { id: "tools", label: "Cloud Tools/APIs", type: "external" }
  ] satisfies GraphNode[],
  edges: [
    { from: "you", to: "dashboard", label: "goals + approvals" },
    { from: "dashboard", to: "ceo", label: "mission + owner intent" },
    { from: "ceo", to: "research", label: "opportunity tasks" },
    { from: "ceo", to: "builder", label: "MVP tasks", approvalGate: true },
    { from: "ceo", to: "business", label: "launch/sales tasks", approvalGate: true },
    { from: "ceo", to: "analytics", label: "measurement requirements" },
    { from: "analytics", to: "ceo", label: "profit feedback" },
    { from: "qa", to: "ceo", label: "quality findings" },
    { from: "finance", to: "permissions", label: "spend request", approvalGate: true },
    { from: "security", to: "permissions", label: "risk decision", approvalGate: true },
    { from: "governor", to: "ceo", label: "audit strategy quality", auditEdge: true },
    { from: "governor", to: "research", label: "audit evidence", auditEdge: true },
    { from: "governor", to: "builder", label: "audit build scope", auditEdge: true },
    { from: "governor", to: "business", label: "audit offer/outreach", auditEdge: true },
    { from: "governor", to: "analytics", label: "audit metrics", auditEdge: true },
    { from: "governor", to: "finance", label: "audit budget discipline", auditEdge: true },
    { from: "governor", to: "security", label: "audit safety gates", auditEdge: true },
    { from: "permissions", to: "tools", label: "approved execution", approvalGate: true },
    { from: "ceo", to: "memory", label: "decisions" },
    { from: "research", to: "memory", label: "evidence" },
    { from: "governor", to: "memory", label: "audit logs", auditEdge: true }
  ] satisfies GraphEdge[]
};
