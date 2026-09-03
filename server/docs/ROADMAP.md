# Product Control Plane — Two-Level Roadmap

Status: active roadmap  
Date: 2026-09-03

This roadmap is the source of truth for server/product work while the current Ozon Bridge continues on its own branch.

## 1. Roadmap rules

1. Every implementation task MUST map to exactly one active roadmap item.
2. Every Codex prompt MUST name the roadmap item, acceptance criteria, files allowed to change, tests/evidence required and explicit non-goals.
3. A roadmap item is not DONE because code exists. It is DONE only after tests/evidence and documentation are updated.
4. The server branch MUST NOT opportunistically modify the active Bridge branch during the parallel-development phase.
5. Bridge integration occurs only at the explicit integration gate below.
6. Architecture decisions are made in the server architecture/ADR documents; Codex implements the approved decision and does not invent a parallel architecture.

## 2. Level 1 — Product roadmap

Legend: `[DONE] [ACTIVE] [NEXT] [PLANNED] [BLOCKED]`

### P0 — Architecture and development contract `[ACTIVE]`

Goal: freeze the initial commercial architecture before server implementation.

Deliverables:

- target architecture;
- complete technical requirements;
- two-level roadmap;
- security/trust-boundary specification;
- bridge/server integration contract;
- technology stack;
- data model;
- API contract outline;
- billing/plans model;
- AI health architecture;
- development rules;
- Bridge reference snapshot.

Exit gate:

- documents are internally consistent;
- no server decision requires today's Bridge implementation to remain frozen;
- Chrome-first/Yandex-modular model is explicit;
- control-plane/data-plane boundary is explicit;
- no unresolved critical architecture ambiguity remains before code skeleton work.

### P1 — Repository and engineering foundation `[NEXT]`

Goal: create a reproducible server workspace without domain behavior yet.

Deliverables:

- pnpm workspace;
- Node.js/TypeScript strict baseline;
- Fastify app shell;
- worker shell;
- portal/admin shells;
- health-runner shell;
- shared contract package;
- database package;
- lint/format/test/typecheck commands;
- Docker local PostgreSQL;
- environment configuration loader/validation;
- CI pipeline;
- structured logging/correlation IDs;
- initial migration harness;
- architecture dependency checks where practical.

Acceptance:

- clean checkout -> documented bootstrap -> all checks pass;
- no real product secrets required locally;
- all apps build independently;
- PostgreSQL integration test runs in CI;
- no Bridge code imported.

### P2 — Accounts, OTP identity and device authorization `[PLANNED]`

Goal: a user can create/access an account and authorize an extension installation.

Subareas:

- users/accounts/memberships;
- passwordless email OTP;
- device authorization request/approval/exchange;
- device lifecycle;
- short access token;
- rotating refresh token;
- revocation/reuse detection;
- audit events;
- user portal activation page.

Acceptance:

- end-to-end simulated extension activation flow;
- refresh rotation tests;
- revoked device cannot refresh;
- OTP rate/expiry/single-use tests;
- audit events verified.

### P3 — Bootstrap, compatibility and signed remote configuration `[PLANNED]`

Goal: authorized clients receive a safe versioned server policy snapshot.

Subareas:

- `/v1/bootstrap`;
- client contract versioning;
- extension/browser metadata;
- config versioning;
- Ed25519 signing;
- client test verifier fixture;
- minimum compatible extension policy;
- signed offline-grace snapshot;
- remote feature flags;
- rollout assignment primitives.

Acceptance:

- valid snapshot verifies;
- modified snapshot fails verification;
- expiry/grace behavior tested;
- old/unsupported client gets deterministic response;
- remote payload cannot encode arbitrary executable behavior.

### P4 — Plans, price revisions and entitlement engine `[PLANNED]`

Goal: commercial capability can be changed from the server/admin without an extension release.

Subareas:

- plans;
- plan revisions;
- prices;
- price revisions;
- plan entitlement mapping;
- account overrides;
- device limits;
- effective entitlement resolver;
- explanation/debug output;
- admin CRUD/publish/archive flows.

Acceptance:

- new price does not rewrite old subscription binding;
- plan revisions are immutable after publish;
- account override resolution deterministic;
- device max entitlement enforced;
- audit complete.

### P5 — Billing and subscription state machine `[PLANNED]`

