# ADR-0023 — P5.4 Simulated Verified Billing-Event Application

Status: Accepted  
Date: 2026-09-07  
Scope: P5.4 local simulator-only billing-event application

## Decision

P5.4 adds provider-neutral verified billing-event application through a
`BillingEventVerificationPort`. The only supported normalized event types are
`payment.succeeded`, `payment.failed`, and `payment.canceled`. The deterministic
simulator builds a domain-separated payload SHA-256 and a separate
domain-separated proof. The proof has no secret or credential and makes no
Internet authenticity claim; it exists only to detect test-envelope tampering.

Verification completes before the billing ledger, payments, subscriptions, or
audit are touched. Verified simulator events use the existing `WEBHOOK` source
internally. There is no HTTP callback, provider SDK, credential, external
payment call, webhook secret, or real-money processing.

## Identity, transaction, and state decisions

The existing `(provider,event_identity)` uniqueness is the dedupe authority.
The verified claim, payment application, subscription/transition changes,
terminal event references, and audit rows are one PostgreSQL transaction.
Same content replays safely; different content for the same identity fails
closed with `EVENT_IDENTITY_CONFLICT`. A transient infrastructure failure rolls
back the claim and all domain/audit writes. Conflicting terminal payment truth
is reported as `PAYMENT_STATE_CONFLICT`; reconciliation and out-of-order repair
remain P5.5.

The only payment mutations are `PENDING -> SUCCEEDED`, `PENDING -> FAILED`,
and `PENDING -> CANCELED`. Verified payment success is preserved even when
checkout is missing/corrupt or a current subscription conflicts. A valid
success creates exactly one `ACTIVE` subscription with the checkout's exact
plan revision and payment's bound price revision, writes the `WEBHOOK`
transition whose source event is the event identity, and links the payment.
Semantic success duplicates are `IGNORED` only when the existing payment link
is coherent; otherwise they fail with `PAYMENT_SUBSCRIPTION_CORRUPTED`.

The shared account lock `p5-subscription-account:<accountId>` is acquired
before payment, checkout, and current-subscription locks. Periods use pure UTC
calendar DAY/MONTH/YEAR addition with month-end and leap-day clamping. A
`SUSPENDED` account does not invalidate verified payment success; access policy
continues to deny the account.

## Checkout and concurrency

P5.3 checkout actionability now observes terminal payment state. A READY
checkout with PENDING remains in progress; FAILED and CANCELED allow a fresh
different-key attempt while same-key replay returns `PAYMENT_FAILED` or
`PAYMENT_CANCELED`; SUCCEEDED with a current subscription returns
`CURRENT_SUBSCRIPTION_EXISTS`; SUCCEEDED without one, REFUNDED, and CHARGEBACK
fail closed as `CHECKOUT_CORRUPTED`. Event application and new checkout use the
same account lock, so a failed/canceled event can linearize before fresh
admission without allowing two actionable pending attempts. Manual-grant and
event races are linearized by that same lock.

There is no refund/chargeback policy, reconciliation processing, polling,
durable retry job, delayed-event repair, or P5.5 implementation in this ADR.
No migration is required; migrations remain 0000..0010 and no 0011 is added.

