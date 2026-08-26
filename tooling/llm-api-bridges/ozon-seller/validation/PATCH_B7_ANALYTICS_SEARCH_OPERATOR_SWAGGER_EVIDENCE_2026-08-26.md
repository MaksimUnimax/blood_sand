# Patch B7 Analytics / Search — exact Seller Swagger evidence

Date: 2026-08-26

Exact operator-supplied Seller Swagger authority:

- byte length: `3933043`
- SHA-256: `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`
- OpenAPI: `3.0.0`
- paths: `463`

B7 revalidates three already-enabled B0 read operations rather than duplicating them:

- `POST /v1/analytics/data` — `AnalyticsAPI_AnalyticsGetData`
- `POST /v1/analytics/product-queries` — `AnalyticsAPI_AnalyticsProductQueries`
- `POST /v1/analytics/product-queries/details` — `AnalyticsAPI_AnalyticsProductQueriesDetails`

`/v1/analytics/data` documents a provider limit of one request per minute, universal metrics/dimensions for sellers without Premium Plus, and additional metrics/dimensions/history for Premium Plus / Premium Pro.

The two product-query methods provide partial information without subscription and older-than-one-month history only with Premium, Premium Plus or Premium Pro.

For `/v1/analytics/product-queries/details`, the exact `sort_by` schema explicitly states that `BY_VIEWS`, `BY_POSITION` and `BY_CONVERSION` sorting is available only with **Premium or Premium Plus**. It does not list Premium Pro for that field-level feature.

## Defect established

The pre-B7 entitlement compiler parses subscription tiers from Swagger text. Its `Premium Pro` regex matched the substring `premium-pro` inside the ordinary Premium documentation URL slug `premium-program`. Therefore the exact Swagger compiler incorrectly classified the restricted details sort as allowed for Premium Pro.

The bundled entitlement snapshot was already conservative and correct (`Premium`, `Premium Plus` only), so the defect was specifically compiler drift between the exact authority and the bundled reviewed rule.

B7 fixes only that false-positive parser boundary and adds an exact-Swagger regression proving:

- `premium-program` => Premium only, never Premium Pro;
- the real `podpiska-premium-pro` URL still => Premium Pro;
- exact details restricted sort => Premium + Premium Plus only;
- exact analytics restricted metrics => Premium Plus + Premium Pro.
