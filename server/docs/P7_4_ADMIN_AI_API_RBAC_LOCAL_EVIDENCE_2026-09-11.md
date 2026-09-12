# P7.4 Admin AI API and RBAC — local candidate evidence

Date: 2026-09-11

Status: `P7_4_FINAL_LOCAL_ACCEPTANCE_PASS` / local acceptance complete; remote
acceptance pending. This is
not remote acceptance, not a commit, and not a push.

## Identity and authority

```text
BASE_HEAD  = 00edb4ec68a9417ec21beb16d7e3db535747e622
BASE_TREE  = 8a65b74334a7e99bc09f351b9c46a0f159978492
P7.3 finalization SHA = 00edb4ec68a9417ec21beb16d7e3db535747e622
P7.3 finalization CI run = 34591388240
P7.3 finalization CI result = SUCCESS
P7.3 state = DONE / REMOTE ACCEPTED
```

The work was performed in the dedicated detached worktree
`/opt/product-control-plane-src/blood_sand-p7.4-attempt1`. The dirty main
checkout was not edited, reset, cleaned, stashed, or used for implementation.

Toolchain:

```text
NODE_PATH    = /root/.nvm/versions/node/v24.20.0/bin/node
NODE_VERSION = v24.20.0
PNPM_PATH    = /root/.nvm/versions/node/v24.20.0/bin/pnpm
PNPM_VERSION = 10.34.5
FREE_DISK_START = 8793788416 bytes
FREE_DISK_END   = 8225083392 bytes
```

The start snapshot exceeded the required 8 GiB free-disk gate before the
heavy regressions. The end snapshot is after the test/build workload.

## Permissions and routes

The exact added permissions are:

```text
ai.registry.read
ai.registry.manage
ai.profile.read
ai.profile.manage
ai.assignment.read
ai.assignment.manage
```

Role matrix:

```text
ADMIN_OWNER          all six P7 permissions
ADMIN_OPS            all six P7 permissions
ADMIN_SUPPORT        ai.registry.read, ai.profile.read, ai.assignment.read
ADMIN_BILLING_READONLY none
```

`BASE_OPENAPI_OPERATIONS = 67`, `P7_4_ADDED_OPERATIONS = 35`, and
`FINAL_OPENAPI_OPERATIONS = 102`; arithmetic matches exactly. The final
OpenAPI SHA256 is
`9563c57d622a7eee2197ea9a0508852f7c7a0aef87bbb9dddf5570cc83b50cc7`.

The 10 read routes are:

```text
GET /v1/admin/ai/registry/adapters
GET /v1/admin/ai/registry/adapters/{adapter_id}/surfaces
GET /v1/admin/ai/registry/surfaces/{surface_id}/variants
GET /v1/admin/ai/profiles
GET /v1/admin/ai/profiles/{profile_id}
GET /v1/admin/ai/profiles/{profile_id}/revisions
GET /v1/admin/ai/profiles/{profile_id}/revisions/{revision}
GET /v1/admin/ai/assignments
GET /v1/admin/ai/assignments/{assignment_id}
GET /v1/admin/ai/assignments/{assignment_id}/revisions
```

The 25 mutation routes are explicit POST commands:

```text
POST /v1/admin/ai/registry/adapters
POST /v1/admin/ai/registry/surfaces
POST /v1/admin/ai/registry/variants
POST /v1/admin/ai/profiles
POST /v1/admin/ai/registry/adapters/{adapter_id}/metadata
POST /v1/admin/ai/registry/adapters/{adapter_id}/status
POST /v1/admin/ai/registry/surfaces/{surface_id}/metadata
POST /v1/admin/ai/registry/surfaces/{surface_id}/status
POST /v1/admin/ai/registry/variants/{variant_id}/metadata
POST /v1/admin/ai/registry/variants/{variant_id}/status
POST /v1/admin/ai/profiles/{profile_id}/metadata
POST /v1/admin/ai/profiles/{profile_id}/status
POST /v1/admin/ai/profiles/{profile_id}/revisions
POST /v1/admin/ai/profiles/{profile_id}/revisions/{revision}/replace
POST /v1/admin/ai/profiles/{profile_id}/revisions/{revision}/candidate
POST /v1/admin/ai/profiles/{profile_id}/revisions/{revision}/publish
POST /v1/admin/ai/profiles/{profile_id}/revisions/{revision}/retire
POST /v1/admin/ai/assignments
POST /v1/admin/ai/assignments/{assignment_id}/direct
POST /v1/admin/ai/assignments/{assignment_id}/rollout
POST /v1/admin/ai/assignments/{assignment_id}/rollout/percentage
POST /v1/admin/ai/assignments/{assignment_id}/rollout/pause
POST /v1/admin/ai/assignments/{assignment_id}/rollout/resume
POST /v1/admin/ai/assignments/{assignment_id}/rollout/complete
POST /v1/admin/ai/assignments/{assignment_id}/rollback
```

