# DEFECT-015 — Date operation matrix — 2026-09-04

Executable baseline under audit: `249029b0ba8d9e6f9e26182bf678adf42868c6d6` (`v0.1.19`).

This matrix is the persistent row-by-row companion to `DEFECT_015_DATE_CONTRACT_SWEEP_2026-09-04.md`. Rows are added only after resolving the Bridge validator and current provider-contract evidence. `MATCH` is dimension-specific; it does not imply the entire operation is certified.

## Classification legend

- `BUG` — confirmed Bridge/provider mismatch.
- `MISSING_GUARD` — Bridge accepts inputs the current provider contract says are invalid/restricted.
- `MATCH` — audited contract dimension matches.
- `LIFECYCLE_RISK` — provider has announced a future retirement/change affecting the operation; this is not a current live failure unless separately proven.
- `STALE_RETIRED_ENDPOINT` — the registry still exposes an endpoint after the provider-announced retirement date.
- `INVALID_RUNNABLE_TEMPLATE` — the registry publishes a default request that conflicts with the provider contract.
- `NEEDS_LIVE` — static evidence is contradictory/insufficient.
- `NOT_DATE_RELATED` — no input date/time/period surface for this defect class.
- `PROVIDER_DOCUMENTATION_AMBIGUITY` — provider wording is not unambiguous enough to justify a local boundary rule.

## Audit correction — `posting_fbo_list`

A later bare-field `since/to` pass re-read `normalizePostingFboListParams` and disproved the earlier companion-artifact statement that the operation uses strict `requireRfc3339DateTime()`.

Actual baseline behavior uses JavaScript `new Date(...)` only when both `since` and `to` are present. Therefore the terminal verdict is **MISSING_GUARD — strict RFC3339 for every present boundary**, while the existing one-year maximum-period logic remains **MATCH**. This correction is reflected in the verified row below and in the corrected loose-parser/strict-continuation artifacts.

## Verified rows

