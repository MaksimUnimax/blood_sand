# P5.1 Subscription / Billing Persistence — Local Evidence

Technical ID: `PRODUCT-CONTROL-PLANE-P5.1-SUBSCRIPTION-BILLING-PERSISTENCE-FOUNDATION-LOCAL-V2`  
Attempt: `1`  
Status: LOCAL ACCEPTED — P5.1 ACTIVE

## Base, remote, and safety

- Repository: `MaksimUnimax/blood_sand`
- Branch: `feature/product-control-plane-server-2026-09-04`
- Required/local base HEAD: `1029627a4996070252be86dafef08c8d19039a13`
- Initial non-ignored worktree: clean.
- Canonical remote start probes, four seconds apart: `1029627a4996070252be86dafef08c8d19039a13`, `1029627a4996070252be86dafef08c8d19039a13`.
- Disk start: `82%`, `11G` free.
- Only one disposable PostgreSQL 18 container was created for this run. Existing host containers/services were not changed.

## Binding payment decision and P5 decomposition

All P5 payment behavior is simulator-only through a future provider-neutral
`BillingProviderPort` and deterministic `StubBillingProvider`/
`FakeBillingProvider`. YooKassa and Tinkoff/T-Bank are candidates only. No
production provider was selected; no provider SDK, credential, API call,
webhook secret, real checkout session, or real-money processing was used.
Real payment go-live is deferred until after the remaining product roadmap and
a separate final payment go-live architecture/acceptance gate.

The frozen P5 decomposition is:

- P5.1 ACTIVE: persistence foundation and local acceptance.
- P5.2 PLANNED: subscription FSM, internal manual commands, exact bindings, eligibility/read contracts, audit.
- P5.3 PLANNED: provider-neutral port, deterministic fake provider, simulated checkout and checkout idempotency.
- P5.4 PLANNED: simulated verified billing-event application; no real HTTP webhook.
- P5.5 PLANNED: simulated reconciliation and durable period/grace/expiry/cancel jobs.
- P5.6 PLANNED: subscription/bootstrap/device-limit/portal integration and non-real-money UX.
- P5.7 PLANNED: simulated-billing security, architecture, regression and final acceptance.

P5.2 and later were not started.

## Migration and exact table scope

Migration: `server/packages/db/drizzle/0009_p5_1_subscription_billing_foundation.sql`  
0009 SHA-256: `d073221a237bdc867672b5e1e8223a0f62eacbb4670c1c19cfc346b64406e4ec`

Historical migrations `0000..0008` are byte-identical. Their verified hashes
remain:

```text
0000 9a7cde34d8b38667ccedd630cd2dc40697b2ee5c922927bb08f93f242bc5af56
0001 0544b377425ee3a6ebc9dc21ebb402febe27852c7bf93666f4154fbc0f723b2f
0002 f6f302d14574a7f9dff3675b8b330fbbf90a4d69387041b9fdf8fbe0454ce449
0003 ffe1c20c37c92f1529251ff21921c5a3a1a946a09c661b162e8458c37c08c9b6
0004 38774ebb870f9d233ddc51d2b8d24dd361ae2274920d0f7b0286eae333273e1d
0005 6b95b4dae57e356804a83d1d34ff03286fb5465ff3d214a4b40ae70150283d21
0006 37aa137364c9327108ea0db8ca25cba7cbc99c0d1649b959499a4fa87824dd1f
0007 1c8c32d6f9ea073788507736f06daaa67dee2f74465d2b990eb7fbcc67d0abe6
0008 d661f98db6b18a2181fe2094f0715b11eb56eec7e96270d9634f4cd2fc8dc9f1
```

The migration ran successfully on first and second execution. PostgreSQL
catalog inspection confirmed exactly four P5.1 tables:

1. `subscriptions`
2. `subscription_transitions`
3. `payments`
4. `billing_events`

No checkout, billing-customer, provider-mapping, reconciliation, job,
provider-specific, or admin-billing table exists. FKs, `RESTRICT` delete
actions, checks, enums, trigger attachments, ordinary uniques, and the partial
one-current-subscription index were inspected in PostgreSQL.

## Physical behavior accepted

