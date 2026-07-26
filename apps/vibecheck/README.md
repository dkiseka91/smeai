# VibeCheck ⚡

An automated production-readiness auditor for "vibecoders" — paste a URL, get a
0–100 score and plain-English, copy-paste-ready fixes across security,
performance, resiliency, and infrastructure.

Lives inside the `sme-pitch-ai` monorepo as its own pair of workspace apps, so
it deploys independently from the AElevate product but shares the repo's
tooling (pnpm, TypeScript, Tailwind).

---

## How it works

1. **`web`** (Vite + React + TypeScript + Tailwind, dark mode) — URL input,
   live progress checklist, score dashboard, categorized report tabs.
2. **`api`** (Node.js + Express + TypeScript) — runs 11 checks concurrently
   against the target URL, streams progress over Server-Sent Events, scores
   the result, and persists it to SQLite so reports are shareable by link.

```
apps/vibecheck/
├── api/
│   ├── src/
│   │   ├── auditor/
│   │   │   ├── checks/            # one module per audit check
│   │   │   │   ├── securityHeaders.ts
│   │   │   │   ├── ssl.ts
│   │   │   │   ├── cors.ts
│   │   │   │   ├── exposedAssets.ts
│   │   │   │   ├── cdnEdge.ts
│   │   │   │   ├── cacheControl.ts
│   │   │   │   ├── compressionLatency.ts
│   │   │   │   ├── rateLimiting.ts
│   │   │   │   ├── errorHandling.ts
│   │   │   │   ├── waf.ts
│   │   │   │   ├── endpointDiscovery.ts
│   │   │   │   └── index.ts       # check registry (id/weight/category)
│   │   │   └── orchestrator.ts    # runs checks concurrently, emits progress, scores
│   │   ├── lib/
│   │   │   ├── db.ts              # SQLite (better-sqlite3) persistence
│   │   │   ├── types.ts
│   │   │   ├── fetchWithTimeout.ts
│   │   │   ├── concurrency.ts     # bounded-concurrency helper
│   │   │   ├── scoring.ts
│   │   │   ├── recommendations.ts # shared copy-paste snippets
│   │   │   └── progressBus.ts     # per-run EventEmitter for SSE
│   │   ├── routes/audit.ts        # POST /api/audit, GET /:id, GET /:id/events (SSE)
│   │   ├── app.ts
│   │   └── index.ts
│   ├── data/                      # vibecheck.db (gitignored)
│   └── package.json
└── web/
    ├── src/
    │   ├── pages/{Home,Report}.tsx
    │   ├── components/            # UrlForm, ScoreGauge, CategoryTabs, FindingCard, ...
    │   ├── lib/{api,types,markdownLite}.ts(x)
    │   └── App.tsx
    └── package.json
```

---

## Local development

```bash
# From the repo root
pnpm install

# Copy env
cp apps/vibecheck/api/.env.example apps/vibecheck/api/.env

# Run both api + web together
pnpm vibecheck:dev
```

- Web: http://localhost:5174
- API: http://localhost:4001 (health check: `GET /api/health`)

The Vite dev server proxies `/api` to the API, so the frontend works out of
the box with no extra config. SQLite data is written to `apps/vibecheck/api/data/vibecheck.db`
and created automatically on first run.

## Running the checks against a target

1. Open http://localhost:5174
2. Enter a URL you own or have permission to test and click **Run Audit**
3. Watch the 11 checks complete live, then review the categorized findings
4. Copy the URL bar (or the in-app "Copy share link" button) to share the
   report — reports are stored and retrievable by ID

> VibeCheck refuses to audit `localhost` / private network addresses from a
> hosted instance (SSRF guard in `orchestrator.ts::validateAuditableUrl`), and
> throttles repeated audit requests per IP so the tool itself can't be used to
> hammer a target.

---

## The 11 checks

| Category | Check | Weight |
|---|---|---|
| Security & Perimeter | Security Headers (HSTS, CSP, X-Frame-Options, ...) | 10 |
| Security & Perimeter | SSL/TLS & HTTPS enforcement | 10 |
| Security & Perimeter | CORS policy | 8 |
| Security & Perimeter | Exposed sensitive files (`.env`, `.git`, swagger, metrics) | 12 |
| Performance, Edge & Caching | CDN / edge network detection | 6 |
| Performance, Edge & Caching | Cache-Control strategy | 6 |
| Performance, Edge & Caching | Compression & TTFB | 6 |
| Resiliency & Traffic | Rate limiting | 10 |
| Resiliency & Traffic | Error & 404 handling (no leaked stack traces) | 10 |
| Infrastructure & Observability | WAF / DDoS protection detection | 6 |
| Infrastructure & Observability | Leaked API keys & unversioned endpoints | 16 |

Overall score = weighted sum of check results (pass = full weight, warn = half,
fail = zero) ÷ total weight. Each category tab shows its own sub-score the
same way.

---

## Deployment

Deploy `api` anywhere that runs a long-lived Node process (Railway, Fly.io,
a small VPS) — SQLite needs persistent disk, so avoid ephemeral-filesystem
serverless platforms unless you swap `lib/db.ts` for a hosted database
(Supabase/Postgres works well and keeps the same `Report` shape).

Deploy `web` to Vercel/Netlify as a static Vite build:

```bash
pnpm --filter @vibecheck/web build   # outputs apps/vibecheck/web/dist
```

Set `VITE_VIBECHECK_API_URL` to your deployed API's origin, and set
`VIBECHECK_WEB_ORIGIN` on the API to your deployed web origin (for CORS).

---

## Extending

Add a new check by dropping a file in `api/src/auditor/checks/`, exporting a
`CheckFn` (see `lib/types.ts`), and registering it with an `id`, `label`,
`category`, and `weight` in `checks/index.ts`. Nothing else needs to change —
scoring, SSE progress, and the report UI all key off that registry.
