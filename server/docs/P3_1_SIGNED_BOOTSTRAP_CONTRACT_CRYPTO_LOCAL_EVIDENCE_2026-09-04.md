# P3.1 signed bootstrap contract / crypto — local acceptance evidence

Date: 2026-09-04
Status: **ACCEPTED — P3.1 DONE**

## Base and recovery

- P2 final committed base SHA: `0ca219b078294bd57eb575a0ebf08ae32070237b`.
- Independently supplied remote base SHA: `0ca219b078294bd57eb575a0ebf08ae32070237b`.
- Initial worktree clean: **NO** — the canonical worktree intentionally contained
  the ten-path P3.1 candidate (three modified tracked paths and seven untracked
  source/docs/test paths). It was preserved without reset, clean, rebase, commit,
  or push.
- Attempt 1 original status: `BLOCKED_INFRASTRUCTURE`.
- Attempt 1 correct status: `FAILED / INCOMPLETE LOCAL ACCEPTANCE`; the host
  Node runtime was not an acceptance prerequisite because the environment is
  disposable.
- Recovery patch:
  `/var/backups/product-control-plane/git/blood_sand-p3.1-attempt1-uncommitted.patch`
  — SHA-256 `c1e9525981378a94058e94cb8e90b97e320260b8af312c664094ff6e3528c27a`.
- Recovery untracked archive:
  `/var/backups/product-control-plane/git/blood_sand-p3.1-attempt1-untracked.tar.gz`
  — SHA-256 `53ef9b6acc21fd8f4c596637f5bfc3e1f57cbea1b457c6395281ab58fff1fd09`;
  untracked source/test count: 6.
- Remote-acceptance recovery patch:
  `/var/backups/product-control-plane/git/blood_sand-p3.1-local-accepted-uncommitted.patch`
  — SHA-256 `c1e9525981378a94058e94cb8e90b97e320260b8af312c664094ff6e3528c27a`.
- Remote-acceptance recovery untracked archive:
  `/var/backups/product-control-plane/git/blood_sand-p3.1-local-accepted-untracked.tar.gz`
  — SHA-256 `f5873f9f85f6e91f7843af8ab0900270ced8140808318c36fb689be47245bed1`;
  untracked source/test count: 7.

## Disposable acceptance environment

- Container runtime: Docker Engine `29.1.3` (usable; daemon configuration was
  not changed).
- Node image: `node:24.20.0-bookworm`; verified runtime: `v24.20.0`.
- pnpm provisioned in that container with Corepack: `10.34.5` exactly.
- PostgreSQL image: `postgres:18.0`; verified server: `18.0 (Debian
  18.0-1.pgdg13+3)`.
- PostgreSQL test port: `55432`, published only as `127.0.0.1:55432`.
- The Node container used host networking so the accepted E2E loopback guard
  received only `postgres://product_control_plane_test:***@127.0.0.1:55432/product_control_plane_test`.
- Candidate validation copy was created outside the repository. Its relevant
  source/config/lockfile manifest exactly matched the canonical dirty candidate
  before tests, including `package.json`, lock/workspace files, all changed P3.1
  sources/contracts, ADR-0008, ADR-0009, and ROADMAP.
- Host Node changed: **NO**. Host PostgreSQL installed: **NO**. Host pnpm changed:
  **NO**.

## P3.1 implementation and boundaries

- Contracts: strict `control_plane_v1` bootstrap request, strict
  `bootstrap_snapshot_v1` payload, and strict `bootstrap_envelope_v1` envelope.
- Remote-config package: `@product/remote-config` with canonical JSON, Ed25519
  signing/verification, typed verification failures, trusted key-ring rotation,
  and config/access-token key separation.
- ADRs reviewed: ADR-0008 and ADR-0009 accurately describe only this P3.1
  wire-format/crypto foundation and staged resolver boundary.
- No `/v1/bootstrap` route or other public Fastify route was created. No
  migration was created. No persistence, real signing-key env composition,
  compatibility/subscription/entitlement persistence, or AI registry/health
  data was added.
- Bridge runtime import: none; `pnpm bridge:guard` passed in both DB-down and
  DB-up matrices.

## Cryptographic acceptance

- Algorithm: Ed25519.
- Signature domain: UTF-8 `product-control-plane/bootstrap-snapshot/v1`, NUL,
  UTF-8 `keyId`, NUL, then canonical UTF-8 payload bytes.
- Canonical JSON: recursively sorted plain-object keys; arrays retain order;
  Unicode and JSON escaping use deterministic JSON serialization; only null,
  boolean, string, safe integer, array, and plain object are allowed. Safe
  integers including `0` and negative values pass; `-0`, floats, NaN, Infinity,
  bigint, undefined, function, symbol, Date, Map, Set, and custom-prototype
  values reject.
