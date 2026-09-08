# P6.2 admin operations local evidence — 2026-09-08

## Status

**LOCAL ACCEPTED — P6.2 ACTIVE**

Technical ID: `PRODUCT-CONTROL-PLANE-P6.2-ADMIN-READ-SUPPORT-PRINCIPAL-MANAGEMENT-LOCAL`  
Correction technical ID: `PRODUCT-CONTROL-PLANE-P6.2-LOCAL-ACCEPTANCE-CORRECTION`  
Attempt: `2`

## Base and runtime

- HEAD and both initial/final remote reads: `7bb332c5cc1001a230a425ba55b799df9f3c5f8f`.
- Accepted P6.1 implementation: `29f69a02914c231b89351e79714ca0fe59491afd`.
- Node `v24.20.0`; pnpm `10.34.5`; host Node 12 was not used.
- Final host disk: `/` 84% used, 9.1 GiB free; inode use 31%.
- One disposable PostgreSQL 18 container was used and removed after testing.

## P6.2 implementation

- New DB-independent package: `@product/admin-ops`.
- Reusable `requireAdminSubject`, `requireAdminPermission`, and
  `requireAdminMutation` guard; reads omit CSRF, mutations require admin CSRF.
- Transaction-time actor RBAC recheck is present for every P6.2 mutation.
- Exactly twelve new routes were added, for 33 generated OpenAPI method tuples:
  accounts, users, account subscription, account devices, device revoke,
  audit events, principal list/create, role grant/revoke, suspend, and restore.
- Permission map: `account.read`, `user.read`, `subscription.read`,
  `device.read`, `device.revoke`, `admin.audit.read`,
  `admin.principal.read`, and `admin.principal.manage` for principal writes.

Accounts use mutually exclusive exact UUID, owner-user UUID, or normalized exact
owner-email filters plus status and result-scoped UUID cursors. Users use exact
UUID or normalized exact email plus status and result-scoped UUID cursors.
Both use bounded 1–100 pagination, created-at/id descending order, and safe
projections only. Account responses omit owner identity and operational
secrets; user responses contain only deterministic email projections and
verification timestamps.

The admin subscription view delegates to the shared P5 timestamp-authoritative
account subscription reader and preserves plan/price revisions, period/grace
boundaries, eligibility, and device allowance parity. It omits billing history,
provider/payment identity, checkout, reconciliation, state reason, and audit
detail. Device reads use the safe existing device shape and never expose token,
session, or authorization-secret material.

Portal and admin device revocation use the same transaction-scoped primitive.
Admin revoke rechecks current actor authority, requires a bounded reason, emits
`ADMIN_DEVICE_REVOKED` and admin-acted `EXTENSION_SESSION_REVOKED`, and is
idempotent without new audit rows. Portal revoke regression remains green.

Audit reads use exact bounded filters and expose only the safe envelope; reason
and `safeMetadata` are not exposed. Principal reads expose status, revision,
and sorted active roles only. Principal creation requires an existing ACTIVE
user with a verified EMAIL identity and atomically creates revision 1 plus the
creation and initial grant audits. Role grant/revoke and suspend/restore use
optimistic `expectedRevision`; semantic changes increment exactly once, while
no-ops do not audit or increment. Role history is append-only.

Principal management uses the advisory namespace
`product-control-plane/admin-auth/manage/v1`, deterministic lexical UUID actor/
target row locking, current-role authorization, and last ACTIVE `ADMIN_OWNER`
protection. Owner-removal concurrency and same-revision concurrency are covered.
Suspension revokes active admin sessions with
`ADMIN_PRINCIPAL_SUSPENDED`; restore never reopens old sessions.

All six P6.2 mutation actions are exact:
`ADMIN_PRINCIPAL_CREATED`, `ADMIN_ROLE_GRANTED`, `ADMIN_ROLE_REVOKED`,
`ADMIN_PRINCIPAL_SUSPENDED`, `ADMIN_PRINCIPAL_RESTORED`, and
`ADMIN_DEVICE_REVOKED`. Reasons are trimmed, 1–256 characters, and reject
control characters including CR/LF; they are stored only in the audit reason
column. Domain state and audit writes are one PostgreSQL transaction.

## Gates

