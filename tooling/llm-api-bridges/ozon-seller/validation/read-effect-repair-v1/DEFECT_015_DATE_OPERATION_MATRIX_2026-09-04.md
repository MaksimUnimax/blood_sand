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

## Verified rows

| Bridge operation | Endpoint | Input date/period fields | Bridge rule | Current Ozon/OpenAPI rule | Classification | Evidence / note |
|---|---|---|---|---|---|---|
| `finance_balance` | `POST /v1/finance/balance` | `date_from`, `date_to` | both required; strict RFC3339 timestamp; no 30-day guard | both required; OpenAPI mechanically says `date-time` but descriptions + request example say `YYYY-MM-DD`; max interval 30 days | **BUG — LIVE CONFIRMED** + **MISSING_GUARD** | Live exact RFC3339 request `81ce5592-9e9a-4325-b2c6-1695c294ab36` returned HTTP 400/code 3. Effective wire format is date-only. Registry runnable template also hard-codes RFC3339 timestamps, so the defect exists in both normalizer and published template. Add date-only, ordering and <=30-day guards in repair. |
| `finance_cash_flow_statement_list` | `POST /v1/finance/cash-flow-statement/list` | `date.from`, `date.to` | both required; RFC3339; no half-month semantic check | nested `from/to` required and `date-time`; endpoint explicitly says report is only for periods **01–15** and **16–last day** and separate arbitrary days cannot be requested | **MATCH — wire format/requiredness** + **MISSING_GUARD — period semantics** + **INVALID_RUNNABLE_TEMPLATE** | Bridge normalizer currently checks types/fields only. Registry runnable template requests `2026-08-01` through `2026-08-28`, which violates the documented half-month period semantics, so the shipped default itself can produce a provider-invalid request. |
| `finance_transaction_list_v3` | `POST /v3/finance/transaction/list` | `filter.date.from`, `filter.date.to` or `filter.posting_number` | date fields use RFC3339 when date branch is selected; page size <=1000; no provider one-month period guard found | current public docs use `dateTime`; maximum period is **1 month**; Ozon officially announced endpoint retirement on **2026-09-08** | **MATCH — wire format** + **MISSING_GUARD — max period** + **LIFECYCLE_RISK — CONFIRMED** | Latest Ozon Seller API notice says `/v3/finance/transaction/list` and `/v3/finance/transaction/totals` will be disabled 2026-09-08. Migrate to `/v1/finance/accrual/postings`, `/v1/finance/accrual/types`, `/v1/finance/accrual/by-day`. The Bridge already exposes the three replacement operations. |
| `fbs_stock_by_warehouse_v1` | `POST /v1/product/info/stocks-by-warehouse/fbs` | none | registry marks `execution_enabled:true`, `currentness:"current"`, guidance-visible, with runnable template; contract still registers a dedicated normalizer and labels it `exact_operator_swagger_2026_08_25_step5` | Ozon announced this v1 endpoint retired **2026-04-07** and instructed migration to `/v2/product/info/stocks-by-warehouse/fbs` | **STALE_RETIRED_ENDPOINT — CONFIRMED** | As of audit date 2026-09-04 the retirement date is ~5 months past, yet the legacy v1 surface remains advertised as current/executable. The correct replacement already exists separately as `fbs_stock_by_warehouse` → `/v2/product/info/stocks-by-warehouse/fbs`. Contract registration confirms the stale route is not merely dead registry metadata. |
| `fbs_carriage_available_list` | `POST /v1/posting/carriage-available/list` | optional `departure_date` | registry marks `execution_enabled:true`, `currentness:"current"`; contract still binds `normalizeFbsCarriageAvailableListParams` with state `exact_swagger_2026_08_28_b30` | Ozon announced `/v1/posting/carriage-available/list` retired **2026-03-20**, with migration to `/v2/carriage/delivery/list` | **STALE_RETIRED_ENDPOINT — CONFIRMED** | The correct replacement already exists separately as `carriage_delivery_list_v2` → `/v2/carriage/delivery/list`. A contract state dated 2026-08-28 still certified the old route months after Ozon's announced shutdown, so the audit must cover currentness-source/review logic as well as registry metadata. |
| `analytics_data` | `POST /v1/analytics/data` | `date_from`, `date_to` | both required; `requireAnalyticsDate()` accepts either `YYYY-MM-DD` or RFC3339 timestamp | current provider examples and fresh contract-derived guides consistently send `YYYY-MM-DD`; no current provider evidence found yet that a full timestamp is accepted | **NEEDS_LIVE — TOO-PERMISSIVE CANDIDATE** | Date-only live calls are already proven on this account. Bridge acceptance of RFC3339 is broader than the documented/example surface. Do not promote to BUG until safe live timestamp evidence or direct unambiguous current OpenAPI restriction resolves effective behavior. STD-06 is frozen, so no live probe is issued during this sweep. |
| `product_queries` | `POST /v1/analytics/product-queries` | `date_from`, `date_to` | `date_from` required; `date_to` optional; strict RFC3339 | `date_from` required, `date_to` optional; both `date-time`; request example RFC3339 | **MATCH — format + requiredness** | OpenAPI required list: `page_size`, `date_from`, `skus`. Endpoint notes older-than-one-month analytics may be weekly and uses `date_from`; no conflicting wire-format example found. |
| `product_queries_details` | `POST /v1/analytics/product-queries/details` | `date_from`, `date_to` | `date_from` required; `date_to` optional; strict RFC3339 | `date_from` required, `date_to` optional; both `date-time`; request example RFC3339 | **MATCH — format + requiredness** | OpenAPI required list: `page_size`, `date_from`, `skus`, `limit_by_sku`. |
| `seller_rating_history` | `POST /v1/rating/history` | `date_from`, `date_to` | both required; strict RFC3339; validates `date_from <= date_to` | both required; both `date-time` | **MATCH — format + requiredness + ordering guard** | OpenAPI required list includes `ratings`, `date_from`, `date_to`. No contradictory date-only description/example found. |
| `seller_fbs_error_postings` | `POST /v1/rating/index/fbs/posting/list` | `filter.date_from`, `filter.date_to` | both required; strict RFC3339; validates ordering | current OpenAPI filter requires both and marks both `date-time` | **MATCH — format + requiredness** | Earlier SDK date-only test was a false positive and is superseded by direct OpenAPI resolution. |

