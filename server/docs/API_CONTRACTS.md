# Product Control Plane — API Contracts

Status: endpoint map before concrete OpenAPI schemas  
Date: 2026-09-03

## 1. General API rules

- version prefix: `/v1` for first public control-plane API;
- JSON UTF-8 unless provider webhook requires otherwise;
- runtime schema validation on every external body/query/params;
- stable machine error codes;
- correlation/request ID returned and logged;
- authorization explicit per endpoint;
- mutation idempotency specified per endpoint;
- no arbitrary diagnostic/config JSON bags;
- OpenAPI generated from accepted schemas in `packages/contracts`.

## 2. Error envelope

Conceptual:

```json
{
  "error": {
    "code": "DEVICE_LIMIT_REACHED",
    "message": "Human-readable safe message",
    "request_id": "...",
    "details": {}
  }
}
```

Clients branch on `code`. Human text may change/localize.

`details` is schema-defined per error family and cannot carry secrets/raw internal exceptions.

## 3. Authentication / portal API

### `POST /v1/auth/otp/request`

Purpose: request email OTP.

Properties:

- public;
- aggressive abuse/rate limiting;
- outward response avoids unnecessary account enumeration;
- durable email delivery job.

### `POST /v1/auth/otp/verify`

Purpose: verify OTP and establish portal user session or activation context.

Properties:

- single-use;
- attempt/expiry enforcement;
- audit security event.

### `POST /v1/auth/logout`

Revokes current web session.

## 4. Device authorization API

### `POST /v1/device-authorizations`

Auth: extension client, not yet user-authenticated.

Creates pending request.

Idempotency: repeated retries with explicit client idempotency key should not create unbounded pending devices.

### `POST /v1/device-authorizations/{id}/approve`

Auth: portal user/account owner.

Checks device entitlement limit and request expiry.

### `POST /v1/device-authorizations/{id}/deny`

Auth: portal user.

### `POST /v1/device-authorizations/token`

Extension exchanges approved device secret/code for session credentials.

Single-use.

### `POST /v1/auth/refresh`

Rotates refresh token atomically.

### `POST /v1/devices/{device_id}/revoke`

Portal/admin variants with RBAC.

### `GET /v1/devices`

Portal: list current account devices with safe metadata.

## 5. Bootstrap/client API

### `POST /v1/bootstrap`

Auth: extension access token.

Returns signed product snapshot described in `INTEGRATION_CONTRACT.md`.

The payload can be represented as canonical signed bytes/object during implementation; exact serialization is part of schema/signing spec.

### `GET /v1/client/releases`

Optional/public or authenticated metadata for latest/supported client releases. May be folded into bootstrap initially.

## 6. Account/subscription portal API

### `GET /v1/account`

Current account/product status.

### `GET /v1/subscription`

Portal session auth; the caller must be the account owner and supplies
`accountId` as a UUID query parameter. Returns safe timestamp-authoritative
subscription eligibility, exact plan/price revision terms, and the commercial
device allowance. Responses are `Cache-Control: no-store`.

### `GET /v1/plans/public`

Public unauthenticated new-sales catalog for an explicit `marketKey` and
`channelKey`. Both query parameters are mandatory stable lowercase machine
identifiers; the server does not infer either value from IP, locale, currency,
account, browser, or host. There is no public arbitrary-time query parameter.

The server captures one evaluation time for the request. The response lists
only sellable offers whose plan is `ACTIVE`, whose price is `ACTIVE`, and whose
highest `assignment_revision` with `effective_from <=` that server time selects
an immutable published price revision currently inside its half-open
`[effectiveFrom, effectiveTo)` window. A NULL selection closes new sales and
an expired selected revision is not replaced by an older assignment. Each offer
exposes the exact bound plan and price revision identities and plan commercial
copy; it does not expose entitlements, account eligibility, subscriptions,
account overrides, assignment internals, payment/provider data, or internal
reasons.

Successful empty catalogs return `200` with `offers: []`. Successful responses
include `Cache-Control: no-store`. Repository or invariant failures return the
safe `503 SERVICE_UNAVAILABLE` envelope.

### `GET /v1/billing/payments`

Portal session auth; the caller must be the account owner and supplies
`accountId`. Returns safe, account-scoped payment history with bounded cursor
pagination and no provider, event, reconciliation, or idempotency internals.
Responses are `Cache-Control: no-store`.

### `POST /v1/billing/checkouts` (deferred)

The checkout mutation is not publicly exposed during simulator-only P5. It is
deferred until payment go-live architecture selects and integrates a real
provider.

Input references exact available price revision.

Uses idempotency key.

No ordinary portal/public HTTP route may mint a paid subscription through the
deterministic simulator.

