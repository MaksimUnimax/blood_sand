# ADR-0024 — P5.5 Reconciliation Leases and Subscription Lifecycle Jobs

Status: Accepted  
Date: 2026-09-07  
Scope: local simulator-only payment reconciliation and subscription lifecycle processing

## Decision

P5 remains simulator-only. `BillingPaymentStatusPort` is a separate
provider-neutral status lookup port; checkout creation remains owned by
`BillingProviderPort`. The deterministic simulator has in-process,
test-controlled status snapshots only. There is no real provider, SDK,
credential, outbound payment call, webhook HTTP, or real money.

Payment reconciliation uses exactly one dedicated PostgreSQL table,
`billing_reconciliation_jobs`. It is a leased table rather than a generic jobs
abstraction. No pg-boss, Redis, Kafka, RabbitMQ, Temporal, or subscription-job
table is introduced. Existing payments are backfilled: coherent successful
payments are settled, refund/chargeback states are blocked, and all other
repairable states are ready.

New canonical pending payments enqueue their reconciliation row in the same
transaction as the payment, READY checkout, and audit. A claim uses
`FOR UPDATE SKIP LOCKED`, changes the row to `LEASED`, increments attempts,
and commits before the provider-neutral status call. The external status call
is therefore outside both the database transaction and the account advisory
lock. Completion requires the exact payment ID and lease token. Expired
leases are reclaimable, and a stale token cannot mutate either the job or
commercial state. Retry scheduling is deterministic with an injectable
one-minute delay and no jitter.

Terminal status observations become canonical `RECONCILIATION` billing events.
Their event identity is `recon_v1_<sha256>` over payment ID, attempt, terminal
state, status time, and a separately domain-separated normalized payload hash;
the raw provider payment ID is not embedded in the identity. Status time must
be no earlier than payment creation and no later than processing observation.
Terms and time mismatches fail and block the job without changing payment
state.

The repair graph is deliberately narrow. Pending payments accept terminal
truth; FAILED and CANCELED states can confirm, correct one another, or be
repaired to SUCCEEDED. A coherent SUCCEEDED payment is confirmed idempotently
and can repair a missing subscription. A current-subscription conflict or
recoverable payment/subscription conflict reopens the job. Missing/corrupt
checkout blocks structural repair. SUCCEEDED is never downgraded by a failed
or canceled observation because no reversal/refund policy exists. REFUNDED
and CHARGEBACK are unsupported and remain blocked. `PAYMENT_RECONCILED` and,
when applicable, `SUBSCRIPTION_ACTIVATED` audits are part of the same
transaction as payment, subscription, transition, event, and job completion.

Successful repair reuses the P5.4 commercial authority: the exact READY
checkout must match account, provider, provider payment identity, price
revision, amount, currency, and payment link. Activation is ACTIVE revision 1,
uses the checkout plan and payment price, starts at provider status time, uses
the UTC calendar interval helper, and records source RECONCILIATION with
reason `BILLING_RECONCILIATION_SUCCEEDED`.

Subscription lifecycle work has no job rows. State timestamps and transition
history are the durable schedule. A worker scans due rows without mutation
locks, then for each candidate acquires the account advisory lock first, the
subscription lock second, reloads `FOR UPDATE`, and re-evaluates due-ness.
Exact boundaries use `dueAt <= now`: TRIAL, ACTIVE, and CANCELED expire;
ACTIVE with cancel-at-period-end uses `CANCEL_AT_PERIOD_END`; GRACE becomes
PAST_DUE; PAST_DUE and EXPIRED are no-ops. SUSPENDED expires only after the
bounded commercial window from its latest actual suspension origin (including
GRACE); a missing or corrupt origin fails closed. No automatic renewal or
new grace window is created.

Lifecycle mutation increments state revision, allocates transition revision
independently, uses source JOB, SYSTEM actor, a stable domain-separated job
identity, and `occurredAt = dueAt`. Expiry and grace audits are atomic with
the mutation. Access remains governed by the P5.2 resolver, so access is
denied at the exact timestamp even when a worker is delayed; later processing
only materializes canonical state/history.

Worker runner components expose independently callable `tick()` methods and
are injectable/testable. The worker main does not wire a fake simulator as a
production default. P5.6 has not started; real payment go-live remains
deferred.