## Implementation and security proof

The new `@product/admin-ai` package is transport-neutral and delegates profile
and assignment commands to the accepted P7.2 repository authority. Its output
schemas strip actor attribution and stored reasons from ordinary reads. Scope
creation accepts no cohort seed and the service/API response contains no seed.

The dedicated DB read adaptor is bounded to a maximum page size of 100 and
does not select cohort seeds, reasons, actor IDs, auth material, credentials,
signing keys, or raw audit rows. There are no delete routes. Registry identity
IDs, machine keys, and hierarchy bindings remain immutable. Metadata/status
changes require expected `updatedAt` and are checked while the row is locked.

Every P7 mutation has the route session/permission check, existing admin CSRF
double-submit/HMAC validation, and a transaction-time
`authorizeAdminMutationInTransaction` recheck. Attempt1 evidence claimed that
both role revocation and suspension had state/audit atomicity proof; Independent
Review1 accepted the role-revocation proof but found the suspension evidence
insufficient. Attempt2 supplies the required real-Postgres before/after state
and zero-new-audit-row proof for suspension.
It also proved Support reads, Support mutation denial, Billing-readonly read
denial, missing/invalid CSRF rejection, hierarchy mismatch rejection,
immutable machine-key behavior, stale profile fingerprints, stale assignment
revisions, and accepted P7.3 `AI_DISABLED` visibility after registry disable.

Successful registry mutations have bounded atomic audit metadata. P7.2 profile
and assignment commands retain their existing business audit authority, so no
API-layer duplicate audit is added. Error responses use stable categories and
do not expose SQL errors, constraint names, stack traces, seeds, or stored
operator reasons.

## QA arithmetic and gates

```text
UNIT_BASE       = 1127
P7_4_UNIT_DELTA = 13
UNIT_EXPECTED   = 1140
UNIT_ACTUAL     = 1140
UNIT_FAIL       = 0
UNIT_SKIP       = 0

FULL_INTEGRATION_BASE       = 1481
P7_4_INTEGRATION_DELTA      = 6
FULL_INTEGRATION_EXPECTED   = 1487
FULL_INTEGRATION_ACTUAL     = 1487
FULL_INTEGRATION_FAIL       = 0
FULL_INTEGRATION_SKIP       = 0
```

Passed gates:

```text
format:check = PASS
lint = PASS
typecheck = PASS
openapi:check = PASS
bridge:guard = PASS
build = PASS
focused PostgreSQL = 6/6 PASS
```

Full Playwright E2E was not run in Attempt1 because P7.4 adds no admin UI;
`FULL_E2E_AFTER_P7_4_ATTEMPT1 = NOT RUN`. P7.5 owns new UI E2E coverage.

## Migration, boundaries, and hygiene

```text
MIGRATION_RANGE = 0000..0014
0014_SHA256 = 4a12aa34d6be16648fc6cd12b4f3de04f3cce0f3abd6938918905dfa2c471558
0015_PRESENT = NO
PROVIDER_CALLS = 0
P7.3_SEMANTICS_CHANGED = NO
P7.5_UI_CHANGE = NO
P8_CHANGE = NO
P9_CHANGE = NO
P11_BRIDGE_CHANGE = NO
P14_CHANGE = NO
SECOND_SIGNING_PLANE = NO
SECOND_ROLLOUT_PLANE = NO
REMOTE_EXECUTABLE_PROFILE = NO
```

The only disposable resource was container
`3f7cd7a8e7d6` / `product-control-plane-p7.4-attempt1-pg`; it had no volume and
was removed by exact name after testing. `NEW_CONTAINERS_LEFT = 0` and
`NEW_VOLUMES_LEFT = 0`. No broad Docker prune was used.

The changed-path review classified all implementation, test, documentation,
lockfile, and generated OpenAPI paths as P7.4 product/test/doc or generated
OpenAPI. No unexpected path was found. The roadmap now records P7 ACTIVE,
P7.1/P7.2/P7.3 DONE / REMOTE ACCEPTED, P7.4 ACTIVE / LOCAL CANDIDATE, and
P7.5/P7.6/P8 PLANNED.

