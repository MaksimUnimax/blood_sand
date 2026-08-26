# Patch B10 Seller Health / Ratings — exact Swagger evidence

Date: 2026-08-26

Exact Seller Swagger authority:

- bytes: `3933043`
- SHA-256: `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`
- OpenAPI: `3.0.0`
- paths: `463`

## Current read endpoints selected for B10

1. `POST /v1/rating/summary`
   - operationId `RatingAPI_RatingSummaryV1`
   - not deprecated
   - required JSON body schema `v1Empty`; exact request is `{}`
   - returns current seller ratings, thresholds and localization index data.

2. `POST /v1/rating/history`
   - operationId `RatingAPI_RatingHistoryV1`
   - not deprecated
   - required body fields: `ratings`, `date_from`, `date_to`
   - `date_from` and `date_to`: RFC3339 date-time
   - optional `with_premium_scores`: boolean
   - documented rating identifiers are validated locally.

3. `POST /v1/rating/index/fbs/info`
   - operationId `RatingAPI_GetFBSRatingIndexInfoV1`
   - not deprecated
   - no request body
   - returns FBS/rFBS error index, period and processing cost data.

4. `POST /v1/rating/index/fbs/posting/list`
   - operationId `RatingAPI_ListFBSRatingIndexPostingsV1`
   - not deprecated
   - required `filter` and `limit`
   - `limit` maximum `1000`
   - filter requires `date_from`, `date_to`; optional `posting_numbers`
   - response exposes cursor/has_next but B10 does not auto-continue it.

## Entitlement evidence

The four operation descriptions contain no endpoint-level subscription requirement. Compiling the exact Swagger with the accepted entitlement compiler produces `ALL_ACCOUNTS` for all four B10 endpoints. Full-Swagger unresolved-rule count remains `12`; none of those unresolved rules is a B10 rating endpoint.

## Safety evidence

The selected responses contain seller operational/business metrics and posting numbers, not buyer contact details. B10 uses `READ_SAFE` + `safe_projection`. No mutation, report generation, automatic pagination, retry, fanout or secondary provider request is introduced.
