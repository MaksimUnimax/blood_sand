# P2.7 security architecture audit — local evidence

Status: **ACCEPTED — P2.7 DONE**
Date: 2026-09-04
Base: `c6e96e571f434ecb87ac79a5d1402d7b2ad1c7a0` (direct SSH-over-443 remote matched; initial worktree clean).

## 1. Scope and accepted base

This audit reviewed the P2.1–P2.6 identity/device implementation against the normative architecture, requirements, security, integration, data-model, API, test, billing/plan, development-rule and roadmap documents, ADR-0006, ADR-0007, and each accepted P2 evidence record. P2 remains ACTIVE; P3–P15 remain PLANNED. No P3+ capability, public route, migration, CI workflow, commit, or push was added.

Threat boundaries confirmed: the API has no Ozon credential/provider-payload path, no AI conversation storage, and no Bridge runtime import. `pnpm bridge:guard` passes. P2 accepts only identity/device/control-plane metadata.

## 2. Finding register and remediation

| ID | Area | Severity | Before / failure mode | Fix and regression | Status |
|---|---|---:|---|---|---|
| AUD-P2-001 | Portal logout audit atomicity | MEDIUM | Portal-session revocation committed before its required audit insert; an audit failure left a security mutation without append-only evidence. | `AuthRepository.revoke` now uses one PostgreSQL transaction. `integration/p2-7-security-audit.integration.test.ts` installs an audit-failing trigger and proves `revoked_at` rolls back. Repeated logout remains no-op/no duplicate audit. | CLOSED |
| AUD-P2-002 | Portal response security headers / CSP | MEDIUM | No explicit portal security-header layer. | Production Next configuration sets constrained CSP, nosniff, referrer, permissions, anti-framing, powered-by suppression, and production-only HSTS. The portal regression asserts all required production headers. Development adds only Next HMR `unsafe-eval`; production does not. | CLOSED |
| AUD-P2-003 | Runtime dependency exposure | HIGH | Audit found high/critical advisories in P2-serving Next, Fastify, Drizzle, Nodemailer and dev Vitest, plus vulnerable transitive Sharp/PostCSS. | Pinned compatible security updates: Next 15.5.21, Fastify 5.8.5, Drizzle 0.45.2, Nodemailer 9.0.1, Vitest 3.2.6; root overrides Sharp 0.35.0 and PostCSS 8.5.18. The Fastify type tightening required an `Error` guard in the safe error handler. Exact pnpm 11.25.0 read-only audit of the final canonical lockfile: 0 critical, 0 high. | CLOSED |
| AUD-P2-004 | Canonical package-manager supply chain | HIGH | Canonical pnpm 10.15.1 had package-manager security findings. | Canonical project/CI package manager is pnpm 10.34.5 (same major) with engine `>=10.34.5 <11`; frozen install and full regression passed. | CLOSED |

Residual non-blocking finding: the final package-manager audit reports four moderate advisories. They are not HIGH/CRITICAL P2 runtime blockers under this packet; ownership is dependency maintenance before the next dependency refresh. No secrets were printed. Candidate secret scan found only `.env.example` and the explicitly synthetic E2E signing fixture; no real credential finding.

## 3. Transactional audit matrix

| Mutation | Classification |
|---|---|
| OTP request/supersession | ATOMIC WITH MUTATION |
| OTP verify, identity create, portal-session create | ATOMIC WITH MUTATION |
| Portal-session revoke | ATOMIC WITH MUTATION (P2.7 rollback regression) |
| Device authorization start / approve / deny / expiry | ATOMIC WITH MUTATION |
| Refresh rotate / reuse compromise | ATOMIC WITH MUTATION |
| Device activation / deliberately committed limit denial | ATOMIC WITH MUTATION |
| Device revoke / extension-session revoke | ATOMIC WITH MUTATION |

Rate-bucket consumes and denied/no-state results are independently committed event-only or no-mutation controls; they do not create capability state. Review found no further non-atomic required mutation/audit pair.

## 4. Key and token/security matrix

`AUTH_ROOT` HKDF labels are unique for OTP verification, rate pseudonymization, portal lookup, CSRF, OTP delivery, device authorization hashes/envelopes, refresh lookup/derivation/idempotency/rate, and exchange idempotency/rate/activation refresh. Access-token Ed25519 private signing material is separately configured and independent from `AUTH_ROOT`.

OTP uses `randomInt`, six digits, ten-minute TTL, hash-only storage, five attempts, encrypted AES-GCM delivery envelope, supersession, durable jobs, normalized email and pseudonymous rate keys. Production composition does not use the E2E fixed OTP.

Portal sessions are 32-random-byte opaque values, hash-only, seven-day, HttpOnly/Strict and Secure in production; CSRF is double-submit. Suspended users cannot authenticate and logout is idempotent/private.

Device codes and user codes are independent and hash-only; start envelopes are encrypted. Approval is intent-only. Exchange revalidates active user/account/OWNER membership, serializes per account, enforces `DeviceLimitResolver` baseline `1` / `PRE_ENTITLEMENT_BASELINE`, atomically creates device/session/refresh state, signs access only after commit, and permits only the bounded same-key replay.

