# P7.3 bootstrap AI resolution — local candidate evidence — 2026-09-11

Technical ID: `PRODUCT-CONTROL-PLANE-P7_3-ATTEMPT1-BOOTSTRAP-AI-RESOLUTION-IMPLEMENTATION-2026-09-11`

## Candidate basis

- Base SHA: `3fcc8becfe697554594a480c311d729fa1f2b73e`
- Base tree: `797772d09d30e4269f71ea0160b2d42c440b736e`
- Candidate staged tree: see the authoritative recovery manifest generated
  after final staging.
- Worktree: `/opt/product-control-plane-src/blood_sand-p7.3-attempt1`
- Node: `v24.20.0` (task-local toolchain)
- pnpm: `10.34.5`
- Free disk immediately after worktree creation: `10,787,028,992` bytes
- Free disk after dependency setup: `10,492,735,488` bytes
- Free disk after implementation/typecheck: `10,292,994,048` bytes
- Free disk after tests and PostgreSQL cleanup: `10,276,347,904` bytes

## Implemented scope

P7.3 activates the reserved AI section of the existing signed bootstrap
payload. Contracts own only the bounded JSON-compatible outer union; the
adapter registry owns strict profile and fingerprint validation. The existing
`POST /v1/bootstrap` route and P3 envelope/signing identifiers remain in use.

The wire states are `UNCONFIGURED`, `UNAVAILABLE`, and `RESOLVED`.
`UNAVAILABLE` reasons are `UNSUPPORTED_DETECTED_AI`, `AI_DISABLED`,
`NO_PROFILE`, and `PROFILE_INCOMPATIBLE`. A resolved profile carries only its
public profile key, revision, scope variant, schema version, fingerprint,
declarative content, and compatibility constraints. Assignment IDs, revision
IDs, cohort seeds, and subject/account/device identifiers are not signed or
returned.

Resolution uses exact variant assignment first, then surface default only when
the exact scope has no configured latest revision. Unknown non-null variants do
not fall back. DIRECT and PAUSED use baseline; ROLLOUT calls the accepted
P7.2/P3 `selectAssignedProfileRevision` authority with authenticated account or
device identity.

The DB repository obtains hierarchy, assignment/latest-revision, and profile
targets through one PostgreSQL statement. The service then validates active
hierarchy/profile state, PUBLISHED revision state, ownership, strict profile
and compatibility schemas, and recomputed fingerprint equality. Structural DB
corruption fails the bootstrap safely; legitimate request incompatibility is
signed as `PROFILE_INCOMPATIBLE`.

The simulated packaged detector recognizes only exact HTTPS origin
`https://chatgpt.com` and deterministic Standard/Work fixtures. The client
verifies the existing envelope first, validates the outer and strict profile
contracts, checks signed detected-context equality and variant binding,
recomputes the fingerprint, and checks compatibility before automatic bind.
Offline use requires current packaged detection, cached request context, and
signed context to agree; expired snapshots do not bind.

No Health runner, Bridge runtime, provider call, new signing plane, remote
profile fetch, P7.4 API, or migration was added. Health states remain P8
work; live Bridge DOM integration remains P11 work.

## Verification

- Base unit baseline: `pnpm test`, 1,113 passed, 0 failed, 0 skipped, 30
  report lines, 39.19 seconds.
- Candidate unit: `pnpm test`, 1,127 passed, 0 failed, 0 skipped, 30 report
  lines, 28.27 seconds.
- `pnpm lint`: PASS; includes Bridge boundary guard.
- `pnpm format:check`: PASS.
- `pnpm typecheck`: PASS.
- Focused bootstrap tests: 16 passed.
- Focused simulated-extension-client tests: 40 passed.
- Focused API bootstrap/signing/OpenAPI tests: 210 passed in 16 files.
- Real PostgreSQL P7.3 integration: 6 passed in one test file. It covers
  Standard/Work independence, exact/default precedence and empty exact scope,
  unsupported and disabled hierarchy, no profile, DIRECT/PAUSED/ROLLOUT with
  authenticated DEVICE identity, compatibility failure, and statement
  snapshot behavior across an assignment revision commit.
- `pnpm openapi:check`: PASS. Operation count remains 67. OpenAPI SHA256:
  `52f43a45720929b45c4350442537320c298f84023b583735f42e3eb1378459f2`.
