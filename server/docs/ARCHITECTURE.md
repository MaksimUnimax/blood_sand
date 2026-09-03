# Product Control Plane — Target Architecture

Status: architecture authority for the parallel commercial/server track  
Date: 2026-09-03  
Repository: `MaksimUnimax/blood_sand`  
Server branch: `feature/product-control-plane-server-2026-09-03`

## 1. Purpose and split strategy

This directory defines and later implements the commercial control plane around the browser bridge.

The active Ozon Bridge continues independently under `tooling/llm-api-bridges/ozon-seller/`. During the parallel-development phase the server MUST NOT import Bridge implementation internals. Both tracks meet through the versioned contract in `INTEGRATION_CONTRACT.md`. At roadmap P11 the then-current accepted Bridge version is integrated; today's Bridge is only a reference snapshot.

The product remains a bridge, not an analytics SaaS and not its own LLM:

`business data adapter <-> browser extension <-> user's supported web AI`

## 2. Fundamental architecture

### 2.1 Control plane != data plane

Server/control-plane owns:

- user/account identity;
- devices and sessions;
- plans/prices/subscriptions;
- entitlements and feature policy;
- declarative remote configuration;
- AI adapter/profile registry;
- extension/browser compatibility policy;
- AI/browser health state;
- safe diagnostics metadata;
- admin operations/audit;
- billing-provider orchestration;
- notifications/release metadata.

Browser/client data plane owns:

- Ozon credentials;
- Ozon requests/responses;
- seller business payloads;
- provider quota/cache/prefetch/execution state;
- Bridge command queue/exactly-once ownership;
- AI DOM/conversation binding;
- result delivery;
- local provider/security allowlists.

Baseline server MUST NOT store Ozon API credentials, raw seller datasets, customer PII, complete provider responses or full AI conversations.

### 2.2 Server can restrict but cannot expand packaged capability

Effective client capability:

`PACKAGED_CLIENT_CAPABILITY ∩ SERVER_ENTITLEMENT ∩ REMOTE_HEALTH/FEATURE_POLICY`

Server may disable an operation, plan feature or broken AI surface. It cannot send arbitrary JavaScript, URLs, methods, headers, auth values or provider operations outside the packaged client security boundary.

### 2.3 Declarative remote profiles only

AI adapter profile changes may be delivered remotely when they use strategy primitives already packaged in the extension. Published profiles are signed, schema-validated, revisioned, testable, staged and rollbackable.

New interaction primitives/security capabilities require an extension release.

### 2.4 Modular monolith first

Start with one modular TypeScript codebase and one primary PostgreSQL database. HTTP API, worker, portal/admin and health-runner are separate applications/process roles but share domain packages/contracts.

No microservice split, Redis, Kafka or Kubernetes is justified at baseline.

## 3. Independent product dimensions

Do not build N×M custom integrations.

Independent dimensions:

- **Browser family**: Chrome first; Yandex Browser later; future Chromium variants if justified.
- **AI family**: ChatGPT, Alice, later others.
- **AI surface/variant**: e.g. ChatGPT standard vs Work, account/UI variants.
- **Data source**: Ozon first, later WB/Yandex/etc.
- **Billing provider**: adapter behind stable billing domain.
- **Notification provider**: adapter behind stable incident/notification domain.

Chrome-first is prioritization only. `browser_family` is explicit in compatibility, diagnostics and Health. Yandex Browser must not fork billing/account/server logic.

## 4. Target repository layout

```text
server/
  README.md
  docs/
    ARCHITECTURE.md
    REQUIREMENTS.md
    ROADMAP.md
    DEVELOPMENT_RULES.md
    SECURITY.md
    INTEGRATION_CONTRACT.md
    TECH_STACK.md
    DATA_MODEL.md
    API_CONTRACTS.md
    HEALTH_SYSTEM.md
    BILLING_AND_PLANS.md
    ADR/
  reference/bridge/
    BASELINE.md
    SOURCE_MAP.md
  apps/
    api/
    worker/
    portal/
    admin/
    health-runner/
  packages/
    contracts/
    db/
    auth/
    accounts/
    devices/
    plans/
    billing/
    entitlements/
    remote-config/
    adapter-registry/
    compatibility/
    diagnostics/
    health-core/
    notifications/
    observability/
    shared/
  infra/
    docker/
    compose/
    opentofu/
    runbooks/
```

