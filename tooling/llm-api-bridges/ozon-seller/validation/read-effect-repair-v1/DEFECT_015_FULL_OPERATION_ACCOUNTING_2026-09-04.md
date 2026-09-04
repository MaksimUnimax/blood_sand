# DEFECT-015 — full Bridge operation accounting — 2026-09-04

Executable baseline under audit:

- commit `249029b0ba8d9e6f9e26182bf678adf42868c6d6`;
- tree `2c565626982c1a9a1919add09824ce2c5e44ee29`;
- extension `v0.1.19`.

Audit branch: `audit/ozon-date-contract-sweep-2026-09-04`.

Purpose: terminally account for the **entire registered Ozon Bridge read surface** after the live `finance_balance` provider failure, so no method remains implicitly unreviewed for the date/time/period/currentness defect class.

This is evidence-only. No executable Bridge code is modified and no new live Ozon request is performed. STD-06 remains **FROZEN ON LIVE FAIL**.

## 1. Authority population

The authority registry is composed of two provider populations:

- Seller API registered reads: **271**;
- Performance API registered reads: **25**.

Total registered read operations under this Bridge authority:

`271 + 25 = 296`.

Performance operations are the contiguous `performance_*` block at the end of `ozon_operation_registry.js`; 25 aliases are explicitly enumerated below.

Seller population count is the authority count already used by the lifecycle/date sweep and is reconciled here against the 52 date-bearing Seller aliases plus one independent lifecycle-only alias and the complement.

## 2. Terminal classes are intentionally disjoint

Each registered operation is counted exactly once in one primary terminal class:

1. `DATE_AUDITED_MATCH`;
2. `DATE_AUDITED_DEFECT`;
3. `DATE_AUDITED_NEEDS_LIVE`;
4. `PROVIDER_DOCUMENTATION_AMBIGUITY`;
5. `LIFECYCLE_ONLY_DEFECT`;
6. `NOT_DATE_RELATED`.

Secondary facts do not create extra rows in the count. For example:

- `finance_transaction_list_v3` is counted once as `DATE_AUDITED_DEFECT`; its 2026-09-08 lifecycle deadline is a secondary risk;
- `fbs_carriage_available_list` is counted once as `DATE_AUDITED_DEFECT`; its passed retirement date is a secondary stale-endpoint defect;
- `fbs_stock_by_warehouse_v1` has no date input, so it is the one `LIFECYCLE_ONLY_DEFECT`.

## 3. Seller API — 52 date-bearing operations

The independent helper/parser/schema/field-vocabulary sweeps resolve exactly **52** Seller API operations with an input date/time/period surface.

### 3.1 `DATE_AUDITED_MATCH` — 30 Seller operations

1. `product_queries`
2. `product_queries_details`
3. `fbp_posting_list`
4. `fbs_posting_list`
5. `fbs_unfulfilled_list`
6. `fbs_act_list`
7. `assembly_carriage_posting_list`
8. `assembly_carriage_product_list`
9. `assembly_fbs_posting_list`
10. `assembly_fbs_product_list`
11. `fbs_carriage_container_list`
12. `returns_list`
13. `rfbs_returns_list`
14. `removal_from_stock_list`
15. `removal_from_supply_list`
16. `finance_accrual_by_day`
17. `seller_rating_history`
18. `seller_fbs_error_postings`
19. `review_list`
20. `review_comment_list`
21. `question_list`
22. `supply_order_list`
23. `fbp_draft_direct_timeslot_get`
24. `fbp_order_direct_timeslot_list`
25. `posting_global_etgb`
26. `posting_digital_list_v2`
27. `finance_document_b2b_sales`
28. `finance_mutual_settlement_report`
29. `finance_compensation_report`
30. `finance_decompensation_report`

`MATCH` is date/period-contract-specific, not a universal certification of every unrelated parameter or result field.

### 3.2 `DATE_AUDITED_DEFECT` — 20 Seller operations

1. `ozon_auto_add_products`
   - normalizer date-time shape matches;
   - static runnable `auto_add_date` is invalid because the value is dynamic provider state from `/v1/actions`.

2. `ozon_auto_add_candidates`
   - same dynamic-dependency runnable-template defect.

3. `posting_fbo_list`
   - `since/to` use permissive JavaScript `new Date()` validation rather than strict RFC3339;
   - a lone boundary bypasses date validation;
   - existing <=1-year rule is retained as a positive dimension.

4. `fbs_carriage_available_list`
   - provider-retired `/v1/posting/carriage-available/list` remains normal current/executable;
   - replacement `/v2/carriage/delivery/list` already exists.

5. `finance_cash_flow_statement_list`
   - primitive RFC3339 shape matches;
   - provider half-month-only period semantics missing;
   - registry Aug 1–28 template violates provider semantics.

6. `finance_transaction_list_v3`
   - missing provider maximum one-month period guard;
   - provider shutdown deadline is 2026-09-08 after superseding earlier July-6 notice.