- `pnpm bridge:guard`: PASS.

The integration PostgreSQL container created for this run was
`product-control-plane-p7.3-attempt1-pg` and was removed by exact name after
testing. It used no new Docker volume. New test containers left: 0. New test
volumes left: 0.

## Persistence and safety checks

- Migration range remains `0000..0014`.
- Migration 0014 SHA256 remains
  `4a12aa34d6be16648fc6cd12b4f3de04f3cce0f3abd6938918905dfa2c471558`.
- Migration 0015: absent.
- `@product/contracts` has no `@product/adapter-registry` dependency.
- No admin endpoint, P7 RBAC permission, P8 runner, Bridge runtime change,
  executable profile primitive, caller cohort seed, request profile or
  assignment override, or second signing/fetch plane was added.
- `tooling/llm-api-bridges/**` is unchanged from the base; the Alice hardening
  ledger is byte-identical.
- Provider calls: 0.
- Main dirty c21 checkout and prior recovery snapshots were not modified.

## Freeze status

The final staged tree, patch/archive checksums, manifest, and two independent
reconstruction results are recorded in the recovery manifest under
`/var/backups/product-control-plane/git/`.

FULL_REGRESSION = NOT YET RUN
INDEPENDENT_REVIEW = PENDING
REMOTE_ACCEPTANCE = PENDING

Known limitation: this is a local candidate. The simulated detector is a
bounded packaged fixture and makes no claim about current live ChatGPT DOM
behavior. P8 Health and P11 Bridge integration remain intentionally outside
this candidate.

## Attempt-2 corrective rework

Technical ID: `PRODUCT-CONTROL-PLANE-P7_3-ATTEMPT2-TEST-PROVENANCE-AND-CONCURRENCY-CORRECTION-2026-09-11`

The Attempt-1 independent review is retained as historical evidence:

- Result: `P7_3_ATTEMPT1_INDEPENDENT_REVIEW_FAIL`.
- Critical: 0; High: 0; Medium: 2; Low: 0.
- `P7.3-EVIDENCE-001`: the accepted P7.2 total of 1,173 was not reconciled
  with the current exact-command total of 1,127.
- `P7.3-TEST-002`: the existing concurrency test was sequential and did not
  overlap a resolver read with a competing mutation.

No product implementation was changed in Attempt 2. The only test-code change
is a replacement of the final test in
`server/packages/db/src/p7.3-bootstrap-ai.integration.test.ts`; this evidence
section is the only documentation change.

### Exact test command and collection provenance

The repository-required command was executed from `/opt/product-control-plane-src/blood_sand-p7.3-attempt1/server`, with Node `v24.20.0` and pnpm `10.34.5`:

```text
TEST_COMMAND_EXACT = pnpm test
root script = pnpm -r test && pnpm bridge:guard
workspace = server/pnpm-workspace.yaml; packages = apps/*, packages/*
recursive scope = 31 of 32 workspace projects
package test commands = each workspace package's package.json test script
DB package command = vitest run --passWithNoTests --exclude '**/*.integration.test.ts'
bridge step = node scripts/check-bridge-boundary.mjs
```

There is one no-test package (`admin-billing`), so the exact unit command
reported 30 package result lines, 62 collected files, and 1,127 cases. The
integration file is tracked but intentionally excluded from this unit command.
There were no collection-affecting environment gates set; `DATABASE_URL` was
unset for unit collection. The CI workflow uses the same working directory,
Node and pnpm versions, and frozen-lockfile installation. Its safe collection
settings are `DATABASE_URL` only for later integration/migration/E2E steps and
`PRODUCT_CONTROL_PLANE_E2E=1` only for E2E. No pre-test step creates test files
or generated artifacts. GitHub run metadata confirms successful `pnpm test`
steps for runs `34485896603` and `34487778764`, but the raw job-log endpoint
was unavailable to this read-only inspection, so those runs do not provide a
recoverable numeric test total.

The clean exact-base reproduction was run in one temporary detached worktree
from `3fcc8becfe697554594a480c311d729fa1f2b73e`, after
`pnpm install --frozen-lockfile` using the shared pnpm store. It produced
1,113 passed, 0 failed, 0 skipped. The candidate exact command produced
1,127 passed, 0 failed, 0 skipped. The current 14-case delta is completely
accounted for by the two newly collected unit files below, seven cases each;
the new DB integration file is excluded by the exact DB package test script.

