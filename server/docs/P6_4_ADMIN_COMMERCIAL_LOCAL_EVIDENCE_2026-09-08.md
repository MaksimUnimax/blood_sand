# P6.4 admin-commercial local evidence — 2026-09-08

Status: ACCEPTED — P6.4 DONE

Technical ID: `PRODUCT-CONTROL-PLANE-P6.4-OPENAPI-AUTHORITY-RECONCILIATION`

Attempt: `6`

## Historical forensic record

- Attempt 1: `COUNT_INTEGRITY_FAILED` because fake/tautological/schema-padding
  evidence was rejected.
- Attempt 2: `P6_4_PRODUCT_DEFECT`; typed `REJECTED.code` was discarded at the
  HTTP boundary.
- Attempt 3: typed error mapping was corrected; cursor product defect then
  found.
- Attempt 4: cursor defects were corrected; honest real-PG evidence was only
  9 cases, so `COUNT_INTEGRITY_FAILED`.
- Attempt 5: behavioral suite successfully rebuilt with 112 meaningful / 113
  physical real-PG cases; all functional gates passed and the candidate was
  frozen. The acceptance executor returned `FAILED` solely because an
  erroneous packet OpenAPI digest ended in `...e88a4`.

Attempt-5 failure classification:

- `ATTEMPT_5_FAILURE_CLASS=ACCEPTANCE_CONTROL_VALUE_ERROR`
- `P6_4_PRODUCT_DEFECT=NO`
- `TEST_DEFECT=NO`
- `COUNT_INTEGRITY_FAILED=NO`

Attempt 6 is the authoritative OpenAPI reconciliation and local acceptance
reclassification. The invalid packet value is retained here only as forensic
history; it is not used as an expected contract value.

The former 119 cases are not counted as evidence.

## Attempt 6 acceptance reconciliation

- `P6_4_OPENAPI_ROUTES=67`.
- `P6_4_OPENAPI_SHA=eec29f87be0b1309be5021fdd3c0e38ec90bea2add9978f2c4b439c7f79e88e4`.
- `OPENAPI_REPRODUCIBLE=YES`; two independent generations produced the exact
  same authoritative SHA.
- Unit total: `1011`; meaningful P6.4 unit/API: `150`.
- Real-PG physical: `113`; meaningful: `112`.
- Inventory: `A/B/C/D/E/F/G/H=14/20/20/10/15/14/10/9`.
- Full integration: `1456`; count integrity: `PASS`.
- Migrations: `0000..0012`; migration `0012` is unchanged and `0013` is
  absent.
- E2E retained from the frozen candidate: `32/32 PASS`.
- Known product fixes: `PASS`.
- Product/test byte freeze against the Attempt-5 candidate: `PASS`.

## Frozen implementation and runtime

- Base HEAD and required remote: `3b195f0a97f33598e7bfb68becc1d95b1bd0de13`.
- Node: `v24.20.0`; pnpm: `10.34.5`.
- Product-source freeze: 19 changed non-test/non-doc files recorded in
  `/var/backups/product-control-plane/git/p6-4-product-source-freeze-at-start.manifest.txt`.
  Final file set and bytes are unchanged: `YES` / `YES`.
- New product change after freeze: `NO`.
- Third product defect: `NO`.
- Typed rejection mapping: `PLAN_DRAFT_STALE`, `PRICE_DRAFT_STALE`, and
  `ACCOUNT_ENTITLEMENT_OVERRIDE_STALE` all map publicly to `409
  ADMIN_STATE_STALE`.
- Cursor schemas: all five typed (`YES`); plan, price, definition, override,
  and compatibility cursor repository scoping: `YES`.

## Unit/API audit

- Baseline: 861.
- Physical P6.4 unit/API delta: 150 (61 controller + 89 package).
- Meaningful P6.4 unit/API: 150.
- Full unit total: 1,011 passed, 0 failed, 0 skipped/todo.
- Tautological unit tests: 0.
- Semantic unit padding: 0.
- Crypto gate: 12/12.
- Regression suites: controller 61/61; admin-commercial package 89/89.

## Real-PG matrix

The authoritative ledger is
`P6_4_ADMIN_COMMERCIAL_MATRIX_LEDGER_2026-09-08.md`. It contains every
`A01..H09` ID, status, title-derived behavior, and entrypoint.

- PostgreSQL 18 physical P6.4 instances: 113.
- Distinct meaningful real-PG behaviors: 112.
- Inventory: `A=14, B=20, C=20, D=10, E=15, F=14, G=10, H=9`.
- HTTP-backed: 110.
- DB-adapter-only: 3 (`A13`, `A14`, `H05`), used only for deterministic
  transaction-time authorization race coordination.
- Omitted: 1 (`C07`), because accepted P4 semantics permit drafting against an
  unpublished plan revision; the candidate rejection branch is inapplicable.
- Targeted run: 113/113 passed; no skip/todo.
- Real admin auth, sessions, CSRF, production controllers/services/adapters,
  persisted audit rows, rollback triggers, and final PostgreSQL state were
  exercised. Concurrency cases used deterministic coordination, never sleeps.
- Audit rollback cases proved domain and audit writes share a transaction.

## Anti-padding audit

`COUNT_INTEGRITY=PASS`.

