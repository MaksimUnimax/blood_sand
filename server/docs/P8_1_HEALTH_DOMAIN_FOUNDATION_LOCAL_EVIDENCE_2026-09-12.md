# P8.1 Health Domain Foundation — Local Evidence — 2026-09-12

## Result and identity

TECHNICAL_ID: `PRODUCT-CONTROL-PLANE-P8_1-ATTEMPT3-RESUME-AFTER-FALSE-REMOTE-ADVANCEMENT-BLOCK-2026-09-12`

STATUS: `P8_1_ATTEMPT3_CORRECTIVE_REWORK`

This is a local Attempt3 corrective candidate, not a commit or push. The
worktree is
`/opt/product-control-plane-src/blood_sand-p8.1-health-foundation-attempt3`.

- BASE / ATTEMPT2_HEAD: `412bcf005ebff6628c302f12d9ce211525cd5723`
- BASE_TREE: `a1392d2ec0f5e1f91d23ea8476a93d6ed9676e0d`
- Node: `v24.20.0`
- pnpm: `10.34.5`
- pnpm implementation: `/root/.cache/node/corepack/v1/pnpm/10.34.5/bin/pnpm.cjs`
- remote branch probe: exact required commit, unchanged
- GitHub API remote head: `412bcf005ebff6628c302f12d9ce211525cd5723`
- GitHub API remote tree: `a1392d2ec0f5e1f91d23ea8476a93d6ed9676e0d`
- local remote-tracking head: `c17a6725b3c5d7dc045591311f30bed4863bc736`
- local tracking matches GitHub: `NO` (non-authoritative local ref)
- local tracking ref action: `NONE`; no fetch or ref repair was performed
- COMMIT: `NO`
- PUSH: `NO`
- P8.2: `NOT STARTED`

## Carried-forward chronology

The following records the prior Attempt2 authority before the final lint
correction:

- EVENT01: P7 remained final accepted; P8.1 Attempt2 used the exact base above.
- EVENT02: the health-domain foundation, suite registry, classifier, H0
  boundary, and health unit fixture were present in the Attempt2 candidate.
- EVENT03: the workspace health importer was reconciled in `server/pnpm-lock.yaml`.
- EVENT04: focused authority passed `24 / 24 / 0 / 0`.
- EVENT05: unit authority passed `1231 / 1231 / 0 / 0`.
- EVENT06: integration authority passed `1487 / 1487 / 0 / 0`.
- EVENT07: initial full format gate failed on six Health files.
- EVENT08: the six Health files received the exact Prettier correction.
- EVENT09: FORMAT_ATTEMPT_2 passed.

## Final correction and static gates

- EVENT10: initial full format gate failed on six Health files.
- EVENT11: six-file Prettier correction was completed; the prior full-format
  authority passed.
- EVENT12: full format gate passed.
- EVENT13: initial lint failed on exactly two unused imports:
  `packages/health/src/catalog.ts` unused `z`, and
  `packages/health/src/types.ts` unused `ProfileKeySchema`.
- EVENT14: exact unused-import correction removed only those two bindings from
  those two files. No schema, validator, export, classifier, test, lockfile,
  or runtime behavior changed.
- EVENT15: final target Prettier write on the two corrected files was unchanged,
  and the final full format validation passed.
- EVENT16: the one lint recheck passed; its nested `pnpm bridge:guard` also
  passed.
- TYPECHECK: `pnpm typecheck` passed on the first execution.
- OPENAPI: `pnpm openapi:check` passed on the first execution; 102 operations,
  SHA-256 `9563c57d622a7eee2197ea9a0508852f7c7a0aef87bbb9dddf5570cc83b50cc7`.
- BUILD: `pnpm build` passed on the first execution.

No focused, unit, or integration test suite was rerun after the non-semantic
lint correction:

- FOCUSED: `24 / 24 / 0 / 0`; FOCUSED_RERUN: `NO`
- UNIT: `1231 / 1231 / 0 / 0`; UNIT_RERUN: `NO`
- INTEGRATION: `1487 / 1487 / 0 / 0`; INTEGRATION_RERUN: `NO`

FULL_E2E: `NOT RUN / DEFERRED TO P8.1 FINAL-LOCAL ACCEPTANCE AFTER INDEPENDENT REVIEW`

## Health-domain authority

- STATES: `HEALTHY`, `DRIFT`, `DEGRADED`, `BROKEN`, `UNKNOWN`, `MAINTENANCE`
- STATE_COUNT: `6`
- LEVELS: `H0`, `H1`, `H2`, `H3`, `H4`, `H5`
- LEVEL_COUNT: `6`
- CONTOURS: `C01_PAGE_IDENTITY`, `C02_CONVERSATION_ROOT`,
  `C03_COMPOSER_ROOT`, `C04_COMPOSER_INPUT`, `C05_SEND_CONTROL`,
  `C06_BUSY_STOP_STATE`, `C07_ASSISTANT_MESSAGE`, `C08_MESSAGE_COMPLETION`,
  `C09_COMMAND_CODE_BLOCK_SURFACE`, `C10_NATIVE_COPY_CONTROL`,
  `C11_CONVERSATION_IDENTITY`, `C12_DELIVERY_INSERTION_PATH`,
  `C13_BLOCKING_STATE`
