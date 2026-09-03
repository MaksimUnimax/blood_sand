# Product Control Plane — Development Rules

Status: mandatory engineering rules  
Date: 2026-09-03

## 1. Roles

### Architecture authority

The architecture/specification in `server/docs/` is authoritative for product/server work. Architectural changes require an explicit documentation/ADR change before or together with implementation.

### Codex role

Codex is the implementation engineer for bounded tasks. Codex:

- writes code;
- writes tests;
- updates implementation documentation/evidence required by the assigned roadmap item;
- reports blockers and observed contradictions.

Codex MUST NOT independently redefine product architecture, security boundaries, storage policy, billing semantics, browser abstraction, Bridge lifecycle ownership or public contracts unless the task explicitly authorizes that architectural change.

If an implementation task reveals an architectural contradiction, Codex stops that architectural deviation and reports it. The architecture is then amended deliberately.

## 2. Two-level work rule

Every work packet has two coordinates:

1. Level 1 product roadmap item, e.g. `P3 — Bootstrap`;
2. Level 2 implementation step, e.g. `P3.2 — signed bootstrap schema`.

A coding task without both coordinates is incomplete.

Every completion report MUST state:

- roadmap coordinates;
- files changed;
- behavior implemented;
- tests run;
- evidence/results;
- known limitations;
- next roadmap step.

## 3. Roadmap correlation rule

No implementation may be accepted unless it correlates to `server/docs/ROADMAP.md`.

If code introduces an architectural/product capability not represented in the roadmap, one of two things must happen:

- add/approve the roadmap item first; or
- remove the unplanned capability.

The roadmap is not a historical note; it is the execution control plane for development.

## 4. Parallel Bridge rule

Until roadmap P11:

- server code MUST NOT import modules from `tooling/llm-api-bridges/ozon-seller/`;
- server tests MUST NOT depend on today's unpacked Bridge source;
- server work uses versioned fixtures/contracts;
- Bridge knowledge needed for integration is copied as a pinned reference snapshot under `server/reference/bridge/`;
- changes in the active Bridge do not require continuous server rewrites unless the explicit integration contract changes.

At P11, integrate the then-current accepted Bridge version deliberately and run a delta audit.

## 5. Architecture dependency rules

The modular monolith must maintain directed dependencies.

Preferred dependency direction:

```text
apps/*
  -> domain/application packages
      -> contracts/shared primitives
      -> db repository interfaces/implementations
```

Forbidden examples:

- billing domain importing admin UI;
- account domain importing Fastify route modules;
- entitlement engine depending directly on a payment SDK;
- health domain depending on a concrete Telegram SDK;
- remote-config domain importing Bridge runtime code;
- browser compatibility logic duplicated inside billing/account modules.

External providers are behind explicit interfaces/adapters.

## 6. Contract-first rule

Before implementing a new external boundary, define:

- input schema;
- output schema;
- stable error codes;
- idempotency semantics;
- versioning semantics;
- authorization policy;
- logging/privacy policy.

Applies to:

- extension API;
- portal/admin API;
- payment webhooks;
- email provider adapter;
- health evidence;
- notifications;
- object storage metadata.

## 7. Database rules

1. All schema changes use committed migrations.
2. Production schema is never changed manually.
3. Published commercial history is append/revision oriented.
4. Financial/billing events are immutable except explicit compensating records.
5. Destructive migrations require a backup/rollback plan.
6. Migrations must be tested from an empty database and from the immediately previous supported schema state.
7. Foreign keys/unique constraints are preferred for invariants that can be enforced by the database.
8. Soft archive/status is preferred over deleting referenced plans/prices/accounts.

## 8. Security rules

Mandatory:

- no secrets in Git;
- no Ozon credentials in server schemas/logs/tests;
- no raw seller payload in control-plane telemetry;
- access/refresh/session rules from `SECURITY.md`;
- remote config is declarative only;
- server cannot expand packaged extension capability;
- admin mutations require RBAC and audit;
- webhook side effects require verification + idempotency;
- diagnostic schemas are allowlists, not arbitrary JSON bags.

Security shortcuts require an explicit architecture/security change and are not accepted as temporary implementation convenience.

## 9. Versioning rules

