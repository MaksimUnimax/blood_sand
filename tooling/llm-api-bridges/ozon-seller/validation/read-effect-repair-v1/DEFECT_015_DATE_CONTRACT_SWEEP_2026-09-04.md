# DEFECT-015 — Date/period contract sweep — 2026-09-04

## Scope

Exhaustive audit of Ozon Seller Bridge date/time/period assumptions after a real-provider failure in `finance_balance` during commercial test STD-06.

Authoritative executable baseline under test:

- source commit: `249029b0ba8d9e6f9e26182bf678adf42868c6d6`
- source tree: `2c565626982c1a9a1919add09824ce2c5e44ee29`
- extension version: `0.1.19`
- live test remains frozen at STD-06 until the finance failure and same-class dependency findings are closed.

This document is maintained on audit branch `audit/ozon-date-contract-sweep-2026-09-04` so the validated artifact/source HEAD at `249029...` remains reproducible.

## Live failure that triggered the sweep

`finance_balance` was called with:

```json
{"date_from":"2026-08-28T00:00:00Z","date_to":"2026-09-03T23:59:59Z"}
```

Observed live result:

- request id: `81ce5592-9e9a-4325-b2c6-1695c294ab36`
- provider: Seller API
- endpoint: `POST /v1/finance/balance`
- external request executed: `true`
- exact request preserved: `true`
- command transformed: `false`
- HTTP: `400`
- provider code: `3`
- automatic retry: `false`

Verdict: **LIVE FAIL**. STD-06 is frozen at this point.

## Confirmed Bridge behavior

`ozon_contract.js` contains a shared `requireRfc3339DateTime()` validator that rejects date-only values and requires a timezone-bearing RFC3339 date-time.

`finance_balance` uses that validator for both `date_from` and `date_to`. The request builder serializes normalized params directly for `json_body`; live metadata (`exact_request_preserved=true`, `command_transformed=false`) proves the timestamps reached Ozon unchanged.

## DEFECT-015 — confirmed repair target

### Current Swagger-derived contract for `/v1/finance/balance`

The 463-operation OpenAPI snapshot generated from the official Ozon Seller Swagger resolves the request to `v1GetFinanceBalanceV1Request` and shows:

- request body: required;
- `date_from`: required;
- `date_to`: required;
- schema `format`: `date-time` for both fields;
- **description** for both fields: `YYYY-MM-DD`;
- endpoint request example: date-only (`2019-08-24`, `2019-09-24`);
- `date_to` description: maximum period between `date_from` and `date_to` is **30 days**.

This is an internal OpenAPI inconsistency: the mechanical `format: date-time` conflicts with the human description and endpoint example.

The live request resolves the ambiguity: the Bridge followed the mechanical `date-time` side and sent RFC3339 timestamps; Ozon returned HTTP 400/code 3. Therefore the effective wire-format repair target is date-only `YYYY-MM-DD`.

### Confirmed facts

1. Bridge requires RFC3339 for `finance_balance.date_from/date_to`.
2. Current OpenAPI makes both fields **required**; earlier SDK optionality evidence is superseded for repair purposes.
3. Current OpenAPI description/example require date-only values despite its contradictory `format: date-time` metadata.
4. Current maximum period is **30 days**.
5. Exact RFC3339 request failed live at the provider.

Classification: **BUG — LIVE CONFIRMED**.

### Superseded evidence

- Older Python wrapper: 3-month maximum — superseded by the current OpenAPI/fresh generated SDK, which say 30 days.
- Older/current SDK optional typing for the fields — superseded by OpenAPI `required: [date_from, date_to]`.

### Remaining finance_balance dimensions to audit before repair closure

- `date_from <= date_to` local guard;
- exact 30-day boundary semantics;
- future-date behavior if relevant;
- templates/defaults/guidance containing RFC3339;
- all source/dist/generated copies;
- deterministic tests for valid YMD pair, timestamp rejection/normalization policy, reversed pair and >30-day pair.

## Blast-radius audit

All 271 Seller-read commands are in scope for this defect class.

- Operations with date/time/period input fields receive field-by-field comparison.
- Operations with no relevant date/time/period input are classified `NOT_DATE_RELATED`.

Initial source enumeration found **50 call sites** of `requireRfc3339DateTime()` in authoritative `ozon_contract.js`. This is a field/call-site count, not a defect count or unique-operation count.

Additional validation families in scope:

- `requireDateYmd()`;
- Performance-specific YMD validators;
- `requireAnalyticsDate()` mixed date/date-time validation;
- loose `Date.parse()` / `new Date(...)` paths;
- schema-driven date/date-time fields in `EFFECT_REPAIR_PARAM_SCHEMAS`;
- month/year period inputs;
- command templates/defaults/guidance;
- generated/bundled/dist copies;
- deterministic tests.

### Classifications