## Provider-retirement cross-checks already closed

The four posting endpoints retired by Ozon on 2026-08-31 are **not** stale in the current registry:

- `posting_fbo_list` uses `/v3/posting/fbo/list`, not retired `/v2/posting/fbo/list` — lifecycle **MATCH**.
- `fbs_posting_list` uses `/v4/posting/fbs/list`, not retired `/v3/posting/fbs/list` — lifecycle **MATCH**.
- `fbs_unfulfilled_list` uses `/v4/posting/fbs/unfulfilled/list`, not retired `/v3/posting/fbs/unfulfilled/list` — lifecycle **MATCH**.
- `posting_digital_list_v2` uses `/v2/posting/digital/list`, not retired `/v1/posting/digital/list` — lifecycle **MATCH**.

Other checked migration families:

- `seller_warehouse_list` → `/v2/warehouse/list` — lifecycle **MATCH** for the 2026-04-07 retirement of v1.
- `seller_delivery_method_list` → `/v2/delivery-method/list` — lifecycle **MATCH** for the 2026-04-07 retirement of v1.
- `carriage_delivery_list_v2` → `/v2/carriage/delivery/list` — current replacement exists, but stale `fbs_carriage_available_list` remains enabled alongside it.
- `discount_task_list_v2` → `/v2/actions/discounts-task/list` — current replacement exists for deprecated v1; no v1 read operation has been found in the authority registry so far.
- FBO draft read/status surfaces present in the registry use v2 where Ozon retired the corresponding v1 draft family on 2026-03-16; no stale v1 read/status duplicate has been identified so far.

## Confirmed repair surface

### `finance_balance` — wrong wire format is also embedded in the registry template

The registry publishes a runnable template using RFC3339 timestamps (`2026-08-01T00:00:00Z` through `2026-08-28T23:59:59Z`). Therefore dependency closure cannot stop at `normalizeFinanceBalanceParams`: the registry template, guidance/examples/tests and generated/bundled copies must all be audited and repaired.

### `finance_cash_flow_statement_list` — missing half-month period guard + invalid published template

The current endpoint description states that this financial report is available only for periods from the 1st through the 15th and from the 16th through the last day of a month; it cannot be requested for arbitrary individual-day ranges. The Bridge's current normalizer requires `date.from`, `date.to`, `page`, and `page_size` and checks RFC3339 syntax, but it does not enforce the half-month period semantics. The registry's own runnable template spans August 1–28, so the published default violates the same provider rule.

### `finance_transaction_list_v3` — missing one-month guard + imminent endpoint retirement

The current method documentation limits one request to a maximum period of one month. The Bridge validates date-time syntax but no equivalent one-month guard has been found in the operation normalizer. This must be treated as `MISSING_GUARD` unless a downstream guard is found during dependency closure.

Separately, Ozon has announced that `/v3/finance/transaction/list` will be disabled on 2026-09-08. This is a confirmed lifecycle risk, four days after the date of this audit. It is not classified as a current provider failure on 2026-09-04. Repair/hardening must decide whether to remove/disable/deprecate the legacy operation and route guidance to the already-present accrual replacements before that date.

### `fbs_stock_by_warehouse_v1` — stale retired endpoint still advertised as current

The operation registry contains both the current v2 surface and an enabled v1 duplicate. The v1 duplicate must not remain a normal `current` user-visible executable operation after the provider-announced retirement. Contract registration confirms that the old operation is still executable through normal preflight. Dependency closure must audit entitlement rules, guidance/discovery, templates, generated/bundled copies and tests before deciding whether to remove it or fail closed with migration guidance.

### `fbs_carriage_available_list` — second stale retired endpoint still advertised as current

Ozon announced on 2026-02-16 that `/v1/posting/carriage-available/list` would be disabled on 2026-03-20 and replaced by `/v2/carriage/delivery/list`. On the 2026-09-04 authority build, the old operation is still registered, current, enabled and has a dedicated contract normalizer; the replacement is also present. This is a confirmed stale-lifecycle surface and shows that the defect class is broader than one missed endpoint.

## Audit queue

Still unresolved in this matrix:

1. all remaining provider deprecation/retirement notices affecting any of the 271 registered reads;
2. remaining strict-RFC3339 families: FBO/FBP posting ranges, reviews/questions, supplies/timeslots, FBS carriage/assembly, certificates, ETGB, rFBS;
3. `requireDateYmd()` families;
4. `analytics_data` effective timestamp acceptance (`NEEDS_LIVE` once live testing is allowed to resume);
5. loose `Date.parse()` / `new Date(...)` validators;
6. schema-driven report date/date-time fields;
7. month/year financial/report operations;
8. all no-date operations, which must eventually be counted/classified `NOT_DATE_RELATED` so the full 271-command sweep has explicit closure.

STD-06 remains **FROZEN ON LIVE FAIL**. No new live Ozon command is authorized by this audit state.