## 7. Billing provider webhooks

### `/v1/webhooks/billing/{provider}`

Provider-specific HTTP details are deferred; this route is not exposed during
simulator-only P5.

Rules:

- verify authenticity;
- deduplicate provider event identity;
- store event processing state;
- return provider-appropriate retry status;
- no subscription mutation before verification.

## 8. Diagnostics API

### `POST /v1/diagnostics/events`

Auth: extension access token.

Body is an array/batch of allowlisted event objects within explicit size/count bounds chosen as server operational limits.

Reject unknown secret/payload-like fields.

Potential event dimensions:

- event version;
- client/browser versions;
- AI/surface/profile;
- stable stage/error code;
- duration/count values;
- correlation ID.

## 9. Admin API groups

All admin APIs use the separate admin session/RBAC boundary. P6.2 implements
only the following 12 method/route tuples; every successful admin response is
`Cache-Control: no-store`.

### P6.2 accounts, users, subscription, and devices

- `GET /v1/admin/accounts` — exact account ID, owner user ID, exact normalized
  owner email, or status lookup; filters are mutually exclusive where stated,
  and pagination is bounded to 1–100 with a result-scoped UUID cursor.
- `GET /v1/admin/users` — exact user ID or exact normalized email, plus status.
- `GET /v1/admin/accounts/{account_id}/subscription` — shared safe P5
  timestamp-authoritative subscription projection.
- `GET /v1/admin/accounts/{account_id}/devices` — safe device metadata only.
- `POST /v1/admin/accounts/{account_id}/devices/{device_id}/revoke` — support
  revoke through the shared portal/device transaction; requires CSRF and a
  bounded operator reason.

### P6.2 audit and principals

- `GET /v1/admin/audit-events` — exact bounded filters and safe envelope only;
  `reason` and `safeMetadata` are never exposed.
- `GET /v1/admin/principals` — principal status, optimistic revision, and
  sorted active roles.
- `POST /v1/admin/principals` — create a principal for an existing active user
  with a verified email and one initial role.
- `POST /v1/admin/principals/{principal_id}/roles/{role}/grant`
- `POST /v1/admin/principals/{principal_id}/roles/{role}/revoke`
- `POST /v1/admin/principals/{principal_id}/suspend`
- `POST /v1/admin/principals/{principal_id}/restore`

Principal mutations require the current revision, CSRF, and a bounded reason;
they are transactionally audited and protect the last active `ADMIN_OWNER`.
Stable P6.2 failures include `ADMIN_RESOURCE_NOT_FOUND`, `ADMIN_CONFLICT`,
`ADMIN_STATE_STALE`, and `ADMIN_LAST_OWNER_REQUIRED`.

### P6.3 subscription and billing operations

P6.3 adds exactly seven method/route tuples. Every successful response remains
`Cache-Control: no-store`; all request objects are strict V1 contracts.

- `GET /v1/admin/accounts/{account_id}/billing/payments` — account-scoped,
  bounded UUID-cursor payment history with safe plan snapshot fields only;
  requires `billing.read` and no CSRF.
- `GET /v1/admin/accounts/{account_id}/billing/events` — account-scoped,
  bounded UUID-cursor safe billing-event projection; unlinked or inconsistent
  cross-account events fail closed; requires `billing.read` and no CSRF.
- `GET /v1/admin/accounts/{account_id}/billing/reconciliation-jobs` —
  account-scoped payment-backed job projection ordered by `updatedAt` and
  payment ID; lease tokens and provider data are never exposed; requires
  `billing.read` and no CSRF.
- `POST /v1/admin/accounts/{account_id}/subscription/grant` — requires
  `subscription.grant` and admin CSRF; accepts a published plan revision,
  future offset-aware period end, and the bounded P6.2 admin reason.
- `POST /v1/admin/accounts/{account_id}/subscription/{subscription_id}/extend`
  — requires `subscription.extend` and admin CSRF.
- `POST /v1/admin/accounts/{account_id}/subscription/{subscription_id}/suspend`
  — requires `subscription.suspend` and admin CSRF.
- `POST /v1/admin/accounts/{account_id}/subscription/{subscription_id}/restore`
  — requires `subscription.restore` and admin CSRF.

The four subscription mutations delegate to the accepted P5 command repository
and its state machine, period/grace validation, optimistic revision, transition,
and audit semantics. The acting admin is reauthorized from current database
authority inside the same transaction. Extend, suspend, and restore require
the immutable subscription/account path binding. P5 failures map to the
stable admin resource-not-found, stale-state, conflict, forbidden, and service
unavailable envelopes; raw SQL state and internal exceptions are never exposed.