Goal: paid access works correctly and idempotently.

Subareas:

- billing provider interface;
- first payment provider adapter;
- checkout;
- webhook verification;
- immutable billing event ledger;
- subscription state transitions;
- trial/grace/expiry;
- reconciliation jobs;
- manual admin grant/extend/suspend;
- portal billing views.

Acceptance:

- duplicate webhook cannot double-activate;
- invalid webhook cannot mutate subscription;
- delayed webhook reconciles;
- provider outage does not corrupt current subscription state;
- billing changes audited.

### P6 — Admin and operations core `[PLANNED]`

Goal: operate the first real users without direct database edits.

Admin capabilities:

- account lookup;
- subscription grant/extend/suspend/restore;
- device revoke;
- plan/price management;
- entitlement overrides;
- feature enable/disable;
- AI adapter/surface enable/disable;
- adapter profile activation/rollback;
- compatibility policy;
- health dashboard;
- diagnostics aggregation;
- admin audit log.

Acceptance:

- no required first-line support action needs SQL/manual DB mutation;
- every mutation RBAC-protected and audited.

### P7 — AI adapter registry and auto-selection contract `[PLANNED]`

Goal: remove manual AI selection from normal UX and make AI profiles server-manageable.

Subareas:

- AI family registry;
- surfaces/variants;
- declarative profile schema;
- immutable profile revisions;
- profile compatibility constraints;
- automatic-resolution contract;
- staged profile rollout;
- rollback;
- advanced diagnostic override only.

Target model:

`active tab -> packaged AI detector -> packaged surface/variant detector -> server profile resolution -> local bind`

Acceptance:

- ChatGPT Standard and Work can resolve independently;
- one profile can be rolled back without affecting another surface;
- server cannot add arbitrary host/code/method capability;
- profile selection testable with simulated client.

### P8 — AI Compatibility Health v1 `[PLANNED]`

Goal: detect important AI UI changes before they become widespread user incidents.

Subareas:

- health orchestrator;
- controlled Chrome sessions;
- critical contour registry;
- structural + behavioral assertions;
- daily schedule;
- on-demand runs;
- sanitized evidence bundles;
- DRIFT/DEGRADED/BROKEN classification;
- incident creation;
- alert delivery;
- candidate-profile test path;
- rollout/rollback hooks.

Initial contours:

- page identity;
- conversation root;
- composer root/input;
- send control;
- busy/stop state;
- assistant response/completion;
- code-block/command surface;
- native Copy when required;
- conversation identity;
- result delivery path;
- blocker/login/modal state.

Acceptance:

- intentionally changed selector causes DRIFT rather than silent healthy;
- broken fallback causes DEGRADED/BROKEN according to severity;
- evidence contains enough context for Codex to implement a repair without exposing user seller data;
- successful candidate profile returns health to HEALTHY after approved rollout.

### P9 — Diagnostics, notifications and operational visibility `[PLANNED]`

Goal: support and maintain the product at low marginal support cost.

Subareas:

- safe diagnostic event API;
- strict server-side event schema;
- aggregate dashboards;
- error-code taxonomy;
- health notifications;
- backend incident notifications;
- billing/reconciliation notifications;
- retention policies;
- observability dashboards and alerts.

Acceptance:

- common failures can be diagnosed by version/browser/AI/profile/error code;
- forbidden raw payload fields are rejected/sanitized;
- alert noise controls exist.

### P10 — Bridge integration preparation `[PLANNED]`

Goal: prove server/client contract against a simulated extension and prepare the actual Bridge connection.

Subareas:

- reference client SDK/fixture;
- bootstrap verifier fixture;
- device-auth fixture;
- adapter profile fixture;
- compatibility matrix fixture;
- bridge integration checklist;
- mapping from current Bridge state machines to new control-plane lifecycle.

Acceptance:

- server product can be fully tested without the production Bridge;
- integration contract changes are explicit/versioned.

### P11 — Integrate the then-current accepted Ozon Bridge `[PLANNED]`

Goal: attach the current accepted Bridge build, not the old server-project baseline.

Required protections:

- Ozon credentials remain local;
- raw seller data remains local in baseline product;
- provider fixed-host/method/read-only security survives;
- server policy only restricts packaged capability;
- AI binding lifecycle does not reset provider lifecycle;
- provider quota/cache state survives unrelated UI/auth/config refreshes;
- exactly-once/delivery regressions remain protected;
- offline-grace and restart behavior tested.

