# DEFECT-015 — date-field vocabulary sweep — 2026-09-04

Executable baseline under audit: `249029b0ba8d9e6f9e26182bf678adf42868c6d6` (`v0.1.19`).

Audit branch: `audit/ozon-date-contract-sweep-2026-09-04`.

Purpose: prove that the date/period audit is not limited to shared helper names. Bespoke normalizers can contain date-bearing fields without calling a helper whose name contains `Date`, so the authority contract is also swept by field vocabulary and range-object structure.

This is evidence-only. No executable Bridge code is changed and no new live Ozon request is performed. STD-06 remains frozen at the live `finance_balance` failure.

## Why this pass is required

Previous passes enumerated:

- `requireRfc3339DateTime()` consumers;
- `requireDateYmd()` consumers;
- `requireAnalyticsDate()`;
- direct `Date.parse()` / `new Date()` paths;
- schema-driven `format: date`, `format: date-time`, `format: month`.

The field pass is deliberately independent because helper enumeration can miss bespoke date handling. It did in fact find two important corrections/new findings:

1. `carriage_delivery_list_v2.departure_date` uses a lexical YMD regex without real-calendar validation;
2. `posting_fbo_list.since/to` uses permissive JavaScript `new Date()` validation rather than the strict RFC3339 helper, correcting an earlier audit false `MATCH`.

The field-level sweep searches the executable authority for date/time vocabulary including `date_from`, `date_to`, camelCase date fields, `since/to`, `created_*`, `published_*`, `processed_at_*`, `cutoff_*`, `delivering_date_*`, `interval_*`, `departure_date`, `issue_date`, `auto_add_date`, return time filters and day/month/year structures.

## 1. `returns_list` — date filters MATCH

Operation: `POST /v1/returns/list`.

Current provider contract:

- the filter exposes three alternative time filters:
  - `logistic_return_date`;
  - `storage_tariffication_start_date`;
  - `visual_status_change_moment`;
- each time filter carries `time_from` / `time_to` date-time values;
- provider documentation states that only one of these time filters may be used in one request;
- provider request examples use timezone-bearing RFC3339 timestamps.

Executable baseline `normalizeReturnsListParams`:

- declares exactly those three date-filter fields;
- counts selected date filters and locally rejects more than one;
- validates the selected range through `validateFromToObject(..., {fromKey:"time_from", toKey:"time_to"})`;
- `validateFromToObject` applies strict `requireRfc3339DateTime()` to present boundaries;
- `limit` max 500 is separately enforced.

Verdict:

- **MATCH — provider one-time-filter rule**;
- **MATCH — RFC3339 boundary format**;
- **NO PROVIDER-GROUNDED MAX-PERIOD RULE FOUND** in the inspected current contract, so no period limit is invented.

## 2. `rfbs_returns_list` — created-at range MATCH

Operation: `POST /v2/returns/rfbs/list`.

Current provider contract/request example:

- optional `filter.created_at` contains `from` and `to`;
- example values are RFC3339 date-times such as `2019-08-24T14:15:22.123Z`.

Executable baseline `normalizeRfbsReturnsListParams`:

- allows optional `filter.created_at`;
- validates it through `validateFromToObject()`;
- therefore present `from/to` boundaries pass through strict `requireRfc3339DateTime()`.

Verdict:

- **MATCH — RFC3339 boundary format**;
- no additional maximum period is asserted without provider evidence.

The range helper permits a partially supplied optional range unless `requirePair` is explicitly requested. No provider defect is claimed unless current provider evidence proves that both boundaries must always be supplied together.

## 3. `carriage_delivery_list_v2.departure_date` — confirmed shared-class defect

Operation: `POST /v2/carriage/delivery/list`.

Current provider contract:

- `filter.departure_date` is an optional calendar-date filter documented as `YYYY-MM-DD`;
- current generated provider-derived types describe it as `Дата отгрузки (YYYY-MM-DD)`.

Executable baseline `normalizeStep7CarriageDeliveryListParams`:

```text
if departure_date is present:
  requireString(...)
  regex /^\d{4}-\d{2}-\d{2}$/
```

The normalizer validates lexical shape only. It does not round-trip the value as a real calendar date and therefore locally accepts impossible values such as `2026-02-31` or numerically impossible month/day combinations that still match the two-digit shape.

Verdict:

- **MATCH — lexical `YYYY-MM-DD` shape requirement**;
- **MISSING_GUARD — representable calendar date**.

