# Ozon AI Worker — Real Demand Source Ledger

Date: 2026-09-02
Status: ACTIVE EVIDENCE LEDGER
Purpose: preserve evidence used to build the commercial query core. Demand is collected before mapping it to Bridge capabilities.

## Evidence quality convention

- `A` — strong recurring commercial signal: multiple independent sources and/or direct paid-service/product evidence plus seller evidence.
- `B` — credible single strong source or official feature evidence; useful but less independently repeated.
- `C` — weak/adjacent evidence; do not use alone to admit a query into the commercial core.

## Seller problem evidence

### SRC-S01 — unexplained collapse in sales
Quality: A
Source: MarketPlace Forum, `Обвал продаж`
URL: https://mp-forum.ru/threads/obval-prodazh.14194/
Observed job: seller reports ~90% sales collapse although advertising strategy, prices and stock allegedly did not change; asks what can explain the drop. Discussion also considers seasonality and broader demand context.
Supports query families: root-cause sales diagnosis; external/seasonal-context correlation; advertising-vs-demand diagnosis.

### SRC-S02 — seasonality / external context as sales explanation
Quality: A
Sources:
- https://mp-forum.ru/threads/obval-prodazh.14194/
- https://mp-forum.ru/threads/s-kakogo-mesjaca-stoit-vyxodit-na-sprodazhi-s-sezonnym-tovarom-vesna-osen.957/
Observed job: sellers actively ask whether sales changes are caused by seasonality, school/holiday periods, vacations, weather/heat and other external demand effects.
Supports: compare internal cabinet evidence with external/calendar context without presenting correlation as proven causation.

### SRC-S03 — FBO stock disappears without visible sales
Quality: A
Source: https://mp-forum.ru/threads/tovar-ischezaet-s-ostatkov-fbo.13246/
Observed job: seller sees units disappear from FBO stock while another statement still shows stock and there were no sales; wants to know what happened and how to preserve evidence.
Supports: stock-loss investigation, stock/source reconciliation, movement/status diagnosis, escalation evidence.

### SRC-S04 — distribution across warehouses / shortage vs overstock
Quality: A
Source: https://mp-forum.ru/threads/raspredelenie-zapasov-po-skladam.11028/
Observed job: seller asks how to distribute inventory, see lost profit from shortages and losses from overstocked warehouses.
Supports: replenishment priority, stock allocation, days-of-stock/turnover risk, warehouse planning.

### SRC-S05 — seller needs historical FBO shipment/stock view
Quality: B
Source: https://mp-forum.ru/threads/ostatki-po-fbo.2263/
Observed job: seller asks how much of a product was sent to different warehouses/clusters and needs supply + warehouse-stock context.
Supports: stock/supply reconciliation and warehouse distribution.

### SRC-S06 — FBO supply delivered but not accepted for weeks
Quality: A
Source: https://mp-forum.ru/threads/fbo-ne-prinimajut-postavlennyj-tovar.13692/
Observed job: supply delivered but not accepted / not available for sale for more than a month; support gives generic responses.
Supports: supply state diagnosis, act/status checks, evidence for support escalation.

### SRC-S07 — FBO supply/drop-off operational error
Quality: B
Source: https://mp-forum.ru/threads/postavka-fbo.14073/
Observed job: seller repeatedly cannot hand over FBO supply because barcode/process state fails; wants to understand why and what to check.
Supports: supply status, cargo/label/timeslot/warehouse diagnostics.

### SRC-S08 — product is approved and in stock but unavailable/not shown
Quality: A
Source: https://mp-forum.ru/threads/tovar-ne-dostavljaetsja-v-vash-region.13515/
Observed job: listing passed moderation, documents provided, product says selling and has stock, but does not appear in shop / delivery unavailable in region.
Supports: visibility + stock + warehouse/logistics/geography investigation.

### SRC-S09 — high DRR and sales disappear without advertising
Quality: A
Sources:
- https://mp-forum.ru/threads/reklamnye-sovety.13975/
- https://mp-forum.ru/threads/optimalnyj-drr.10876/
Observed job: seller sees DRR around 18–30%, does not understand why, and says orders tend to zero when ads are disabled.
Supports: DRR diagnosis, ad dependency, campaign/SKU efficiency, card/organic-vs-paid investigation.

