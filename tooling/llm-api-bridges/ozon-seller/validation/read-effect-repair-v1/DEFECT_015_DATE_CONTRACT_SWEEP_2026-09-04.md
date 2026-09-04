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

## Confirmed Bridge source behavior

Current `ozon_contract.js` contains a shared `requireRfc3339DateTime()` validator that rejects date-only values and requires a timezone-bearing RFC3339 date-time.

`finance_balance` uses that validator for both `date_from` and `date_to`, so the Bridge contract itself requires full RFC3339 timestamps.

The request builder serializes the normalized command params directly to JSON for `json_body` operations. Combined with live metadata (`exact_request_preserved=true`, `command_transformed=false`), this proves the timestamp values passed Bridge validation and reached Ozon unchanged.

## DEFECT-015 — confirmed repair target

1. `finance_balance` real-provider request fails with HTTP 400/code 3 using the request shape accepted and required by the current Bridge.
2. The Bridge enforces RFC3339 date-time for `finance_balance.date_from` / `date_to`.
3. The current finance request is not transformed before provider execution.
4. Current Swagger-derived/generated SDK evidence for `GetFinanceBalanceV1` documents `date_from` / `date_to` as `YYYY-MM-DD`, not RFC3339 date-time.
5. The freshest contract-derived evidence found on 2026-09-04 (Go Ozon SDK build published 2026-09-02) documents the maximum interval between `date_from` and `date_to` as **30 days**.

### Superseded range evidence

An older/currently less-fresh Python OzonAPI wrapper documented a **3-month** maximum. This is now treated as stale relative to the 2026-09-02 Swagger-derived Go SDK and must **not** drive the repair.

Current repair target for the range guard: **30 days**, subject to direct official/OpenAPI confirmation where obtainable.

### Current external evidence

Fresh generated Go SDK:

- package/repository family: `github.com/QuoVadis86/go-ozon-sdk`
- generated type: `V1GetFinanceBalanceV1Request`
- request fields:
  - `date_from`: `YYYY-MM-DD`
  - `date_to`: `YYYY-MM-DD`
- documented maximum interval: `30 days`
- package build observed: `v0.0.0-20260902014147-c73b356cfc49`

Corroborating Python SDK:

- repository: `a-ulianov/OzonAPI`
- endpoint: `/v1/finance/balance`
- direct documentation reference: `https://docs.ozon.ru/api/seller/#operation/GetFinanceBalanceV1`
- request date format: `YYYY-MM-DD`
- example: `FinanceBalanceRequest(date_from="2026-05-01", date_to="2026-06-01")`

The Python wrapper's 3-month range statement is superseded by the fresher generated Go SDK's 30-day statement.

### Additional contract dimensions still under verification

- whether `date_from` and `date_to` are mandatory in the provider schema;
- exact inclusive/exclusive semantics of the 30-day maximum;
- ordering requirement `date_from <= date_to`;
- future-date behavior;
- omitted-period behavior if fields are optional;
- whether templates/guidance encode the same wrong timestamp format;
- all generated/dist copies containing the assumption;
- permanent deterministic tests for date-only input, RFC3339 rejection/normalization policy, reversed range, overlong range, and requiredness once confirmed.

## Blast-radius audit

The shared RFC3339 validator is reused by many operations, so no assumption is being made that `finance_balance` is the only affected method.

Initial source enumeration found **50 call sites** of `requireRfc3339DateTime()` in the authoritative `ozon_contract.js`. This is a field/call-site count, not a defect count and not a unique-operation count.

The sweep also covers date-bearing operations that do **not** call this helper:

- `requireDateYmd()` date-only validators;
- Performance-specific `YYYY-MM-DD` validators;
- `requireAnalyticsDate()` mixed date/date-time validation;
- loose `Date.parse()` / `new Date(...)` validation paths;
- schema-driven date/date-time fields in `EFFECT_REPAIR_PARAM_SCHEMAS`;
- month/year period fields;
- templates/defaults/guidance;
- generated/bundled/dist copies;
- deterministic tests.

All 271 Seller-read commands are in scope for classification. Commands without input date/time/period fields are classified `NOT_DATE_RELATED` for this defect class; date-bearing commands receive field-by-field contract comparison.

### Classifications

- `MATCH` — Bridge format/range assumptions match the provider contract.
- `BUG` — confirmed Bridge/provider contract mismatch.
- `MISSING_GUARD` — wire format matches but a provider restriction is not enforced locally.
- `NEEDS_LIVE` — static evidence is insufficient and real-provider confirmation is required.
- `NOT_DATE_RELATED` — no relevant input date/time/period contract.

## Verified comparison rows

