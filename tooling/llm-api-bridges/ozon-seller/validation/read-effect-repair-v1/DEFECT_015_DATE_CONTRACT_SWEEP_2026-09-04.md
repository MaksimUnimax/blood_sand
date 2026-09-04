# DEFECT-015 — Date/period contract sweep — 2026-09-04

## Scope

Exhaustive audit of Ozon Seller Bridge date/time/period assumptions after a real-provider failure in `finance_balance` during commercial test STD-06.

Authoritative executable baseline under test:

- source commit: `249029b0ba8d9e6f9e26182bf678adf42868c6d6`
- source tree: `2c565626982c1a9a1919add09824ce2c5e44ee29`
- extension version: `0.1.19`
- live test remains frozen at STD-06 until the finance failure is understood and repaired.

This document is intentionally maintained on audit branch `audit/ozon-date-contract-sweep-2026-09-04` so the validated artifact/source HEAD at `249029...` remains reproducible.

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

## Confirmed source behavior

Current `ozon_contract.js` contains a shared `requireRfc3339DateTime()` validator that rejects date-only values and requires a timezone-bearing RFC3339 date-time.

`finance_balance` uses that validator for both `date_from` and `date_to`, so the Bridge contract itself requires full RFC3339 timestamps.

The request builder serializes the normalized command params directly to JSON for `json_body` operations. Combined with the live metadata (`exact_request_preserved=true`, `command_transformed=false`), this proves the timestamp values passed Bridge validation and reached Ozon unchanged.

## DEFECT-015 status

### Confirmed

1. `finance_balance` real-provider request fails with HTTP 400/code 3 using the request shape accepted and required by the current Bridge.
2. The Bridge enforces RFC3339 date-time for `finance_balance.date_from` / `date_to`.
3. The current finance request is not transformed before provider execution.
4. A current OzonAPI implementation for `/v1/finance/balance`, whose method documentation points directly to Ozon operation `GetFinanceBalanceV1`, documents `date_from` / `date_to` as `YYYY-MM-DD`, not RFC3339 date-time.
5. The same implementation documents a maximum period of **3 months**. Earlier working notes that mentioned a 30-day limit are superseded and must not be used as a repair requirement.

### Strong contract mismatch evidence

External implementation evidence:

- repository: `a-ulianov/OzonAPI`
- method: `src/ozonapi/seller/methods/beta/finance_balance.py`
- endpoint: `/v1/finance/balance`
- direct documentation reference: `https://docs.ozon.ru/api/seller/#operation/GetFinanceBalanceV1`
- documented request date format: `YYYY-MM-DD`
- documented maximum period: `3 months`
- example: `FinanceBalanceRequest(date_from="2026-05-01", date_to="2026-06-01")`

Its request schema (`src/ozonapi/seller/schemas/beta/v1__finance_balance.py`) also describes both fields as `YYYY-MM-DD` strings.

This evidence plus the real-provider HTTP 400 on an exact RFC3339 request is sufficient to treat the **date-format mismatch as a confirmed repair target**, while remaining details below are still being verified against additional current contract evidence.

### Additional contract dimensions still under verification

- whether `date_from` and `date_to` are truly optional in the provider contract; the external schema models them as optional while the Bridge currently requires both;
- exact boundary semantics of the 3-month maximum;
- ordering requirement `date_from <= date_to` and whether Ozon rejects reversed periods;
- future-date behavior;
- whether an omitted period has provider-defined meaning;
- whether templates/guidance encode the same wrong timestamp format;
- whether generated/dist copies contain the same assumption;
- permanent deterministic tests for date-only input, timestamp rejection/normalization, reversed range, overlong range, and optionality once confirmed.

## Blast-radius audit

The shared RFC3339 validator is reused by many operations, so no assumption is being made that `finance_balance` is the only affected method.

Initial source enumeration found **50 call sites** of the strict `requireRfc3339DateTime()` helper in the authoritative `ozon_contract.js`. This count is a call-site inventory, not a defect count. Every call site must be resolved to an operation/endpoint and compared with the provider contract.

The sweep also covers date-bearing operations that do **not** call this helper:

- `requireDateYmd()` date-only validators;
- `requireAnalyticsDate()` mixed date/date-time validators;
- loose `Date.parse()` / `new Date(...)` validation paths;
- schema-driven date/date-time fields in `EFFECT_REPAIR_PARAM_SCHEMAS`;
- templates/defaults/guidance that construct dates;
- generated/bundled/dist copies and deterministic tests.

Every date-bearing operation will be classified as one of:

- `MATCH` — Bridge format/range assumptions match the Ozon contract;
- `BUG` — confirmed Bridge/Ozon contract mismatch;
- `MISSING_GUARD` — wire format is correct but a provider limit/range/order rule is not enforced locally;
- `NEEDS_LIVE` — static contract is insufficient and real-provider confirmation is required;
- `NOT_DATE_RELATED` — operation contains no relevant date/time contract.

The sweep must cover all producers/readers/normalizers/templates/request builders/generated copies/tests for each date-bearing operation.

## Verified comparison rows

