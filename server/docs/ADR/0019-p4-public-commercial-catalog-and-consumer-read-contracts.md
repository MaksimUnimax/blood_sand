# ADR-0019 — P4.5 Public Commercial Catalog and Consumer Read Contracts

Status: Accepted  
Date: 2026-09-06  
Scope: P4.5 read-only commercial catalog materialization

## Decision

P4.5 adds read contracts only. It creates no schema or migration and leaves the
accepted P4.1 commercial schema and migration `0008` unchanged.

The public transport is `GET /v1/plans/public`. It is unauthenticated and
requires explicit `marketKey` and `channelKey` stable machine identifiers. The
public request has no arbitrary-time parameter; the server captures one
evaluation time and evaluates the complete response against that coherent
commercial snapshot.

## Public new-sale semantics

An offer is included only when its plan is `ACTIVE` and its stable price is
`ACTIVE`, the market and channel exactly match the request, and the highest
`assignment_revision` with `effective_from <= T` exists. A future assignment is
ignored until its effective time. A selected NULL revision explicitly closes
new sales.

The selected price revision must be published and its effective window is
half-open: `[from, to)`. At exact `effectiveTo` it is not sellable. If the
selected revision is expired, missing, not published, or otherwise corrupt, the
reader fails closed and never falls back to an older assignment or revision.
The selected price revision must bind to a published plan revision belonging to
the same stable plan. The public offer exposes that exact plan revision ID,
revision number, display name, and description; no current/default plan or
price pointer is invented.

Multiple stable price identities may therefore produce multiple offers for one
stable plan, including offers bound to different exact plan revision IDs. The
public model contains no entitlements, account overrides, account or
subscription data, assignment IDs/reasons, audit metadata, seller data, or
payment/provider data. It returns a typed money object and billing interval and
uses deterministic lexical ordering by plan code, price code, plan revision ID,
and price revision ID. An empty catalog is `200` with `offers: []`, and success
uses `Cache-Control: no-store`.

## Internal consumer ports

`@product/commercial-catalog` owns three mutation-free read ports:

- `PublicCommercialCatalogReader.listPublicOffers({ marketKey, channelKey, at })`;
- `PurchasableOfferResolver.resolvePurchasableOffer({ priceRevisionId, at })`,
  which validates the exact immutable revision's current selection and
  sellability, not merely publication;
- `CommercialCatalogInspectionReader.inspectPlan(planId)` and
  `inspectPrice(priceId)` for P6 historical inspection.

P5 account eligibility, subscription lifecycle, checkout, billing, payment, and
provider policy remain deferred. P6 authorization/RBAC, admin HTTP, and
mutations remain deferred. P6 inspection reads DRAFT, ACTIVE, HIDDEN, and
ARCHIVED history, orders revisions deterministically, returns typed entitlement
composition, and omits freeform sale-assignment reasons. No P6 account-specific
override resolution is exposed by the public model.

## Consistency and staging

Public, P5, and P6 reads execute in a repeatable-read, read-only PostgreSQL
transaction. Reads do not append audit events. Production bootstrap,
subscription/current-plan authority, account/current-price authority, the
production device-limit resolver, and Bridge behavior remain unchanged.