- `MATCH` — Bridge contract matches provider contract for the audited dimension.
- `BUG` — confirmed mismatch.
- `MISSING_GUARD` — wire format matches but provider constraint is missing locally.
- `NEEDS_LIVE` — static evidence cannot resolve effective provider behavior.
- `NOT_DATE_RELATED` — no relevant input date/time/period contract.

## Verified comparison rows

| Bridge operation | Provider endpoint | Date fields | Bridge behavior | Current Swagger/OpenAPI evidence | Classification |
|---|---|---|---|---|---|
| `finance_balance` | `POST /v1/finance/balance` | `date_from`, `date_to` | required RFC3339 | fields required; contradictory `format: date-time` vs `YYYY-MM-DD` description/example; max 30 days; live RFC3339 failed | **BUG — LIVE CONFIRMED** |
| `finance_cash_flow_statement_list` | `/v1/finance/cash-flow-statement/list` | `date.from`, `date.to` | RFC3339 | current contract/SDK uses RFC3339 timestamps | **MATCH — wire format** |
| `product_queries` | analytics product queries endpoint | `date_from`, `date_to` | RFC3339; Bridge requires `date_from` | current contract-derived SDK uses RFC3339 | **MATCH — wire format**; requiredness audit pending direct OpenAPI row |
| `product_queries_details` | analytics product queries details endpoint | `date_from`, `date_to` | RFC3339; Bridge requires `date_from` | current contract-derived SDK uses RFC3339 | **MATCH — wire format**; requiredness audit pending direct OpenAPI row |
| `seller_rating_history` | `POST /v1/rating/history` | `date_from`, `date_to` | required RFC3339 | current contract-derived test uses RFC3339 | **MATCH — wire format** |
| `seller_fbs_error_postings` | `POST /v1/rating/index/fbs/posting/list` | `filter.date_from`, `filter.date_to` | required RFC3339 | OpenAPI `ListFBSRatingIndexPostingsV1RequestFilter`: both required, both `format: date-time` | **MATCH — wire format + requiredness** |

## Resolved false-positive: `seller_fbs_error_postings`

An SDK test using date-only values initially made this endpoint look like a second DEFECT-015 candidate. Direct OpenAPI resolution shows otherwise:

- request body required;
- request requires `filter` and `limit`;
- filter requires `date_from` and `date_to`;
- both date fields are `format: date-time`;
- `limit` max 1000.

Therefore the Bridge's strict RFC3339 requirement for these fields matches the current OpenAPI. The SDK date-only example is not used as bug proof.

Classification changed from `STATIC BUG CANDIDATE` to **MATCH**.

## Important process finding: mechanical OpenAPI format is not sufficient by itself

`finance_balance` proves that generated Swagger metadata can contain a contradictory `format: date-time` while the description/example and real provider require date-only input.

Therefore the remaining sweep must compare, for every date-bearing field:

1. OpenAPI type/format;
2. OpenAPI description;
3. request example, when present;
4. requiredness and range constraints;
5. fresh generated SDK behavior/examples;
6. existing Bridge live evidence;
7. new live proof only where static evidence remains contradictory and the method is safe/needed.

A simple automated rule `format=date-time => RFC3339` is explicitly **not sufficient**.

## Provider-contract sources

Primary static source:

- `MissiaL/ozon-api/references/ozon-seller-openapi.json`
- 463 operations;
- generated from official Ozon Seller Swagger (`docs.ozon.ru/api/seller/swagger.json`).

The monolithic file is accessible through web line lookup but is too large for the GitHub connector to materialize as one response in this environment. Endpoint-specific `$ref` resolution is therefore performed line-by-line/search-by-search.

Evidence priority:

1. direct current official/OpenAPI contract;
2. newest Swagger-derived generated SDK/types;
3. corroborating SDK schemas/tests;
4. live provider behavior for effective-wire ambiguity/certification.

Freshness wins when contract-derived sources conflict.

## Audit procedure for every date-bearing operation

1. Bridge operation → method/path.
2. Request schema `$ref` resolution.
3. Field presence + requiredness.
4. Type/format + description + example.
5. Range/order/oneOf/anyOf/enums.
6. Bridge normalizer/validator.
7. Template/default/guidance.
8. Generated/dist copies/tests.
9. Classify and persist.

## Date-bearing families still being swept

Strict RFC3339 families:

- auto-add action date;
- product query date ranges;
- FBO/FBP posting ranges;
- finance transaction/list ranges;
- review/question publication ranges;
- supply-order timeslot ranges;
- FBP direct-timeslot intervals;
- FBS carriage/assembly ranges;
- certificate issue date;
- ETGB ranges;
- rFBS return/posting ranges.

Other date families:

- generic YMD validators;
- Performance YMD validators;
- mixed analytics date validator;
- loose JavaScript date parsing;
- schema-driven report date/date-time fields;
- month/year finance/report inputs.

## Commercial-test state

STD-06 is **IN PROGRESS / FROZEN ON LIVE FAIL**.

Do not continue later STD-06 evidence or STD-07 until DEFECT-015 and same-class dependency findings affecting this path are closed and the failed finance step is rerun on the repaired artifact.
