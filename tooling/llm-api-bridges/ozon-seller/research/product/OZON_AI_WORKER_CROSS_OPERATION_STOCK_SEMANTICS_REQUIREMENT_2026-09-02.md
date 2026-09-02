# Ozon AI Worker — Cross-Operation Stock Semantics Requirement

Date: 2026-09-02
Status: PRODUCT HARDENING REQUIREMENT DISCOVERED BY STD-05
Source benchmark row: `STD-05`

## Evidence

During STD-05, `stock_on_warehouses_v2` (`POST /v2/analytics/stock_on_warehouses`) was used to inspect current warehouse stock. For some major declining SKUs, the completed warehouse-row report looked scarce:

- SKU `1720144370` `Дева`: 1 free unit in the warehouse report;
- SKU `2184234912` `Звезда Лады`: 5 free units + 2 promised;
- SKU `1636048691` `Печать Велеса`: substantial FBO stock.

A later `seller_product_info_list` read for the same SKUs exposed additional stock by fulfillment source:

- `1720144370`: FBO present `1`, FBS present `42`;
- `2184234912`: FBO present `5`, FBS present `43`;
- `1636048691`: FBO present `192` (5 reserved), FBS present `50`.

Therefore the warehouse analytics result must not be interpreted as total sellable account stock across all fulfillment sources unless the operation contract explicitly proves that scope.

## Product risk

A weaker AI can receive a valid warehouse report and conclude `stockout/near-stockout`, then use that as a causal explanation for a sales decline even though substantial FBS inventory exists in another read surface.

This is not an HTTP/error-recovery problem. It is a **cross-operation semantic-scope problem**.

## Required product behavior

Bridge guidance/metadata should make stock scope explicit where known, for example:

```text
stock_semantics: {
  operation: "stock_on_warehouses_v2",
  scope: "OZON_WAREHOUSE_ANALYTICS",
  fulfillment_sources_included: ["FBO"] | ["FBO","FBS"] | null,
  represents_total_sellable_stock: false | true | null,
  complementary_operations: ["seller_product_info_list", "product_fbs_warehouse_stocks"],
  warning: "Do not interpret this result as total sellable stock across fulfillment sources unless scope is proven."
}
```

Rules:

- do not force the model to infer operation scope from field names or warehouse names;
- when an operation is not a total-account inventory view, explicitly label that fact;
- if total stock requires multiple reads, expose the complementary read family instead of allowing a false total-stock conclusion;
- keep all reads explicit and preserve `ONE EXPLICIT AI COMMAND = AT MOST ONE PHYSICAL BUSINESS API REQUEST`;
- do not hidden-fan-out to another stock endpoint.

## Benchmark consequence

The earlier STD-05 interim hypothesis `stock scarcity plausibly contributes to Дева / Звезда Лады` must be weakened after Run 8. Current total sellable stock for those SKUs is not scarce once FBS is included.

Current classification:

`CURRENT_TOTAL_STOCK_SCARCITY_NOT_SUPPORTED_AS_BROAD_STD05_CAUSE`

Historical inventory on 2026-09-01 is still not proven from these current-state reads.

Checkpoint: `STD05_CROSS_OPERATION_STOCK_SCOPE_GAP_RECORDED_FOR_POST_SOL_HARDENING`.