Access tokens use Ed25519/EdDSA, required `kid`, exact issuer/audience, 15-minute TTL and minimal identity claims. Existing adversarial tests cover tamper, alg/kid/issuer/audience/time failures and live session/device/account/user state. Refresh tokens are 32-byte opaque/hash-only, rotate atomically, have bounded same-request replay, compromise the session on mismatched/late reuse, and rate-limit pseudonymous peer IP without trusting XFF.

Device revoke is OWNER-only/non-disclosing across accounts, remains available to suspended accounts, revokes active extension sessions without restoring compromised ones, and thereby renders the complete refresh family unusable; historical refresh rows remain audit history. Existing integration tests prove immediate access/refresh denial.

## 5. Portal, BFF, privacy, database, and CI

The BFF accepts only a strict root HTTP(S) origin and an explicit method/path allowlist; it forwards neither Authorization nor forwarded/host/connection headers, preserves multiple Set-Cookie values and safe response headers, and returns safe 503 on network failure. Portal return targets are local-only; no credentials are put in browser storage or URLs. React has no unsafe HTML use.

Production CSP contains `default-src 'self'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'`, `object-src 'none'`, same-origin connect policy and minimal Next-compatible script/style sources. HSTS is production-only so local HTTP acceptance is unaffected.

Pino/Fastify logging is configured with sensitive request/header redaction; source, fixtures, OpenAPI and audit paths were searched for OTPs, tokens, raw IP and provider data. Existing observability regressions cover redaction.

Schema/migrations remain exactly `0000..0005`; no migration was needed. Fresh migration and second migrator pass; historical migrations are unchanged. The P2.5 EXCHANGED constraints, FK/unique/indexes and timestamptz state fields were reviewed.

Canonical CI configuration was inspected: immutable action pins, Node 24.20.0, canonical pnpm 10.34.5, PostgreSQL 18.0, frozen install, lint/format/type/unit/integration/migrate/OpenAPI/bridge/build and Chromium T4 steps remain unchanged. No artifact upload change was made.

## 6. Local acceptance results

- Runtime: Node 24.20.0 (temporary local binary; host Node unchanged), canonical pnpm 10.34.5, PostgreSQL 18.0 disposable container, Playwright 1.62.1, Chromium revision 1234.
- DB-down frozen gate: `pnpm install --frozen-lockfile`, lint, format, typecheck, unit, OpenAPI, Bridge guard and build passed with canonical pnpm 10.34.5.
- DB-up: fresh migration and second migration pass; integration: **7 files, 39 tests passed**, including the P2.7 PostgreSQL rollback test.
- T4: **7 passed, 0 failed, 0 skipped, 0 retries**.
- OpenAPI: 14 paths/routes; generated twice DB-down byte-identically; SHA before/after `3fd8ad9a61c8146c314d86912a47f1a154cf1eea6d73c3ad9dabfde52f2eeef0`.
- Dependency audit command: exact `pnpm@11.25.0 audit --json --registry=https://registry.npmjs.org/` against an isolated read-only copy of the exact canonical lockfile. Valid JSON reported critical 0, high 0, moderate 4, low 0. Original lock SHA-256, temporary pre-audit SHA-256 and temporary post-audit SHA-256 were all `f3756101f8b48b4edd42e4274fbd053a41941a6b72a816ebec8475672b3df784`; audit did not mutate either lockfile. pnpm 11 was not used for install, build, or canonical CI.
- Tool-role limitation: canonical pnpm 10.34.5 remains the project package manager. pnpm 10 audit depends on retired npm legacy audit endpoints; the ephemeral pnpm 11.25.0 scanner uses npm's modern `/-/npm/v1/security/advisories/bulk` endpoint. This deliberate scanner/build-tool separation is not a pnpm 11 migration.
- Host safety: no host Node/PostgreSQL/MySQL/nginx/Apache/Docker-daemon/protected-service modification; no deployment.

## 7. Final local verdict

Open CRITICAL: 0. Open HIGH: 0. Open MEDIUM: 0. The accepted P2 implementation is coherent across identity, portal session, device authorization/exchange, access/refresh authorization, device management, portal BFF, simulated client and database boundaries. Return to ChatGPT for independent P2.7 final remote acceptance and the final P2 checkpoint. Do not mark P2 DONE from this local packet.

## 8. Remote acceptance finalization

Implementation commit: `d526e6a2695c0460faedd6b53bc1aac9b0e2e972` (`fix(server): close P2 security audit findings`). Exact push-triggered Server CI run [33835925978](https://github.com/MaksimUnimax/blood_sand/actions/runs/33835925978) completed `success`. The job used immutable action pins, Node 24.20.0, canonical pnpm 10.34.5, PostgreSQL 18.0 and `product_control_plane_test`; every required step, including frozen install, integration, migration, build, Chromium install and 7-test T4, passed.

Final P2.7 finding register: 4 total; AUD-P2-001 CLOSED, AUD-P2-002 CLOSED, AUD-P2-003 CLOSED and AUD-P2-004 CLOSED. Open critical: 0; high: 0; medium: 0.
