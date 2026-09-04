# P3.3 local acceptance evidence — 2026-09-04

**Status: ACCEPTED — P3.3 DONE**

## Continuity and attempt history

Canonical branch: `feature/product-control-plane-server-2026-09-04`; accepted
base and local HEAD: `d6fae7cd4f49d70eac7b8dda9e189f317dc31052`.
The older `feature/product-control-plane-server-2026-09-03` repeatedly collided
with unrelated `7c0f38eca2c7089566d7bb2a2f47584be5cfa171`; no unrelated-history
merge, rebase, or cherry-pick occurred. The dirty P3.3 candidate was preserved.

Attempts 1–7 respectively covered remote movement, foundation, publication,
read catalog/source validation, old-branch block, dedicated-branch real proof
and three defect fixes, and the 68-test corruption/source expansion. Attempt 8
closed the four remaining cases and ran exhaustive local acceptance.

## Implementation and proof

ADR-0011, SemVer and Chromium comparators, compatibility resolver, rollout
cohort algorithm, source/manifest hashing, publication adapter, read catalog,
and `resolveP3BootstrapPolicy` are present. Attempt-6 regressions pass: content
hash excludes `publishedAt`; rollout validation does not require non-schema
`rolloutKey`; linked-rollout SQL qualifies `target_kind`.

Real PostgreSQL integration: **72 passed, 0 failed, 0 skipped, 0 todo**;
four new physical tests since 68. Categories include publication (4), concurrency
(covered by publication suite), audit rollback (3), catalog corruption (4),
source validation (10), resolution (7), and historical reproducibility.
Source validation proves duplicate policy/feature/rollout IDs, two globals,
duplicate browser scope, global browser minimum, maintenance/version invariants,
wrong contract, two defaults, non-feature rollout, two same-feature rollouts,
unpinned baseline, cross-feature graph, unknown key, and DB-only non-Ed25519
rejection. Every publication rejection had zero config/source/audit side effects.
Catalog corruption fails closed for invalid compatibility/feature SemVer, stable
machine IDs, and semantic source graphs; DB-impossible states are DB-rejected.

Publication, concurrent policy/feature-rule/rollout revisions, audit rollback
(including zero config orphan links), resolver states, typed failures, and exact
historical-source reproducibility passed.

## Migration and schema

Historical SHA-256 values for 0000–0006 are unchanged:
`9a7cde34d8b38667ccedd630cd2dc40697b2ee5c922927bb08f93f242bc5af56`,
`0544b377425ee3a6ebc9dc21ebb402febe27852c7bf93666f4154fbc0f723b2f`,
`f6f302d14574a7f9dff3675b8b330fbbf90a4d69387041b9fdf8fbe0454ce449`,
`ffe1c20c37c92f1529251ff21921c5a3a1a946a09c661b162e8458c37c08c9b6`,
`38774ebb870f9d233ddc51d2b8d24dd361ae2274920d0f7b0286eae333273e1d`,
`6b95b4dae57e356804a83d1d34ff03286fb5465ff3d214a4b40ae70150283d21`, and
`37aa137364c9327108ea0db8ca25cba7cbc99c0d1649b959499a4fa87824dd1f`.

Fresh PostgreSQL 18.0 migration applied 0000–0007 with journal count 8; the
second normal migrator run was idempotent. A normal 0000–0006 historical run
followed by the full folder applied only 0007 and retained the P3.2 signing/audit
fixture. No 0008 exists. The six P3.3 tables have six immutable triggers over
six protected tables, rejecting UPDATE and DELETE (12 conceptual protections),
with seed length, percentage, shape, target-kind FK, revision uniqueness, and
FEATURE_RULE-only config-link checks; zero P3.3 JSON/JSONB targeting columns.
P3.2 remains nine tables, nine dual-event triggers, public Ed25519 SPKI only,
no private-key column, and unchanged 0006.

## Runtime/API/E2E

Node `v24.20.0`, pnpm `10.34.5`, and PostgreSQL `18.0` were used. Frozen install,
lint, formatting, typecheck, 133 unit tests, DB-down and DB-up test/build gates,
migration, OpenAPI check, and bridge guard passed. P3.1 crypto (12/12), P3.2
regressions, comparators, compatibility, rollout vectors, hashes, P3.3 domain,
and resolver behavior pass.

OpenAPI has 14 routes; generation run 1 and 2 both SHA-256
`3fd8ad9a61c8146c314d86912a47f1a154cf1eea6d73c3ad9dabfde52f2eeef0`, with
byte equality and no `/v1/bootstrap`. Playwright 1.62.1 Chromium revision 1234
(Chrome for Testing 151.0.7922.34) launched and closed cleanly; T4 passed 7/7,
0 failed, 0 skipped, 0 retries.

## Integrity, security, and final remote state

The fresh validation copy matched the dirty candidate manifest and hashes:
793 files; both manifest SHA-256 values were
`8ade5a602f9ac1ea39199c1a42989d021215f885214fa348ff59e64588d1b432`.
Boundary scans found no real config private key, DB private-key column,
production config-signing secret/wiring, Ozon path, raw seller data, AI
conversation storage, executable config, arbitrary URL/method/headers, Bridge
runtime import, production database URL, or tracked SSH private key. Test-only
in-memory keys remain permitted.

Remote acceptance completed on canonical branch
`feature/product-control-plane-server-2026-09-04`. Implementation commit
`6c8114761ba083ee7bec5c420824950709eacb24` passed push-triggered Server CI
run [33858689916](https://github.com/MaksimUnimax/blood_sand/actions/runs/33858689916).
The remote review found only expected P3.3 paths, no unrelated history, no P3.4
implementation, and no Bridge runtime change. Migration state is exactly
0000–0007, latest `0007_p3_3_features_rollouts.sql`, with no 0008. OpenAPI
remains 14 routes at SHA-256
`3fd8ad9a61c8146c314d86912a47f1a154cf1eea6d73c3ad9dabfde52f2eeef0`, without
`/v1/bootstrap`.

Host Node, PostgreSQL, pnpm, MySQL, protected services, and product deployment
were not changed. Roadmap is P0/P1/P2 done, P3 active, P3.1/P3.2/P3.3 done,
P3.4 next, P3.5–P3.7 and P4–P15 planned.
