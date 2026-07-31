export type AgentStatus = "active" | "waiting" | "paused" | "testing" | "building";

export type Agent = {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  autonomyLevel: PermissionLevel;
};

export type PermissionLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type TaskStatus = "todo" | "running" | "blocked" | "done";

export type Task = {
  id: string;
  title: string;
  owner: string;
  status: TaskStatus;
  riskLevel: PermissionLevel;
  createdAt: string;
};

export type ApprovalRequest = {
  id: string;
  action: string;
  requestedBy: string;
  permissionLevel: PermissionLevel;
  reason: string;
  status: "pending" | "approved" | "rejected";
};

export type BusinessGoal = {
  id: string;
  title: string;
  objectiveMetric: string;
  targetValue: number;
  timeframe: string;
};

export type Plan = {
  mission: string;
  assumptions: string[];
  tasks: Task[];
  risks: string[];
  nextApproval?: ApprovalRequest;
};
