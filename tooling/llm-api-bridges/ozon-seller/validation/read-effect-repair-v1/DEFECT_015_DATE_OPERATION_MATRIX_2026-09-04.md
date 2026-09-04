# DEFECT-015 — Date operation matrix — 2026-09-04

Executable baseline under audit: `249029b0ba8d9e6f9e26182bf678adf42868c6d6` (`v0.1.19`).

This matrix is the persistent row-by-row companion to `DEFECT_015_DATE_CONTRACT_SWEEP_2026-09-04.md`. Rows are added only after resolving the Bridge validator and current provider-contract evidence. `MATCH` is dimension-specific; it does not imply the entire operation is certified.

## Classification legend

- `BUG` — confirmed Bridge/provider mismatch.
- `MISSING_GUARD` — Bridge accepts inputs the current provider contract says are invalid/restricted.
- `MATCH` — audited date-format/requiredness rule matches.
- `LIFECYCLE_RISK` — provider has announced a future retirement/change affecting the operation; this is not a current live failure unless separately proven.
- `NEEDS_LIVE` — static evidence is contradictory/insufficient.
- `NOT_DATE_RELATED` — no input date/time/period surface for this defect class.

## Verified rows

| Bridge operation | Endpoint | Input date/period fields | Bridge rule | Current Ozon/OpenAPI rule | Classification | Evidence / note |
|---|---|---|---|---|---|---|
| `finance_balance` | `POST /v1/finance/balance` | `date_from`, `date_to` | both required; strict RFC3339 timestamp; no 30-day guard | both required; OpenAPI mechanically says `date-time` but descriptions + request example say `YYYY-MM-DD`; max interval 30 days | **BUG — LIVE CONFIRMED** + **MISSING_GUARD** | Live exact RFC3339 request `81ce5592-9e9a-4325-b2c6-1695c294ab36` returned HTTP 400/code 3. Effective wire format is date-only. Add <=30-day and ordering guards in repair. |
| `finance_cash_flow_statement_list` | `POST /v1/finance/cash-flow-statement/list` | `date.from`, `date.to` | both required; RFC3339; no half-month semantic check | nested `from/to` required and `date-time`; endpoint explicitly says report is only for periods **01–15** and **16–last day** and separate arbitrary days cannot be requested | **MATCH — wire format/requiredness** + **MISSING_GUARD — period semantics** | Bridge normalizer currently checks types/fields only, so provider-invalid arbitrary periods can pass preflight. |
| `finance_transaction_list_v3` | `POST /v3/finance/transaction/list` | `filter.date.from`, `filter.date.to` or `filter.posting_number` | date fields use RFC3339 when date branch is selected; page size <=1000; no provider one-month period guard found | current public docs use `dateTime`; maximum period is **1 month**; Ozon officially announced endpoint retirement on **2026-09-08** | **MATCH — wire format** + **MISSING_GUARD — max period** + **LIFECYCLE_RISK — CONFIRMED** | Ozon Seller API notification dated 2026-07-14 says `/v3/finance/transaction/list` and `/v3/finance/transaction/totals` will be disabled 2026-09-08. Migrate to `/v1/finance/accrual/postings`, `/v1/finance/accrual/types`, `/v1/finance/accrual/by-day`. The Bridge already exposes the three replacement operations. Provider source: `https://t.me/OzonSellerAPI/476` / channel announcement; reaffirmed 2026-08-24 (`https://tg.me/ozonsellerapi/684`). |
| `product_queries` | `POST /v1/analytics/product-queries` | `date_from`, `date_to` | `date_from` required; `date_to` optional; strict RFC3339 | `date_from` required, `date_to` optional; both `date-time`; request example RFC3339 | **MATCH — format + requiredness** | OpenAPI required list: `page_size`, `date_from`, `skus`. Endpoint notes older-than-one-month analytics may be weekly and uses `date_from`; no conflicting wire-format example found. |
| `product_queries_details` | `POST /v1/analytics/product-queries/details` | `date_from`, `date_to` | `date_from` required; `date_to` optional; strict RFC3339 | `date_from` required, `date_to` optional; both `date-time`; request example RFC3339 | **MATCH — format + requiredness** | OpenAPI required list: `page_size`, `date_from`, `skus`, `limit_by_sku`. |
| `seller_rating_history` | `POST /v1/rating/history` | `date_from`, `date_to` | both required; strict RFC3339; validates `date_from <= date_to` | both required; both `date-time` | **MATCH — format + requiredness + ordering guard** | OpenAPI required list includes `ratings`, `date_from`, `date_to`. No contradictory date-only description/example found. |
| `seller_fbs_error_postings` | `POST /v1/rating/index/fbs/posting/list` | `filter.date_from`, `filter.date_to` | both required; strict RFC3339; validates ordering | current OpenAPI filter requires both and marks both `date-time` | **MATCH — format + requiredness** | Earlier SDK date-only test was a false positive and is superseded by direct OpenAPI resolution. |

## Newly confirmed repair surface

### `finance_cash_flow_statement_list` — missing half-month period guard

The current endpoint description states that this financial report is available only for periods from the 1st through the 15th and from the 16th through the last day of a month; it cannot be requested for arbitrary individual-day ranges. The Bridge's current normalizer requires `date.from`, `date.to`, `page`, and `page_size` and checks RFC3339 syntax, but it does not enforce the half-month period semantics.

### `finance_transaction_list_v3` — missing one-month guard + imminent endpoint retirement

The current method documentation limits one request to a maximum period of one month. The Bridge validates date-time syntax but no equivalent one-month guard has been found in the operation normalizer. This must be treated as `MISSING_GUARD` unless a downstream guard is found during dependency closure.

Separately, Ozon has announced that `/v3/finance/transaction/list` will be disabled on 2026-09-08. This is a confirmed lifecycle risk, four days after the date of this audit. It is not classified as a current provider failure on 2026-09-04. Repair/hardening must decide whether to remove/disable/deprecate the legacy operation and route guidance to the already-present accrual replacements before that date.

## Audit queue

Still unresolved in this matrix:

1. remaining strict-RFC3339 families: FBO/FBP posting ranges, reviews/questions, supplies/timeslots, FBS carriage/assembly, certificates, ETGB, rFBS;
2. all provider deprecation/retirement notices affecting any of the 271 registered reads;
3. `requireDateYmd()` families;
4. `requireAnalyticsDate()` mixed-format analytics inputs;
5. loose `Date.parse()` / `new Date(...)` validators;
6. schema-driven report date/date-time fields;
7. month/year financial/report operations;
8. all no-date operations, which must eventually be counted/classified `NOT_DATE_RELATED` so the full 271-command sweep has explicit closure.

STD-06 remains **FROZEN ON LIVE FAIL**. No new live Ozon command is authorized by this audit state.
