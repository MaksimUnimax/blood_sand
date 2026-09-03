# P2.3 device authorization evidence — local candidate

Status: **LOCAL CANDIDATE — P2.3 ACTIVE**
Date: 2026-09-03

Authority remains the P0 architecture/requirements/security/API-contract documents,
ADR 0006, and the P2.1/P2.2 acceptance evidence.  This candidate adds the P2.3
authorization workflow only; it does not deploy a service or implement P2.4.

## Package and persistence boundary

- `@product/device-auth` contains code policy, key derivation, state policy,
  replay-envelope handling and the application service.  It has no Fastify,
  Drizzle, `pg`, Nodemailer or Next.js dependency.
- `@product/db` owns PostgreSQL persistence in
  `device-authorization-repository.ts`; `0003_p2_3_device_authorization.sql`
  extends the accepted schema without regenerating historical migrations.
- `@product/api` owns Fastify validation, portal session/CSRF route gates, safe
  envelopes and OpenAPI.  The worker runs expiry alongside the existing worker.

Device codes are 32 random bytes encoded as canonical 43-character base64url.
Human codes are eight characters from the ambiguity-reduced alphabet, rendered
`XXXX-XXXX`.  Both are represented durably only by separated keyed artifacts;
the start replay envelope is AES-GCM protected and cleared at terminal expiry.
Start requests require a 16–128 character idempotency header.  Matching retries
replay the logical response, changed bodies conflict, and terminal records close.

`MAX_CODE_GENERATION_ATTEMPTS = 8`.  Only the exact
`device_authorizations_device_code_hash_unique` and
`device_authorizations_user_code_hash_unique` constraints classify PostgreSQL
`23505` as a code collision.  Other `23505` failures do not.  Each collision
transaction rolls back its rate-slot consumption.  Exhaustion is fail-closed and
maps at HTTP only to `503 SERVICE_UNAVAILABLE`.

Rate limits are transactional 15-minute fixed windows: start by peer IP (20),
portal user (10), and portal IP (30).  Fastify does not trust forwarded IP
headers. Portal routes reuse only `pcp_portal_session` and `pcp_csrf`; session
authentication precedes CSRF validation.

State transitions are `PENDING → APPROVED|DENIED|EXPIRED` and
`APPROVED → EXPIRED`. Approval verifies active OWNER membership but creates no
device, extension session, refresh token, or access token. P2.5 remains the
activation/exchange/device-limit gate.

## Tests and contracts

T1 final counts: `packages/device-auth/src/index.test.ts` 9 tests;
`apps/worker/src/{lifecycle,composite-runner,device-authorization-expiry-runner}.test.ts`
8 tests; API tests in `apps/api/src/*.test.ts` 19 tests.

T2 regression: `integration/p2-3-device-authorization.integration.test.ts` has
9 relevant tests; the full integration suite has 24 passing tests. Accepted
scenarios A–L remain green: migration/history, storage/replay, parallel
idempotency, closure/conflict, start rate/privacy, approval boundary/failures,
deny/race, expiry/multi-worker, portal rate, collision boundary, and audit/privacy.

T3 is concentrated in `apps/api/src/device-authorization-routes.test.ts` with
OpenAPI assertions in `apps/api/src/openapi.test.ts`: M start contract,
idempotency, strict validation, rate and forwarded-IP behavior; N portal
session/CSRF on both actions; O approve safe response/error mapping; P deny safe
response/closure mapping; Q common error envelope and collision exhaustion 503;
R redaction/no-secret URL policy. Request schemas are strict. Logs redact peer
address, cookie/session, CSRF, idempotency, codes and envelope fields.

OpenAPI is deterministic with PostgreSQL down. SHA-256:
`52b7638e8aa4ad52dfe61f810160c3d403b23b65d252eb0393f2bce224fa2037`.
The exact public route set is health live/ready, OTP request/verify/logout, and
start/approve/deny device authorization. Codes are never path/query values;
idempotency is header-only and human code is JSON-body-only. There are no bearer
claims for portal approval/deny, token exchange, refresh, devices, bootstrap,
billing, admin, AI or diagnostics routes.

## Local validation

Authoritative disposable runtime: Node `v24.20.0`, pnpm `10.15.1`, PostgreSQL
`18.0`. A clean copied workspace completed frozen install; DB-down lint, format,
typecheck, unit, OpenAPI check, bridge guard and server build were exercised.
With disposable PostgreSQL 18, the canonical integration suite passed 24/24,
then `db:migrate` passed twice, as did OpenAPI and bridge checks. The integration
migration tests cover empty history, P2.2-to-0003 upgrade and second migrator.
Bridge isolation is enforced by `pnpm bridge:guard`; no Ozon runtime import,
credential path or seller payload is introduced.

Known limitations: this is a local candidate pending implementation commit and
the exact GitHub Server CI run. No external production deployment is claimed.

Defects fixed during closeout: collision exhaustion was previously surfaced as
the frozen invalid-device outcome; it is now the generic service-unavailable
delivery result, with no collision or SQL detail exposed.