### SRC-S10 — promotion strategy / whether to increase promotion share or use actions
Quality: A
Source: https://mp-forum.ru/threads/prodvizhenie.14158/
Observed job: sellers compare promotion levels, actions and ad strategies and need evidence-backed choice rather than generic advice.
Supports: campaign efficiency, promotion/action comparison, price + advertising joint analysis.

### SRC-S11 — card/content quality is part of ad-performance diagnosis
Quality: A
Source: https://mp-forum.ru/threads/reklamnye-sovety.13975/
Observed job: in response to poor ad economics sellers check content rating and card quality, not just bids.
Supports: multi-factor ads diagnosis, content-rating/card improvement prioritization.

### SRC-S12 — seller cannot reconcile payouts and Ozon expenses
Quality: A
Sources:
- https://mp-forum.ru/threads/vyplaty-prodazhi-voznagrazhdenie-ozon-i-bally-za-skidki.14045/
- https://mp-forum.ru/threads/nauchite-pozhalujsta-razbiratsja-s-otchetami-ozon.13566/
Observed job: seller cannot understand why payout does not match sales / how expenses and reward/discount points affect money received.
Supports: payout explanation, transaction/accrual reconciliation, date-basis explanation, finance investigation.

### SRC-S13 — commission/logistics/ad costs can make SKU unprofitable
Quality: A
Sources:
- https://mp-forum.ru/threads/voznagrazhdenie-ozon-ili-raby-ozona.12494/
- https://mp-forum.ru/threads/kak-zhe-zae-kak-ja-potratil-shestiznachnye-summy-i-ne-zarabotal-ni-ja.13688/
- https://mp-forum.ru/threads/vsjo-po-300-r-ili-chem-deshevle-tovar-tem-bolshe-pribyli.14148/
Observed job: sellers need to know real profit after Ozon commission, logistics, returns, ads and cost price rather than turnover alone.
Supports: SKU profitability / unit economics. Important limitation: Ozon does not know all seller-side costs such as cost price/tax unless provided separately.

### SRC-S14 — pricing/discount mechanics cause confusion and margin risk
Quality: A
Sources:
- https://mp-forum.ru/threads/bally-za-skidki.14039/
- https://mp-forum.ru/threads/snizhenie-skidok-ozon-na-tovary.14048/
- https://mp-forum.ru/threads/indeks-cen-ozon-ijul-2026-goda.14152/
Observed job: seller wants to understand unexpected effective price/discount/index behavior and whether a price/action remains profitable.
Supports: current price/action state, promotion participation, price strategy, profitability risk.

### SRC-S15 — reviews and ratings affect seller decisions
Quality: A
Sources:
- https://mp-forum.ru/threads/pochemu-ne-pishut-xoroshie-otzyvy.1942/
- https://mp-forum.ru/threads/chto-budet-esli-rejting-prodavca-3-5.198/
- https://mp-forum.ru/threads/negativnye-otzyvy-konkurentov.1351/
Observed job: sellers care about review volume, negative reviews and rating consequences and need to prioritize attention.
Supports: review/question/rating monitoring; text access may be privacy/subscription gated.

### SRC-S16 — FBS returns need operational attention
Quality: B
Source: https://mp-forum.ru/threads/est-reshenie-problemy.3010/
Observed job: seller has FBS returns waiting at pickup and wants to know what can be done / retrieve barcode.
Supports: return giveout state, barcode, active return shipments.

### SRC-S17 — Ozon service outage can explain cabinet anomalies
Quality: B
Source: https://mp-forum.ru/threads/20-05-26-ne-rabotaet-ozon.14062/
Observed job: multiple sellers report broad Ozon cabinet outage affecting products, analytics, settings and FBO.
Supports: external/current Ozon-status context during anomaly diagnosis.

## External incident evidence

### SRC-X01 — real Ozon warehouse fire / attack affecting seller goods
Quality: A
Sources:
- Ozon HQ public channel: https://t.me/s/ozonhq/1486
- Ozon Marketplace public channel: https://t.me/s/ozonmarketplace/3247
Observed facts: Ozon reported a logistics center fire after an attack, stopped warehouse operations, hid goods stored there from storefront, planned inventory of surviving/damaged goods, rerouted logistics, cancelled affected supply slots/orders as needed and promised seller updates/compensation handling.
Supports a directly sellable natural-language query: `На пострадавшем складе был мой товар? Что с ним сейчас и что мне делать?`
This is explicit proof that external public incident context + private cabinet data can be jointly valuable.

