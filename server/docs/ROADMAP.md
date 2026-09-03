# Product Control Plane — Two-Level Roadmap

Status: active source of truth  
Date: 2026-09-03

## 1. Execution rules

1. Every implementation task maps to one Level 1 product item and one Level 2 step.
2. Every Codex task names authority docs, allowed changes, tests/evidence and non-goals.
3. Code existing is not DONE; acceptance evidence + documentation update are required.
4. Server work does not opportunistically patch the active Bridge during parallel development.
5. Bridge integration happens only at P11 using the then-current accepted Bridge candidate.
6. Architecture changes are made deliberately in docs/ADR; Codex implements approved architecture.

Legend: `[DONE] [ACTIVE] [NEXT] [PLANNED] [BLOCKED]`.

# Level 1 — Product roadmap

## P0 — Architecture and development contract `[DONE]`

Goal: remove architecture ambiguity before server implementation.

Completed deliverables:

- `ARCHITECTURE.md`;
- `REQUIREMENTS.md`;
- `DEVELOPMENT_RULES.md`;
- `SECURITY.md`;
- `INTEGRATION_CONTRACT.md`;
- `TECH_STACK.md`;
- `DATA_MODEL.md`;
- `API_CONTRACTS.md`;
- `BILLING_AND_PLANS.md`;
- `HEALTH_SYSTEM.md`;
- `TEST_STRATEGY.md`;
- ADR set;
- Bridge reference baseline/source map;
- `P0_ARCHITECTURE_AUDIT.md` PASS;
- `P1_CODEX_IMPLEMENTATION_PACKET.md`.

Key decisions frozen for P1:

- control plane != seller data plane;
- modular monolith;
- Node.js 24 LTS / TypeScript / Fastify / PostgreSQL baseline;
- browser family independent; Chrome-first only as priority;
- declarative signed remote profiles, no remote executable code;
- immutable plan/price/profile/config revisions;
- deterministic Health truth; Codex writes repairs but does not auto-deploy them initially;
- Bridge and server develop in parallel through a versioned contract.

Acceptance: `P0_ARCHITECTURE_AUDIT.md` = PASS.

## P1 — Repository and engineering foundation `[DONE]`

Goal: create reproducible server workspace with infrastructure shells only.

Implementation authority: `P1_CODEX_IMPLEMENTATION_PACKET.md`.

Deliverables:

- pnpm workspace;
- Node 24 + TypeScript strict;
- Fastify API shell;
- worker shell;
- portal/admin shells;
- health-runner abstraction shell;
- contracts/db/observability/shared packages;
- PostgreSQL + Drizzle migration harness;
- validated env config;
- logging/correlation IDs;
- Docker Compose local PostgreSQL;
- Vitest/integration test baseline;
- CI pipeline;
- OpenAPI/schema baseline.

Non-goals:

- no real auth/billing/entitlements/remote AI profiles/live Health/Ozon logic;
- no Bridge code import.

Exit gate:

- clean checkout setup documented;
- lint/typecheck/unit/integration/build pass;
- real PostgreSQL migration/query test passes;
- CI passes;
- no Bridge import;
- P1 evidence recorded.

P1 implementation status: P1.1 `[DONE]`; P1.2 `[DONE]`; P1.3 `[DONE]`; P1.4 `[DONE]`; P1.5 `[DONE]`; P1.6 `[DONE]`.

## P2 — Accounts, OTP identity and device authorization `[ACTIVE]`

Goal: user can authenticate and authorize an extension installation.

Scope:

- user/account/membership schema;
- passwordless email OTP;
- device authorization request/approval/exchange;
- device status/limits;
- access tokens;
- rotating opaque refresh tokens;
- refresh reuse detection;
- revoke;
- audit;
- activation portal.

Exit: complete simulated extension activation/refresh/revoke/device-limit flow with security tests.

## P3 — Bootstrap, compatibility and signed remote configuration `[PLANNED]`

Goal: authorized client receives a safe versioned policy/config snapshot.

Scope:

