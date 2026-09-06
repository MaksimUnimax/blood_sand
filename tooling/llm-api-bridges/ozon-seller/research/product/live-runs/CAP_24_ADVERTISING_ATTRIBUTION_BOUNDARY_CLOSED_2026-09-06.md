# CAP-24 — advertising attribution boundary closure

Date: 2026-09-06
Status: `ADVERTISING_ATTEMPT_COMPLETE__HISTORICAL_SKU_ATTRIBUTION_COVERAGE_BOUNDARY__NEXT_PLACEMENT_REPORT`

## Target

- Ozon SKU: `1636048691`
- seller product_id: `1119965443`
- offer_id: `Печать Велеса`
- frozen period: `2026-08-01..2026-08-31`

## Preserved evidence

### Historical campaign spend

Run 19 established actual historical August campaign statistics and four target-title candidate campaigns.

Candidate spend:

- `33379108`: `14900.95 RUB`
- `33379127`: `14291.96 RUB`
- `37130607`: `3431.80 RUB`
- `37130634`: `3160.40 RUB`
- total: **`35785.11 RUB`**

### Provider-backed campaign-product identity

Run 20 used `performance_campaign_products` for all four campaign IDs in one explicit batch.

Each campaign currently returned exactly one product and it was target SKU `1636048691`.

Therefore title-only inference is no longer the attribution basis. The current campaign-to-product relation is provider-backed.

### Second historical campaign metric surface

Run 21 used `performance_campaign_product_csv` and returned exactly the four target-candidate campaign rows with the same historical spend values.

The CSV confirmed the exact subtotal `35785.11 RUB` and historical campaign metrics, but its schema contained no SKU/product identifier column.

## Registry boundary check

The current branch operation registry was read directly before advancing.

Available relevant Performance reads include:

- `performance_campaign_products` — current campaign product list;
- `performance_campaign_objects` — current campaign object list;
- `performance_campaign_product` — historical campaign/product statistics JSON surface, but observed schema does not expose a concrete SKU key;
- `performance_campaign_product_csv` — historical CSV surface; observed schema has no SKU key;
- `performance_expense` / `performance_daily` — historical campaign/account statistics, not historical SKU membership;
- `performance_sku_statistics` — the only explicit SKU-statistics operation, but registry authority requires a near-current date range and states `dateFrom may not be earlier than the previous day`.

No alternative current Bridge operation in the Performance statistics section exposes arbitrary historical August SKU-level membership/spend for this job.

Therefore retrying `performance_sku_statistics` for August with different parameter spelling would be invalid methodology, not additional evidence.

## Advertising conclusion

CAP-24 primary authority explicitly allows PASS with an attribution coverage boundary when the current Performance contract cannot provide a defensible historical monthly SKU attribution.

The strongest available advertising evidence is:

`HISTORICAL_CAMPAIGN_SPEND_35785_11__CURRENT_EXCLUSIVE_TARGET_SKU_RELATION__HISTORICAL_MEMBERSHIP_INTERVAL_NOT_EXPOSED`

For strict exact-attributable arithmetic, do **not** silently promote `35785.11 RUB` to an unconditional historical SKU advertising cost.

Instead preserve it as:

- strongly target-linked advertising evidence;
- historical SKU-membership coverage boundary;
- candidate advertising cost for a clearly caveated scenario, if a scenario is shown;
- not a basis for arbitrary allocation across products.

This satisfies the required advertising attempt path without fabricating unsupported attribution.

## Double-counting clarification

The exact direct finance subtotal `113264.00 RUB` excludes `NON_ITEM` promotion/account-level rows without a defensible SKU key.

Therefore a future caveated Performance advertising scenario must not separately add those excluded NON_ITEM promotion rows. They remain unallocated/reconciliation evidence.

The exact finance subtotal itself does not already include those excluded account-level promotion rows.

## Next required CAP-24 class — placement/storage

Primary authority requires an explicit placement/storage attempt after advertising.

Current registry exposes:

`report_placement_by_products_create`

Provider route:

`POST /v1/report/placement/by-products/create`

Template contract:

```json
{
  "operation": "report_placement_by_products_create",
  "params": {
    "date_from": "2026-01-01",
    "date_to": "2026-01-01"
  }
}
```

For CAP-24 the exact next command is:

```text
OZON_API_V1
{
  "operation": "report_placement_by_products_create",
  "params": {
    "date_from": "2026-08-01",
    "date_to": "2026-08-31"
  }
}
```

Expected invariant:

`1 explicit business command => at most 1 physical provider request`.

No hidden polling is allowed.

If creation succeeds and returns a report code, the workflow becomes dependent:

1. explicit `report_info` using the returned code;
2. only if provider state is ready and an opaque `file_ref` is returned, explicit `report_file_get` using that exact ref;
3. inspect the parsed report for target SKU/product identity and exact placement/storage cost;
4. if the file cannot be materialized or target product attribution is absent, record `PLACEMENT_ATTRIBUTION_NOT_AVAILABLE` rather than allocate account-level charges.

Current checkpoint:

`CAP_24_ADVERTISING_BOUNDARY_CLOSED__NEXT_PLACEMENT_BY_PRODUCTS_CREATE`

Executable Bridge patch: none.
