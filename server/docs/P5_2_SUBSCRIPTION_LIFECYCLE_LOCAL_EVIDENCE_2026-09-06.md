# P5.2 Subscription Lifecycle — Local Evidence

Technical ID: `PRODUCT-CONTROL-PLANE-P5.2-SUBSCRIPTION-FSM-MANUAL-COMMANDS-BINDING-LOCAL`  
Attempt: `1`  
Status: `LOCAL ACCEPTED — P5.2 ACTIVE`

## Base and safety

- Branch: `feature/product-control-plane-server-2026-09-04`
- Required/local HEAD: `ec11ed49b1c02cfe8ed87bc5e183cf9c15037fde`
- Remote start probes: `ec11ed49b1c02cfe8ed87bc5e183cf9c15037fde`, twice four seconds apart.
- Remote final probes: `ec11ed49b1c02cfe8ed87bc5e183cf9c15037fde`, twice four seconds apart.
- Disk start/final: `82%`, `11G` free; `82%`, `11G` free.
- No migration or schema file changed; `0000..0009` only.
- 0009 SHA-256: `d073221a237bdc867672b5e1e8223a0f62eacbb4670c1c19cfc346b64406e4ec`
- Disposable resource: one PostgreSQL 18 container, removed after acceptance.

## Domain and persistence

`@product/subscriptions` depends only on `@product/plans` and `zod`. It reuses
`PlanMutationContextSchema` through the P5 alias and exposes strict grant,
extend, suspend, and restore schemas, the exact seven-state FSM, safe
snapshots, current-reader/access ports, deterministic eligibility, and the
structural P4.4-compatible binding adapter. SQL remains in
`@product/db` (`p5-subscription-repository.ts`).

FSM creation is `NULL -> TRIAL|ACTIVE`; existing edges are the accepted graph
in ADR-0021, with `EXPIRED` terminal and no generic same-state transitions.
Manual grant is `ACTIVE`, exact published plan revision, null bound price, and
one initial `NULL -> ACTIVE` transition. An account may be suspended while a
grant is stored; access is denied by account policy without subscription
mutation.

`state_revision` counts every successful mutation, including extension;
`transition_revision` counts state changes only. Extension audits but creates
no fake same-state transition. Server transition revision allocation occurs
under the subscription lock. Mutations use stale-before-no-op/semantic checks,
account lock then subscription lock, and `FOR UPDATE` reload. Concurrent same-
revision calls have one winner and one `SUBSCRIPTION_STATE_STALE` result.

Suspension records the prior state, timestamp, reason, state revision, and
transition. Restore derives its target only from the latest actual suspension
transition, never caller input, and checks the exact half-open period/grace
deadlines. `PAST_DUE` may restore but remains ineligible. All mutation +
transition + audit writes are atomic; injected audit failures roll back the
whole command.

Eligibility is fail-closed: suspended account, no current subscription,
period/grace endpoints, PAST_DUE, canceled-without-remaining-access,
subscription suspension/expiry, and corruption have stable machine reasons.
The coherent access observation is one SQL statement. The safe current reader
excludes expired history and omits freeform reasons. The exact binding source
is `ELIGIBLE_SUBSCRIPTION`; ineligible access returns null. The binding is not
production-wired, bootstrap is unchanged, and production device limit remains
1.

## Acceptance inventory

The dedicated real-PostgreSQL suite contains 90 distinct P5.2 cases, all
passing. The domain suite contains 39 unit cases, all passing. Final unit
total is 294 (baseline 255 plus 39); final real-PostgreSQL integration total
is 518 (baseline 428 plus 90). P5.1 is 94/94; P4.6 is 38/38; P4.5 is 52/52;
P4.4 is 48/48; P4.3 is 52/52; P4.2 is 21/21; P4.1 is 30/30; crypto is
12/12; and E2E is 24/24. All have zero failures and zero skips/todos where
applicable.

DB-down install/lint/format/typecheck/unit/OpenAPI/bridge/build passed. DB-up
lint/format/typecheck/unit/integration/migrate/OpenAPI/bridge/build passed.
The fresh PostgreSQL migration ran twice successfully. No `0010` exists.

OpenAPI remains frozen at 16 route/method tuples with SHA
`038fe97ae7bf1d44563f768dbe6335c087e3430f255986325fad65de422b308f`; P5.2
adds no HTTP routes. Real provider, fake provider, checkout, webhook,
reconciliation, payment mutation service, admin/portal subscription HTTP,
bootstrap wiring, commercial device-limit production wiring, Bridge changes,
and P5.3 are absent. YooKassa and Tinkoff/T-Bank remain future candidates
only; real payment go-live remains deferred.

Roadmap state is P0–P4 DONE, P5 ACTIVE, P5.1 DONE, P5.2 ACTIVE, P5.3–P5.7
PLANNED, P6–P15 PLANNED. P5.2 is not marked DONE.
