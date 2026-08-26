# Patch B6 Performance API — contract closure

Date: 2026-08-26

B6 closes the next read-only Performance API slice on top of accepted B5 authority `e296ff76b975470e8e12e566e2c4aff29adea00c`.

## Enabled fixed reads

- `performance_campaign_objects` -> `GET /api/client/campaign/{campaignId}/objects`
- `performance_bid_limits` -> `GET /api/client/limits/list`
- `performance_campaign_products` -> `GET /api/client/campaign/{campaignId}/v2/products`
- `performance_search_promo_products` -> `POST /api/client/campaign/search_promo/v2/products`
- `performance_media` -> `GET /api/client/statistics/campaign/media/json`
- `performance_sku_statistics` -> `POST /api/client/statistics/products/sku`

Every operation is fixed to provider `performance_api`, effect `READ`, `execution_enabled: true`, safe projection and `workflow_role: single_read`.

## Parameter contracts

`campaignId` path substitution is supported only for the exact fixed `{campaignId}` placeholder and only after strict string-`uint64` validation. The caller cannot supply a path, URL, host, method, headers or authorization material.

`performance_campaign_products` accepts caller-controlled optional `page` and `pageSize` integers. It does not invent automatic pagination or a maximum absent from the exact Swagger.

`performance_search_promo_products` accepts optional integer `page` and `pageSize`; `page`, when present, is at least 1 per the official description. The required HTTP request body may be `{}` because the referenced schema itself has no required properties.

`performance_media` accepts only `campaignIds`, `from`, `to`, `dateFrom`, `dateTo`. New B6 media campaign identifiers are strict string `uint64`; RFC3339 and YYYY-MM-DD fields are validated locally. The fixed `/json` suffix is based on explicit Swagger documentation.

`performance_sku_statistics` accepts only `campaignIds`, `dateFrom`, `dateTo`; campaign IDs are strict string `uint64`.

## Side-effect boundary

All known async report creation/generation endpoints in the exact Performance Swagger are blocked fail-closed by `PERFORMANCE_ASYNC_REPORT_SIDE_EFFECT_BLOCKLIST` before provider execution.

The existing `PERFORMANCE_MUTATION_BLOCKLIST` remains active for campaign creation/editing, activation/deactivation, product changes, bids and Search Promo enable/disable operations.

## Existing behavior protected

Existing working JSON endpoints remain unchanged:

- `/api/client/statistics/expense/json`
- `/api/client/statistics/daily/json`
- `/api/client/statistics/campaign/product/json`

Performance operations do not invoke Seller subscription capability probing. The Seller entitlement model is not used to guess Performance access.

No retry, pagination loop, fanout, async report workflow, credential exposure, provider ownership change, Autorun change or Work-session lifecycle change is introduced.
