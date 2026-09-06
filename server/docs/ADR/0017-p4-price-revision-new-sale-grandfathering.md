# ADR-0017 — P4.3 Price Revisions, New-Sale Assignment and Grandfathering

Status: Accepted  
Date: 2026-09-06  
Scope: P4.3 internal price command and new-sale resolution layer

## Decision

P4.3 adds an internal command/repository port in `@product/pricing` and one
PostgreSQL adapter in `@product/db`. It introduces no HTTP surface, schema
change, migration, account override, subscription, billing, or entitlement
resolver. P6 remains responsible for authorization and transport.

Stable prices identify a plan, market, and channel. Commercial terms live in
server-numbered price revisions. Draft terms use a deterministic SHA-256
content fingerprint for optimistic concurrency; published revisions are
immutable and can be selected only by exact UUID.

## Serialization and audit

Same-plan price mutations take `p4-plan:<planId>` and then the price aggregate
lock. Revision and sale-assignment numbers are allocated while holding that
lock. Same-code creation uses `p4-price-code:<code>`. Changed commands and
exactly one audit event commit in one transaction; audit failure rolls the
commercial mutation back. Expected rejections and semantic no-ops create no
audit event.

Parent-plan archival is re-read under the shared plan lock. It blocks new
price/revision/sale mutations and ACTIVE/HIDDEN price targets, while price
archival remains possible. This makes a price mutation racing plan archival
linearizable: it either commits before archival or observes `ARCHIVED`.

## New-sale selection and grandfathering

`price_sale_assignments` is append-only. A non-NULL assignment selects one
published revision from its effective window; NULL is an explicit closure.
Assignment resolution chooses the highest assignment revision effective at the
evaluation time, then validates the exact selected revision window. Expired,
missing, closed, inactive, or otherwise invalid state fails closed without
falling back to an older assignment. Resolution performs no audit mutation.

Changing the selected revision changes only future new-sale resolution. Earlier
assignments and published revisions retain their UUID and all commercial terms,
providing catalog-level grandfathering without historical mutation.

## Deferred scope

Account overrides and entitlement resolution remain P4.4. Public catalog reads
remain P4.5. Subscriptions, checkout, billing, webhooks, and provider
adapters remain P5. Admin HTTP/RBAC remains P6. Bootstrap, device limits,
Bridge behavior, and migration `0008_p4_1_commercial_catalog.sql` remain
unchanged.
