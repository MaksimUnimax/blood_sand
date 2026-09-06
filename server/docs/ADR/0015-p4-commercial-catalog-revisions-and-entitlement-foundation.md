# ADR-0015 — P4 Commercial Catalog Revisions and Entitlement Foundation

Status: Accepted  
Date: 2026-09-05  
Scope: P4.1 commercial catalog persistence foundation

## Decision

P4 uses the following historical model:

`stable identity` + `immutable published revision` + `append-only selection/override history`.

P4.1 implements persistence only. PostgreSQL is the authority for the invariants; Drizzle declarations mirror the physical schema but do not replace PostgreSQL checks, foreign keys, or triggers.

## 1. Commercial boundary

P4 owns stable plan and price identities, immutable published revisions, stable typed entitlement definitions, revisioned plan composition, revisioned account overrides, explicit new-sale price selection, and the persistence foundation for deterministic future resolution and explanations.

P4 does not own subscriptions, subscription state transitions, payments, billing events, checkout, webhooks, provider adapters, expiry jobs, account-plan assignment, or admin transport. P4.1 creates no public or admin HTTP route and no workspace domain package.

The authoritative future account relation remains `subscriptions.current_plan_revision_id`, and the authoritative future bound price remains `subscriptions.bound_price_revision_id` in P5. P4.1 creates no `account_plan_assignment`, `account_current_plan`, `license_plan`, `account_tariff`, or equivalent surrogate.

## 2. Stable plans and plan revisions

`plans` is the stable logical product identity. Its UUID is permanent and its globally unique lowercase bounded machine `code` is immutable after creation. Statuses are `DRAFT`, `ACTIVE`, `HIDDEN`, and `ARCHIVED`; `ARCHIVED` is terminal. A non-draft plan cannot be physically deleted. A draft plan can be deleted only when RESTRICT references permit it.

`plan_revisions` stores composition and UI metadata for one exact plan. `(plan_id, revision)` is unique and `revision` is positive. States are `DRAFT` and `PUBLISHED`. A draft has no `published_at`; a published revision has a timestamp. Draft metadata and composition may be edited. `DRAFT -> PUBLISHED` is the only publication transition. PostgreSQL triggers reject every update or delete after publication, including demotion and direct SQL bypass attempts.

Plan revision identity (`id`, `plan_id`, `revision`) is immutable immediately after creation, including while DRAFT. Historical references use RESTRICT foreign keys. Direct SQL UPDATE protection covers identity fields as well as published state.

## 3. Typed entitlement definitions

`entitlement_definitions` is the stable typed capability registry. Keys are bounded lowercase machine identifiers. The only P4.1 value types are `BOOLEAN` and `INTEGER`; the only security classifications are `CAPABILITY` and `LIMIT`.

The database enforces `CAPABILITY -> BOOLEAN` and `LIMIT -> INTEGER`. No JSON, JSONB, float, stringly typed value, executable instruction, URL, header, auth field, or provider operation is represented by this model.

The key, value type, and security classification are semantic identity and are immutable. Descriptions may be corrected. `deprecated_at` may move once from NULL to a timestamp and cannot be cleared or changed afterward. Definition deletion is forbidden and all historical references are RESTRICT-protected.

## 4. Typed plan composition

`plan_entitlements` attaches one typed value to an exact plan revision using `(plan_revision_id, entitlement_key)` as its logical key. Values are stored only in `boolean_value` or `integer_value`. A database trigger resolves the definition and requires the matching column to be non-NULL while the other is NULL. Generic integer values are PostgreSQL `bigint` constrained to the exact JavaScript safe-integer range `-9007199254740991..9007199254740991`.

While the parent plan revision is draft, insert/update/delete composition rows are allowed subject to constraints. Once the parent is published, PostgreSQL rejects insert, update, and delete of every child row. On UPDATE, the database checks both the OLD parent and the NEW parent, so a published composition cannot be moved out of its published revision and a draft composition cannot be moved into one. Publishing the parent therefore freezes the complete entitlement composition after every direct SQL mutation.

## 5. Append-only account overrides

`account_entitlement_overrides` is append-only commercial policy history. Each row has an account, stable entitlement key, positive `(account_id, entitlement_key, revision)`, operation `SET` or `CLEAR`, typed value columns, an effective window, bounded safe non-empty reason, and creation time.

`SET` carries exactly one value matching the definition. `CLEAR` carries no value. `expires_at` is NULL or strictly later than `effective_from`. PostgreSQL rejects every update and delete. Future P4.4 resolution will choose the highest revision effective at evaluation time; `SET` overrides inherited plan state and `CLEAR` removes the override so plan state is inherited.

