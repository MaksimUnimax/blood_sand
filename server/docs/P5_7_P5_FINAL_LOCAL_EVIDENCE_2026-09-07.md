# P5.7 final local acceptance — 2026-09-07

Status: ACCEPTED — P5.7 DONE / P5 FINAL ACCEPTED

`P5_FINAL_LOCAL_ACCEPTANCE=PASS`
`P5_FINAL_REMOTE_ACCEPTANCE=PASS`

`P5_7_AUDIT_SHA=f962e4a058f4081bd5436d1daf4118783a14429e`

Audit Server CI: run `34113097215` —
https://github.com/MaksimUnimax/blood_sand/actions/runs/34113097215

`REMOTE_P5_FINAL_REVIEW=PASS`
`CRITICAL=0 HIGH=0 MATERIAL_MEDIUM=0`

Remote acceptance markers: `REMOTE_P5_HISTORY_PASS`,
`REMOTE_P5_MIGRATION_IMMUTABILITY_PASS`, `REMOTE_P5_PERSISTENCE_REVIEW_PASS`,
`REMOTE_P5_COMMERCIAL_LOCK_GRAPH_PASS`,
`REMOTE_NO_PROVIDER_CALL_UNDER_DB_TRANSACTION_PASS`, `REMOTE_P5_2_PASS`,
`REMOTE_P5_3_PASS`, `REMOTE_P5_4_PASS`, `REMOTE_P5_5_PASS`, `REMOTE_P5_6_PASS`,
`REMOTE_P5_7_80_TEST_REVIEW_PASS`, `REMOTE_P5_DATA_MINIMIZATION_PASS`,
`REMOTE_REAL_PROVIDER_ABSENT_PASS`, `REMOTE_P5_AUDIT_PRIVACY_PASS`,
`REMOTE_P5_PORTAL_PRIVACY_PASS`, `REMOTE_OPENAPI_18_PASS`,
`REMOTE_FAKE_PAYMENT_HTTP_ABSENT_PASS`, `REMOTE_BRIDGE_BOUNDARY_PASS`,
`REMOTE_P6_NOT_STARTED_PASS`.

P5 FINAL ACCEPTED IN SIMULATED BILLING MODE.

Not accepted and explicitly deferred: real provider selection, real-provider
webhook authenticity, real checkout/acquiring, real money, payment-provider
credentials, and provider-specific reconciliation behavior. Real payment
go-live remains deferred.

## Scope and conclusion

P5 is locally accepted ONLY in simulated billing mode. The accepted contour
contains no real payment provider, provider SDK, merchant credential, real
webhook secret, external payment call, checkout URL/session, or real money.
YooKassa and Tinkoff/T-Bank remain future candidates. Production payment
processing, real-provider webhook authenticity, and acquiring are not accepted
by this evidence. Real payment go-live remains deferred until a separate
architecture and acceptance gate after the remaining roadmap.

## Accepted history and ancestry

The required linear history is present and every checkpoint is an ancestor of
`bcd7d467c8eb52055afb21ade99ed4267e39bfc9`:

| checkpoint | SHA |
| --- | --- |
| P4 final | `1029627a4996070252be86dafef08c8d19039a13` |
| P5.1 final | `ec11ed49b1c02cfe8ed87bc5e183cf9c15037fde` |
| P5.2 final | `2276a7d4df4ae14ca0859415e3ced049218811d5` |
| P5.3 final | `065b943a124323c318f080fb84debae63b38918b` |
| P5.4 final | `f46cd652f8581c28e1848f2ebad5fde477ada409` |
| P5.5 final | `adb963bf1157439093f0faddb3d237ccb5217c09` |
| P5.6/current final | `bcd7d467c8eb52055afb21ade99ed4267e39bfc9` |

`LINEAR_ACCEPTED_HISTORY=PASS`; no unrelated merge was found.

## P5.1–P5.6 scope matrix

