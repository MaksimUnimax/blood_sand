# P3.4 authenticated bootstrap snapshot — local evidence

**Status: ACCEPTED — P3.4 DONE**

## Attempt history and base

Attempt 1 was partial implementation with incomplete acceptance. Attempt 2 added
signing/config verification but lacked real-PG/E2E proof. Attempt 3 completed
real-PG integration and E2E composition but did not capture aggregate final
acceptance. Attempt 4 completed final local acceptance.

- Branch/base: `feature/product-control-plane-server-2026-09-04`,
  `7155c080527d3bfa9a2dc71c99c4f4b33ab95727`.
- Remote start checks (two, four seconds apart): both that SHA.
- One deterministic E2E-only defect was found and fixed: Playwright starts
  `webServer` before `globalSetup`; the API web-server command now runs the
  normal migrator before the unchanged real API harness starts.

## Implementation and wire boundary

`@product/bootstrap` has no Fastify or DB dependency. Production composes the
database catalog, P3.3 resolver, existing extension authentication, strict
API-only config signer loader, DB public-metadata binder, and `BootstrapService`.
The Playwright API harness composes those same concrete services and generates
one Ed25519 signing identity at runtime.

The request preserves `detectedAi` as the optional strict object
`{ family, surface, variant? }`; it is validated, ignored, unpersisted, and
unsigned. `devicePolicy` in the signed payload is exactly `{ status: "ACTIVE" }`.
Snapshots are full (including when `lastConfigVersion` is current): account
ACTIVE, subscription NONE/null, empty entitlements, P3.3 features and
compatibility, and AI UNCONFIGURED. One clock read supplies equal serverTime and
issuedAt; expiry is +15 minutes and grace is +24 hours after expiry.

Signing is Ed25519-only with canonical Base64 API configuration,
derived SPKI/SHA-256 and exact DB public-metadata binding. The selected config
key ID must match the configured signer. P3.5 lifecycle/rotation and P3.6 cache
or offline-consumption behavior are absent.

## Results

- Node `v24.20.0`, pnpm `10.34.5`.
- Unit: **145 passed**, 0 failed, 0 skip/todo; P3.1 crypto remains 12/12;
  bootstrap focused 4/4; signing/binding focused 8 physical assertions.
- Fresh PostgreSQL `18.0`: complete integration **81/81**, 0 failed/skip/todo;
  P3.4 focused **9/9** (verified 200, 401, 400, 403, no-config 503,
  signer mismatch 503, metadata mismatch fail-closed, UPDATE_REQUIRED signed
  200, current `lastConfigVersion` full signed 200). Normal bootstrap audit
  non-write and ignored detectedAi are asserted in the focused suite.
- Migrations `0000` through `0007` SHA-256 match committed base exactly;
  no `0008`; first and second normal migrator runs passed.
- Fresh validation copy manifest: 804 files, hash match YES.
- DB-down: frozen install, lint, format, typecheck, unit, OpenAPI check,
  bridge guard, and build all passed. DB-up repeats all gates plus migration
  and integration: all passed; build exit 0.
- OpenAPI: 15 routes; one `POST /v1/bootstrap`; both generation SHA-256:
  `1d4869210b66d48c7f51978f85ebf21869d61a29d9a47d7fa2ffae0a9f9a8cff`.
- Playwright `1.62.1`; project cache Chrome for Testing `151.0.7922.34`,
  Chromium revision `1234`; launch/close smoke passed. Full fresh-DB E2E:
  **13/13 passed**, 0 fail, 0 skip, 0 retries. Its six P3.4 physical cases
  cover 401/400/403/503/verified-200/UPDATE_REQUIRED-verified-200.

Security review found no tracked config signing private key, DB private-key
column, private-key HTTP/log output, raw bootstrap-body/detectedAi logging,
bridge runtime import, P3.5 lifecycle implementation, or P3.6 offline cache.
ADR-0012 remains Accepted. P3.4 is DONE; P3.5 is NEXT; P3.6 is PLANNED.

## Remote acceptance review

- Implementation SHA: `0d094dc6e809b95e2273406059e0ac66e061e8ef`.
- Canonical branch: `feature/product-control-plane-server-2026-09-04`.
- Code CI run: `33869699019` (`https://github.com/MaksimUnimax/blood_sand/actions/runs/33869699019`).
- Remote review result: PASS (expected files only, expected behavior checks, no OUT_OF_SCOPE).
- Final counts:
  - Unit tests: 145 passed.
  - Integration tests: 81 passed.
  - P3.4 integration cases: 9/9.
  - E2E tests: 13 passed.
- OpenAPI:
  - route count: 15
  - `POST /v1/bootstrap`: 1
  - SHA-256: `1d4869210b66d48c7f51978f85ebf21869d61a29d9a47d7fa2ffae0a9f9a8cff`
- Migration state: `0000` through `0007` only; no `0008`.

## Post-acceptance documentation correction

- Previous docs SHA: `4dd3001a7a95ab816a8ebbaa0afd0743a542ad47`.
- Reason: the final roadmap marker and one stale evidence sentence did not match
  the intended accepted roadmap state.
- Product implementation, schema and tests are unchanged; this is a
  documentation-only correction, not a product defect.
