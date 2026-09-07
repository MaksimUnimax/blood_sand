# ADR-0025: P5 commercial production integration, bootstrap, device, and portal

Status: Accepted
Date: 2026-09-07

## Decision

P5.6 is the first production commercial-access wiring on the accepted P5.5
base. P5 remains provider-neutral and simulator-only internally; real payment
go-live is deferred and P5.7 is not started.

- Subscription eligibility is timestamp-authoritative and binds through the
  accepted P5.2 `SubscriptionPlanRevisionBindingAdapter` to the accepted P4.4
  `BoundCommercialDeviceLimitResolver`.
- Bootstrap projects the actual safe current subscription, the exact plan
  revision UUID, and primitive P4 entitlements. Entitlements are `{}` when
  access is ineligible. Paid bootstrap offline grace is capped at the
  subscription access deadline, including the grace deadline.
- Device admission uses the exact commercial `device.max_active` value. The
  pre-entitlement baseline is not production-wired. Activation holds the
  shared `p5-subscription-account:<accountId>` transaction advisory lock and
  locks the account row; the account-row lock serializes P4 entitlement
  override mutations. A later limit decrease does not auto-revoke devices.
- The API exposes only `GET /v1/subscription` and
  `GET /v1/billing/payments` for P5.6 portal reads. Both are owner-scoped,
  no-store, and privacy-safe. Payment responses omit provider IDs,
  idempotency hashes, billing events, and job internals.
- Billing UX is read-only and states that online payment is not enabled yet.
  Fake checkout, payment-completion, webhook, refund, and payment mutation
  HTTP are not exposed; no simulator is composed into API main.
- The provider-independent subscription lifecycle runner is composed in the
  worker. Billing reconciliation is not composed because no real payment
  status port exists.
- No database migration is required; migrations remain 0000 through 0011.
  Bridge is unchanged. Real provider selection/integration remains deferred.

P5.6 remains `ACTIVE` locally after acceptance evidence is produced. P5.7
remains `PLANNED`.