| stage | locally re-audited result |
| --- | --- |
| P5.1 | persistence, immutable commercial terms, idempotency, event and reconciliation foundations PASS |
| P5.2 | subscription FSM, revision counters, eligibility, suspension/restore and lifecycle semantics PASS |
| P5.3 | provider-neutral simulator checkout, exact admission, retry and idempotency semantics PASS |
| P5.4 | verified simulator events, dedupe, payment truth and safe activation semantics PASS |
| P5.5 | durable reconciliation leases, outside-transaction status lookup, repair and lifecycle semantics PASS |
| P5.6 | production commercial access, bootstrap, device limits, portal reads and lifecycle wiring PASS |

## Migration immutability

Exactly `0000..0011` are present; `0012` is absent. The required SHA-256
hashes for all twelve migration files match the accepted P5.6 values. Fresh
PostgreSQL 18 migration run 1 and run 2 both PASS. P5.7 generated no schema
delta and did not change migrations.

## Persistence integrity

The final audit suite exercises current-subscription uniqueness, deletion
rejection, append-only transitions, state/transition revision divergence,
immutable payment terms and identity, account-scoped idempotency, set-once
payment links, billing-event identity and terminal immutability, absent raw
payloads, checkout CREATING guards and terminal immutability, and
reconciliation state/lease/token invariants. All PASS on real PostgreSQL.

## Commercial lock graph

`P5_COMMERCIAL_LOCK_GRAPH=PASS`. P5.2 subscription commands, P5.3 checkout,
P5.4 event application, P5.5 reconciliation, and P5.6 device activation use
the exact shared namespace `p5-subscription-account:<accountId>`. Account-row
serialization and P4 entitlement override serialization were checked; no
competing raw account namespace or known lock inversion was found.

## Provider and transaction boundary

`NO_PROVIDER_CALL_UNDER_DB_TRANSACTION=PASS`. P5.3 createCheckout and P5.5
fetchPaymentStatus are outside database transactions and account locks. The
simulator performs no network I/O. No accepted path waits on a provider port
while holding a PostgreSQL transaction.

## Idempotency and dedupe

Raw idempotency keys remain outside database, provider, and audit projections;
server hashes are account-scoped and provider-independent. A retry resumes
the admitted immutable offer, while a different key is blocked by the
accepted actionable-state policy. Provider/event identity dedupe is
provider-scoped, content conflicts fail closed, and duplicate success cannot
duplicate payment, subscription, or access.

## Reconciliation and lifecycle

Durable READY/LEASED/SETTLED/BLOCKED jobs, `FOR UPDATE SKIP LOCKED` claiming,
lease reclaim, stale-token protection, deterministic simulator status lookup,
FAILED/CANCELED repair, SUCCEEDED non-downgrade, exact due boundaries,
durable lifecycle timestamps, origin-aware suspension expiry, and no automatic
renewal/grace invention all PASS. Delayed workers do not extend access.

## Bootstrap, device, and portal production integration

Production API wiring uses commercial access and the exact P5 subscription to
P4 entitlement projection. Eligible bootstrap binds the exact plan and caps
offline grace at `accessUntil`; ineligible bootstrap returns `{}`. Device
activation uses the shared P5 account lock and exact `device.max_active`, with
concurrent limit enforcement and no `maxActive=1` fallback. Production
worker wiring includes SubscriptionLifecycleRunner and excludes simulator
reconciliation. Portal subscription/payment reads are owner-scoped and
privacy-safe; billing UX is read-only and has no fake purchase action.

## Security and data minimization

`P5_SERVER_DATA_MINIMIZATION=PASS`: executable server scope accepts no Ozon
Client ID/API key, raw seller orders/sales/finance/customer payloads, or full
AI conversation payloads. `P5_REAL_PROVIDER_ABSENT=PASS`: no real provider
SDK, credential, webhook secret, payment endpoint, card/bank handling, or
external payment call is present. Ordinary persisted audit metadata and
portal/API projections omit raw idempotency keys, provider IDs, checkout
references, event identities, provider payload/status, credentials, and
prohibited free-form reasons. Non-owner portal access is forbidden.

