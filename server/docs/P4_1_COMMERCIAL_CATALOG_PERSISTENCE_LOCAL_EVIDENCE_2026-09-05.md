# P4.1 Commercial Catalog Persistence — Local Evidence — 2026-09-05

Status: ACCEPTED — P4.1 DONE

Technical ID: `PRODUCT-CONTROL-PLANE-P4.1-COMMERCIAL-MUTATION-INTEGRITY-CORRECTION-LOCAL`  
Attempt: `2`

## ATTEMPT HISTORY

- Attempt 1 initial local acceptance was invalidated during remote acceptance.
- Confirmed defect: `p4_1_plan_entitlement_guard()` checked only `NEW.plan_revision_id` on UPDATE, allowing direct SQL to move a child from a published plan revision to a draft revision and remove composition from published history.
- Attempt 2 is the mutation-integrity correction and passed the full local acceptance gates below.

## ATTEMPT-2 MUTATION-INTEGRITY CORRECTION

- Confirmed defect: the Attempt-1 `p4_1_plan_entitlement_guard()` checked only `NEW.plan_revision_id` on UPDATE, allowing a published plan entitlement to be directly reparented to a draft revision.
- Correction: UPDATE now loads and rejects a published OLD parent, loads and rejects a published NEW parent, and preserves typed validation for the NEW row. DELETE checks the OLD parent.
- Plan revision `id`, `plan_id`, and `revision` are immutable after creation, including while DRAFT; display metadata remains editable and DRAFT -> PUBLISHED remains legal.
- Plan `id` and `code`, price `id`, `plan_id`, `code`, `market_key`, and `channel_key`, and price revision `id`, `price_id`, and `revision` are database-enforced immutable identities.
- Draft price revision rebinding remains coherent: same-plan targets are allowed and cross-plan targets are rejected; publication still requires a published plan revision.
- New adversarial direct-SQL cases cover published -> draft entitlement reparenting, draft -> published reparenting, published same-parent value/key mutation and delete, plan revision identity mutation, plan identity mutation, all stable price identity fields, price revision identity mutation, and same-plan/cross-plan price revision rebinding.
- All prior 22 P4.1 physical cases remain green; the corrected suite has 30 cases.

## BASE

- Branch: `feature/product-control-plane-server-2026-09-04`
- Base/committed HEAD: `56733bbbe4633d66e940e9eebbce0cd728849f40`
- Remote start check 1: `56733bbbe4633d66e940e9eebbce0cd728849f40`
- Remote start check 2: `56733bbbe4633d66e940e9eebbce0cd728849f40`
- Start worktree: clean
- Validation runtime: Node `24.20.0`, pnpm `10.34.5`, PostgreSQL `18.0`

## ADR

- `server/docs/ADR/0015-p4-commercial-catalog-revisions-and-entitlement-foundation.md`
- Status: Accepted

## SCOPE

- Exactly eight P4 tables: `plans`, `plan_revisions`, `entitlement_definitions`, `plan_entitlements`, `account_entitlement_overrides`, `prices`, `price_revisions`, `price_sale_assignments`.
- No P5 tables, including subscriptions, subscription transitions, payments, billing events, billing customers, or checkout intents.
- No public or admin API routes; OpenAPI was unchanged.

## PLANS

- Stable plan UUID identity and globally unique bounded machine code.
- Plan code is immutable; `ARCHIVED` is terminal; non-draft plan deletion is rejected and referenced draft deletion is RESTRICT-protected.
- Plan revisions use positive unique `(plan_id, revision)` values with `DRAFT`/`PUBLISHED` state-time invariants; `id`, `plan_id`, and `revision` are immutable after creation.
- Draft revision editing and `DRAFT -> PUBLISHED` succeed.
- Published revision update, delete, and demotion are PostgreSQL-rejected.

## ENTITLEMENTS

