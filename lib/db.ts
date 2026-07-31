import { createClient } from "@supabase/supabase-js";
import { demoAgents, demoApprovals, demoGoal, demoTasks } from "./demo-data";
import type { Agent, ApprovalRequest, BusinessGoal, Plan, Task } from "./types";
import type { GovernorCycle } from "./governor";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && serviceRoleKey);

export function getSupabaseAdmin() {
  if (!supabaseUrl || !serviceRoleKey) return null;
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });
}

export async function getDashboardData(): Promise<{
  goal: BusinessGoal;
  agents: Agent[];
  tasks: Task[];
  approvals: ApprovalRequest[];
  mode: "demo" | "supabase";
}> {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return { goal: demoGoal, agents: demoAgents, tasks: demoTasks, approvals: demoApprovals, mode: "demo" };
  }

  const [goals, agents, tasks, approvals] = await Promise.all([
    supabase.from("goals").select("*").order("created_at", { ascending: false }).limit(1),
    supabase.from("agents").select("*").order("name"),
    supabase.from("tasks").select("*").order("created_at", { ascending: false }).limit(20),
    supabase.from("approval_requests").select("*").eq("status", "pending").order("created_at", { ascending: false }).limit(20)
  ]);

  if (goals.error || agents.error || tasks.error || approvals.error) {
    return { goal: demoGoal, agents: demoAgents, tasks: demoTasks, approvals: demoApprovals, mode: "demo" };
  }

  return {
    goal: mapGoal(goals.data?.[0]) ?? demoGoal,
    agents: agents.data?.map(mapAgent) ?? demoAgents,
    tasks: tasks.data?.map(mapTask) ?? demoTasks,
    approvals: approvals.data?.map(mapApproval) ?? demoApprovals,
    mode: "supabase"
  };
}

export async function persistCeoPlan(mission: string, plan: Plan): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

  const taskRows = plan.tasks.map((task) => ({
    id: task.id,
    title: task.title,
    owner: task.owner,
    status: task.status,
    risk_level: task.riskLevel,
    created_at: task.createdAt,
    metadata: { mission, source: "ai_ceo_plan" }
  }));

  const writes = [
    supabase.from("goals").insert({
      title: mission,
      objective_metric: "profit_usd",
      target_value: 1,
      timeframe: "30 days"
    }),
    supabase.from("tasks").insert(taskRows),
    supabase.from("memories").insert({
      memory_type: "decision",
      title: "AI CEO plan created",
      content: JSON.stringify({ mission, assumptions: plan.assumptions, risks: plan.risks }, null, 2),
      evidence: { task_count: plan.tasks.length, has_approval_request: Boolean(plan.nextApproval) }
    })
  ];

  if (plan.nextApproval) {
    writes.push(
      supabase.from("approval_requests").insert({
        id: plan.nextApproval.id,
        action: plan.nextApproval.action,
        requested_by: plan.nextApproval.requestedBy,
        permission_level: plan.nextApproval.permissionLevel,
        reason: plan.nextApproval.reason,
        status: plan.nextApproval.status
      })
    );
  }

  const results = await Promise.all(writes);
  return results.every((result) => !result.error);
}

export async function persistGovernorCycle(cycle: GovernorCycle): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

  const cycleWrite = await supabase.from("governor_cycles").insert({
    id: cycle.id,
    mission: cycle.mission,
    automation_mode: cycle.automationMode,
    loop_stage: cycle.loopStage,
    summary: cycle.summary,
    next_action: cycle.nextAction,
    payload: cycle
  });
  if (cycleWrite.error) return false;

  const taskRows = cycle.tasks.map((task) => ({
    id: task.id,
    title: task.title,
    owner: task.owner,
    status: task.status,
    risk_level: task.riskLevel,
    created_at: task.createdAt,
    metadata: { cycle_id: cycle.id, source: "governor" }
  }));

  const opportunityRows = cycle.opportunities.map((opportunity) => ({
    id: opportunity.id,
    cycle_id: cycle.id,
    title: opportunity.title,
    sector: opportunity.sector,
    customer: opportunity.customer,
    problem: opportunity.problem,
    tiny_offer: opportunity.tinyOffer,
    price_idea: opportunity.priceIdea,
    score: opportunity.score,
    evidence_needed: opportunity.evidenceNeeded,
    first_action: opportunity.firstAction
  }));

  const agentRows = cycle.agentOutputs.map((output) => ({
    cycle_id: cycle.id,
    agent_id: output.agentId,
    agent_name: output.agentName,
    status: output.status,
    output: output.output
  }));

  const auditRows = cycle.governorAudits.map((audit) => ({
    id: audit.id,
    cycle_id: cycle.id,
    agent_id: audit.agentId,
    agent_name: audit.agentName,
    verdict: audit.verdict,
    score: audit.score,
    checklist: audit.checklist,
    correction: audit.correction
  }));

  const approvalRows = cycle.approvals.map((approval) => ({
    id: approval.id,
    action: approval.action,
    requested_by: approval.requestedBy,
    permission_level: approval.permissionLevel,
    reason: approval.reason,
    status: approval.status
  }));

  const writes = await Promise.all([
    taskRows.length ? supabase.from("tasks").insert(taskRows) : Promise.resolve({ error: null }),
    opportunityRows.length ? supabase.from("opportunities").insert(opportunityRows) : Promise.resolve({ error: null }),
    agentRows.length ? supabase.from("agent_outputs").insert(agentRows) : Promise.resolve({ error: null }),
    auditRows.length ? supabase.from("governor_audits").insert(auditRows) : Promise.resolve({ error: null }),
    approvalRows.length ? supabase.from("approval_requests").insert(approvalRows) : Promise.resolve({ error: null }),
    supabase.from("memories").insert({
      memory_type: "governor_cycle",
      title: "Governor cycle completed",
      content: cycle.summary,
      evidence: { cycle_id: cycle.id, opportunity_count: cycle.opportunities.length, task_count: cycle.tasks.length, audit_count: cycle.governorAudits.length }
    })
  ]);

  return writes.every((write) => !write.error);
}

function mapGoal(row: any): BusinessGoal | null {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    objectiveMetric: row.objective_metric,
    targetValue: Number(row.target_value),
    timeframe: row.timeframe
  };
}

function mapAgent(row: any): Agent {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    status: row.status,
    autonomyLevel: row.autonomy_level
  };
}

function mapTask(row: any): Task {
  return {
    id: row.id,
    title: row.title,
    owner: row.owner,
    status: row.status,
    riskLevel: row.risk_level,
    createdAt: row.created_at
  };
}

function mapApproval(row: any): ApprovalRequest {
  return {
    id: row.id,
    action: row.action,
    requestedBy: row.requested_by,
    permissionLevel: row.permission_level,
    reason: row.reason,
    status: row.status
  };
}