The Bridge path `tooling/llm-api-bridges/ozon-seller/` is unchanged from the
P4 final checkpoint, and `pnpm bridge:guard` PASSed. No Ozon credential or
seller data-plane state entered control-plane executable scope.

## API and production-composition boundary

OpenAPI contains exactly 18 route/method tuples and retains SHA-256
`117746551488dacf3f95090764a7a9df072b3468d6a4ffa6f68a44adf0ffe924` on both
checks. The only commercial routes are GET `/v1/plans/public`, GET
`/v1/subscription`, and GET `/v1/billing/payments`. Checkout HTTP, simulator
billing HTTP, payment-completion HTTP, real webhook HTTP, and
refund/chargeback HTTP are absent; the portal proxy has no hidden mutation
path. API production main has no billing simulator or pre-entitlement device
resolver. Worker production main has no simulator reconciliation. No
mandatory Redis, Kafka, RabbitMQ, or Temporal dependency was added.

## Requirements traceability

| requirement | P5.7 local result |
| --- | --- |
| FR-SUB-001 | exact subscription state set implemented and audited PASS |
| FR-SUB-002 | validated and recorded transitions PASS |
| FR-SUB-003 | internal grant/extend/suspend/restore commands PASS |
| FR-SUB-004 | portal current plan, period, and device allowance PASS |
| FR-BILL-001 | provider abstraction and deterministic simulator PASS |
| FR-BILL-002 | exact account admission and immutable price revision PASS |
| FR-BILL-003 | browser/return result is not authoritative PASS |
| FR-BILL-004 | verified, idempotent, durable event semantics in simulator contour PASS; provider-specific production authenticity remains DEFERRED to real payment go-live |
| FR-BILL-005 | duplicate events cannot duplicate payment, subscription, or access PASS |
| FR-BILL-006 | durable reconciliation implemented and tested PASS |

This evidence does not claim real-provider webhook security acceptance.

## Production-security gates

P5-scope security and privacy controls are satisfied for the simulator-only
contour. The following remain explicitly deferred to later gates: admin
MFA/RBAC final production acceptance (P6/P14), backup restore drill
(production stage), diagnostic forbidden-data end-to-end proof (P9), Bridge
Ozon credential/raw seller integration proof (P11/P12), and real-provider
webhook authenticity (real payment go-live).

## Test counts and gates

- Unit: 635 total, 0 fail, 0 skip/todo; crypto 12/12.
- Integration: 1,088/1,088, 0 fail, 0 skip/todo.
- P5.7: 80/80 distinct meaningful cases; 65 exercise real PostgreSQL.
- Retained P5 counts: P5.6 152, P5.5 120, P5.4 116, P5.3 102, P5.2 90,
  P5.1 94.
- Retained P4 counts: P4.6 38, P4.5 52, P4.4 48, P4.3 52, P4.2 21,
  P4.1 30.
- DB-down and DB-up lint, format, typecheck, unit, OpenAPI, Bridge, build,
  and migration gates PASS.
- E2E: 32/32, 0 fail, 0 skip, 0 retry.

## Candidate boundaries and local state

Only the P5.7 acceptance test, this evidence, and the ROADMAP state update
are candidate changes. Product source, migration files, package manifests,
lockfile, API contracts/OpenAPI, portal product code, worker product code,
and Bridge are unchanged. No P6 work started. No ADR-0026 was created.

ROADMAP records P0–P4 DONE, P5 DONE / FINAL ACCEPTED, P5.1–P5.7 DONE,
P6 NEXT, and P7–P15 PLANNED. Real payment go-live remains deferred until
after the remaining product roadmap.

The audit candidate was accepted remotely before this documentation-only
finalization. No product source, test, migration, API, or Bridge change is
included in the finalization.