| Bridge operation | Provider endpoint | Date fields | Bridge behavior | Current contract evidence | Classification |
|---|---|---|---|---|---|
| `finance_balance` | `POST /v1/finance/balance` | `date_from`, `date_to` | requires RFC3339 date-time | fresh generated SDK: `YYYY-MM-DD`, max 30 days; live exact RFC3339 request returned HTTP 400/code 3 | **BUG — LIVE CONFIRMED** |
| `finance_cash_flow_statement_list` | finance cash-flow statement list | `date.from`, `date.to` | requires RFC3339 date-time | current SDK schema/tests use RFC3339 timestamps | **MATCH — wire format** |
| `product_queries` | `/v1/analytics/product/queries` | `date_from`, `date_to` | RFC3339; Bridge requires `date_from` | current SDK schema uses RFC3339 examples | **MATCH — wire format**; requiredness unresolved |
| `product_queries_details` | `/v1/analytics/product/queries/details` | `date_from`, `date_to` | RFC3339; Bridge requires `date_from` | current SDK schema uses RFC3339 examples | **MATCH — wire format**; requiredness unresolved |
| `seller_rating_history` | rating history endpoint | `date_from`, `date_to` | requires RFC3339 | current SDK test uses RFC3339 date-times | **MATCH — wire format** |
| `seller_fbs_error_postings` | `POST /v1/rating/index/fbs/posting/list` | `filter.date_from`, `filter.date_to` | requires RFC3339 date-time | current SDK method maps to official `RatingAPI_ListFBSRatingIndexPostingsV1`; current SDK test sends `YYYY-MM-DD` date-only values | **STATIC BUG CANDIDATE — NEEDS OPENAPI + LIVE CONFIRMATION** |

### Requiredness discrepancies tracked separately

Some SDK schemas model date fields as optional where the Bridge makes them mandatory. Requiredness is not promoted to `BUG` from SDK typing alone. It remains a contract discrepancy until verified against current Swagger/OpenAPI and, if needed, live behavior.

## Verified control: RFC3339 helper is not globally wrong

`finance_cash_flow_statement_list` uses strict RFC3339 `date.from/date.to`, and current SDK schema/tests use RFC3339 timestamps such as `2026-01-01T00:00:00Z`.

Therefore DEFECT-015 must be repaired endpoint-specifically. A bulk conversion of all date/time fields to `YYYY-MM-DD` would create new defects.

## Primary provider-contract verification strategy

A public repository `MissiaL/ozon-api` contains `references/ozon-seller-openapi.json`, described as generated from the official Ozon Seller Swagger (`https://docs.ozon.ru/api/seller/swagger.json`) and containing 463 operations.

The monolithic OpenAPI file is too large for the GitHub connector to return intact in this environment. The audit therefore uses the following evidence order:

1. current official Ozon endpoint/documentation when directly retrievable;
2. newest Swagger-derived generated SDK/types tied to the Ozon operation;
3. the 463-operation OpenAPI snapshot through endpoint-specific/searchable access when possible;
4. corroborating SDK schemas/tests;
5. real-provider behavior for certification.

Freshness matters: when generated contract sources conflict, the newer Swagger-derived source supersedes the older wrapper unless direct official evidence says otherwise.

Required process for every date-bearing Bridge operation:

1. resolve Bridge operation → method/path;
2. resolve provider request schema;
3. compare field presence, requiredness, type/format, oneOf/anyOf, enum and range metadata;
4. compare Bridge normalizer/validator;
5. compare template/default/guidance;
6. compare generated/dist copies and deterministic tests;
7. classify `MATCH / BUG / MISSING_GUARD / NEEDS_LIVE`;
8. persist the result before moving on.

## Initial strict-RFC3339 inventory

The following validator families are explicitly in scope and are not defects merely because they share the helper:

- Ozon auto-add action / `auto_add_date`;
- `product_queries` / `date_from`, `date_to`;
- `product_queries_details` / `date_from`, `date_to`;
- FBO/FBP posting `since/to`, cutoff/delivery and last-changed ranges;
- `finance_cash_flow_statement_list` / `date.from`, `date.to`;
- finance transaction/list date filters;
- `seller_rating_history` / `date_from`, `date_to`;
- `seller_fbs_error_postings` / `filter.date_from`, `filter.date_to`;
- review/question publication filters;
- supply-order timeslot ranges;
- FBP direct-timeslot intervals;
- FBS carriage departure date and assembly carriage cutoff ranges;
- certificate `issue_date`;
- ETGB date range;
- rFBS return/posting `since/to` filters.

## Additional date-bearing families in scope

- generic `requireDateYmd()` call sites;
- Performance date validators;
- `requireAnalyticsDate()` (possibly over-permissive depending on endpoint);
- loose JavaScript date parsing paths;
- schema-driven effect-repair operations including `report_returns_create_v2`, `report_postings_create`, placement reports, marked-products sales reports, and month/year financial/report operations.

## Commercial-test state

STD-06 is **IN PROGRESS / FROZEN ON LIVE FAIL**.

Do not continue to later STD-06 evidence or STD-07 until DEFECT-015 and same-class dependency findings that affect this path are closed and the failed finance step is rerun on the repaired artifact.
