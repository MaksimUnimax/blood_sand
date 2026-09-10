# P7.1 AI adapter registry local evidence - 2026-09-09

## Authority and current status

- Execution host: Easyscript (root@78.17.68.165).
- Canonical branch: feature/product-control-plane-server-2026-09-04.
- P6 = DONE / FINAL ACCEPTED.
- P7 = ACTIVE.
- P7.1 = CORRECTION CANDIDATE / REMOTE ACCEPTANCE PENDING.
- P7.2 = PLANNED / NOT STARTED.
- P7.3-P7.6 = PLANNED.
- P8 = PLANNED.
- P9 = PLANNED.
- P14 = PLANNED.
- P7.2_STARTED = NO.
- This document records local evidence and independent review history. It does
  not claim remote acceptance.

The pre-existing VPS checkout was not used as authority. In particular, local
HEAD c21d612bb3bd09e3b8a5a41ebd1562ace1cf2b9e was not used as the P7.1 base.
The current correction was reconstructed in fresh detached worktrees from the
exact canonical AFC commit described below.

## Attempt 1

- Tree: e8dc9602958660852a7d337611dcf78db5262e59.
- Local status: P7_1_LOCAL_ACCEPTANCE_PASS.
- Independent final status: FAIL.
- Not committed. Not pushed.

Material findings were:

1. The create path trusted caller-provided contentSha256 / fingerprint.
2. A fresh integration regression found an E08 date-fixture failure, so the
   previous integration PASS evidence was incorrect.

Low findings were:

3. The ORM and SQL combined-size invariants did not match.
4. E08 used a fixed future calendar date.

## Attempt 2

- Historical tree on the d5c/f22 content base:
  a4b42ff463afe474f8abd61b54b9f173909bfe1f.
- Local status: P7_1_ATTEMPT_2_LOCAL_ACCEPTANCE_PASS.
- Second independent substantive review: all product, security, database, and
  test corrections verified.
- Final review status: P7_1_ATTEMPT2_FINAL_REVIEW_FAIL.
- Not committed. Not pushed.

Attempt 2 corrections were:

- fingerprint removed from caller create input;
- the normal database repository computes the fingerprint;
- the normal repository does not accept a caller fingerprint;
- a false caller fingerprint cannot be persisted through the normal app path;
- the persisted hash matches canonical content plus compatibility;
- the database fingerprint uses Model B;
- the ORM/SQL combined-size invariant is aligned;
- E08 uses an execution-clock-relative future;
- E08 product behavior is unchanged.

The only remaining material finding in the second independent final review was
that the frozen evidence document was zero bytes. Attempt 2 is not described as
remotely accepted.

## Retained fingerprint and determinism review

The second independent substantive review recorded:

- CREATE_INPUT_CONTAINS_TRUSTED_FINGERPRINT = NO
- CALLER_CAN_PROVIDE_CONTENT_SHA256 = NO
- CALLER_CONTENT_SHA_FIELD_ACCEPTED = 0
- NORMAL_REPOSITORY_COMPUTES_FINGERPRINT = YES
- NORMAL_REPOSITORY_ACCEPTS_CALLER_FINGERPRINT = NO
- NORMAL_APPLICATION_FALSE_HASH_PERSISTED = 0
- PERSISTED_FINGERPRINT_MATCHES_CANONICAL = YES
- HASHED_CONTENT_EQUALS_PERSISTED_CONTENT = YES
- HASHED_COMPATIBILITY_EQUALS_PERSISTED_COMPATIBILITY = YES
- POST_HASH_MUTATION_WINDOW = NO
- Fingerprint model: B.
- Algorithm: SHA-256.
- Determinism, content, compatibility, and order: PASS.

The UTF-8 boundary results were:

- 65535 accepted.
- 65536 accepted.
- 65537 rejected.

## Retained migration, database, and security review

- Migration: 0013_p7_1_adapter_registry_profile_foundation.sql.
- Migration SHA-256:
  9291008cb5cf6d42fe15b7c824f2048821680104b85a50639df716a014d4098b.
- Existing migrations 0000..0012 unchanged.
- Migration 0014 absent.
- Database hard invariants: PASS.
- Published immutability: PASS.
- Retired immutability: PASS.
- Parent cascade protection: PASS.
- Strict profile security: PASS.

The closed profile schema rejects JavaScript, eval, module URLs, arbitrary URLs,
methods, headers, authentication/token fields, provider operations, shell
commands, oversized selector references, too many fallbacks, unknown
strategies, and unknown top-level properties. The retained negative-matrix
counters were all zero, including:
PROFILE_JS_FIELD_ACCEPTED=0, PROFILE_EVAL_FIELD_ACCEPTED=0,
PROFILE_REMOTE_MODULE_ACCEPTED=0, PROFILE_ARBITRARY_URL_ACCEPTED=0,
PROFILE_ARBITRARY_METHOD_ACCEPTED=0, PROFILE_ARBITRARY_HEADER_ACCEPTED=0,
PROFILE_AUTH_FIELD_ACCEPTED=0, PROFILE_PROVIDER_OPERATION_ACCEPTED=0,
UNKNOWN_STRATEGY_ACCEPTED=0, UNBOUNDED_PROFILE_ARRAY=0,
UNBOUNDED_PROFILE_STRING=0, RECURSIVE_ARBITRARY_PROFILE_OBJECT=0,
CROSS_ADAPTER_BINDING_ACCEPTED=0, CROSS_SURFACE_BINDING_ACCEPTED=0,
CROSS_PROFILE_REVISION_BINDING_ACCEPTED=0, PUBLISHED_REVISION_UPDATE_ACCEPTED=0,
PUBLISHED_REVISION_DELETE_ACCEPTED=0, and
PUBLISHED_REVISION_DEMOTION_ACCEPTED=0.

