# DEFECT-015 — strict date continuation 02 — 2026-09-04

Executable baseline under audit: `249029b0ba8d9e6f9e26182bf678adf42868c6d6` (`v0.1.19`).

Audit branch: `audit/ozon-date-contract-sweep-2026-09-04`.

This artifact continues the all-method date/time/period audit after `DEFECT_015_STRICT_DATE_CONTINUATION_SWEEP_2026-09-04.md`. It is evidence-only: no executable Bridge file is changed and no new live Ozon request is performed. STD-06 remains frozen at the live `finance_balance` failure.

## 1. Current FBS posting lists

### `fbs_posting_list` — `POST /v4/posting/fbs/list`

Current provider contract:

- `filter.since` and `filter.to` are required `date-time` fields for the normal period-based list request;
- maximum requested period is one year;
- nested `last_changed_status_date.from/to`, when supplied, are also date-time fields;
- current v4 route is the replacement for the retired v3 list endpoint.

Executable baseline:

- `normalizeFbsPostingListParams` requires the top-level `filter`;
- requires `filter.since` and `filter.to`;
- validates both through strict `requireRfc3339DateTime()`;
- calls `assertPeriodAtMostOneYear(filter.since, filter.to, ...)`;
- validates optional `last_changed_status_date` through the same strict date-time helper family;
- authority registry points to `/v4/posting/fbs/list`, not the retired v3 route.

Classification:

- **MATCH — RFC3339 wire format**;
- **MATCH — required period pair**;
- **MATCH — one-year maximum-period guard**;
- **MATCH — lifecycle version**.

No DEFECT-015 repair is opened for this operation from the audited date/currentness dimensions.

### `fbs_unfulfilled_list` — `POST /v4/posting/fbs/unfulfilled/list`

Current provider contract:

- request filter is period-based;
- caller must select exactly one period family:
  - `cutoff_from` + `cutoff_to`, or
  - `delivering_date_from` + `delivering_date_to`;
- the selected fields are `date-time`;
- maximum requested period is one year;
- current v4 route replaces the retired v3 unfulfilled-list endpoint.

Executable baseline:

- `normalizeFbsUnfulfilledListParams` detects whether the cutoff pair or delivery pair is selected;
- rejects both-families-selected and neither-family-selected states;
- requires both fields of the selected pair;
- applies strict `requireRfc3339DateTime()` to the selected pair;
- calls `assertPeriodAtMostOneYear()` for the selected pair;
- authority registry points to `/v4/posting/fbs/unfulfilled/list`.

Classification:

- **MATCH — exactly-one period-family cross-field rule**;
- **MATCH — complete selected pair**;
- **MATCH — RFC3339 wire format**;
- **MATCH — one-year maximum-period guard**;
- **MATCH — lifecycle version**.

This closes a potentially high-risk surface: the Bridge already prevents an invalid mixed cutoff/delivery request locally.

## 2. Explicit `NOT_DATE_RELATED` closures

The all-271-method audit must not silently skip operations that happen not to accept dates. The following current operations were inspected and have no relevant input date/time/period surface.

### `arrival_pass_list` — `POST /v1/pass/list`

Provider/Bridge filter surfaces cover pass identifiers, arrival reason, drop-off/warehouse identifiers and active-state filtering. The Bridge request does not expose a date/time range.

Classification: **NOT_DATE_RELATED**.

### `receipts_get` — `POST /v1/receipts/get`

Input is `receipt_id`; there is no input date/time/period selector.

Classification: **NOT_DATE_RELATED**.

### `receipts_seller_list` — `POST /v1/receipts/seller/list`

Input is page/page-size pagination; no input date/time/period selector is exposed.

Classification: **NOT_DATE_RELATED**.

### `conditional_cancellation_list` — `POST /v2/conditional-cancellation/list`

Bridge input consists of pagination plus optional cancellation filters (`cancellation_initiator`, `posting_number`, `state`) and response options. No date/time/period input is present.

Classification: **NOT_DATE_RELATED**.

These classifications are important for exhaustive closure: they count as reviewed operations rather than unexamined gaps.

## 3. `finance_b2b_sales_json` — month syntax closed; provider-history wording ambiguous

Operation: `POST /v1/finance/document-b2b-sales/json`.

Executable baseline:

- accepts required `date` only;
- enforces lexical `YYYY-MM` with month `01..12`;
- registry template uses `2019-01`.

Current provider schema:

- marks `date` required;
- describes the reporting period as `YYYY-MM`;
- also contains the wording `Отчёт доступен до января 2019 включительно.`

