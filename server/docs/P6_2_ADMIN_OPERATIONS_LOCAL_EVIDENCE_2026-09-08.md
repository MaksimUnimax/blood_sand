# P6.2 admin operations local evidence — 2026-09-08

## Status

**ACCEPTED — P6.2 DONE**

Technical ID: `PRODUCT-CONTROL-PLANE-P6.2-ADMIN-READ-SUPPORT-PRINCIPAL-MANAGEMENT-LOCAL`  
Correction technical ID: `PRODUCT-CONTROL-PLANE-P6.2-LOCAL-ACCEPTANCE-CORRECTION`  
API coverage correction technical ID: `PRODUCT-CONTROL-PLANE-P6.2-ADMIN-API-CONTRACT-COVERAGE-LOCAL-CORRECTION`  
Attempt: `3`

## Base and runtime

- Local implementation HEAD: `c17a6725b3c5d7dc045591311f30bed4863bc736`.
- API test correction commit: `ef78734e76299708415f6a77cadf052a53922201`.
- Remote start reads 1 and 2: `c17a6725b3c5d7dc045591311f30bed4863bc736`.
- Accepted P6.1 implementation: `29f69a02914c231b89351e79714ca0fe59491afd`.
- Node `v24.20.0`; pnpm `10.34.5`; host Node 12 was not used.
- Final host disk is recorded in the correction freeze manifest; no PostgreSQL
  container was required for this controller-only correction.

### Implementation byte inventory

The P6.2 implementation parent is `7bb332c5cc1001a230a425ba55b799df9f3c5f8f`,
the implementation tree is
`5e39e2c888389e37c36fa924119e8e33b5deabf3`, and the implementation commit is
`c17a6725b3c5d7dc045591311f30bed4863bc736` (Server CI run `34182408920`).
The deterministic binary diff digest from the parent to the implementation
commit is
`8dfe8d002e563104029fb032d1c03882318cc1033dea7c415788124e300b2782`.
The complete changed-path inventory relative to P6.1 is:

```text
server/apps/api/package.json
server/apps/api/src/admin-auth-routes.ts
server/apps/api/src/admin-ops-routes.test.ts
server/apps/api/src/admin-ops-routes.ts
server/apps/api/src/admin-route-guard.ts
server/apps/api/src/app.ts
server/apps/api/src/main.ts
server/apps/api/src/openapi.test.ts
server/apps/api/src/openapi.ts
server/docs/ADR/0027-p6-admin-read-support-and-principal-management.md
server/docs/API_CONTRACTS.md
server/docs/P6_2_ADMIN_OPERATIONS_LOCAL_EVIDENCE_2026-09-08.md
server/docs/ROADMAP.md
server/integration/p5-7-p5-final-acceptance.integration.test.ts
server/integration/p6-2-admin-operations.integration.test.ts
server/openapi/openapi.json
server/packages/admin-ops/package.json
server/packages/admin-ops/src/index.test.ts
server/packages/admin-ops/src/index.ts
server/packages/admin-ops/tsconfig.json
server/packages/commercial-access/src/index.ts
server/packages/contracts/src/index.ts
server/packages/db/package.json
server/packages/db/src/device-management-repository.ts
server/packages/db/src/device-revocation.ts
server/packages/db/src/index.ts
server/packages/db/src/p6-admin-ops-repository.ts
server/pnpm-lock.yaml
```

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
- Implementation unit/API baseline: `802 passed`, `0 failed`, `0 skipped/todo`;
  baseline 685 plus 117 original P6.2 unit/API tests.
- API correction: 13 new controller instances; targeted API file total 23,
  all passed with 0 skip/todo. Current full unit/API total: `815 passed`,
  `0 failed`, `0 skipped/todo`; no duplicate runner; crypto regression 12/12.
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

### Remote acceptance and final counts

The API test correction was pushed as a fast-forward from the implementation
head. Server CI run `34185737057` passed at exact head
`ef78734e76299708415f6a77cadf052a53922201`:
https://github.com/MaksimUnimax/blood_sand/actions/runs/34185737057

