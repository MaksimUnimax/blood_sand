# P4.4 Commercial Entitlement Overrides / Resolution — Local Evidence — 2026-09-06

Status: LOCAL ACCEPTED — P4.4 ACTIVE

Technical ID: `PRODUCT-CONTROL-PLANE-P4.4-COMMERCIAL-ENTITLEMENT-OVERRIDES-RESOLUTION-LOCAL`  
Attempt: `1`

## Base and remote gates

- Branch: `feature/product-control-plane-server-2026-09-04`
- Required/local HEAD: `885353a4e51bc54e13d874b4e236b90c4761cc33`
- Remote start check 1: `885353a4e51bc54e13d874b4e236b90c4761cc33`
- Remote start check 2: `885353a4e51bc54e13d874b4e236b90c4761cc33`
- Remote final check 1: `885353a4e51bc54e13d874b4e236b90c4761cc33`
- Remote final check 2: `885353a4e51bc54e13d874b4e236b90c4761cc33`
- Start worktree: clean.
- Root disk start/final observation before disposable-resource cleanup: 80% used,
  12G available; the 84%/8G gate passed.

## ADR and domain boundary

- ADR: `server/docs/ADR/0018-p4-commercial-entitlement-overrides-resolution-and-device-limit-adapter.md`, Accepted.
- Domain package: `@product/entitlements` in `server/packages/entitlements`.
- Allowed domain dependencies: `@product/shared`, `@product/plans`, `zod`, and Node standard library; no DB, Fastify, apps, Bridge, subscriptions, or billing dependency.
- PostgreSQL adapter: `server/packages/db/src/p4-entitlement-repository.ts`.
- Resolver result is `CommercialEntitlementResolution`, not a final product-capability result.
- No HTTP/admin/public route, bootstrap change, device-management production wiring, or Bridge change.

## Override commands

- SET and CLEAR are strict typed commands using the existing `PlanMutationContext` and `PlanMutationContextSchema` from `@product/plans`.
- SET accepts exact BOOLEAN/INTEGER values; CLEAR carries no value.
- `expectedLatestRevision` is null or a positive safe integer; zero, negative, fractional, generic, and unknown fields are rejected.
- `effectiveFrom` is inclusive; `expiresAt` is nullable and strictly later than `effectiveFrom`.
- The server allocates revisions under `p4-account-entitlement:<accountId>:<entitlementKey>`; clients cannot allocate revisions.
- Stale expectation is checked before semantic duplicate detection. Concurrent same-expectation writers produce one winner and one `ACCOUNT_ENTITLEMENT_OVERRIDE_STALE` result.
- Exact semantic duplicate of the latest row is `changed=false`, with no new row, revision, or audit. Context reason is excluded from semantic equality.
- Context reason is persisted to the override row and audit reason column.

## Definition and deprecation serialization

- SET requires an existing, non-deprecated definition and matching BOOLEAN/INTEGER type.
- CLEAR requires the stable definition but remains allowed after deprecation.
- SET consumers lock the definition `FOR SHARE`; P4.2 deprecation locks it `FOR UPDATE`. The race is linearizable with no check-then-deprecate gap.
- Historical published values and override history remain readable after definition deprecation.

## Resolver semantics

- Input explicitly supplies `accountId`, exact `planRevisionId`, entitlement key, and evaluation `Date`.
- Account existence is verified; no account-current-plan lookup or surrogate authority exists.
- The plan revision must exist and be `PUBLISHED`; DRAFT and missing revisions return typed failures.
- Exact base composition is typed; an omitted base value is null, not implicit false/zero.
- Plan status is not an eligibility gate: ACTIVE, HIDDEN, and ARCHIVED stable plans can resolve their exact published revision.
- At evaluation time, the highest revision with `effectiveFrom <= at` is selected before expiry is evaluated.
- Selected window is `[effectiveFrom, expiresAt)`. A selected expired row falls back to the exact plan value and never resurrects an older override.
- CLEAR falls back to the plan and supersedes older SET history. Future rows are ignored until effective; same-time rows use highest revision.
- Persisted type/safe-integer contradictions fail closed as unexpected corruption; values are never coerced.

## Explanation and bulk behavior

