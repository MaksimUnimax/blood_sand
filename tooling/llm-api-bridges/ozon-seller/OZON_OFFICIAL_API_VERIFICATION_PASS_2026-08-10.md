# Ozon Seller API — official-source verification pass

Дата: 2026-08-10  
Статус: **RESEARCH ONLY — extension development not started**

## Назначение

Этот файл — второй проход проверки Ozon API перед будущей разработкой read-only LLM bridge. Он не является implementation spec и не означает, что Ozon extension существует.

Цель прохода:

1. отделить методы, которые уже подтверждены непосредственно официальными материалами Ozon, от методов, которые встречаются в поисковом индексе/исторических обсуждениях, но ещё требуют проверки current schema;
2. определить полный набор классов данных, необходимый для импорта магазина и диагностики падения продаж;
3. не допустить попадания в будущий hard allowlist непроверенных, deprecated или mutation endpoints.

## Source policy

Source of truth для точного метода/пути/schema — только официальные Ozon sources: Seller API library/docs и `dev.ozon.ru`.

Сторонние SDK, Postman collections, generated clients, MCP-обёртки и поисковые snippets допускаются только как discovery hints. Они не переводят метод в `CONFIRMED`.

Текущая интерактивная library `docs.ozon.ru/api/seller/` из research environment по-прежнему не даёт стабильного машиночитаемого snapshot: переходы/redirect behavior мешают снять весь current OpenAPI surface одной операцией. Поэтому отсутствие exact schema в этом файле не заполняется догадками.

## A. Exact methods, уже подтверждённые официальным Ozon evidence

Эти методы остаются в исследовательском read-only allowlist-кандидате:

| Alias | Method/path | Зачем нужен |
|---|---|---|
| `product_stocks` | `POST /v4/product/info/stocks` | текущие остатки, FBO/FBS split, SKU/warehouse availability |
| `analytics_data` | `POST /v1/analytics/data` | показы/сессии/conversion/revenue/returns/ordered units в доступных dimensions |
| `product_queries` | `POST /v1/analytics/product-queries` | поисковые запросы собственных товаров |
| `product_query_details` | `POST /v1/analytics/product-queries/details` | детализация search-query analytics |
| `fbo_postings` | `POST /v3/posting/fbo/list` | FBO order/posting chronology и статусы |
| `fbs_posting` | `POST /v3/posting/fbs/get` | FBS posting detail и product-level facts |
| `finance_transactions` | `POST /v3/finance/transaction/list` | транзакции/начисления/удержания для reconciliation |
| `fbo_supply_order` | `/v3/supply-order/get` | данные по поставке FBO |
| `fbo_supply_details` | `/v1/supply-order/details` | детали поставки FBO/cluster context |

Подтверждён также отдельный advertising API contour Ozon, но exact read endpoints/auth/stat dimensions не считаются закрытыми до отдельной current-doc verification.

## B. Что обязательно должно быть исследовано до начала разработки Ozon extension

### B1. Catalog / listing master — BLOCKING

Нужен current official read surface, который позволяет получить весь seller assortment, а не один товар:

- seller `offer_id` / article;
- Ozon `product_id`;
- FBO/FBS SKU/listing identifiers;
- title/name;
- visibility/status/archived/hidden state, где API это позволяет;
- category/type;
- attributes/characteristics;
- barcode;
- dimensions/weight;
- media references;
- description/rich-content refs, если read API их отдаёт;
- moderation/errors/listing problems.

До current-schema confirmation **никакой guessed catalog endpoint не входит в production allowlist**.

### B2. Prices / discounts / promotions — BLOCKING

Нужно подтвердить current read API для:

- seller/base/current price;
- old price;
- marketplace/card price, если exposed;
- discount/promo participation;
- Ozon-funded vs seller-funded effects, если exposed;
- price index/competitiveness indicators, если API их отдаёт;
- promotion eligibility/participation read state.

Mutation methods изменения цены/акций в initial bridge запрещены.

### B3. Returns / cancellations / claims — BLOCKING

Нужно получить current official read surface и reason/status dictionaries для:

- return events;
- cancellation events;
- quantities/products;
- reason/status;
- FBO/FBS distinction;
- timestamps;
- logistics/rejection context, где exposed.

Это необходимо, потому что падение realised sales может происходить при стабильных gross orders из-за роста cancellations/returns.