The main-checkout c21 work remains preserved and is verified in the final
report. No commit or push was performed.

The immutable freeze manifest contains the final staged tree, artifact sizes
and SHA256 values, and both independent reconstruction results. Its path is
`/var/backups/product-control-plane/git/blood_sand-p7.4-attempt1-candidate.manifest.txt`.
The final staged tree is also printed in the final handoff report.

```text
ATTEMPT1_TREE = recorded in immutable manifest
PATCH = recorded in immutable manifest
ARCHIVE = recorded in immutable manifest
MANIFEST = immutable external freeze artifact
RECONSTRUCTION_A = recorded in immutable manifest
RECONSTRUCTION_B = recorded in immutable manifest
```

## Attempt2 limited correction (current authority)

Attempt1 was not accepted. Independent Review1 result was
`STATUS = BLOCKED_RESOURCE`, with `CRITICAL = 0`, `HIGH = 0`, `MEDIUM = 3`,
and `LOW = 0`. The three findings were: a stale rollout route manifest entry;
adapter partial metadata/status updates dropping an omitted
persisted description; and suspension testing that asserted denial without
proving unchanged business state and zero committed business audit rows.

Resource recovery happened before source edits. The initial available disk was
`8,223,449,088` bytes. Only exact generated, ignored, untracked outputs were
removed from the two dedicated Product Control Plane worktrees: their `.next`
and `dist` directories, totaling `378,820,130` bytes. No source, input,
node_modules, cache, pnpm store, backup, main-checkout data, or test-results
were removed. Available disk after cleanup was `8,603,516,928` bytes and the
observed available disk immediately after generated-output cleanup was
`8,289,804,288`; final available disk is recorded in the handoff and freeze
manifest after artifact creation.

Finding 1 is documentation-only. The canonical route is
`POST /v1/admin/ai/assignments/{assignment_id}/rollout`; ADR-0034 and this
evidence now use it. The registered route and OpenAPI were unchanged. The
repository-wide stale route-token search is empty. Route totals remain
`READ = 10`, `MUTATION = 25`, `TOTAL = 35`.

Finding 2 root cause was the locked adapter identity query omitting `description`,
followed by a fallback to `""` when the caller omitted the field. The source
correction loads the adapter description under the row lock and distinguishes
an omitted field from an explicitly supplied value. Omitted mutable fields now
retain their persisted values; explicit validated values, including an explicit
empty string where allowed by schema, are applied intentionally. The focused
real-Postgres regression proves display-name-only preservation, status
`ACTIVE -> DISABLED` preservation, `DISABLED -> ACTIVE` preservation, and
explicit description replacement. Audit safe metadata remains bounded and the
explicit replacement test verifies its intentional description field only.
The adjacent surface, variant, and profile loaders were audited; none has the
same demonstrable omitted-description destructive-update pattern.

Finding 3 is now proven through the real API path. A valid authenticated admin
session and CSRF were prepared, the exact adapter business row was captured
before the command, and the correlation-specific audit count was captured
before it. The principal was suspended after session authentication and before
the mutation transaction's authorization. The command returned
`403 ADMIN_FORBIDDEN`; the exact adapter row after the request equaled the
before snapshot in every mutable/relevant field, and new audit rows for the
denied correlation were `0`. The accepted role-revocation before/after and
zero-audit proof remains retained.

Attempt2 focused PostgreSQL authority used PostgreSQL `18.0` on loopback with
no persistent volume. The P7.4 integration file ran `6` tests: `PASS = 6`,
`FAIL = 0`, `SKIP = 0`, including RBAC, CSRF, role-revocation atomicity,
suspension atomicity, hierarchy/partial-update behavior, profile/assignment
lifecycle, seed non-exposure, audit behavior, and real P7.4-to-P7.3
`AI_DISABLED` integration.

Attempt2 added no unit or integration test cases; existing tests were
strengthened in place. Therefore unit arithmetic is
`1127 + 13 = 1140` for Attempt1 and `1140 + 0 = 1140` for Attempt2; full unit
actual was `1140`, `FAIL = 0`, `SKIP = 0`. Integration arithmetic is
`1481 + 6 = 1487` for Attempt1 and `1487 + 0 = 1487` for Attempt2; full
integration actual was `1487`, `FAIL = 0`, `SKIP = 0` (`37` files).

