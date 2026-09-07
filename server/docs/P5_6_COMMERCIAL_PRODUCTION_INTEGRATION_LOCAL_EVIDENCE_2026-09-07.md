# P5.6 Commercial Production Integration — Local Evidence

Status: **ACCEPTED — P5.6 DONE**

Technical ID: `PRODUCT-CONTROL-PLANE-P5.6-COMMERCIAL-PRODUCTION-INTEGRATION-LOCAL`
Attempt: `1`

## Base and runtime

- Repository: `MaksimUnimax/blood_sand`
- Worktree: `/opt/product-control-plane-src/blood_sand`
- Branch: `feature/product-control-plane-server-2026-09-04`
- Base HEAD: `adb963bf1157439093f0faddb3d237ccb5217c09`
- Remote validation used HTTPS fallback after SSH/443 timed out; both start
  probes returned the required SHA.
- Node: `v24.20.0`; pnpm: `10.34.5`; host Node 12 was not used.
- Disk remained below the requested 85% threshold with at least 8 GiB free;
  inode usage remained safe.

## Commercial integration

- Added `@product/commercial-access` as the application/domain integration
  layer.
- P5.2 `SubscriptionPlanRevisionBindingAdapter` and P4.4
  `BoundCommercialDeviceLimitResolver` are evaluated at one captured timestamp
  with exact plan-revision parity.
- Eligible access projects exact UUID plan revisions and BOOLEAN/INTEGER
  primitive entitlements, including false and zero; ineligible access projects
  `{}`.
- Bootstrap now projects the stored safe subscription state, exact plan UUID,
  and commercial entitlements. Paid snapshot offline grace is capped at the
  timestamp-authoritative period/grace deadline; near-boundary intervals fail
  closed. Signed envelopes continue to validate.
- Device admission uses `COMMERCIAL_PLAN_REVISION`, rejects missing/corrupt
  limits, returns `SUBSCRIPTION_REQUIRED` for ineligible accounts, and has no
  production pre-entitlement fallback. Activation uses
  `p5-subscription-account:<accountId>` plus account-row locking; P4 override
  changes and concurrent activation cases are covered. Lowering a limit does
  not auto-revoke existing devices.

## Portal and worker

- Implemented only `GET /v1/subscription` and `GET /v1/billing/payments`;
  both are owner-scoped, account-scoped, strict, and `Cache-Control: no-store`.
- Subscription and payment projections omit provider identifiers,
  idempotency hashes, billing events, checkout references, and reconciliation
  internals. Manual subscriptions support `price: null`.
- Added read-only `/billing` UX with account selection, access/subscription,
  exact plan and device allowance, safe payment history, and the message
  “Online payment is not enabled yet.” No purchase or mutation action exists.
- The provider-independent `SubscriptionLifecycleRunner` is composed in the
  production worker. Billing reconciliation and all simulator/provider
  adapters remain uncomposed in production API/worker main.

## Boundaries and schema

- Migrations remain `0000..0011`; no `0012` exists and migration bytes were not
  changed. Historical accepted hashes: 0009
  `d073221a237bdc867672b5e1e8223a0f62eacbb4670c1c19cfc346b64406e4ec`, 0010
  `28ec7583b9ad7497246580ce19a22ba82d72cc6ab223c6f9503f4b88ad1eef18`, 0011
  `5f55a0e69bdc49769cdb5e8796c0e8f4290372aeeaaca7a93792cab48bebef12`.
- No real provider, SDK, credentials, external payment calls, real money,
  webhook HTTP, fake checkout HTTP, fake completion HTTP, or refund HTTP was
  added. Payment go-live remains deferred; YooKassa and Tinkoff/T-Bank remain
  candidates only.
- Bridge was not changed. P5.7 remains planned and was not started.

## Acceptance counts

- Unit: `635` total, `128` new P5.6, `0` failed, `0` skipped/todo.
- Crypto regression: `12/12`.
- Real PostgreSQL integration: `1008` total, `152` P5.6, `0` failed,
  `0` skipped/todo. Retained counts: P5.5 `120`, P5.4 `116`, P5.3 `102`,
  P5.2 `90`, P5.1 `94`; P4.6/P4.5/P4.4/P4.3/P4.2/P4.1:
  `38/52/48/52/21/30`.
- E2E: `32` total, `8` new P5.6, `0` failed, `0` skipped, `0` retries.
- OpenAPI: exactly `18` routes; generated SHA:
  `117746551488dacf3f95090764a7a9df072b3468d6a4ffa6f68a44adf0ffe924`.
- Fresh PostgreSQL migration command passed twice; DB-down and DB-up gates,
  lint, format check, typecheck, unit, integration, OpenAPI, Bridge guard, and
  build passed.

## Roadmap state

P0–P4 DONE; P5 ACTIVE; P5.1–P5.5 DONE; P5.6 ACTIVE; P5.7 PLANNED;
P6–P15 PLANNED. Real payment go-live is DEFERRED.

## Remote acceptance

- Implementation commit: `2c1523d89821bc4d20dd00bf41346157167e5ae2`
  (`feat(server): wire commercial subscription access`).
- Implementation Server CI: run `34101970064`,
  [GitHub Actions run](https://github.com/MaksimUnimax/blood_sand/actions/runs/34101970064),
  exact head, `SUCCESS`.
- `REMOTE_P5_6_REVIEW=PASS`; critical `0`, high `0`, material medium `0`.
- Remote results: unit `635`; integration `1008`; P5.6 `152`; P5.5 `120`;
  P5.4 `116`; P5.3 `102`; P5.2 `90`; P5.1 `94`; P4.6/P4.5/P4.4/P4.3/P4.2/P4.1
  `38/52/48/52/21/30`; crypto `12/12`; E2E `32/32`.
- OpenAPI: `18` route/method tuples; SHA
  `117746551488dacf3f95090764a7a9df072b3468d6a4ffa6f68a44adf0ffe924`.
- Migrations remain `0000..0011`; migration `0012` is absent.
- Commercial bootstrap, device admission/limits, account-lock serialization,
  and portal commercial reads are production-wired and accepted. The
  pre-entitlement production fallback and simulator production payment wiring
  are absent; no real provider is integrated.
- P5.7 was not executed. Real payment go-live remains deferred; YooKassa and
  Tinkoff/T-Bank remain future candidates only.
