# P7.2 profile lifecycle and assignment — local evidence

Technical ID: `PRODUCT-CONTROL-PLANE-P7.2-CORRECTION-ATTEMPT-4-EVIDENCE-TEST-PROVENANCE-2026-09-10`

Status: `P7.2 ACTIVE / LOCAL CANDIDATE / FINAL EVIDENCE CORRECTION`.
P7.2 is not remotely accepted. This Attempt-4 change is an evidence-only
correction; product code, tests, migration 0014, ADR-0032, P3, and Bridge are
unchanged.

## Authority and freeze preservation

- Execution host: `Easyscript` (`root@78.17.68.165`).
- Canonical branch: `feature/product-control-plane-server-2026-09-04`.
- Canonical remote HEAD before Attempt 4: `b415db7c6f3c5c7db4a0c7a56791335bbd0f2a87`.
- Canonical tree: `22bb0aaf0978ba579216f0c3f05bb6dca6b78ca1`.
- Attempt 1 tree: `34f19c17eb61de6fa68e648856ec97f3be00bb5a`.
- Attempt 2 tree: `7b91cf07e57d9bd44beb334eb81a0991cb44407a`.
- Attempt 3 tree: `a0bc789da21949515e240505872fe52c38bcfa35`.
- Attempt 1, Attempt 2, and Attempt 3 patch/archive/manifest freezes are
  preserved byte-for-byte.

## Attempt history

Attempt 1 had local status `P7_2_LOCAL_ACCEPTANCE_PASS` but independent result
`P7_2_INDEPENDENT_REVIEW_FAIL`, with four HIGH findings: candidate-transition
payload mutation bypass, non-DRAFT direct revision insertion, exported raw
lifecycle write bypass, and the RETIRE/ASSIGNMENT race. The earlier evidence
finding also recorded an MEDIUM overclaim about direct-SQL coverage and zero
defects. Attempt 1 was not accepted.

Attempt 2 reconstructed tree `7b91cf07e57d9bd44beb334eb81a0991cb44407a` and
had local status `P7_2_ATTEMPT2_LOCAL_ACCEPTANCE_PASS`; the second independent
review failed on the public cohort-seed HIGH, a documentation MEDIUM, and a
test-quality LOW. The supported `createAssignmentScope` API still accepted
`internalTestCohortSeed`, the documentation contradicted that boundary, and the
correction integration test had a tautological assertion and fixed-label type
assertion. Attempt 2 was not accepted.

Attempt 3 reconstructed tree `a0bc789da21949515e240505872fe52c38bcfa35` and
had local status `P7_2_ATTEMPT3_LOCAL_ACCEPTANCE_PASS`. Its final independent
review result was `P7_2_ATTEMPT3_FINAL_REVIEW_FAIL`: the substantive
implementation, security, database, race, seed-authority, OpenAPI, and full
regression gates passed, but one LOW evidence issue remained because exact
unit-test totals in this document were stale. Attempt 3 therefore was not
fully accepted; this Attempt 4 correction records that finding without
rewriting the result.

## Attempt 3 substantive review evidence retained

The final independent review verified:

- `PUBLIC_CREATE_ASSIGNMENT_INPUT_HAS_SEED_FIELD = NO`.
- `PUBLIC_TEST_SEED_OVERRIDE = NO`.
- `SUPPORTED_PUBLIC_SEED_OVERRIDE_IMPORTABLE = NO`.
- `TYPED_CALLER_SEED_OVERRIDE_ACCEPTED = NO`.
- `CALLER_CAN_PROVIDE_COHORT_SEED = NO`.
- `RUNTIME_SEED_ALIAS_CONTROL_COUNT = 0`.
- `UNSAFE_CALLER_CONTROLLED_SEED_WRITE_PATHS = 0`.
- `COHORT_SEED_SOURCE = node:crypto randomBytes(32)`.
- `COHORT_SEED_LENGTH = 32`.
- `SEED_STABLE_ACROSS_ASSIGNMENT_HISTORY = YES`.
- `P7_P3_BUCKET_EQUIVALENCE = PASS`.
- `TAUTOLOGICAL_NEW_TESTS = 0`.
- `PADDING_NEW_TESTS = 0`.
- `MIGRATION_0014_SHA256 = 4a12aa34d6be16648fc6cd12b4f3de04f3cce0f3abd6938918905dfa2c471558`.
- `INITIAL_CANDIDATE_ACCEPTED = 0`.
- `INITIAL_PUBLISHED_ACCEPTED = 0`.
- `INITIAL_RETIRED_ACCEPTED = 0`.
- `FORGED_DRAFT_PROMOTED = 0`.
- `RAW_LIFECYCLE_BYPASS_EXPORTED = NO`.
- `ASSIGNMENT_AFTER_WAIT_SEES_RETIRE_COMMIT = YES`.
- `RETIRE_AFTER_WAIT_SEES_ASSIGNMENT_COMMIT = YES`.
- `RETIRED_REVISION_BECAME_CURRENT_ASSIGNMENT = 0`.
- `RETIRED_REVISION_BECAME_LATEST_TARGET = 0`.
- `ORPHAN_ASSIGNMENT_AFTER_RETIRE_RACE = 0`.
- `DEADLOCK_OBSERVED = 0`.

