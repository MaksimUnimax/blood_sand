# P2.5 device-management core T2 local evidence

Status: **LOCAL T2 ACCEPTED — P2.5 ACTIVE**

ADR [0007](ADR/0007-p2-device-limit-and-activation-boundary.md) preserves the
boundary: portal approval expresses human/account intent; exchange is the
capability-granting activation boundary. `DeviceLimitResolver` currently uses
`PRE_ENTITLEMENT_ACTIVE_DEVICE_LIMIT = 1` from `PRE_ENTITLEMENT_BASELINE`.
P4 entitlement resolution is not implemented.

The exchange uses a transactional PostgreSQL advisory lock per account, a
two-minute same-request replay window, 120 requests per ten minutes per
pseudonymous peer key, and a five-second pending recommendation. Activation
creates an ACTIVE device, one ACTIVE extension session, and generation-zero
refresh hash in one transaction; the deterministic activation refresh is
derived with the dedicated extension-auth label and is never persisted in
plaintext. Access JWT signing occurs after that transaction commits.

The core includes owner-only safe device listing (50 default, 100 maximum,
opaque account-scoped cursor), and owner revocation for ACTIVE or SUSPENDED
accounts. Revocation immediately invalidates the accepted P2.4 access and
refresh authorization paths while retaining refresh rows as historical data.
Migration `0005_p2_5_device_management.sql` adds exchange replay metadata and
the migration-safe EXCHANGED invariant.

T1 files: `packages/device-management/src/index.test.ts` (3 tests) and
`packages/extension-auth/src/index.test.ts` (9 tests total; activation-refresh
coverage included). They cover baseline/resolver and exchange policy,
idempotency boundaries, HMAC privacy, and separated deterministic refresh
derivation. PASS.

T2 file: `integration/p2-5-device-management.integration.test.ts` (7 cohesive
tests covering A–J): migration/invariant; activation; safe replay; pending and
closed/ineligible states; concurrent limit and release after revoke; immediate
credential invalidation and idempotence; safe pagination/isolation; exchange
rate concurrency and audit/privacy. PASS on PostgreSQL 18.0. The complete
integration regression reported 38 tests passing.

Defects found and fixed:

- Historical migration assertions still expected five migrations. They now
  expect the legitimate sixth migration.
- Replay integrity did not explicitly bind the replayed session to the replayed
  device/account or require its creator to remain active. The replay query now
  verifies those links and states.
- Approval expiration cleared its start envelope without a safe expiry audit.
  The transition now persists `DEVICE_AUTHORIZATION_EXPIRED` in the same
  transaction.

Privacy/audit checks verified device-code, exchange key, initial refresh,
access JWT, raw peer IP, root secret, signing key, signatures, and start
envelope plaintext are absent from relevant persistence/audits. Activation,
limit, and revocation events are transactionally written. Bridge guard passed;
the device-management package has only allowed domain dependencies.

Clean validation used Node v24.20.0, pnpm 10.15.1, and PostgreSQL 18.0.
`pnpm install --frozen-lockfile` passed. DB-down and DB-up local gates passed:
lint, format, typecheck, unit test, integration (DB-up), migration (DB-up),
OpenAPI check, bridge guard, and build. OpenAPI was generated/check-run twice
DB-down and remains SHA-256
`b06656692f5ec33b2580a7cf58ee64493538b4f388416e92fefec1f323aa095d`.

The HTTP boundary candidate is documented separately in
`P2_5_DEVICE_MANAGEMENT_HTTP_ACCEPTANCE_EVIDENCE_2026-09-03.md`; this core
evidence remains T2 evidence until implementation CI has passed. P2 remains
ACTIVE; P2.1–P2.4 are DONE; P2.5 is ACTIVE; P2.6–P2.7 are PLANNED.