`BASE_TRACKED_TEST_FILES = 103` and `CANDIDATE_TRACKED_TEST_FILES = 106`,
counted from Git objects under `server/` (including integration and E2E files).
The tracked-file delta is:

```text
ADDED
server/packages/bootstrap/src/ai-resolution.test.ts
server/packages/db/src/p7.3-bootstrap-ai.integration.test.ts
server/packages/simulated-extension-client/src/ai-binding.test.ts
REMOVED = none
RENAMED = none
```

The current exact unit inventory (`workspace/package | file | cases`) is:

```text
apps/admin | lib/control-plane.test.ts | 13
apps/admin | lib/control-plane-route.test.ts | 76
apps/admin | lib/admin-ui.test.ts | 3
apps/api | src/admin-billing-routes.test.ts | 46
apps/api | src/admin-ops-routes.test.ts | 23
apps/api | src/admin-commercial-routes.test.ts | 61
apps/api | src/public-catalog-routes.test.ts | 13
apps/api | src/openapi.test.ts | 3
apps/api | src/commercial-routes.test.ts | 12
apps/api | src/device-management-routes.test.ts | 3
apps/api | src/device-authorization-routes.test.ts | 6
apps/api | src/admin-auth-routes.test.ts | 12
apps/api | src/auth-routes.test.ts | 3
apps/api | src/refresh-routes.test.ts | 5
apps/api | src/bootstrap-signing.test.ts | 13
apps/api | src/extension-access-auth.test.ts | 1
apps/api | src/app.test.ts | 5
apps/api | src/infrastructure.test.ts | 2
apps/api | src/portal-support-routes.test.ts | 2
apps/health-runner | src/index.test.ts | 1
apps/portal | app/api/control-plane/[...path]/route.test.ts | 22
apps/portal | lib/return-to.test.ts | 14
apps/worker | src/device-authorization-expiry-runner.test.ts | 2
apps/worker | src/lifecycle.test.ts | 4
apps/worker | src/composite-runner.test.ts | 2
apps/worker | src/p5-5-runners.test.ts | 8
packages/adapter-registry | src/p7.2.test.ts | 3
packages/adapter-registry | src/index.test.ts | 7
packages/admin-auth | src/index.test.ts | 38
packages/admin-commercial | src/index.test.ts | 89
packages/admin-ops | src/index.test.ts | 107
packages/auth | src/index.test.ts | 9
packages/billing | src/p5-4-events.test.ts | 68
packages/billing | src/p5-5-reconciliation.test.ts | 56
packages/billing | src/index.test.ts | 51
packages/billing-simulator | src/p5-5-status.test.ts | 10
packages/billing-simulator | src/index.test.ts | 11
packages/billing-simulator | src/p5-4-events.test.ts | 21
packages/bootstrap | src/ai-resolution.test.ts | 7
packages/bootstrap | src/index.test.ts | 9
packages/commercial-access | src/index.test.ts | 65
packages/commercial-catalog | src/index.test.ts | 3
packages/compatibility | src/index.test.ts | 3
packages/contracts | src/index.test.ts | 6
packages/db | src/remote-config-catalog-repository.test.ts | 1
packages/db | src/schema.test.ts | 7
packages/db | src/migrations.test.ts | 3
packages/device-auth | src/index.test.ts | 9
packages/device-management | src/index.test.ts | 3
packages/email | src/index.test.ts | 2
packages/entitlements | src/index.test.ts | 10
packages/extension-auth | src/index.test.ts | 9
packages/observability | src/index.test.ts | 2
packages/plans | src/index.test.ts | 12
packages/pricing | src/index.test.ts | 6
packages/remote-config | src/index.test.ts | 34
packages/shared | src/config.test.ts | 2
packages/simulated-extension-client | src/index.test.ts | 5
packages/simulated-extension-client | src/ai-binding.test.ts | 7
packages/simulated-extension-client | src/policy.test.ts | 28
packages/subscriptions | src/index.test.ts | 39
packages/subscriptions | src/p5-5-lifecycle.test.ts | 30
```