| Bridge operation | Endpoint | Input date/period fields | Bridge rule | Current Ozon/OpenAPI rule | Classification | Evidence / note |
|---|---|---|---|---|---|---|
| `finance_balance` | `POST /v1/finance/balance` | `date_from`, `date_to` | both required; strict RFC3339 timestamp; no 30-day guard | both required; OpenAPI mechanically says `date-time` but descriptions + request example say `YYYY-MM-DD`; max interval 30 days | **BUG — LIVE CONFIRMED** + **MISSING_GUARD** | Live exact RFC3339 request `81ce5592-9e9a-4325-b2c6-1695c294ab36` returned HTTP 400/code 3. Effective wire format is date-only. Registry runnable template also hard-codes RFC3339 timestamps, so the defect exists in both normalizer and published template. Add date-only, ordering and <=30-day guards in repair. |
| `finance_cash_flow_statement_list` | `POST /v1/finance/cash-flow-statement/list` | `date.from`, `date.to` | both required; RFC3339; no half-month semantic check | nested `from/to` required and `date-time`; endpoint explicitly says report is only for periods **01–15** and **16–last day** and separate arbitrary days cannot be requested | **MATCH — wire format/requiredness** + **MISSING_GUARD — period semantics** + **INVALID_RUNNABLE_TEMPLATE** | Bridge normalizer currently checks types/fields only. Registry runnable template requests `2026-08-01` through `2026-08-28`, which violates the documented half-month period semantics, so the shipped default itself can produce a provider-invalid request. |
| `finance_transaction_list_v3` | `POST /v3/finance/transaction/list` | `filter.date.from`, `filter.date.to` or `filter.posting_number` | date fields use RFC3339 when date branch is selected; page size <=1000; no provider one-month period guard found | current public docs use `dateTime`; maximum period is **1 month**; latest superseding Ozon notice sets endpoint retirement to **2026-09-08** | **MATCH — wire format** + **MISSING_GUARD — max period** + **LIFECYCLE_RISK — CONFIRMED** | Earlier 2026-07-06 retirement announcement was superseded by a 2026-07-14 notice moving shutdown to 2026-09-08; later August reminder repeats 2026-09-08. Replacement accrual reads already exist in Bridge. |
| `posting_fbo_list` | `POST /v3/posting/fbo/list` | optional `filter.since`, `filter.to` | if both are present: permissive `new Date()` parsing + <=1-year check; a lone boundary is not date-validated | both fields are `date-time`; provider documents period >1 year as invalid | **MISSING_GUARD — strict RFC3339** + **MATCH — one-year maximum** | This is a direct loose-parser defect missed by the first helper-only pass. Do not assert pair-requiredness without provider proof; the repair invariant is strict validation of every boundary that is present. |
| `fbs_stock_by_warehouse_v1` | `POST /v1/product/info/stocks-by-warehouse/fbs` | none | registry marks `execution_enabled:true`, `currentness:"current"`, guidance-visible, with runnable template; contract still registers a dedicated normalizer and labels it `exact_operator_swagger_2026_08_25_step5` | Ozon announced this v1 endpoint retired **2026-04-07** and instructed migration to `/v2/product/info/stocks-by-warehouse/fbs` | **STALE_RETIRED_ENDPOINT — CONFIRMED** | As of audit date 2026-09-04 the retirement date is ~5 months past, yet the legacy v1 surface remains advertised as current/executable. The correct replacement already exists separately as `fbs_stock_by_warehouse` → `/v2/product/info/stocks-by-warehouse/fbs`. |
| `fbs_carriage_available_list` | `POST /v1/posting/carriage-available/list` | optional `departure_date` | registry marks `execution_enabled:true`, `currentness:"current"`; contract still binds `normalizeFbsCarriageAvailableListParams` | Ozon announced `/v1/posting/carriage-available/list` retired **2026-03-20**, with migration to `/v2/carriage/delivery/list` | **STALE_RETIRED_ENDPOINT — CONFIRMED** | The replacement already exists separately as `carriage_delivery_list_v2` → `/v2/carriage/delivery/list`. Fresh August contract labeling did not prevent a retired route from remaining executable. |
| `analytics_data` | `POST /v1/analytics/data` | `date_from`, `date_to` | both required; `requireAnalyticsDate()` accepts either `YYYY-MM-DD` or RFC3339 timestamp | current provider examples and fresh contract-derived guides consistently send `YYYY-MM-DD`; no current provider evidence found yet that a full timestamp is accepted | **NEEDS_LIVE — TOO-PERMISSIVE CANDIDATE** | Date-only live calls are already proven. Subscription-dependent >3-month history restriction is represented separately in executable entitlements. Do not promote the RFC3339 acceptance candidate to BUG until safe live or unambiguous provider evidence exists. |
| `product_queries` | `POST /v1/analytics/product-queries` | `date_from`, `date_to` | `date_from` required; `date_to` optional; strict RFC3339 | `date_from` required, `date_to` optional; both `date-time`; request example RFC3339 | **MATCH — format + requiredness** | OpenAPI required list: `page_size`, `date_from`, `skus`. |
| `product_queries_details` | `POST /v1/analytics/product-queries/details` | `date_from`, `date_to` | `date_from` required; `date_to` optional; strict RFC3339 | `date_from` required, `date_to` optional; both `date-time`; request example RFC3339 | **MATCH — format + requiredness** | OpenAPI required list: `page_size`, `date_from`, `skus`, `limit_by_sku`. |
| `seller_rating_history` | `POST /v1/rating/history` | `date_from`, `date_to` | both required; strict RFC3339; validates `date_from <= date_to` | both required; both `date-time` | **MATCH — format + requiredness + ordering guard** | No contradictory date-only description/example found. |
| `seller_fbs_error_postings` | `POST /v1/rating/index/fbs/posting/list` | `filter.date_from`, `filter.date_to` | both required; strict RFC3339; validates ordering | current OpenAPI filter requires both and marks both `date-time` | **MATCH — format + requiredness** | Earlier SDK date-only test was a false positive and is superseded by direct OpenAPI resolution. |
| `returns_list` | `POST /v1/returns/list` | one of `logistic_return_date`, `storage_tariffication_start_date`, `visual_status_change_moment`; each `time_from/time_to` | counts selected time filters and rejects >1; selected boundaries validated by strict RFC3339 helper | provider documents the same three alternative time filters and says only one may be used per request; examples use RFC3339 | **MATCH — one-time-filter rule + RFC3339** | No provider-grounded max-period rule found; none invented. Field-vocabulary sweep made this operation explicit despite indirect validation through `validateFromToObject`. |
| `rfbs_returns_list` | `POST /v2/returns/rfbs/list` | optional `filter.created_at.from/to` | `validateFromToObject()` → strict RFC3339 for present boundaries | current request example uses RFC3339 date-times | **MATCH — RFC3339 format** | No maximum period is asserted without provider evidence. Pair-requiredness is not invented unless current provider evidence proves it. |
| `carriage_delivery_list_v2` | `POST /v2/carriage/delivery/list` | optional `filter.departure_date` | plain string + regex `^YYYY-MM-DD$`; no calendar round-trip | provider documents departure date as calendar date `YYYY-MM-DD` | **MATCH — lexical shape** + **MISSING_GUARD — representable calendar date** | `2026-02-31` passes the local regex even though it is not a real date. Registry template does not hard-code this field. |
| `returns_company_fbs_info` | `POST /v1/returns/company/fbs/info` | none | request filter only `place_id` plus pagination | no request date/period selector in audited Bridge surface | **NOT_DATE_RELATED** | Explicitly closed so this returns-domain operation is not confused with date-bearing return-list methods. |

## Additional verified families persisted in companion artifacts

The matrix above is intentionally concise. The following date-bearing families have already been resolved and persisted in companion audit files:

- current posting families `fbs_posting_list`, `fbs_unfulfilled_list`, `posting_digital_list_v2` — current-version/date-range checks closed;
- `posting_fbo_list` — corrected to strict-RFC3339 **MISSING_GUARD** while retaining its one-year `MATCH` dimension;
- `fbp_posting_list`, FBP direct timeslots, supply-order timeslot ranges, assembly carriage/FBS families, ETGB — strict-date dimensions closed;
- reviews/questions/comments — strict RFC3339 and relevant ordering/selector rules closed;
- `requireDateYmd()` family — exhausted and closed;
- Performance YMD/RFC3339/62-day/recency findings — persisted separately;
- schema-driven report date/date-time/month fields — persisted separately, including the corrected placement-report range findings;
- finance realization/buyout/monthly report boundaries — persisted separately;
- `fbo_draft_timeslot_info` — raw-string/current-horizon/28-day defect persisted separately;
- direct loose `Date.parse/new Date` input-validation family — closed with **three** confirmed repair surfaces: Performance alternate `from/to`, generic EFFECT_REPAIR date/date-time, and `posting_fbo_list.since/to`;
- dynamic `auto_add_date` runnable-template dependency defect — persisted in strict-date continuation audit.

## Provider-retirement cross-checks already closed

The four posting endpoints retired by Ozon on 2026-08-31 are **not** stale in the current registry:

- `posting_fbo_list` uses `/v3/posting/fbo/list`, not retired `/v2/posting/fbo/list` — lifecycle **MATCH**; its separate date-validation defect remains.
- `fbs_posting_list` uses `/v4/posting/fbs/list`, not retired `/v3/posting/fbs/list` — lifecycle **MATCH**.
- `fbs_unfulfilled_list` uses `/v4/posting/fbs/unfulfilled/list`, not retired `/v3/posting/fbs/unfulfilled/list` — lifecycle **MATCH**.
- `posting_digital_list_v2` uses `/v2/posting/digital/list`, not retired `/v1/posting/digital/list` — lifecycle **MATCH**.

Other checked migration families:

- `seller_warehouse_list` → `/v2/warehouse/list` — lifecycle **MATCH** for the 2026-04-07 retirement of v1.
- `seller_delivery_method_list` → `/v2/delivery-method/list` — lifecycle **MATCH** for the 2026-04-07 retirement of v1.
- `carriage_delivery_list_v2` → `/v2/carriage/delivery/list` — lifecycle **MATCH**, but its `departure_date` validator has a separate calendar-validity defect.
- `discount_task_list_v2` → `/v2/actions/discounts-task/list` — current replacement exists for deprecated v1; no v1 read operation found in the authority registry.
- FBO draft read/status surfaces use v2 where Ozon retired corresponding v1 family; no stale v1 read/status duplicate identified so far.

## Confirmed repair surface highlights

### `finance_balance`

Wrong effective wire format is also embedded in the registry template. Repair must cover normalizer, registry template, guidance/examples/tests and generated/bundled copies, plus ordering and <=30-day semantics.

### `posting_fbo_list`

Provider `date-time` fields are not strictly validated. Current code uses permissive JavaScript parsing only when both bounds are present; a lone boundary bypasses date validation. Repair must validate every present `since/to` using the strong RFC3339 invariant while preserving the existing one-year bound.

### `finance_cash_flow_statement_list`

Primitive date-time shape matches, but half-month-only period semantics are missing and the published Aug 1–28 template itself violates the provider rule.

### `finance_transaction_list_v3`

Missing one-month guard plus provider retirement deadline 2026-09-08. Latest retirement notice supersedes the earlier July-6 announcement.

### `carriage_delivery_list_v2`

Current endpoint version is correct, but date-only regex validation does not establish a real calendar date. Eventual repair should reuse the strong YMD round-trip invariant rather than introduce another bespoke regex.

### stale lifecycle surfaces

`fbs_stock_by_warehouse_v1` and `fbs_carriage_available_list` remain normal current/executable operations after provider retirement. Delivery certification needs a provider-currentness gate, not just fresh Swagger presence.

## Audit queue — current state

The helper-name phase and corrected direct-parser phase are closed. Remaining static work is now terminal accounting rather than exploratory helper search:

1. complete the date-field vocabulary closure for bespoke/raw fields;
2. finish provider lifecycle/currentness cross-match for all 271 registered Seller reads;
3. build a terminal full-registry accounting that assigns every registered read to a date-audited verdict or explicit `NOT_DATE_RELATED`/lifecycle/ambiguity class;
4. keep `analytics_data` RFC3339 acceptance as `NEEDS_LIVE` until live testing is allowed to resume;
5. keep `finance_b2b_sales_json` historical wording as provider-documentation ambiguity unless an unambiguous provider source resolves it.

STD-06 remains **FROZEN ON LIVE FAIL**. No new live Ozon command is authorized by this audit state.