That historical sentence is semantically suspicious for a method introduced years later and conflicts with the normal interpretation of an ongoing monthly report surface. It is not safe evidence for inventing either `date <= 2019-01` or `date >= 2019-01` locally.

Classification:

- **MATCH — requiredness**;
- **MATCH — `YYYY-MM` lexical/month-domain format**;
- **PROVIDER_DOCUMENTATION_AMBIGUITY — historical boundary unresolved**.

No new local historical guard is authorized from ambiguous prose. If the boundary later matters for repair or a safe test, it requires an unambiguous provider source or live clarification after STD-06 is unfrozen.

## 4. Other schema-driven monthly finance reports — MATCH on published date contract

The shared effect-repair schema uses `format: month`, implemented as exact `YYYY-(01..12)`, for all four operations below. It also marks `date` required.

### `finance_document_b2b_sales` — `POST /v1/finance/document-b2b-sales`

Current provider schema:

- `date` required;
- reporting period documented as `YYYY-MM`;
- no separate earliest/latest business-period bound is published in the inspected request schema.

Classification: **MATCH — requiredness + month format**.

### `finance_mutual_settlement_report` — `POST /v1/finance/mutual-settlement`

Current provider schema:

- `date` required;
- reporting period documented as `YYYY-MM`;
- no separate earliest/latest business-period bound is published in the inspected request schema.

Classification: **MATCH — requiredness + month format**.

### `finance_compensation_report` — `POST /v1/finance/compensation`

Current provider schema:

- `date` required;
- reporting period documented as `YYYY-MM`;
- request example uses a valid month value (`2023-09`);
- no separate earliest/latest business-period bound is published in the inspected request schema.

Classification: **MATCH — requiredness + month format**.

### `finance_decompensation_report` — `POST /v1/finance/decompensation`

Current provider schema is parallel to the compensation report:

- `date` required;
- reporting period documented as `YYYY-MM`;
- request example uses a valid month value (`2023-09`);
- no separate earliest/latest business-period bound is published in the inspected request schema.

Classification: **MATCH — requiredness + month format**.

No additional date-bound defect is opened for these four operations without provider evidence.

## 5. `posting_digital_list_v2` — date-time format MATCH; no undocumented limit invented

Operation: `POST /v2/posting/digital/list`.

Current provider contract:

- request body itself is required, but its `filter` is optional;
- `filter.since` and `filter.to`, when supplied, are `format: date-time`;
- current request example uses RFC3339 timestamps;
- the inspected schema does not publish a maximum interval or make the date pair required;
- v2 is the replacement for retired `/v1/posting/digital/list`.

Executable baseline:

- `normalizeStep7PostingDigitalListParams` makes `filter` optional;
- optional `since/to` are each validated through strict `requireRfc3339DateTime()`;
- authority registry template is `{limit:100}` and does not hard-code dates;
- authority registry uses `/v2/posting/digital/list`.

Classification:

- **MATCH — optionality**;
- **MATCH — RFC3339 date-time format**;
- **MATCH — lifecycle version**;
- **NO PROVIDER-GROUNDED MAX-PERIOD RULE FOUND**.

Do not borrow the one-year limit from `/v4/posting/fbs/list`: the provider does not publish that rule for this digital-list schema in the inspected contract.

## 6. Corrected effect-repair cross-reference

During this continuation the existing `DEFECT_015_EFFECT_REPAIR_DATE_SCHEMA_SWEEP_2026-09-04.md` was corrected after direct executable-baseline readback.

Corrected facts:

- placement-by-products already has ordering + <=31-day guard;
- placement-by-supplies already has ordering + <=31-day guard;
- marked-products-sales already has ordering guard;
- all three still inherit the shared impossible-calendar-date acceptance problem from `format: date` regex-only validation.

This correction prevents the repair scope from adding redundant endpoint-specific guards while missing the actual shared date-validity defect.

## 7. Remaining static queue

Continue, without live calls, through:

1. every still-unmapped `requireRfc3339DateTime()` call site;
2. every remaining `requireDateYmd()` / mixed analytics operation;
3. remaining schema-driven date/date-time fields and endpoint-specific prose limits;
4. dynamic/current-state templates that cannot truthfully be universal runnable defaults;
5. remaining provider lifecycle/deprecation notices;
6. explicit `NOT_DATE_RELATED` classification for every remaining registered operation until the full registry population is accounted for;
7. `finance_b2b_sales_json` historical boundary only if an unambiguous source resolves the provider wording; do not block unrelated static closure on that ambiguity.

STD-06 remains **FROZEN ON LIVE FAIL**. No executable repair and no new live Ozon request is authorized by this artifact.
