# Ozon Seller API capability audit — 2026-08-10

Статус: **PHASE 1 / OFFICIAL-SOURCE GATE**

Цель: определить полный read-only data surface, который нужен `OZON_API_V1` для импорта каталога и причинной аналитики продавца.

## Source-of-truth policy

Канонический источник — текущая официальная Ozon Seller API documentation (`docs.ozon.ru/api/seller`) и фактический response официального `api-seller.ozon.ru` под credentials владельца.

В текущей исследовательской web-среде официальный Seller API reference попадает в redirect-loop и не отдаёт надёжно полный method registry. Поэтому сторонние Postman collections, SDK и зеркала используются только как discovery hints и **не повышаются до authoritative endpoint/schema facts**.

До получения официального Swagger/reference или live authenticated smoke запрещено:

- объявлять сторонний endpoint list «полным текущим Ozon API»;
- фиксировать rate limits по сторонним SDK как канон;
- строить production allowlist на непроверенной версии;
- делать write/mutation methods.

## Что bridge обязан уметь получить

### 1. Seller/account identity

Нужно связать API credentials с конкретным продавцом/кабинетом и сохранить безопасный account fingerprint без секрета.

### 2. Full assortment

Для всех listings/SKU нужны, где API предоставляет:

- seller article / offer id;
- Ozon product/listing identifiers and SKU identifiers;
- name/title;
- status / visibility / moderation state;
- category/type;
- attributes/specifications;
- variant relationships;
- barcodes;
- dimensions/weight;
- images/media references;
- descriptions/rich content where readable;
- FBO/FBS source identifiers.

Это основной вход для Product/SKU/Listing master будущего сайта.

### 3. Prices and promotions

Read-only snapshot по товарам:

- seller price;
- old/base price where exposed;
- Ozon/marketing discount effects;
- price index/recommended/minimum constraints where exposed;
- promotion participation;
- campaign/action identifiers relevant to actual selling price.

### 4. Stocks and availability

Нужна максимально детальная доступная гранулярность:

- warehouse/source;
- FBO/FBS distinction;
- on-hand/present;
- reserved;
- available-to-sell if exposed;
- inbound/coming if exposed;
- snapshot timestamp.

Критически важно для диагностики региональных просадок: товар может существовать в каталоге, но исчезнуть из эффективной доступности из-за stock geography.

### 5. Orders / postings / sales lifecycle

Нужны события и/или текущие записи:

- order/posting id;
- created/order time;
- products/SKU and quantities;
- fulfillment schema;
- warehouse/source;
- status transitions;
- cancellations;
- delivery state;
- financial data attached to posting where exposed.

Цель — отличать demand loss от fulfillment/cancellation loss.

### 6. Returns / cancellations

Нужны product-level причины и статусы там, где API их раскрывает:

- return id / posting link;
- SKU/product;
- reason/category;
- state;
- dates;
- quantity/value impact.

### 7. Finance / accruals / commissions / services

Нужен transaction-level слой, а не только revenue total:

- accrual for sale;
- commissions;
- logistics/delivery;
- return logistics;
- storage/other services where exposed;
- promotion/service charges;
- operation type/date;
- posting/order/SKU linkage.

Это позволяет считать contribution margin и объяснять «продажи есть, прибыль просела».

### 8. Seller analytics / funnel

Нужен ежедневный product/SKU dimension, где Ozon предоставляет:

- search/product impressions;
- card views;
- add-to-cart;
- orders/ordered units;
- ordered revenue;
- conversion stages;
- cancellations/returns if included;
- day dimension;
- SKU/product dimension.

Без этого нельзя отделить падение спроса от падения availability/conversion.

### 9. Advertising / Performance

Promotion API должен быть исследован отдельно от Seller API, поскольку реклама может иметь отдельные credentials/scopes/API surface.

Нужны read-only данные минимум:

- campaigns;
- campaign status/type/strategy;
- products in campaign;
- daily spend;
- impressions;
- clicks;
- CTR;
- CPC/CPM where applicable;
- orders/revenue/DRR/attributed conversions where exposed;
- search/query/placement breakdown where exposed;
- budget and delivery constraints.

Пример диагностики: stock loss → reduced regional availability → lower ad eligibility/delivery → fewer impressions/clicks → fewer orders.

### 10. Reviews/questions/customer evidence

Если текущий API scope позволяет read-only retrieval:

- rating/review counts;
- reviews;
- questions;
- product linkage;
- dates/status.

Это полезно для content passport, objections, FAQ и Page Jobs.

### 11. Warehouses / logistics reference data

Нужны справочники warehouse/location/schema identifiers, чтобы stock/order/ad evidence можно было связать по географии и fulfillment model.

### 12. Reports

Если часть data surface доступна только асинхронными report jobs:

- explicit create-report operation;
- report id;
- poll/status operation;
- final download/result;
- all HTTP calls counted and exposed in result evidence;
- no hidden retry/poll loop without declared policy.

## `OZON_API_V1` design consequences

1. Credentials: local-only `Client-Id` + `Api-Key`; never emitted to LLM/report/GitHub.
2. Base host hardcoded/allowlisted; no arbitrary URL.
3. Provider operation name maps to a verified hardcoded endpoint/method/schema.
4. Read-only allowlist for v1.
5. Pagination is explicit in evidence. A high-level `collect_*` operation may perform multiple provider HTTP calls only if the result envelope reports every page/request, count and partial failure.
6. No automatic retries for mutation because mutations are disabled. For reads, retry policy must still be explicit and bounded; first implementation defaults to no hidden retries.
7. Large responses require page streaming/size ceilings and deterministic continuation cursors rather than truncating silently.
8. Every result carries `request_id`, provider operation, account fingerprint, requested period/filter, HTTP calls, elapsed times, pagination and raw/normalized references.

## Diagnostic bundle required after live API access

Weekly sales-drop investigation should collect and join:

`catalog/status → prices → stocks by warehouse → orders/postings → cancellations/returns → finance → funnel analytics → advertising → promotion state`

and then compare current week vs baseline/comparison period at seller, family, SKU and warehouse dimensions.

## Gate to complete this audit

03A.3 is not complete until the current official Ozon method registry is captured and each relevant method records:

- exact HTTP method/path;
- auth/scopes/access restrictions;
- request fields;
- response fields used by us;
- period/history constraints;
- pagination/report workflow;
- rate limit from official source or observed official headers/errors;
- read/write classification;
- applicability to assortment/site/diagnostics;
- smoke status under owner credentials.

No production Ozon endpoint allowlist is committed before that gate.
