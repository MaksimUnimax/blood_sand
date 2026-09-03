# Product Control Plane — Test and Acceptance Strategy

Status: normative test strategy  
Date: 2026-09-03

## 1. Rule

A roadmap item is not DONE because implementation compiles. Every behavior needs the lowest practical deterministic test plus the integration/acceptance evidence required by its risk.

## 2. Test layers

### T0 — Static checks

- TypeScript strict typecheck;
- ESLint;
- formatting check;
- dependency boundary checks;
- generated OpenAPI/schema drift;
- migration lint/validation where tooling supports it.

### T1 — Unit/domain tests

Pure business invariants:

- entitlement resolution;
- subscription transition validity;
- rollout cohort assignment;
- health classification;
- profile schema constraints;
- compatibility resolution;
- error-code mapping.

No database/network required.

### T2 — PostgreSQL integration tests

Use real disposable PostgreSQL, not a fake DB, for:

- migrations;
- unique/idempotency constraints;
- refresh-token rotation transaction;
- device activation single-use exchange;
- billing webhook event dedupe;
- subscription/payment transaction;
- immutable revision constraints;
- audit persistence;
- durable job behavior where practical.

### T3 — API contract tests

Verify:

- request/response schema;
- auth requirements;
- error codes;
- idempotency;
- version compatibility;
- redaction/forbidden fields;
- bootstrap signing envelope.

### T4 — Web E2E

Playwright portal/admin flows:

- OTP login;
- device activation;
- revoke device;
- plan/checkout UI;
- admin subscription grant;
- admin plan/price/profile workflows;
- RBAC denial.

### T5 — Health deterministic fixtures

Stored sanitized UI fixtures test:

- primary/fallback selectors/strategies;
- drift classification;
- broken contour classification;
- browser-specific variants;
- profile candidate regression.

### T6 — Live controlled AI health

Dedicated health accounts only.

- structural smoke;
- behavioral send/response/completion smoke;
- bridge-specific command/code surface fixture;
- evidence sanitization;
- incident creation.

### T7 — Bridge/client integration

Begins at P11 against the then-current accepted Bridge candidate.

Covers:

- device auth/bootstrap;
- signed config/profile;
- entitlement deny/allow;
- auto AI resolution;
- restart/offline grace;
- provider state isolation from AI/auth/config rebind;
- existing Bridge regressions.

## 3. Bug regression rule

Every production/test-discovered defect adds a regression test at the lowest reliable layer that reproduces the failure class.

Examples:

- duplicate webhook -> T2/T3;
- selector primary failure -> T5 + T6;
- Bridge provider state reset after bootstrap -> T7.

## 4. CI stages

P1 minimum:

1. install frozen lockfile;
2. static checks;
3. unit tests;
4. PostgreSQL integration tests;
5. build all workspace packages/apps;
6. migration validation;
7. generated contract drift check.

Later add portal/admin E2E and container/security checks.

Live AI health is operational monitoring and must not make ordinary code CI dependent on third-party website availability. Candidate-profile/release workflows can invoke live health explicitly.

## 5. Test data

- deterministic factories;
- no production customer data in CI;
- no real Ozon API keys;
- billing provider sandbox fixtures;
- health accounts isolated from users;
- secrets from environment/secret store only.

## 6. Acceptance evidence format

Each implementation completion report records:

```text
ROADMAP ITEM
EXPECTED
ACTUAL
COMMANDS RUN
TEST RESULTS
MIGRATIONS
ARTIFACTS/EVIDENCE
KNOWN LIMITATIONS
NEXT STEP
```

For critical flows include exact test names and output summary.

## 7. P1 acceptance suite

Must prove:

- workspace installs/builds from clean checkout;
- API health endpoint works;
- worker shell starts;
- PostgreSQL can migrate from empty;
- one integration test exercises real DB;
- environment validation rejects missing/invalid required settings;
- correlation ID/logging works;
- no Bridge runtime import exists.

## 8. P2 acceptance suite

Must prove:

- OTP expiry/single-use/attempt limit;
- activation approve/deny/expire;
- device limit;
- access token auth;
- refresh rotation;
- refresh replay/reuse response;
- device revoke;
- audit events.

## 9. P3 acceptance suite

Must prove:

- bootstrap contract compatibility;
- Ed25519 sign/verify;
- tamper rejection;
- config expiry/offline grace;
- unsupported client/version state;
- server cannot represent unsupported capability expansion in accepted client profile schema.

## 10. P4/P5 commercial acceptance

Must prove:

- immutable price/plan revisions;
- grandfathering;
- entitlement explanation;
- duplicate/forged/out-of-order webhook behavior;
- reconciliation;
- manual admin grant audit;
- expiry/grace state machine.

## 11. P8 Health acceptance

Must prove with controlled injected changes:

- primary strategy fail + fallback pass -> DRIFT;
- required core contour fail -> BROKEN;
- account login expiry -> UNKNOWN, not false BROKEN;
- candidate profile repairs target without regressing previous contours;
- evidence is sanitized/retained per policy;
- Chrome result scope independent from future Yandex result scope.

## 12. Production launch tests

Before P14 completion:

- backup restore drill;
- secret separation audit;
- payment webhook/reconciliation live sandbox or approved production small-value test;
- admin RBAC/MFA acceptance;
- config key rotation drill design/test;
- profile rollback drill;
- health incident notification drill;
- staging -> production release rollback drill;
- current Chrome Bridge full product journey.