- `/v1/bootstrap`;
- client protocol/version compatibility;
- browser/extension metadata;
- Ed25519 signed snapshots;
- config revisions;
- minimum extension version;
- offline grace;
- feature/rollout primitives;
- simulated client signature verifier.

Exit: valid/tampered/expired/offline/unsupported-client tests pass; remote payload cannot expand packaged capability.

## P4 — Plans, price revisions and entitlement engine `[PLANNED]`

Goal: admin can change sellable capabilities/pricing structure without extension releases.

Scope:

- plan + immutable revisions;
- price + immutable revisions;
- entitlement definitions/mapping;
- account overrides;
- device limits;
- entitlement explanation;
- admin plan/price/entitlement workflows.

Exit: price history/grandfathering/revision immutability and deterministic entitlement tests pass.

## P5 — Billing and subscription state machine `[PLANNED]`

Goal: paid access works idempotently.

Scope:

- billing provider interface + first provider;
- checkout;
- webhook verification/idempotency;
- payment/billing event ledger;
- subscription states `TRIAL|ACTIVE|GRACE|PAST_DUE|CANCELED|EXPIRED|SUSPENDED`;
- reconciliation;
- manual grant/extend/suspend;
- portal billing.

Exit: duplicate/forged/delayed webhook, reconciliation and admin audit scenarios pass.

## P6 — Admin and operations core `[PLANNED]`

Goal: first-line operation without direct SQL.

Admin capabilities:

- account/user lookup;
- subscription grant/extend/suspend/restore;
- device revoke;
- create/edit/hide/archive plans;
- create/publish price revisions;
- entitlement/account overrides;
- feature enable/disable;
- AI adapter/surface enable/disable;
- profile candidate/activate/rollback;
- compatibility policy;
- health dashboard;
- aggregate diagnostics;
- audit log.

Exit: required mutations RBAC-protected and audited.

## P7 — AI adapter registry and auto-selection contract `[PLANNED]`

Goal: normal UX automatically detects the active supported AI; profiles become safely server-managed.

Model:

`active tab -> packaged trusted host/AI/surface detector -> server entitlement/health/profile resolution -> validated declarative bind`

Scope:

- AI family/surface/variant registry;
- profile schemas/revisions;
- compatibility constraints;
- rollout/rollback;
- diagnostic manual override only.

Exit: independent ChatGPT Standard/Work resolution, safe rollback and no remote capability expansion.

## P8 — AI Compatibility Health v1 `[PLANNED]`

Goal: detect AI UI changes before widespread user breakage.

Scope:

- health orchestrator;
- controlled Chrome runner first;
- browser-driver abstraction;
- critical contours;
- structural + behavioral checks;
- daily scheduled H3 smoke;
- on-demand/candidate/post-rollout runs;
- evidence sanitization/storage;
- `HEALTHY|DRIFT|DEGRADED|BROKEN|UNKNOWN|MAINTENANCE`;
- incidents/notifications;
- candidate profile validation;
- rollout/rollback hooks.

Exit examples:

- primary selector fail + fallback pass => DRIFT;
- core contour fail => BROKEN;
- expired health account => UNKNOWN;
- candidate profile fixes incident without regression.

## P9 — Diagnostics, notifications and operational visibility `[PLANNED]`

Goal: low support burden and early incident visibility.

Scope:

- safe allowlisted diagnostics API;
- aggregate dashboards by version/browser/AI/profile/error;
- stable error taxonomy;
- Health/backend/billing alerts;
- retention;
- observability dashboards/alerts.

Exit: common failures diagnosable without raw seller payloads; alert grouping/noise control works.

## P10 — Bridge integration preparation `[PLANNED]`

Goal: validate all server/client contracts before touching production Bridge.

Scope:

- simulated extension/reference client;
- device auth/bootstrap/signature/profile fixtures;
- compatibility/offline/denial fixtures;
- Bridge integration checklist;
- state ownership mapping template.

Exit: server system testable without live Bridge dependency.

## P11 — Integrate then-current accepted Ozon Bridge `[PLANNED]`

