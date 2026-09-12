# P8.1 Final Local Acceptance — 2026-09-12

## Result

`P8_1_LOCAL_ACCEPTANCE = PASS`

`P8_1_PRODUCT_ACCEPTED = YES`

`P8_1_REVIEW2_ACCEPTED = YES`

`P8_1_E2E_ACCEPTED = YES`

`P8_1_LOCAL_STATE = ACTIVE / LOCAL ACCEPTED / REMOTE ACCEPTANCE PENDING`

`P8_1_REMOTE_ACCEPTANCE = PENDING`

`P8.2_STATE = PLANNED`

The accepted product tree is
`3445f39ea0ebcc5f9901830b6180dba48ad8801a`, reconstructed from canonical
base `412bcf005ebff6628c302f12d9ce211525cd5723`.

## Review and QA authority

- Review1 findings: R1-HIGH-001, R1-MEDIUM-001, and R1-MEDIUM-002 — all closed.
- Review2: `PASS`; CRITICAL/HIGH/MEDIUM/LOW: `0/0/0/0`.
- Focused Health: `33 / 33 / 0 / 0`.
- Unit: `1240 / 1240 / 0 / 0`.
- Integration: `1487 / 1487 / 0 / 0`.
- Format: `PASS`.
- Lint: `PASS`.
- Bridge guard: `PASS`.
- Typecheck: `PASS`.
- OpenAPI: `PASS`; `102` operations; SHA-256
  `9563c57d622a7eee2197ea9a0508852f7c7a0aef87bbb9dddf5570cc83b50cc7`.
- Build: `PASS`.
- Fresh full E2E: `72 / 72` passed, `0` failed, `0` skipped, `0` retries.
- E2E run count: `1`.

No focused, unit, integration, format, lint, bridge, typecheck, OpenAPI, or
build gate was rerun as part of this final local-acceptance step. Their stated
authorities above were preserved from the accepted Attempt3 evidence.

## E2E environment

The full E2E used Node `v24.20.0` and pnpm `10.34.5`, with a fresh disposable
PostgreSQL `18.0` instance. The database used
`product_control_plane_test` and `product_control_plane_ci`, a loopback-only
dynamic port, and tmpfs-backed data with no persistent Docker volume. The
exact task container was removed after the run. Task-created `server/test-results`
was removed, ports `3100`, `3200`, and `3300` were free, and no task containers
or volumes remained.

## Resource blocker chronology and recovery

- Original free space was `8450215936` bytes against the
  `8589934592`-byte hard floor.
- Attempt2 `server/node_modules` had already been deleted before this resume
  and was not restored. Attempt3 `node_modules` and protected caches were not
  touched.
- The bounded inventory recorded `/root/.npm/_cacache` at `213483520` bytes;
  `/root/.npm/_logs` at `53248` bytes; no `/root/.cache/node-gyp`; apt `.deb`
  files at `258048` bytes; Attempt1 at `14516224` bytes; and Attempt2 at
  `163725312` bytes.
- Only `/root/.npm/_cacache` was deleted after exact path, realpath,
  non-symlink, and scope validation. Free space after recovery was
  `8663638016` bytes. Allocated bytes recovered were `213483520` (the
  filesystem available-byte increase was `213475328`).
- No pnpm store, Playwright cache, Corepack pnpm, Git object, Docker image,
  Docker volume, Attempt1, Attempt2, or Attempt3 source was deleted or pruned.
- A first disposable PostgreSQL preflight exposed an image-level anonymous
  volume; that exact task container and volume were removed before E2E, then
  the container was recreated with tmpfs over the PostgreSQL data root and
  revalidated with no Docker volume mount.

## Product and boundary invariants

- Migrations: `0000..0014` exactly; migration `0014` SHA-256
  `4a12aa34d6be16648fc6cd12b4f3de04f3cce0f3abd6938918905dfa2c471558`.
- Health states: `6`.
- Health levels: `6`.
- Health contours: `13`, unique and exact baseline catalog.
- H0 profile-candidate boundary: accepted; P7 validator reused; no executable
  or transport fields admitted.
- Product provider calls: `0`.
- Live AI browser calls: `0`.
- `PRODUCT_SEMANTIC_DELTA_AFTER_REVIEW2 = 0`.
- P8.2 was not started.

## Local freeze posture

The final documentation candidate is isolated in a detached worktree created
from the exact canonical base and reconstructed from the immutable Attempt3
freeze. Attempt3 itself remained unchanged. ADR-0036 remained unchanged.
The active main C21 checkout, local remote-tracking ref, and preservation
artifacts remained unchanged.

`COMMIT = NO`

`PUSH = NO`

`SAFE_FOR_PUBLICATION_AUTHORIZATION = YES`

`SAFE_FOR_COMMIT = NO`

`SAFE_FOR_PUSH = NO`
