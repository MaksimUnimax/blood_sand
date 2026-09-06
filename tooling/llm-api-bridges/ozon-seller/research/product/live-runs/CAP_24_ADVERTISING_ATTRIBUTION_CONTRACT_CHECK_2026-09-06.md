# CAP-24 — historical advertising attribution contract check

Date: 2026-09-06
Status: `CONTRACT_CHECK_PASS__CAMPAIGN_SCREENING_REQUIRED_BEFORE_SKU_ATTRIBUTION`

Target:
- Ozon SKU: `1636048691`
- frozen period: `2026-08-01..2026-08-31`

## Finance prerequisite

The directly attributable August finance ledger is complete at `113264.00 RUB` before advertising/placement attribution.

## Rejected historical source

`performance_sku_statistics` (`POST /api/client/statistics/products/sku`) is not valid for the frozen August period.

Exact Performance Swagger for `extstatisticsSearchPromoProductsSKUStatisticsRequest` states that `dateFrom` is the statistics start date **not earlier than the previous day**. Therefore it cannot be used on 2026-09-06 to reconstruct `2026-08-01..2026-08-31`.

Do not send an August request through this alias and do not reinterpret near-date SKU statistics as historical August evidence.

## Historical CPC screening source

`performance_campaign_product` is the documented JSON variant of:

`GET /api/client/statistics/campaign/product`

The exact Swagger:
- supports `dateFrom` / `dateTo` as explicit calendar dates;
- contains a historical code example using `2024-08-01..2024-08-07`;
- makes `campaignIds` optional and states that an empty campaign list returns statistics for all campaigns in the selected period;
- states that this endpoint does not consume Performance API export limits;
- documents report fields including campaign id/title/status, budgets, expense, impressions, clicks, cart adds, CTR, CPC, orders, sales, DRR, promotion type and placement.

Important correction: despite the Bridge purpose text historically describing this as campaign/product statistics, the exact Swagger's listed report fields do **not** include SKU. Therefore this endpoint must not be assumed to provide final SKU-level spend attribution before observing the live JSON response.

Its current role in CAP-24 is:

`HISTORICAL_AUGUST_CPC_CAMPAIGN_SCREENING`

It identifies which CPC campaigns had August activity/spend and their campaign IDs.

## SKU identity authority for campaign follow-up

`performance_campaign_objects` is a current accepted direct read of:

`GET /api/client/campaign/{campaignId}/objects`

Swagger states that for SKU advertising campaigns the advertised object `id` is the SKU. Therefore, after the historical campaign screening result, each relevant August-spend campaign can be checked explicitly for advertised objects.

A campaign can be attributed wholly to target SKU only when the provider evidence makes that attribution defensible, e.g. its advertised object set proves it is exclusively the target SKU for the relevant campaign context. Campaign title text such as `Печать` is candidate-selection evidence only, never proof of SKU identity.

If a campaign has multiple advertised SKUs and only campaign-level spend is available, its spend must remain `ADVERTISING_ATTRIBUTION_NOT_PROVEN` rather than being allocated arbitrarily.

## Double-count boundary

The completed `113264.00 RUB` direct finance ledger excludes `NON_ITEM` account/campaign-level rows. Historical finance evidence showed campaign-like NON_ITEM charges, so any Performance advertising spend later attributed to the target must not also be re-added from NON_ITEM finance rows. Performance is the attribution authority; matching NON_ITEM amounts are reconciliation evidence only.

## Next exact command

```text
OZON_API_V1
{
  "operation": "performance_campaign_product",
  "params": {
    "dateFrom": "2026-08-01",
    "dateTo": "2026-08-31"
  }
}
```

Expected execution invariants:
- one explicit command;
- at most one physical provider request;
- no hidden retry/fanout/pagination/chaining;
- exact historical dates preserved.

Interpretation:
- HTTP 200: inspect all returned August CPC campaign rows and expense values; do not infer SKU from title;
- select only campaigns requiring SKU-object follow-up;
- next step becomes an explicit bounded batch of `performance_campaign_objects` for those campaign IDs;
- if the live response unexpectedly exposes provider-backed SKU/product identity, preserve it but verify its semantics before using spend as target-SKU cost;
- non-200: stop under `NO_SKIP_ON_FAILURE` and diagnose before proceeding.

Current checkpoint:

`CAP_24_FINANCE_LEDGER_COMPLETE__NEXT_AUGUST_CPC_CAMPAIGN_SCREENING`

No executable Bridge patch is authorized or made.