Per-package totals are: admin 92/3 files, api 210/16, health-runner 1/1,
portal 36/2, worker 16/4, adapter-registry 10/2, admin-auth 38/1,
admin-commercial 89/1, admin-ops 107/1, auth 9/1, billing 175/3,
billing-simulator 42/3, bootstrap 16/2, commercial-access 65/1,
commercial-catalog 3/1, compatibility 3/1, contracts 6/1, db 11/3,
device-auth 9/1, device-management 3/1, email 2/1, entitlements 10/1,
extension-auth 9/1, observability 2/1, plans 12/1, pricing 6/1,
remote-config 34/1, shared 2/1, simulated-extension-client 40/3, and
subscriptions 69/2. These sum to 1,127 cases and 62 files.

The accepted P7.2 authority remains `1173 / 0`. Its evidence preserves
historical observations 1,110, 1,112, 1,112, and 1,113, then records clean
observations of 1,169 and 1,173 while explicitly saying the cause of the
earlier lower observations was not established. The exact clean base
reproduction here is 1,113, not 1,169, and the exact candidate is 1,127, not
1,173. This proves the present local collection and its 14-case P7.3 delta,
but it does not prove the historical 46-case cause. No environment, config,
dependency, platform, or generated-artifact explanation for those 46 cases
was found. Therefore:

```text
MISSING_46_IDENTIFIED = no
ROOT_CAUSE = unresolved; accepted 1173 is not reproducible from the preserved exact tree/command
ROOT_CAUSE_PROOF = exact clean base 1113 plus exact candidate 1127, with only the two +7 unit files differing in collection
ACCEPTED_1173_RECONCILED = no
PROVENANCE_DECISION = UNRESOLVED
P7.3-EVIDENCE-001 = OPEN
```

The 1,173 authority is preserved as historical truth; it is not erased or
relabelled as 1,127. The candidate is not marked PASS while this provenance
finding remains open.

### Corrected PostgreSQL concurrency proof

The prior sequential test was replaced, not supplemented. The replacement
uses real PostgreSQL and the normal production repository/query:

```text
CONNECTION_COUNT = 2 independent database runtimes/connections
TRANSACTION_COUNT = 2 (resolver statement transaction and mutation transaction)
BARRIER_MECHANISM = promise barriers mutation-held, resolver-start, snapshot-captured, mutation-release, mutation-committed
MUTATION = append-only revision 2 for the existing assignment, changing its baseline target from the baseline profile to the candidate profile; the transaction is held uncommitted
OVERLAP_PROOF = B inserts and holds; A starts the real resolver query; PostgreSQL captures A's statement result; B is then released and commits while A's result delivery is held
OLD_TUPLE = revision 1, DIRECT, baseline=baseline revision, selected=baseline revision, profile=standard-profile
NEW_TUPLE = revision 2, DIRECT, baseline=candidate revision, selected=candidate revision, profile=candidate-profile
FORBIDDEN_HYBRID = revision 2/candidate baseline paired with revision 1/baseline selected profile and standard-profile
SQL_STATEMENT_COUNT = 1 resolver statement during the race (instrumented driver boundary); a second post-commit call is outside the race
WHY_MULTI_STATEMENT_UNSAFE_VERSION_WOULD_FAIL = if resolution were split into separately snapshotted reads, the held first read could observe the old assignment and a later read after B commits could observe the new baseline/profile target, allowing the explicitly asserted forbidden hybrid
PUBLIC_TEST_SEAM_ADDED = no
REAL_POSTGRES = yes
```

The deterministic event order asserted by the test is
`mutation-begin → mutation-held → resolver-start → snapshot-captured →
mutation-release → mutation-committed → resolver-release`. The resolver result
is asserted to be the complete old tuple, the post-commit result is asserted
to be the complete new tuple, the hybrid is explicitly rejected, and the
instrumentation asserts exactly one resolver SQL statement in the race.
The focused real-PostgreSQL test passed 6/6. `SKIP_ONLY = 0`,
`TAUTOLOGICAL = 0`, and `PADDING = 0` for the P7.3 test delta.

### Attempt-2 QA and gate state

