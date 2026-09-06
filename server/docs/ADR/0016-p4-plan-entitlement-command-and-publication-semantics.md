# ADR-0016 — P4 Plan / Entitlement Command and Publication Semantics

Status: Accepted  
Date: 2026-09-06  
Scope: P4.2 internal plan and entitlement command layer

## Decision

P4.2 adds an internal command/repository port in `@product/plans` and one PostgreSQL adapter in `@product/db`. The command layer validates domain inputs and returns typed expected conflicts. It is not authorization: P6 owns admin authentication, authorization, and RBAC, and no admin or public HTTP transport is introduced here.

Every changed commercial mutation and exactly one corresponding audit event commit in the same PostgreSQL transaction. An audit failure rolls back the commercial mutation. Expected domain rejection produces no audit; semantic no-ops return `changed: false` and produce no duplicate audit.

## Aggregate serialization and revisions

All same-plan mutations take the transaction-scoped advisory lock `p4-plan:<planId>`. Plan-code creation uses `p4-plan-code:<code>`, entitlement-definition creation uses `p4-entitlement-definition:<entitlementKey>`, and revision allocation computes `MAX(revision)+1` only while holding the plan lock. Multiple draft revisions are allowed and receive distinct server-allocated revision numbers.

Published revisions are immutable. P4.2 does not create a current/active revision pointer; later consumers reference exact immutable revision UUIDs.

## Fingerprints and optimistic concurrency

`P4PlanRevisionContentFingerprintV1` is the lowercase SHA-256 fingerprint of the canonical plan revision identity, metadata, and lexically sorted typed entitlement composition. It excludes state, publication time, audit metadata, and database row order. It is an optimistic concurrency token only, never a credential, signature, authorization artifact, or remote protocol field. Draft writers must present the current fingerprint, so concurrent stale writers cannot overwrite each other.

## Typed definitions and deprecation

The only values are strict `BOOLEAN` and safe `INTEGER`. The only valid definition pairs are `BOOLEAN` + `CAPABILITY` and `INTEGER` + `LIMIT`. Definition consumers lock referenced rows `FOR SHARE` in lexical key order; deprecation locks a definition `FOR UPDATE`. SET and publication therefore serialize linearly with deprecation: the consumer either commits first or observes `ENTITLEMENT_DEPRECATED`. Deprecation blocks future SET and publication, but does not alter historical published revisions or their readable composition. Removal from a draft remains allowed after deprecation.

## Plan lifecycle

The exact transitions are:

| From | Allowed targets |
| --- | --- |
| DRAFT | ACTIVE or HIDDEN with at least one published revision; ARCHIVED always |
| ACTIVE | HIDDEN, ARCHIVED |
| HIDDEN | ACTIVE, ARCHIVED |
| ARCHIVED | none |

Same-state commands are no-ops. ACTIVE/HIDDEN cannot return to DRAFT. ARCHIVED is terminal. The plan status command updates `updated_at` from the injected command clock and audits the bounded code/status change.

## Deferred scope

Prices, price revisions, sale assignments, and price history are deferred to P4.3. Account overrides and entitlement resolution are deferred to P4.4. Subscription/account-plan authority, billing, checkout, webhooks, and provider adapters are deferred to P5. Admin HTTP/RBAC is deferred to P6. Bootstrap, production device-limit behavior, the Bridge boundary, and the accepted P4.1 schema/migration remain unchanged.
