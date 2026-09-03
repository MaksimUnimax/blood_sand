# Product Control Plane — Target Architecture

Status: architecture authority for the parallel commercial/server track  
Date: 2026-09-03  
Repository: `MaksimUnimax/blood_sand`  
Server branch: `feature/product-control-plane-server-2026-09-03`

## 1. Purpose

This directory defines and later implements the commercial control plane for the browser bridge product.

The Ozon Bridge continues to evolve independently under `tooling/llm-api-bridges/ozon-seller/`. During the parallel-development phase the server MUST NOT import or depend on bridge implementation internals. The two tracks meet only through an explicit versioned integration contract. When the bridge is ready, the then-current accepted bridge version is integrated; today's bridge source is not frozen into the server.

The commercial product remains a bridge, not an analytics SaaS and not its own LLM.

Target product path:

`business data adapter <-> browser extension <-> user's chosen supported web AI`

The server is a control plane for identity, subscription, entitlement, remote configuration, compatibility, administration, health and diagnostics. Seller business-data traffic remains in the client data plane unless a future explicitly approved feature changes that boundary.

## 2. Architectural principles

### A1. Control plane != data plane

Control plane responsibilities:

- accounts and identity;
- devices and sessions;
- subscriptions and billing state;
- plans, prices and entitlements;
- feature flags and staged rollout;
- supported AI registry;
- declarative AI adapter/profile registry;
- extension compatibility policy;
- browser-family compatibility metadata;
- health/degraded/maintenance state;
- safe diagnostic metadata;
- admin operations and audit;
- notifications;
- release metadata.

Client data-plane responsibilities:

- Ozon credentials;
- provider requests to Ozon;
- provider responses and seller payloads;
- local provider quota/cache state;
- bridge queue/exactly-once state;
- AI page binding;
- conversation identity;
- command discovery;
- result delivery into the user's AI;
- local security enforcement.

The baseline product server MUST NOT store Ozon API credentials, raw orders, raw finance/sales payloads, customer PII, AI conversation contents, or complete provider responses.

### A2. Server policy may restrict packaged client capability, never expand it

Effective capability is the intersection:

`PACKAGED_CLIENT_CAPABILITY ∩ SERVER_ENTITLEMENT ∩ REMOTE_OPERATION_STATUS`

Remote configuration may disable a packaged feature or choose among packaged declarative strategies. It MUST NOT instruct the extension to execute arbitrary JavaScript, arbitrary URLs, arbitrary HTTP methods, arbitrary headers, arbitrary auth material, or arbitrary provider operations that are not packaged and validated locally.

### A3. Modular monolith first

The server starts as a modular monolith with clear module boundaries and one primary PostgreSQL database. It MUST NOT be decomposed into microservices merely for organizational reasons.

Modules communicate through typed in-process contracts and domain events. Boundaries must be strong enough that a future high-load module can be extracted without rewriting the domain model.

### A4. Browser, AI and data-source dimensions are independent

The product must avoid N×M integrations.

Independent dimensions:

- browser family: Chrome first; Yandex Browser later; future Chromium variants if approved;
- AI family: ChatGPT, Alice, later Claude/Gemini/etc.;
- AI surface/variant: standard chat, Work, account/UI variants;
- data source: Ozon first, later Wildberries/Yandex/etc.;
- billing provider: provider adapter, not domain logic.

Browser support MUST be modeled behind a browser-family capability layer. Adding Yandex Browser must not fork the server product or duplicate business logic.

### A5. Contract first

Every client/server boundary is versioned and schema-validated before implementation.

The server API, bootstrap payload, signed configuration payload, diagnostic event format and health evidence format all require explicit schemas. Breaking changes require a new contract version or an explicit compatibility migration.

### A6. Immutable revisions

Published plans, prices, adapter profiles and configuration releases are revisioned. Published historical revisions are not silently rewritten.

Examples:

- `plan -> plan_revision`;
- `price -> price_revision`;
- `adapter -> adapter_profile_revision`;
- `config_release -> config_version`.

Rollback must be a first-class operation.

## 3. Repository layout