Acceptance:

- integrated Chrome build passes both Bridge regression suite and server-client contract suite.

### P12 — Chrome commercial acceptance `[PLANNED]`

Goal: first complete browser product path.

Acceptance areas:

- install/onboarding;
- auth/device;
- payment/subscription;
- Ozon connect;
- automatic AI detection;
- remote profile;
- bridge question -> data -> AI answer flow;
- diagnostics;
- health monitoring;
- update/compatibility handling;
- privacy/store disclosures;
- failure/recovery paths.

Chrome is first only as a prioritization choice, not an architectural dependency.

### P13 — Yandex Browser compatibility `[PLANNED]`

Goal: add Yandex Browser without forking the product architecture.

Subareas:

- Yandex Chromium browser driver/capabilities;
- installation/distribution path;
- permissions differences;
- health-runner Yandex agent;
- browser-specific compatibility records;
- same account/device/billing/bootstrap contracts.

Acceptance:

- browser-specific failures do not contaminate Chrome health state;
- no duplicated billing/account/adapter domain code;
- cross-browser regression matrix accepted.

### P14 — Production launch hardening `[PLANNED]`

Goal: operate paying users safely.

Deliverables:

- production infrastructure;
- secrets management;
- backup and restore drill;
- database recovery runbook;
- payment reconciliation runbook;
- AI compatibility incident runbook;
- release/rollback runbook;
- monitoring/alerts;
- privacy/legal/store readiness;
- support diagnostics;
- staged user rollout.

### P15 — Post-Ozon expansion `[PLANNED]`

Only after the Ozon paid-product path is proven:

- additional marketplace/data-source adapters;
- additional AI adapters;
- additional browser families where justified;
- cross-source product capabilities.

The abstraction remains:

`business data adapters -> common bridge protocol -> supported AI adapters`

## 3. Level 2 — Current active execution plan (P0)

### P0.1 `[DONE]` Create parallel server branch

Branch: `feature/product-control-plane-server-2026-09-03`.

The branch was created from the then-current Ozon work-session branch so repository context is available without forcing future Bridge coupling.

### P0.2 `[DONE]` Create `server/` root and documentation skeleton

### P0.3 `[ACTIVE]` Complete architecture authority documents

Required documents:

- `ARCHITECTURE.md`;
- `REQUIREMENTS.md`;
- `ROADMAP.md`;
- `DEVELOPMENT_RULES.md`;
- `SECURITY.md`;
- `INTEGRATION_CONTRACT.md`;
- `TECH_STACK.md`;
- `DATA_MODEL.md`;
- `API_CONTRACTS.md`;
- `BILLING_AND_PLANS.md`;
- `HEALTH_SYSTEM.md`.

### P0.4 `[ACTIVE]` Capture Bridge reference snapshot

Copy/record only material necessary for server design:

- current product direction;
- current Bridge baseline/provenance;
- security/execution invariants;
- current source path/commit references;
- integration-relevant lifecycle rules.

Do NOT import experimental implementation code into the server track.

### P0.5 `[NEXT]` Architecture consistency audit

Check:

- every requirement has an owning module;
- every major module has a roadmap step;
- all admin requirements map to data-model entities/API operations;
- health model maps to browser modularity;
- payment model maps to immutable price revisions;
- no server flow requires Ozon credentials/raw data;
- no remote config expands packaged capability.

### P0.6 `[NEXT]` Freeze P1 Codex implementation packet

The first coding packet must contain:

- exact directory structure;
- package/tool versions/ranges;
- commands;
- architecture-boundary rules;
- files to create;
- tests to implement;
- expected CI outputs;
- explicit non-goals;
- evidence/roadmap update requirements.

Only after P0 exit does Codex begin P1 implementation.

## 4. Parallel Bridge rule

While server P0-P10 are being built, the Bridge may continue changing independently.

Server development MUST use:

- versioned client contracts;
- simulated extension fixtures;
- pinned reference snapshots.

It MUST NOT continuously copy live Bridge internals into the server branch. That would create a moving dependency and defeat parallel development.

At P11, fetch the current accepted Bridge state, audit delta against the reference snapshot and integrate that version deliberately.
