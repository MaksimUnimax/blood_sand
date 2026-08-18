# Ozon live-repair V3E harness manifest

Date: 2026-08-18
Status: test-only harness integrity correction; no production change.

## Production authority

Exact V3 candidate:

`88a20984c55da1f813ca1184bd90089823f51883`

Frozen Step-4 base:

`4ce190c8bbdc438dcdf407abbe4dbecd846736df`

Expected repaired production hashes remain:

- `service_worker.js`: `34a84f66284f5aa5f77b9b7cda23d5ddb2431c7b30114cd5fe927798c31e957a`
- `content_script.js`: `d95d2ca040c37f688d33c2caac8a78d95389b8e7acd41fcf11f8e0b4dc59e001`

## Why V3E exists

V3D exposed a bookkeeping defect in the test materialization report: SHA-256 values for three immutable source harness Git blobs were cyclically associated with the wrong filenames even though the paths, Git blob IDs and byte sizes still identified the correct files.

V3E therefore removes secondary SHA-256 mapping from source identity. The source bytes are verified directly as canonical Git blobs.

Canonical Git blob identity is calculated as:

`SHA1("blob " + byte_length + NUL + bytes)`

## Immutable source harness blobs

Worker actual-path source:

- Git blob: `0da73bdd1bb1608074781bb0c594c7875a4fe3ce`
- repository path: `development/live-repair-quota-countdown/harness/V3_WORKER_ACTUAL_PATH_HARNESS.mjs`

Browser source:

- Git blob: `841429741d5ff9144a8a40506e657dc4392fe37c`
- repository path: `development/live-repair-quota-countdown/harness/V3_BROWSER_COUNTDOWN_HARNESS.mjs`

Regression source remains unchanged:

- Git blob: `57574ef6fdb96a5ed5e0b0a02eec5b5ba99e9be5`
- repository path: `development/live-repair-quota-countdown/harness/V3_REGRESSION_CARRY_FORWARD_HARNESS.mjs`

Direct live Git blob inspection verified that each blob contains the named harness.

## V3E runners

### Worker runner

Path:

`development/live-repair-quota-countdown/harness-v3e/V3E_WORKER_GIT_BLOB_RUNNER.mjs`

Git blob:

`9f0df0c911316fcc8850506937aa10f987cadb3f`

Local SHA-256 before upload:

`6e1222fea50168daae008862e037bf662be272f4b9bd6a5ed485ce59bd6231b7`

Live Git blob matched the locally computed Git blob exactly.

Behavior:

1. Computes Git blob identity from the actual supplied worker source bytes and requires exact `0da73bdd...`.
2. Replaces exactly one test fixture line only:
   - `last=now-64800` -> `last=now-57000`;
   - effective guarded due changes from roughly +200 ms to roughly +8000 ms.
3. Requires exactly one changed source line.
4. Runs `node --check` on the temporary corrected harness.
5. Executes it against the exact V3 candidate.
6. Never edits production.

### Browser runner

Path:

`development/live-repair-quota-countdown/harness-v3e/V3E_BROWSER_GIT_BLOB_RUNNER.mjs`

Git blob:

`d6ba37ab27b5f71b6be1c7dec8b8a82db95fdd83`

Local SHA-256 before upload:

`9beb1416e34d762d4b3587a798364aa5d5a89d3d83395348856085015bd3e17e`

Live Git blob matched the locally computed Git blob exactly.

Behavior:

1. Computes Git blob identity from actual supplied browser source bytes and requires exact `841429741...`.
2. Requires existing Puppeteer or puppeteer-core below the supplied QA project root.
3. Copies exact source bytes into that project root.
4. Recomputes Git blob identity after relocation and requires exact `841429741...` again.
5. Executes exact relocated bytes with existing Puppeteer/CFT.
6. Never installs or updates dependencies and never edits production.

## Local runner checks

Both V3E runner files passed `node --check` before publication.

## Safety

- no V4;
- no production changes;
- no V3 patch changes;
- no real Seller credentials;
- no real Performance credentials;
- no real Ozon requests;
- no real Performance requests;
- no dependency installation/update;
- no operator browser profile.

`REAL_OZON_REQUESTS = 0`

`REAL_PERFORMANCE_REQUESTS = 0`
