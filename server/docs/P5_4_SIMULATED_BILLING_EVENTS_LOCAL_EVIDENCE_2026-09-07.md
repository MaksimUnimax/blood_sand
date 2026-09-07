# P5.4 simulated verified billing events — local evidence

Status: ACCEPTED — P5.4 DONE

Technical ID: `PRODUCT-CONTROL-PLANE-P5.4-SIMULATED-VERIFIED-BILLING-EVENTS-LOCAL-V2`
Attempt: `1`

## Base and runtime

- Base HEAD: `065b943a124323c318f080fb84debae63b38918b`
- Worktree started clean.
- Node: `v24.20.0`
- pnpm: `10.34.5`
- Host Node 12 was not used.
- Local remote probes were unreadable via SSH during the earlier local acceptance; ChatGPT independently verified the unchanged base via GitHub API twice before remote acceptance. This acceptance read the canonical branch over the repository-scoped SSH443 path.
- Disk remained below 85% used with at least 8 GiB free.

## Schema and verification

- Migrations remain exactly `0000..0010`; `0011` is absent.
- `0009` SHA-256: `d073221a237bdc867672b5e1e8223a0f62eacbb4670c1c19cfc346b64406e4ec`
- `0010` SHA-256: `28ec7583b9ad7497246580ce19a22ba82d72cc6ab223c6f9503f4b88ad1eef18`
- Added provider-neutral `BillingEventVerificationPort`.
- Supported types are exactly `payment.succeeded`, `payment.failed`, and `payment.canceled`.
- The simulator uses deterministic domain-separated SHA-256 payload hashing and a separate non-secret proof domain. It makes no production authenticity claim.
- Verification happens before any billing ledger, payment, subscription, transition, or audit mutation.
- Provider/event identity dedupe is conflict-safe; same-content replay is stable and content conflict fails closed.

## Payment and activation

- PENDING payments transition only to SUCCEEDED, FAILED, or CANCELED.
- Immutable amount/currency terms and event time bounds are enforced.
- Valid success creates exactly one ACTIVE subscription with exact checkout plan and bound price revisions.
- Period arithmetic is provider-neutral UTC calendar DAY/MONTH/YEAR arithmetic with month-end and leap-year clamping.
- The transition is revision 1, source WEBHOOK, source event identity, SYSTEM actor.
- Payment, billing-event, subscription, transition, link, and audit writes are atomic.
- Payment truth remains SUCCEEDED when checkout activation is missing/corrupt or a current-subscription conflict occurs.
- Suspended accounts can receive the paid ACTIVE subscription while access resolution continues to deny access for ACCOUNT_SUSPENDED.
- Semantic success duplicates are IGNORED when the existing link is coherent; state conflicts and incoherent links fail with stable codes.
- Manual-grant and checkout races use the shared account lock; no second current subscription is created.

## Checkout policy

- PENDING: same key replays the READY checkout; different key is CHECKOUT_IN_PROGRESS.
- FAILED: same key is PAYMENT_FAILED; different key may create a fresh checkout.
- CANCELED: same key is PAYMENT_CANCELED; different key may create a fresh checkout.
- SUCCEEDED with a current subscription: CURRENT_SUBSCRIPTION_EXISTS.
- SUCCEEDED without a current subscription: CHECKOUT_CORRUPTED.
- REFUNDED and CHARGEBACK: CHECKOUT_CORRUPTED; no refund/chargeback policy was implemented.

## Verification gates

- Unit: `445` total, `89` new P5.4, `0` failed, `0` skipped/todo.
- Real PostgreSQL integration: `736` total, `116` P5.4, `0` failed, `0` skipped/todo.
- Retained integration counts: P5.3 `102`, P5.2 `90`, P5.1 `94`, P4.6 `38`, P4.5 `52`, P4.4 `48`, P4.3 `52`, P4.2 `21`, P4.1 `30`.
- Crypto: `12/12`.
- E2E: `24/24`, no retries or skips.
- DB-down lint, format, typecheck, unit test, OpenAPI, Bridge guard, and build: PASS.
- DB-up lint, format, typecheck, unit test, integration, migrations, OpenAPI, Bridge guard, and build: PASS.
- Migrations run twice: PASS / PASS.
- OpenAPI routes: `16`; SHA run 1 and run 2: `038fe97ae7bf1d44563f768dbe6335c087e3430f255986325fad65de422b308f`.

## Boundaries and roadmap

- No real provider, provider SDK, credentials, external payment call, real money, webhook HTTP route, reconciliation, durable billing job, refund/chargeback policy, bootstrap change, commercial device-limit wiring, Portal billing surface, admin billing HTTP, or Bridge change.
- P5.5 was not started.
- Roadmap is P5 ACTIVE, P5.1/P5.2/P5.3/P5.4 DONE, P5.5 NEXT, P5.6/P5.7 PLANNED, P6-P15 PLANNED.
- Payment go-live remains deferred.

## Remote acceptance

- Implementation SHA: `a064508c3ed639e0e4d6d256da342d0612506a14`
- Implementation parent: `065b943a124323c318f080fb84debae63b38918b`
- Implementation CI: Server CI run `34082333706`; https://github.com/MaksimUnimax/blood_sand/actions/runs/34082333706; SUCCESS.
- `REMOTE_P5_4_REVIEW=PASS`
- Unit: `445`; new P5.4 unit: `89`.
- Integration: `736`; P5.4 `116`; P5.3 `102`; P5.2 `90`; P5.1 `94`; P4.6 `38`; P4.5 `52`; P4.4 `48`; P4.3 `52`; P4.2 `21`; P4.1 `30`.
- Crypto: `12/12`; E2E: `24/24`.
- OpenAPI: `16`; exact SHA `038fe97ae7bf1d44563f768dbe6335c087e3430f255986325fad65de422b308f`.
- Migrations: `0000..0010`; 0009 `d073221a237bdc867672b5e1e8223a0f62eacbb4670c1c19cfc346b64406e4ec`; 0010 `28ec7583b9ad7497246580ce19a22ba82d72cc6ab223c6f9503f4b88ad1eef18`; 0011 absent.
- Real provider: NO. External payment calls: NONE. P5.5: not executed.
- Payment go-live: DEFERRED. P5 remains simulator-only; YooKassa and Tinkoff/T-Bank are future candidates only.