P7.2 adds no bootstrap profile resolution, HTTP/admin route, P7 admin
permission, P7.3/P8/P9/P14 work, Bridge change, or Alice-ledger change. P3
rollout selection remains the accepted `selectRolloutCandidateV1` primitive;
its remote-config and rollout behavior are unchanged.

## Test-count provenance correction

Earlier reports genuinely recorded these observations under their then-recorded
provenance:

- `EARLIER_BASE_REPORTED = 1110` (Attempt 1/local-era base).
- `EARLIER_ATTEMPT1_REPORTED = 1112` (Attempt 1 candidate).
- `EARLIER_ATTEMPT2_REPORTED = 1112` (Attempt 2 candidate).
- `EARLIER_ATTEMPT3_LOCAL_REPORTED = 1113` (Attempt 3 local).

The final independent review then reran the exact `pnpm test` command from clean
reconstructed trees and reproducibly measured:

- `BASE_EXACT_PNPM_TEST_TOTAL = 1169`.
- `BASE_EXACT_PNPM_TEST_FAIL = 0`.
- `ATTEMPT3_EXACT_PNPM_TEST_TOTAL = 1173`.
- `ATTEMPT3_EXACT_PNPM_TEST_FAIL = 0`.

The exact cause of the discrepancy between the earlier lower counts and these
fresh clean exact-command observations was not established and is not inferred.
For commit acceptance, the final clean exact-command observation is
authoritative. The candidate delta under that command is `1173 - 1169 = 4`
additional passing unit/component tests; this numerical delta alone does not
prove coverage.

## Final independent regression retained

The final independent review ran the fresh full product regression against the
exact Attempt-3 tree and obtained:

- `NODE = v24.20.0`.
- `PNPM = 10.34.5`.
- `FORMAT = PASS`.
- `LINT = PASS`.
- `TYPECHECK = PASS`.
- `UNIT_TOTAL = 1173`; `UNIT_FAIL = 0`.
- `INTEGRATION_FILES = 35`; `INTEGRATION_TOTAL = 1475`; `INTEGRATION_FAIL = 0`.
- `MIGRATION_RUN_1 = PASS`; `MIGRATION_RUN_2 = PASS`.
- `OPENAPI = PASS`.
- `BRIDGE_GUARD = PASS`.
- `BUILD = PASS`.
- `E2E_TOTAL = 69`; `E2E_FAIL = 0`; `E2E_SKIP = 0`; `E2E_RETRY = 0`.
- `TEMPORARY_CWD_OVERRIDE = NO`.
- `FULL_REGRESSION = PASS`.

OpenAPI independently recomputed to `OPERATIONS = 67` with SHA-256
`eec29f87be0b1309be5021fdd3c0e38ec90bea2add9978f2c4b439c7f79e88e4`
(64 characters). Migration range remains `0000..0014`; `0015` is absent, and
migration 0014 has SHA-256
`4a12aa34d6be16648fc6cd12b4f3de04f3cce0f3abd6938918905dfa2c471558`.

## Current roadmap and acceptance state

- `P7 = ACTIVE`.
- `P7.1 = DONE / REMOTE ACCEPTED`.
- `P7.2 = ACTIVE / LOCAL CANDIDATE / FINAL EVIDENCE CORRECTION`.
- `P7.3 = PLANNED / NOT STARTED`.
- `P7.4-P7.6 = PLANNED`.
- `P8/P9/P14 = PLANNED`.
- `P7_2_FALSELY_MARKED_DONE = NO`.
- `P7_2_FALSELY_MARKED_REMOTE_ACCEPTED = NO`.
- `P7_3_STARTED = NO`.

Attempt 4 changes only this evidence document. The resulting delta from the
exact Attempt-3 candidate is one path, with zero product-code, test-code,
migration, ADR, roadmap, lockfile, P3, and Bridge deltas. Every other
candidate blob and mode remains identical to Attempt 3.