Safe billing projections exclude provider identities, payment provider IDs,
idempotency and request-fingerprint hashes, event identities, payload hashes,
raw payloads, and reconciliation lease tokens. P6.3 adds no billing mutation,
checkout, webhook, provider integration, or admin UI.

Subscription mutation, plans, prices, entitlements, AI/health/diagnostics, and
account/user status mutations remain outside P6.3 and are assigned to later
roadmap stages.

### P6.4 commercial and compatibility operations

P6.4 adds exactly 27 method/route tuples (OpenAPI total: 67). All use the
separate admin session boundary, exact permissions, bounded cursor pagination
(default 50, maximum 100), strict V1 objects, `Cache-Control: no-store`, and
safe stable error envelopes. GET requests do not require CSRF; every POST does.

The eight reads are plans and plan inspection, prices and price inspection,
entitlement definitions, account override history, effective account
entitlement, and compatibility policies. Plan and price inspection reuses
`CommercialCatalogInspectionReader`; revision content fingerprints reuse the
accepted P4 fingerprint functions. Effective entitlement reuses the current
P5 account plan binding and `CommercialEntitlementResolver`. Assignment and
override operator reasons, signing-key material, rollout seeds, and config
release internals are not returned.

The nineteen mutations compose the accepted P4 commands for plan/price/
definition/override operations and the accepted P3
`PublishCompatibilityPolicyRevisionCommand`. P4 remains authority for path
coherence, optimistic fingerprints/revisions, typed values, deprecation,
effective windows, idempotency, and audit. Compatibility publication is
revision-only and returns `REVISION_PUBLISHED_NOT_AUTO_ACTIVATED`; it never
publishes a config release or changes signing keys, rollouts, or feature rules.

Every mutation performs transaction-time current-admin authorization by locking
the actor principal, reloading current grants, and recomputing the exact
permission before the existing P4/P3 domain lock. The P4 hooks are optional so
direct P4 callers retain accepted behavior. AI/profile, health, diagnostics,
signing-key/config-release/rollout/feature administration, admin UI, and real
payment-provider go-live remain outside P6.4.

### Plans

- create draft plan;
- create plan revision;
- publish/hide/archive;
- manage draft entitlements.

### Prices

- create draft price revision;
- publish/retire for new sales;
- migration operations later.

### Entitlements/features

- account overrides;
- feature rules;
- rollout rules.

### AI adapters/profiles

- adapters/surfaces list;
- create candidate profile revision;
- validate profile;
- test candidate;
- publish;
- rollout;
- pause;
- rollback;
- maintenance/disable state.

### Health

- current matrix;
- runs;
- incidents;
- safe evidence metadata/authorized object link;
- trigger run;
- candidate run.

### Diagnostics

- aggregate queries only across allowlisted dimensions;
- drilldown to safe event metadata according to role.

### Audit

- read audit events with filters.

## 10. Health-runner internal API

Health runners need service authentication distinct from user/admin access tokens.

Conceptual operations:

- claim/start run;
- fetch suite/profile revision;
- heartbeat;
- upload structured contour results;
- request evidence upload target;
- finalize run.

Do not give health runner broad admin mutation credentials.

Candidate profile runs receive exact candidate revision and cannot self-publish it.

## 11. Notification/worker internal contract

Prefer durable jobs/domain events over exposing broad internal HTTP where processes share the modular-monolith codebase.

If separate deployment requires HTTP later, introduce service-authenticated APIs deliberately.

## 12. Idempotency convention

For retryable client mutations, support an `Idempotency-Key` or equivalent explicit request identity.

Store scope + key + canonical result/status for an appropriate bounded duration where needed.

Payment-provider event idempotency uses provider event identity in addition to request idempotency.

## 13. Pagination

Admin/portal list endpoints use cursor-based pagination where data volume can grow.

Do not expose unbounded `GET all diagnostics/audit/payments` endpoints.

## 14. Dates/times

API timestamps are UTC ISO-8601 strings with timezone/`Z` semantics. DB uses timezone-aware timestamps.

Billing period semantics must distinguish absolute timestamps from business billing intervals.

## 15. Money

API monetary values are explicit structured objects, e.g.:

```json
{
  "amount_minor": 19000,
  "currency": "RUB"
}
```

No floating monetary amount.

## 16. Version/precondition handling

Admin mutations of versioned draft/config objects should support optimistic concurrency/version preconditions to prevent two operators overwriting each other.

Published immutable revisions never need in-place concurrent editing.

## 17. Public schema artifacts

P1/P3 will create:

- generated OpenAPI JSON/YAML artifact;
- JSON schemas/TypeScript contracts as appropriate;
- simulated extension reference client/tests;
- contract compatibility tests.

The generated API spec must be checked for drift in CI.