Target layout under `server/`:

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
  reference/
    bridge/
      BASELINE.md
      SOURCE_MAP.md
  apps/
    api/                # Fastify control-plane API
    worker/             # durable async jobs / notifications
    portal/             # user account / billing / devices
    admin/              # internal administration UI
    health-runner/      # controlled-browser compatibility checks
  packages/
    contracts/          # shared versioned schemas/types
    db/                 # schema, migrations, repositories
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

No production implementation is required to exist in these directories until its roadmap step begins.

## 4. Runtime topology

Initial production topology:

```text
                          +--------------------+
                          | User Portal        |
                          +---------+----------+
                                    |
                          +---------v----------+
                          | Control API        |
                          | modular monolith   |
                          +----+-----------+---+
                               |           |
                     +---------v--+    +---v-------------+
                     | PostgreSQL |    | Object Storage  |
                     +------------+    | health evidence |
                                       +-----------------+
                               |
                        +------v-------+
                        | Worker       |
                        | pg-backed    |
                        +--------------+

 Browser extension --------------------> Control API
       |
       +-------------------------------> Ozon API directly
       |
       +-------------------------------> active supported AI DOM

 Health runner(s) ----------------------> supported AI websites
       |
       +-------------------------------> Control API / evidence store
```

Health runners are operational agents, not user data-plane proxies.

## 5. Applications

### 5.1 `apps/api`

Owns HTTP API surfaces:

- device authorization;
- session refresh/revocation;
- bootstrap;
- account/device reads;
- plan/subscription reads;
- billing checkout orchestration;
- payment webhook ingestion;
- safe diagnostics ingestion;
- remote configuration distribution;
- admin API;
- health results/incident API.

It contains transport wiring only. Domain rules live in packages/modules.

### 5.2 `apps/worker`

Owns durable asynchronous work:

- email OTP delivery;
- payment reconciliation;
- subscription state transitions;
- grace/expiry jobs;
- health scheduling orchestration;
- notification delivery;
- evidence retention cleanup;
- rollout monitoring;
- periodic consistency checks.

The initial queue MUST use PostgreSQL-backed jobs so Redis is not mandatory at product start.

### 5.3 `apps/portal`

User-facing web application:

- sign-in/OTP;
- device activation;
- account status;
- subscription and renewal;
- plan selection;
- payments/history as appropriate;
- device list and revoke;
- extension status/help;
- privacy/diagnostics controls.

### 5.4 `apps/admin`

Internal administration application:

- accounts/users/devices;
- subscription grant/extend/suspend;
- plan creation/edit/archive;
- price revision creation;
- plan entitlement changes;
- feature flags and rollout;
- AI adapter enable/disable;
- adapter profile revision selection;
- compatibility policy;
- health dashboard/incidents;
- diagnostic aggregation;
- manual device revoke;
- audit log.

All mutating admin actions MUST be audited.

### 5.5 `apps/health-runner`

Runs deterministic controlled-browser compatibility checks for supported AI interfaces.

It MUST NOT delegate the definition of expected behavior to an LLM. The expected contours and assertions are explicit code/configuration. Codex may be used as a coding/repair assistant after an incident, but deterministic tests decide pass/fail.

The runner supports browser drivers independently:

- Chrome driver first;
- Yandex Chromium driver later;
- future drivers through the same runner contract.

## 6. Domain modules

### 6.1 Identity and accounts

Core entities:

- user;
- account/tenant;
- account membership;
- email identity;
- admin identity.

Start with passwordless email OTP. Social login is optional and must not change internal user/account identifiers.

### 6.2 Devices and sessions

A device represents an authorized browser-extension installation, not merely a browser cookie.

Required capabilities:

- device authorization flow;
- device name/browser metadata;
- active/revoked status;
- device-count entitlement;
- session revocation;
- short-lived access token;
- rotating opaque refresh token stored hashed server-side.

### 6.3 Plans, prices and subscriptions

Separate concepts:

- plan = sellable product family;
- plan revision = entitlement composition/version;
- price = logical price identity;
- price revision = amount/currency/period/effective dates;
- subscription = account's commercial state;
- subscription price binding = exact price revision governing that subscription.

Changing a public price MUST NOT silently rewrite existing subscription history.

