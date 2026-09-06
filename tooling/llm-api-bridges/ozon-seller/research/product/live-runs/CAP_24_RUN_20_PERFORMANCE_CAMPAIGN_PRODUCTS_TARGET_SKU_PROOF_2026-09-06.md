# CAP-24 Run 20 — campaign product proof for target-SKU advertising attribution

Date: 2026-09-06
Status: `PASS__FOUR_CANDIDATE_CAMPAIGNS_CURRENTLY_SINGLE_TARGET_SKU__HISTORICAL_SKU_SPEND_CONFIRMATION_PENDING`

## Business purpose

CAP-24 requires advertising cost to be attributed to target SKU `1636048691` only where attribution is defensible and evidence-backed.

Run 19 found four August-2026 campaign rows whose titles contain `Печать` and whose combined historical `moneySpent` under the explicit `2026-08-01..2026-08-31` statistics request equals `35785.11 RUB`:

| campaign_id | Run-19 August moneySpent, RUB |
|---|---:|
| `33379108` | 14900.95 |
| `33379127` | 14291.96 |
| `37130607` | 3431.80 |
| `37130634` | 3160.40 |
| **Total** | **35785.11** |

Titles were discovery hints only and were explicitly insufficient for attribution. This run performs the campaign-product identity gate with the current executable Bridge operation `performance_campaign_products`.

Target identity:

- Ozon SKU: `1636048691`
- seller product_id: `1119965443`
- offer_id: `Печать Велеса`
- product title: `Славянский оберег - Подвеска на зеркало в машину "Печать Велеса"`
- frozen economics period: `2026-08-01..2026-08-31`

## Exact Bridge execution

Four explicit `OZON_API_V1` commands were sent in one ordered batch, one command per candidate campaign:

```json
{"operation":"performance_campaign_products","params":{"campaignId":"33379108"}}
```

```json
{"operation":"performance_campaign_products","params":{"campaignId":"33379127"}}
```

```json
{"operation":"performance_campaign_products","params":{"campaignId":"37130607"}}
```

```json
{"operation":"performance_campaign_products","params":{"campaignId":"37130634"}}
```

Batch result:

- result_count: `4`
- query_planner.status: `complete`
- logical_business_result_count: `4`
- physical_business_request_count: `4`
- coalesced_group_count: `0`
- coalesced_logical_count: `0`
- capability probe: not needed

Invariant preserved:

`4 explicit business commands => exactly 4 physical provider requests`.

No hidden retry, fan-out, pagination loop, or capability probe was observed.

## Result 1 — campaign 33379108

Batch position maps to the first explicit command above.

- request_id: `37ce90e1-2286-4a91-9cf3-0885b6f5c8dc`
- fingerprint: `070392f7`
- operation: `performance_campaign_products`
- provider: `ozon`
- host_alias: `performance_api`
- HTTP method: `GET`
- HTTP status: `200`
- elapsed: `417 ms`
- external_request_executed: `true`
- rate_limit: `null`
- pagination: `null`
- entitlement: `SUPPORTED_AND_ENTITLED`
- entitlement reason: `performance_provider_not_seller_subscription`
- exact_request_preserved: `true`
- command_transformed: `false`

Returned products:

```json
[
  {
    "sku": "1636048691",
    "bid": "7000000",
    "title": "Славянский оберег - Подвеска на зеркало в машину \"Печать Велеса\"",
    "targetCir": 0
  }
]
```

Observed product count: `1`.

## Result 2 — campaign 33379127

Batch position maps to the second explicit command above.

- request_id: `9f9512f5-d40b-4e4d-afa2-f2baedf3b0e4`
- fingerprint: `2bbdc822`
- HTTP status: `200`
- elapsed: `431 ms`
- external_request_executed: `true`
- entitlement: `SUPPORTED_AND_ENTITLED`
- exact_request_preserved: `true`
- command_transformed: `false`
- rate_limit: `null`
- pagination: `null`

Returned products:

```json
[
  {
    "sku": "1636048691",
    "bid": "3000000",
    "title": "Славянский оберег - Подвеска на зеркало в машину \"Печать Велеса\"",
    "targetCir": 0
  }
]
```