- `pnpm format:check`: PASS.
- `pnpm lint`: PASS; Bridge guard included.
- `pnpm typecheck`: PASS.
- Exact `pnpm test`: 1,127 passed, 0 failed, 0 skipped.
- Focused bootstrap unit: 16 passed.
- Focused simulated-extension-client unit: 40 passed.
- Focused corrected P7.3 PostgreSQL integration: 6 passed.
- `pnpm openapi:check`: PASS; 67 operations.
- `pnpm bridge:guard`: PASS.
- Attempt-2 PostgreSQL container was created only for this correction and was
  removed by its exact name; no new volume was used and none remains.
- `FULL_REGRESSION = NOT YET RUN`.
- `INDEPENDENT_REVIEW_2 = PENDING`.
- `REMOTE_ACCEPTANCE = PENDING`.

Roadmap remains `P7.3 ACTIVE / LOCAL CANDIDATE`. Attempt 2 is a blocked
correction candidate, not a product acceptance or publication.

## Attempt-3 provenance correction — 2026-09-11

Technical ID:
`PRODUCT-CONTROL-PLANE-P7_3-ATTEMPT3-PROVENANCE-AUTHORITY-CORRECTION-2026-09-11`

Attempt-1 independent review remains preserved as:

```text
INDEPENDENT_REVIEW_1 = FAIL
CRITICAL = 0
HIGH = 0
MEDIUM = 2
LOW = 0
```

Attempt-2 remains preserved as:

```text
P7.3-TEST-002 = CLOSED
P7.3-EVIDENCE-001 = BLOCKED pending authority correction
```

Attempt-3 closes only the provenance finding. The correction uses:

```text
GITHUB_CANONICAL_RUN = 34487778764
GITHUB_CANONICAL_SHA = 3fcc8becfe697554594a480c311d729fa1f2b73e
GITHUB_CANONICAL_PNPM_TEST = 1113 passed / 0 failed / 0 skipped
CLEAN_EXACT_LOCAL_BASE = 1113 passed / 0 failed / 0 skipped
CURRENT_CANDIDATE_EXACT_PNPM_TEST = 1127 passed / 0 failed / 0 skipped
P7_3_COLLECTED_UNIT_DELTA = +14
P7.3-EVIDENCE-001 = CLOSED
```

The exact canonical GitHub run checked out the exact SHA, used Node `24.20.0`,
pnpm `10.34.5`, `pnpm install --frozen-lockfile`, and the `pnpm test` step.
The root command expands to `pnpm -r test && pnpm bridge:guard`. Its unit
package arithmetic is recorded in
`P7_2_TEST_COUNT_PROVENANCE_CORRECTION_2026-09-11.md`; it totals `1113` and
does not include `1475` integration cases or `69` E2E cases. The candidate
unit delta is exactly two newly collected seven-case unit files: `+14`. The
new PostgreSQL file is integration-only.

Historical `1169 / 1173` root cause remains `UNKNOWN`. Those observations are
preserved and are not erased, but they are no longer used as the exact
canonical baseline because the exact canonical remote execution and clean
exact-base reproduction both independently establish `1113`.

Attempt-3 is evidence/provenance correction only. Product code and the
Attempt-2 real PostgreSQL concurrency correction are unchanged. The
concurrency proof remains `6 passed / 0 failed / 0 skipped`, with two
independent connections and transactions, deterministic barriers, actual
overlapping mutation/read, coherent old/new tuples, an explicitly forbidden
hybrid tuple, one production resolver SQL statement, no public test seam, and
real PostgreSQL.

Attempt-3 focused QA:

```text
FORMAT = PASS
LINT = PASS
TYPECHECK = PASS
EXACT_UNIT = 1127 passed / 0 failed / 0 skipped
BOOTSTRAP = 16 passed
SIMULATED_EXTENSION_CLIENT = 40 passed
P7_3_REAL_POSTGRESQL = 6 passed / 0 failed / 0 skipped
OPENAPI_CHECK = PASS (67 operations; SHA256 52f43a45720929b45c4350442537320c298f84023b583735f42e3eb1378459f2)
BRIDGE_GUARD = PASS
```

Truthful gate state remains:

```text
FULL_REGRESSION = NOT YET RUN
INDEPENDENT_REVIEW_2 = PENDING
REMOTE_ACCEPTANCE = PENDING
P7 = ACTIVE
P7.3 = ACTIVE / LOCAL CANDIDATE
P7.4 = PLANNED
P7.3 DONE = NO
P7.3 REMOTE ACCEPTED = NO
```

