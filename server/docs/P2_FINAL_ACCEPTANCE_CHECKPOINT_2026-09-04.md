# P2 final acceptance checkpoint

Status: **ACCEPTED — P2 DONE**

P2.1 through P2.7 are complete. P3 is next; no P3 work is included in this
checkpoint.

## P2.7 security closure

All four P2.7 findings are closed: AUD-P2-001 transactional portal logout/audit,
AUD-P2-002 portal security headers/CSP, AUD-P2-003 application dependency
exposure, and AUD-P2-004 canonical package-manager exposure. Open critical: 0;
high: 0; medium: 0.

Canonical build/package tooling is Node 24.20.0 and pnpm 10.34.5. The project
was not migrated to pnpm 11. The P2 checkpoint used ephemeral, read-only pnpm
11.25.0 only as the advisory scanner because pnpm 10 audit uses retired npm
legacy endpoints while pnpm 11.25 uses npm's bulk advisory endpoint. pnpm 11
did not install, build, or alter the workspace. It audited the exact final
canonical lockfile (SHA-256
`f3756101f8b48b4edd42e4274fbd053a41941a6b72a816ebec8475672b3df784`)
without mutation and returned valid JSON: 0 critical, 0 high, 4 moderate, 0
low.

## Acceptance evidence

- Security implementation: `d526e6a2695c0460faedd6b53bc1aac9b0e2e972`.
- Server CI: [33835925978](https://github.com/MaksimUnimax/blood_sand/actions/runs/33835925978), success; immutable action pins, Node 24.20.0, pnpm 10.34.5,
  PostgreSQL 18.0, `product_control_plane_test`, frozen install and all required
  validation/T4 steps passed.
- Local PostgreSQL 18 acceptance: lint, format, typecheck, unit, 39 integration
  tests, fresh and second migration, OpenAPI check, Bridge guard, build, and T4
  (7 passed, 0 failed/skipped/retries) passed. Chromium revision: 1234.
- OpenAPI stayed deterministic at 14 routes and SHA-256
  `3fd8ad9a61c8146c314d86912a47f1a154cf1eea6d73c3ad9dabfde52f2eeef0`.
- Migrations remain exactly 0000 through 0005; no 0006 was created.
- Bridge/data boundary guard passed: no Ozon credential/server path, raw seller
  data path, or Bridge runtime import.

## Security properties accepted

P2 accepts OTP, portal-session, device authorization, access/refresh, device
management, portal BFF and simulated-client security. Required mutation/audit
pairs are transactional; the real PostgreSQL failure-injection regression proves
logout rollback for `revoked_at`, `revoke_reason`, and the audit event. Portal
production headers include restrictive CSP, nosniff, Referrer-Policy,
Permissions-Policy, anti-framing, powered-by suppression, and production-only
HSTS.