Subscription states at minimum:

`TRIAL | ACTIVE | GRACE | PAST_DUE | CANCELED | EXPIRED | SUSPENDED`

### 6.4 Entitlements

Entitlements are named capabilities, not UI booleans.

Examples:

- `source.ozon`;
- `ozon.analytics`;
- `ozon.performance`;
- `ai.chatgpt`;
- `ai.alice`;
- `device.max_active`;
- `feature.guided_commands`.

Resolution can depend on global policy, plan, account override and rollout policy. The final server decision must be explicit and explainable for diagnostics/admin use.

### 6.5 Remote configuration and feature flags

Remote configuration is declarative and signed.

It may contain:

- adapter/profile selection metadata;
- selector strategies understood by packaged code;
- timeouts within packaged safe ranges;
- supported host patterns already allowed by packaged code;
- health state;
- release messages;
- feature flags;
- rollout assignment;
- minimum compatible extension version.

It MUST NOT contain remote executable code.

### 6.6 AI adapter registry

Model:

`AI family -> surface -> variant -> profile revision`

Example:

`chatgpt -> work -> work_composer_v3 -> profile 37`

The normal product flow uses automatic detection from the active tab and packaged detection logic. Manual AI selection is not part of normal UX; an advanced diagnostic override may exist for test/support purposes.

### 6.7 Browser compatibility

Server-side browser model:

- `browser_family`: e.g. `chrome`, `yandex_chromium`;
- `browser_version`;
- `extension_version`;
- supported/minimum versions;
- known compatibility constraints;
- health matrix metadata.

Browser-family differences must be represented as compatibility data/capabilities, not as duplicated account/billing/server logic.

### 6.8 Diagnostics

Allowed diagnostic metadata examples:

- device pseudonymous ID;
- extension version;
- browser family/version;
- AI family/surface/profile revision;
- stage;
- stable error code;
- timing/count metadata;
- health/config version.

Forbidden baseline diagnostics:

- Ozon credentials;
- raw provider payloads;
- customer PII;
- full AI prompts/conversation text;
- complete business reports.

### 6.9 Health and compatibility

Health is a first-class product subsystem.

State model:

`HEALTHY | DRIFT | DEGRADED | BROKEN | UNKNOWN | MAINTENANCE`

The system monitors named critical UI contours instead of diffing whole pages. See `HEALTH_SYSTEM.md`.

## 7. Main client flows

### 7.1 Device authorization

1. Extension starts device authorization.
2. Server creates expiring device authorization request and user code.
3. Browser opens the product activation page.
4. User authenticates by email OTP.
5. User confirms the requested device.
6. Extension polls/exchanges the device code.
7. Server returns short-lived access token plus rotating refresh token.
8. Device record becomes ACTIVE.

### 7.2 Bootstrap

Extension sends:

- contract version;
- extension version;
- browser family/version;
- device ID;
- detected AI family/surface/variant when available;
- last config version.

Server returns one signed, cacheable snapshot containing:

- account/subscription status;
- effective entitlements;
- device policy;
- compatible extension policy;
- supported AI status;
- selected adapter/profile revision for the detected surface;
- feature flags/rollout assignment;
- config version and expiry;
- offline-grace metadata;
- server time.

The client validates schema, signature and expiry before use.

### 7.3 Automatic AI resolution

1. Active tab host is identified locally.
2. Packaged detector identifies AI family.
3. Packaged surface/variant detector identifies the page shape.
4. Bootstrap/profile resolution selects the allowed profile revision.
5. Local capability + entitlement + health state are checked.
6. The adapter binds to the page.

Switching active AI tabs may rebind AI/conversation state but MUST NOT reset unrelated provider quota/cache/credential state.

### 7.4 Subscription/payment

1. Portal/API creates checkout for a concrete price revision.
2. Payment provider handles payment.
3. Provider webhook reaches server.
4. Webhook signature/idempotency are validated.
5. Billing event is recorded immutably.
6. Subscription state transition is performed.
7. Next token refresh/bootstrap exposes updated entitlements.

Return-page redirects are never authoritative payment proof.

## 8. Health architecture

Health checks run through named suites against controlled accounts and browser profiles.