These directories may be documentation-only until their roadmap step begins. Codex creates implementation only from an approved work packet.

## 5. Runtime topology

```text
                    +-----------------------+
                    | Portal / Admin        |
                    +-----------+-----------+
                                |
                    +-----------v-----------+
                    | Control API           |
                    | modular monolith      |
                    +-----+------------+----+
                          |            |
                 +--------v---+   +----v----------------+
                 | PostgreSQL |   | S3-compatible       |
                 +--------+---+   | health evidence     |
                          |       +---------------------+
                    +-----v------+
                    | Worker     |
                    | PG jobs    |
                    +------------+

Extension -----------------------> Control API
   |
   +------------------------------> Ozon API directly
   |
   +------------------------------> supported AI DOM

Health runner(s) -----------------> supported AI web UI
   |
   +------------------------------> Control API/evidence store
```

## 6. Applications

### `apps/api`

Thin transport layer for:

- device auth/session refresh;
- bootstrap;
- account/device/subscription portal APIs;
- checkout/webhooks;
- diagnostics ingestion;
- admin API;
- health run/incident control.

Business rules live in packages/modules.

### `apps/worker`

Durable asynchronous work:

- OTP email sends;
- payment reconciliation;
- subscription/grace/expiry transitions;
- notifications;
- health scheduling;
- rollout monitoring;
- evidence retention cleanup;
- consistency jobs.

Use a PostgreSQL-backed durable job queue initially.

### `apps/portal`

User-facing:

- OTP login;
- device activation/revoke;
- subscription/plan/payment state;
- checkout;
- support/privacy/diagnostic controls.

### `apps/admin`

Internal:

- users/accounts/devices;
- grant/extend/suspend subscription;
- plan/price revision management;
- entitlements/feature rules;
- AI adapter enable/disable;
- profile candidate/test/publish/rollout/rollback;
- browser compatibility policy;
- Health dashboard/incidents;
- aggregate diagnostics;
- audit log.

Every mutation is RBAC-protected and audited.

### `apps/health-runner`

Controlled browser compatibility testing. Deterministic checks define pass/fail; Codex may implement a repair from evidence but does not override health truth or auto-publish unreviewed production changes.

Browser driver interface supports Chrome first and Yandex Chromium later.

## 7. Domain modules

### Identity/accounts

Separate `user`, `account/tenant`, membership and login identity. Initial product may create one owner account per user, but schema is team-ready.

### Devices/sessions

Extension installation is an authorized device. Use device activation, short-lived access tokens, rotating opaque refresh tokens stored hashed, revoke/device-limit policy.

### Plans/prices/subscriptions

Separate plan, immutable plan revision, price, immutable price revision, subscription and payment/billing-event history. Public repricing creates a new price revision; it does not rewrite existing commercial history.

Subscription states at minimum:

`TRIAL | ACTIVE | GRACE | PAST_DUE | CANCELED | EXPIRED | SUSPENDED`

### Entitlements/features

Stable machine keys such as:

- `source.ozon`;
- `ozon.analytics`;
- `ozon.performance`;
- `ai.chatgpt`;
- `ai.alice`;
- `device.max_active`;
- `feature.guided_commands`.

Resolution is explainable for admin/support.

### AI adapter registry

Model:

`AI family -> surface -> variant -> profile revision`

Normal UX uses auto-detection from active tab through packaged detection logic. Manual override is diagnostic/test-only.

### Browser compatibility

Model browser family/version separately from extension version and AI profile. Browser-specific failures and Health results are scoped independently.

### Diagnostics

Allowlisted metadata only: versions, AI/surface/profile, stage, stable error code, timing/counts, correlation IDs. No generic raw payload field.

### Health

First-class state:

`HEALTHY | DRIFT | DEGRADED | BROKEN | UNKNOWN | MAINTENANCE`

Detailed in `HEALTH_SYSTEM.md`.

## 8. Main flows

### 8.1 Device authorization

1. Extension creates expiring device authorization.
2. Product opens activation URL.
3. User signs in by email OTP.
4. User confirms device.
5. Extension exchanges approved device code.
6. Server issues access + rotating refresh token.
7. Device becomes ACTIVE.