Goal: attach current Bridge version, not the old reference snapshot.

Steps:

- fetch fresh accepted Bridge commit/artifact/tests;
- delta audit against `server/reference/bridge/`;
- integrate auth/bootstrap/profile client contract;
- preserve Ozon credential/data-plane locality;
- preserve fixed provider security boundary;
- prove AI rebind/auth/config refresh cannot reset provider quota/cache/execution state;
- preserve exactly-once/delivery regressions;
- run combined contract + Bridge regression suite.

Exit: accepted integrated Chrome candidate.

## P12 — Chrome commercial acceptance `[PLANNED]`

End-to-end:

install -> device auth -> subscription -> local Ozon connection -> AI auto-detection -> remote profile -> question -> Ozon data -> AI answer -> diagnostics/recovery.

Also store/privacy/update/restart/failure acceptance.

Chrome is first only unless roadmap priority changes.

## P13 — Yandex Browser compatibility `[PLANNED]`

Goal: add Yandex Browser without product fork.

Scope:

- `yandex_chromium` browser driver/capabilities;
- distribution/permissions differences;
- Yandex Health runner;
- browser-specific compatibility/diagnostics;
- same server account/auth/billing/bootstrap contracts.

Exit: independent browser health and no duplicated commercial/domain logic.

## P14 — Production launch hardening `[PLANNED]`

Scope:

- production infrastructure/secrets;
- backup + restore drill;
- deployment/rollback;
- payment reconciliation runbook;
- AI compatibility incident runbook;
- monitoring/alerts;
- admin MFA/RBAC acceptance;
- privacy/legal/store readiness;
- staged launch.

## P15 — Post-Ozon expansion `[PLANNED]`

Only after paid Ozon path is proven:

- additional data sources;
- additional AI adapters;
- additional browsers when justified;
- cross-source workflows.

Architecture remains:

`business data adapters -> common bridge protocol -> supported AI adapters`

# Level 2 — Current execution

## P0 substeps

- P0.1 `[DONE]` create `feature/product-control-plane-server-2026-09-03` from then-current Bridge branch.
- P0.2 `[DONE]` create `server/` root/documentation skeleton.
- P0.3 `[DONE]` complete normative architecture/spec/security/data/API/billing/Health/test docs and ADRs.
- P0.4 `[DONE]` capture pinned Bridge reference baseline/source map without runtime import.
- P0.5 `[DONE]` run architecture consistency audit -> PASS.
- P0.6 `[DONE]` prepare first bounded Codex packet `P1_CODEX_IMPLEMENTATION_PACKET.md`.

## P1 completed substeps

- P1.1 `[DONE]` Codex creates workspace/tooling skeleton exactly within P1 packet.
- P1.2 `[DONE]` verify local install/build/lint/typecheck/unit tests.
- P1.3 `[DONE]` verify real PostgreSQL migration/integration baseline.
- P1.4 `[DONE]` verify CI and generated contract baseline.
- P1.5 `[DONE]` architecture review implementation vs P0 decisions.
- P1.6 `[DONE]` close accepted findings, run final acceptance, and record P1 completion.

## P2 substeps

- P2.1 `[DONE]` Identity/device persistence foundation.
- P2.2 `[DONE]` Email OTP request/verify, abuse controls, durable delivery and portal session.
- P2.3 `[NEXT]` Device authorization start/approve/deny/expire plus client idempotency.
- P2.4 `[PLANNED]` Short-lived access-token auth plus opaque refresh rotation/reuse detection.
- P2.5 `[PLANNED]` Device exchange/list/revoke/device limits and transactional audit.
- P2.6 `[PLANNED]` Portal activation flow plus simulated extension client and E2E.
- P2.7 `[PLANNED]` P2 security/architecture audit and final P2 acceptance/checkpoint.

# Parallel Bridge rule

During P1-P10, the active Bridge can continue changing independently. Server uses contracts, fixtures and pinned reference knowledge. It does not continuously copy Bridge runtime internals.

At P11 the current accepted Bridge becomes the only meaningful integration baseline.
