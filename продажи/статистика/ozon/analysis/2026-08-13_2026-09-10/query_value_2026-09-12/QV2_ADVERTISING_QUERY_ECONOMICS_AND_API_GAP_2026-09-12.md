# Ozon query value — QV2 advertising query economics and API gap — 2026-09-12

## Status

`QV2 = COMPLETE__METHOD_AND_CAPABILITY_RECONCILED`

No new Ozon provider call was made in this block.

## What can be valued exactly with the current evidence/API surface

### 1. Organic / marketplace-linked query monetary evidence

Already materialized in QV1:

- 162 unique `SKU × query` pairs with `GMV > 0`;
- 146 unique monetized phrases;
- 50 SKUs;
- 131,393.07 RUB attributed GMV.

This is direct monetary attribution returned by Ozon for the saved `product_queries_details` layer. It is not CPC or profit.

### 2. Advertising economics at campaign / SKU level

The current Performance API and current Bridge read surface expose product/campaign statistics from which the following can be calculated exactly at the returned granularity:

- impressions;
- clicks;
- CTR;
- average CPC;
- expense;
- orders;
- attributed sales;
- DRR / ACOS.

Useful calculations:

- `CPC = expense / clicks`;
- `CTR = clicks / impressions`;
- `CVR_ad = orders / clicks`;
- `CPO = expense / orders`;
- `DRR = expense / attributed_sales`;
- `ROAS = attributed_sales / expense`.

Current read authorities include, among others:

- `performance_sku_statistics` → `POST /api/client/statistics/products/sku`;
- campaign product statistics;
- expense statistics;
- daily statistics;
- report list/status/download reads.

## What Ozon exposes at paid search-query / phrase level

Current Ozon help and the current Performance API describe a search-query report for CPC advertising. The report exposes the queries for which the buyer saw the promoted card and clicked it, together with:

- impressions;
- clicks;
- CTR.

The current help does **not** state that this phrase report exposes phrase-level expense, orders, or sales.

Therefore:

`EXACT_PAID_PHRASE_CLICKS = AVAILABLE_WHEN_PHRASE_REPORT_IS_AVAILABLE`

`EXACT_PAID_PHRASE_CTR = AVAILABLE_WHEN_PHRASE_REPORT_IS_AVAILABLE`

`EXACT_PAID_PHRASE_SPEND = NOT EXPOSED BY THE DOCUMENTED PHRASE REPORT`

`EXACT_PAID_PHRASE_ORDERS = NOT EXPOSED BY THE DOCUMENTED PHRASE REPORT`

`EXACT_PAID_PHRASE_SALES = NOT EXPOSED BY THE DOCUMENTED PHRASE REPORT`

## Current API / UI scope caveat

There is a documentation-boundary difference that must be kept explicit:

- current Performance OpenAPI describes `POST /api/client/statistics/phrases` as a test-stage method limited to CPC campaigns with `placement = PLACEMENT_TOP_PROMOTION`;
- current Ozon help describes the UI search-query report under CPC campaigns with placement «Поиск» and says it is not available to every user.

Until a live account read resolves the campaign placement/eligibility, do not broaden the phrase-report scope by assumption.

## Current Bridge gap

Upstream Ozon Performance API has:

`POST /api/client/statistics/phrases`

But the current Bridge authority classifies creation of this asynchronous report as:

`TERMINAL_UNAVAILABLE_ASYNC_REPORT_GENERATION`

with the operation not production-exposed.

The Bridge **does** expose safe reads for already-created reports:

- list reports generated in the UI;
- list reports generated via API;
- check report status by UUID;
- download a prepared report by UUID.

Therefore the no-patch route is:

1. inspect existing UI-generated reports;
2. if a suitable search-query report already exists, download it by UUID;
3. parse phrase → impressions/clicks/CTR.

If no such report exists, the missing capability is the asynchronous phrase-report generator, not report parsing or download.

## How to estimate paid phrase cost without inventing precision

Where phrase clicks are available, a **bounded estimate** can be calculated:

`estimated_phrase_spend = phrase_clicks × matching_average_CPC`

The CPC must be taken from the closest available matching layer:

1. same campaign + same SKU + same period, if available;
2. otherwise same campaign + same period;
3. never use an unrelated account-wide CPC without marking the estimate low-confidence.

This estimate is not exact phrase spend because individual click prices can differ.

## Phrase economic evidence classes

Use separate evidence classes rather than one invented universal score:

- `ORGANIC_GMV_PROVEN` — relevant `query × SKU` has Ozon-attributed GMV;
- `PAID_CLICK_PROVEN` — phrase report has one or more clicks;
- `PAID_SPEND_ESTIMATED` — clicks × matching avg CPC can be calculated;
- `PAID_SKU_CONVERSION_PROVEN` — campaign/SKU layer has orders or attributed sales;
- `MARKET_DEMAND_ONLY` — independent marketplace search demand exists, but no own monetary proof yet;
- `NO_ECONOMIC_PROOF` — no current monetary or paid-click evidence.

Economic evidence never overrides semantic relevance. A paid or monetized false-positive query is still not an SEO keyword.

## Official / authority sources

- Ozon Seller help: campaign CPC results and search-query report — `https://docs.ozon.uz/performance/product-ads/oplata-za-klik/results-of-campaign/`;
- Ozon Seller media: «Новая аналитика по запросам товаров» — `https://seller.ozon.ru/media/news/novaya-analitika-po-zaprosam-tovarov/`;
- current saved Ozon Performance OpenAPI / `swagger (1).json`;
- current Bridge terminal matrix / operation export.

## Next block

`QV3`: correct non-circular Ozon SEO / analytics method using the current Seller + Performance API surface.