No migration 0015, P7.4 admin API/RBAC, P8 Health implementation, Bridge
runtime diff, provider call, executable remote profile expansion, second
signing plane, request profile override, assignment override, or caller cohort
seed was added. Provider calls remain `0`.

## Attempt-4 stale OpenAPI regression pin correction — 2026-09-11

Technical ID:
`PRODUCT-CONTROL-PLANE-P7_3-ATTEMPT4-STALE-OPENAPI-REGRESSION-PIN-CORRECTION-2026-09-11`

The full regression from Attempt 3 found exactly one failure in the live
P5.7 regression suite. The failure was a stale current-artifact SHA assertion,
not a historical-evidence mismatch:

```text
FULL_REGRESSION_ATTEMPT_1 = FAIL
REASON = stale current OpenAPI SHA assertion in legacy P5.7 integration regression test
TOTAL = 1481
PASSED = 1480
FAILED = 1
SKIPPED = 0
STALE_FILE = server/integration/p5-7-p5-final-acceptance.integration.test.ts
OLD_EXPECTED_OPENAPI_SHA = eec29f87be0b1309be5021fdd3c0e38ec90bea2add9978f2c4b439c7f79e88e4
CURRENT_ACCEPTED_P7_3_OPENAPI_SHA = 52f43a45720929b45c4350442537320c298f84023b583735f42e3eb1378459f2
CORRECTION = live regression pin updated to current OpenAPI artifact SHA
HISTORICAL_P5_7_EVIDENCE = UNCHANGED
```

The P5.7 assertion still reads the live `openapi/openapi.json`, counts its
HTTP operations, computes its SHA-256, and compares it with one exact value.
It was not weakened to a wildcard, pattern, or multiple accepted hashes. The
OpenAPI artifact itself was not changed by Attempt 4.

Attempt-4 focused and full recheck:

```text
P5_7_FOCUSED = 80 passed / 0 failed / 0 skipped
P7_3_REAL_POSTGRESQL_FOCUSED = 6 passed / 0 failed / 0 skipped
EXACT_UNIT = 1127 passed / 0 failed / 0 skipped
FULL_REGRESSION_ATTEMPT_4 = 1481 passed / 0 failed / 0 skipped
FULL_REGRESSION_ARITHMETIC = 1475 base + 6 P7.3 delta = 1481
OPENAPI_CHECK = PASS (67 operations; SHA256 52f43a45720929b45c4350442537320c298f84023b583735f42e3eb1378459f2)
```

Attempt-4 changes only the live stale-hash regression authority and this
evidence append. Product code, contracts, resolver, client, detector,
OpenAPI artifact, migrations, Bridge, and provider-call state are unchanged.
The current migration range remains `0000..0014`; migration `0015` is absent;
provider calls remain `0`.

The historical P5.7 evidence remains unchanged, including the OpenAPI SHA
that was correct when P5.7 was accepted. The live test source is current
regression authority and therefore advances its exact pin after the
intentional P7.3 contract change.

Truthful gate state remains:

```text
FULL_FINAL_REGRESSION = NOT YET COMPLETED
REMOTE_ACCEPTANCE = PENDING
P7 = ACTIVE
P7.3 = ACTIVE / LOCAL CANDIDATE
P7.4 = PLANNED
P7.3 DONE = NO
P7.3 REMOTE ACCEPTED = NO
SAFE_TO_RESUME_FINAL_FULL_REGRESSION = YES
```

## Attempt-5 through Attempt-8 E2E parity correction — 2026-09-11

Attempt-5 corrected the bootstrap E2E semantic expectation to preserve the
normalized detected context `{ family: "chat", surface: "page", variant: null }`
and expect `UNAVAILABLE / UNSUPPORTED_DETECTED_AI`. The first verification was
blocked by a PostgreSQL reset deadlock.

Attempt-6 preserved that expectation and hardened only the E2E reset harness:
one atomic `TRUNCATE ... RESTART IDENTITY CASCADE`, the existing reset table
set, PostgreSQL SQLSTATE `40P01` retry only, at most three reset attempts, and
50ms/100ms backoff. Playwright remains `retries = 0` and `workers = 1`. The
incomplete P7 reset-table coverage was reviewed as non-causal and was not
broadened.