7. `finance_balance`
   - **LIVE-CONFIRMED** wrong wire-format choice;
   - effective provider contract is date-only `YYYY-MM-DD`;
   - missing ordering and <=30-day guards;
   - registry template also uses the wrong RFC3339 shape.

8. `finance_realization_by_day`
   - missing real-calendar validation;
   - missing provider 32-calendar-day recency guard.

9. `finance_realization_posting`
   - missing month domain [1,12];
   - missing earliest effective report period 2023-08.

10. `finance_realization_v2`
    - missing earliest effective period 2023-08;
    - shared month-domain repair required.

11. `finance_products_buyout`
    - raw strings instead of real YMD validation;
    - missing ordering;
    - missing <=31-day period rule.

12. `fbo_draft_timeslot_info`
    - raw strings instead of real YMD;
    - missing ordering/current-date horizon/28-day rule;
    - hard-coded runnable dates are lifecycle-stale.

13. `carriage_delivery_list_v2`
    - `departure_date` uses lexical regex only;
    - impossible calendar dates pass local preflight.

14. `report_returns_create_v2`
    - generic `format: date-time` uses permissive `Date.parse` rather than strict RFC3339;
    - missing last-three-month recency rule;
    - hard-coded January 2026 template is stale on 2026-09-04.

15. `report_postings_create`
    - generic `format: date-time` is too permissive.

16. `report_placement_by_products_create`
    - generic `format: date` accepts impossible calendar dates;
    - existing ordering and <=31-day guards are already correct and must be preserved.

17. `report_placement_by_supplies_create`
    - same impossible-calendar-date defect;
    - existing ordering and <=31-day guards already present.

18. `report_marked_products_sales_create`
    - generic `format: date` accepts impossible calendar dates;
    - existing ordering guard already present.

19. `report_realization_posting_create`
    - primitive month [1,12] and year>=2023 checks already exist;
    - missing effective earliest business period 2023-08.

20. `product_certification_params_v2`
    - `issue_date` strict RFC3339 is correct;
    - missing mutual-exclusion guard for `expired_date.date` versus `expired_date.infinite`.

Seller date-defect count: **20**.

### 3.3 `DATE_AUDITED_NEEDS_LIVE` — 1 Seller operation

1. `analytics_data`
   - date-only `YYYY-MM-DD` is live-proven;
   - Bridge also accepts strict RFC3339;
   - current provider material demonstrates date-only but static evidence does not unambiguously prove timestamp rejection;
   - remains `NEEDS_LIVE — TOO-PERMISSIVE CANDIDATE` until STD-06 is legitimately unfrozen;
   - subscription-dependent history >3 months is already represented in executable entitlement policy, so that is **not** a missing guard.

### 3.4 `PROVIDER_DOCUMENTATION_AMBIGUITY` — 1 Seller operation

1. `finance_b2b_sales_json`
   - required `YYYY-MM` month syntax matches;
   - current provider wording about January 2019 is semantically ambiguous and must not be converted into an invented local earliest/latest boundary.

### Seller date-bearing reconciliation

`30 MATCH + 20 DEFECT + 1 NEEDS_LIVE + 1 AMBIGUITY = 52`.

## 4. Seller API — independent lifecycle-only defect

### `LIFECYCLE_ONLY_DEFECT` — 1 Seller operation

1. `fbs_stock_by_warehouse_v1`
   - no request date/time/period input;
   - provider retired `/v1/product/info/stocks-by-warehouse/fbs` on 2026-04-07;
   - Bridge still advertises it as current/executable;
   - current v2 replacement exists separately.

This operation is intentionally not included in the 52 date-bearing set.

## 5. Seller API — `NOT_DATE_RELATED` complement

Seller authority population: **271**.

Remove:

- 52 date-bearing operations;
- 1 lifecycle-only defect without a date input.

The exact remaining Seller registry complement is:

`271 - 52 - 1 = 218`.

All **218** remaining Seller operations are terminally classified **`NOT_DATE_RELATED` for DEFECT-015**.

This is not an assumption based on business domain names. The complement is permitted only after independent source sweeps closed all of the following discovery routes:

- every `requireRfc3339DateTime()` consumer;
- every `requireDateYmd()` consumer;
- the single `requireAnalyticsDate()` consumer;
- direct `Date.parse/new Date` acceptance paths;
- `EFFECT_REPAIR_PARAM_SCHEMAS` `date`, `date-time`, `month` fields;
- raw/bespoke date vocabulary (`date_from/to`, camelCase variants, `since/to`, `created_*`, `published_*`, `processed_at_*`, `cutoff_*`, `delivering_date_*`, `interval_*`, `departure_date`, `issue_date`, `auto_add_date`, `time_from/to`, day/month/year);
- alternate vocabulary (`expires`, `effective`, `window`, `datetime`, `period_from/to`, `dateStart/dateEnd`, `startTime/endTime`, `start_at/end_at`, `validFrom` variants).

No additional request temporal-field family remained after those passes.

