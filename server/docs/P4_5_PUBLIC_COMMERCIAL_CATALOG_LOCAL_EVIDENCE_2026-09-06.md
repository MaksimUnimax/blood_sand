# P4.5 Public Commercial Catalog Local Evidence

Status: LOCAL ACCEPTED — P4.5 ACTIVE

## Base and scope

- Branch: `feature/product-control-plane-server-2026-09-04`
- Base/head: `3631412c8780da857932ea957b32ce231cef54d1`
- Remote start checks: both matched the required base SHA.
- Package: `@product/commercial-catalog`.
- Database dependency: none in the domain package; SQL is isolated in `@product/db`.
- Mutation surface: none.
- No schema changes, no migration `0009`, and migration `0008` remained SHA `d661f98db6b18a2181fe2094f0715b11eb56eec7e96270d9634f4cd2fc8dc9f1`.

## Public catalog

`GET /v1/plans/public` is public and unauthenticated. `marketKey` and
`channelKey` are mandatory strict stable identifiers. There is no public `at`
parameter; one server evaluation time is injected per request. Successful
responses use `Cache-Control: no-store`, preserve request IDs, and return
`200` with `offers: []` when no offer is sellable. Reader failures return the
safe `503 SERVICE_UNAVAILABLE` envelope.

The response uses catalog version `public_commercial_catalog_v1` and exposes
only safe commercial copy and immutable plan/price revision fields. It does
not expose entitlements, account data, assignment internals, seller data,
payment data, or arbitrary metadata. Offers are ordered by `planCode`,
`priceCode`, `planRevisionId`, then `priceRevisionId`.

Sellability is evaluated at one coherent repeatable-read snapshot: plan and
price are `ACTIVE`; the highest effective assignment revision is selected;
`NULL` closes the stable price; selected revisions are `PUBLISHED` and use
`[effectiveFrom,effectiveTo)`; expiry has no fallback; and the exact bound
published plan revision supplies display metadata. Multiple price identities
and different exact plan revisions may produce multiple offers.

Real-PostgreSQL conformance cases compare public behavior with the accepted
P4.3 resolver for ordinary selection, future assignment, explicit closure,
expiry, no-fallback, hidden price, and inactive plan scenarios. A coordinated
concurrency test proves that one response cannot mix commercial epochs.

## Internal consumer read ports

- `PurchasableOfferResolver` validates the exact requested immutable
  `priceRevisionId` as currently selected and sellable, with stable typed
  non-sellability codes. Historical published-but-not-selected revisions are
  rejected. Account eligibility, subscriptions, billing, checkout, and
  payment policy remain deferred.
- `CommercialCatalogInspectionReader` provides deterministic plan and price
  history. Plan revisions and price revisions are ordered by revision;
  entitlement composition is lexical and typed; sale assignments are ordered
  by assignment revision. DRAFT, HIDDEN, and ARCHIVED history remains visible.
  Freeform assignment reasons are omitted. No P6 HTTP, RBAC, or mutation
  surface was added.

All read paths create no audit events.

## Verification

- Unit/API: `253` total, baseline `231`, `22` new P4.5 tests, `0` failed,
  `0` skipped/todo.
- Integration: `296` total, baseline `244`, `52` distinct P4.5 cases,
  `0` failed, `0` skipped/todo.
- Retained integration groups: P4.1 `30/30`, P4.2 `21/21`, P4.3 `52/52`,
  P4.4 `48/48`; P4.5 public catalog `22`, P4.3 conformance `7`, P5 exact
  resolver `12`, P6 inspection `10`, snapshot concurrency `1` (the full
  P4.5 suite contains `52` distinct tests).
- Crypto: `12/12`.
- E2E: `24/24`.
- DB-down and DB-up gates: PASS.
- Migrations: first and second runs PASS.
- OpenAPI: old route count `15`; new route count `16`; exactly one
  `GET /v1/plans/public` and one `POST /v1/bootstrap`.
- OpenAPI SHA, generated and checked twice: `038fe97ae7bf1d44563f768dbe6335c087e3430f255986325fad65de422b308f`.

## Safety and staging

No subscriptions, account current-plan/current-price authority, billing,
checkout, payment, webhooks, admin mutation HTTP, public entitlement
overrides, bootstrap changes, production device-limit wiring, or Bridge
changes were added. Root disk remained within the required safety threshold.