Subscriptions use exactly seven states:
`TRIAL`, `ACTIVE`, `GRACE`, `PAST_DUE`, `CANCELED`, `EXPIRED`, `SUSPENDED`.
Positive `state_revision`, period ordering, start/grace/cancel/suspend times,
non-empty reason, and timestamp monotonicity are physical checks. There is at
most one non-`EXPIRED` row per account, while multiple historical `EXPIRED`
rows are allowed. Subscription identity is immutable and deletion is rejected.

Every current plan reference is an exact published plan revision; stable-plan
status may later be HIDDEN or ARCHIVED. A bound price is nullable and, when
present, must be a published revision. The plan revision and bound price must
share the same stable plan identity, while different exact plan revisions are
allowed. A previously published, unselected historical price may remain bound
for grandfathered access.

Subscription transitions use the exact normalized source set
`CHECKOUT`, `WEBHOOK`, `RECONCILIATION`, `JOB`, `ADMIN`, `SYSTEM`; revision
uniqueness, revision-one `from_state IS NULL`, later non-null origin, changed
states, and non-empty reasons are physical constraints. Transition rows are
append-only and cannot be deleted.

Payments use exactly `PENDING`, `SUCCEEDED`, `FAILED`, `CANCELED`, `REFUNDED`,
`CHARGEBACK`. Money is integer minor units in
`0..9007199254740991`; currency is three uppercase ASCII letters. Generic
provider keys and lowercase SHA-256 hashes are validated. Published immutable
price terms must equal payment amount/currency. Provider payment identity is
unique, and server idempotency is uniquely scoped by account rather than
provider. The immutable commercial identity is protected; the optional
payment-to-subscription link is same-account and set-once. Canonical payments
cannot be deleted.

Billing events use only `WEBHOOK` and `RECONCILIATION`, with processing states
`VERIFIED`, `APPLIED`, `IGNORED`, `FAILED`. `(provider,event_identity)` is
unique across sources. Insertion is VERIFIED-only with no result references,
failure code, or processed time. A VERIFIED row may terminalize once to a
terminal state, with `processed_at`; FAILED requires a failure code. Terminal
rows are immutable and cannot be deleted. Result references enforce matching
subscription transition ownership and same-account payment/subscription
identity. No raw provider payload/body/headers/general JSON column exists;
only the payload SHA-256 is stored.

## Tests and regression gates

- Dedicated P5.1 real-Postgres suite: `94/94`, 0 fail, 0 skip/todo.
- Overall real-Postgres integration: `428/428`, 0 fail, 0 skip/todo.
- Accepted P4 regressions retained: P4.6 `38`, P4.5 `52`, P4.4 `48`, P4.3 `52`, P4.2 `21`, P4.1 `30`.
- Unit: `255/255`, 0 fail, 0 skip/todo. Baseline was `253`; two schema-vocabulary tests were added.
- Crypto: `12/12`.
- E2E: `24/24`, 0 fail, 0 skip, 0 retry.
- DB-down install/lint/format/typecheck/unit/OpenAPI/Bridge/build: PASS.
- DB-up lint/format/typecheck/unit/integration/migrations/OpenAPI/Bridge/build: PASS.
- OpenAPI checked twice: 16 route/method tuples; accepted SHA on both runs `038fe97ae7bf1d44563f768dbe6335c087e3430f255986325fad65de422b308f`.
- No checkout, subscription, payment, webhook, or admin-billing route was added.

## Unchanged boundaries and roadmap

Bootstrap remains `{ subscription: { state: "NONE", planRevision: null }, entitlements: {} }`.
Production device resolution remains `PreEntitlementDeviceLimitResolver` with
limit `1`; no concrete account-plan binding is wired. Bridge source and
behavior are unchanged. No persistence or transport was added for Ozon
credentials, seller payloads, customer contact data, AI conversations,
payment instruments/credentials, provider secrets, webhook secrets, or raw
provider bodies/headers.

Roadmap is P0 DONE, P1 DONE, P2 DONE, P3 DONE, P4 DONE, P5 ACTIVE, P5.1
ACTIVE, P5.2–P5.7 PLANNED, and P6–P15 PLANNED. P5.1 is intentionally not
marked DONE locally. Real payment go-live is explicitly deferred until after
the remaining product roadmap.