### SRC-X02 — holiday/operational rule changes affect seller workflow
Quality: B
Source: https://oborot.ru/forum/ozon-razreshil-selleram-otdyhat-na-majskie-prazdniki-no-est-nyuans-obsuzhdenie-i53561.html
Observed job: seller operations and penalties/dispatch behavior depend on holiday-specific marketplace rules.
Supports: external current-policy/event context in operational diagnosis.

## Official Ozon demand/feature evidence

### SRC-O01 — search-query analytics exists because sellers need demand/visibility evidence
Quality: A
Source: https://seller.ozon.ru/media/news/novaya-analitika-po-zaprosam-tovarov/
Official value proposition: understand which buyer queries generate views/purchases, demand volume, average position and revenue; part of metrics is Premium/Premium Plus dependent.
Supports: search terms driving sales, position loss, content/SEO improvement, Premium query families.

### SRC-O02 — promotion-code effectiveness is an explicit analytics job
Quality: B
Source: https://seller.ozon.ru/media/news/ocenivajte-effektivnost-vashih-promokodov/
Official value proposition: orders, uses, conversion, sales and discount amount per promotion code; intended to identify which external source/blogger brings better traffic.
Supports: promotion effectiveness / external traffic attribution where data is available.

### SRC-O03 — competitive bid is a real ad-management input
Quality: B
Source: https://seller.ozon.ru/media/news/posovetuem-optimalnye-stavki-dlya-reklamy-v-poiske/
Official value proposition: competitive bid helps choose a rate that can produce results without exhausting budget too quickly.
Supports: bid adequacy and advertising optimization questions.

### SRC-O04 — paid analytics entitlement is real and feature-specific
Quality: A
Sources:
- https://seller.ozon.ru/media/news/novaya-analitika-po-zaprosam-tovarov/
- current Bridge entitlement registry `shared/ozon_entitlements.js`
Evidence: Premium family gates some analytics metrics/features; current registry explicitly knows PREMIUM, PREMIUM_LITE, PREMIUM_PLUS and PREMIUM_PRO and contains operation/feature-level restrictions.
Supports required segmentation into standard vs Premium capabilities.

## Paid service / manager-market evidence

### SRC-A01 — Tovaris sells full cabinet management
Quality: A
Source: https://tovaris.agency/
Commercial offer includes advertising, cards, analytics, logistics, reviews, reports, P&L, profitability, pricing, supplies and advertising strategy.
Observed customer pains include few orders, ad budget waste, low buyout and poor card conversion.
Supports service-provider query families and proves customers pay to delegate these jobs.

### SRC-A02 — Intensa sells full marketplace management at substantial monthly price
Quality: A
Source: https://intensa.ru/services/marketplaces/
Offer: cards/content, advertising, prices/actions, supplies and analytics; pricing tiers shown from roughly 50k to 150k RUB/month per marketplace.
Supports willingness-to-pay for integrated management, not individual API access.

### SRC-A03 — LEVS sells Ozon cabinet management / daily reporting
Quality: A
Source: https://levso.ru/
Offer includes unit economics, cards, actions, ads, cluster supplies, reviews/questions/chats, support communication and daily reporting. Listed offer: around 90k RUB + percentage of turnover.
Supports daily audit, reporting, ad/price/supply/review management queries.

### SRC-A04 — Market Boost sells ongoing Ozon management
Quality: A
Source: https://market-boost.ru/
Offer includes unit economics, margin control, promotions, pricing, stock control, supply calculation/control, analytics, reviews/questions, weekly reporting and manager availability; displayed ongoing service from tens of thousands RUB/month.
Supports professional service demand.

### SRC-A05 — freelancer/manager sells cabinet management
Quality: B
Source: https://www.fl.ru/uslugi-freelancera/5558/polnoe-vedenie-kabineta-ozon.html
Offer includes promotion/ad strategy, cards/SEO, supplies, prices/actions, sales/competitor analysis, stock control, supply planning and support work; listed fixed monthly service price.
Supports that the same jobs are sold even outside agencies.

