# MoneyOS

MoneyOS is a cloud-first autonomous business OS. It is designed to work from any device because the browser is only the control center; the agents, memory, task execution, and AI integrations run in hosted services.

## Current version

**MoneyOS Cloud v0.1** using the Vercel option:

- Next.js + TypeScript dashboard
- Supabase-ready memory schema
- Agent registry
- Task list
- Permission levels
- AI CEO planning API stub
- Loop engineering foundation
- Graph engineering foundation

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

If Supabase env vars are not configured, the app runs in demo mode.

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import the repo into Vercel.
3. Create a Supabase project.
4. Run `supabase/schema.sql` in the Supabase SQL editor.
5. Add the env vars from `.env.example` to Vercel.
6. Deploy.

## API routes

- `GET /api/health`
- `GET /api/tasks`
- `GET /api/approvals`
- `GET or POST /api/ceo/plan`

Example:

```bash
curl -X POST http://localhost:3000/api/ceo/plan \
  -H 'content-type: application/json' \
  -d '{"mission":"Find one profitable pharmacy software opportunity."}'
```

## Safety first

MoneyOS uses approval levels. Research can run autonomously, but deployment, public publishing, customer contact, and financial actions require approval.


## Install troubleshooting

If `npm install` fails because of network timeouts or `ENOTEMPTY`, use:

```bash
rm -rf node_modules
git restore package-lock.json
npm cache verify
npm ci
npm run dev
```

More details: [`docs/INSTALL_TROUBLESHOOTING.md`](docs/INSTALL_TROUBLESHOOTING.md)


## No-install quick test

If npm install is failing on a slow network, you can test the MoneyOS flow without installing packages:

```bash
python3 -m http.server 8080
```

Then open:

```txt
http://localhost:8080/public/test.html
```

More details: [`docs/QUICK_TEST_NO_NPM.md`](docs/QUICK_TEST_NO_NPM.md)

## Governor automation

MoneyOS now includes a Governor Agent. Its job is to:

- prompt every agent to work in the right order
- enforce the discover → validate → build → launch → sell → measure → learn loop
- scan beyond pharmacy while still using pharmacy as an advantage
- create opportunities, tasks, approvals, and agent outputs
- keep unsafe work behind approval gates

Test it in the dashboard with **Run Governor now**, or call:

```bash
curl -X POST http://localhost:3000/api/governor/run \
  -H 'content-type: application/json' \
  -d '{"mission":"Generate legitimate revenue fast across any ethical niche","automationMode":"maximum-safe"}'
```

## Per-agent AI APIs

Add one shared provider key or one key per agent in `.env.local` or Vercel.

Recommended simple setup:

```bash
MONEYOS_DEFAULT_AI_PROVIDER=openrouter
MONEYOS_DEFAULT_AI_MODEL=openai/gpt-4o-mini
OPENROUTER_API_KEY=your_key_here
```

Optional per-agent model overrides:

```bash
MONEYOS_GOVERNOR_MODEL=openai/gpt-4o
MONEYOS_CEO_MODEL=openai/gpt-4o-mini
MONEYOS_RESEARCH_MODEL=openai/gpt-4o-mini
MONEYOS_BUILDER_MODEL=openai/gpt-4o-mini
MONEYOS_BUSINESS_MODEL=openai/gpt-4o-mini
MONEYOS_ANALYTICS_MODEL=openai/gpt-4o-mini
MONEYOS_QA_MODEL=openai/gpt-4o-mini
MONEYOS_FINANCE_MODEL=openai/gpt-4o-mini
MONEYOS_SECURITY_MODEL=openai/gpt-4o-mini
```

Supported provider names:

```txt
openrouter
openai
groq
gemini
fallback
```

## Supabase and Vercel integrations

MoneyOS now includes Vercel and Supabase integration support:

- `@vercel/analytics` for Vercel Web Analytics
- `@vercel/speed-insights` for Vercel Speed Insights
- `@supabase/ssr` for browser/server Supabase support
- `/api/integrations/status` to check Vercel, Supabase, cron, and AI agent readiness

In the dashboard, open:

```txt
☰ -> Settings -> Check integrations
```

## Governor correction

The Governor is a regulator/auditor, not the CEO.

```txt
AI CEO = strategy and business decisions
Specialist agents = duty execution
Governor = audits each agent for perfection, evidence, safety, and completeness
```

The Governor checks every agent along its line of duty and saves audit results in Supabase when configured.
