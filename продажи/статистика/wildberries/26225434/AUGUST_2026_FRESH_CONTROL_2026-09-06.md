# August 2026 WB promo funnel — fresh control

Campaign: `26225434`
Period: `2026-08-01` — `2026-08-31`
Bridge: `wildberries-llm-api-bridge` v0.1.2
Operation: `promo_fullstats`
Fresh request_id: `779f2d4d-9df7-444a-9557-f2f50d3b0276`
Command fingerprint: `aef50bfc`
HTTP status: `200`

## Fresh campaign totals

- views: 88,922
- clicks: 1,474
- atbs: 183
- orders: 26
- canceled: 4
- shks: 26
- spend_rub: 6,194.93
- attributed_sum_price_rub: 35,370

## Reconciliation to monthly_zodiac_funnel.tsv

The August 2026 sign-level rows currently materialized in `monthly_zodiac_funnel.tsv` were aggregated from the prior complete August response `876bfd49-b3a9-4f5c-bcff-59d1afd48d9c` and are preserved with that request_id as their direct provenance.

Their August totals reconcile as follows:

- zodiac-row views: 88,922 — exact campaign match
- zodiac-row clicks: 1,474 — exact campaign match
- zodiac-row ATB: 178
- non-zodiac attributed ATB: 5
- total ATB: 183 — exact campaign match
- zodiac-row orders: 26 — exact campaign match
- zodiac-row attributed revenue: 35,370 RUB — exact campaign match
- zodiac-row canceled: 4 — exact campaign match
- zodiac-row shks: 26 — exact campaign match
- sum of leaf spend: 6,195.14 RUB
- campaign spend: 6,194.93 RUB
- leaf-vs-campaign spend rounding delta: +0.21 RUB

Fresh request `779f2d4d-9df7-444a-9557-f2f50d3b0276` independently confirms the same campaign-level August totals. The sign-level rows are not rewritten solely to replace their original aggregation request_id; this control file records the fresh recheck without destroying provenance.

## Completeness gate

`monthly_zodiac_funnel.tsv` now contains 12 full calendar months (`2025-09` through `2026-08`) × 12 zodiac signs = 144 data rows, plus one header row.

Status: `PASS_12_MONTH_ZODIAC_FUNNEL_COMPLETE`
