# ADR-0018 — P4.4 Commercial Entitlement Overrides, Resolution, and Device-Limit Adapter

Status: Accepted  
Date: 2026-09-06  
Scope: P4.4 internal commercial entitlement layer

## Decision

P4.4 is the commercial entitlement layer, not the final product-capability
result. It resolves an exact caller-supplied published `planRevisionId` with
account-specific override history. It does not decide subscription eligibility,
subscription state, an account's current plan, payment state, maintenance,
rollout, feature policy, AI/browser health, or packaged client capability.
P5 owns the authoritative account subscription/current-plan binding. No
account-plan surrogate is introduced here, and no concrete P5 binding exists.

The resolver requires an existing account and an exact published plan revision.
The stable plan may be ACTIVE, HIDDEN, or ARCHIVED; historical resolution of
the exact published revision remains valid. A definition may be deprecated
after publication; historical plan values and override history remain readable
and the resolution exposes bounded deprecation metadata.

## Append-only override commands

Account override history is stored in the accepted P4.1
`account_entitlement_overrides` table. SET and CLEAR commands are append-only;
the server allocates the positive per-account/key revision under the advisory
lock `p4-account-entitlement:<accountId>:<entitlementKey>`. Callers provide
`expectedLatestRevision`, either null or a positive integer. A stale expectation
is rejected before semantic duplicate detection. Concurrent writers with the
same expectation therefore produce one winner and one stale result.

SET accepts only the existing strict BOOLEAN/INTEGER typed value union, requires
an existing non-deprecated definition, and requires the definition type to
match. CLEAR carries no value, requires the stable definition to exist, and is
allowed after deprecation. Both commands validate the half-open window
`[effectiveFrom, expiresAt)` and persist the mutation context reason in the
override row. An exact repeat of the latest semantic state is `changed=false`:
no new revision and no audit event; reason alone is not semantic state.

Definition rows are locked `FOR SHARE` by SET/CLEAR. P4.2 deprecation locks the
same row `FOR UPDATE`, so SET and deprecation are linearizable: SET either
commits before deprecation or observes `ENTITLEMENT_DEPRECATED`. Deprecation
blocks future SET but does not erase history.

Changed SET and CLEAR mutations write exactly one transactional audit event:
`ACCOUNT_ENTITLEMENT_OVERRIDE_SET` or
`ACCOUNT_ENTITLEMENT_OVERRIDE_CLEARED`, targeting `ACCOUNT`/`accountId`.
Metadata is bounded to entitlement key, revision, operation, value type, and
time window; raw values and freeform override reasons are not placed in audit
metadata. Override and audit insertion share one PostgreSQL transaction, so an
audit failure rolls the override insert back.

## Deterministic resolution

Resolution evaluates at an explicit `Date`. The exact published plan revision
supplies the typed base value; an omitted plan value is not an implicit false or
zero. For each key, the highest override revision whose `effectiveFrom <= at`
is selected before expiry is considered. This is supersession-first history:
a newer effective override supersedes older history permanently. If that latest
row is expired, resolution falls back to the exact plan value and never
resurrects an older SET. CLEAR immediately falls back to the plan and likewise
supersedes older SET history. Future rows are ignored until their effective
time; same-time rows are ordered by highest revision. The boundaries are
inclusive at `effectiveFrom` and exclusive at `expiresAt`.

Resolution explanations use stable machine codes only:

- sources: `ACCOUNT_OVERRIDE`, `PLAN_REVISION`, `NONE`;
- reasons: `ACCOUNT_OVERRIDE_SET`, `ACCOUNT_OVERRIDE_CLEAR_TO_PLAN`,
  `ACCOUNT_OVERRIDE_EXPIRED_TO_PLAN`, `PLAN_VALUE`, `UNSET`;
- selected override states: `ACTIVE_SET`, `ACTIVE_CLEAR`, `EXPIRED`.

Explanations include definition type/classification/deprecation, exact plan
identity and base value, safe selected-override metadata, effective typed value,
source, and reason. They do not expose the freeform override reason. Bulk
resolution uses one repeatable-read transaction snapshot and lexical
`entitlementKey` order, includes UNSET definitions, and performs no audit.

## Device-limit adapter and deferred composition

`device.max_active` is the stable INTEGER/LIMIT key. P4.4 defines the abstract
`AccountPlanRevisionBindingPort` and `BoundCommercialDeviceLimitResolver` only.
The adapter obtains an exact plan revision from that future binding, resolves
`device.max_active`, requires a safe non-negative INTEGER, and fails closed for
missing binding, unset value, wrong type, or invalid value. P5 must provide the
binding and, when commercial limits are wired into activation, serialize
entitlement binding/resolution with active-device counting as one
capability-granting decision. P4.4 does not claim that atomic production
integration.

Production remains on `PreEntitlementDeviceLimitResolver` with baseline limit
1. No application wiring changes. P3 feature rules, rollout percentage,
global maintenance, and AI/browser health remain separate policy layers; this
resolver is not renamed or treated as a final capability resolver.

## Explicit non-goals

P4.4 adds no HTTP/admin/public route, no subscription or billing logic, no
account current-plan authority, no migration, no schema change, no bootstrap
change, and no Bridge dependency or behavior change.