Attempt-7 proved the seven P7 hierarchy/profile tables were empty after
migrations, API startup, and reset, with no preceding E2E state write. It
reproduced the root cause: production `main.ts` injects
`BootstrapAiResolutionService`, while the E2E API harness omitted it and
therefore selected `BootstrapService` fallback behavior. This is finding
`P7.3-E2E-HARNESS-002`, classified as
`E2E_API_HARNESS_PRODUCTION_PARITY_DEFECT`; it is not a production product,
BootstrapService, or AI resolver defect.

Attempt-8 made the single parity correction in
`server/e2e/support/api-harness.ts`. It uses the same
`BootstrapAiResolutionService` class, the same
`createBootstrapAiResolutionRepository(database)` PostgreSQL repository
factory, the existing E2E `DatabaseRuntime`, and the same fifth
`BootstrapService` constructor argument position as production. No resolver
logic, stub, fake profile, special `chat/page` branch, product source,
contract, migration, OpenAPI, simulated client, or Bridge source was changed.

The focused verification used one new disposable `postgres:18.0` container,
loopback-only binding, no Docker volume, and the reused Playwright 1.62.1
browser. After migration and before tests, all seven P7 tables were zero:

```text
ai_adapters = 0
ai_surfaces = 0
ai_variants = 0
adapter_profiles = 0
adapter_profile_revisions = 0
adapter_profile_assignments = 0
adapter_profile_assignment_revisions = 0
```

Exact command:

```text
PRODUCT_CONTROL_PLANE_E2E=1 DATABASE_URL=<fresh loopback e2e database> \
PLAYWRIGHT_BROWSERS_PATH=/root/.cache/ms-playwright \
pnpm exec playwright test e2e/bootstrap.spec.ts --config e2e/playwright.config.ts
```

The complete bootstrap spec passed `17 / 17`, with `0 failed`, `0 skipped`,
and Playwright retries `0`. The strict signed-snapshot test returned exactly:

```text
status = UNAVAILABLE
reason = UNSUPPORTED_DETECTED_AI
detected = chat/page/null
```

The actual PostgreSQL resolver path is proven by the unchanged construction
chain from production `main.ts` through the E2E harness to
`createBootstrapAiResolutionRepository(database)`, the real empty P7
hierarchy, and the resolver-derived `UNSUPPORTED_DETECTED_AI` result. Thus
`AI_RESOLUTION_SERVICE_INVOKED = YES`,
`POSTGRES_RESOLVER_PATH_INVOKED = YES`, and
`EMPTY_HIERARCHY_RESULT = UNSUPPORTED_DETECTED_AI`; no fake resolver or test
seam was added. No `40P01` retry occurred during this run
(`RESET_DEADLOCK_RETRIES_OBSERVED = 0`).

Attempt-8 gates:

```text
FORMAT = PASS
LINT = PASS
TYPECHECK = PASS
OPENAPI_CHECK = PASS (67 operations; SHA256 52f43a45720929b45c4350442537320c298f84023b583735f42e3eb1378459f2)
BRIDGE_GUARD = PASS
MIGRATION_RANGE = 0000..0014
MIGRATION_0014_SHA256 = 4a12aa34d6be16648fc6cd12b4f3de04f3cce0f3abd6938918905dfa2c471558
MIGRATION_0015 = ABSENT
PROVIDER_CALLS = 0
FULL_69_E2E = NOT YET RUN AFTER ATTEMPT8
INDEPENDENT_REVIEW_3 = PENDING
LOCAL_ACCEPTANCE = NO
REMOTE_ACCEPTANCE = PENDING
```

The exact disposable container was removed after the focused run. No
Attempt-8 container, volume, or web server remains on ports 3100, 3200, or
3300. Roadmap state remains `P7 ACTIVE`, `P7.3 ACTIVE / LOCAL CANDIDATE`, and
`P7.4 PLANNED`; no local acceptance or DONE state was recorded.

## Final local acceptance — 2026-09-11

This section closes the final local P7.3 gate without removing any prior
attempt or review history above.

### Final chronology

1. Attempt 1 implemented the P7.3 bootstrap AI resolution candidate.
2. Attempt 1 review identified the retained provenance and concurrency
   findings.