## Retained E08 and regression history

- E08: dynamic relative future.
- E08 run 1: PASS.
- E08 run 2: PASS.
- P6.4 file 113/113: PASS.

Different runs reported different unit totals; both results are retained
without speculation about the cause:

Attempt-2 local correction run:

- UNIT_TOTAL = 1110.
- UNIT_FAIL = 0.

Second independent full review:

- UNIT_TOTAL = 1169.
- UNIT_FAIL = 0.

Second independent authoritative regression:

- NODE: v24.20.0.
- PNPM: 10.34.5.
- FORMAT: PASS.
- LINT: PASS.
- TYPECHECK: PASS.
- UNIT_TOTAL: 1169.
- UNIT_FAIL: 0.
- INTEGRATION_FILES: 33.
- INTEGRATION_TOTAL: 1463.
- INTEGRATION_FAIL: 0.
- MIGRATION_RUN_1: PASS.
- MIGRATION_RUN_2: PASS.
- OPENAPI_OPERATIONS: 67.
- OPENAPI_SHA256:
  eec29f87be0b1309be5021fdd3c0e38ec90bea2add9978f2c4b439c7f79e88e4.
- OPENAPI: PASS.
- BRIDGE_GUARD: PASS.
- BUILD: PASS.
- E2E_TOTAL: 69.
- E2E_FAIL: 0.
- E2E_SKIP: 0.
- E2E_RETRY: 0.
- TEMPORARY_CWD_OVERRIDE: NO.
- FULL_REGRESSION: PASS.

## Two distinct canonical movements

The historical P6 final was:

- f22d5d741b8a2cdf40bf0ae775251d3b8d59e925.

The history-only no-op movement was:

- f22 -> 201b3498, which added accidental x;
- 201b3498 -> d5c5095a, which removed x;
- the resulting d5c tree equalled the f22 tree.

A real unrelated canonical documentation change then occurred:

- afc27bc74f83abc727e18a347dec4db0cd5351f7.
- Parent: d5c5095a95b91b6b455902b677fab9351efd7e2e.
- Added:
  tooling/llm-api-bridges/ozon-seller/ALICE_BRIDGE_HARDENING_CURRENT.md.

The Alice bridge hardening ledger is unrelated to P7.1 and is preserved
unchanged. Its canonical AFC blob is
4c90efafed9b437843cc9d149cbdd8e9116ba8a4. AFC is not same-tree equivalent
to d5c.

## Attempt 3 correction and rebase proof

Attempt 3 performs only:

1. mechanical preservation and rebase of the accepted Attempt-2 payload onto
   current canonical AFC; and
2. correction of this empty evidence document.

The exact Attempt-2 frozen payload applies to AFC. Its reconstructed P7 path
set contains 21 paths and has zero intersection with the AFC Alice ledger
path. Every non-evidence P7 blob and mode matches historical Attempt 2.
Attempt 3 modifies only:

server/docs/P7_1_AI_ADAPTER_REGISTRY_LOCAL_EVIDENCE_2026-09-09.md

Therefore:

- ATTEMPT3_P7_PRODUCT_CODE_CHANGE = NO.
- ATTEMPT3_P7_TEST_CHANGE = NO.
- ATTEMPT3_P7_MIGRATION_CHANGE = NO.
- CURRENT_CANONICAL_UNRELATED_FILE_PRESERVED = YES.
- FUTURE_IMPLEMENTATION_PARENT =
  afc27bc74f83abc727e18a347dec4db0cd5351f7.

The attempt-3 freeze is relative to AFC, not d5c, f22, or c21. The patch
contains tracked changes and the archive contains new P7.1 files, with no path
overlap. Fresh reconstruction is required to reproduce the final candidate
tree twice.

## Verdict

The evidence is non-empty, valid UTF-8, and contains substantive recorded history. Attempt 1
history, Attempt 2 history, the zero-byte evidence rejection, and the AFC
canonical rebase are explicitly retained. This document does not claim remote
acceptance in the candidate itself; the remote acceptance is recorded below.

## Remote acceptance

- IMPLEMENTATION_SHA = 8c540e958edc9f560a8078b135fa583c0152dd3d.
- IMPLEMENTATION_PARENT = afc27bc74f83abc727e18a347dec4db0cd5351f7.
- IMPLEMENTATION_TREE = aaa9ec6b2aedc0ad44fce0b92f09aa4e449bb55a.
- PUSH = FAST_FORWARD.
- SERVER_CI_RUN_ID = 34438296018.
- SERVER_CI_HEAD_SHA = 8c540e958edc9f560a8078b135fa583c0152dd3d.
- SERVER_CI_CONCLUSION = success.
- REMOTE_READBACK = PASS.
- REMOTE_SECURITY_READBACK = PASS.
- OPENAPI = 67 / unchanged hash
  eec29f87be0b1309be5021fdd3c0e38ec90bea2add9978f2c4b439c7f79e88e4.
- MIGRATION = 0000..0013.
- 0013 SHA256 = 9291008cb5cf6d42fe15b7c824f2048821680104b85a50639df716a014d4098b.
- 0014 = absent.
- BRIDGE_CHANGED_BY_P7_1 = NO.
- ALICE_LEDGER_PRESERVED = YES.

Final evidence verdict:

- P7.1 = DONE / REMOTE ACCEPTED.
- P7 = ACTIVE.
- P7.2 = NEXT / NOT STARTED.
