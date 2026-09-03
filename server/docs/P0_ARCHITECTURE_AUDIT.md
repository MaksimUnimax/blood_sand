# P0 Architecture Consistency Audit

Date: 2026-09-03  
Status: PASS — architecture foundation is sufficient to begin P1 engineering foundation.

## 1. Audit scope

Checked consistency across:

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
- `HEALTH_SYSTEM.md`;
- `TEST_STRATEGY.md`;
- ADRs;
- `reference/bridge/*`;
- P1 Codex packet.

## 2. Requirement -> owning module coverage

PASS.

- identity/OTP -> auth/accounts;
- device auth/session -> devices/auth;
- plans/prices/subscription -> plans/billing;
- entitlements/features -> entitlements/remote-config;
- AI registry/profiles -> adapter-registry/remote-config;
- browser compatibility -> compatibility;
- diagnostics -> diagnostics;
- Health -> health-core + health-runner;
- notifications -> notifications/worker;
- admin operations -> admin app + owning domain command APIs;
- audit -> shared/domain persistence requirement;
- Bridge integration -> contracts + P10/P11.

No functional requirement depends on an ownerless subsystem.

## 3. Requirement -> roadmap coverage

PASS.

- engineering foundation -> P1;
- identity/device -> P2;
- bootstrap/config -> P3;
- plans/entitlements -> P4;
- billing/subscription -> P5;
- admin -> P6;
- AI auto-detection/profile platform -> P7;
- Health -> P8;
- diagnostics/notifications -> P9;
- simulated client/integration prep -> P10;
- actual current Bridge integration -> P11;
- Chrome acceptance -> P12;
- Yandex Browser -> P13;
- production hardening -> P14.

## 4. Admin capability coverage

PASS.

Required operations are represented in requirements/API/data model:

- grant/extend/suspend subscription;
- revoke device;
- create/edit/hide/archive plans;
- create/publish price revisions;
- plan entitlement revision/overrides;
- feature enable/disable;
- AI adapter/surface enable/disable;
- profile candidate/publish/rollout/rollback;
- health run/incident views;
- aggregate diagnostics;
- audit history.

No normal first-line admin operation is intended to require direct SQL after P6.

## 5. Pricing history correctness

PASS.

Architecture consistently separates:

- plan;
- plan revision;
- entitlement composition;
- price;
- price revision;
- subscription binding;
- payments/billing events.

Changing price does not rewrite historical subscription/payment terms. Grandfathering and explicit migration remain possible.

## 6. Health/browser modularity

PASS.

Health results are scoped by AI family/surface/variant/browser/profile/suite revision.

Chrome-first is only roadmap priority. Yandex Chromium is a separate browser driver/capability target. No account/billing/product domain is browser-specific.

## 7. Health/Codex responsibility

PASS.

Deterministic health checks are the source of pass/fail truth. Codex receives bounded incident evidence and writes candidate profile/code repairs. Initial architecture forbids unreviewed Codex auto-production deployment.

## 8. Remote-config security

PASS.

All architecture documents agree:

- profiles are declarative;
- published revisions immutable;
- signed/schema validated;
- server can restrict but not expand packaged capability;
- no arbitrary JavaScript/URL/method/header/auth/provider-operation control.

## 9. Seller-data privacy boundary

PASS.

No baseline server requirement needs:

- Ozon Client ID/API Key;
- raw Ozon responses;
- customer PII;
- full AI conversations.

Diagnostics and Health evidence have explicit allowlist/sanitization boundaries.

## 10. Bridge parallel-development boundary

PASS.

Server can proceed through P10 using contracts/fixtures. Active Bridge implementation remains independent. P11 explicitly requires a fresh accepted Bridge snapshot/delta audit.

The old v0.1.19 development baseline is reference only and is explicitly marked non-canonical.

## 11. Technology consistency

PASS.

Canonical baseline:

- Node.js 24 LTS;
- TypeScript strict;
- pnpm workspace;
- Fastify 5;
- PostgreSQL;
- Drizzle;
- Zod/OpenAPI;
- PostgreSQL-backed durable jobs;
- Next.js/React portal/admin;
- Playwright;
- Vitest;
- Pino/OpenTelemetry-compatible observability;
- S3-compatible private Health evidence storage;
- Docker;
- OpenTofu/Terraform-compatible IaC later.

No baseline dependency on Redis/Kafka/Kubernetes/microservices.

## 12. Testability consistency

PASS.

Each high-risk domain has deterministic acceptance layers:

- auth/session replay;
- DB transaction/idempotency;
- billing webhook duplication/forgery;
- config signature/tamper;
- plan/price immutability;
- Health drift/breakage classification;
- Bridge integration regressions.

Live third-party AI health is operational monitoring, not an ordinary CI availability dependency.

## 13. Deliberately deferred decisions — NOT P1 blockers

These decisions are intentionally postponed to their owning roadmap step:

1. exact public product/brand name;
2. exact first plan names/public prices/trial policy;
3. exact first billing provider;
4. exact email provider;
5. exact notification channel/provider (Telegram/email likely candidates);
6. exact production hosting/cloud provider;
7. exact object-storage provider;
8. exact legal retention periods;
9. exact offline-grace duration;
10. exact AI selector/profile contents;
11. final Chrome/Yandex store/distribution procedure;
12. exact `pg-boss` vs equivalent PostgreSQL job library — P1 may finalize via ADR.

These are provider/policy choices behind already-defined interfaces and do not block foundation code.

## 14. P1 readiness

PASS.

`P1_CODEX_IMPLEMENTATION_PACKET.md` contains:

- role/authority;
- required stack;
- target directories;
- root commands;
- API/worker/DB/contracts/observability/config shells;
- CI/local Docker requirements;
- explicit non-goals;
- required tests;
- evidence/reporting contract.

Codex can begin P1 without making product/security architecture decisions.

## 15. P0 exit verdict

**P0 architecture gate: PASS.**

Next executable roadmap item:

**P1 — Repository and engineering foundation.**

The first action in P1 should be implementation from `P1_CODEX_IMPLEMENTATION_PACKET.md`, followed by verification against `TEST_STRATEGY.md`. P2 auth/device work must not begin until the P1 foundation acceptance gate passes.