"use client";

import { useEffect, useMemo, useState } from "react";
import { buildToEarnLoop, loopSignals } from "../../lib/business-loop";
import { moneyOsGraph } from "../../lib/moneyos-graph";
import { permissionLabels } from "../../lib/permissions";
import type { Agent, ApprovalRequest, BusinessGoal, Task } from "../../lib/types";
import type { GovernorCycle, Opportunity } from "../../lib/governor";

type TabId = "command" | "governor" | "agents" | "opportunities" | "tasks" | "approvals" | "analytics" | "settings";

const tabs: Array<{ id: TabId; label: string; icon: string }> = [
  { id: "command", label: "Command", icon: "🏠" },
  { id: "governor", label: "Governor", icon: "🧭" },
  { id: "agents", label: "Agents", icon: "🤖" },
  { id: "opportunities", label: "Money", icon: "💰" },
  { id: "tasks", label: "Tasks", icon: "✅" },
  { id: "approvals", label: "Approvals", icon: "🛡️" },
  { id: "analytics", label: "Analytics", icon: "📊" },
  { id: "settings", label: "Settings", icon: "⚙️" }
];

export function Dashboard({
  goal,
  agents,
  tasks,
  approvals,
  mode
}: {
  goal: BusinessGoal;
  agents: Agent[];
  tasks: Task[];
  approvals: ApprovalRequest[];
  mode: "demo" | "supabase";
}) {
  const [activeTab, setActiveTab] = useState<TabId>("command");
  const [menuOpen, setMenuOpen] = useState(false);
  const [mission, setMission] = useState("Generate legitimate revenue fast using low-cost digital products, services, automations, or software. Do not restrict to pharmacy, but use pharmacy expertise when it gives advantage.");
  const [currentMission, setCurrentMission] = useState(goal.title);
  const [taskList, setTaskList] = useState<Task[]>(tasks);
  const [approvalList, setApprovalList] = useState<ApprovalRequest[]>(approvals);
  const [cycle, setCycle] = useState<GovernorCycle | null>(null);
  const [automationMode, setAutomationMode] = useState<GovernorCycle["automationMode"]>("maximum-safe");
  const [autoRunning, setAutoRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [integrationStatus, setIntegrationStatus] = useState<string>("Click check to verify Supabase, Vercel, cron, analytics, and AI agent keys.");
  const [eventLog, setEventLog] = useState<string[]>([
    "MoneyOS loaded.",
    "Governor is ready to audit CEO, Research, Builder, Business, Analytics, QA, Finance, and Security agents for perfection.",
    mode === "supabase" ? "Cloud memory is connected." : "Demo mode is active; connect Supabase for persistence."
  ]);

  const opportunities = cycle?.opportunities ?? [];
  const runningTasks = taskList.filter((task) => task.status === "running").length;
  const completedTasks = taskList.filter((task) => task.status === "done").length;
  const blockedTasks = taskList.filter((task) => task.status === "blocked").length;
  const pendingApprovals = useMemo(() => approvalList.filter((approval) => approval.status === "pending"), [approvalList]);
  const currentLoopStage = buildToEarnLoop[Math.min(completedTasks, buildToEarnLoop.length - 1)];
  const bestOpportunity = opportunities[0];

  useEffect(() => {
    if (!autoRunning) return;
    const interval = window.setInterval(() => {
      void runGovernor();
    }, 60000);
    return () => window.clearInterval(interval);
    // The interval intentionally captures the latest selected mission/mode values from this render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRunning, mission, automationMode]);

  async function runGovernor() {
    setLoading(true);
    setEventLog((logs) => [`Governor cycle started: ${mission}`, ...logs]);

    try {
      const response = await fetch("/api/governor/run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mission, automationMode })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ? JSON.stringify(data.error) : "Governor failed");

      const nextCycle: GovernorCycle = data.cycle;
      setCycle(nextCycle);
      setCurrentMission(nextCycle.mission);
      setTaskList((existing) => [...nextCycle.tasks, ...existing]);
      setApprovalList((existing) => [...nextCycle.approvals, ...existing]);
      setActiveTab("governor");
      setEventLog((logs) => [
        `Governor audit cycle completed: ${nextCycle.opportunities.length} opportunities, ${nextCycle.tasks.length} tasks, ${nextCycle.approvals.length} approvals.`,
        ...logs
      ]);
    } catch (error) {
      setEventLog((logs) => [`Governor error: ${error instanceof Error ? error.message : "unknown error"}`, ...logs]);
    } finally {
      setLoading(false);
    }
  }


  async function checkIntegrations() {
    try {
      const response = await fetch("/api/integrations/status");
      const data = await response.json();
      setIntegrationStatus(JSON.stringify(data, null, 2));
      setEventLog((logs) => ["Integration status checked.", ...logs]);
    } catch (error) {
      setIntegrationStatus(`Integration check failed: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  }

  function simulateNextTask() {
    setTaskList((existing) => {
      const next = [...existing];
      const runningIndex = next.findIndex((task) => task.status === "running");
      if (runningIndex >= 0) {
        next[runningIndex] = { ...next[runningIndex], status: "done" };
        setEventLog((logs) => [`Completed task: ${next[runningIndex].title}`, ...logs]);
        return next;
      }

      const todoIndex = next.findIndex((task) => task.status === "todo");
      if (todoIndex >= 0) {
        next[todoIndex] = { ...next[todoIndex], status: "running" };
        setEventLog((logs) => [`Started task: ${next[todoIndex].title}`, ...logs]);
        return next;
      }

      setEventLog((logs) => ["No runnable tasks left. Run another Governor cycle or approve blocked actions.", ...logs]);
      return existing;
    });
  }

  function decideApproval(id: string, status: "approved" | "rejected") {
    setApprovalList((existing) => existing.map((approval) => approval.id === id ? { ...approval, status } : approval));
    if (status === "approved") {
      setTaskList((existing) => existing.map((task) => task.status === "blocked" && task.riskLevel <= 5 ? { ...task, status: "todo" } : task));
    }
    setEventLog((logs) => [`Approval ${status}: ${id}`, ...logs]);
  }

  function selectTab(tabId: TabId) {
    setActiveTab(tabId);
    setMenuOpen(false);
  }

  return (
    <main className="app-shell">
      <aside className={menuOpen ? "sidebar open" : "sidebar"}>
        <div className="brand"><span>💸</span><strong>MoneyOS</strong></div>
        <nav className="tab-nav">
          {tabs.map((tab) => (
            <button key={tab.id} className={activeTab === tab.id ? "tab active" : "tab"} onClick={() => selectTab(tab.id)}>
              <span>{tab.icon}</span>{tab.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">Mode: {mode === "supabase" ? "Cloud memory" : "Demo"}</div>
      </aside>
      {menuOpen ? <button className="sidebar-backdrop" aria-label="Close navigation" onClick={() => setMenuOpen(false)} /> : null}

      <section className="main-panel">
        <header className="topbar">
          <button className="hamburger" onClick={() => setMenuOpen((value) => !value)} aria-label="Toggle navigation">☰</button>
          <div>
            <div className="eyebrow">MoneyOS Autonomous Business Engine</div>
            <strong>{currentMission}</strong>
          </div>
          <button className={autoRunning ? "secondary live" : "secondary"} onClick={() => setAutoRunning((value) => !value)}>
            {autoRunning ? "Auto ON" : "Auto OFF"}
          </button>
        </header>

        {activeTab === "command" ? (
          <TabFrame title="Command center" subtitle="Start here. The CEO leads strategy; agents perform duties; the Governor audits every agent for perfection while dangerous actions remain approval-gated.">
            <div className="grid cols-3 metrics-row">
              <Metric value="$0.00" label="Revenue tracked" />
              <Metric value={String(opportunities.length)} label="Opportunities found" />
              <Metric value={String(pendingApprovals.length)} label="Pending approvals" />
            </div>

            <div className="card strong-card">
              <h2>Mission</h2>
              <textarea value={mission} onChange={(event) => setMission(event.target.value)} rows={4} />
              <div className="actions">
                <button className="cta" onClick={() => void runGovernor()} disabled={loading}>{loading ? "Governor working..." : "Run Governor now"}</button>
                <button className="secondary" onClick={simulateNextTask}>Simulate next task</button>
                <select value={automationMode} onChange={(event) => setAutomationMode(event.target.value as GovernorCycle["automationMode"])}>
                  <option value="supervised">Supervised</option>
                  <option value="auto-green-yellow">Auto green/yellow</option>
                  <option value="maximum-safe">Maximum safe automation</option>
                </select>
              </div>
            </div>

            <LoopStrip activeStage={currentLoopStage} />
            <EventLog logs={eventLog} />
          </TabFrame>
        ) : null}

        {activeTab === "governor" ? (
          <TabFrame title="Governor" subtitle="The Governor does not replace the CEO. It audits each agent for duty alignment, evidence, safety, completeness, and profit focus.">
            <div className="grid cols-2">
              <div className="card"><h2>Latest cycle</h2>{cycle ? <CycleSummary cycle={cycle} /> : <p>No Governor cycle yet. Run one from Command.</p>}</div>
              <div className="card"><h2>Agent outputs</h2><AgentOutputs cycle={cycle} /></div>
              <div className="card"><h2>Governor audits</h2><GovernorAudits cycle={cycle} /></div>
            </div>
            <div className="card"><h2>Graph control</h2><p>Graph engineering keeps work compartmental: the CEO sets strategy, agents do their duties, and the Governor audits quality without taking over CEO authority. Agents cannot jump directly into spending, public deployment, or customer contact without permission gates.</p><div className="code">Nodes: {moneyOsGraph.nodes.map((node) => node.label).join(" → ")}\n\nApproval-gated edges: {moneyOsGraph.edges.filter((edge) => edge.approvalGate).map((edge) => `${edge.from} → ${edge.to}`).join(", ")}</div></div>
          </TabFrame>
        ) : null}

        {activeTab === "agents" ? (
          <TabFrame title="Agents" subtitle="Each agent can use its own API/model through environment variables.">
            <div className="grid cols-2">
              {(cycle?.apiStatus ?? agents.map((agent) => ({ id: agent.id, name: agent.name, role: agent.role, provider: "not configured", model: "fallback", hasKey: false, permissionLevel: agent.autonomyLevel }))).map((agent) => (
                <div className="card" key={agent.id}>
                  <div className="row compact"><div><strong>{agent.name}</strong><small>{agent.role}</small></div><span className={agent.hasKey ? "tag" : "tag warning"}>{agent.hasKey ? "API ready" : "fallback"}</span></div>
                  <div className="code">Provider: {agent.provider}\nModel: {agent.model}\nPermission: {permissionLabels[agent.permissionLevel]}</div>
                </div>
              ))}
            </div>
          </TabFrame>
        ) : null}

        {activeTab === "opportunities" ? (
          <TabFrame title="Money opportunities" subtitle="Not restricted to pharmacy. MoneyOS scans broad opportunities and uses pharmacy only as an advantage when useful.">
            {bestOpportunity ? <FeaturedOpportunity opportunity={bestOpportunity} /> : <p>Run the Governor to generate opportunities.</p>}
            <div className="grid cols-2">
              {opportunities.map((opportunity) => <OpportunityCard key={opportunity.id} opportunity={opportunity} />)}
            </div>
          </TabFrame>
        ) : null}

        {activeTab === "tasks" ? (
          <TabFrame title="Compartmental tasks" subtitle="Each agent gets its own work lane. High-risk lanes are blocked until approval.">
            <div className="grid cols-3 metrics-row"><Metric value={String(runningTasks)} label="Running" /><Metric value={String(completedTasks)} label="Completed" /><Metric value={String(blockedTasks)} label="Blocked" /></div>
            <TaskList tasks={taskList} />
          </TabFrame>
        ) : null}

        {activeTab === "approvals" ? (
          <TabFrame title="Approval governor" subtitle="Automatic does not mean reckless. Spending, public contact, and deployment remain controlled.">
            <ApprovalList approvals={pendingApprovals} onDecide={decideApproval} />
          </TabFrame>
        ) : null}

        {activeTab === "analytics" ? (
          <TabFrame title="Analytics" subtitle="The system optimizes for measurable profit: revenue minus costs and time.">
            <div className="grid cols-3 metrics-row"><Metric value="$0.00" label="Revenue" /><Metric value="$0.00" label="Cost" /><Metric value="$0.00" label="Profit" /></div>
            <div className="card"><h2>Loop evidence</h2>{loopSignals.map((signal) => <div className="row" key={signal.stage}><div><strong>{signal.stage}</strong><small>{signal.expectedEvidence}</small></div><span className="tag">{signal.metric}</span></div>)}</div>
          </TabFrame>
        ) : null}

        {activeTab === "settings" ? (
          <TabFrame title="API settings" subtitle="Add these variables in Vercel or .env.local. API keys stay server-side and are not shown in the browser.">
            <div className="card"><h2>Per-agent API variables</h2><div className="code">MONEYOS_DEFAULT_AI_PROVIDER=openrouter\nMONEYOS_DEFAULT_AI_MODEL=openai/gpt-4o-mini\nOPENROUTER_API_KEY=...\n\nOptional per-agent overrides:\nMONEYOS_GOVERNOR_PROVIDER=openrouter\nMONEYOS_GOVERNOR_MODEL=openai/gpt-4o\nMONEYOS_GOVERNOR_API_KEY=...\nMONEYOS_CEO_MODEL=...\nMONEYOS_RESEARCH_MODEL=...\nMONEYOS_BUILDER_MODEL=...\nMONEYOS_BUSINESS_MODEL=...\nMONEYOS_ANALYTICS_MODEL=...\nMONEYOS_QA_MODEL=...\nMONEYOS_FINANCE_MODEL=...\nMONEYOS_SECURITY_MODEL=...</div></div>
            <div className="card"><h2>Supabase + Vercel plugin status</h2><p>Checks Supabase connection, Vercel runtime, cron configuration, Vercel Analytics/Speed Insights, and per-agent AI keys.</p><button className="secondary" onClick={() => void checkIntegrations()}>Check integrations</button><div className="code" style={{ marginTop: 12 }}>{integrationStatus}</div></div>
            <div className="card"><h2>Automation rule</h2><p>Green/yellow work can run automatically. Red-zone actions still create approval requests: spending money, customer contact, production deletion, public deployment, or legal/business commitments.</p></div>
          </TabFrame>
        ) : null}
      </section>
    </main>
  );
}

function TabFrame({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <section className="tab-frame"><div className="page-title"><h1>{title}</h1><p>{subtitle}</p></div>{children}</section>;
}

function Metric({ value, label }: { value: string; label: string }) {
  return <div className="metric"><div className="metric-value">{value}</div><div className="metric-label">{label}</div></div>;
}

function LoopStrip({ activeStage }: { activeStage: string }) {
  return <div className="card"><h2>Business loop</h2><div className="workflow">{buildToEarnLoop.map((step, index) => <span key={step} className="workflow"><span className={step === activeStage ? "step active" : "step"}>{step}</span>{index < buildToEarnLoop.length - 1 ? <span className="arrow">→</span> : null}</span>)}</div></div>;
}

function EventLog({ logs }: { logs: string[] }) {
  return <div className="card"><h2>Event log</h2><div className="code">{logs.slice(0, 14).join("\n")}</div></div>;
}

function CycleSummary({ cycle }: { cycle: GovernorCycle }) {
  return <div className="list"><p>{cycle.summary}</p><div className="code">Mode: {cycle.automationMode}\nLoop stage: {cycle.loopStage}\nNext action: {cycle.nextAction}\nCreated: {cycle.createdAt}</div></div>;
}

function AgentOutputs({ cycle }: { cycle: GovernorCycle | null }) {
  if (!cycle) return <p>No outputs yet.</p>;
  return <div className="list">{cycle.agentOutputs.map((output) => <details key={output.agentId} className="details"><summary>{output.agentName} <span className={output.status === "completed" ? "tag" : output.status === "blocked" ? "tag danger" : "tag warning"}>{output.status}</span></summary><p>{output.output}</p></details>)}</div>;
}


function GovernorAudits({ cycle }: { cycle: GovernorCycle | null }) {
  if (!cycle) return <p>No audits yet.</p>;
  return <div className="list">{cycle.governorAudits.map((audit) => <div className="row" key={audit.id}><div><strong>{audit.agentName}</strong><small>{audit.correction}</small></div><span className={audit.verdict === "pass" ? "tag" : audit.verdict === "blocked" ? "tag danger" : "tag warning"}>{audit.verdict} · {audit.score}/100</span></div>)}</div>;
}

function FeaturedOpportunity({ opportunity }: { opportunity: Opportunity }) {
  return <div className="card strong-card"><div className="eyebrow">Top money route</div><h2>{opportunity.title}</h2><p>{opportunity.problem}</p><div className="grid cols-3"><Metric value={`${opportunity.score}/100`} label="Opportunity score" /><Metric value={opportunity.priceIdea} label="Price idea" /><Metric value={opportunity.sector} label="Sector" /></div><p><strong>First action:</strong> {opportunity.firstAction}</p></div>;
}

function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  return <div className="card"><div className="row compact"><div><strong>{opportunity.title}</strong><small>{opportunity.customer}</small></div><span className="tag">{opportunity.score}/100</span></div><p>{opportunity.tinyOffer}</p><div className="code">Sector: {opportunity.sector}\nPrice: {opportunity.priceIdea}\nEvidence needed:\n- {opportunity.evidenceNeeded.join("\n- ")}</div></div>;
}

function TaskList({ tasks }: { tasks: Task[] }) {
  return <div className="card"><div className="list">{tasks.map((task) => <div className="row" key={task.id}><div><strong>{task.title}</strong><small>{task.owner} · {permissionLabels[task.riskLevel]}</small></div><span className={task.status === "blocked" ? "tag danger" : task.status === "todo" ? "tag warning" : "tag"}>{task.status}</span></div>)}</div></div>;
}

function ApprovalList({ approvals, onDecide }: { approvals: ApprovalRequest[]; onDecide: (id: string, status: "approved" | "rejected") => void }) {
  return <div className="card"><div className="list">{approvals.length === 0 ? <p>No approvals pending.</p> : null}{approvals.map((approval) => <div className="row" key={approval.id}><div><strong>{approval.action}</strong><small>{approval.requestedBy} · {approval.reason}</small></div><div className="approval-actions"><span className="tag danger">{permissionLabels[approval.permissionLevel]}</span><button className="mini" onClick={() => onDecide(approval.id, "approved")}>Approve</button><button className="mini danger-button" onClick={() => onDecide(approval.id, "rejected")}>Reject</button></div></div>)}</div></div>;
}
