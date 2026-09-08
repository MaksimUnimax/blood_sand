# ADR-0028 — P6.3 admin subscription and billing operations

Status: Accepted  
Date: 2026-09-08

## Decision

P6.3 is implemented on the accepted P6.2 final base `93a8bb4541e58126251040b6c2ff8f9dd8f80dbb`. It adds the DB-independent `@product/admin-billing` application boundary and exactly seven method/route tuples:

`GET /v1/admin/accounts/{account_id}/billing/payments`,
`GET /v1/admin/accounts/{account_id}/billing/events`,
`GET /v1/admin/accounts/{account_id}/billing/reconciliation-jobs`,
`POST /v1/admin/accounts/{account_id}/subscription/grant`,
`POST /v1/admin/accounts/{account_id}/subscription/{subscription_id}/extend`,
`POST /v1/admin/accounts/{account_id}/subscription/{subscription_id}/suspend`, and
`POST /v1/admin/accounts/{account_id}/subscription/{subscription_id}/restore`.

The final OpenAPI surface is 40 method tuples. Billing reads require
`billing.read`. Grant, extend, suspend, and restore require their exact
`subscription.*` permission and admin CSRF. Reads require a valid admin session
and no CSRF. All successful admin responses use `Cache-Control: no-store`.

No migration is added. The migration set remains `0000..0012`; migration 0012
is unchanged. P6.3 does not add a provider SDK, provider credentials, real
webhook secret, provider API call, checkout URL/session, acquiring, or real
money. Payment go-live remains deferred.

## Subscription command composition

The four admin commands reuse the accepted P5 `grantSubscription`,
`extendSubscription`, `suspendSubscription`, and `restoreSubscription`
repository methods. P6.3 adds only an optional DB-level `beforeMutation` hook
to that repository. Existing callers that omit the hook retain their original
semantics. The admin adapter does not implement subscription SQL, the FSM,
period/grace validation, revisions, transitions, suspend-origin restore, or
audit.

The hook invokes the shared DB-internal admin-authorization primitive. It locks
the actor `admin_principals` row `FOR UPDATE`, requires an ACTIVE principal,
loads current non-revoked grants, computes permissions with the accepted
`@product/admin-auth` policy, and requires the exact route permission. The lock
is retained until the P5 mutation commits, serializing current-admin authority
with role grant/revoke and principal suspend/restore. P6.2 principal/device
operations use the same helper; their behavior is unchanged.

Each successful command passes P5 context with `actorType: ADMIN`, the acting
principal ID, the request correlation ID, and the validated bounded P6.2 admin
reason. P5 remains the sole audit authority, producing
`SUBSCRIPTION_GRANTED`, `SUBSCRIPTION_EXTENDED`, `SUBSCRIPTION_SUSPENDED`, or
`SUBSCRIPTION_RESTORED` with `ADMIN` source/context. P6.3 writes no duplicate
subscription audit event. Extend, suspend, and restore validate the immutable
subscription/account path binding before P5 advisory locks and mutation logic.

The HTTP mapping is deterministic: missing account, subscription, plan, or
path binding maps to `ADMIN_RESOURCE_NOT_FOUND`; stale state maps to
`ADMIN_STATE_STALE`; accepted P5 conflicts map to `ADMIN_CONFLICT`; current
authorization denial maps to `ADMIN_FORBIDDEN`; corruption and unexpected
internal failures map to `SERVICE_UNAVAILABLE`. SQLSTATE and raw exceptions
are not exposed.

## Safe billing projections

The DB read repository uses explicit parameterized columns and account-scoped
queries. Payments are ordered by `createdAt DESC, id DESC`; events use the same
cursor order; reconciliation jobs are ordered by `updatedAt DESC, paymentId
DESC`. Cursors are UUIDs and remain scoped to the account and query. Account
existence is checked even for empty pages. Amounts and bounded counters are
validated as safe integers.

Payment responses may include the subscription, state, amount/currency,
timestamps, and safe plan snapshot. Event responses may include the safe source,
type, processing state, linked IDs, failure code, and lifecycle timestamps.
Reconciliation responses may include payment ID, state, retry timing, attempt
count, result code, and timestamps. Provider names and payment identities,
idempotency keys/hashes, request fingerprints, event identities, payload hashes,
raw payloads, and lease tokens are never exposed. Events are attributable only
through linked account data; inconsistent payment/subscription account links
fail closed with service unavailable. There is no billing mutation, payment
mutation, reconciliation command, checkout, webhook, or replay route.

## Boundaries

P6.3 does not add plan, price, entitlement, compatibility, or account-status
admin mutations, an admin UI, a real payment provider, or a Bridge change.
P6.4 and P6.5 remain planned, P7 remains planned, and payment go-live remains
`DEFERRED`.

## Consequences

P5 remains the only subscription mutation engine and audit authority. P6.2
retains its accepted route, RBAC, CSRF, last-owner, device, and principal
semantics while gaining the shared transaction-time authorization primitive.
The new billing read surface is deliberately safe-by-projection and account
scoped, suitable for local operational acceptance before any future provider
integration decision.
