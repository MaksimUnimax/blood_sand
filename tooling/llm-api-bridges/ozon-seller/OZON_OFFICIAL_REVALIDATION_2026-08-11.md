# Ozon Seller API — official revalidation pass — 2026-08-11

Статус: **RESEARCH PASS — 03A.3 остаётся IN PROGRESS; extension development NOT STARTED**

Цель прохода: повторно проверить только current official Ozon evidence перед разработкой read-only LLM↔Ozon bridge и уточнить blocking gaps для полного магазина и seller diagnostics.

## Source policy

В статус `CONFIRMED` exact method/path/schema переводится только по current official Ozon source (`dev.ozon.ru` / official Seller API library). Сторонние SDK, Postman collections, generated clients, Apifox и поисковые сниппеты сторонних сайтов допустимы только как discovery hints и **не являются authority**.

Никакой endpoint из discovery hint не переносится в research allowlist или future implementation spec без official provenance.

## 1. Fresh library-access check

Official interactive Seller API library:

- `https://docs.ozon.ru/api/seller/`

в текущей research environment снова не удалось получить как стабильный browsable snapshot: доступ уходит в redirect/error loop.

Следствие: точные current schemas, pagination, limits/history и account restrictions по blocking families нельзя честно закрыть через эту поверхность в данном проходе.

Это **не разрешение** заменять official library сторонними зеркалами.

## 2. Fresh official confirmations

### 2.1 Public API only; no cabinet/site scraping — CONFIRMED

Official Ozon for dev material от 2024-08-07 прямо требует для автоматизации использовать публичные Ozon API, например Seller API, и отдельно запрещает automated scraping Ozon surfaces (`www.ozon.ru`, `api.ozon.ru`, `xapi.ozon.ru`) и ПО, имитирующее пользователя в кабинете (например Selenium WebDriver).

Source:

- https://dev.ozon.ru/start/298-Seller-API-kak-izbezhat-blokirovok/

Disposition for future bridge:

- hardcoded official API hosts only;
- no cabinet scraping fallback;
- no arbitrary URL transport;
- failure to find an API remains an explicit data gap.

### 2.2 `POST /v4/product/info/stocks` — current stock family remains CONFIRMED

Current official Ozon community material dated 2025-10-15 explicitly identifies method “Информация о количестве товаров” as:

- `POST /v4/product/info/stocks`

and shows response fields including:

- `product_id`;
- `offer_id`;
- FBO/FBS blocks;
- `present`;
- `reserved`;
- `sku`;
- `shipment_type`;
- `warehouse_ids`.

Source:

- https://dev.ozon.ru/community/1747-v4-product-info-stocks-daet-ne-korrektnye-ostatki/

Important: this reconfirms that the old historical `/v3/product/info/stocks` example must not be copied into future implementation.

### 2.3 FBO supply methods — current 2026 confirmation

Official Ozon change notice dated 2026-01-19 confirms these methods:

- `/v3/supply-order/get`;
- `/v1/supply-order/details`.

The notice says cross-dock changes take effect 2026-02-16 and adds `macrolocal_cluster_id`; for cross-dock, `warehouse_id` loses relevance and the cluster identifier becomes the important field.

Source:

- https://dev.ozon.ru/news/647-Izmeneniia-v-metodakh-Seller-API-pri-rabote-s-postavkami-FBO/

Disposition:

- future diagnostics cannot assume historical warehouse semantics for cross-dock supply;
- cluster/macrolocal evidence must be preserved where returned.

### 2.4 OAuth without an application does not exist — CONFIRMED

Official Ozon community topic dated 2026-05-27 asks whether OAuth-token authorization is possible without creating a private/public application. Ozon moderator answer: such a method does not exist.

Source:

- https://dev.ozon.ru/community/2154-Avtorizatsiia-cherez-OAuth-token/

Disposition:

- v1 local bridge remains based on seller-created Seller API credentials stored locally;
- OAuth is a separate future integration path requiring an Ozon application, not an implicit replacement for `Client-Id` + `Api-Key`.

### 2.5 Own seller promotions/actions — CAPABILITY CONFIRMED / EXACT READ ENDPOINTS PENDING

Official Ozon community topic dated 2026-02-27 concerns `/v1/seller-actions/products/add`. Ozon project manager states that methods for managing seller's own promotions are working and documented in the library under `БЕТА-МЕТОДЫ → Акции продавца`.

Source:

- https://dev.ozon.ru/community/1942-v1-seller-actions-products-add-404-poka/

What this proves:

- current seller-actions/promotions API capability exists;
- this surface is not merely historical speculation.

What this does **not** prove:

- exact read-only list/detail/product-participation endpoints;
- response schemas;
- pagination;
- auth/account restrictions;
- whether every needed promotion fact is exposed read-only.

Therefore prices/promotions stay blocking and **no seller-actions method is added to the read allowlist from this evidence alone**.

### 2.6 Current cancellation integration need — CURRENT NEED CONFIRMED / ENDPOINT PENDING

Current official Seller API community page contains a 2026-05-26 topic titled `Частичная отмена FBS - как определить через API`.

Source:

- https://dev.ozon.ru/community?category_id=2&page=4