- Schema-existence cases counted: 0.
- Tautological tests: 0.
- Exact duplicate rows: 0.
- Semantic padding: 0.
- Count-inflation helpers: 0.
- UUID-only variants: 0.
- Renamed duplicates: 0.
- No matrix-ID generation loop and no no-exception-only assertion is used.

## Full integration and gates

- Accepted baseline: 1,343.
- Actual P6.4 physical integration instances: 113.
- Actual full integration: 1,456 (`1,343 + 113`), 0 failed, 0 skipped/todo.
- Retained accepted counts: P6.3 `72`; P6.2 `106`; P6.1 `77`.
- P5 counts: `80/152/120/116/102/90/94`.
- P4 counts: `38/52/48/52/21/30`.
- DB-down gates: frozen-lockfile install, lint, format:check, typecheck,
  test, openapi:check, bridge:guard, and build all passed.
- DB-up gates: lint, format:check, typecheck, test, full integration,
  db:migrate twice, openapi:check twice, bridge:guard, and build all passed.
- E2E: 32/32 passed, 0 failed, 0 skipped, 0 retries.

## Contract and migration invariants

- OpenAPI: 67 method tuples; authoritative actual SHA-256
  `eec29f87be0b1309be5021fdd3c0e38ec90bea2add9978f2c4b439c7f79e88e4`;
  generated twice with exact match. The invalid packet expectation was
  `eec29f87be0b1309be5021fdd3c0e38ec90bea2add9978f2c4b439c7f79e88a4`;
  no product-source or generated-contract output was changed to manufacture a
  digest.
- Migrations: `0000..0012`; `0013` absent; migration `0012` SHA-256
  `9eafa0e106b55ccae61f8b4d254cdebdad45d490ede49c75cd6ca18700c7a679`;
  applied twice successfully.

## Architecture and roadmap

- P4 command reuse: `YES`.
- Shared current-admin authorization and transaction-time RBAC: `YES`.
- Direct plan/price/override/compatibility mutation SQL in the admin layer:
  `NO`.
- Duplicate audit: `NO`.
- Compatibility publication is revision-only and does not auto-activate,
  create config releases, mutate bootstrap/rollout, or expose signing keys.
- Admin UI, real provider, bridge changes, P6.5 work, and P7 work: `NO`.
- Roadmap after remote acceptance: P6.1 DONE, P6.2 DONE, P6.3 DONE, P6.4
  DONE, P6.5 NEXT, P6.6 PLANNED; P7–P15 PLANNED. Payment go-live remains
  DEFERRED.

## Remote final acceptance

`P6_4_ACCEPTANCE=PASS`.

- Required base and both remote start reads: `3b195f0a97f33598e7bfb68becc1d95b1bd0de13`.
- Implementation commit: `87ab8d6030cf29d469e1731fc24b001bee942ea6`; tree
  `60343ca0a8fed9af6368ee17eb895066c65f1fdb`; parent is the required base;
  exact message is `feat(server): add P6.4 admin commercial operations`.
- Implementation push: fast-forward from the required base.
- Exact-head Server CI: run `34223963495`,
  https://github.com/MaksimUnimax/blood_sand/actions/runs/34223963495,
  `push`, exact implementation head, `success`. Unit `1011`; P6.4 unit/API
  `150`; integration `1456`; P6.4 physical real-PG `113`, meaningful `112`;
  crypto `12/12`; E2E `32/32`; OpenAPI `67` method tuples; migrations
  `0000..0012`, no `0013`.
- Authoritative OpenAPI SHA:
  `eec29f87be0b1309be5021fdd3c0e38ec90bea2add9978f2c4b439c7f79e88e4`.
- Count inventory: `A=14, B=20, C=20, D=10, E=15, F=14, G=10, H=9`;
  `COUNT_INTEGRITY=PASS`; schema padding, tautologies, duplicates, semantic
  padding, UUID-only variants, renamed duplicates, and count inflation are
  all zero.
- Remote GitHub semantic/security review: `REMOTE_P6_4_REVIEW=PASS`;
  critical `0`, high `0`, material medium `0`. Current-admin RBAC is
  rechecked inside each mutation transaction; P4/P3 command and audit
  authorities remain reused and atomic; typed stale mappings and all five
  scoped cursor contracts were verified from remote blobs.
- Compatibility publication is revision-only with
  `REVISION_PUBLISHED_NOT_AUTO_ACTIVATED`; it does not publish config,
  select signing keys, change bootstrap rollout, publish feature rules, or
  disclose signing/config/cohort material. Generic feature-rule
  administration was NOT added by P6.4.
- Bridge path is unchanged; no real payment provider or payment call was
  added and payment go-live remains `DEFERRED`. Admin UI, P6.5, and P7 were
  not started.

## Recovery freeze

The Attempt-5 recovery artifacts remain forensic and were not overwritten:

`/var/backups/product-control-plane/git/blood_sand-p6.4-behavioral-local-accepted.manifest.txt`

A new accepted local recovery freeze was created for Attempt 6 with the exact
Attempt-5 product/test candidate and the evidence-only classification change.
Its patch, untracked archive, manifest, and final staged tree are recorded in
the Attempt-6 recovery manifest.

No commit or push was performed. Worktree remains dirty by design.
