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

Current subscription/plan/price revision and period state.

### `GET /v1/plans/public`

Public/eligible plan and current price revisions for purchase UI.

### `POST /v1/billing/checkouts`

Auth: account owner.

Input references exact available price revision.

Uses idempotency key.

Returns provider checkout URL/reference.

### `GET /v1/billing/payments`

Portal safe payment history.

## 7. Billing provider webhooks

### `/v1/webhooks/billing/{provider}`

Provider-specific HTTP details handled by adapter.

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

All admin APIs use separate admin auth/RBAC and audit mutation.

### Accounts

- `GET /v1/admin/accounts` search;
- `GET /v1/admin/accounts/{id}`;
- account status actions as specifically defined.

### Devices

- list;
- revoke.

### Subscriptions

- grant;
- extend;
- suspend;
- restore/cancel according to state machine.

Each action is an explicit command endpoint or typed mutation, not arbitrary subscription row editing.

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