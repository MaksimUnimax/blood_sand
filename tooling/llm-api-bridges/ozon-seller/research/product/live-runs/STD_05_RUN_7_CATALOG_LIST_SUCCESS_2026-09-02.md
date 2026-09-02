# STD-05 Run 7 — catalog list success after exact parameter repair

Date: 2026-09-02
Branch: `research/ozon-product-demand-2026-09-02`
Parent benchmark: `OZON_AI_WORKER_40_TEST_LIVE_RESULTS_TABLE_2026-09-02.md`
Business job: `Почему вчера продажи резко просели? Найди наиболее вероятные причины, а не просто покажи цифру продаж.`

## Context

Run 6 attempted the correct `seller_product_list` operation for all 24 SKUs that sold on 2026-08-31 but encoded `filter.skus` as JSON numbers. Bridge rejected the request locally with `INVALID_OPERATION_PARAMS`, zero provider requests, and generic catalog guidance. Contract inspection proved that `filter.skus` requires string int64 identifiers.

Run 7 repeated the same business read with the same 24 SKUs encoded as strings.

## Run 7 result

Request id: `a901f1bc-577f-4ef8-978a-a902cf06cedb`
Operation: `seller_product_list`
Provider path: `POST /v3/product/list`
HTTP: `200`
Physical business requests: `1`
Entitlement: `SUPPORTED_AND_ENTITLED / all_accounts`
Returned item count: `24`
Returned total: `24`

All 24 requested SKUs were returned.

## Current catalog-state findings

- `archived=false` for all 24/24 products.
- Every returned product has at least one fulfillment stock flag true (`has_fbo_stocks` or `has_fbs_stocks`).
- Three SKUs have `has_fbo_stocks=false` but `has_fbs_stocks=true`:
  - `1720124782` — Знак зодиака «Стрелец»;
  - `1720160556` — Знак зодиака «Скорпион»;
  - `2559437928` — «Чур».
- Major negative SKUs from Run 1 are all present and not archived:
  - `1720144370` / product_id `1217132021` — «Дева» — FBO=true, FBS=true;
  - `2184234912` / product_id `1831506538` — «Звезда Лады» — FBO=true, FBS=true;
  - `1636048691` / product_id `1119965443` — «Печать Велеса» — FBO=true, FBS=true.

## Interpretation

The hypothesis that the 2026-09-01 broad sales decline was caused by mass archival/removal of the 24 previously selling listings is not supported by the current catalog list: all 24 are present and `archived=false`.

This read is still a current-state snapshot, not historical listing state on 2026-09-01. It also does not provide sufficiently detailed sale/visibility diagnostics to close the visibility branch.

Therefore the next read must use `seller_product_info_list` for the same 24 product IDs to inspect the richer product/status payload.

## Product/guidance consequence

Run 7 proves the Run 6 failure was a mechanical parameter-type issue only. The same operation and business intent succeeded after converting numeric SKU values to string int64 values.

This strengthens the Run 6 requirement:

`GUIDANCE_KNOWS_OPERATION_BUT_DOES_NOT_EXPOSE_ACTIONABLE_PARAMETER_REPAIR`

A weak model should not need repository/contract introspection to discover the exact repair. For deterministic local validation errors, Guidance should preserve the exact field-level validation message and provide a safe same-operation corrected shape when the repair is non-semantic and unambiguous.

## Checkpoint

`STD_05_RUN7_CATALOG_LIST_24_OF_24_NOT_ARCHIVED_NEXT_PRODUCT_INFO_LIST`
