# P1 Codex Implementation Packet — Server Engineering Foundation

Status: draft-ready implementation packet; execute only after P0 consistency audit is marked complete  
Roadmap: `P1 — Repository and engineering foundation`

## ROLE

You are the implementation engineer. Implement the approved architecture. Do not redesign product/security/domain architecture. If an authority document contradicts this packet, report the contradiction before making an architectural deviation.

## AUTHORITY

Read before changing code:

1. `server/docs/ARCHITECTURE.md`
2. `server/docs/REQUIREMENTS.md`
3. `server/docs/DEVELOPMENT_RULES.md`
4. `server/docs/SECURITY.md`
5. `server/docs/TECH_STACK.md`
6. `server/docs/DATA_MODEL.md`
7. `server/docs/API_CONTRACTS.md`
8. `server/docs/TEST_STRATEGY.md`
9. `server/docs/ROADMAP.md`
10. `server/docs/ADR/*`

Bridge reference is context only:

- `server/reference/bridge/*`

Do NOT import implementation code from `tooling/llm-api-bridges/ozon-seller/`.

## GOAL

Create a clean, reproducible TypeScript workspace foundation for later domain steps. P1 implements infrastructure shells only, not real auth/billing/entitlement/AI profile business behavior.

## REQUIRED STACK

- Node.js 24 LTS major baseline;
- pnpm workspace;
- TypeScript strict;
- Fastify 5 API shell;
- PostgreSQL;
- Drizzle baseline/migration harness;
- Zod contract package/OpenAPI foundation;
- Vitest;
- Pino structured logging;
- Docker Compose local PostgreSQL;
- GitHub Actions CI;
- Playwright dependency/shell only where needed for health-runner/web E2E foundation; do not implement live AI checks yet.

Exact compatible package minor/patch versions may be selected from current stable releases at implementation time and must be locked in `pnpm-lock.yaml`.

## TARGET DIRECTORY STRUCTURE

Create at minimum:

```text
server/
  package.json
  pnpm-workspace.yaml
  pnpm-lock.yaml
  tsconfig.base.json
  .env.example
  .gitignore
  apps/
    api/
    worker/
    portal/
    admin/
    health-runner/
  packages/
    contracts/
    db/
    shared/
    observability/
  infra/
    compose/
      docker-compose.yml
  scripts/              # only if needed for repository checks
```

Do not create empty architecture domain packages merely to look complete; create additional package directories only when P1 foundation code needs them.

## ROOT COMMANDS

Root `server/package.json` must expose stable commands equivalent to:

```text
pnpm lint
pnpm typecheck
pnpm test
pnpm test:integration
pnpm build
pnpm db:generate      # if required by chosen Drizzle workflow
pnpm db:migrate
pnpm api:dev
pnpm worker:dev
```

Command names may be refined if the same stable functionality exists and README documents it.

## API SHELL

`apps/api` must provide:

- Fastify app factory separate from process startup;
- `GET /health/live` process liveness;
- `GET /health/ready` readiness that can verify required infrastructure according to environment;
- correlation/request ID middleware/hook;
- stable JSON error envelope foundation;
- configuration injected, not imported from arbitrary global process reads throughout domain code;
- structured logging with sensitive-field redaction baseline.

Do not implement user auth/business endpoints in P1.

## WORKER SHELL

`apps/worker` must:

- load validated config;
- connect to PostgreSQL;
- start/stop cleanly on signals;
- expose or log a deterministic startup/ready state for tests;
- create the queue abstraction boundary but avoid inventing product jobs before their roadmap step.

If `pg-boss` is selected now, encapsulate it behind a local job-runner interface and document the selection in an ADR or stack update.

## DATABASE FOUNDATION

`packages/db` must provide:

- PostgreSQL connection factory;
- Drizzle wiring;
- migration directory/tooling;
- an initial minimal schema only for an explicit P1 infrastructure marker if necessary; do NOT prematurely implement the full product data model;
- transaction/repository test foundation;
- test helper for disposable PostgreSQL.

A real integration test must connect to PostgreSQL and exercise migration/query behavior.