Registry status:

- current route is `/v2/carriage/delivery/list`;
- static registry template uses `{limit:100}` and does not hard-code `departure_date`;
- therefore there is no date-template defect for this operation from current evidence.

Required deterministic repair controls when executable patching is authorized:

- valid real YMD -> preflight pass;
- malformed lexical date -> local reject / physical requests 0;
- impossible calendar date (`2026-02-31`) -> local reject / physical requests 0;
- impossible numeric domain (`2026-13-01`) -> local reject / physical requests 0.

## 4. `returns_company_fbs_info` — NOT_DATE_RELATED

Operation: `POST /v1/returns/company/fbs/info`.

Despite belonging to the returns domain, its current Bridge request surface contains only optional `filter.place_id` plus pagination (`last_id`, `limit`). There is no request date/time/period field in the authority normalizer.

Classification: **NOT_DATE_RELATED**.

## 5. `posting_fbo_list.since/to` — field pass corrected earlier false MATCH

Operation: `POST /v3/posting/fbo/list`.

The bare `since` vocabulary pass found that the executable normalizer does not use the strict date-time helper:

```text
if both since and to are present:
  new Date(since)
  new Date(to)
  reject only JavaScript-unparseable values
  enforce <= 1 year
```

If only one boundary is present, the normalizer does not date-validate that field.

Provider contract documents `since/to` as `date-time` fields and exposes the one-year maximum period rule.

Corrected verdict:

- **MISSING_GUARD — strict RFC3339 for every present `since/to` boundary**;
- **MATCH — one-year maximum-period guard when both boundaries are present**.

No pair-requiredness rule is invented without provider evidence.

This finding is propagated to the corrected strict-continuation artifact, loose-parser closure and main operation matrix.

## 6. Previously known vocabulary findings reconfirmed

The field search reconfirmed already persisted date-bearing families rather than exposing further independent defects:

- `fbs_posting_list`: required `since/to`, strict RFC3339, <=1 year;
- `fbs_unfulfilled_list`: exactly one of cutoff or delivery period families, strict RFC3339, <=1 year;
- `review_list`, `review_comment_list`, `question_list`: strict RFC3339 date filters with ordering where both bounds exist;
- `supply_order_list`: optional `timeslot_from_range` uses strict RFC3339;
- `fbs_carriage_container_list`: `created_from/created_to` strict RFC3339 with conditional requiredness;
- `report_postings_create`: schema-driven `processed_at_from/to`, already recorded under weak `format: date-time` shared validator;
- `report_returns_create_v2`: schema-driven date-time + three-month recency defect already recorded;
- `finance_products_buyout`: raw YMD strings + ordering/31-day defects already recorded;
- `fbo_draft_timeslot_info`: raw date strings + current-horizon/28-day defects already recorded;
- Performance camelCase `dateFrom/dateTo`: already covered by the Performance audit;
- `auto_add_date`, `issue_date`, `interval_start/end`, `cutoff_*`, `delivering_date_*`, `published_*`, `processed_at_*`, `created_*`, day/month/year structures: all map to already-accounted operations.

## 7. Negative alternate-vocabulary sweep

To guard against a naming blind spot, the authority contract was also searched for alternate temporal vocabulary not already covered by the normal Ozon field names:

- `expires`;
- `effective`;
- `window`;
- `datetime`;
- `period_from` / `period_to`;
- `dateStart` / `dateEnd`;
- `startTime` / `endTime`;
- `start_at` / `end_at`;
- `validFrom` and related variants.

No additional request-date validator family was found from those names.

A separate full `since` pass returned only already-resolved posting families; importantly, that pass produced the `posting_fbo_list` correction above.

## 8. Terminal field-vocabulary result

After reconciling helper consumers, direct parser paths, schema formats and raw/bespoke date vocabulary, the Seller API authority contains **52 registered operations with an input date/time/period surface relevant to this audit**.

Those 52 are explicitly enumerated and terminally classified in `DEFECT_015_FULL_OPERATION_ACCOUNTING_2026-09-04.md`.

No unclassified bespoke date-field family remains in the executable authority contract.

Verdict: **DATE_FIELD_VOCABULARY_SWEEP = CLOSED**.

The remaining registry operations can now be classified by complement as `NOT_DATE_RELATED` for DEFECT-015, except operations with an independent lifecycle-only defect.

STD-06 remains **FROZEN ON LIVE FAIL**. No live provider request was made in this audit step.