- Key ring: overlapping packaged trusted public keys permit rotation; unknown
  `keyId` and invalid signatures fail closed.
- Config/access key separation: the config verifier does not accept an access
  token key as a valid config signing key.
- Focused crypto test count: **12 passed** in
  `packages/remote-config/src/index.test.ts` under Node 24. The tests cover valid
  signing/verification; deterministic nested object ordering, array order,
  Unicode, escaping and integer handling; payload/signature tampering; wrong and
  unknown keys; wrong algorithm; malformed base64url; malformed JSON; invalid
  schema; non-canonical signed JSON; overlapping rotation; and access-key
  separation.

## Gates

### DB down (DATABASE_URL absent; PostgreSQL not running)

All passed under Node 24.20.0 / pnpm 10.34.5:

- `pnpm install --frozen-lockfile`
- `pnpm lint`
- `pnpm format:check`
- `pnpm typecheck`
- `pnpm test` (including the 12 focused P3.1 tests)
- `pnpm openapi:check`
- `pnpm bridge:guard`
- `pnpm build`

### DB up (fresh PostgreSQL 18.0)

All passed with the process-local loopback test URL:

- `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, and `pnpm test`
- `pnpm test:integration`: **39 passed**, 0 failures, 0 skip/todo
- `pnpm db:migrate`: pass on the fresh database
- second `pnpm db:migrate`: pass
- `pnpm openapi:check`, `pnpm bridge:guard`, and `pnpm build`

Migration history consists only of `0000`, `0001`, `0002`, `0003`, `0004`, and
`0005`; historical files were unchanged and new migration: **NO**.

### OpenAPI invariance

The OpenAPI artifact was generated twice in the validation copy. Results were
byte-identical, with **14** paths/routes and SHA-256:

`3fd8ad9a61c8146c314d86912a47f1a154cf1eea6d73c3ad9dabfde52f2eeef0`

### P2 T4 regression

The E2E database was recreated fresh before the run. With
`PRODUCT_CONTROL_PLANE_E2E=1`, the loopback test URL, and
`PLAYWRIGHT_BROWSERS_PATH=/tmp/product-control-plane-playwright` inside the
Node container:

- Playwright: `1.62.1`.
- Chromium: Google Chrome for Testing `151.0.7922.34`, Playwright revision
  `1234`.
- `pnpm test:e2e`: **7 passed**, 0 failed, 0 skipped, 0 retries.

## Security and roadmap review

- Real config private key: none. `CONFIG_SIGNING_PRIVATE_KEY_PEM_B64` appears
  only as the explicitly reserved future configuration name in ADR-0008.
- Ozon credential path: none. Raw seller-data path: none.
- Executable remote configuration: none; signed data remains declarative and
  cannot introduce executable/network/auth capabilities.
- Roadmap remains P0 `[DONE]`, P1 `[DONE]`, P2 `[DONE]`, P3 `[ACTIVE]`, P3.1
  `[DONE]`, P3.2 `[NEXT]`, P3.3–P3.7 `[PLANNED]`, and P4–P15 `[PLANNED]`.

## Remote acceptance

- Implementation SHA: `bde40d98571c1e5f541322f4c888d37ce5aab665`.
- Code-bearing Server CI: run `33840264779`,
  `https://github.com/MaksimUnimax/blood_sand/actions/runs/33840264779` —
  push event on that exact implementation SHA, conclusion: **success**.
- Reviewed Server CI steps all passed: immutable checkout, immutable pnpm setup,
  immutable Node setup, frozen install, lint, format, typecheck, unit,
  integration, migration, OpenAPI, Bridge guard, build, Playwright Chromium
  install, and T4 E2E.
- Remote content was compared directly on GitHub from
  `0ca219b078294bd57eb575a0ebf08ae32070237b` through the implementation SHA.
  It contains only the P3.1 contracts, remote-config package, crypto tests,
  ADR-0008, ADR-0009, roadmap, evidence, and required workspace lock wiring.
  The remote source bytes for the reviewed contracts, crypto, tests, ADRs,
  roadmap, and evidence match the committed implementation bytes.
- Final implementation OpenAPI state: 14 routes, SHA-256
  `3fd8ad9a61c8146c314d86912a47f1a154cf1eea6d73c3ad9dabfde52f2eeef0`,
  and no `/v1/bootstrap` route.
- Final implementation migration state: no new migration; latest remains `0005`.

All disposable containers, validation copy, temporary pnpm store, Playwright
payload, test output, and logs are to be removed after this evidence is written;
the canonical dirty P3.1 candidate is retained.