`format:check`, `lint`, `typecheck`, `openapi:check`, `bridge:guard`, and
`build` all passed. OpenAPI remains `67 + 35 = 102` operations with SHA256
`9563c57d622a7eee2197ea9a0508852f7c7a0aef87bbb9dddf5570cc83b50cc7`.
Migrations remain `0000..0014`, migration `0014` retains SHA256
`4a12aa34d6be16648fc6cd12b4f3de04f3cce0f3abd6938918905dfa2c471558`, and
`0015` is absent. Bridge and provider boundaries are unchanged; provider
calls are `0`. No second rollout/signing plane or remote executable profile
was added. The roadmap remains `P7.4 = ACTIVE / LOCAL CANDIDATE`.

The Attempt2 freeze and double reconstruction are recorded in the immutable
Attempt2 manifest. Attempt1 freeze hashes were reverified unchanged. The
disposable PostgreSQL container was removed with no leftover containers or
volumes. Main checkout c21 fingerprints are unchanged. `FULL_E2E = NOT RUN`.
Independent Review2 is pending and P7.4 local acceptance remains `NO`.

## FINAL LOCAL ACCEPTANCE — 2026-09-12

The exact Attempt2 candidate was accepted locally after one complete first-run
E2E gate. The canonical base is commit
`00edb4ec68a9417ec21beb16d7e3db535747e622`, tree
`8a65b74334a7e99bc09f351b9c46a0f159978492`, and the Attempt2 staged product
tree used by E2E is
`9b4eb51c4b2d9d83060f05b419041c5501f97320`. The candidate HEAD remained
`00edb4ec68a9417ec21beb16d7e3db535747e622` throughout.

Independent Review2 is `P7_4_ATTEMPT2_INDEPENDENT_REVIEW2_PASS`. Its focused
fresh PostgreSQL 18.0 authority is `6 / 0 / 0` (`PASS / FAIL / SKIP`), and all
three Review1 MEDIUM findings are closed: route authority, persisted
description preservation, and suspended-principal atomic denial with unchanged
business state and zero denied audit rows. Review2 totals are
`CRITICAL = 0`, `HIGH = 0`, `MEDIUM = 0`, `LOW = 1`; the LOW was only the
standalone `bytes.` typo in the historical/current evidence prose and it was
corrected during this legitimate final evidence update. The historical Review1
LOW/MEDIUM results and Review2 resource-recovery history remain preserved
above.

Review2's initial `BLOCKED_RESOURCE` state, bounded resource-recovery
continuation, and final PASS authority are retained as part of this acceptance
record; no product correction was made during that review continuation.

Accepted aggregate authority remains unit `1140 / 0 / 0`, integration
`1487 / 0 / 0`, format/lint/typecheck PASS, OpenAPI PASS with `102` operations
and SHA256
`9563c57d622a7eee2197ea9a0508852f7c7a0aef87bbb9dddf5570cc83b50cc7`, Bridge
guard PASS, and build PASS. Migration authority remains `0000..0014`, with
`0014` SHA256
`4a12aa34d6be16648fc6cd12b4f3de04f3cce0f3abd6938918905dfa2c471558`; `0015`
is absent. Provider calls are `0` and Bridge product source is unchanged.

The one fresh E2E resource was loopback-only PostgreSQL `18.0`, container
`product-control-plane-p7.4-final-e2e-pg` (ID
`8cb39816915b5d773cd36509109a72f9fe4b3806067d9d24e2f718acf08885d4`), host
port `32775`, database `product_control_plane_p7_4_final_e2e`, with no
persistent volume. The exact repository command `pnpm test:e2e` ran with
pnpm `10.34.5` and Node `v24.20.0`: `69 / 0 / 0` (`PASS / FAIL / SKIP`),
first run only, duration `228s`. The container was removed afterward; no
containers or volumes from this run remain.

The main checkout at c21 remains unchanged, and P7.3 remains unchanged. P7.5,
P7.6, and P8 were not started. The roadmap now records P7 ACTIVE and P7.4
ACTIVE / LOCAL ACCEPTED / REMOTE ACCEPTANCE PENDING. ADR-0034 records the same
truthful local state.

`LOCAL_P7_4_ACCEPTANCE = PASS`

`REMOTE_P7_4_ACCEPTANCE = PENDING`

`SAFE_FOR_REMOTE_PUBLICATION = PENDING_MAIN_CHATGPT_ACCEPTANCE`