### B4. Finance / realization / settlement / seller services — BLOCKING

Помимо уже подтверждённого transaction list нужно подтвердить current read methods/fields для:

- realization/settlement reports;
- commissions;
- logistics;
- storage/acceptance/other seller services, где exposed;
- accruals/deductions;
- payout/reconciliation periods.

### B5. Warehouses / clusters / geography / delivery availability — BLOCKING

Текущие stock records уже дают warehouse-related evidence, но для причинного анализа требуется проверить отдельный official surface для:

- seller warehouses;
- warehouse/cluster identifiers and dictionaries;
- geography/cluster mapping;
- regional availability/delivery context, если API это отдаёт.

Цель — диагностировать цепочку `stockout в регионе/кластере → ухудшение доступности → изменение ad delivery/traffic → orders down`.

### B6. Advertising API — BLOCKING FOR FULL SELLER ANALYTICS

Нужно отдельно снять current official advertising API surface и auth model. Для read-only аналитики нужны, если доступны:

- campaign list/status/type;
- products/SKU in campaign;
- campaign/product/day statistics;
- impressions;
- clicks;
- CTR;
- spend;
- CPC/CPM/other charging model;
- attributed orders/revenue/conversions;
- search/query/placement/category/region dimensions, если доступны;
- budgets/bids только как read facts.

Campaign create/edit, bid/budget writes и любые другие mutations в v1 запрещены.

### B7. Reviews / questions / customer voice — DESIRABLE, NOT REQUIRED FOR FIRST ASSORTMENT IMPORT

Проверить current read access к:

- reviews/rating;
- questions;
- answer/status metadata;
- complaint/problem themes.

Это полезно для content/FAQ/product passport и conversion diagnostics, но не должно блокировать сам первый импорт каталога, если Ozon ограничивает доступ.

## C. Для каждого будущего подтверждённого метода фиксировать не только endpoint

До перехода 03A.3 в `[x]` по каждому фактически используемому API нужны:

- exact HTTP method + path;
- auth contour/required credential type;
- required request fields;
- response identifiers/fields, нужные проекту;
- pagination model;
- maximum page size;
- date/history window;
- rate limits/quota behavior;
- account/subscription/Premium restrictions;
- documented deprecation/replacement status;
- whether response is JSON or generated/binary report;
- whether operation is pure read or creates a report/job (даже если business state не мутирует);
- known error/429 semantics relevant to exactly-once policy.

## D. Диагностический coverage target

Будущий Ozon bridge должен позволять LLM исследовать не одну метрику, а причинную цепочку:

`market/search demand → listing visibility/eligibility → price/promo → stock by fulfilment/warehouse/cluster → advertising delivery → impressions/clicks/traffic → funnel/conversion → orders/postings → cancellations/returns → replenishment → fees/finance`.

Если какой-либо слой Ozon официально не отдаёт, это фиксируется как data gap; он не подменяется scraping кабинета.

## E. Что сейчас считается выполненным и что нет

Выполнено на уровне research:

- подтверждён базовый Seller API auth contour и официальный API-only подход;
- подтверждены 9 read methods, перечисленных выше;
- подтверждены seller/product analytics и product-query analytics;
- подтверждены order/posting, finance transaction и FBO supply capability;
- зафиксирована необходимость отдельного advertising API audit;
- сформирован полный список blocking data classes для будущего магазина/аналитики.

Не выполнено:

- полный exact catalog API surface;
- prices/promotions exact read surface;
- returns/cancellations exact read surface;
- realization/reports exact read surface;
- warehouses/geography exact read surface;
- advertising exact read surface + auth;
- current per-method limits/history/pagination matrix.

Следовательно **03A.3 остаётся `[~]`**. Разработка Ozon extension (03A.4) не начинается до достаточного закрытия этих blocking пунктов.

## F. Следующий research pass

Следующий проход должен быть endpoint-by-endpoint по официальной library/current official announcements с приоритетом:

1. full product catalog/listing master;
2. price/promotion state;
3. returns/cancellations;
4. warehouses/clusters;
5. realization/reports;
6. advertising API;
7. reviews/questions;
8. limits/pagination/history matrix.

Каждый новый endpoint сначала попадает в audit с official-source provenance и только после current-schema verification — в будущую implementation specification.