Explicit examples already persisted as `NOT_DATE_RELATED` include `rfbs_returns_get`, `returns_company_fbs_info`, `arrival_pass_list`, `receipts_get`, `receipts_seller_list` and `conditional_cancellation_list`; the 218 count is the exact registry complement, not merely those examples.

## 6. Performance API — all 25 operations

The authority Performance block contains **25** operations.

### 6.1 `DATE_AUDITED_DEFECT` — 9 Performance operations

1. `performance_expense`
   - YMD shape correct;
   - missing 62-day statistics-export maximum.

2. `performance_daily`
   - YMD shape correct;
   - missing 62-day maximum.

3. `performance_campaign_product`
   - YMD path live-proven;
   - alternate documented RFC3339 `from/to` path uses permissive JavaScript date parsing;
   - method is explicitly exempt from Performance API limits, so no 62-day rule is invented.

4. `performance_media`
   - YMD path correct;
   - alternate RFC3339 path too permissive;
   - missing 62-day maximum.

5. `performance_sku_statistics`
   - YMD/order correct;
   - missing provider recency boundary;
   - static January 2026 runnable template is stale for the near-current provider rule;
   - method is limit-exempt.

6. `performance_media_csv`
   - inherits corresponding media date/period defects.

7. `performance_campaign_product_csv`
   - inherits campaign-product alternate RFC3339 defect; no unsupported 62-day rule added.

8. `performance_expense_csv`
   - inherits expense 62-day defect.

9. `performance_daily_csv`
   - inherits daily 62-day defect.

Performance date-defect count: **9**.

### 6.2 `NOT_DATE_RELATED` — 16 Performance operations

1. `performance_campaigns`
2. `performance_campaign_objects`
3. `performance_bid_limits`
4. `performance_campaign_products`
5. `performance_search_promo_products`
6. `performance_min_bid_by_sku`
7. `performance_products_with_bonuses`
8. `performance_statistics_status`
9. `performance_statistics_list_ui`
10. `performance_statistics_list_api`
11. `performance_statistics_report_download`
12. `performance_competitive_bids`
13. `performance_cpo_min_bids`
14. `performance_vendor_statistics_list`
15. `performance_vendor_statistics_status`
16. `performance_vendor_tag`

These 16 operations do not expose an input date/time/period field in the authority registry/contract surface relevant to DEFECT-015.

Performance reconciliation:

`9 DATE_AUDITED_DEFECT + 16 NOT_DATE_RELATED = 25`.

## 7. Full Bridge terminal reconciliation

Disjoint primary classes across Seller + Performance:

| Terminal class | Count |
|---|---:|
| `DATE_AUDITED_MATCH` | 30 |
| `DATE_AUDITED_DEFECT` | 29 |
| `DATE_AUDITED_NEEDS_LIVE` | 1 |
| `PROVIDER_DOCUMENTATION_AMBIGUITY` | 1 |
| `LIFECYCLE_ONLY_DEFECT` | 1 |
| `NOT_DATE_RELATED` | 234 |
| **TOTAL** | **296** |

Arithmetic:

`30 + 29 + 1 + 1 + 1 + 234 = 296`.

Provider split cross-check:

- Seller: `30 + 20 + 1 + 1 + 1 + 218 = 271`;
- Performance: `9 + 16 = 25`;
- total: `271 + 25 = 296`.

No registered read operation remains outside the terminal accounting.

## 8. What “full Bridge checked” means here

This accounting closes the user-requested static sweep for the defect class exposed by `finance_balance`:

> the Bridge must not treat primitive OpenAPI shape, permissive JavaScript parsing, stale templates, or mere Swagger presence as sufficient proof that a provider request is valid/current.

The audit covered four independent dimensions:

1. wire date/time/month representation;
2. cross-field and range/business semantics;
3. runnable template currentness/dynamic dependencies;
4. provider endpoint lifecycle/currentness.

It does **not** claim every conceivable non-date business rule of all 296 operations has been re-audited from scratch. The scope is the explicit user-requested same-class sweep triggered by the provider date/period failure, expanded where it revealed the adjacent provider-currentness process defect.

## 9. Static audit closure status

`DEFECT_015_FULL_OPERATION_ACCOUNTING = PASS`.

Meaning:

- registry population reconciles exactly;
- every date-bearing operation is explicitly classified;
- every non-date operation has a terminal complement classification;
- the known lifecycle-only operation is not hidden inside the complement;
- unresolved provider ambiguity and the one live-needed case are explicit rather than guessed;
- no new live provider request was used to force closure.

This does **not** mean DEFECT-015 is repaired.

Next required phase is a consolidated **repair/dependency-closure plan** covering all confirmed defects, their shared root causes, source/dist/generated copies, templates/guidance, lifecycle gate, deterministic negative controls and the exact post-repair live rerun point.

STD-06 remains **FROZEN ON LIVE FAIL** until that repair is implemented, packaged, certified and the failed `finance_balance` step is rerun on the repaired artifact.
