# P7.5 Admin AI operations UX — local evidence

TECHNICAL_ID: `PRODUCT-CONTROL-PLANE-P7_5-RESUME-AFTER-P7_4-CORRECTION-2026-09-12`

## Authority and recovery

- P7.4 correction: `6fec907528fe97a5873c8b3e93fd79c461d11942`, tree `8978ff660377d191c7106e777e554238dec726b9`.
- P7.4 correction CI #89: Server CI, completed SUCCESS.
- P7.4 final docs: `0020be254d399772f0262e5e6fa9b64a826a5674`, tree `946d493ba6c62e602fbc9f0a50f37ca62c1fe834`.
- Final docs CI #90: run `34675631623`, job `103504880516`, push event, exact SHA above, completed SUCCESS. Required lint, format, typecheck, unit, integration, migration, OpenAPI, bridge, build, Chromium, E2E, and cleanup steps were successful.
- P7.4 state: DONE / REMOTE ACCEPTED / POST-ACCEPTANCE CORRECTION ACCEPTED.
- Old blocked WIP worktree: `/opt/product-control-plane-src/blood_sand-p7.5-attempt1`, historical head `60e42cc07a95afffdec92b7c6f0fac9a4f855d45`.
- Old WIP snapshot: patch 13,424 bytes, SHA256 `a74bb2be439f05e181c2d997a575d5a2447bc1d175624a8f9197270ad2b75456`; archive 22,402 bytes, SHA256 `6a242dd88a7ebca879cd951235c1cab38d552f921a5695b72e9aeb036f7cb858`; manifest SHA256 `dfa990d6f60349a8772e0dd6c40be0e1eb118a624b8dce34954d3bfce21b1dab`.
- Old WIP initial witness: index tree `529fa02f398cc94008763ddb9ad5565e169dcc46`, status hash `6890204304cbf8801f39cf4716a4fa7728e80a33bafc38d46372141b34f7bb7a`, staged diff hash `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`, unstaged diff hash equal to patch SHA, untracked hash `d116f90bd3189294252e7fe116ca8031088bdd41122fa1cf64babbcef7f183a3`.
- New resume worktree: `/opt/product-control-plane-src/blood_sand-p7.5-resume-attempt1`, corrected base head/tree exactly as above, WIP replay conflicts `0`.
- Replay changed paths: `server/apps/admin/app/admin-ui.tsx`, `server/apps/admin/app/styles.css`, `server/apps/admin/lib/control-plane-route.test.ts`, `server/apps/admin/lib/control-plane-route.ts`, `server/e2e/support/api-harness.ts`, `server/e2e/support/database.ts`.
- Replay added paths: `server/apps/admin/app/admin-ai.tsx`, `server/apps/admin/app/ai/assignments/page.tsx`, `server/apps/admin/app/ai/profiles/page.tsx`, `server/apps/admin/app/ai/registry/page.tsx`, `server/apps/admin/lib/admin-ai.test.ts`, `server/e2e/admin-ai.spec.ts`. Archived generated test-results were not replayed.
- Reconciliation: stale nested rollout routes were changed to corrected flat routes; assignment mutation response handling does not consume internal IDs, seeds, or reasons; duplicate historical workspace code was retained only where valid and reconciled to the same contract; no P7.4 backend code was changed.

## Implementation and validation

- BFF arithmetic: 49 existing admin tuples + 35 exact P7 tuples + 2 OTP tuples = 86; wildcard proxy absent. UUID and positive revision validation plus encoded/path traversal guards are covered.
- Focused unit: admin affected suite `152 passed / 0 failed / 0 skipped`.
- Focused E2E: `server/e2e/admin-ai.spec.ts`, real admin Next app + same-origin BFF + Control Plane API + fresh PostgreSQL, `3 passed / 0 failed / 0 skipped`. Covered Owner/Support/Billing isolation, registry hierarchy, profile lifecycle, assignment DIRECT/ROLLOUT/percentage/pause/resume/complete, stale review invalidation, and seed non-exposure.
- Full unit: corrected base `1147`; P7.5 delta `60`; expected `1207`; actual `1207`; failed `0`; skipped `0`; arithmetic `1147 + 60 = 1207`.
- Full integration: corrected base `1487`; delta `0`; expected `1487`; actual `1487`; failed `0`; skipped `0`; arithmetic `1487 + 0 = 1487`.
- Static gates: format PASS, lint PASS, typecheck PASS, OpenAPI check PASS, bridge guard PASS, build PASS; full E2E NOT RUN.
- OpenAPI: 102 operations, SHA256 `9563c57d622a7eee2197ea9a0508852f7c7a0aef87bbb9dddf5570cc83b50cc7`, unchanged.
- Migrations: `0000..0014`; migration 0014 SHA256 `4a12aa34d6be16648fc6cd12b4f3de04f3cce0f3abd6938918905dfa2c471558`; 0015 absent.
- Disk gate passed at required points with at least `8,589,934,592` bytes available. Docker test container and anonymous volume were removed; leftovers `0/0`.

## Security and scope review

