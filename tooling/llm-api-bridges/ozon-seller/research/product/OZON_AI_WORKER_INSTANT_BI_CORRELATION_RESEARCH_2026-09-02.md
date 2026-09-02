# Ozon AI Worker — Instant BI and Cross-Report Correlation Research

Date: 2026-09-02
Status: EVIDENCE-BACKED PRODUCT EXPANSION
Authority: `OZON_AI_WORKER_COMMERCIAL_VALIDATION_TZ_2026-09-02.md`

## 1. Why this layer matters

The AI worker has a second commercial value in addition to diagnosis and recommendations:

> remove the manual work of navigating Ozon sections, downloading several reports, aligning dates/SKU identifiers, joining Seller and advertising data, sorting/ranking the result, and building a presentable report.

The user should be able to ask for a slice or correlation in natural language and receive the finished analytical view directly.

This is not a hypothetical pain. Public seller discussions and analytics products repeatedly describe manual Excel downloads, report reconciliation and data joining as work that users want removed.

## 2. Evidence ledger for instant BI / report-joining demand

### BI-E01 — Sellers struggle to reconcile Ozon reports

Source: MarketPlace Forum, `Научите пожалуйста разбираться с отчетами Озон`, 2026-02-03 onward.
URL: https://mp-forum.ru/threads/nauchite-pozhalujsta-razbiratsja-s-otchetami-ozon.13566/

Observed pain:
- seller reports that order count/revenue in `Юнит-экономика` does not match Ozon reports;
- discussion identifies different accounting dates (order vs payment) as a reason;
- seller then asks how to trace money received for a specific product.

Product implication:
- `sales vs finance/payout reconciliation` is sellable;
- AI must align accounting semantics rather than simply compare two raw totals.

### BI-E02 — Ozon finance analysis often requires XLSX download

Source: VC article about Ozon financial API/report workflow, 2026.
URL: https://vc.ru/marketplace/3027472-ozon-otklyuchil-metod-finansovogo-api-6-iyulya-chto-teper-delat-selleram

Observed workflow:
- seller downloads an XLSX from `Финансы → Экономика магазина → Скачать отчёт → По начислениям`;
- file contains operation date, accrual type and other line-level details;
- article explicitly positions file handoff + automated parsing as easier than manual API/report handling.

Product implication:
- grouped deductions/accruals and finance explanations are valuable instant-BI outputs.

### BI-E03 — Separate Ozon reports must be combined for true unit economics

Source: VC financial analytical cut example.
URL: https://vc.ru/marketplace/1840930-finansovyi-analiticheskii-srez-po-kabinetu-sellera-v-ozone-dalee-budet-vb-i-yamarket

Observed inputs listed separately:
- seller cost-price file;
- advertising reports;
- storage cost report;
- product volume report;
- stock/in-transit report;
- turnover data.

Product implication:
- `unit economics + ads + storage + stock + seller COGS` is exactly a cross-report AI-worker job.

### BI-E04 — Advertising direct vs associated orders require report interpretation

Source: VC, `Прямые и ассоциированные заказы в продвижении ozon`.
URL: https://vc.ru/marketplace/2140358-pryamye-i-assotsiirovannye-zakazy-na-ozon

Observed workflow:
- promotion analytics shows combined orders;
- seller downloads Excel to separate `Statistics` direct orders and `Union` associated orders;
- interpretation materially changes understanding of campaign effectiveness.

Product implication:
- direct/associated/total-sales comparison is valuable, but current Bridge coverage must be verified before claiming full support.

### BI-E05 — Sellers complain about transformed reports and identifier joins

Source: VC user feedback on Ozon analytics/reports.
URL: https://vc.ru/id3916952/1470966

Observed pain:
- reports have to be downloaded and reshaped;
- products must be matched between reports;
- mismatch between Ozon SKU and seller article increases manual work and error risk;
- requested analytics should be combined with current unit economics.

Product implication:
- identifier normalization and report correlation is commercial value, not implementation trivia.

### BI-E06 — Third-party services sell “no Excel/manual recalculation” for stock planning

Source: Stockstat.
URL: https://stockstat.ru/

Marketed value:
- one table with stock, sales and average daily orders by cluster;
- calculates how much and where to ship;
- explicit positioning: no Excel/manual recalculation;
- exports a ready application to Excel.

Product implication:
- `sales + stock + cluster + replenishment priority` is a validated sellable correlation.

### BI-E07 — Third-party analytics explicitly join sales, stock, in-transit and expenses

Source: Inspire.
URL: https://instats.online/

