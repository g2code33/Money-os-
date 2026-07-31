# MoneyOS Cloud Architecture

MoneyOS is designed as a cloud-first autonomous business operating system. The user's device only needs a browser; the expensive or long-running work happens through hosted services.

## Vercel option

- **Next.js + TypeScript**: web dashboard and API routes.
- **Vercel**: frontend/backend deployment.
- **Supabase PostgreSQL**: durable memory, goals, agents, tasks, approvals, revenue, expenses.
- **Background jobs later**: Inngest or Trigger.dev for scheduled and long-running agent loops.
- **AI providers later**: OpenRouter/OpenAI/Gemini/Groq behind one provider-neutral interface.

## Loop engineering

The first business loop is:

```txt
discover -> validate -> build -> launch -> sell -> measure -> learn -> repeat
```

Every opportunity must produce evidence at each stage. This prevents MoneyOS from building random ideas without proof that someone may pay.

## Graph engineering

MoneyOS models the system as a graph:

```txt
You -> Dashboard -> AI CEO -> Agents -> Permission Engine -> Tools/APIs
                              -> Memory
Analytics -> AI CEO
```

Edges can have approval gates. For example, the Builder Agent can draft an MVP, but publishing/deployment requires approval. The Sales Agent can draft outreach, but contacting prospects requires approval.

## Permission levels

| Level | Meaning |
| --- | --- |
| 0 | Think only |
| 1 | Research |
| 2 | Build/draft |
| 3 | Create PR / prepare publish |
| 4 | Deploy / publish |
| 5 | Contact customers |
| 6 | Financial action |

Default automation should stop at level 1 until the owner explicitly increases permissions.