| Bridge operation | Provider endpoint | Date fields | Bridge behavior | Current contract evidence | Classification |
|---|---|---|---|---|---|
| `finance_balance` | `POST /v1/finance/balance` | `date_from`, `date_to` | requires RFC3339 date-time | current SDK tied to `GetFinanceBalanceV1` documents `YYYY-MM-DD`; live exact RFC3339 request returned HTTP 400/code 3 | **BUG — LIVE CONFIRMED** |
| `finance_cash_flow_statement_list` | finance cash-flow statement list | `date.from`, `date.to` | requires RFC3339 date-time | current SDK schema/tests use RFC3339 timestamps | **MATCH — wire format** |
| `product_queries` | `/v1/analytics/product/queries` | `date_from`, `date_to` | RFC3339; Bridge requires `date_from` | current SDK schema uses RFC3339 examples | **MATCH — wire format**; requiredness still under verification |
| `product_queries_details` | `/v1/analytics/product/queries/details` | `date_from`, `date_to` | RFC3339; Bridge requires `date_from` | current SDK schema uses RFC3339 examples | **MATCH — wire format**; requiredness still under verification |
| `seller_rating_history` | rating history endpoint | `date_from`, `date_to` | requires RFC3339 | current SDK test uses RFC3339 date-times | **MATCH — wire format** |
| `seller_fbs_error_postings` | `POST /v1/rating/index/fbs/posting/list` | `filter.date_from`, `filter.date_to` | requires RFC3339 date-time | current SDK method points to official `RatingAPI_ListFBSRatingIndexPostingsV1`; current SDK test sends `YYYY-MM-DD` date-only values | **STATIC BUG CANDIDATE — NEEDS OFFICIAL-OPENAPI + LIVE CONFIRMATION** |

### Requiredness discrepancies are tracked separately

Current SDK schemas model `date_from` / `date_to` as optional for `finance_balance`, `product_queries`, `product_queries_details`, and the rating-index FBS posting list, while the Bridge makes some or all of these fields mandatory. These are **not yet promoted to BUG** solely from SDK typing. They remain explicit contract discrepancies pending official-derived OpenAPI verification and, where needed, live proof.

## Verified control cases

### MATCH — `finance_cash_flow_statement_list`

Bridge behavior:

- endpoint family: finance cash-flow statement list;
- request date range: `date.from` / `date.to`;
- Bridge validator: strict RFC3339 date-time via `requireRfc3339DateTime()`.

Current external OzonAPI schema/tests for this operation use RFC3339 timestamps such as `2026-01-01T00:00:00Z`. Therefore this neighboring finance endpoint is classified **MATCH for date wire format**.

Consequence: the shared RFC3339 helper is not globally wrong. DEFECT-015 must be repaired endpoint-specifically; a bulk conversion of all date/time fields to `YYYY-MM-DD` would create new defects.

Period-length and any endpoint-specific range guards remain separate audit dimensions and are not implied PASS by the format match.

## Primary static provider-contract source for the remaining sweep

A current public repository `MissiaL/ozon-api` contains `src/main/resources/openapi/ozon-seller-openapi.json`, described as generated from Ozon Seller API Swagger and updated automatically from the official Ozon Seller Swagger source. The current inventory contains **463 operations** and includes the newly added `/v1/finance/balance` family.

For the remaining exhaustive sweep this OpenAPI snapshot is the primary static field/type/requiredness source. SDK schemas/tests remain corroborating evidence. Real-provider behavior remains the authority for live certification.

Required process for each Bridge date-bearing operation:

1. resolve Bridge operation → method/path;
2. resolve OpenAPI request schema and nested component refs;
3. compare field presence, `required`, type/format, oneOf/anyOf constraints, enum and range metadata;
4. compare Bridge normalizer/validator;
5. compare template/default/guidance;
6. compare generated/dist copies and deterministic tests;
7. classify `MATCH / BUG / MISSING_GUARD / NEEDS_LIVE`;
8. persist the row before moving on.

## Initial strict-RFC3339 suspect inventory

The following current validators use the shared RFC3339 requirement and are explicitly in scope. They are **not** classified as defects merely because they share the helper:

- `ozon_auto_add_action` / `auto_add_date`;
- `product_queries` / `date_from`, `date_to`;
- `product_queries_details` / `date_from`, `date_to`;
- FBO/FBP posting date filters (`since`, `to`, cutoff/delivery ranges, nested last-changed ranges);
- `finance_cash_flow_statement_list` / `date.from`, `date.to`;
- finance transaction/list date filters;
- `seller_rating_history` / `date_from`, `date_to`;
- `seller_fbs_error_postings` / `filter.date_from`, `filter.date_to`;
- review/question publication filters;
- supply order timeslot ranges;
- FBP direct-timeslot intervals;
- FBS carriage departure date and assembly carriage cutoff ranges;
- certificate `issue_date`;
- ETGB date range;
- rFBS return/posting date filters.

The complete inventory is being generated from the actual registry/contract code and checked operation by operation.

## Additional date-bearing validation families in scope

The strict RFC3339 inventory is not the whole surface. The sweep additionally includes:

- generic `requireDateYmd()` call sites;
- Performance-specific `YYYY-MM-DD` validators;
- `requireAnalyticsDate()` which currently accepts either date-only or RFC3339 and therefore may be over-permissive for endpoints that only accept one wire form;
- loose JavaScript `Date.parse()` / `new Date(...)` paths;
- schema-driven effect-repair operations, including `report_returns_create_v2`, `report_postings_create`, placement reports, marked-products sales reports, and month/year financial/report operations.

## Commercial-test state

STD-06 is **IN PROGRESS / FROZEN ON LIVE FAIL**.

Do not continue to later STD-06 evidence or STD-07 until DEFECT-015 and any same-class dependency findings that affect this path are closed and the failed finance step is rerun on the repaired artifact.
