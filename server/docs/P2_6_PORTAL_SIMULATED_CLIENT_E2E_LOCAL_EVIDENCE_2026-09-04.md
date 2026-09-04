# P2.6 portal simulated-client local evidence

Status: **LOCAL T4 ACCEPTED — P2.6 ACTIVE**

Technical ID: `PRODUCT-CONTROL-PLANE-P2.6-PORTAL-SIMULATED-CLIENT-E2E-LOCAL`  
Attempt: 6  
Date: 2026-09-04

## Base and attempt history

- Committed base HEAD: `954593524e1645953c4ebc39123932e3d0fadb05` on
  `feature/product-control-plane-server-2026-09-03`.
- Remote HEAD independently supplied for this local closeout:
  `954593524e1645953c4ebc39123932e3d0fadb05`.
- Attempts 1--4 established the dirty P2.6 candidate and local test architecture.
  Attempt 5 completed the substantive DB-down T4 result (7/7) but did not run the
  required full DB-up gate. Attempt 6 changed no tracked product, test, or config
  file; it ran that missing gate and a new disposable-db T4 run.
- Attempt 5's open-redirect regression was caused by multiple successful OTP
  cases reusing an email inside the accepted OTP cooldown window. The retained fix
  gives each unsafe `returnTo` case a unique deterministic E2E email. OTP
  cooldown/rate limits were not weakened.

## Architecture covered

The local flow uses real PostgreSQL, Fastify, Next portal pages, a portal BFF,
support APIs, and a simulated extension client. Deterministic test-only OTP
material is injected into the API harness; there is no OTP reveal endpoint.

Access-token invalidation is proved by the real `ExtensionAuthService.authenticateAccess()`
and real `createExtensionAuthRepository()` against the same E2E PostgreSQL database,
through the test-only in-process `access-auth-probe`. There is no artificial public
Bearer HTTP route. Refresh invalidation is proved through real public
`POST /v1/auth/refresh` and returns `AUTH_REFRESH_INVALID` after portal revoke.

## DB-up acceptance gate

Fresh disposable PostgreSQL `18.0` and disposable Node `v24.20.0` with pnpm
`10.15.1` were used. The complete ordered gate passed:

- `pnpm lint`: PASS
- `pnpm format:check`: PASS
- `pnpm typecheck`: PASS
- `pnpm test`: PASS, T1 DB-independent suite: 112 passed
- `pnpm test:integration`: PASS, T3 real PostgreSQL suite: 38 passed, 0 failed,
  0 skipped/todo (6 files)
- `pnpm db:migrate`: PASS
- `pnpm openapi:check`: PASS
- `pnpm bridge:guard`: PASS
- `pnpm build`: PASS

Migrations were applied to a fresh database from `0000` through `0005`; a second
migrator execution passed. The latest migration is
`0005_p2_5_device_management.sql`; there is no `0006` and historical migration
files were not changed.

The DB-down gate was rerun after the focused E2E reset-guard regression tests
were added: frozen install, lint, format, typecheck, unit, OpenAPI, bridge
guard, and build all PASS.

## Final fresh T4 E2E

A separate newly created PostgreSQL 18.0 database was used after the DB-up gate.
Playwright `1.62.1` ran Chromium `151.0.7922.34` with 2 spec files, 7 tests,
1 worker, 0 retries, trace/video/screenshot off:

- Result: **7 passed, 0 failed, 0 skipped** in 36.6 seconds.
- OTP browser smoke and strict cookie security: PASS.
- Approval, activation exchange, refresh, and device list: PASS.
- Deny and device-limit reached: PASS.
- Portal revoke; access valid before revoke; access invalid after revoke; and
  refresh invalid after revoke: PASS.
- Activation retry after revoke and final device states: PASS.
- URL privacy, storage privacy, open redirect, and suspended-account management:
  PASS.

No browser trace, video, screenshot, HAR, HTML report, or secret-bearing
Playwright artifact was retained.

## CI candidate database-name correction

The accepted reset guard remains fail-closed and unchanged: E2E requires
`PRODUCT_CONTROL_PLANE_E2E=1`, a loopback host, and a database name containing
`e2e` or `test` case-insensitively. The initial disposable CI database name,
`product_control_plane_ci`, conflicted with that guard. The Server CI service
and all DB-dependent CI URLs were corrected to the disposable
`product_control_plane_test` database; no `ci` exception, GitHub Actions
special case, or reset-guard weakening was introduced.

Using fresh PostgreSQL 18.0 named `product_control_plane_test`, the full local
CI-equivalent DB-up sequence (lint, format, typecheck, unit, integration,
migrate, OpenAPI, bridge guard, and build) passed. The final T4 run passed 2
spec files and **7/7 tests**, with 0 failed, 0 skipped, and 0 retries.
Focused deterministic guard tests confirm that the corrected test name is
accepted when explicitly enabled and the former `product_control_plane_ci` name
is rejected.

## Contract, privacy, and boundary checks

- OpenAPI route count: 14.
- OpenAPI SHA-256:
  `3fd8ad9a61c8146c314d86912a47f1a154cf1eea6d73c3ad9dabfde52f2eeef0`.
  `openapi:check` passed; the representation is deterministic.
- Cookie security, URL privacy, and browser-storage privacy: PASS.
- No URL/storage leak of OTP, user/device code, access/refresh token, portal
  session, or CSRF token was observed.
- Bridge guard passed. No import from `tooling/llm-api-bridges/ozon-seller`, no
  Ozon call, credential, or seller data was introduced.
- Candidate source and untracked candidate files were scanned. The only OTP
  literal is test-only `424242`; the signing/root material is explicitly
  synthetic and confined to E2E support. No real production secret, database
  URL, cookie, device/user code, or browser binary is tracked.

## Roadmap and limitation

P2 remains ACTIVE. P2.1, P2.2, P2.3, P2.4, and P2.5 remain DONE. P2.6 remains
ACTIVE; P2.7 remains PLANNED.

Known limitation: P2.6 T4 is locally accepted but has not yet been integrated
into GitHub Server CI.

No commit, push, CI workflow edit, host Node change, host PostgreSQL install,
MySQL change, protected-service change, or product deployment was made. All
PostgreSQL/Node validation containers and disposable test output were removed
after acceptance.