No manual license key is required as the primary flow.

### 8.2 Bootstrap

Extension sends version/browser/device and optional detected AI context. Server returns a signed coherent snapshot with:

- account/subscription state;
- effective entitlements;
- device policy;
- extension/browser compatibility;
- feature/rollout assignment;
- adapter/profile revision/health;
- config version;
- expiry/offline grace;
- server time.

Client validates schema, signature and local capability boundary.

### 8.3 Automatic AI resolution

```text
active tab
 -> packaged trusted-host detector
 -> packaged AI-family detector
 -> packaged surface/variant detector
 -> server entitlement/health/profile resolution
 -> client validates signed declarative profile
 -> bind adapter
```

AI/conversation rebind may reset UI-local binding state but MUST NOT reset Ozon credentials, provider quota/cache or already-completed provider work.

### 8.4 Billing

Checkout references exact price revision. Provider webhook, not browser redirect, proves payment. Webhook verification + idempotency precede subscription mutation. Reconciliation jobs handle delayed/lost delivery.

## 9. Health architecture

Monitor named critical contours, not entire DOM equality.

Baseline contours:

- page identity;
- conversation root;
- composer root/input;
- send control;
- busy/stop state;
- assistant response/completion;
- bridge command/code surface;
- native Copy where required;
- conversation identity;
- delivery path;
- login/modal/blocker state.

Each contour has structural + behavioral assertions, primary/fallback strategies, severity and evidence rules.

A primary selector failure with working fallback is DRIFT/DEGRADED so repair can happen before widespread breakage.

Flow:

`scheduled check -> evidence -> deterministic classification -> incident -> bounded Codex repair task -> candidate test -> approval -> staged rollout -> post-rollout health -> rollback if needed`

## 10. Technology baseline

Canonical details: `TECH_STACK.md`.

Baseline implementation:

- Node.js 24 LTS;
- TypeScript strict;
- Fastify 5;
- PostgreSQL;
- Drizzle + versioned migrations;
- Zod/OpenAPI contracts;
- PostgreSQL-backed durable jobs (`pg-boss` or P1-approved equivalent);
- React/Next.js portal/admin;
- Playwright health/E2E;
- Vitest;
- Pino;
- OpenTelemetry-compatible instrumentation;
- private S3-compatible object storage for sanitized Health evidence;
- Docker;
- OpenTofu/Terraform-compatible IaC when production provisioning starts.

## 11. Availability/failure policy

### Server unavailable

Already-authorized clients may use a bounded last-valid signed offline snapshot through its offline-grace deadline. New activation requires server.

### Billing provider unavailable

Existing valid access is not destroyed merely because checkout/reconciliation provider is temporarily unavailable.

### AI surface broken

Health can disable only affected AI/surface/browser scope. Other AI/browser scopes remain independent.

### Config/profile bad rollout

Pause and rollback to previous immutable profile/config revision.

## 12. Environments

Required:

- local;
- CI/test;
- staging;
- production.

Separate DB/secrets/signing/payment/email/health-account credentials. Production secrets never enter Git or untrusted CI.

## 13. Scaling path

Start with:

- stateless API process(es);
- one PostgreSQL primary (managed preferred for production);
- worker process(es);
- isolated Health runner agents;
- object storage.

Measure before adding Redis/queues/search/microservices/Kubernetes. Extraction only behind existing domain contracts.

## 14. Baseline non-goals

Server does not initially:

- run user LLM inference;
- proxy every Ozon call;
- store seller analytics datasets;
- generate reports/charts;
- hold Ozon credentials;
- execute remote arbitrary extension code;
- replace active Bridge runtime;
- hard-code Chrome into commercial domains;
- auto-deploy unreviewed Codex changes.

## 15. Bridge integration gate

Actual Bridge is connected only when:

1. server client contract is versioned/tested with simulated client;
2. then-current accepted Bridge candidate is pinned;
3. state ownership delta is audited;
4. remote config cannot expand local security boundary;
5. auth/config refresh cannot reset provider state;
6. Ozon credentials/raw data remain outside server baseline;
7. restart/offline/rebind paths pass;
8. existing Bridge exactly-once/delivery/quota regressions remain protected.

Until P11, server work uses fixtures rather than importing active Bridge implementation.