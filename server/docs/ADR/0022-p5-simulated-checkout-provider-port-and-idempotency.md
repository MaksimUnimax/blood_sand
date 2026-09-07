# ADR-0022 — P5.3 Simulated Checkout Provider Port and Idempotency

Status: Accepted  
Date: 2026-09-06  
Scope: P5.3 internal simulated checkout orchestration

## Decision

P5.3 remains simulator-only. The payment owner decision is an internal,
provider-neutral `BillingProviderPort` with checkout capability only. Its exact
provider key for this stage is `simulator`. YooKassa and Tinkoff/T-Bank remain
future candidates only. There is no provider SDK, credential, merchant/shop
secret, webhook secret, provider URL, outbound network call, payment
instrument, or real-money processing.

The port exposes only `createCheckout(input)`. P5.4/P5.5 own event ingestion,
status lookup, webhook verification, refunds, and reconciliation contracts.
The input contains `providerRequestId` (the checkout intent UUID), amount,
currency, and frozen billing interval terms. Raw client idempotency keys,
account identity/email, Ozon or seller data, credentials, and provider secrets
never leave the checkout service.

Normalized provider results are `CREATED` with three bounded opaque safe
identities, `REJECTED`, or `UNAVAILABLE`. Expected failures are values;
unexpected adapter exceptions become retryable `PROVIDER_UNAVAILABLE`. The
checkout reference is a non-secret simulator reference, not a URL.

## Durable intent and admitted snapshot

P5.3 adds exactly one table, `checkout_intents`, through migration `0010`.
Its only lifecycle states are `CREATING`, `READY`, and `FAILED`. The physical
guard permits only `CREATING -> READY` or `CREATING -> FAILED`, requires the
corresponding terminal shape, rejects deletion, protects terminal rows and the
immutable identity/snapshot fields, and enforces the account/key, provider
identity, and payment uniqueness rules.

The new-admission path captures one server `now` and calls the accepted P4.5
`PurchasableOfferResolver` for the exact requested price revision. All P4.5
failure codes are preserved. The resolved exact plan revision, price revision,
amount, currency, interval, and admitted time are frozen. The database trigger
also verifies published revisions, the exact plan relationship, exact terms,
and the admitted half-open price window. It does not re-evaluate mutable sale
assignment or stable plan/price status.

Once a `CREATING` intent exists, a retry uses that immutable snapshot and does
not rerun public new-sale validation. Thus a retry remains valid after sale
closure or selection change, while a genuinely new checkout is rejected by
P4.5.

## Account authority and idempotency

Checkout is an account-owner action. The repository requires an existing
account, an `ACCOUNT_USER` context whose actor is an `OWNER` membership, and an
`ACTIVE` account. Any current subscription state other than `EXPIRED` blocks
this new-subscription-only flow. Renewal, migration, upgrade/downgrade, and
activation are out of scope.

The raw idempotency key is hashed with the explicit
`product-control-plane/checkout-idempotency/v1` domain and only the lowercase
SHA-256 is persisted. It is not logged, audited, or sent to the simulator.
The request fingerprint uses
`product-control-plane/checkout-request/v1` and the canonical account and
price-revision identities. Provider is deliberately excluded, so routing
changes cannot bypass account idempotency. The account/key uniqueness is the
server authority; different accounts may reuse the same raw key.

## Locking and finalization

Prepare and finalization reuse the P5.2 account advisory lock
`p5-subscription-account:<accountId>`. Prepare takes the account lock, then
rechecks account/owner/current-subscription policy and idempotency before
inserting `CREATING` plus `CHECKOUT_INTENT_CREATED`. Finalization takes the
same account lock, locks the checkout row, rechecks account status/current
subscription, then atomically writes the terminal checkout state and audit.
No database transaction or advisory lock is held while the provider is called.

If provider creation succeeds, finalization creates exactly one canonical P5.1
`payments` row: `PENDING`, `subscription_id NULL`, provider `simulator`, exact
admitted price/terms, the same idempotency hash and request fingerprint. It
then stores the provider identities and payment reference and marks the intent
`READY`. No subscription, transition, or billing event is created. A rejected
simulator checkout is terminal `FAILED` and discards provider result
references. An unavailable result leaves `CREATING` for deterministic retry.

The shared account lock makes manual-grant races linearizable: a grant before
prepare blocks the checkout; a grant during the external simulator call is
observed during finalization and produces `FAILED` without a payment. The same
policy applies when an account becomes suspended. A READY replay while the
account is no longer actionable returns a safe rejection without mutating the
terminal financial history or returning its reference.

## One actionable checkout per account (P5.3 correction V2)

An account has at most one actionable new-subscription checkout. The same
account/key/fingerprint replays or resumes its exact intent; the same key with
a different fingerprint remains `IDEMPOTENCY_KEY_REUSED`. A different key is
rejected as `CHECKOUT_IN_PROGRESS` while another intent is `CREATING`, or is
`READY` with its canonical payment still `PENDING`. That rejection creates no
intent, provider call, payment, audit, or disclosure of the other intent's
references or provider identities.

The account advisory lock serializes cross-key admission. Migration `0010`
also supplies defence in depth with a partial unique index allowing only one
`CREATING` intent per account. A READY checkout cannot use a simple partial
unique index because P5.4 owns terminal payment-state policy: a later FAILED
or CANCELED payment may permit a new checkout. For P5.3, a READY intent whose
linked payment is not PENDING is therefore fail-closed as `CHECKOUT_CORRUPTED`
(including SUCCEEDED without current subscription), rather than silently
admitting another checkout. FAILED checkout history is retained but does not
block a new valid attempt. A current subscription takes precedence over old
checkout history. Consequently competing different-key requests cannot produce
a second pending payment.

## Audit and deferred real-provider review

The only checkout actions are `CHECKOUT_INTENT_CREATED`, `CHECKOUT_READY`, and
`CHECKOUT_FAILED`, all targeting `CHECKOUT_INTENT` and carrying the
`ACCOUNT_USER` actor/correlation ID. Safe metadata is allowlisted to canonical
IDs/state/payment reference/failure code; it excludes raw keys, references,
provider identities, raw request/response payloads, credentials, and secrets.
Prepare, READY, and FAILED writes are atomic with their audits. Injected audit
failure rolls back the corresponding intent/payment transition, allowing
deterministic retry; replay and provider-unavailable retry add no audit.

Before any external payment side effect is permitted, a dedicated real-provider
go-live architecture must separately review compensation behavior, provider
reference retention, redirect security, webhook verification, event storage,
and reconciliation. P5.3 does not begin P5.4 event ingestion and does not
activate subscriptions from checkout.
