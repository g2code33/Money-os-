-- MoneyOS Cloud v0.1 Supabase schema
-- Run this in the Supabase SQL editor before adding env vars to Vercel.

create extension if not exists "pgcrypto";

create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  objective_metric text not null default 'profit_usd',
  target_value numeric not null default 1,
  timeframe text not null default '30 days',
  created_at timestamptz not null default now()
);

create table if not exists agents (
  id text primary key,
  name text not null,
  role text not null,
  status text not null default 'waiting',
  autonomy_level int not null default 1,
  created_at timestamptz not null default now(),
  constraint agents_autonomy_level_check check (autonomy_level between 0 and 6)
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  owner text not null,
  status text not null default 'todo',
  risk_level int not null default 1,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint tasks_risk_level_check check (risk_level between 0 and 6)
);

create table if not exists approval_requests (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  requested_by text not null,
  permission_level int not null,
  reason text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  constraint approval_permission_level_check check (permission_level between 0 and 6)
);

create table if not exists memories (
  id uuid primary key default gen_random_uuid(),
  memory_type text not null,
  title text not null,
  content text not null,
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists revenue_events (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  amount numeric not null,
  currency text not null default 'USD',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists expense_events (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  amount numeric not null,
  currency text not null default 'USD',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

insert into goals (title, objective_metric, target_value, timeframe)
select 'Generate the first $1 of legitimate revenue', 'profit_usd', 1, '30 days'
where not exists (select 1 from goals);

insert into agents (id, name, role, status, autonomy_level) values
  ('ceo', 'AI CEO', 'Strategy, planning, prioritization', 'active', 1),
  ('research', 'Research Agent', 'Opportunity discovery and competitor evidence', 'active', 1),
  ('builder', 'Builder Agent', 'MVP specs, code plans, implementation', 'waiting', 2),
  ('business', 'Business Agent', 'Offers, pricing, landing pages, customer pipeline', 'waiting', 2),
  ('analytics', 'Analytics Agent', 'Revenue, cost, conversion, lessons', 'active', 1)
on conflict (id) do nothing;

insert into tasks (title, owner, status, risk_level)
select 'Research pharmacy expiry-management pain points in Ghanaian operations', 'Research Agent', 'running', 1
where not exists (select 1 from tasks);

create table if not exists governor_cycles (
  id uuid primary key default gen_random_uuid(),
  mission text not null,
  automation_mode text not null,
  loop_stage text not null,
  summary text not null,
  next_action text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists opportunities (
  id uuid primary key default gen_random_uuid(),
  cycle_id uuid references governor_cycles(id) on delete cascade,
  title text not null,
  sector text not null,
  customer text not null,
  problem text not null,
  tiny_offer text not null,
  price_idea text not null,
  score int not null,
  evidence_needed jsonb not null default '[]'::jsonb,
  first_action text not null,
  created_at timestamptz not null default now()
);

create table if not exists agent_outputs (
  id uuid primary key default gen_random_uuid(),
  cycle_id uuid references governor_cycles(id) on delete cascade,
  agent_id text not null,
  agent_name text not null,
  status text not null,
  output text not null,
  created_at timestamptz not null default now()
);

create table if not exists governor_audits (
  id uuid primary key default gen_random_uuid(),
  cycle_id uuid references governor_cycles(id) on delete cascade,
  agent_id text not null,
  agent_name text not null,
  verdict text not null,
  score int not null,
  checklist jsonb not null default '[]'::jsonb,
  correction text not null,
  created_at timestamptz not null default now()
);
