# P5.5 Reconciliation/Lifecycle Local Evidence — 2026-09-07

## Status

ACCEPTED — P5.5 DONE

This is local implementation evidence only. No commit or push was performed.

## Boundary and base

- Technical ID: `PRODUCT-CONTROL-PLANE-P5.5-SIMULATED-RECONCILIATION-AND-SUBSCRIPTION-JOBS-LOCAL`
- Base HEAD: `f46cd652f8581c28e1848f2ebad5fde477ada409`
- Remote was read twice and matched the required SHA; final remote verification is recorded at handoff.
- Runtime: Node `v24.20.0`, pnpm `10.34.5`; host Node 12 was not used for acceptance commands.
- PostgreSQL: one disposable PostgreSQL 18 container.

## Implemented boundary

Migration `0011_p5_5_billing_reconciliation_jobs.sql` adds the only P5.5
table. Existing 0009 and 0010 remain byte-identical. The job table has READY,
LEASED, SETTLED, and BLOCKED states, strict row shapes, immutable payment and
creation identity, delete rejection, initial payment backfill, `SKIP LOCKED`
claiming, lease expiry reclaim, exact-token completion, and atomic P5.3 future
payment enqueue.

The simulator implements the separate `BillingPaymentStatusPort` with
deterministic FOUND/NOT_FOUND/UNAVAILABLE outcomes and explicit snapshots.
Provider calls occur after the claim transaction commits. PENDING, unavailable,
and not-found observations reschedule with deterministic delay. Terminal
observations use RECONCILIATION billing events, domain-separated payload and
identity hashes, status-time validation, terms validation, delayed/out-of-order
repair, SUCCEEDED/no-subscription repair, and no SUCCEEDED downgrade.

P5.4 webhook terminalization settles or reopens the reconciliation job in the
same transaction. Reconciliation activation reuses exact READY checkout
authority and writes the required payment/subscription audits atomically.

Subscription timestamps and transition history are the lifecycle schedule.
The worker rechecks due state after account-first locking. Exact period/grace
boundaries, SUSPENDED origins, stable JOB transitions, independent revisions,
SYSTEM audits, restart discovery, and fail-closed corruption handling are
implemented. P5.2 access remains timestamp-authoritative before delayed job
materialization. No automatic renewal or grace creation exists.

## Verification

- Fresh migration: PASS; second migration: PASS.
- Migration 0011 SHA-256: `5f55a0e69bdc49769cdb5e8796c0e8f4290372aeeaaca7a93792cab48bebef12`.
- Historical migration hashes: 0009 `d073221a237bdc867672b5e1e8223a0f62eacbb4670c1c19cfc346b64406e4ec`; 0010 `28ec7583b9ad7497246580ce19a22ba82d72cc6ab223c6f9503f4b88ad1eef18`.
- Full real-Postgres integration: 856/856 PASS; P5.5: 120/120; retained P5.4: 116, P5.3: 102, P5.2: 90, P5.1: 94.
- Full unit suite: 507 PASS, including 104 new P5.5 tests; 0 failures and 0 skip/todo.
- Crypto baseline: 12/12; E2E: 24/24.
- OpenAPI: 16 routes; SHA-256 `038fe97ae7bf1d44563f768dbe6335c087e3430f255986325fad65de422b308f`.
- DB-down and DB-up lint, format, typecheck, test, migration, OpenAPI, Bridge guard, and build gates: PASS.
- Required OpenAPI, bootstrap, device production wiring, Portal/admin billing HTTP, and Bridge boundaries were not changed.

Final full-gate counts and recovery-freeze hashes are recorded in the local
handoff report after the final verification commands. P5.6 is not started;
payment go-live remains DEFERRED.

## Remote acceptance finalization

- Implementation commit: `dc14ae9a1742e9e1733f0b0b7c2c77b9a637061c` (`feat(server): add billing reconciliation and subscription jobs`), direct parent `f46cd652f8581c28e1848f2ebad5fde477ada409`.
- Implementation Server CI: run `34091265631`, <https://github.com/MaksimUnimax/blood_sand/actions/runs/34091265631>, exact head, `SUCCESS`.
- `REMOTE_P5_5_REVIEW=PASS`; critical `0`, high `0`, material medium `0`.
- Unit: `507`; integration: `856`; P5.5: `120`; P5.4: `116`; P5.3: `102`; P5.2: `90`; P5.1: `94`.
- P4.6/P4.5/P4.4/P4.3/P4.2/P4.1: `38/52/48/52/21/30`; crypto: `12/12`; E2E: `24/24`.
- OpenAPI: `16`, SHA-256 `038fe97ae7bf1d44563f768dbe6335c087e3430f255986325fad65de422b308f`.
- Migrations: `0000..0011`; 0011 SHA-256 `5f55a0e69bdc49769cdb5e8796c0e8f4290372aeeaaca7a93792cab48bebef12`; 0012 absent.
- Payment mode is simulator-only; no real provider, provider SDK, credentials, external payment calls, or real money are integrated.
- P5.6 was not executed. Real payment go-live remains deferred; YooKassa and Tinkoff/T-Bank remain future candidates only.