Documentation checks for this correction are: `DOCUMENTATION_OVERCLAIMS = 0`,
`DOCUMENTATION_MATERIAL_OMISSIONS = 0`, `TEST_COUNT_PROVENANCE_TRUTHFUL = YES`,
`EVIDENCE_VALID_UTF8 = YES`, and `MALFORMED_OPENAPI_HASH_IN_EVIDENCE = 0`.
The Attempt-4 candidate is local evidence only; no commit, push, remote CI, or
remote acceptance was performed.

Local Attempt-4 findings: `CRITICAL = 0`, `HIGH = 0`, `MEDIUM = 0`,
`MATERIAL_MEDIUM = 0`, `LOW = 0`.
## Remote acceptance finalization

The exact Attempt-4 candidate was committed and pushed fast-forward-only:

- `IMPLEMENTATION_SHA = 868e0873a6dcf22f2f81e475fe91687f17dd132d`.
- `IMPLEMENTATION_PARENT = b415db7c6f3c5c7db4a0c7a56791335bbd0f2a87`.
- `IMPLEMENTATION_TREE = 3d2b636b1d460b69ceb5ec1fb17f30de247aa42f`.
- `IMPLEMENTATION_PUSH = FAST_FORWARD`.
- `IMPLEMENTATION_CI_WORKFLOW = Server CI`.
- `IMPLEMENTATION_CI_RUN_ID = 34485896603`.
- `IMPLEMENTATION_CI_EVENT = push`.
- `IMPLEMENTATION_CI_HEAD_SHA = 868e0873a6dcf22f2f81e475fe91687f17dd132d`.
- `IMPLEMENTATION_CI_STATUS = completed`.
- `IMPLEMENTATION_CI_CONCLUSION = success`.
- `IMPLEMENTATION_CI_FAILED_MANDATORY_JOBS = 0`.
- `IMPLEMENTATION_CI_SKIPPED_MANDATORY_JOBS = 0`.

Fresh GitHub readback from the exact implementation commit passed. The
remote branch head, parent, tree, and changed path set matched the accepted
candidate; the remote P7.2 ADR, lifecycle/assignment repository, schema,
migration, and tests were present. Remote migration 0014 is
`4a12aa34d6be16648fc6cd12b4f3de04f3cce0f3abd6938918905dfa2c471558`, the
migration range is `0000..0014`, `0015` is absent, and OpenAPI remains 67
operations with SHA-256
`eec29f87be0b1309be5021fdd3c0e38ec90bea2add9978f2c4b439c7f79e88e4`.

Remote acceptance preserved the final boundaries: draft-only initial profile
revisions, database candidate freeze, published/retired immutability,
append-only assignment history, `pg_advisory_xact_lock` target
serialization, P3 `selectRolloutCandidateV1` reuse, server-generated
`node:crypto randomBytes(32)` cohort seeds, no public seed override, no raw
lifecycle bypass export, and no profile JSON or raw cohort seed in audit.
No OpenAPI, bootstrap AI wire, bootstrap profile resolution, config-release
profile source, signed profile distribution, HTTP route, P7 permission,
Bridge, or Alice-ledger change was present; P7.3, P8, P9, and P14 were not
started. Remote findings: `CRITICAL = 0`, `HIGH = 0`, `MEDIUM = 0`,
`MATERIAL_MEDIUM = 0`, `LOW = 0`.

Remote finalization records:

- `REMOTE_IMPLEMENTATION_READBACK = PASS`.
- `MIGRATION_0014_SHA256 = 4a12aa34d6be16648fc6cd12b4f3de04f3cce0f3abd6938918905dfa2c471558`.
- `OPENAPI_OPERATIONS = 67`.
- `OPENAPI_SHA256 = eec29f87be0b1309be5021fdd3c0e38ec90bea2add9978f2c4b439c7f79e88e4`.
- `ACCEPTED_FINAL_UNIT = 1173 / 0`.
- `ACCEPTED_FINAL_INTEGRATION = 1475 / 35 files / 0`.
- `ACCEPTED_FINAL_E2E = 69 / 0 fail / 0 skip / 0 retry`.
- `CANONICAL_BASE_EXACT_PNPM_TEST = 1169 / 0`.
- `P7.2 = DONE / REMOTE ACCEPTED`.
- `P7_2_REMOTE_ACCEPTED = YES`.
- `P7_3_STARTED = NO`.

The finalization commit is documentation-only and records no product-code,
test-code, or migration change.

## Post-acceptance provenance pointer — 2026-09-11

The historical `1169 / 1173` observations remain preserved as historical local
observations. For exact canonical `pnpm test` regression authority, use
`P7_2_TEST_COUNT_PROVENANCE_CORRECTION_2026-09-11.md`, which reconciles the
exact-SHA remote CI observation and clean exact-base reproduction at `1113`.
This pointer does not alter `P7.2 DONE / REMOTE ACCEPTED` or any product
verdict.
