# ADR-0020 — P5 Subscription / Billing Persistence Foundation

Status: Accepted  
Date: 2026-09-06  
Scope: P5.1 provider-neutral subscription and billing persistence

## Decision

P5.1 adds provider-neutral PostgreSQL persistence only. The core billing model
does not select or depend on a production payment provider. All P5 payment
behavior is owned by the deterministic simulator decision: later P5 substages
use a `BillingProviderPort` with a deterministic `StubBillingProvider` or
`FakeBillingProvider`.

YooKassa and Tinkoff/T-Bank acquiring remain future candidates only. During P5
there is no real provider selection, provider SDK, merchant/shop credential,
provider API call, real webhook secret, production checkout session, or real
money processing. Real payment go-live is deferred until the remaining product
roadmap is complete and a separate final payment go-live architecture and
acceptance gate passes.

P5.1 creates exactly four core tables:

- `subscriptions`;
- `subscription_transitions`;
- `payments`;
- `billing_events`.

It creates no checkout intent, billing customer, provider mapping, refund,
chargeback, reconciliation-job, subscription-job, admin-billing, HTTP,
provider, or domain-service table/package.

## Subscription authority

The physical subscription state set is exactly `TRIAL`, `ACTIVE`, `GRACE`,
`PAST_DUE`, `CANCELED`, `EXPIRED`, and `SUSPENDED`. At most one non-`EXPIRED`
subscription may exist for an account; historical `EXPIRED` rows remain
allowed. A subscription binds an exact published plan revision. It does not
require the stable plan to remain `ACTIVE`, so hidden and archived historical
plan identities remain valid.

The bound price revision is nullable for trial/manual/future policy-based
access. When present it must be published. The exact plan revision and bound
price revision must belong to the same stable plan identity, but they may be
different exact revisions. A previously published, unselected price revision
may remain bound for a grandfathered subscriber.

Subscription identity is immutable, and subscription deletion is rejected.
`state_revision` is the positive revision foundation. The legal state machine
is deliberately deferred to P5.2.

`subscription_transitions` is append-only, uniquely revisioned per
subscription, and records the exact internal source set
`CHECKOUT`, `WEBHOOK`, `RECONCILIATION`, `JOB`, `ADMIN`, `SYSTEM`. The initial
revision requires a null `from_state`; later revisions require a non-null
`from_state`; no transition graph is encoded in P5.1.

## Canonical payments

Payments use exactly `PENDING`, `SUCCEEDED`, `FAILED`, `CANCELED`, `REFUNDED`,
and `CHARGEBACK`. Money is an integer minor-unit `BIGINT` in the inclusive
range `0..9007199254740991`, with an explicit three-letter uppercase currency.
The provider is only a generic machine key. The provider payment identity is
unique with `(provider, provider_payment_id)`.

The payment's immutable commercial identity includes its account, provider,
provider payment ID, exact price revision, amount, currency, idempotency hash,
request fingerprint, and creation time. Payment terms must equal the immutable
published price revision. The server idempotency uniqueness is scoped by
`(account_id, idempotency_key_hash)`, independently of provider routing.

The optional payment-to-subscription link is same-account and set-once:
`NULL -> subscription` is allowed, but a non-null link cannot change or clear.
Historical payments are not required to equal a subscription's current plan
or price indefinitely. Canonical payments cannot be deleted.

## Validated billing-event ledger

Billing events use only the observation sources `WEBHOOK` and
`RECONCILIATION`, and processing states `VERIFIED`, `APPLIED`, `IGNORED`, and
`FAILED`. `(provider, event_identity)` is globally unique across observation
sources. Raw provider payload, JSON/body, headers, and arbitrary provider
metadata are not stored; only the payload SHA-256 fingerprint and canonical
references are persisted.

Insertion is `VERIFIED` only, with no result references, failure code, or
processed time. A verified event may terminalize exactly once to `APPLIED`,
`IGNORED`, or `FAILED`; terminalization requires `processed_at`, and `FAILED`
requires a failure code. Terminal rows are immutable and deletion is rejected.
References are checked for matching subscription transition ownership and
same-account payment/subscription identity.

## Deferred implementation

P5.2 owns the subscription FSM, internal manual commands, exact revision
bindings, eligibility/read contracts, and audit behavior. P5.3 owns the
provider-neutral port, deterministic fake provider, simulated checkout, and
checkout idempotency. P5.4 owns simulated verified event application. P5.5
owns simulated reconciliation and durable period/grace/expiry/cancel jobs.
P5.6 owns eventual bootstrap/device-limit/portal integration. P5.7 owns the
simulated-billing final acceptance. P5.1 does not implement checkout,
webhook HTTP, FSM/commands, reconciliation, admin billing HTTP, portal UI,
bootstrap wiring, or commercial device-limit production wiring.