- Value types: `BOOLEAN`, `INTEGER` only.
- Classifications: `CAPABILITY`, `LIMIT` only, with database-enforced type/classification pairing.
- Plan values are typed boolean or safe-integer bigint columns; no generic entitlement JSON exists.
- Published plan composition is immutable at PostgreSQL level.
- Account overrides are revisioned and append-only with `SET`/`CLEAR`, typed values, effective windows, and safe bounded reasons.
- Generic integer values use exact JavaScript safe-integer bounds.

## PRICES

- Stable price UUID, code, plan, market, and channel identity are database-enforced immutable fields.
- Every price revision binds to one exact plan revision; cross-plan binding is PostgreSQL-rejected.
- Published price revisions require a published plan revision and are immutable.
- Money is exact non-negative integer `amount_minor`; currency is explicit uppercase 3-letter ASCII.
- Billing interval is explicit `DAY`/`MONTH`/`YEAR` plus a positive count bounded to `1..1200`.
- Effective windows require `effective_to > effective_from` when present.

## NEW SALES

- `price_sale_assignments` is append-only revision history.
- Non-NULL selection names one exact published price revision and is checked for same-price ownership and effective-window inclusion.
- NULL selection is an explicit new-sale closure.
- Cross-price and draft-price selections are rejected.

## GRANDFATHERING

- Old price revisions are immutable and never silently rewritten.
- P5 subscription binding is deferred to `subscriptions.bound_price_revision_id`.
- No account-plan surrogate was created.

## STAGING

- Bootstrap changed: **NO**.
- Bootstrap subscription remains `state: NONE`, `planRevision: null`.
- Bootstrap entitlements remain `{}`.
- Production device limit changed: **NO**.
- `PreEntitlementDeviceLimitResolver` remains authoritative with `PRE_ENTITLEMENT_ACTIVE_DEVICE_LIMIT = 1`.
- Bridge runtime and Bridge boundary were unchanged.

## TESTS

- Unit: `203 PASS`, Attempt-1 baseline `203`, `0 failed`, `0 skipped/todo`.
- P3.1 crypto: `12/12 PASS`.
- Real PostgreSQL integration: `123 PASS`, Attempt-1 baseline `115`, `0 failed`, `0 skipped`, `0 todo`.
- Focused P4.1 physical cases: `30 PASS`, including 8 new mutation-integrity regression cases.
- E2E: `24/24 PASS`, `0 failed`, `0 skipped`, `0 retries`.

## MIGRATIONS

- Migration set: `0000..0008`.
- New migration: `server/packages/db/drizzle/0008_p4_1_commercial_catalog.sql`.
- No `0009`.
- Historical `0000..0007` SHA-256 values are unchanged and match the accepted P3 values:

  - `0000`: `9a7cde34d8b38667ccedd630cd2dc40697b2ee5c922927bb08f93f242bc5af56`
  - `0001`: `0544b377425ee3a6ebc9dc21ebb402febe27852c7bf93666f4154fbc0f723b2f`
  - `0002`: `f6f302d14574a7f9dff3675b8b330fbbf90a4d69387041b9fdf8fbe0454ce449`
  - `0003`: `ffe1c20c37c92f1529251ff21921c5a3a1a946a09c661b162e8458c37c08c9b6`
  - `0004`: `38774ebb870f9d233ddc51d2b8d24dd361ae2274920d0f7b0286eae333273e1d`
  - `0005`: `6b95b4dae57e356804a83d1d34ff03286fb5465ff3d214a4b40ae70150283d21`
  - `0006`: `37aa137364c9327108ea0db8ca25cba7cbc99c0d1649b959499a4fa87824dd1f`
  - `0007`: `1c8c32d6f9ea073788507736f06daaa67dee2f74465d2b990eb7fbcc67d0abe6`

- Fresh PostgreSQL 18 first normal migration: PASS.
- Second normal migration: PASS.

## OPENAPI

- Route count: `15`.
- `POST /v1/bootstrap`: exactly once.
- Run 1 SHA-256: `1d4869210b66d48c7f51978f85ebf21869d61a29d9a47d7fa2ffae0a9f9a8cff`.
- Run 2 SHA-256: `1d4869210b66d48c7f51978f85ebf21869d61a29d9a47d7fa2ffae0a9f9a8cff`.
- Deterministic: PASS.