### SRC-A06 — manager role is explicitly an operating manager, not a dashboard viewer
Quality: B
Source: https://mpagency.ru/glossary/menedzher-marketplejsov/
Description: manager runs seller store, ads, sales analytics and supplies and monitors stock daily.
Supports AI-worker positioning as partial substitute/assistant for operational manager work.

## Analytics-product willingness-to-pay evidence

### SRC-P01 — Ozon Bank analytics aggregates profit, sales and SKU economics
Quality: A
Source: https://finance.ozon.ru/business/rko/marketpleysy/analitika-prodazh
Capabilities marketed: income/expenses/profit, sales dynamics, returns, margin, SKU analytics, ABC analysis, multiple stores.
Supports: seller willingness to use unified analytics instead of raw reports.

### SRC-P02 — ReStat sells automated Ozon analytics + AI suggestions
Quality: A
Source: https://restat.pro/analytics-ozon
Capabilities marketed: per-order profit, ad ROI, what to ship to warehouses, price/action monitoring, morning reports, low-stock/return/action alerts and AI suggestions. Public price shown around 3,000 RUB / 30 days.
Supports: daily health, profit, ads, stock planning and AI recommendation demand.

### SRC-P03 — Cifroz markets SKU profit, stock risk and advertising analytics
Quality: A
Source: https://cifroz.ru/
Capabilities marketed: SKU profit/ROI, FBO stock and paid-storage risk, accrual structure, sales/CTR/search position and ad analytics.
Supports: integrated operational + financial + advertising diagnosis.

### SRC-P04 — Metrik Lab markets multi-shop command center
Quality: A
Source: https://www.metriklab.ru/
Capabilities marketed: sales, buyouts, advertising DRR per item, funnel, unit economics, stock, tariffs, reviews and multiple companies/stores.
Supports: professional multi-client/multi-store portfolio query demand.

### SRC-P05 — MP Index sells daily summary, seasonality, advertising, returns and AI recommendations
Quality: A
Source: https://mp-index.ru/pricing.php
Paid capability list includes AI recommendations, cash flow, cost, ad efficiency, seasonality, P&L, stock update, daily summary, returns/cancellations, comparison and multiple stores.
Supports: evidence that sellers pay for integrated answers/monitoring, not isolated raw metrics.

### SRC-P06 — SalesHive targets sellers/managers of multiple cabinets
Quality: B
Source: https://saleshive.ru/about
Capabilities: dashboard, finance, unit economics per SKU, advertising/content, stocks, plan/fact and reviews; explicitly suitable for managers of several cabinets.
Supports service-provider multi-cabinet reporting/analysis demand.

## Core demand themes admitted from current corpus

The following demand families currently meet A/B evidence threshold and may be normalized into benchmark queries:

1. Daily cabinet health / `what needs attention`.
2. Root-cause diagnosis of sales collapse/anomaly.
3. External incident → private-cabinet impact investigation.
4. FBO stock disappearance/reconciliation.
5. Stock shortage/overstock and replenishment priority.
6. Warehouse/cluster allocation and supply planning.
7. FBO supply delayed/not accepted / operational state.
8. Product visible/selling in cabinet but unavailable to customer.
9. Advertising DRR/waste and ad-dependency diagnosis.
10. Campaign/SKU/bid efficiency.
11. Card/content quality as sales/ad factor.
12. Payout/accrual/transaction explanation.
13. SKU unit economics/profitability with seller-side cost input where required.
14. Price/discount/action profitability and unexpected price state.
15. Returns/cancellations and return handling.
16. Rating/reviews/questions attention prioritization.
17. Search queries, position, visibility and SEO opportunity (Premium-dependent in part).
18. Search-vs-ad / organic-vs-paid diagnosis (Premium professional layer).
19. Daily/weekly client reporting for service providers.
20. Multi-client/multi-store monitoring for agencies/managers.
21. Period comparison / what changed after management actions.
22. External seasonality/holiday/outage context as an investigated hypothesis.

## Important evidence conclusion

The market already pays for the work categories the AI worker targets. Agencies sell integrated Ozon cabinet management for tens of thousands of RUB per month, while analytics products sell automated visibility into profit, ads, stocks, supplies, returns and daily alerts for recurring subscription fees. Therefore the commercial-validation problem is not `is this work valuable?`; it is `can AI + Bridge solve enough of these paid jobs reliably, conversationally and across user-preferred AI providers to create a differentiated sellable worker?`