The accepted unit total is `815 = 685 P6.1 baseline + 117 original P6.2 + 13
API correction`. P6.2 real PostgreSQL remains `106` distinct meaningful cases
and `106` physical instances. Full integration remains `1271 = 1165 + 106`.
Retained integration counts remain P6.1 `77`; P5.7/P5.6/P5.5/P5.4/P5.3/P5.2/P5.1
`80/152/120/116/102/90/94`; and P4.6/P4.5/P4.4/P4.3/P4.2/P4.1
`38/52/48/52/21/30`. Crypto is `12/12`, E2E is `32/32`, and OpenAPI is 33
tuples with SHA256
`04d716c1740281b08d22a8df0d3140817c7f536e36f099c6d278508f340aefbe`.

The final remote review is:

```text
REMOTE_P6_2_REVIEW=PASS
REMOTE_IMPLEMENTATION_TREE_PASS
REMOTE_UNIT_COUNT_SANITY_PASS
REMOTE_P6_2_TEST_COUNT_INTEGRITY_PASS
REMOTE_API_CORRECTION_COUNT_INTEGRITY_PASS
REMOTE_HTTP_ERROR_MATRIX_PASS
REMOTE_FORBIDDEN_PRELOOKUP_PASS
REMOTE_NONEMPTY_ACCOUNT_PRIVACY_PASS
REMOTE_NONEMPTY_USER_PRIVACY_PASS
REMOTE_NONEMPTY_SUBSCRIPTION_PRIVACY_PASS
REMOTE_NONEMPTY_DEVICE_PRIVACY_PASS
REMOTE_NONEMPTY_AUDIT_PRIVACY_PASS
REMOTE_NONEMPTY_PRINCIPAL_PRIVACY_PASS
REMOTE_MUTATION_SUCCESS_CONTRACT_PASS
ZERO_GROUP_B_COVERAGE_CLOSED=YES
ZERO_GROUP_D_COVERAGE_CLOSED=YES
ZERO_GROUP_N_COVERAGE_CLOSED=YES
ZERO_GROUPS_ARE_COVERAGE_ALLOCATION_NOT_GAPS=YES
REMOTE_ADMIN_ROUTE_GUARD_PASS
REMOTE_MUTATION_RBAC_RECHECK_PASS
REMOTE_SHARED_P5_SUBSCRIPTION_READ_PASS
REMOTE_SHARED_DEVICE_REVOCATION_PASS
REMOTE_PORTAL_REVOKE_REGRESSION_PASS
REMOTE_PRINCIPAL_REVISION_PASS
REMOTE_LAST_OWNER_PROTECTION_PASS
REMOTE_PRINCIPAL_LOCK_ORDER_PASS
REMOTE_SUSPEND_RESTORE_PASS
REMOTE_P6_2_AUDIT_ATOMICITY_PASS
REMOTE_OPENAPI_33_PASS
REMOTE_P6_3_NOT_STARTED_PASS
REMOTE_P7_NOT_STARTED_PASS
CRITICAL=0
HIGH=0
MATERIAL_MEDIUM=0
```

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

## Remote acceptance attempt 2 invalidation and attempt 3 correction

`REMOTE ACCEPTANCE ATTEMPT 2` was invalidated because zero-group N controller
coverage was incomplete. The prior API tests did not physically exercise the
HTTP mappings for `ADMIN_FORBIDDEN`, `ADMIN_RESOURCE_NOT_FOUND`,
`ADMIN_CONFLICT`, `ADMIN_STATE_STALE`, or `ADMIN_LAST_OWNER_REQUIRED`, and did
not assert non-empty privacy-safe read responses. Domain or real-PG tests were
not substituted for those controller-contract tests.

The correction changed only
`server/apps/api/src/admin-ops-routes.test.ts` and this evidence file. The
existing strict `INVALID_REQUEST`, unauthenticated `ADMIN_UNAUTHORIZED`, read
without CSRF, and missing-CSRF `ADMIN_CSRF_INVALID` tests remain present.

### Corrected controller coverage matrix

