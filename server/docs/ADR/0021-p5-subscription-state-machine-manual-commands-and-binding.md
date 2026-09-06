# ADR-0021 — P5.2 Subscription State Machine, Manual Commands and Binding

Status: Accepted  
Date: 2026-09-06  
Scope: P5.2 provider-neutral subscription lifecycle and access reads

## Decision

P5.2 adds the provider-neutral subscription domain contract, explicit manual
grant/extend/suspend/restore commands, deterministic access eligibility, safe
current-subscription reads, and a subscription-backed exact plan-revision
binding. It uses the P5.1 schema unchanged; there is no migration `0010`.

The exact states are `TRIAL`, `ACTIVE`, `GRACE`, `PAST_DUE`, `CANCELED`,
`EXPIRED`, and `SUSPENDED`. Creation is `NULL -> TRIAL|ACTIVE`. Existing edges
are:

```text
TRIAL     -> ACTIVE|EXPIRED|SUSPENDED
ACTIVE    -> GRACE|PAST_DUE|CANCELED|EXPIRED|SUSPENDED
GRACE     -> ACTIVE|PAST_DUE|CANCELED|EXPIRED|SUSPENDED
PAST_DUE  -> ACTIVE|GRACE|CANCELED|EXPIRED|SUSPENDED
CANCELED  -> ACTIVE|EXPIRED|SUSPENDED
SUSPENDED -> TRIAL|ACTIVE|GRACE|PAST_DUE|CANCELED|EXPIRED
EXPIRED   -> nothing
```

Same-state transitions are invalid. Manual grant creates `ACTIVE`, captures one
`now`, binds the exact published plan revision, and leaves the bound price
revision null. A grant may be stored for a suspended account; account
suspension is an access policy and does not destroy or forbid commercial
history.

`subscriptions.state_revision` increments for every successful mutable
subscription mutation, including period-only extension. A period extension
does not create a same-state transition row. The append-only
`subscription_transitions.transition_revision` increments only for state
changes and is allocated by the server under the subscription lock.

Extensions are strictly forward-only, preserve state, plan/price bindings,
state reason, cancellation and suspension fields, and reject a grace window
that would be crossed. Suspension is allowed from every non-expired state for
which the FSM permits `-> SUSPENDED`; a current-version suspension is a
`changed:false` no-op. Restore is allowed only from `SUSPENDED`; its target is
the `from_state` of the latest actual suspension transition, never a caller
field and never inferred from payment state. Restore fails closed when that
history is absent or incoherent. `TRIAL`, `ACTIVE`, and `CANCELED` restore
before the half-open period end; `GRACE` restores before `graceUntil`;
`PAST_DUE` may restore after the ordinary period because it remains
ineligible. `EXPIRED` is never a restore origin.

All extend/suspend/restore commands check the expected state revision before
no-op or semantic checks. The lock order is frozen for future P5 work:

```text
account advisory lock:      p5-subscription-account:<accountId>
subscription advisory lock: p5-subscription:<subscriptionId>
```

For existing-subscription mutations, the immutable account ID is read first,
then the account lock, then the subscription lock, then the subscription is
reloaded `FOR UPDATE`. Grant uses the account lock only. This ordering must be
preserved by P5.3–P5.5.

Each successful command writes its domain mutation, transition where
applicable, and one audit event atomically. Actions are
`SUBSCRIPTION_GRANTED`, `SUBSCRIPTION_EXTENDED`, `SUBSCRIPTION_SUSPENDED`,
and `SUBSCRIPTION_RESTORED`. Rejected, stale, no-op, and read operations do
not audit. Safe metadata is allowlisted and never duplicates freeform reason,
provider data, credentials, secrets, or raw request data. An audit failure
rolls back the complete mutation.

## Eligibility and reads

Access uses one coherent PostgreSQL observation of account status and the
current subscription. `SUSPENDED` account status always denies with
`ACCOUNT_SUSPENDED` without mutating the subscription. `TRIAL` and `ACTIVE`
are eligible only while `at < currentPeriodEnd`; `GRACE` is eligible only
while `at < graceUntil` and a missing grace deadline is corruption;
`PAST_DUE`, `SUSPENDED`, and `EXPIRED` are ineligible. `CANCELED` is eligible
only when `cancelAtPeriodEnd=true` and `at < currentPeriodEnd`. These are
half-open timestamp windows, so exact endpoints are denied.

The current reader returns a safe snapshot and excludes `EXPIRED`; it does not
expose `stateReason`, transition reasons, actors, or audit details. The
subscription-backed binding adapter uses an injected clock and returns the
exact plan revision only for an eligible subscription, with source
`ELIGIBLE_SUBSCRIPTION`; all ineligible outcomes return null.

The binding is created but is not wired into production device management or
bootstrap. Production remains on `PreEntitlementDeviceLimitResolver` with
limit 1. P6 owns authorization/RBAC before any admin caller exists. P5.3 has
not started: no provider port, fake provider, checkout, webhook processor,
reconciliation, payment mutation service, HTTP route, or real provider exists.
Real payment go-live remains deferred.