## CONTRACT FOUNDATION

`packages/contracts` must provide:

- shared error envelope schema;
- correlation/request ID shape where public;
- schema/version naming convention;
- Fastify/Zod integration foundation;
- OpenAPI generation wiring sufficient for CI drift check or a documented P1 baseline.

Do not define speculative P2/P3 payloads beyond what architecture already explicitly requires unless needed as nonfunctional fixtures.

## OBSERVABILITY FOUNDATION

`packages/observability` / app wiring must provide:

- Pino logger factory/config;
- redaction list for auth/cookie/known secret fields;
- correlation ID propagation primitive;
- OpenTelemetry-compatible abstraction/wiring stub only if full collector setup is not justified in P1.

No user/business payload logging.

## CONFIGURATION

Create validated environment configuration.

Requirements:

- one schema/source of truth;
- application refuses invalid required production/test configuration;
- `.env.example` placeholders only;
- environment-specific defaults only where safe;
- no secret committed.

Initial variables may include DB URL, app environment, log level, service ports and placeholder future provider settings only if actually consumed.

## PORTAL / ADMIN

Create buildable application shells only.

Requirements:

- no duplicate backend/domain implementation;
- basic route/page proving build/runtime;
- shared lint/typecheck/build setup;
- no design-system overengineering in P1.

## HEALTH RUNNER

Create a buildable shell demonstrating the browser-driver abstraction boundary, e.g. interface/types plus no-op/test driver if useful.

Do NOT:

- log into ChatGPT;
- implement selectors;
- create health accounts;
- schedule live checks;
- hard-code Chrome throughout health core.

Chrome driver implementation belongs to P8 unless a minimal adapter shell is explicitly needed.

## CI

Create GitHub Actions workflow for server changes that runs from repository root and scopes commands to `server/`.

Minimum:

1. set Node 24;
2. enable pnpm with frozen lockfile;
3. install;
4. lint;
5. typecheck;
6. unit tests;
7. PostgreSQL integration tests using service container or Testcontainers-compatible environment;
8. build;
9. migration validation;
10. OpenAPI drift check if generation baseline is ready.

Do not expose production secrets.

## DOCKER LOCAL ENVIRONMENT

Provide Docker Compose for PostgreSQL with:

- pinned supported major image;
- local-only documented credentials;
- healthcheck;
- named volume optional;
- documented reset command.

Do not add Redis/Kafka/Elasticsearch.

## FORBIDDEN / NON-GOALS

P1 MUST NOT implement:

- production user auth;
- OTP flows;
- device authorization;
- subscription/billing;
- real plan schemas beyond unavoidable scaffold;
- entitlements;
- remote adapter profiles;
- real AI health automation;
- Ozon API calls/credentials;
- Bridge code copy/import;
- arbitrary remote config;
- microservices;
- Kubernetes;
- Redis solely for jobs;
- real payment/email provider SDKs.

## TESTS REQUIRED

At minimum add tests proving:

1. API liveness endpoint;
2. correlation ID exists and is stable for request;
3. error envelope foundation returns expected schema for a controlled error;
4. invalid environment configuration fails;
5. database integration connects to real PostgreSQL and runs migration/query;
6. workspace package dependency/build succeeds;
7. no server production module imports path under `tooling/llm-api-bridges/ozon-seller` (implement repository check if practical).

## DOCUMENTATION REQUIRED

Update:

- `server/README.md` with exact local setup/commands;
- `server/docs/ROADMAP.md` P1 progress at substep level;
- any ADR if implementation choice changed/was finalized (e.g. exact PG job library);
- architecture/stack only if a real contradiction required approved change.

## COMPLETION EVIDENCE

Report exactly:

- final branch HEAD;
- files created/changed;
- Node/pnpm/package versions selected;
- commands run;
- lint/typecheck/unit/integration/build results;
- migration result;
- CI workflow path;
- known limitations;
- confirmation that no Bridge source was imported;
- next proposed P1 substep/P2 gate.

Do not mark P1 DONE unless all P1 acceptance criteria in `ROADMAP.md` and `TEST_STRATEGY.md` are satisfied.