- Migrations: files `0000..0012` only; no `0013`; migration 0012 SHA256 is
  `9eafa0e106b55ccae61f8b4d254cdebdad45d490ede49c75cd6ca18700c7a679`.
- Fresh PostgreSQL 18 migration run 1: PASS; run 2: PASS.
- Unit/API: `802 passed`, `0 failed`, `0 skipped/todo`; baseline 685 plus 117
  new P6.2 unit/API tests; no duplicate runner; crypto regression 12/12.
- Real PostgreSQL: `1271 passed`, `0 failed`, `0 skipped/todo`; P6.2 has 106
  actual test instances and 106 distinct meaningful cases.
- Retained integration counts: P6.1 77; P5.7 80, P5.6 152, P5.5 120,
  P5.4 116, P5.3 102, P5.2 90, P5.1 94; P4.6 38, P4.5 52, P4.4 48,
  P4.3 52, P4.2 21, P4.1 30.
- DB-down gate: PASS. DB-up gate: PASS. Build: PASS.
- OpenAPI: 33 tuples; SHA256
  `04d716c1740281b08d22a8df0d3140817c7f536e36f099c6d278508f340aefbe`.
- Existing E2E: 32/32 passed, 0 failed, 0 skipped, 0 retries.
- Lint, formatting, typecheck, bridge guard, and frozen-lockfile install: PASS.

## Corrected acceptance evidence

Previous local acceptance evidence was invalidated during remote precommit
review because:

- `INVALIDATED / OLD VALUE`: the unit total `1604` was incorrect;
- the actual unit total is `802` (`685 + 117`);
- the integration suite contained duplicate/padding parameter rows.

`INVALIDATED / OLD VALUE`: the old integration claim of `111` P6.2 cases /
`1276` total. These old values are historical forensic values only, not current
acceptance facts.

The entire P6.2 integration file was audited. Repeated user-filter cycles,
duplicate role rows, repeated empty device-status rows, and unchanged-branch
limit/filter rows were removed. Genuine missing real-PG cases were added for
scoped cursors, identity ordering and verification projection, device/account
and role boundaries, audit filters, principal lifecycle errors, idempotency,
rollback, and concurrency.

```text
UNIT_BASELINE=685
UNIT_NEW_P6_2=117
UNIT_TOTAL=802
UNIT_DUPLICATE_RUNNER=NO
P6_2_DISTINCT_MEANINGFUL_CASES=106
P6_2_ACTUAL_TEST_INSTANCES=106
INTEGRATION_TOTAL=1271
INTEGRATION_ARITHMETIC=1165 + 106 = 1271
EXACT_DUPLICATE_PARAMETER_ROWS=0
SEMANTIC_PADDING_CASES=0
COUNT_INFLATION_HELPERS=0
P6_2_TEST_COUNT_INTEGRITY=PASS
```

### Distinct meaningful real-PG case inventory

Each case is assigned to one group only:

| Group | Distinct cases |
| --- | ---: |
| A. account/user reads | 24 |
| B. subscription safe-read reuse | 0 |
| C. device reads/revoke | 9 |
| D. portal device-revoke regression | 0 |
| E. audit-read privacy | 32 |
| F. principal reads/create | 17 |
| G. role grant/revoke | 11 |
| H. optimistic revisions | 2 |
| I. last-owner protection | 3 |
| J. principal-management concurrency/lock order | 2 |
| K. transaction-time actor RBAC recheck | 1 |
| L. suspend/restore/session invalidation | 3 |
| M. audit atomicity/rollback | 2 |
| N. API/error/privacy boundary | 0 |
| **Total** | **106** |

The zero-count delegated/regression groups are covered by the retained P5/P6.1
integration and API suites; no test is counted twice in the P6.2 total.

## Boundaries and roadmap

- No migration, admin UI, Bridge change, real provider, payment credential,
  webhook, checkout, account/user status mutation, subscription mutation,
  billing admin read, plan/price/entitlement mutation, AI/health/diagnostic
  admin domain, P6.3, or P7 work was added.
- Roadmap is P0–P5 DONE / FINAL ACCEPTED; P6 ACTIVE; P6.1 DONE; P6.2 ACTIVE;
  P6.3–P6.6 PLANNED; P7–P15 PLANNED.
- Real payment go-live remains DEFERRED.