| Requirement | Actual HTTP test |
| --- | --- |
| `ADMIN_UNAUTHORIZED` | `rejects unauthenticated read %s %s` |
| `ADMIN_FORBIDDEN` read | `rejects a read caller without the exact permission` |
| `ADMIN_FORBIDDEN` mutation | `rejects a mutation caller without the exact permission` |
| `ADMIN_CSRF_INVALID` | `requires admin CSRF for device revoke` |
| `INVALID_REQUEST` | `rejects unknown mutation fields strictly` |
| `ADMIN_RESOURCE_NOT_FOUND` | `maps a missing subscription account to a safe resource error` |
| `ADMIN_CONFLICT` | `maps principal creation conflict to the controller error contract` |
| `ADMIN_STATE_STALE` | `maps a stale role grant to ADMIN_STATE_STALE` |
| `ADMIN_LAST_OWNER_REQUIRED` | `maps last-owner role removal to ADMIN_LAST_OWNER_REQUIRED` |
| non-empty account privacy | `returns a non-empty account projection without private fields` |
| non-empty user privacy | `returns non-empty users with only safe, ordered email fields` |
| non-empty subscription privacy | `returns the non-empty safe subscription projection` |
| non-empty device privacy | `returns non-empty devices without authorization secrets` |
| non-empty audit privacy | `returns non-empty audit events without reason or metadata` |
| non-empty principal privacy | `returns non-empty principals with sorted roles and no session data` |
| successful mutation | `returns the exact safe shape for a successful device revoke` |

```text
P6_2_API_CONTRACT_COVERAGE_CORRECTED=PASS
ZERO_GROUP_B_COVERAGE_CLOSED=YES
ZERO_GROUP_D_COVERAGE_CLOSED=YES
ZERO_GROUP_N_COVERAGE_CLOSED=YES
P6_2_API_CORRECTION_NEW_TESTS=13
API_FILE_TOTAL_TEST_INSTANCES=23
CORRECTED_UNIT_TOTAL=802 + 13 = 815
DUPLICATE_UNIT_RUNNER=NO
DUPLICATE_NEW_API_TESTS=0
SEMANTIC_PADDING_NEW_API_TESTS=0
UNIT_COUNT_INTEGRITY=PASS
```

Group B remains closed by shared accepted P5 commercial authority, P5.6
real-PG regression, and P6.2 route/unit wrappers. Group D remains closed by
the shared DB primitive, retained portal real-PG regression, and P6.2 admin
real-PG tests. Group N is now closed by the HTTP matrix above; no integration
file was changed and the P6.2 real-PG count remains 106.

### Correction scope markers

```text
PRODUCT_SOURCE_CHANGED=NO
ADMIN_OPS_DOMAIN_CHANGED=NO
DB_SOURCE_CHANGED=NO
CONTRACT_SOURCE_CHANGED=NO
APP_ROUTE_IMPLEMENTATION_CHANGED=NO
PACKAGE_LOCK_CHANGED=NO
MIGRATION_CHANGED=NO
OPENAPI_PRODUCT_CHANGED=NO
P6_2_INTEGRATION_FILE_CHANGED=NO
BRIDGE_CHANGED=NO
OPENAPI_ROUTES=33
OPENAPI_SHA256=04d716c1740281b08d22a8df0d3140817c7f536e36f099c6d278508f340aefbe
MIGRATIONS=0000..0012
MIGRATION_0012_SHA256=9eafa0e106b55ccae61f8b4d254cdebdad45d490ede49c75cd6ca18700c7a679
MIGRATION_0013_PRESENT=NO
```

## Attempt 3 recovery and freeze

The new correction artifacts are separate from the prior invalidated and
implementation recovery artifacts:

```text
PATCH=/var/backups/product-control-plane/git/blood_sand-p6.2-api-coverage-local-accepted-uncommitted.patch
ARCHIVE=/var/backups/product-control-plane/git/blood_sand-p6.2-api-coverage-local-accepted-untracked.tar.gz
MANIFEST=/var/backups/product-control-plane/git/blood_sand-p6.2-api-coverage-local-accepted.manifest.txt
RECOVERY_BASE=c17a6725b3c5d7dc045591311f30bed4863bc736
UNTRACKED_COUNT=0
```

The manifest is authoritative for final artifact byte counts, SHA256 values,
the detached reconstruction tree SHA, dual remote-final reads, and freeze
verification. No commit or push is part of this correction.

## Boundaries and roadmap

- No migration, admin UI, Bridge change, real provider, payment credential,
  webhook, checkout, account/user status mutation, subscription mutation,
  billing admin read, plan/price/entitlement mutation, AI/health/diagnostic
  admin domain, P6.3, or P7 work was added.
- Roadmap is P0–P5 DONE / FINAL ACCEPTED; P6 ACTIVE; P6.1 DONE; P6.2 DONE;
  P6.3–P6.6 PLANNED; P7–P15 PLANNED.
- Real payment go-live remains DEFERRED.