## 6. Stable prices and price revisions

`prices` is the stable logical price identity for one plan, market, and channel. The UUID, globally unique lowercase bounded `code`, `plan_id`, `market_key`, and `channel_key` are immutable after creation. Statuses are `DRAFT`, `ACTIVE`, `HIDDEN`, and `ARCHIVED`; `ARCHIVED` is terminal. Non-draft physical deletion is rejected and all references use RESTRICT.

`price_revisions` stores immutable commercial terms for one price identity and one exact `plan_revision_id`. (`id`, `price_id`, `revision`) is stable revision identity after creation. States are `DRAFT` and `PUBLISHED` with the same state/time invariant as plan revisions. Draft terms may be edited, including a same-plan `plan_revision_id` rebind after full coherence validation; publication is one-way; PostgreSQL rejects update and delete after publication.

Every price revision is checked against both stable identities at the database boundary: its price belongs to the same plan as its exact plan revision. A published price revision must reference a published plan revision. Price revisions cannot cross-bind plans.

## 7. Money, currency, and billing periods

Money is `amount_minor` as an exact PostgreSQL `bigint`, constrained to `0..9007199254740991`. No decimal, real, double, float, or JavaScript floating monetary conversion is present. Currency is an explicit uppercase three-letter ASCII code and is not assumed to be RUB. Billing periods use `DAY`, `MONTH`, or `YEAR` plus a positive integer count bounded to `1..1200`.

`effective_to` is NULL or strictly greater than `effective_from`. A commercial term change requires a new price revision; published money, currency, period, and effective-window terms cannot be silently rewritten.

## 8. Explicit new-sale selection

`price_sale_assignments` is append-only history. `(price_id, assignment_revision)` is unique and positive. A non-NULL `selected_price_revision_id` selects that exact published revision for new sales from `effective_from`; NULL explicitly closes new sales for the stable price identity.

The database checks same-price ownership, published state, and inclusion of the assignment time in the selected revision effective window. Updates and deletes are rejected. Later P4.3 resolution will select the highest assignment revision effective at evaluation time. Stable price status remains an additional policy gate: ACTIVE is eligible, HIDDEN is not shown/new-sales disabled, and ARCHIVED is terminal/not sellable.

## 9. Grandfathering and staged truth

Grandfathering is achieved by immutable references. Publishing or selecting a new price revision changes only future new-sale resolution and never rewrites an old revision. P5 subscriptions will bind exact `bound_price_revision_id`; any migration policy is future, explicit, and auditable.

During P4.1 bootstrap remains unchanged: subscription is `{ state: "NONE", planRevision: null }`, entitlements are `{}`, and device policy is `{ status: "ACTIVE" }`. Production device exchange remains on `PreEntitlementDeviceLimitResolver` with baseline active-device limit `1`. P4.1 does not wire catalog state into bootstrap or device activation.

## 10. Audit, deletion, and transport staging

P4.1 creates no synthetic audit events for direct fixture inserts. P4.2/P4.3/P4.4 command services will write commercial mutations and override changes transactionally to the existing append-only `audit_events` model. No unauthenticated or temporary admin endpoint is introduced. The public catalog endpoint is deferred to P4.5.

There is no CASCADE deletion in commercial history. Published revisions, referenced plans/prices, plan compositions under published revisions, definitions, overrides, and sale assignments are preserved by triggers and RESTRICT constraints. Draft rows may be removed only when their references permit it.

## 11. Physical and security scope

The P4.1 migration adds exactly eight tables: `plans`, `plan_revisions`, `entitlement_definitions`, `plan_entitlements`, `account_entitlement_overrides`, `prices`, `price_revisions`, and `price_sale_assignments`. It adds no subscription, payment, billing-provider, checkout, webhook, or job table. It adds no seller data, Ozon credential, provider response, AI conversation, billing secret, payment/card field, checkout URL, or executable remote configuration.

The single migration is `0008_p4_1_commercial_catalog.sql`; migrations `0000..0007` remain byte-for-byte historical artifacts. Narrowly named `p4_1_*` PostgreSQL functions/triggers protect cross-table coherence and append-only/immutability boundaries. No prior P1–P3 trigger or table is modified.

## Consequences

P4.1 provides a durable historical seam without pretending that an account currently has a commercial plan. P4.2 can add audited plan/entitlement command services, P4.3 can add price revision and sale-selection commands, P4.4 can add deterministic resolution and explanations, and P4.5 can add the public catalog read model. Subscriptions and authoritative account access remain deferred to P5.