## DB_DOWN

Fresh validation copy `/tmp/product-control-plane-p41-attempt2-dbdown.6LJjNH`, with `DATABASE_URL` absent:

- Frozen install: PASS
- Lint: PASS
- Format check: PASS
- Typecheck: PASS
- Unit: PASS
- OpenAPI: PASS
- Bridge guard: PASS
- Build: PASS

## DB_UP

Fresh disposable PostgreSQL 18 validation:

- Lint: PASS
- Format check: PASS
- Typecheck: PASS
- Unit: PASS
- Integration: PASS (`123/123`)
- Migrate: PASS
- OpenAPI: PASS
- Bridge guard: PASS
- Build: PASS

## PLAYWRIGHT

- Project version: `1.62.1`.
- Chrome for Testing: `151.0.7922.34`.
- Chromium revision: `1234`.
- Disposable browser cache smoke: PASS.
- Full `PRODUCT_CONTROL_PLANE_E2E=1 pnpm test:e2e`: `24 passed`, `0 failed`, `0 skipped`, `0 retries`.

## SECURITY

- Ozon credentials on server: NONE.
- Raw seller data on server: NONE.
- Billing provider secret: NONE.
- Payment/card data: NONE.
- Generic entitlement JSON/JSONB: NONE.
- Floating money: NONE.
- Executable remote configuration: NONE.
- Subscription/account-plan implementation: NONE.
- Admin HTTP mutation transport: NONE.
- Bridge runtime import: NONE.
- Bridge changed: NO.
- No P4.1 executable P5 implementation was introduced.

## MUTATION MATRIX

| Table | Identity | Draft-editable fields/transitions | Post-insert integrity protection |
| --- | --- | --- | --- |
| `plans` | `id`, `code` | status/allowed metadata; ARCHIVED terminal; draft delete only when RESTRICT permits | identity trigger rejects id/code mutation; children use RESTRICT |
| `plan_revisions` | `id`, `plan_id`, `revision` | display name/description; DRAFT -> PUBLISHED | identity trigger; published UPDATE/DELETE rejected; parent identity cannot invalidate prices |
| `entitlement_definitions` | `entitlement_key`, `value_type`, `security_classification` | description; NULL -> timestamp deprecation | semantic identity immutable; deprecation one-way; delete rejected |
| `plan_entitlements` | `(plan_revision_id, entitlement_key)` | typed composition only under draft parent | UPDATE checks OLD and NEW parent state; published UPDATE/DELETE and published reparenting rejected |
| `prices` | `id`, `plan_id`, `code`, `market_key`, `channel_key` | status/allowed metadata; ARCHIVED terminal; draft delete only when RESTRICT permits | all stable identity mutation rejected; children use RESTRICT |
| `price_revisions` | `id`, `price_id`, `revision` | draft commercial terms; same-plan `plan_revision_id` rebind; DRAFT -> PUBLISHED with published parent | identity immutable; full price/plan coherence checked on INSERT and UPDATE; published UPDATE/DELETE rejected |
| `account_entitlement_overrides` | append-only row/revision history | none | UPDATE and DELETE categorically rejected |
| `price_sale_assignments` | append-only assignment history | none | UPDATE and DELETE categorically rejected; selected relation points to immutable price/revision identities |

All eight P4.1 tables were reviewed. No remaining post-insert direct-SQL integrity hole was found in the matrix.

## ROADMAP

- P0: DONE
- P1: DONE
- P2: DONE
- P3: DONE
- P4: ACTIVE
- P4.1: ACTIVE
- P4.2: PLANNED
- P4.3: PLANNED
- P4.4: PLANNED
- P4.5: PLANNED
- P4.6: PLANNED
- P5-P15: PLANNED

## RECOVERY