3. Attempt 2 corrected test provenance and added the real PostgreSQL
   concurrency proof.
4. Attempt 3 closed the provenance correction.
5. Independent Review 2 passed after the Attempt 3/4 review cycle.
6. The first full integration regression exposed one stale OpenAPI hash
   authority failure.
7. Attempt 4 corrected the OpenAPI pin without changing the OpenAPI artifact.
8. The first E2E environment run was blocked by environment/resource setup.
9. Attempt 5 corrected the semantic expectation and was interrupted by a
   PostgreSQL reset deadlock.
10. Attempt 6 added bounded `40P01` reset hardening and recorded the
    `NO_PROFILE` observation.
11. Attempt 7 proved the empty-state/root-cause path and identified the E2E
    harness production-parity defect.
12. Attempt 8 corrected E2E harness production parity by injecting the real
    `BootstrapAiResolutionService` and PostgreSQL resolver.
13. Independent Review 3 passed with findings `C0 / H0 / M0 / L0`.
14. The one authorized final full E2E run passed `69 / 0 / 0`.

### Final executable authorities

```text
FORMAT = PASS
LINT = PASS
TYPECHECK = PASS
UNIT = 1127 passed / 0 failed / 0 skipped
FULL_INTEGRATION = 1481 passed / 0 failed / 0 skipped
MIGRATION_REHEARSAL_1 = PASS / PASS
MIGRATION_REHEARSAL_2 = PASS / PASS
BUILD = PASS
FULL_E2E = 69 passed / 0 failed / 0 skipped
PLAYWRIGHT_RETRIES = 0
RESET_DEADLOCK_RETRIES_OBSERVED = 0
STRICT_BOOTSTRAP_TEST = PASS
STRICT_BOOTSTRAP_STATUS = UNAVAILABLE
STRICT_BOOTSTRAP_REASON = UNSUPPORTED_DETECTED_AI
OPENAPI = PASS
OPENAPI_OPERATIONS = 67
OPENAPI_SHA256 = 52f43a45720929b45c4350442537320c298f84023b583735f42e3eb1378459f2
BRIDGE = PASS
INDEPENDENT_REVIEW_2 = PASS
INDEPENDENT_REVIEW_3 = PASS
INDEPENDENT_REVIEW_3_FINDINGS = 0 material
FULL_FINAL_REGRESSION = PASS
LOCAL_EXECUTABLE_ACCEPTANCE = PASS
LOCAL_P7_3_ACCEPTANCE = PASS
REMOTE_P7_3_ACCEPTANCE = PENDING
PROVIDER_CALLS = 0
```

The strict bootstrap result was `UNAVAILABLE / UNSUPPORTED_DETECTED_AI` for
the normalized `chat/page/null` detected context. The final run used the real
production-parity `BootstrapAiResolutionService` and the real PostgreSQL
resolver path. The bounded reset helper observed zero successful deadlock
retries; this is separate from Playwright retries, which remained zero.

Migration authority remained unchanged:

```text
MIGRATION_RANGE = 0000..0014
MIGRATION_0014_SHA256 = 4a12aa34d6be16648fc6cd12b4f3de04f3cce0f3abd6938918905dfa2c471558
MIGRATION_0015 = ABSENT
```

The final E2E database was a fresh test-only `postgres:18.0` resource bound
only to loopback port 55460, started empty, with no Docker volume. The reused
Playwright 1.62.1 browser cache was used; no dependency or browser install
was performed. The final run left zero containers, zero volumes, and zero web
servers. The pre-existing non-ignored `server/test-results/.last-run.json`
was preserved.

Disk availability was `8,811,646,976` bytes at gate start,
`8,811,405,312` bytes immediately before E2E, and `8,795,148,288` bytes at
end. The main dirty checkout at `c21d612bb3bd09e3b8a5a41ebd1562ace1cf2b9e`
was unchanged.

### Final local state

The pre-documentation Attempt 8 staged tree remained
`1591e3c2778c159b93aeabfd2e3fcd586310f89c`. Only this evidence update and the
ROADMAP status update were made afterward. P7.3 is therefore
`ACTIVE / LOCAL ACCEPTED / REMOTE ACCEPTANCE PENDING`; P7.3 is not marked DONE,
and P7.4/P8 work was not started. Remote P7.3 acceptance remains pending.