This is useful evidence that partial FBS cancellation detection is a live integration problem in the current Seller API ecosystem.

However the public page/search surface available in this research pass does not provide a resolved exact endpoint/schema. Therefore:

- cancellations remain a blocking data surface;
- no cancellation endpoint is promoted to `CONFIRMED` from this topic.

### 2.7 Current activity around already-confirmed analytics/postings — RECONFIRMED ACTIVE FAMILIES

The current official Seller API community page (May 2026 entries) includes active integration questions for:

- `/v1/analytics/data` (`session_view` semantics, 2026-05-22);
- `/v3/posting/fbo/list` (filter behavior, 2026-05-14);
- `/v3/supply-order/get` (warehouse fields, 2026-05-19).

Source:

- https://dev.ozon.ru/community?category_id=2&page=4

This does not replace library schema verification, but it provides fresh evidence that these method families remain in active use in 2026.

### 2.8 Product query analytics — official method pair remains CONFIRMED

Official Ozon update dated 2025-03-14 introduced:

- `/v1/analytics/product-queries`;
- `/v1/analytics/product-queries/details`.

Ozon states these methods expose analytics for queries of seller products, with longer history / extended data for Premium and Premium Plus.

Source:

- https://dev.ozon.ru/news/512-Novye-metody-dlia-raboty-s-analitikoi-po-zaprosam-tovarov-v-Seller-API/

### 2.9 Finance transaction → FBS posting product price join remains CONFIRMED

Official resolved Ozon support thread explicitly discusses `/v3/finance/transaction/list` and recommends `/v3/posting/fbs/get`, section `products`, to obtain product-level sold price for an FBS posting.

Source:

- https://dev.ozon.ru/community/712-Zapros-v3-finance-transaction-list-kak-uznat-tsenu-za-tovar

This supports the existing diagnostic design that finance evidence may require joins with posting evidence instead of treating a transaction list as a complete product-sale ledger.

## 3. Candidate endpoint families deliberately NOT promoted

During discovery, non-official search surfaces continue to expose candidate paths/versions such as:

- `/v3/product/list`;
- `/v3/product/info/list`;
- `/v4/product/info/attributes` (and older-version variants);
- `/v5/product/info/prices` (and older-version variants);
- warehouse-list families;
- return-list families.

These candidates are intentionally **UNCONFIRMED** in `blood_sand` because this pass did not obtain current official Ozon library evidence for their exact method/path/schema.

They must not enter:

- `OZON_READ_ONLY_ALLOWLIST_V1.json`;
- future provider code;
- acceptance command registry.

## 4. Updated blocking matrix

### Full assortment / Product-SKU-Listing master

Still blocking:

- seller product enumeration;
- canonical bulk product info;
- title/status/visibility;
- category/type dictionaries;
- attributes/characteristics;
- barcode/dimensions/weight;
- media/description/rich content where exposed.

Status: **PENDING official library extraction**.

### Prices / promotions

Improved status:

- seller promotions/actions capability: **CONFIRMED ACTIVE**;
- exact read endpoints / product participation / price semantics: **PENDING**.

Still blocking.

### Warehouses / geography

Known:

- stock response carries `warehouse_ids`;
- 2026 FBO supply change requires macrolocal cluster semantics for cross-dock.

Missing:

- current seller warehouse dictionary/list surface;
- warehouse/cluster naming and geography mapping;
- delivery availability/geographic surface where officially exposed.

Still blocking.

### Returns / cancellations

Known:

- cancellation detection is a current active integration need;
- general analytics can expose return-related aggregate evidence where supported by current metric schema.

Missing:

- exact current return/cancellation read methods;
- product quantities/timestamps/reasons/statuses;
- FBO/FBS split semantics;
- claims/disputes read surface if available.

Still blocking.

### Reports / realization / settlement

No new exact official method/schema was obtained in this pass.

Still blocking.

### Advertising

Separate advertising API contour remains known to exist, but exact current read host/auth/campaign/product/statistics schema was not closed in this pass.

Still blocking.

### Reviews / questions

No current exact official read surface was obtained in this pass.

Status: **DESIRABLE/PENDING**, not required to enumerate the first full catalog but important to customer/content evidence if API access exists.

## 5. 03A.3 closure verdict

`03A.3 — Полный официальный API-аудит Ozon` **НЕ ЗАКРЫТ**.

Fresh official evidence improved confidence in:

- current public-API-only rule;
- `/v4/product/info/stocks`;
- 2026 supply/cluster semantics;
- OAuth constraints;
- active seller-promotions capability;
- current relevance of cancellations, analytics and postings.

But the audit still lacks current official exact schemas for the blocking surfaces required to build a complete store ingestion and causal seller-diagnostics bridge:

1. catalog/product master;
2. prices + read-only promotions state;
3. returns/cancellations;
4. warehouses/clusters/geography dictionaries;
5. realization/reports/settlement;
6. advertising exact API surface;
7. per-method pagination/limits/history/account restrictions;
8. reviews/questions where available.

Therefore:

- `03A.3` remains `[~]`;
- `03A.4 — Ozon browser extension` remains `[ ] НЕ НАЧАТО`;
- implementation code must not be created from guessed/third-party endpoints.