- CONTOUR_COUNT: `13`
- UNIQUE: `YES`
- LIVE_SELECTORS_STORED: `NO`

The classifier is deterministic and has no LLM, network, database, browser, or
provider authority. MAINTENANCE, UNKNOWN, BROKEN, DEGRADED, DRIFT, and HEALTHY
rules pass, with mixed product precedence `BROKEN > DEGRADED > DRIFT > HEALTHY`.

H0 reuses the P7 validator and does not duplicate the P7 profile schema. The
strict runtime path rejects unknown keys and executable/transport fields,
including `script`, `javascript`, `eval`, `wasm`, `module`, `command`, `shell`,
`filesystemPath`, `url`, `headers`, `credentials`, `providerOperation`, and
`arbitrarySelectorScript`. Profile lifecycle is unchanged.

## Repository and boundary checks

- Migrations: `0000..0014`
- `0014_p7_2_profile_assignments_lifecycle.sql` SHA-256:
  `4a12aa34d6be16648fc6cd12b4f3de04f3cce0f3abd6938918905dfa2c471558`
- `0015_PRESENT`: `NO`
- OpenAPI: `102` operations; exact SHA above; `OPENAPI_CHANGED: NO`
- lockfileVersion: `9.0`
- health importer: present; dependencies exactly the three workspace packages
  plus `zod 4.1.5`
- root package manager: `pnpm@10.34.5`; pnpm engine `>=10.34.5 <11`
- LIVE_BROWSER_CALLS: `0`
- PRODUCT_PROVIDER_CALLS: `0`
- BRIDGE_CHANGED: `NO`
- P7_CHANGED: `NO`
- P9_STARTED: `NO`
- P13_STARTED: `NO`

The active main C21 worktree and the prior Attempt1 worktree were not modified
by this Attempt2 continuation. No persistent toolchain configuration was
changed. Docker left containers: `0`; Docker left volumes: `0`.

## Acceptance posture

- ADR-0036: complete
- ROADMAP: P7 `DONE / FINAL ACCEPTED`; P8 `ACTIVE`; P8.1 `ACTIVE / LOCAL CANDIDATE`;
  P8.2–P8.7, P9, and P13 `PLANNED`
- FREEZE: completed after staging and double reconstruction
- SAFE_FOR_INDEPENDENT_REVIEW: `YES`
- SAFE_FOR_FINAL_LOCAL_ACCEPTANCE: `NO`
- SAFE_FOR_COMMIT: `NO`
- SAFE_FOR_PUSH: `NO`

## Attempt3 corrective rework and Review1 closure

- ATTEMPT2_IMPLEMENTATION: `PASS`
- ATTEMPT2_REVIEW1: `FAIL`
- REVIEW1: `CRITICAL0 / HIGH1 / MEDIUM2 / LOW0`
- ATTEMPT3: `CORRECTIVE REWORK`
- REVIEW1 findings document:
  `server/docs/P8_1_INDEPENDENT_REVIEW1_FINDINGS_2026-09-12.md`
- Reviewed Attempt2 tree: `94a3bb89ce1022723083bb747b2699d38db180b6`

The previous remote-advancement blocker was a false positive caused by the
non-authoritative local remote-tracking ref. GitHub API authority remained at
`412bcf005ebff6628c302f12d9ce211525cd5723`; no remote advancement occurred.

Corrective acceptance:

- R1-HIGH-001: `CLOSED` — fallback recovery requires the exact selected
  fallback result outcome `PASS`; quality cannot override `FAIL`.
- R1-MEDIUM-001: `CLOSED` — complete relational validation precedes every
  `MAINTENANCE` or `UNKNOWN` return.
- R1-MEDIUM-002: `CLOSED` — adversarial and valid precedence cases were added.
- REVIEW1_HIGH_OPEN: `0`
- REVIEW1_MEDIUM_OPEN: `0`

Roadmap remains: P7 `DONE / FINAL ACCEPTED`; P8 `ACTIVE`; P8.1
`ACTIVE / LOCAL CANDIDATE`; P8.2–P8.7 `PLANNED`; P9 `PLANNED`; P13 `PLANNED`.

The required next action is exactly: **INDEPENDENT REVIEW2 OF P8.1 ATTEMPT3.**

## Attempt3 gate readback

- Dependency authority: Node `v24.20.0`; pnpm `10.34.5`; frozen install
  passed; lockfile was not mutated.
- Focused Health inventory: prior `24` plus `9` new tests; expected `33`;
  collected `33`; pass `32`; fail `1`; skip `0`. The sole failure was the
  selected-undeclared-fallback assertion expecting a more specific error label
  before the final validation-order correction. The focused command was run
  exactly once and was not retried.
