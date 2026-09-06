# CAP-22 Run 01 — pricing_strategy_product_info — no competitor linkage

Date: 2026-09-06
Status: `PASS_DISCOVERY_DEAD_END_CONTINUE`

Target own product authority:
- SKU `1636048691`
- Seller product_id `1119965443`
- offer_id `Печать Велеса`

Operation: `pricing_strategy_product_info`
Request ID: `00407c48-eccf-4ef0-a238-6e56d18606d1`
Provider surface: Seller API `POST /v1/pricing-strategy/product/info`

Execution evidence:
- HTTP `200`
- external request executed: `true`
- capability probe: not needed / not executed
- entitlement: `SUPPORTED_AND_ENTITLED`
- entitlement reason: `all_accounts`
- exact request preserved: `true`
- command transformed: `false`
- logical business result count: `1`
- physical business request count: `1`

Returned result:
```json
{
  "strategy_id": "",
  "is_enabled": false,
  "strategy_product_price": 0,
  "price_downloaded_at": "",
  "strategy_competitor_id": 0,
  "strategy_competitor_product_url": ""
}
```

Interpretation:
- the direct product-info read executed correctly;
- this target product is not enabled in a pricing strategy on this surface;
- `strategy_competitor_id=0` plus an empty competitor URL does **not** identify a competitor;
- therefore Run 01 is not a provider/transport failure, but it is a target-product competitor-discovery dead end;
- no competitor may be invented or manually selected from this result.

Frozen recovery: follow the existing CAP-22 setup and resolve explicit own-product strategy linkage with `pricing_strategy_ids_by_product_ids` for product_id `1119965443` before considering broader pricing-strategy reads. If no linkage is returned, record that boundary rather than treating empty fields as competitor evidence.
