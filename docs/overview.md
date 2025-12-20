# Repository overview

This repository is a Shopify app template built on React Router v7 with a PostgreSQL-backed Prisma session store, background jobs (BullMQ + Redis), webhook handlers (including GDPR), and centralized logging (Winston). It is intended as a production-ready baseline for embedded admin apps plus storefront app proxy routes.

## Tech stack
- Runtime: Node.js 20+, TypeScript, Vite, React 18
- Framework: React Router v7 (SSR, loaders/actions, file-based routes)
- Shopify: `@shopify/shopify-app-react-router`, App Bridge (`@shopify/app-bridge-react`), Admin GraphQL
- Data: Prisma + PostgreSQL
- UI: Polaris web components (`<s-*>` tags)
- Jobs: BullMQ + Redis
- Logging: Winston

## Code map
- App configuration/auth: `app/shopify.server.ts` (OAuth, scopes, session storage, API version)
- DB access: `app/db.server.ts`
- Routes: `app/routes/*` with server logic in loaders/actions
- Webhooks: `app/routes/webhooks.*.tsx`
- App proxy: `app/routes/proxy.$.tsx`
- Jobs: `app/queue.server.ts`, `app/queues/*`, `app/workers/*`
- SSR entry: `app/entry.server.tsx`
- Routing config: `app/routes.ts` via `@react-router/fs-routes`

## Feature highlights
- Auth + sessions: Prisma-backed session storage; login route at `app/routes/auth.login/route.tsx`
- App proxy: HMAC-validated storefront requests in `app/routes/proxy.$.tsx`
- Webhooks: app uninstall/scope update plus GDPR endpoints for `customers/data_request`, `customers/redact`, `shop/redact`
- Background jobs: sample email queue and worker with retries and backoff
- Logging: Winston with console output in dev and file output in production
- Deployment: Dockerfile included; `shopify app deploy` only publishes config/extensions

## Getting started (local dev)
1. Install: `pnpm install`
2. Configure `.env` from `.env.example` (Shopify credentials, `DATABASE_URL`, `REDIS_URL`)
3. Start Postgres + Redis
4. Run migrations: `pnpm run setup`
5. Start the dev server: `shopify app dev` (or `pnpm run dev`)
6. Optional: run workers separately (`node --loader tsx app/workers/email.worker.ts`)

## CI/CD
- CI runs on pushes and PRs across Node 20.19.0/22/24 with npm/yarn/pnpm; it runs type checks, lint, Prisma generate/validate, and the build.
- CLA checks are required on PRs; a comment containing "signed" triggers the CLA workflow.
- Issue hygiene: a scheduled job closes "Waiting for Response" issues after 14 days, and new comments remove that label.
- A maintenance workflow keeps a JavaScript-only branch in sync by transpiling TS to JS, formatting/linting, and opening a PR to the `javascript` branch.

## Operational notes
- PostgreSQL is required in production; SQLite is not used.
- Redis is required if you run queues or workers.
- Production logging writes to `./logs`; ensure the directory exists.
- GDPR webhooks must be enabled in the Partner Dashboard.

For detailed setup and environment configuration, see `docs/setup-guide.md`.
