# Product Control Plane — Technology Stack

Status: default implementation stack for roadmap P1+  
Date: 2026-09-03

## 1. Selection principles

The stack is optimized for:

- one small engineering team using Codex as implementation engineer;
- strong TypeScript contracts shared across API/worker/web tooling;
- low infrastructure cost;
- simple operations;
- explicit PostgreSQL transactions;
- good browser automation support;
- modular-monolith architecture;
- ability to scale horizontally later without early distributed-systems complexity.

## 2. Runtime / language

### Node.js 24 LTS

Use Node.js 24 LTS as the production baseline.

Reasons:

- current LTS line at architecture date;
- native modern Web/Crypto/runtime capabilities;
- first-class Fastify/Playwright/tooling support;
- shared TypeScript ecosystem across server and browser-related tooling.

Pin the supported major in repository tool configuration; do not float production across Node majors automatically.

### TypeScript

- strict mode enabled;
- `noUncheckedIndexedAccess` and other high-value strictness options evaluated/enabled unless a concrete incompatibility exists;
- no implicit `any` escape as normal development style;
- domain types derive from schemas/contracts where practical.

## 3. Workspace / package manager

### pnpm workspaces

Use one workspace rooted at `server/`.

Expected packages/apps:

- `apps/api`;
- `apps/worker`;
- `apps/portal`;
- `apps/admin`;
- `apps/health-runner`;
- domain packages under `packages/`.

A task runner such as Turborepo MAY be added in P1 if it materially simplifies cache/build orchestration, but pnpm scripts remain the canonical commands and the architecture must not depend on Turborepo.

## 4. API framework

### Fastify 5

Use Fastify 5 for HTTP API.

Reasons:

- low overhead;
- explicit plugin/module boundaries;
- strong JSON Schema/OpenAPI ecosystem;
- no requirement to adopt a heavy application framework;
- suitable for a modular monolith.

Routes remain thin transport adapters. Domain logic does not live in handlers.

## 5. Runtime schemas and API specification

### Zod + generated OpenAPI

Use Zod schemas for external/application contracts, with an accepted Fastify type-provider/OpenAPI integration.

Requirements:

- runtime validation and TypeScript types come from the same source;
- OpenAPI generated in CI;
- schema changes reviewed as contract changes;
- stable error-code envelope defined centrally.

If P1 proves a different schema library materially better for Fastify/OpenAPI without weakening shared contracts, that change requires an ADR before implementation.

## 6. Database

### PostgreSQL

PostgreSQL is the single primary system of record initially.

It owns:

- identity/account/device/session metadata;
- plans/prices/subscriptions;
- billing event ledger;
- entitlements/config revisions;
- adapter/profile registry;
- health metadata/incidents;
- diagnostics metadata;
- audit events;
- durable job metadata.

### Drizzle ORM / SQL migrations

Baseline ORM/query/migration layer: Drizzle.

Reasons:

- TypeScript-friendly;
- explicit relational model;
- close-to-SQL behavior;
- suitable for version-controlled migrations;
- less hidden runtime behavior than highly abstract data layers.

Critical financial/idempotency invariants must also exist as PostgreSQL constraints/transactions, not only application checks.

## 7. Durable jobs and scheduling

### PostgreSQL-backed queue

Initial choice: `pg-boss` or an equivalent PostgreSQL-backed durable job library approved during P1.

Use for:

- email sends;
- payment reconciliation;
- subscription expiry/grace jobs;
- notifications;
- health scheduling/orchestration;
- retention cleanup;
- periodic consistency checks.

Do not add Redis only to obtain a queue at product start.

If a queue library is selected in P1, record the final choice/version in an ADR and lockfile.

## 8. User/admin web applications

### React + Next.js

Use Next.js for portal/admin unless P1 demonstrates a concrete reason to use a simpler Vite SPA.

Important boundary:

- product domain/business state is owned by the control API/database;
- Next.js server actions/API routes MUST NOT become a second ungoverned backend with duplicate domain logic;
- portal/admin consume the same application services/contracts or HTTP API according to the selected deployment pattern.

UI component library may be chosen during P6; it is not an architecture dependency.

## 9. Browser automation / Health System

### Playwright

Use Playwright for:

- controlled Chrome health runs;
- later controlled Yandex Chromium runs using explicit executable/browser driver configuration;
- portal/admin E2E tests;
- deterministic AI UI contour checks;
- screenshots and bounded evidence collection.

Health browser accounts require persistent, isolated profiles managed as secrets/operational state.

