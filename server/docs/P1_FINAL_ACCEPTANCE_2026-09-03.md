# P1 final acceptance — 2026-09-03

Status: ACCEPTED.

P0 established the control-plane architecture, modular-monolith boundary, and
Bridge isolation rule. P1.1 through P1.4 are DONE. P1.5 architecture review was
accepted; P1.6 closes its four findings without beginning P2.

## Finding closure

- P1.5-001 CLOSED: API readiness is dependency-required and production creates
  `@product/db`'s `DatabaseRuntime` from `DATABASE_URL`. The narrow adapter
  converts `database.ready()` success/rejection to `true`/`false`; real
  PostgreSQL integration proved `/health/ready` 200 while available and 503
  after a clean runtime close, while `/health/live` remains 200. API startup
  does not migrate, and shutdown closes Fastify then the database runtime.
- P1.5-002 CLOSED: `SensitiveLogPaths` preserves the snake_case baseline and
  now protects `refreshToken`, `accessToken`, and `apiKey`; a regression test
  covers all recognized authorization/cookie/password/token/refresh/access/API
  key/secret paths.
- P1.5-003 CLOSED: `format:check` covers `apps`, `packages`, `scripts`,
  `infra`, `integration`, root source/config files, and the Server CI workflow.
  The old hand-picked list was removed. In an isolated copy, deliberately
  misformatting `apps/worker/src/main.ts` made the gate fail. Thirty preexisting
  newly-covered files were format-only changes; semantic changes: none.
- P1.5-004 CLOSED: Server CI pins the accepted action revisions exactly:
  `actions/checkout@11d5960a326750d5838078e36cf38b85af677262`,
  `pnpm/action-setup@b906affcce14559ad1aafd4ab0e942779e9f58b1`, and
  `actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020`. No action
  versions were upgraded; `permissions: contents: read` remains.

## Evidence

- implementation SHA: `f10f22d02a09764650a28d10b60571aefac877bb`;
- code-bearing GitHub Actions Server CI: [33736482614](https://github.com/MaksimUnimax/blood_sand/actions/runs/33736482614), push event, success;
- CI passed checkout, pnpm setup, Node setup, frozen install, lint, format,
  typecheck, unit, PostgreSQL integration (including API readiness),
  `db:migrate`, `openapi:check`, `bridge:guard`, and build. The job records the
  three pinned action SHAs above.
- clean isolated `node:24-bookworm` validation used Node 24.20.0 and pnpm
  10.15.1. DB-down lint, format, typecheck, unit, OpenAPI check, Bridge guard,
  and build passed. `pnpm test:integration` without `DATABASE_URL` failed as
  required. Fresh disposable PostgreSQL 18 validation passed the complete
  canonical sequence and was removed with its container, volume, network and
  loopback port 55432.
- OpenAPI stayed DB-independent and unchanged:
  `b5ef282f343899344af731859c551d075a32c4d288adc4aad3bb9bc4584b8485`.
- Bridge guard passed; there is no runtime import from
  `tooling/llm-api-bridges/ozon-seller/**`. No P2+ domain implementation or
  production deployment was added.

Durability evidence is finalized only after the final documentation SHA passes
its own GitHub CI and the final P1 bundle is verified.
