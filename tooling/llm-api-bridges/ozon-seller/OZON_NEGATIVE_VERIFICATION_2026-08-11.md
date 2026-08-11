# Ozon Seller API — negative verification pass — 2026-08-11

Статус: **HISTORICAL RESEARCH EVIDENCE — PARTIALLY SUPERSEDED LATER THE SAME DAY**

> **Priority note:** этот документ фиксирует результат раннего прохода, когда поиск current evidence выполнялся через индексируемые `dev.ozon.ru` / interactive-library surfaces и не находил ряд exact paths. Позднее в тот же research cycle был найден верифицированный `Ozon Seller API notification` changelog, который ссылается на Seller API documentation и дал более свежий currentness/deprecation evidence. При конфликте статусов приоритет имеют:
>
> 1. `OZON_OFFICIAL_NOTIFICATION_CURRENTNESS_2026-08-11.md`;
> 2. `OZON_READ_ONLY_ALLOWLIST_V1.json` current version;
> 3. `OZON_03A3_COMPLETENESS_V1.json` current version.
>
> В частности, ранние `NOT CONFIRMED` для `/v3/product/list`, `/v3/product/info/list`, `/v4/product/info/attributes`, `/v5/product/info/prices`, warehouse/return/report families **больше нельзя читать как текущий статус существования path family**. Changelog позже подтвердил current families. При этом full implementation contracts всё ещё pending.

Цель этого файла теперь — сохранить воспроизводимость отрицательного поиска и показать, почему отсутствие результата в одном official-domain search channel нельзя трактовать как отсутствие метода.

## Правило интерпретации

`NOT CONFIRMED AT THIS PASS` означает: на момент данного раннего прохода не удалось получить достаточное подтверждение exact current method/path/schema через использованную поверхность.

Это никогда не означало «метода не существует». Последующий changelog-pass как раз подтвердил это различие.

## 1. Catalog / product candidates — ранний отрицательный результат, позже superseded по currentness

Ранние exact searches не дали current official results для:

- `/v3/product/list`;
- `/v3/product/info/list`;
- `/v4/product/info/attributes`;
- `/v5/product/info/prices`.

**Later correction:** verified Ozon Seller API notification changelog затем подтвердил current activity:

- `/v3/product/list` — изменение 2026-07-09;
- `/v3/product/info/list` — изменение 2026-07-10;
- `/v4/product/info/attributes` — изменение 2026-02-10;
- `/v5/product/info/prices` — изменение 2026-05-28.

Следовательно ранний negative result полезен только как evidence ограниченности search surface. Current status смотрите в currentness/allowlist artifacts.

## 2. Official interactive library remains inaccessible from research runtime

Попытки открыть:

- `https://docs.ozon.ru/api/seller/`

продолжают приводить к redirect/error loop в текущей research environment.

Из-за этого даже после подтверждения current path families всё ещё нельзя достоверно снять из library:

- полный request/response contract;
- HTTP verb там, где он не подтверждён отдельно;
- pagination/cursor/page-size;
- history/date windows;
- quotas/rate limits;
- roles/scopes/subscription restrictions;
- complete error/deprecation details.

Это не даёт права заменять library сторонним зеркалом.

## 3. Current 2026 activity already visible on `dev.ozon.ru`

До changelog-pass официальный Seller API community уже подтверждал активную интеграционную жизнь:

- `/v1/analytics/data` — current 2026 discussion;
- `/v3/supply-order/get` — current 2026 discussion;
- `/v3/posting/fbo/list` — current 2026 discussion;
- отдельный кейс `Частичная отмена FBS - как определить через API` от 2026-05-26.

Source:

- `https://dev.ozon.ru/community?category_id=2&page=4`

Это поддерживало current relevance, но не давало полного contract.

## 4. Seller promotions — ранняя capability evidence, позже exact families стали видимы

Official topic 2026-02-27 по `/v1/seller-actions/products/add` подтверждал, что seller-actions API работает и documented under `БЕТА-МЕТОДЫ → Акции продавца`.

Source:

- `https://dev.ozon.ru/community/1942-v1-seller-actions-products-add-404-poka/`

Later notification evidence показал read-family paths `/v1/seller-actions/list` и `/v1/seller-actions/products/list`.

Current status: **path family visible/current; full read contract pending**.

## 5. Historical official paths still must not be promoted automatically

Этот вывод не superseded и остаётся обязательным.

Примеры:

- старый `/v3/product/info/stocks` уже вытеснен current `/v4/product/info/stocks`;
- `/v1/warehouse/list` позже официально отключён и заменён `/v2/warehouse/list`;
- `/v3/finance/transaction/list` теперь официально deprecated и запланирован к отключению 2026-09-08.

Следствие: наличие path на official domain в старой статье ≠ current implementation target.

## 6. Advertising API — отрицательный результат НЕ superseded

Здесь ранний вывод по-прежнему актуален.

Ozon-owned surfaces подтверждают отдельный `API рекламной платформы` / Performance API contour, но исследование пока не получило current Ozon-owned method contract для требуемых read-only данных:

- campaign list/status/type;
- campaign→product mapping;
- impressions/clicks/spend;
- CTR/CPC/CPM;
- attributed orders/revenue;
- query/placement/category/region dimensions;
- read-only budget/bid context;
- current host/auth.

Mutation examples и сторонние Performance API integrations не являются authority для initial read-only bridge.

Status: **PENDING / BLOCKING**.

## 7. Research lesson / current disposition

Этот файл не является current allowlist и не должен использоваться как implementation source.

Его полезный вывод:

- negative search result фиксирует предел конкретного канала поиска, а не отсутствие API;
- currentness/deprecation нужно проверять отдельным Ozon-owned evidence stream;
- full implementation contract всё равно требует authoritative method documentation;
- third-party SDK/collections не закрывают пробел.

Roadmap остаётся:

- `03A.3` = **IN PROGRESS**;
- `03A.4 Ozon extension` = **NOT STARTED**.
