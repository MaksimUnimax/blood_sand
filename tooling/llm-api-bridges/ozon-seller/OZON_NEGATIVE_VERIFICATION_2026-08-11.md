# Ozon Seller API — negative verification pass — 2026-08-11

Статус: **RESEARCH EVIDENCE — НЕ endpoint allowlist**

Цель: зафиксировать не только найденные подтверждения, но и точный отрицательный результат поиска current official evidence. Это защищает будущую реализацию от подмены official provenance сторонними SDK, зеркалами и памятью о старых версиях API.

## Правило интерпретации

`NOT CONFIRMED` здесь означает: в текущем проходе не удалось получить достаточное подтверждение exact current method/path/schema из официальной поверхности Ozon (`dev.ozon.ru` / official Seller API library).

Это **не означает**, что метода не существует. Это означает, что его нельзя переносить в `OZON_READ_ONLY_ALLOWLIST_V1.json`, provider code или acceptance registry до official confirmation.

## 1. Exact product/catalog candidates — NOT CONFIRMED

Были выполнены отдельные official-domain searches как по exact candidate paths, так и по русским названиям capability для полного каталога продавца.

Не получено current official exact confirmation для:

- `/v3/product/list`;
- `/v3/product/info/list`;
- `/v4/product/info/attributes`;
- `/v5/product/info/prices`.

Также не найден current official exact replacement/version, который можно было бы безопасно записать вместо них.

Discovery-хинты из сторонних SDK/collections продолжают показывать похожие families, но они остаются только hints.

**Disposition:** catalog/product master и prices остаются blocking surfaces roadmap 03A.3.

## 2. Official library remains inaccessible from research runtime

Попытка открыть:

- `https://docs.ozon.ru/api/seller/`

снова приводит к redirect/error loop в доступной research environment.

Из-за этого в текущем проходе нельзя достоверно снять:

- request/response schemas;
- pagination/cursor/page-size semantics;
- date/history windows;
- quotas/rate limits;
- account/Premium restrictions;
- deprecation/replacement notices

для blocking method families.

Это не даёт права заменять library сторонним зеркалом.

## 3. Current 2026 activity that IS officially visible

Current official Seller API community page за май 2026 подтверждает активную интеграционную жизнь следующих already-known families:

- `/v1/analytics/data` — вопрос о семантике `session_view`, 2026-05-22;
- `/v3/supply-order/get` — вопрос о warehouse fields, 2026-05-19;
- `/v3/posting/fbo/list` — вопрос о filters, 2026-05-14.

На той же official surface 2026-05-26 есть отдельный кейс `Частичная отмена FBS - как определить через API`.

Source:

- `https://dev.ozon.ru/community?category_id=2&page=4`

**Interpretation:** эти записи поддерживают current relevance already-confirmed families и доказывают, что cancellation detection — реальная текущая integration need. Они не дают exact cancellation endpoint/schema.

## 4. Seller promotions — capability current, read endpoints still NOT CONFIRMED

Official topic 2026-02-27 по `/v1/seller-actions/products/add` содержит ответ менеджера Ozon: методы управления собственными акциями работают, документация находится в library в разделе `БЕТА-МЕТОДЫ → Акции продавца`.

Source:

- `https://dev.ozon.ru/community/1942-v1-seller-actions-products-add-404-poka/`

Это подтверждает current seller-actions capability, но не подтверждает нужные проекту read-only list/detail/product-participation methods.

**Disposition:** promotions capability = `CONFIRMED ACTIVE`; exact read surface = `PENDING`.

## 5. Historical official leads deliberately NOT promoted

Официальные community materials более старых лет содержат исторические paths, которые полезны только как verification leads:

- `/v1/finance/realization` встречается в community material 2023;
- `/v2/category/attribute/values` встречается в community material 2023;
- старый stock example 2023 использует `/v3/product/info/stocks`, тогда как current 2025 official evidence уже подтверждает `/v4/product/info/stocks`.

Source examples:

- `https://dev.ozon.ru/community?page=72`
- `https://dev.ozon.ru/case/98-Keis-o-novom-instrumente-dlia-kontrolia-tovarnykh-ostatkov-na-sklade/`

**Disposition:** старые paths не считаются current только потому, что они находятся на официальном домене. Для каждого нужен fresh current confirmation или replacement notice.

## 6. Advertising API — contour visible, exact read surface unresolved

Official community навигация явно содержит отдельную категорию `API рекламной платформы`, а historical official community material показывает campaign/product API calls. Однако найденный конкретный пример относится к mutation ставки и не подтверждает требуемую read-only statistics surface.

Source examples:

- `https://dev.ozon.ru/community?category_id=2&page=4`
- `https://dev.ozon.ru/community/1110-Stavka-ne-vkhodit-v-diapazon-dopustimykh-znachenii/`

**Disposition:** существование отдельного advertising API contour сохраняется как confirmed capability, но current host/auth/campaign list/product mapping/statistics endpoints и schemas остаются `PENDING`. Mutation endpoints не входят в initial bridge scope.

## 7. Result for roadmap 03A.3

Этот проход **не закрывает** 03A.3. Он уменьшает риск неверной реализации тем, что явно фиксирует, какие правдоподобные endpoint names не имеют достаточного current official provenance.

Остаются blocking gaps:

1. seller product enumeration + canonical product info;
2. current price semantics + read-only promotion state;
3. warehouses/clusters/geography dictionaries;
4. returns/cancellations/reasons/statuses;
5. realization/reports/settlement;
6. advertising exact read API;
7. per-method pagination/history/limits/access restrictions.

`03A.4 — Ozon browser extension` остаётся **НЕ НАЧАТО**.