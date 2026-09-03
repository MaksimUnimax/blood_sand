# Product Control Plane Server

P1.1 candidate workspace foundation for the commercial control plane. It is not a completion marker for P1 or P1.1.

## Requirements

Use Node.js 24 and the pinned pnpm version from `package.json`. The supported reproducible validation environment is the official Node 24 Docker image; do not use the host Node runtime as acceptance evidence.

## Structure

- `apps/api` — Fastify liveness/readiness and error/correlation foundation.
- `apps/worker` — buildable process and job-runner boundary.
- `apps/portal`, `apps/admin` — minimal Next.js shells.
- `apps/health-runner` — browser-family-neutral `BrowserDriver` boundary.
- `packages/contracts`, `shared`, `observability`, `db` — shared foundation packages.
- `infra/compose` — local PostgreSQL 18 only.

## Commands

From `server/` after `corepack enable && pnpm install --frozen-lockfile`:

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm api:dev
pnpm worker:dev
pnpm db:migrate
```

`pnpm test:integration` is prepared for P1.3 and intentionally has no real PostgreSQL acceptance claim in P1.1.

## Local PostgreSQL

Copy `.env.example` as needed, then run:

```sh
docker compose -p product-control-plane-dev -f infra/compose/docker-compose.yml up -d
```

The development-only database is loopback-bound at `127.0.0.1:55432`; it does not use host PostgreSQL/MySQL or public binding.

## Bridge boundary

Server production modules must not import `tooling/llm-api-bridges/ozon-seller`. Bridge integration is deferred to P11; `pnpm bridge:guard` enforces this source boundary.