- Stable sources: `ACCOUNT_OVERRIDE`, `PLAN_REVISION`, `NONE`.
- Stable reasons: `ACCOUNT_OVERRIDE_SET`, `ACCOUNT_OVERRIDE_CLEAR_TO_PLAN`, `ACCOUNT_OVERRIDE_EXPIRED_TO_PLAN`, `PLAN_VALUE`, `UNSET`.
- Selected states: `ACTIVE_SET`, `ACTIVE_CLEAR`, `EXPIRED`.
- Explanations expose definition deprecation metadata, exact plan identity/revision/base value, and safe override metadata only.
- Freeform override reason is not exposed in resolution objects and raw values are not placed in audit metadata.
- Bulk resolution uses one repeatable-read transaction snapshot, returns all definitions including UNSET entries, and orders lexical `entitlementKey`.
- Single-key and bulk resolution perform no audit.

## Device adapter

- Stable key: `device.max_active` (`INTEGER` / `LIMIT`).
- Abstract port: `AccountPlanRevisionBindingPort` only; no concrete P5 binding, subscription table, or current-plan authority exists.
- `BoundCommercialDeviceLimitResolver` resolves the exact binding and commercial entitlement, requires a safe non-negative integer, and fails closed with explicit internal adapter codes for missing binding, unset, wrong type, or invalid value.
- The adapter is structurally compatible with `DeviceLimitResolver` and is not production-wired.
- Production remains `PreEntitlementDeviceLimitResolver` with active-device baseline `1`.
- P5 must later serialize binding/resolution and active-device counting as one capability-granting activation decision.
- P3/global/rollout/maintenance/AI-browser health layers remain separate.

## Tests and gates

- Unit: `231 PASS`, baseline `221`, fail `0`, skip/todo `0`.
- New P4.4 unit tests: `10 PASS`.
- Real PostgreSQL integration: `244 PASS`, baseline `196`, new P4.4 distinct cases `48`, fail `0`, skip/todo `0`.
- P4.1: `30/30`; P4.2: `21/21`; P4.3: `52/52`.
- Override concurrency: physically verified one winner/one stale and final one-row history.
- Definition serialization: physically verified concurrent SET/deprecation linearization.
- No-resurrection: physically verified expired-latest and CLEAR supersession cases.
- Bulk resolution: lexical order, UNSET inclusion, mixed typed values, coherent snapshot strategy, and no audit physically verified.
- Device adapter: fake binding, SET/CLEAR, no binding, unset, wrong type, negative value, valid integer, and structural compatibility physically/unit verified.
- P3.1 crypto: `12/12 PASS`.
- E2E: `24/24 PASS`, zero failed/skipped/retry.
- DB-down gate: lint, format, typecheck, unit, OpenAPI, Bridge guard, and build PASS with `DATABASE_URL` absent.
- DB-up gate: lint, format, typecheck, unit, integration, migrations, OpenAPI, Bridge guard, and build PASS on PostgreSQL 18.

## OpenAPI and migrations

- OpenAPI routes: `15`.
- OpenAPI check 1 SHA-256: `1d4869210b66d48c7f51978f85ebf21869d61a29d9a47d7fa2ffae0a9f9a8cff`.
- OpenAPI check 2 SHA-256: `1d4869210b66d48c7f51978f85ebf21869d61a29d9a47d7fa2ffae0a9f9a8cff`.
- Migrations are exactly `0000..0008`; new `0009`: NO.
- `0008_p4_1_commercial_catalog.sql` SHA-256: `d661f98db6b18a2181fe2094f0715b11eb56eec7e96270d9634f4cd2fc8dc9f1` at start and final.
- Fresh PostgreSQL 18 migration first pass: PASS; second idempotent pass: PASS.

## Security and staging

- Subscriptions: ABSENT.
- Account current plan: ABSENT.
- Billing/payment/checkout/webhooks: ABSENT.
- Admin/public HTTP: ABSENT.
- Bootstrap changed: NO; bootstrap entitlements remain `{}`.
- Production device-limit resolver changed: NO; baseline remains `PreEntitlementDeviceLimitResolver` / `1`.
- Bridge changed/imported: NO.
- No Ozon credentials, seller data, payment/card data, billing secrets, arbitrary entitlement JSON, floating money, executable remote config, or SSH private key was added.
- Resolution metadata is bounded machine data; freeform override reason is not exposed.

## Roadmap and recovery

- P0–P3: DONE.
- P4: ACTIVE; P4.1 DONE; P4.2 DONE; P4.3 DONE; P4.4 ACTIVE; P4.5 PLANNED; P4.6 PLANNED.
- P5–P15: PLANNED.
- Recovery patch/archive/manifest are created only after this candidate and document are final under the fixed external recovery-freeze protocol. The detached manifest is authoritative for their byte counts and hashes; this evidence document will not be edited afterward.
