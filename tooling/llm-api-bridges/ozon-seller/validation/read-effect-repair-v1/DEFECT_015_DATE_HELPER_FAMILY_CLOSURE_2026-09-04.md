# DEFECT-015 — date helper-family closure — 2026-09-04

Executable baseline under audit: `249029b0ba8d9e6f9e26182bf678adf42868c6d6` (`v0.1.19`).

Audit branch: `audit/ozon-date-contract-sweep-2026-09-04`.

Purpose: close the source-level helper-family enumeration so the all-method audit can distinguish exhausted validator families from still-open operation/business-contract work. This is evidence-only; no executable Bridge code and no live Ozon request is changed/performed here.

## 1. `requireRfc3339DateTime()` family — source enumeration closed

Every unique executable operation family that calls the strict RFC3339 helper in the authority contract has now been mapped to a persisted audit conclusion.

Mapped families:

- Ozon auto-add action reads (`ozon_auto_add_products`, `ozon_auto_add_candidates`);
- analytics product queries (`product_queries`, `product_queries_details`);
- FBO/FBP/FBS posting ranges;
- FBS unfulfilled period alternatives;
- finance cash-flow and finance transaction list;
- seller rating history / FBS error postings;
- review/question/comment date filters;
- supply-order timeslot range;
- FBP direct-timeslot reads;
- legacy FBS carriage-available read;
- assembly carriage/FBS ranges;
- certificate `issue_date`;
- ETGB range;
- digital posting list.

The corresponding operation conclusions are distributed across:

- `DEFECT_015_DATE_OPERATION_MATRIX_2026-09-04.md`;
- `DEFECT_015_STRICT_DATE_CONTINUATION_SWEEP_2026-09-04.md`;
- `DEFECT_015_STRICT_DATE_CONTINUATION_02_2026-09-04.md`;
- finance/performance/effect-repair/lifecycle companion artifacts.

Important result: the strict helper itself is not the generic defect. Where the current provider contract says `date-time`, this helper is generally the correct primitive validator. Confirmed problems in this family are operation-level semantics/templates/lifecycle, for example:

- `finance_balance` incorrectly uses this helper because its effective provider wire contract is date-only — live-confirmed bug;
- `finance_cash_flow_statement_list` has the correct primitive date-time shape but lacks the provider half-month semantic rule;
- `finance_transaction_list_v3` has correct date-time shape but a missing max-period guard and an imminent provider retirement;
- `fbs_carriage_available_list` uses a valid date-time helper on an operation whose endpoint itself is already retired;
- auto-add normalizers have correct date-time syntax while their registry templates incorrectly hard-code provider-derived dynamic dates.

Therefore no blind global replacement of `requireRfc3339DateTime()` is valid. Repairs must remain provider-operation-specific.

## 2. `requireDateYmd()` family — source enumeration closed

The strong YMD helper validates both exact `YYYY-MM-DD` syntax and real calendar representability by UTC round-trip.

All actual consumers are already audited:

1. `normalizeRemovalReportParams`
   - `removal_from_stock_list` — MATCH;
   - `removal_from_supply_list` — MATCH.
2. `normalizeFinanceAccrualByDayParams`
   - `finance_accrual_by_day` — MATCH on YMD + documented earliest date.
3. FBS act-list filter
   - `fbs_act_list` — YMD live-proven + ordering guard present.
4. `normalizePerformanceSkuStatisticsParams`
   - YMD shape/order correct; separate provider recency defect + stale runnable template recorded.
5. `normalizePerformanceMediaParams`
   - YMD branch correct; separate loose alternate RFC3339 path + 62-day rule defects recorded.
6. `normalizePerformanceDateRangeParams`
   - `performance_expense` / `performance_daily` YMD correct; 62-day rules recorded separately.
7. `normalizePerformanceCampaignProductParams`
   - YMD branch live-proven; alternate RFC3339 path is too loose; method-specific quota exemption preserved.

No additional unclassified `requireDateYmd()` consumer remains in the executable authority contract.

## 3. Mixed helper `requireAnalyticsDate()` — exactly one operation

Source enumeration shows `requireAnalyticsDate()` is consumed only by:

- `analytics_data` → `POST /v1/analytics/data`.

The helper accepts either:

- a real `YYYY-MM-DD` calendar date; or
- a strict RFC3339 date-time with timezone.

Current provider contract/example material explicitly demonstrates date-only values for `date_from/date_to`; the request schema exposes them as required strings without a mechanical `date-time` format. Existing live evidence on this account confirms the date-only path works.

No static evidence currently proves that full RFC3339 timestamps are accepted by the provider for this method. Because STD-06 is frozen, this audit does not issue a timestamp live probe.

Classification remains:

- **MATCH / LIVE-PROVEN — date-only path**;
- **NEEDS_LIVE — TOO-PERMISSIVE CANDIDATE — RFC3339 alternate acceptance**.

Do not convert the candidate to a bug without provider evidence.

## 4. `analytics_data` subscription-history rule — entitlement layer closes the apparent normalizer gap

The current provider rule says sellers without Premium Plus/Pro may request only the last three months of analytics history.

This is intentionally not encoded in `normalizeAnalyticsDataParams`. It is represented in the separate entitlement layer:

```text
POST /v1/analytics/data
feature rule: analytics_history_over_3_months
selector: date_older_than_months(date_from, 3)
allowed: PREMIUM_PLUS, PREMIUM_PRO
```

`OzonContract` calls `OzonEntitlements.requirementFor()` during seller capability preflight, so the rule participates in actual command certification rather than existing as dead documentation metadata.

Verdict:

- **MATCH — subscription-dependent three-month history restriction is represented in executable entitlement policy**.

This closes the apparent cross-layer gap. It must be preserved when date handling is repaired.

## 5. Consequence for remaining DEFECT-015 work

The named date-helper families are now exhausted. Remaining work must focus on surfaces that cannot be found by helper-name enumeration alone:

1. loose JavaScript date parsing paths (`Date.parse`, `new Date`) not preceded by strong validation;
2. schema-driven `EFFECT_REPAIR_PARAM_SCHEMAS` format/business rules;
3. month/year business boundaries;
4. dynamic/current-state registry templates;
5. provider lifecycle/deprecation/currentness;
6. operations with bespoke date structures;
7. explicit `NOT_DATE_RELATED` accounting for every remaining registry operation so all 271 Seller reads have a terminal audit classification.

No live requests were made. STD-06 remains **FROZEN ON LIVE FAIL**.