- Permission source is `/v1/admin/me`; no client-side role reconstruction. Support controls are read-only; BillingReadonly AI navigation is hidden.
- Same-origin BFF, strict exact allowlist, no wildcard proxy, no arbitrary upstream URL, safe forwarded headers, no-store, existing session/elevation and CSRF preserved.
- HttpOnly session not read; localStorage/sessionStorage/IndexedDB not used; no raw server-error rendering, secret logging, automatic mutation retry, optimistic domain update, seed rendering, stored-reason read, executable profile capability, Health, manual override, Bridge, or provider calls.
- Main dirty checkout C21 witness unchanged: head `c21d612bb3bd09e3b8a5a41ebd1562ace1cf2b9e`, tree `79e7265da73da34983b8e4f9d0c6fec583bbe50f`, status hash `00e4f8f472538ee3a70a52f9f600096ca989616bc5dd7308f1b9dadde712d552`.
- Old blocked WIP unchanged: YES (final witness is recorded in the freeze manifest).
- P7.4 backend, OpenAPI, migrations, P7.3, Bridge, P7.6, and P8 changes: none. Provider calls: `0`.

## Freeze status

The exact candidate tree, explicit staging list, patch/archive hashes, and
double reconstruction results are recorded in the external candidate
manifest alongside the freeze artifacts. No commit or push was performed.
ROADMAP: P7 ACTIVE; P7.1–P7.4 DONE / REMOTE ACCEPTED; P7.5 ACTIVE / LOCAL CANDIDATE; P7.6 PLANNED; P8 PLANNED.

Independent Review: PASS. FULL_E2E: PASS (72/72, 0 failed, 0 skipped, first run only).

## FINAL LOCAL ACCEPTANCE — 2026-09-12

BASE_HEAD = `0020be254d399772f0262e5e6fa9b64a826a5674`

BASE_TREE = `946d493ba6c62e602fbc9f0a50f37ca62c1fe834`

REVIEWED_P7_5_TREE = `86a9c0053c5ab9b80d63c2273edaaf37ec1183c1`

P7_4_FINAL_DOCS_CI = PASS (Server CI #90; run `34675631623`; job `103504880516`)

INDEPENDENT_REVIEW1 = PASS

REVIEW_FINDINGS = CRITICAL 0; HIGH 0; MEDIUM 0; LOW 1

LOW description: the immutable Attempt1 manifest listed 3 focused unit files although the actual 152-test focused run used 4. This is bookkeeping-only and non-blocking; product behavior is unaffected.

OLD_ATTEMPT1_MANIFEST_REWRITTEN = NO

FINAL_LOCAL_MANIFEST_USES_CORRECT_FOUR_FOCUSED_UNIT_FILES = YES

Correct four focused unit files:

- `apps/admin/lib/admin-ai.test.ts`
- `apps/admin/lib/admin-ui.test.ts`
- `apps/admin/lib/control-plane-route.test.ts`
- `apps/admin/lib/control-plane.test.ts`

UNIT = 1207 / 0 / 0

INTEGRATION = 1487 / 0 / 0

FOCUSED_UNIT = 152 / 0 / 0

FOCUSED_E2E = 3 / 0 / 0

PRE_P7_5_E2E_BASELINE = 69

P7_5_NEW_E2E_TESTS = 3, derived by Playwright `--list` collection from the exact candidate

EXPECTED_FULL_E2E = 72

FULL_E2E = 72 / 72 / 0 / 0

FULL_E2E_FIRST_RUN_ONLY = YES

FULL_E2E_COMMAND = `pnpm test:e2e`

FULL_E2E_START = `2026-09-12T09:49:56+03:00`

FULL_E2E_DURATION_SECONDS = 306

FULL_E2E_RESOURCE = fresh disposable `postgres:18.0`, loopback `127.0.0.1:32779`, container `product-control-plane-p7.5-final-e2e-pg`, tmpfs-backed, no persistent volume

FULL_E2E_PRODUCT_TREE = `86a9c0053c5ab9b80d63c2273edaaf37ec1183c1`

Playwright inventory was collected without browser execution using a temporary config importing the candidate configuration with `webServer` and `globalSetup` disabled. Exact file counts were: `activation.spec.ts` 4; `admin-ai.spec.ts` 3; `admin-safety.spec.ts` 6; `admin.spec.ts` 31; `bootstrap.spec.ts` 17; `commercial.spec.ts` 8; `security.spec.ts` 3. Total: 72.

FORMAT = PASS

LINT = PASS

TYPECHECK = PASS

OPENAPI_CHECK = PASS

BRIDGE_GUARD = PASS

BUILD = PASS

BFF = 51 + 35 = 86

P7_4_BACKEND_CHANGED = NO

OPENAPI_CHANGED = NO

MIGRATION_CHANGED = NO

P7_3_CHANGED = NO

P7_6_STARTED = NO

P8_STARTED = NO

BRIDGE_CHANGED = NO

PROVIDER_CALLS = 0

LOCAL_P7_5_ACCEPTANCE = PASS

REMOTE_P7_5_ACCEPTANCE = PENDING

SAFE_FOR_PUBLICATION = PENDING_MAIN_CHATGPT_ACCEPTANCE

The prior Review1 witness reported `8,637,632,512` bytes free. This final-local acceptance gate ran with Node `v24.20.0` and pnpm `10.34.5`; its first local reading was `8,637,534,208` bytes, the reading immediately before E2E was `8,636,723,200` bytes, and the reading after exact E2E cleanup was `8,599,728,128` bytes. The hard pre-E2E floor `8,589,934,592` was met. No safe additional disposable resource was removed before E2E. The exact final E2E container and its task-created resources were removed after the run; Docker leftovers for this task are `0` containers and `0` volumes. The inventory and E2E generated `.last-run.json` was removed after evidence capture.

The reviewed candidate tree remained unchanged through E2E. Only the three permitted documentation files were changed after the review: this evidence file, ADR-0035, and ROADMAP. No implementation, test, BFF, OpenAPI, migration, or Bridge file was changed after Review1. No commit or push was performed.
