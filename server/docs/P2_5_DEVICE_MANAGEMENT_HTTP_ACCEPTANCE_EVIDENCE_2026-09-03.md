# P2.5 device-management HTTP acceptance evidence

Status: **ACCEPTED — P2.5 DONE**

ADR 0007 remains the authority: approval records intent, while exchange grants
the capability. `DeviceLimitResolver` remains the adapter-only
`PRE_ENTITLEMENT_BASELINE` (one active device); no P4 entitlement persistence
exists.

Implemented public routes are exactly `POST /v1/device-authorizations/token`,
`GET /v1/devices`, and `POST /v1/devices/{device_id}/revoke`. Exchange requires
a strict `{ deviceCode }` body and `Idempotency-Key`; it returns only the
documented credential projection with `Cache-Control: no-store` and `Pragma:
no-cache`. Pending, limit, closed, invalid, rate-limited, and unavailable core
states map to the specified error envelopes. The API does not enable proxy
trust and supplies Fastify's `request.ip` to the exchange service.

List authenticates the existing portal session, requires an OWNER for its
strict account/cursor query, and returns only the safe device projection.
Revoke reuses the portal cookie/CSRF protocol, hides cross-account existence as
`DEVICE_NOT_FOUND`, is idempotent, and returns only `{ status, deviceId }` after
the domain transaction completes. Suspended accounts may list and revoke.

T1/T2: the accepted domain tests and PostgreSQL A–J integration flow remain
green. T3 boundary coverage is in
`apps/api/src/device-management-routes.test.ts`: credential projection and
headers, strict schema rejection before service invocation, all exchange
state mappings, portal authentication, and CSRF. The existing real PostgreSQL
integration run completed with 38 tests passing.

OpenAPI is generated from the real composition using synthetic domain services;
it contains 12 public routes and has SHA-256
`9f4de9c2966f778a269782a7bc532315384af56f566575cc81ed9f470b81885e`.
The artifact was regenerated and checked under Node 24.20.0/pnpm 10.15.1;
PostgreSQL acceptance used 18.0. No device code or refresh token appears in a
URL example. Bridge guard passed and the device-management package remains
independent of Fastify, Drizzle, pg, and Next.js.

Implementation commit `e40b699e53176a71696be63416133a5d0b105fe6` passed the
exact Server CI push run [33761138559](https://github.com/MaksimUnimax/blood_sand/actions/runs/33761138559).
Known limitation: P2.6 portal activation UI and simulated extension E2E are not
implemented.
