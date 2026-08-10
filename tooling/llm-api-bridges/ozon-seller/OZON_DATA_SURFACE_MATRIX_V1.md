# Ozon Seller API — data surface matrix v1

Дата: 2026-08-10  
Статус: **RESEARCH MATRIX — extension development not started**

Цель: проверить, что будущий Ozon bridge сможет решить две задачи проекта:

1. **Website assortment ingestion** — получить весь фактический магазин и построить Product/SKU/Listing/Category master.
2. **Seller diagnostics** — по запросу вроде «за неделю просели продажи, найди вероятные причины» собрать достаточную evidence chain, а не один отчёт.

Обозначения:

- `CONFIRMED` — capability/exact method уже имеет official Ozon provenance в основном audit;
- `PARTIAL` — часть слоя подтверждена, но полного current read surface ещё нет;
- `PENDING` — current exact official endpoint/schema ещё должен быть подтверждён;
- `DESIRABLE` — полезно, но не блокирует первый импорт магазина.

## 1. Assortment / website ingestion

| Data layer | Нужные факты | Status | Что уже есть / чего не хватает |
|---|---|---:|---|
| Seller product enumeration | все seller offers/listings, включая доступные hidden/archive states | `PENDING` | нужен current exact catalog list surface |
| Product identity | `offer_id`, `product_id`, marketplace SKU/listing ids | `PARTIAL` | часть identity видна в stocks/postings; нужен canonical full product read |
| Title/name | актуальное marketplace title | `PENDING` | нужен bulk product info |
| Category/type | category/type ids + dictionaries | `PENDING` | нужен current product/category surface |
| Attributes | характеристики, размеры, материалы, вес/габариты | `PENDING` | нужен current attributes surface |
| Barcodes | seller/product barcodes | `PENDING` | current product schema verification |
| Media | image/video refs | `PENDING` | current product/media read surface |
| Description/rich content | текст/structured content refs where exposed | `PENDING` | проверить, отдаёт ли current Seller API read access |
| Listing visibility/status | visible/hidden/archived/moderation/error state | `PENDING` | blocking для понимания, почему товар перестал продаваться |
| Current stock | FBO/FBS `present`, `reserved`, SKU/warehouse facts | `CONFIRMED` | `POST /v4/product/info/stocks` |
| Seller warehouses/cluster map | warehouse ids/names/types, cluster/geography | `PARTIAL` | warehouse ids есть в stock evidence; отдельный current dictionary/read surface pending |
| Current price | seller/current/marketing/old price semantics | `PENDING` | exact current price read surface pending |
| Discounts/promotions | participation, seller/Ozon-funded effects where exposed | `PENDING` | exact read surface pending |

**Assortment gate:** пока product enumeration + bulk product info + price/status/category/attributes не подтверждены current official schema, Ozon side полного Product/SKU master считать готовой нельзя.

## 2. Demand / discovery / search

| Data layer | Нужные факты | Status | Evidence |
|---|---|---:|---|
| Product impressions/shows | product visibility/exposure | `CONFIRMED` | `POST /v1/analytics/data`, subject to current metric schema |
| Sessions/traffic | product sessions/visits | `CONFIRMED` | `POST /v1/analytics/data` |
| Conversion | traffic → order conversion metrics where exposed | `CONFIRMED` | `POST /v1/analytics/data` |
| Ordered units/revenue | demand outcome | `CONFIRMED` | `POST /v1/analytics/data` |
| Own-product search queries | phrases connected to listings | `CONFIRMED` | `/v1/analytics/product-queries` + `/details` |
| Query detail/history depth | granular query evidence | `PARTIAL` | methods confirmed; current field list/history/Premium restrictions require live-schema check |

## 3. Availability / logistics / replenishment

| Data layer | Нужные факты | Status | Evidence/gap |
|---|---|---:|---|
| FBO/FBS current stock | current sellable availability | `CONFIRMED` | `/v4/product/info/stocks` |
| Reserved stock | reservations affecting free quantity | `CONFIRMED` | stock response family |
| Warehouse-linked stock | product/warehouse ids | `CONFIRMED/PARTIAL` | stock method gives warehouse facts; dictionary/geography pending |
| Historical stockout intervals | when/where stock became zero | `PENDING` | if no history endpoint exists, future system must persist snapshots over time |
| FBO inbound supply | replenishment order/context | `CONFIRMED` | `/v3/supply-order/get`, `/v1/supply-order/details` |
| Supply delay/status history | why stockout persisted | `PARTIAL` | supply capability exists; exact current schema/status chronology must be verified |
| Cluster/geography | regional supply/delivery footprint | `PENDING` | exact current read surface pending |

## 4. Orders / fulfilment

