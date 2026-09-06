# CAP-24 Run 01 — August SKU sales ranking — SUCCESS

Date: 2026-09-06
Status: `TARGET_SKU_SELECTED_FINANCE_ATTRIBUTION_NEXT`

Canonical CAP-24 job:
`Возьми один реально продававшийся товар из моего текущего каталога и посчитай по нему юнит-экономику за последний полный календарный месяц...`

Frozen period:
- `2026-08-01` through `2026-08-31` inclusive.

Operation: `analytics_data`
Request ID: `73b15a69-d528-475e-8507-7b8ecc41a03c`
Provider surface: Seller API `POST /v1/analytics/data`

Requested business parameters:
- `date_from = 2026-08-01`
- `date_to = 2026-08-31`
- `dimension = [sku]`
- `metrics = [revenue, ordered_units]`
- `sort = revenue DESC`
- `limit = 1000`
- `offset = 0`

Execution evidence:
- HTTP `200`
- external request executed: `true`
- logical business result count: `1`
- physical business request count: `1`
- physical request id = logical request id = `73b15a69-d528-475e-8507-7b8ecc41a03c`
- entitlement: `SUPPORTED_AND_ENTITLED`
- entitlement reason: `all_accounts`
- exact request preserved: `true`
- requested metrics = physical metrics = `[revenue, ordered_units]`
- acquisition profile: `analytics_basic_metrics_v1`
- no capability probe was needed
- no hidden pagination/fanout/retry

Provider result:
- August account total revenue in this result: `1,241,833 RUB`
- August account total `ordered_units`: `739`
- rows were returned in descending revenue order.

## Selected real sold SKU

Top August row:
- Ozon SKU: `1636048691`
- title: `Славянский оберег - Подвеска на зеркало в машину "Печать Велеса"`
- August revenue: `259,136 RUB`
- August `ordered_units`: `155`

Preserved CAP-21 identity authority resolves the same SKU to:
- Seller product_id: `1119965443`
- offer_id: `Печать Велеса`
- title: `Славянский оберег - Подвеска на зеркало в машину "Печать Велеса"`

Therefore the CAP-24 target is selected from live August sales evidence rather than manually assumed:
`TARGET_SKU = 1636048691`.

Useful non-authoritative descriptive ratios from the returned totals:
- target revenue share of returned August total: approximately `20.87%`;
- target ordered-unit share of returned August total: approximately `20.97%`;
- revenue / ordered_unit for this gross analytics basis: approximately `1,671.85 RUB`.

These ratios are descriptive only and are not yet unit-economics contribution/profit figures.

## Semantic discipline

`ordered_units = 155` MUST retain the exact source semantic label. It is not relabelled as delivered units.

Controlling STD-09 evidence established that the `analytics_data` `revenue + ordered_units` basis can include orders that are later cancelled. Therefore:
- `259,136 RUB / 155 ordered_units` is the gross analytics basis for the period;
- later cancellation/return/reversal effects must be reconciled from finance/posting evidence;
- no cancellation, return or fee is subtracted yet;
- no current-price-times-units reconstruction is used.

## CAP-24 state after Run 01

Evidence classes now satisfied:
1. real sold product selection — PASS;
2. SKU/product_id/offer_id identity integrity — PASS;
3. period gross revenue and exact ordered-unit basis — PASS.

Still pending:
- direct SKU/posting-attributable finance deductions;
- commission;
- logistics/delivery;
- acquiring;
- returns/reversals and other direct Ozon charges;
- defensible advertising attribution;
- defensible placement/storage attribution;
- final contribution calculations and unallocated-cost boundaries.

No account-level cost may be allocated to this SKU without a defensible attribution key, and finance amounts must not be added as duplicate revenue on top of Seller Analytics.

Commercial-value significance:
- Bridge successfully discovered the highest-revenue actually sold August SKU without operator selection;
- it produced a factual monthly revenue/ordered-unit basis for a concrete product;
- the commercially harder part of CAP-24 now begins: reconciling product/posting-linked Ozon deductions into defensible marketplace unit economics without invented allocation.

Checkpoint: `CAP_24_TARGET_SKU_1636048691_SELECTED_FINANCE_ATTRIBUTION_NEXT`