Browser family is an explicit driver interface. Do not write the health core directly against a hard-coded Chrome executable.

## 10. Testing

### Vitest

Use Vitest for:

- unit tests;
- domain invariant tests;
- contract tests;
- most integration tests.

### Testcontainers

Use Testcontainers or equivalent disposable real PostgreSQL in integration/CI where available.

Do not validate transaction/idempotency behavior only against mocks/in-memory stores.

### Playwright Test

Use for portal/admin E2E and health browser suites.

## 11. Logging / observability

### Pino

Structured JSON logs through Pino/Fastify logging.

Every request/job/health run receives correlation/trace identity.

### OpenTelemetry

Instrument using OpenTelemetry-compatible APIs so metrics/traces can move between backends.

### Error reporting

Sentry or an equivalent error backend MAY be used, but the product code must still apply strict server-side redaction/data-minimization before events leave the process.

### Metrics/dashboard backend

Provider choice is operational and can be Grafana-compatible/managed. Do not bake business logic into a monitoring vendor.

## 12. Object storage

Use S3-compatible private object storage for sanitized health evidence requiring binary retention (screenshots/artifacts).

Local development can use MinIO or filesystem abstraction where appropriate.

Production provider can be selected independently (S3-compatible cloud/provider). Domain code uses an object-store interface.

## 13. Cryptography

Use Node's maintained standard crypto capabilities where sufficient.

Baseline:

- Ed25519 for signed remote config snapshots;
- strong cryptographic random values for OTP/device/session tokens;
- opaque refresh tokens stored as secure hashes;
- standard password/KDF library only if password storage is introduced later.

Do not invent custom cryptographic algorithms/formats.

## 14. Email

Email provider behind interface:

`EmailProvider.sendOtp(...)`

The first concrete provider is a deployment/commercial choice and does not affect auth domain semantics.

Support provider replacement without user/session migration.

## 15. Billing

Define internal `BillingProvider` interface first.

Concrete initial provider is selected during P5 based on target market/legal/payment requirements at implementation time.

Domain objects (`payment`, `billing_event`, `subscription`, `price_revision`) MUST NOT expose concrete provider semantics as their primary identity.

## 16. Notifications

Define provider-neutral notifier interface.

Initial operational channels can include:

- Telegram bot/channel;
- email;
- later Slack/etc.

Health domain emits incidents/events; notification adapters decide delivery channel.

## 17. Containers / local development

Docker is the reproducibility boundary.

P1 local environment should provide at least:

- PostgreSQL;
- optional local object storage if needed by the step;
- application containers or documented local-node process commands.

One command/documented sequence must bring up development dependencies.

## 18. Infrastructure as code

Use OpenTofu/Terraform-compatible configuration when production infrastructure is provisioned.

Do not start with Kubernetes.

Initial deploy target should be ordinary container hosting/VPS/managed container platform with:

- TLS/reverse proxy;
- stateless API replicas if needed;
- PostgreSQL;
- worker;
- private health-runner agents;
- object storage.

Provider choice remains modular.

## 19. CI/CD

Use GitHub Actions for repository CI unless repository policy changes.

Minimum P1 CI:

1. install with frozen lockfile;
2. lint;
3. typecheck;
4. unit tests;
5. PostgreSQL integration tests;
6. build all apps/packages;
7. migration validation;
8. generated OpenAPI drift check.

Later:

- dependency/security scan;
- portal/admin Playwright;
- container build;
- staging deploy;
- production deploy approval.

Production AI Health scheduling should run on controlled persistent agents, not depend solely on ephemeral GitHub Actions sessions.

## 20. Formatting / linting

Baseline:

- ESLint;
- Prettier;
- TypeScript compiler strict checks.

Architecture dependency restrictions may be enforced by ESLint import rules or a dependency-boundary tool if practical in P1.

## 21. Explicit technologies NOT selected initially

Do not introduce without an ADR + demonstrated need:

- Kubernetes;
- Kafka;
- RabbitMQ;
- Redis as mandatory core infrastructure;
- Elasticsearch/OpenSearch;
- GraphQL;
- microservices/service mesh;
- Temporal;
- multiple primary databases;
- custom auth protocol replacing standard signed/opaque-token patterns.

This is not a ban forever. It is protection against premature operational complexity.

## 22. Upgrade policy

- pin major runtime/framework versions;
- patch/minor dependency updates go through CI;
- framework/runtime major upgrades are planned changes with compatibility tests;
- health runner/browser versions are recorded with every run;
- production dependency versions are reproducible from lockfile/container build.
