# SME Business Plan & Pitch AI

**AElevate Business Innovations** | Fueling Growth

An AI-powered SaaS platform that generates complete business plans, financial models, investor pitch decks, and loan cover letters for entrepreneurs in East Africa and global emerging markets — in under one hour.

---

## Local Development (5 commands)

```bash
# 1. Install dependencies
pnpm install

# 2. Start Postgres + Redis
docker compose up -d

# 3. Copy env and fill in your keys
cp .env.example .env

# 4. Run database migrations + seed
pnpm db:migrate && pnpm db:seed

# 5. Start API + frontend
pnpm dev
```

- Frontend: http://localhost:5173
- API: http://localhost:3001
- Prisma Studio: `cd packages/db && pnpm studio`

Default seed credentials: `admin@aelevate.co.ug` / `Admin1234!`

---

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `ANTHROPIC_API_KEY` | Claude API key (get from console.anthropic.com) |
| `JWT_SECRET` | Min 32-char random string for access tokens |
| `JWT_REFRESH_SECRET` | Min 32-char random string for refresh tokens |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_test_...` for dev) |
| `STRIPE_WEBHOOK_SECRET` | From `stripe listen --forward-to localhost:3001/api/payments/webhook` |
| `STRIPE_PRICE_ENTREPRENEUR` | Stripe Price ID for $19/mo plan |
| `STRIPE_PRICE_GROWTH` | Stripe Price ID for $49/mo plan |
| `STRIPE_PRICE_CONSULTANT` | Stripe Price ID for $99/mo plan |
| `STRIPE_PRICE_INSTITUTION` | Stripe Price ID for $299/mo plan |
| `S3_BUCKET` | Cloudflare R2 or AWS S3 bucket name |
| `S3_REGION` | `auto` for R2, or AWS region |
| `S3_ENDPOINT` | R2 endpoint URL (omit for AWS) |
| `S3_ACCESS_KEY_ID` | S3/R2 access key |
| `S3_SECRET_ACCESS_KEY` | S3/R2 secret key |
| `RESEND_API_KEY` | Resend.com API key for transactional email |
| `EMAIL_FROM` | Sender address (e.g. `noreply@aelevate.co.ug`) |
| `FRONTEND_URL` | Frontend origin (e.g. `https://app.aelevate.co.ug`) |
| `API_URL` | API origin (e.g. `https://api.aelevate.co.ug`) |

---

## Stripe Setup

### Create products in Stripe Dashboard

1. Go to **Products** → **Add product** for each plan:

| Product Name | Price | Billing |
|---|---|---|
| AElevate Entrepreneur Plan | $19.00 | Monthly recurring |
| AElevate Growth Plan | $49.00 | Monthly recurring |
| AElevate Consultant Plan | $99.00 | Monthly recurring |
| AElevate Institution Plan | $299.00 | Monthly recurring |

2. Also create annual variants at the 10-month equivalent price (17% discount).

3. Copy each **Price ID** (`price_...`) into your `.env` as `STRIPE_PRICE_*`.

### Local webhook testing

```bash
stripe login
stripe listen --forward-to localhost:3001/api/payments/webhook
# Copy the whsec_... into STRIPE_WEBHOOK_SECRET
```

---

## Database Migrations

```bash
# Create a new migration after schema changes
cd packages/db
pnpm exec prisma migrate dev --name <migration-name>

# Apply migrations in production
pnpm exec prisma migrate deploy

# Reset database (dev only — destroys all data)
pnpm exec prisma migrate reset

# Open Prisma Studio
pnpm exec prisma studio
```

---

## Running Tests

```bash
# All tests
pnpm test

# API tests only (Vitest)
pnpm --filter api test

# Frontend tests only
pnpm --filter web test

# Watch mode
pnpm --filter api test -- --watch
```

---

## Deployment

### API → Railway

1. Create a new Railway project
2. Add a **GitHub repo** service pointing to this monorepo
3. Add **PostgreSQL** and **Redis** plugins
4. Set all environment variables from `.env.example`
5. Railway uses `railway.toml` automatically — no extra config needed
6. The health check endpoint is `GET /api/health`

### Frontend → Vercel

1. Import this repo in Vercel
2. Set **Root Directory** to `sme-pitch-ai` (or leave blank if deploying from root)
3. Vercel uses `vercel.json` automatically
4. Add environment variable: `VITE_API_URL=https://your-api.railway.app`
5. Add the Vercel domain to `FRONTEND_URL` in your Railway env vars

### Custom domain

- Point `app.aelevate.co.ug` → Vercel
- Point `api.aelevate.co.ug` → Railway
- Update `FRONTEND_URL` and `API_URL` accordingly

---

## Architecture

```
sme-pitch-ai/
├── apps/
│   ├── web/          React 18 + Vite + Tailwind + shadcn/ui
│   └── api/          Node.js 20 + Express 5 + TypeScript
├── packages/
│   ├── db/           Prisma ORM + PostgreSQL schema
│   ├── ai/           Anthropic Claude integration + prompts
│   └── shared/       Zod schemas + TypeScript types + constants
├── railway.toml      API deployment config
└── vercel.json       Frontend deployment config
```

### Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, TanStack Query, Zustand, Recharts |
| Backend | Node.js 20, Express 5, TypeScript |
| Database | PostgreSQL 16 via Prisma ORM |
| Cache | Redis 7 (rate limiting, usage counters, token blacklist) |
| AI | Anthropic Claude (`claude-sonnet-4-20250514`) |
| Payments | Stripe (subscriptions + pay-per-doc) |
| Storage | Cloudflare R2 / AWS S3 |
| Email | Resend |
| Deployment | Railway (API) + Vercel (Frontend) |

---

## Pricing

| Plan | Price | Seats | Monthly Plans | Monthly Decks | AI Queries |
|---|---|---|---|---|---|
| Free | $0 | 1 | 1 | 1 | 10 |
| Entrepreneur | $19/mo | 1 | Unlimited | Unlimited | Unlimited |
| Growth | $49/mo | 3 | Unlimited | Unlimited | Unlimited |
| Consultant | $99/mo | 10 | Unlimited | Unlimited | Unlimited |
| Institution | $299/mo | 50 | Unlimited | Unlimited | Unlimited |

Pay-per-document: $15 for a single clean export (no subscription required).

---

## Support

- Email: hello@aelevate.co.ug
- Website: https://aelevate.co.ug