The first implementation should support:

- scheduled daily standard smoke checks;
- on-demand checks after profile changes;
- pre-rollout candidate-profile checks;
- post-rollout monitoring;
- browser-family matrix checks when Yandex support begins.

Critical contour examples:

- page identity;
- conversation root;
- composer root;
- composer input;
- send control;
- busy/stop control;
- assistant message detection;
- code-block/command discovery surface;
- native Copy control where required;
- completion detection;
- conversation identity;
- insertion/delivery path.

Each contour can have structural and behavioral assertions.

A primary selector failure with a working fallback is DRIFT/DEGRADED, not HEALTHY, because it is an early-warning signal.

Evidence is sanitized and stored with retention limits. Candidate fixes are versioned profile revisions or extension-code changes. Automated production mutation is not allowed initially; rollout requires an explicit approval gate.

## 9. Technology direction

The default implementation stack is defined in `TECH_STACK.md` and is intentionally replaceable behind interfaces.

Baseline choices:

- Node.js 22 LTS;
- TypeScript strict mode;
- Fastify API;
- PostgreSQL;
- Drizzle ORM/migrations;
- Zod-based schemas/OpenAPI;
- PostgreSQL-backed job queue (`pg-boss` or accepted equivalent);
- React/Next.js for portal/admin;
- Playwright for health runners and web E2E;
- Vitest for unit/integration tests;
- Pino structured logs;
- OpenTelemetry-compatible instrumentation;
- S3-compatible object storage for sanitized health evidence;
- Docker for reproducible environments;
- OpenTofu/Terraform-compatible infrastructure definitions when production provisioning begins.

No Redis, Kafka, Kubernetes, service mesh or microservice split is justified at product start.

## 10. Availability and failure policy

### Server outage

An already-authorized extension may continue for a bounded signed offline-grace period using the last valid configuration/entitlement snapshot. A new device cannot authorize without the server.

### Payment-provider outage

Current active subscriptions remain usable according to their state. New payment actions fail visibly and are retried/reconciled through durable jobs; access is not revoked because checkout is temporarily unavailable.

### AI adapter broken

Server health marks the affected adapter/surface unavailable or degraded. Other AI adapters remain independently available.

### Browser-family issue

A Chrome failure MUST NOT automatically disable Yandex and vice versa unless the root cause is shared and independently demonstrated.

## 11. Environments

Required logical environments:

- local;
- test/CI;
- staging;
- production.

Production credentials, payment webhooks, email credentials, config-signing private key and health-account secrets are never shared with CI/local environments.

Each environment has separate database and secrets. Staging may use payment sandbox/test mode and dedicated AI health accounts.

## 12. Scaling path

Initial scale strategy:

1. one modular API deployment with horizontal-ready stateless HTTP handling;
2. one PostgreSQL primary (managed preferred in production);
3. one or more worker processes;
4. isolated health-runner agents;
5. object storage for evidence;
6. CDN only for public/static artifacts when needed.

Scale bottlenecks are measured before introducing new infrastructure. If a module becomes independently load-heavy, extraction is allowed only behind its existing domain contract.

## 13. Non-goals for baseline server

The baseline server does NOT:

- run LLM inference for normal product use;
- proxy every Ozon request;
- store seller analytics datasets;
- generate seller reports/charts;
- execute arbitrary remote extension code;
- manage Ozon credentials;
- replace the current bridge runtime;
- hard-code Chrome-only assumptions into account/billing/config domains;
- automatically push unreviewed AI-generated fixes to production.

## 14. Integration gate with the evolving Bridge

The server can be developed without the final Bridge as long as all client contracts are represented by fixtures/test clients.

The actual Bridge is connected only when:

1. the server-side client contract is versioned and accepted;
2. the Bridge has an accepted integration candidate build;
3. browser/AI state ownership is mapped explicitly;
4. server bootstrap cannot reset provider execution state;
5. remote config cannot expand the bridge security boundary;
6. auth/session state is isolated from provider credentials;
7. integration tests prove offline/restart/rebind behavior;
8. current Bridge regressions remain protected.

Until that gate, server work MUST use a simulated extension client rather than patching the active Bridge branch.