# Ozon Performance Step 6 exact 48-operation matrix

Status: `PERFORMANCE_STEP6_EXACT_MATRIX_BUILT`

## Exact authority

- Swagger bytes: `304771`
- Swagger SHA-256: `7436e4a3e40b4d5bf926a887d7891c1db264cbb6582266299a2df10f67592fec`
- Paths: `47`
- HTTP operations: `48`

## Step 6 split

- admissible current reads/read-results: **21**
- already implemented on exact current method+path: **6**
- new current reads to implement: **15**
- existing documented `/json` variants preserved: **4**
- async report-generation starts kept blocked: **9**
- mutations kept blocked: **16**
- deprecated read-like endpoints not added to current read surface: **2**

The four `/json` routes are documented variants of current statistics operations. They remain useful compatibility/read routes, but do not replace the exact base `method + path` rows in the 48-operation completeness count.

## Missing current reads to implement

- `performance_min_bid_by_sku` — `POST /api/client/min/sku` — `DIRECT_JSON`
- `performance_products_with_bonuses` — `GET /api/client/products_with_bonuses` — `DIRECT_JSON`
- `performance_statistics_status` — `GET /api/client/statistics/{UUID}` — `DIRECT_JSON`
- `performance_statistics_list_ui` — `GET /api/client/statistics/list` — `DIRECT_JSON`
- `performance_statistics_list_api` — `GET /api/client/statistics/externallist` — `DIRECT_JSON`
- `performance_statistics_report_download` — `GET /api/client/statistics/report` — `DIRECT_BINARY`
- `performance_media_csv` — `GET /api/client/statistics/campaign/media` — `DIRECT_BINARY`
- `performance_campaign_product_csv` — `GET /api/client/statistics/campaign/product` — `DIRECT_BINARY`
- `performance_expense_csv` — `GET /api/client/statistics/expense` — `DIRECT_BINARY`
- `performance_daily_csv` — `GET /api/client/statistics/daily` — `DIRECT_BINARY`
- `performance_competitive_bids` — `GET /api/client/campaign/{campaignId}/products/bids/competitive` — `DIRECT_JSON`
- `performance_cpo_min_bids` — `POST /api/client/search_promo/get_cpo_min_bids` — `DIRECT_JSON`
- `performance_vendor_statistics_list` — `GET /api/client/vendors/statistics/list` — `DIRECT_JSON`
- `performance_vendor_statistics_status` — `GET /api/client/vendors/statistics/{UUID}` — `DIRECT_JSON`
- `performance_vendor_tag` — `GET /api/client/organisation/vendor_tag` — `DIRECT_JSON`

## Safety boundary

The existing accepted Performance mutation blocklist already matches all 16 current mutation operations selected by this matrix. The existing accepted async-report side-effect blocklist already matches all 9 report-generation starts selected by this matrix. Step 6 must preserve both blocklists.
