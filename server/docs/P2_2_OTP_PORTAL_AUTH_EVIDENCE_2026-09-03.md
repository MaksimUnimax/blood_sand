# P2.2 OTP portal authentication evidence

Status: CODE CI ACCEPTED — documentation acceptance pending final-head CI  
Date: 2026-09-03

## Recovery and runtime

- Preserved the inherited attempt-3 dirty candidate before changes:
  `/var/backups/product-control-plane/git/blood_sand-p2.2-attempt3-uncommitted.patch`
  (`6c42233fb500958aab0cdbe487e277607808bc0e412a2c6f30def0fa21be6189`) and
  `/var/backups/product-control-plane/git/blood_sand-p2.2-attempt3-untracked.tar.gz`
  (`9fb5c4d9c470d5923c0e7b5686dc637a515223cdc82c1ceeeb5c57d59b1a3232`, 14 files).
- No reset or clean was used.
- Runtime: Node `v24.20.0`, pnpm `10.15.1`, disposable `postgres:18.0`.
- No external SMTP was contacted; delivery tests use an in-process fake provider.

## Implementation map

- `packages/auth`: normalization, HMAC artifacts, envelope encryption, portal/CSRF secrets, application service.
- `packages/db`: P2.2 migration, auth repository, OTP/rate-limit/job schema.
- `apps/api`: OTP request/verify/logout routes and OpenAPI contract.
- `apps/worker`: leased OTP email runner with terminal secret cleanup.
- `integration/p2-auth.integration.test.ts`: real PostgreSQL T2 coverage.

T2 exposed and fixed one PostgreSQL 18 defect: `jsonb_build_object` received an
untyped job-id parameter in `AUTH_OTP_REQUESTED`; the repository now casts it to
`text`. The T2 regression passed after the fix.

## Test evidence

- T1 unit suite: 36 passed, 0 failed.
- T2: `integration/p2-auth.integration.test.ts`, 11 tests / 11 passed / 0 failed.
  Its named assertions cover T2-01 through T2-30: correlation migration,
  atomic rate limits, replacement, sequential/concurrent verification races,
  first/later/suspended login, secret storage, delivery lease/recovery/cleanup,
  logout/audit/privacy, and migration/history checks.
- Full integration: 15 passed, 0 failed (the 11 T2 tests plus 3 database
  migration tests and 1 readiness test).
- T3 API regression: 3 auth-route tests passed; existing API unit tests total
  13 passed. This includes OTP request/verify, logout, CSRF/cookie security,
  invalid-request 400 behavior, forwarded-for protection, and privacy logging.

Migration evidence: empty history applies `0000`, `0001`, and new `0002`; a
second migrator run passes; accepted P2.1 forward migration passes. Historical
files remain byte-identical (SHA-256: `9a7cde34…5af56` for 0000 and
`0544b377…23b2f` for 0001).

## Final local gates

- DB-up canonical sequence passed: lint, format, typecheck, unit, integration,
  db:migrate, OpenAPI check, Bridge guard, and build.
- OpenAPI routes are exactly live/ready plus OTP request, OTP verify, and logout.
  Two Node 24 generations were byte-identical; SHA-256:
  `220704c148c1d12e6a8afe8eb0de8d41c9e2308193dac5bdcb2e9f6bd86f038a`.
- Bridge isolation guard passed. `@product/auth` has no Fastify, Drizzle, pg, or
  Nodemailer dependency. No P2.3 endpoint or implementation was added.
- Audit/rate-limit T2 checks verify persisted data excludes raw email/IP, OTP,
  portal/CSRF tokens and delivery ciphertext; IP keys are HMAC pseudonyms.

Implementation commit `f1b493ad0602bebd5726dc275979b271c2c6025d` was accepted by
Server CI push run `33743966576`:
https://github.com/MaksimUnimax/blood_sand/actions/runs/33743966576.
The workflow passed checkout, frozen setup, lint, format, typecheck, unit,
real PostgreSQL integration, migration, OpenAPI, Bridge guard, and build.