Observed product count: `1`.

## Result 3 — campaign 37130607

Batch position maps to the third explicit command above.

- request_id: `080336e6-4095-4e7a-a0ba-2f85154d671f`
- fingerprint: `d192c2be`
- HTTP status: `200`
- elapsed: `408 ms`
- external_request_executed: `true`
- entitlement: `SUPPORTED_AND_ENTITLED`
- exact_request_preserved: `true`
- command_transformed: `false`
- rate_limit: `null`
- pagination: `null`

Returned products:

```json
[
  {
    "sku": "1636048691",
    "bid": "6500000",
    "title": "Славянский оберег - Подвеска на зеркало в машину \"Печать Велеса\"",
    "targetCir": 0
  }
]
```

Observed product count: `1`.

## Result 4 — campaign 37130634

Batch position maps to the fourth explicit command above.

- request_id: `052dfdca-4ad3-4f6f-861c-e28beb3e4e09`
- fingerprint: `590c8ea0`
- HTTP status: `200`
- elapsed: `438 ms`
- external_request_executed: `true`
- entitlement: `SUPPORTED_AND_ENTITLED`
- exact_request_preserved: `true`
- command_transformed: `false`
- rate_limit: `null`
- pagination: `null`

Returned products:

```json
[
  {
    "sku": "1636048691",
    "bid": "2500000",
    "title": "Славянский оберег - Подвеска на зеркало в машину \"Печать Велеса\"",
    "targetCir": 0
  }
]
```

Observed product count: `1`.

## What this run proves

All four title-discovered candidate campaigns resolve through the provider-backed campaign-product surface to exactly one currently returned product, and that product is target SKU `1636048691` in every case.

Therefore:

- title-only discovery uncertainty is removed;
- no competing SKU is present in the current returned product list for any of the four campaigns;
- the campaign-product identity gate itself is PASS;
- the four Run-19 candidate campaigns are strongly linked to target SKU `1636048691` by provider data, not by campaign-title inference.

## Historical-attribution boundary

Run 19's `moneySpent` values are historical August statistics. `performance_campaign_products` proves the products returned for each campaign at this read, but the supplied response does not itself expose a historical membership interval or prove that campaign SKU membership could not have changed during August.

To avoid silently converting current campaign composition into an unqualified historical-membership assumption, the next CAP-24 step is a historical SKU-level statistics request for the same four campaign IDs over `2026-08-01..2026-08-31` using `performance_sku_statistics`.

If that historical response identifies SKU `1636048691` and yields campaign/SKU-level advertising metrics consistent with the Run-19 campaign spend, target-SKU advertising attribution can be promoted without the membership-drift caveat.

Until that check is complete, `35785.11 RUB` is classified as:

`STRONGLY_TARGET_LINKED_CAMPAIGN_SPEND__HISTORICAL_SKU_LEVEL_CONFIRMATION_PENDING`

rather than silently folded into the final target-SKU economics.

## Duplicate-cost boundary remains open

Even after historical SKU-level confirmation, advertising spend must not be blindly added to the direct finance subtotal `113264.00 RUB`.

August finance evidence includes promotion-related `NON_ITEM` charges, including type_id `54`, without a defensible SKU key. A separate reconciliation gate is still required to determine whether Performance `moneySpent` and those finance promotion charges are overlapping representations of the same underlying advertising cost, partially overlapping, or distinct.

No heuristic allocation and no double counting are permitted.

## Current CAP-24 state after Run 20

- direct August target-attributable finance ledger: complete — `113264.00 RUB`
- historical campaign spend visibility: PASS
- candidate campaign identity to target SKU: PASS for all 4 campaigns
- current returned product count per candidate campaign: exactly `1`
- returned SKU in all four campaigns: `1636048691`
- candidate campaign spend total: `35785.11 RUB`
- historical SKU-level advertising confirmation: PENDING
- Performance-vs-finance duplicate reconciliation: PENDING
- placement/storage attribution: PENDING after advertising reconciliation
- executable Bridge change: none