- Full unit: base `1207`; final Health delta `33`; expected/actual `1240`;
  fail `0`; skip `0`; command passed exactly once. The Health package reported
  `33 / 33` in this full run.
- Integration: fresh `postgres:18.0`, container
  `product-control-plane-p8.1-attempt3-integration-pg`, loopback dynamic port
  `32782`, tmpfs data; collected `1487`; pass `1487`; fail `0`; skip `0`;
  command ran exactly once; container cleanup completed.
- Static: format `PASS`; lint `PASS`; nested bridge guard `PASS`; typecheck
  `PASS`; OpenAPI `PASS`; build `PASS`.
- Resource gate after bounded scratch cleanup: `8,593,231,872` bytes
  available, above `8,589,934,592` required.
- FULL_E2E: `NOT RUN`.

Because the required focused gate recorded one failure and the no-retry rule
forbids rerunning it, this evidence does not claim
`P8_1_ATTEMPT3_CORRECTIVE_REWORK_PASS`; final local acceptance, commit, and push
remain disallowed. Review1’s three findings are nevertheless closed in the
implementation and covered by the final full-unit run, pending independent
Review2.

## Final local acceptance — 2026-09-12

The final local acceptance gate was completed from the immutable Attempt3
freeze. The accepted product tree is
`3445f39ea0ebcc5f9901830b6180dba48ad8801a`, based on canonical
`412bcf005ebff6628c302f12d9ce211525cd5723`.

- Review1 findings: all three closed — R1-HIGH-001, R1-MEDIUM-001, and
  R1-MEDIUM-002.
- Review2: `PASS`; CRITICAL/HIGH/MEDIUM/LOW: `0/0/0/0`.
- Focused Health: `33 / 33 / 0 / 0`.
- Unit: `1240 / 1240 / 0 / 0`.
- Integration: `1487 / 1487 / 0 / 0`.
- Format, lint, bridge, typecheck, OpenAPI, and build: `PASS`.
- Full E2E: `72 / 72 / 0 / 0`; exactly one run, retry `0`.

The E2E used one disposable PostgreSQL `18.0` container on a loopback-only
dynamic port with tmpfs database data. The task container and its task-created
results were removed; no task containers, volumes, or listeners remained.
There were zero provider calls and zero live AI browser calls.

Resource recovery chronology:

- Original free bytes: `8450215936`; hard floor: `8589934592`.
- Attempt2 `server/node_modules` had already been removed before this resume;
  it was not restored and Attempt3 dependencies were preserved.
- Bounded inventory recorded npm content cache `213483520` bytes, npm logs
  `53248` bytes, no node-gyp cache, apt `.deb` files `258048` bytes, Attempt1
  worktree `14516224` bytes, and Attempt2 worktree `163725312` bytes.
- Only `/root/.npm/_cacache` was removed, after exact realpath,
  non-symlink, and scope checks. No pnpm store, Corepack pnpm, Playwright
  cache, worktree, Git object, Docker image, or Docker volume was pruned.
- Free bytes after recovery: `8663638016`; allocated bytes recovered:
  `213483520` (filesystem available-byte delta was `213475328`).
- Attempt2 and Attempt1 historical worktrees were not retired.

Boundary and product readback remained exact: OpenAPI `102` operations with
SHA-256 `9563c57d622a7eee2197ea9a0508852f7c7a0aef87bbb9dddf5570cc83b50cc7`;
migrations `0000..0014`, with migration `0014` SHA-256
`4a12aa34d6be16648fc6cd12b4f3de04f3cce0f3abd6938918905dfa2c471558`;
six states, six levels, and thirteen contours; H0 accepted; provider calls
`0`; live AI browser calls `0`. P8.2 was not started.

`P8_1_LOCAL_ACCEPTANCE = PASS`

`P8_1_REMOTE_ACCEPTANCE = PENDING`

No implementation, test, lockfile, or ADR change was made by this final gate.
Commit: `NO`. Push: `NO`.

## P8.1 publication and remote-acceptance materialization

`FINAL_LOCAL_TREE = 439952da686540ea831cdc56c96bf9c37533ab79`

`PUBLICATION_COMMIT = 19855e2897807fcff81b2488195520ce54919325`

`PUBLICATION_REMOTE_READBACK = PASS`

`PUBLICATION_SERVER_CI = PASS`

`PUBLICATION_CI_RUN = 34697457918`

`PUBLICATION_CI_JOB = 103563280746`

`PUBLICATION_CI_EVENT = push`

`PUBLICATION_CI_EXACT_SHA = YES`

`PUBLICATION_CI_MANDATORY_STEPS = ALL PASS`

`REMOTE_ACCEPTANCE_MATERIALIZATION = IN PROGRESS / DOCS-ONLY CANDIDATE`

`P8_2_STARTED = NO`

The publication commit remains the exact accepted product tree. This appended
section records the start of the docs-only remote-acceptance materialization;
it does not claim the future docs-only commit's Server CI result.
