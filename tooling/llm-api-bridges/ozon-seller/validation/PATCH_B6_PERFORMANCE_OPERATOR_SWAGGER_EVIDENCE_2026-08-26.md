# Patch B6 Performance API — operator Swagger evidence

Date: 2026-08-26

## Raw authority

B6 is grounded in the exact operator-supplied Performance API OpenAPI artifact used in the previous work session.

- local operator filename: `swagger(1).json`
- byte length: `304771`
- SHA-256: `7436e4a3e40b4d5bf926a887d7891c1db264cbb6582266299a2df10f67592fec`
- OpenAPI: `3.0.0`
- paths: `47`
- HTTP operations: `48`

The raw Swagger is not committed into the repository. The B6 regression accepts it only as an optional external authority and refuses a different SHA.

## B6 read endpoints established by the exact Swagger

- `GET /api/client/campaign/{campaignId}/objects` — `ListCampaignObjects`
- `GET /api/client/limits/list` — `GetLimitsList`
- `GET /api/client/campaign/{campaignId}/v2/products` — `GetProductsV2`
- `POST /api/client/campaign/search_promo/v2/products` — `ExternalCampaign_ListSearchPromoProductsV2`
- `GET /api/client/statistics/campaign/media` — `MediaCampaignList`
- `POST /api/client/statistics/products/sku` — `SearchPromoProductsSKUStatistics2`

For campaign objects and campaign products, `campaignId` is a required path parameter with Swagger schema `type: string`, `format: uint64`.

For campaign products, optional `page` and `pageSize` are `integer/int64` and remain caller-controlled. No automatic continuation is authorized.

For Search Promo products, the request body schema is `extcampaignListSearchPromoProductsRequestV2` with optional integer `page` and `pageSize`. Its documentation states that page numbering starts from one. No undocumented maximum is invented.

For media statistics, the documented base method returns CSV by default. The exact Swagger description explicitly instructs JSON callers to append `/json` and call `/api/client/statistics/campaign/media/json`. B6 therefore exposes the fixed JSON suffix route rather than silently returning CSV to the model.

For SKU statistics, the request schema `extstatisticsSearchPromoProductsSKUStatisticsRequest` contains optional `campaignIds` as string `uint64` plus `dateFrom` and `dateTo`. The operation description states that it does not consume Performance API limits.

## Async report side-effect endpoints intentionally excluded

The same exact Swagger contains report-generation endpoints. B6 treats creation/generation as side effects and does not expose them as read operations:

- `POST /api/client/statistics`
- `POST /api/client/statistics/video`
- `POST /api/client/statistics/attribution`
- `POST /api/client/statistic/orders/generate`
- `POST /api/client/statistic/products/generate`
- `GET /api/client/statistics/all_sku_promo/orders/generate`
- `GET /api/client/statistics/all_sku_promo/products/generate`
- `POST /api/client/statistics/phrases`
- `POST /api/client/vendors/statistics`

B6 adds a local fail-closed registry/contract block for these endpoints. No hidden report creation, polling, retrieval or chaining is authorized.

## Mutation boundary

Existing campaign, bid and promoted-product mutation blocks remain in force. Presence of a method in Swagger is not authorization for bridge execution.

## Exact local regression

The B6 deterministic regression was run against the raw authority above and emitted:

`B6_PERFORMANCE_EXACT_SWAGGER_PASS`