Immutable published revisions for:

- price revisions;
- plan revisions;
- adapter profile revisions;
- config releases.

Client/server protocol changes follow compatibility rules in `INTEGRATION_CONTRACT.md`.

Never silently mutate a published revision because it is easier than migration/rollback.

## 10. Browser modularity rules

Chrome-first means implementation priority only.

Code must not equate:

`browser == Chrome` with `product client`.

Browser-specific behavior belongs in browser capability/driver layers. Shared account/auth/billing/entitlement/config behavior must remain browser-independent.

When Yandex Browser is added, the expected work is a driver/capability/test matrix addition, not a product fork.

## 11. AI adapter rules

AI family, surface, variant and profile revision are distinct.

Do not write global ChatGPT selectors into generic product modules.

Remote adapter profiles:

- are schema validated;
- are immutable after publish;
- may contain only packaged declarative strategy types;
- have explicit compatibility constraints;
- can be staged and rolled back;
- are health-tested before broad rollout.

## 12. Health rules

Health truth comes from deterministic checks.

Codex may inspect evidence and implement repairs. It must not decide that a failing deterministic assertion is "probably fine" and bypass it.

Every production-supported AI surface needs:

- named critical contours;
- severity mapping;
- controlled account/session ownership;
- scheduled checks;
- evidence policy;
- alert policy;
- rollback path.

Whole-page DOM/hash diff alone is not an accepted health definition.

## 13. Test rules

Minimum test layers:

- unit tests for domain invariants;
- integration tests with real PostgreSQL for repositories/transactions;
- API contract tests;
- webhook idempotency tests;
- auth/session rotation tests;
- portal/admin critical E2E tests;
- health deterministic fixture tests;
- controlled-browser health smoke tests;
- Bridge/client integration tests at P11.

A fix for a discovered bug MUST add a regression test at the lowest practical layer.

## 14. No hidden behavior rule

Important state transitions must be explicit and observable.

Forbidden examples:

- silently moving subscriptions between price revisions;
- silently resetting device/session state;
- silently changing active adapter profile without a revision/rollout record;
- silently truncating diagnostic evidence and still marking it complete;
- hidden automatic capability escalation;
- hidden provider retries that affect commercial state.

## 15. Idempotency rule

Externally retried events/actions must have explicit idempotency semantics.

Required for:

- payment webhooks;
- checkout create requests where appropriate;
- device activation exchange;
- critical admin commands that can be retried by UI/network;
- durable jobs;
- health run scheduling where duplicate run identity matters.

## 16. Logging and evidence rules

Every request/job/run has a correlation ID.

Logs/evidence contain stable identifiers and error codes, not secrets/business payloads.

A test/acceptance report must distinguish:

- command executed;
- expected result;
- actual result;
- pass/fail;
- artifact/evidence identifiers.

## 17. Branch and change discipline

Server feature work occurs on server/product branches and is merged deliberately.

Do not mix unrelated Bridge fixes into server commits.

A work packet should change the smallest coherent set of modules needed for its roadmap step.

Large refactors are not accepted as side effects of a small feature task.

## 18. Definition of Done

A roadmap implementation item is DONE only when all applicable items pass:

- implementation complete;
- typecheck/lint/tests pass;
- migration tests pass if DB changed;
- threat/privacy implications checked;
- no forbidden dependency introduced;
- public schemas/docs updated;
- regression test added for fixed defect;
- acceptance evidence recorded;
- roadmap status updated;
- next step identified.

## 19. Codex task template

Every Codex implementation prompt should contain:

```text
ROLE
You are the implementation engineer. Do not redesign approved architecture.

ROADMAP
P?.? — exact step

AUTHORITY
List exact docs/contracts to follow.

GOAL
One bounded result.

ALLOWED CHANGES
Exact directories/files/modules.

REQUIRED BEHAVIOR
Explicit requirements/invariants.

FORBIDDEN / NON-GOALS
Explicit boundaries.

TESTS
Exact commands/scenarios expected.

EVIDENCE
What must be reported/committed.

ROADMAP UPDATE
How status/progress must be recorded.
```

This template is mandatory unless the task is truly trivial and cannot affect behavior/architecture.