- Attempt-1 accepted artifacts preserved unchanged: patch `/var/backups/product-control-plane/git/blood_sand-p4.1-local-accepted-uncommitted.patch` (`6698` bytes, SHA-256 `f2648db7755943a25130b5ef1decb13ef5dbd80996752f4735cbe92dcda1e828`) and archive `/var/backups/product-control-plane/git/blood_sand-p4.1-local-accepted-untracked.tar.gz` (`11764` bytes, SHA-256 `1287a0283fc9dd347272befc3fe89a5f1b1ec010f7ab30a53365f186ff012170`, 4 entries).
- Attempt-1 invalidation checkpoint: patch `/var/backups/product-control-plane/git/blood_sand-p4.1-attempt1-invalidated.patch` (`6698` bytes, SHA-256 `f2648db7755943a25130b5ef1decb13ef5dbd80996752f4735cbe92dcda1e828`) and archive `/var/backups/product-control-plane/git/blood_sand-p4.1-attempt1-invalidated-untracked.tar.gz` (`14570` bytes, SHA-256 `e684ef465e9d8df664bd9abcfdfddede8a00dcf5bdc55446b62b10a8cc2789`, 5 entries) were captured before correction.
- Attempt-2 patch: `/var/backups/product-control-plane/git/blood_sand-p4.1-attempt2-local-accepted-uncommitted.patch` (`6698` bytes, SHA-256 `f2648db7755943a25130b5ef1decb13ef5dbd80996752f4735cbe92dcda1e828`).
- Attempt-2 untracked archive: `/var/backups/product-control-plane/git/blood_sand-p4.1-attempt2-local-accepted-untracked.tar.gz` (`12606` bytes, SHA-256 `2b450bc6ca58d5995ad08f6e7a08c004cee0cd4165aa62985c60af81112a21df`, 4 source entries; evidence is this file).

## HOST

- Host Node, PostgreSQL, pnpm, MySQL, nginx, Apache, Docker/containerd configuration, and protected legacy services were not changed.
- PostgreSQL and Playwright resources were disposable.
- No commit created.
- No push performed.

## FINAL REMOTE

- Final check 1: `56733bbbe4633d66e940e9eebbce0cd728849f40`.
- Final check 2: `56733bbbe4633d66e940e9eebbce0cd728849f40`.
- Both checks used the accepted deploy key over GitHub SSH port 443 and were separated by four seconds.

## FINAL STATE

- Worktree: dirty by design.
- This is local acceptance only; return to ChatGPT for P4.1 remote acceptance.
- Do not start P4.2.

## REMOTE ACCEPTANCE FINALIZATION

- Implementation commit: `b06d9311bafad7e107d4902dd8eb83dda8c59132` (`feat(server): add commercial catalog persistence foundation`).
- Code-bearing Server CI: run `34003469855`, [workflow run](https://github.com/MaksimUnimax/blood_sand/actions/runs/34003469855), head `b06d9311bafad7e107d4902dd8eb83dda8c59132`, `SUCCESS`.
- Canonical CI matrix: checkout/toolchain, frozen install, lint, format, typecheck, unit (`203`), integration (`123`), migration, OpenAPI, Bridge guard, build, Chromium install, and E2E (`24`) all passed; P3.1 crypto remained `12/12`.
- Remote committed review: PASS. The pushed implementation contains one expected commit and P4.1 persistence scope only.
- Corrected defect: PASS. Committed PostgreSQL `plan_entitlements` UPDATE protection checks both OLD and NEW parent revision state; the committed physical test executes and rejects published -> draft and draft -> published reparenting while preserving composition.
- Mutation-integrity matrix: PASS for all eight tables; plan/revision/price identities are database-protected, legal draft workflows remain available, and `POST_INSERT_INTEGRITY_HOLES_REMAINING: NONE`.
- OpenAPI remains `15` routes with SHA-256 `1d4869210b66d48c7f51978f85ebf21869d61a29d9a47d7fa2ffae0a9f9a8cff`.
- Migrations remain exactly `0000..0008`; no `0009`; historical `0000..0007` hashes are unchanged.
- Security review: PASS. No seller credentials/data, payment or billing data, generic entitlement JSON, floating money, executable remote configuration, Bridge runtime import, or tracked SSH private key was introduced.
