# STD-05 Run 8 — Product Info / Visibility Evidence

Date: 2026-09-02
Benchmark: `OZON_AI_WORKER_STANDARD_LIVE_BENCHMARK_V2_2026-09-02.md`
Question: `Почему вчера продажи резко просели? Найди наиболее вероятные причины, а не просто покажи цифру продаж.`

## Command / execution

Operation: `seller_product_info_list`
Request id: `81021a84-4dab-48cf-961c-c41ae613d8d1`
Provider path: `POST /v3/product/info/list`
HTTP: `200`
Physical business requests: `1`
Entitlement: `SUPPORTED_AND_ENTITLED / all_accounts`
Input: the 24 product IDs corresponding to SKUs that had non-zero Seller sales on 2026-08-31.

## Completeness

All 24 requested products were returned.

## Aggregate listing state

For all 24 returned products:

- `is_archived=false`;
- `is_autoarchived=false`;
- `statuses.status_name="Продается"`;
- `statuses.moderate_status="approved"`;
- `statuses.validation_status="success"`;
- `visibility_details.has_price=true`;
- `visibility_details.has_stock=true`;
- `availabilities[].availability="AVAILABLE"`;
- `availabilities[].reasons=[]`;
- `errors=[]`.

Therefore a broad current catalog visibility/moderation/archive failure is not supported as the explanation for the 45.2% Seller-revenue decline.

## Specific product anomaly

SKU `2184199958` — `Мара`:

- still `status_name="Продается"`;
- still `availability="AVAILABLE"`;
- has FBO/FBS stock;
- `errors=[]`;
- but service update state shows:
  - `statuses.status="new"`;
  - `statuses.status_failed="imported"`;
  - `statuses.status_description="Не обновлен"`;
  - tooltip says the product update failed and import history should be checked.

This is a real listing-maintenance anomaly for one SKU, but because the product remains sellable/available and the decline is distributed across many SKUs, it is not sufficient to explain the broad account-level drop.

## Stock clarification from this richer endpoint

The richer product info also shows that some apparent FBO scarcity from `stock_on_warehouses_v2` does not equal total sellable scarcity because many SKUs have substantial FBS stock. Examples:

- SKU `1720144370` `Дева`: FBO present `1`, FBS present `42`;
- SKU `2184234912` `Звезда Лады`: FBO present `5`, FBS present `43`;
- SKU `1636048691` `Печать Велеса`: FBO present `192` (5 reserved), FBS present `50`.

Therefore the earlier stock hypothesis must be weakened further: current total sellable stock is healthy for these major declining SKUs, even where FBO-only warehouse rows looked narrow.

Historical causality remains unproven because these are current product states, not a historical 2026-09-01 snapshot.

## Updated hypothesis state

- single-SKU collapse: `REJECTED`;
- broad advertising shutdown: `REJECTED`;
- broad current archive/moderation/availability failure: `REJECTED`;
- current total stock scarcity as broad cause: `WEAK / NOT SUPPORTED FOR MAJOR NEGATIVE SKUS`;
- one listing maintenance anomaly (`Мара`): `SUPPORTED_LOCAL_ISSUE / NOT_BROAD_CAUSE`;
- organic/search demand change: `LEADING_UNTESTED_HYPOTHESIS`;
- exact historical stock/listing causality: `NOT_PROVEN`.

## Next step

Use Standard-entitled `product_queries` for the same 24 SKUs and compare 2026-08-31 with 2026-09-01. The endpoint is `ALL_ACCOUNTS_PARTIAL_RESPONSE` for recent history; only history older than one month is subscription restricted. Do not use Premium-Pro marketplace-wide `/v1/search-queries/top` or `/v1/search-queries/text` in this Standard pass.

Checkpoint: `STD_05_RUN8_CURRENT_LISTING_FAILURE_REJECTED_ORGANIC_SEARCH_COMPARISON_NEXT`.
