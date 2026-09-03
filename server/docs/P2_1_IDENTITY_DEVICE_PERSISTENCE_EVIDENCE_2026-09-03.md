# P2.1 identity/device persistence evidence — 2026-09-03

Status: ACCEPTED.

## Authority and scope

Implementation follows `ARCHITECTURE.md`, `DATA_MODEL.md`, `SECURITY.md`,
`DEVELOPMENT_RULES.md`, and `TEST_STRATEGY.md`. It adds only PostgreSQL/domain
persistence: `users`, `user_identities`, `accounts`, `account_memberships`,
`otp_challenges`, `portal_sessions`, `device_authorizations`, `devices`,
extension `sessions`, `refresh_tokens`, and append-oriented `audit_events`.

`ADR/0006-p2-portal-session-separation.md` records that portal web sessions
and extension/device sessions are separate trust boundaries.

## Schema and safeguards

All timestamps use `timestamp with time zone`. Lifecycle states are explicit:
user/account `ACTIVE|SUSPENDED`; identity `EMAIL`; membership `OWNER`; OTP
`LOGIN`; device authorization `PENDING|APPROVED|DENIED|EXPIRED|EXCHANGED`;
device `ACTIVE|REVOKED`; extension session
`ACTIVE|REVOKED|COMPROMISED`. Browser family is shared as
`chrome|yandex_chromium`.

All security/history foreign keys use `RESTRICT`. Unique constraints protect
identity lookup, portal token hash, both device authorization hashes, extension
session token family, refresh token hash, and `(session_id, generation)`.
OTP counters and refresh generation have database checks. Lookup indexes cover
OTP target/expiry, portal user, authorization status/expiry, devices, sessions,
refresh sessions, and audit actor/target/time.

No plaintext OTP, device code, user code, refresh token, portal-session token,
access token, or password column exists. `safe_metadata` is internal audit
metadata only.

## Migration and test evidence

- Generated migration: `packages/db/drizzle/0001_sturdy_doctor_spectrum.sql`.
- Empty PostgreSQL 18 migration: PASS.
- Accepted P1-only migration followed by full P2.1 migration: PASS.
- Second migrator execution: PASS/idempotent.
- P1 probe table absent after full history: PASS.
- Real PostgreSQL tests: table existence, uniqueness, OTP and refresh checks,
  foreign keys, and bounded plaintext-secret-column gate: PASS.
- OpenAPI SHA before/after: `b5ef282f343899344af731859c551d075a32c4d288adc4aad3bb9bc4584b8485`.
- Bridge boundary guard: PASS.
- Implementation Server CI: [33738679480](https://github.com/MaksimUnimax/blood_sand/actions/runs/33738679480),
  push event for `451374c26c919f7e89deb50a08967102e47bd21d`: PASS (checkout,
  pnpm/Node setup, frozen install, lint, format, typecheck, unit, real
  PostgreSQL integration, migration, OpenAPI, Bridge guard, and build).

## Non-goals and next step

P2.1 has no authentication/device HTTP routes, OTP delivery or crypto, token
issuance/rotation logic, cookie behavior, device limit policy, email provider,
queue, UI, or P3+ domain. P2.2 is email OTP request/verify, abuse controls,
durable delivery, and portal session behavior.
