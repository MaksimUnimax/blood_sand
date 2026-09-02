# STD-05 — Run 2 — current stock page 1

Date: 2026-09-02
Branch: `research/ozon-product-demand-2026-09-02`
Business question: `Почему вчера продажи резко просели? Найди наиболее вероятные причины, а не просто покажи цифру продаж.`
Status: IN_PROGRESS / NO_SKIP_ON_FAILURE

## Command

`stock_on_warehouses_v2`, params `limit=100`, `offset=0`, `warehouse_type=ALL`.

## Observed

- request id: `f6e626ef-df0a-400c-b79e-f35aec20b512`;
- endpoint: `POST /v2/analytics/stock_on_warehouses`;
- entitlement: `SUPPORTED_AND_ENTITLED` / `all_accounts`;
- HTTP `200`;
- exactly one physical request;
- no provider rate-limit metadata;
- response returns warehouse-level current stock rows with `free_to_sell_amount`, `reserved_amount`, `promised_amount`;
- pagination metadata in the Bridge result is `null` even though the request itself is page-shaped (`limit`/`offset`).

## Findings from page 1

The stock snapshot is current at test time. It is not historical stock as of 2026-09-01, so it cannot by itself prove causality for yesterday's sales drop.

Important examples:

- SKU `1636048691` — `Печать Велеса`, one of the negative sales contributors (`-2,788 RUB` day-over-day), is not globally stock-starved in the visible page. Summed visible `free_to_sell_amount` is about `188` units across many RFC warehouses, plus `promised_amount=31` at `ХАБАРОВСК_2_РФЦ` and a few reserved units. Current aggregate stock therefore strongly argues against a simple global out-of-stock explanation for this SKU.
- SKU `1720144370` — `Дева`, the largest observed negative contributor (`-5,100 RUB`), appears with only `1` free-to-sell unit in the visible page (`ВАТУТИНКИ_РФЦ`). This is a possible availability constraint, but not yet proven historical cause.
- Several other SKUs have zero free stock on one warehouse while having promised/reserved stock, so warehouse-level distribution matters; one zero row must not be interpreted as total SKU out-of-stock.

## Pagination/product-logic finding

The page reaches the requested page size / is consistent with a full first page and stops before all declining SKUs have been inspected. Bridge `pagination` is `null`, so the AI must not assume this is the complete stock universe. It should explicitly continue with `offset=100`.

This exposes a weak-model portability requirement: page-shaped operations should make continuation/completeness machine-readable, or a weak AI may treat the first page as complete.

## Next step

Run the exact same stock operation with `offset=100`, keep `limit=100` and `warehouse_type=ALL`. Continue pagination until a short page / evidence of completion is obtained, then correlate all key declining SKUs before deciding whether stock is a leading cause. After stock coverage, inspect listing visibility and advertising only as needed.

Checkpoint: `STD_05_RUN_2_STOCK_PAGE_1_COMPLETE_NEXT_OFFSET_100`