Marketed value:
- combines sales, stock, production, goods in transit and expenses;
- unit economics combines commission, logistics, storage, ads, tax and cost price;
- supply planning by Ozon cluster;
- Excel output.

Product implication:
- joined business views are a paid category in the market.

### BI-E08 — Seller tools explicitly sell Seller API + Performance API joining

Source: Anfisa Analytics case.
URL: https://anfisa-analytics.ru/cases/marketplace

Marketed problem:
- advertising lives separately from core seller/financial data;
- unit economics is incomplete without joining advertising and seller economics;
- one row per SKU is marketed as the desired result.

Product implication:
- `ads + sales/finance + SKU` correlation is central to the worker proposition.

### BI-E09 — Unit-economics tools market elimination of Excel

Source: Помощник продавца.
URL: https://helper-seller.ru/

Marketed value:
- profit per SKU with commission/logistics/advertising/tax;
- FBO stock map;
- “никаких выгрузок Excel, никаких ручных таблиц”.

Product implication:
- convenience alone has willingness-to-pay value.

### BI-E10 — Financial analytics products join many dimensions at SKU level

Source: Cifroz.
URL: https://cifroz.ru/

Marketed view:
- sales, returns, cost price, accruals, advertising, storage and allocated costs;
- ROI/profit by SKU;
- sales for 7/28 days, FBO stock and goods in transit.

Product implication:
- `profitability + inventory + turnover + storage` is a validated correlation family.

### BI-E11 — Ozon exposes stock location and movement in a dedicated report

Source: official Ozon Marketplace Telegram.
URL: https://t.me/s/ozonmarketplace?before=114

Official report describes:
- central/regional warehouse stock;
- goods in movement;
- delivery;
- inventory/defect states.

Product implication:
- stock state/location is distinct from sales/finance and useful to combine with them.

### BI-E12 — Search-query analytics is its own Ozon analytical surface

Source: Ozon Seller, `Новая аналитика по запросам товаров`.
URL: https://seller.ozon.ru/media/news/novaya-analitika-po-zaprosam-tovarov/

Official metrics include:
- queries where product was seen/bought;
- search volume/visibility;
- average search position;
- revenue from query-attributed orders;
- some metrics require Premium/Premium Plus.

Product implication:
- search analytics can be joined with ads, sales, stock, content and price to answer higher-value questions.

### BI-E13 — Sales-by-warehouse/region is a recognized analytical job

Source: Yandex Practicum overview of Ozon analytics.
URL: https://practicum.yandex.ru/blog/analitika-ozon-kak-ispolzovat/

Described seller analysis includes:
- revenue;
- bestsellers;
- order counts by periods/regions;
- sales by warehouse;
- traffic and conversion metrics.

Product implication:
- warehouse ranking is a natural-language analytics request worth including even if current Bridge path requires multi-step derivation.

## 3. Instant-BI query families to add to the commercial benchmark

These are not “diagnose why” requests. Their sellable value is speed and removing navigation/export/sort work.

### Standard seller

- `Дай продажи за вчера: выручка, количество заказанных единиц и топ товаров.`
- `Покажи продажи за последние 30 дней по дням и выдели самые сильные и слабые дни.`
- `Дай топ-20 SKU по выручке за неделю, от большего к меньшему.`
- `Дай продажи за вчера по складам от большего к меньшему.`
- `Покажи текущие остатки FBO по складам и SKU.`
- `Покажи оборачиваемость и запас в днях; сначала товары, которые закончатся раньше всего.`
- `Дай рекламные расходы за неделю по кампаниям от большего к меньшему.`
- `Дай рекламную статистику по SKU за неделю.`
- `Разложи финансовые начисления и удержания за неделю по типам и сумме.`
- `Покажи возвраты и отмены за месяц по товарам.`
- `Покажи мои активные поставки: что в пути, что принято, что зависло.`

### Premium seller

- `Дай поисковые запросы по этому SKU с выручкой и средней позицией.`
- `Покажи изменение позиций по главным запросам за две недели.`
- `Дай воронку по SKU за две недели: показы → просмотры → корзина → заказы → доставлено → возвраты.`
- `Покажи топ запросов маркетплейса в моей нише, которых нет в моём спросе/карточке.`

## 4. Cross-report correlation families to add

### C1 — Sales × stock × turnover

Question:
`Где товар продаётся быстрее всего, где закончится раньше и куда везти в первую очередь?`

Value:
replaces separate sales/stock/turnover analysis.

### C2 — Sales-by-location × warehouse stock