| Data layer | Нужные факты | Status | Evidence/gap |
|---|---|---:|---|
| FBO postings | order/posting chronology/status | `CONFIRMED` | `/v3/posting/fbo/list` |
| FBS posting detail | products/price/posting facts | `CONFIRMED` | `/v3/posting/fbs/get` |
| Full FBS posting list/history | interval-wide FBS chronology | `PENDING/PARTIAL` | exact current list method/date window must be verified separately |
| Cancellation reason/status | cancellations after order | `PENDING` | blocking diagnostic surface |
| Returns | returns by product/reason/time | `PENDING` | blocking diagnostic surface |
| Claims/disputes | post-sale quality/logistics problems | `PENDING/DESIRABLE` | verify official read availability |

## 5. Price / promotion

| Data layer | Нужные факты | Status |
|---|---|---:|
| Current seller price | price at analysis point | `PENDING` |
| Old/marketing/card price | effective customer price semantics | `PENDING` |
| Price change chronology | before/after sales drop | `PENDING`; if no history API, future system must snapshot |
| Promotion membership | product included/excluded from promotion | `PENDING` |
| Promotion effect/funding | seller vs marketplace impact where exposed | `PENDING` |
| Price index/competitiveness | relative pricing evidence where exposed | `PENDING/DESIRABLE` |

## 6. Advertising

Отдельный Ozon advertising API contour уже подтверждён как существующий, но exact current read API/auth/stat schema ещё не закрыты.

| Data layer | Нужные факты | Status |
|---|---|---:|
| Campaign list/status/type | active/paused/stopped campaign state | `PENDING` |
| Campaign → product mapping | какие SKU рекламируются | `PENDING` |
| Impressions | ad delivery | `PENDING` |
| Clicks | ad traffic | `PENDING` |
| CTR | click-through effectiveness | `PENDING` |
| Spend | budget consumption | `PENDING` |
| CPC/CPM | cost mechanics | `PENDING` |
| Attributed orders/revenue | ad outcome | `PENDING` |
| Query/placement/category/region dimensions | root-cause localization where exposed | `PENDING` |
| Budget/bid facts | read-only context | `PENDING` |

**Advertising gate:** future bridge должен уметь только читать этот слой. Campaign/bid/budget mutations не входят в initial scope.

## 7. Finance / realized economics

| Data layer | Нужные факты | Status | Evidence/gap |
|---|---|---:|---|
| Transaction list | transaction-level accrual/deduction evidence | `CONFIRMED` | `/v3/finance/transaction/list` |
| Product/order reconciliation | link transactions with posting/product | `PARTIAL` | requires current field verification + posting joins |
| Commission/services/logistics | why net differs from gross revenue | `PARTIAL/PENDING` | transaction schema may expose part; realization/report surface pending |
| Realization/settlement reports | period-level realised economics | `PENDING` | exact current method pending |
| Storage/acceptance fees | fulfilment cost changes where exposed | `PENDING` |
| Payout/reconciliation | money actually settled | `PENDING` |

## 8. Customer voice / content evidence

| Data layer | Нужные факты | Status |
|---|---|---:|
| Rating/reviews | product quality/conversion/content evidence | `PENDING/DESIRABLE` |
| Questions | pre-purchase objections/FAQ | `PENDING/DESIRABLE` |
| Answer/status metadata | customer support/content gap | `PENDING/DESIRABLE` |

## 9. Root-cause model for «продажи просели за неделю»

Будущая аналитика должна сравнивать минимум requested interval vs control interval и проверять competing causes последовательно:

1. **Assortment/listing state:** товар существует, доступен, не hidden/moderation-blocked.
2. **Demand/discovery:** search queries, shows/impressions, sessions.
3. **Price/promo:** price/promotion changed or competitiveness deteriorated.
4. **Availability:** FBO/FBS stock, warehouse/cluster stockout, replenishment delay.
5. **Advertising:** campaign active, SKU still attached, impressions/clicks/spend did not collapse.
6. **Funnel:** traffic stable but conversion/order rate changed, или traffic itself collapsed.
7. **Orders/fulfilment:** posting volume/status anomalies.
8. **Cancellations/returns:** gross demand stayed stable but realised sales fell.
9. **Finance:** commissions/logistics/services/settlement changed net result.

Причина не считается доказанной только по корреляции одного показателя. Нужна temporal/product-level evidence из соседних слоёв.

## 10. Current completeness verdict

Для будущего weekly sales diagnostic уже официально подтверждена полезная часть demand/analytics + stocks + postings + finance transaction + FBO supply evidence.

Но для **полного магазина и полноценной causal analytics** Ozon research пока не завершён: blocking gaps — catalog/product master, prices/promotions, returns/cancellations, warehouse/geography dictionary, realization/reports и advertising exact API.

Поэтому roadmap `03A.3` остаётся `[~]`, а `03A.4` (разработка Ozon extension) — `[ ] НЕ НАЧАТО`.