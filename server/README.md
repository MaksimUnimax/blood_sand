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
pnpm test:integration
pnpm format:check
pnpm openapi:generate
pnpm openapi:check
pnpm build
pnpm api:dev
pnpm worker:dev
pnpm db:migrate
```

`pnpm test` is the database-independent unit/foundation suite. `pnpm test:integration`
is a separate real PostgreSQL suite: it requires `DATABASE_URL` to point at an
available disposable PostgreSQL database and fails clearly if it is absent or
unreachable. The P1 development Compose database is loopback-only at
`127.0.0.1:55432`.

`server/openapi/openapi.json` is a tracked generated OpenAPI 3.1 artifact. Generate
it with `pnpm openapi:generate`; do not hand-edit it. `pnpm openapi:check` compares
the current generated representation with the tracked bytes and fails on drift.
`pnpm format:check` verifies the server source/config formatting baseline.

The intended CI checks are frozen install, lint, formatting, typecheck, unit tests,
real PostgreSQL integration, idempotent migration validation, OpenAPI drift, Bridge
boundary guard, and build. GitHub Actions execution is pending repository
synchronization; this local candidate does not claim a remote CI run.

## Local PostgreSQL development operations

Copy `.env.example` as needed. From `server/`, start only the Product Control Plane development PostgreSQL service with:

```sh
docker compose -p product-control-plane-dev -f infra/compose/docker-compose.yml up -d
```

The development-only database is loopback-bound at `127.0.0.1:55432`; it does not use host PostgreSQL/MySQL or public binding.

Stop it without deleting its development data:

```sh
docker compose -p product-control-plane-dev -f infra/compose/docker-compose.yml down
```

Reset the development database, including deletion of its named volume/data:

```sh
docker compose -p product-control-plane-dev -f infra/compose/docker-compose.yml down -v
```

Warning: this reset removes only the `product_control_plane_postgres_data` named volume for Product Control Plane development PostgreSQL. It does not delete MySQL, Legacy Bridge state, Direct state, or Docker resources globally.

## Bridge boundary

Server production modules must not import `tooling/llm-api-bridges/ozon-seller`. Bridge integration is deferred to P11; `pnpm bridge:guard` enforces this source boundary.