Question:
`Дай продажи по складам/кластерам и рядом текущие остатки. Где спрос высокий, а запас маленький?`

Value:
warehouse allocation/replenishment.

### C3 — Advertising × seller sales

Question:
`По каким SKU есть рекламные расходы, но продажи/выручка не оправдывают расход?`

Value:
joins Performance API with Seller analytics.

### C4 — Advertising × stock

Question:
`Какие товары я сейчас рекламирую, хотя они заканчиваются или уже отсутствуют на нужных складах?`

Value:
prevents paying for traffic that cannot convert due to availability.

### C5 — Advertising × finance × returns × COGS

Question:
`Посчитай реальную прибыль по SKU после комиссии, логистики, рекламы, возвратов и моей себестоимости.`

Value:
true unit economics, one of the most clearly monetized market jobs.

### C6 — Advertising direct/associated × total seller sales

Question:
`Сколько продаж реклама дала напрямую, сколько ассоциировано, и какую долю всех продаж товара она реально сопровождает?`

Value:
avoids misleading interpretation of combined advertising orders.

Coverage note:
current Bridge must be checked for exact direct-vs-associated fields. Do not pre-claim full support.

### C7 — Sales × finance/payout dates

Question:
`Почему продажи за этот период не сходятся с выплатой? Сопоставь заказы, начисления и даты и объясни расхождение.`

Value:
reconciles different accounting views; directly evidenced seller pain.

### C8 — Price/promotion × sales before/after × unit economics

Question:
`После участия в акции продажи выросли, но заработал ли я больше? Сравни период до/после с учётом скидки и расходов.`

Value:
turns promotion participation into profit decision.

### C9 — Returns/cancellations × sales × reviews/rating

Question:
`Какие SKU дают оборот, но съедают его возвратами/отменами и одновременно получают плохие сигналы от покупателей?`

Value:
quality/risk prioritization.

### C10 — Content/visibility × sales/conversion

Question:
`Какие карточки имеют плохой контент-рейтинг/видимость и одновременно теряют продажи? Что исправлять первым?`

Value:
prioritizes content work by business impact rather than score alone.

### C11 — Search position/query × advertising × sales

Question:
`Где реклама компенсирует слабую органику, а где органика уже сильная и рекламный бюджет можно пересмотреть?`

Value:
Premium professional budget allocation.

### C12 — Supply acceptance × stock × visibility

Question:
`Какие товары уже приехали/приняты, но ещё не появились в доступном остатке или продаже?`

Value:
reduces supply-to-sale delay diagnosis.

### C13 — FBS error index × offending postings × finance cost

Question:
`Какие ошибки FBS стоят мне денег: покажи отправления, которые испортили индекс, и связанные расходы/штрафы, если они доступны.`

Value:
connects operational quality to monetary impact.

### C14 — Stock × COGS × turnover × storage/finance

Question:
`Сколько денег заморожено в медленно оборачиваемом товаре и где хранение начинает съедать экономику?`

Value:
working-capital and storage-risk view; requires seller COGS for capital valuation.

### C15 — Advertising × listing readiness

Question:
`На какие товары я трачу рекламу, хотя карточка невидима, плохо заполнена или имеет складские ограничения?`

Value:
joins ads with catalog/visibility/logistics diagnostics.

### C16 — Sales anomaly × calendar/external events

Question:
`Сравни провальные/сильные дни продаж с рекламой, остатками и внешними событиями/праздниками. Какие объяснения подтверждаются данными?`

Value:
uses the AI worker’s web/context advantage over a closed dashboard.

Causality note:
external timing correlation is a hypothesis unless supported by stronger evidence.

## 5. Output/deliverable variants to benchmark separately

The same business answer may be requested as:

1. concise chat explanation;
2. sorted Markdown table;
3. graph/chart;
4. downloadable CSV;
5. downloadable XLSX with sheets such as `Summary`, `By SKU`, `By Warehouse`, `Evidence`;
6. PDF management/client report;
7. DOCX/Markdown report;
8. PPTX client presentation;
9. JSON for machine processing;
10. XML for machine processing.

JSON/XML/CSV-as-text must be distinguished from a true downloadable file.

## 6. Product conclusion from this pass

The sellable promise is broader than “AI answers questions about Ozon”. A second concrete promise is:

> Ask for the exact analytical cut or correlation you need. The worker fetches the cabinet data, joins the relevant Ozon surfaces, sorts/calculates it and returns the result in the format you want — without forcing you to download and manually reconcile Ozon reports.

This value should be tested explicitly in the provider benchmark rather than hidden inside diagnostic rows.
