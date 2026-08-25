# Ozon Bridge — Complete Read-Only Coverage Implementation Plan

Дата: 2026-08-25  
Статус: implementation authority для следующего этапа; **production-код этим commit не меняется**.  
База: `fix/ozon-work-resume-provider-status-separation-2026-08-24` @ `9ebc673c2e0dd9dc24f6cbab90455396328f0aad`.

## 1. Цель

Зафиксировать один окончательный фильтр по 303 Seller API путям текущего ключа: что реализуем, что не реализуем, к какому кластеру относится метод, как учитываются роль ключа/подписка/Premium/beta, как AI получает prerequisites и как работают отчёты. Полный row-level фильтр находится в `OZON_API_METHOD_CATALOG_2026-08-25.md` и его шести частях. Решений `PENDING` нет.

## 2. Неподвижные правила

1. AI не передаёт URL, HTTP method, headers или credentials: alias всегда маппится на фиксированный provider contract.
2. Один `OZON_API_V1` — максимум один внешний business request.
3. Нет скрытых retry, pagination, polling, fan-out и автоподмены операции.
4. Название роли `ReadOnly` и HTTP verb сами по себе не доказывают безопасность. Фильтр строится по смыслу операции.
5. Report `create` разрешён только когда он создаёт read-выгрузку и не меняет бизнес-состояние. Создание отчёта, проверка и получение результата — отдельные команды.
6. Customer PII не попадает в AI/logs. Опасные chat/contact/FBS-detail surfaces закрыты; разрешённые order/return/review surfaces получают field allowlist/redaction.
7. Если prerequisite (product_id, sku, warehouse_id, supply_order_id и т.п.) можно получить безопасным Bridge-read, guidance сначала предлагает этот read, а не просит пользователя искать ID вручную.
8. «Нет в Bridge» не равно «нет в Ozon API».

## 3. Модель доступа

Планирование Seller-запроса идёт так: operation есть в Bridge registry → `/v1/roles` подтверждает право ключа → если операция subscription-sensitive, переиспользуется существующий `/v1/seller/info` capability probe → проверяется feature stage (main/beta/deprecated) → строится request.

Используем существующие значения capability: `UNKNOWN`, `UNSPECIFIED`, `PREMIUM`, `PREMIUM_LITE`, `PREMIUM_PLUS`, `PREMIUM_PRO`. Premium не создаёт вторую систему команд и не создаёт отдельные кластеры.

Performance API остаётся отдельным provider/credential contour и не смешивается с 303 Seller methods.

## 4. Кластеры

Сохраняются без переименования текущие 6: `sales_analytics`, `stock_inventory`, `search_visibility`, `fulfillment_supply`, `advertising_performance`, `account_access`.

Добавляются 12: `catalog_products`, `pricing_promotions`, `warehouses_logistics`, `fbs_orders_delivery`, `returns_cancellations`, `finance_accounting`, `reports_documents`, `reviews_questions`, `certification_compliance`, `seller_quality`, `notifications_integrations`, `customer_communications`.

Полное назначение и правила совместимости — `OZON_BRIDGE_CLUSTER_TAXONOMY_V2_2026-08-25.md`.

## 5. Пошаговая реализация

### Phase 0 — registry metadata + coverage gates

- Расширить operation metadata: primary cluster, key roles, subscription requirement, feature stage, PII policy, parameter contract, pagination, prerequisite recipe, response allowlist, quota family, replacement.
- Сгенерировать тест из каталога: все `SUPPORTED/ADD/ADD_REDACT/ADD_REPORT` имеют один уникальный alias и один кластер; `NO_*` никогда не попадают в guidance/provider planner.
- Тест падает при незакластеренной операции, alias collision, `PENDING`, AI-controlled transport или невалидной replacement-ссылке.
- Не сбрасывать quota/cache/history/credentials/Manual/Autorun state при capability checks.

### Phase 1 — account + catalog + stocks + warehouse geography

- Добавить `seller_info` в `account_access`.
- Current product chain: `/v3/product/list`, `/v3/product/info/list`, `/v4/product/info/attributes`, `/v2/product/pictures/info`, `/v4/product/info/limit`, description-category dictionaries.
- `stock_inventory`: FBO/FBS stocks-by-warehouse, `/v1/analytics/stocks`, stock/turnover analytics, stock/movement report workflows.
- `warehouses_logistics`: current warehouse/cluster/logistics methods и joins warehouse↔cluster↔stock.
- Для «остатков на дату» guidance ищет доступный history/report contract. Нельзя заявлять, что Ozon этого не умеет, только потому что текущий Bridge не выставил alias.

### Phase 2 — supplies + postings + returns

- `fulfillment_supply`: current supply-order/FBP/cargo read/status methods; cargo mutation остаётся `NO_WRITE`.
- `fbs_orders_delivery`: current list/status/reason/act methods; целевые версии v4 FBS list/unfulfilled и v3 FBO list; старые версии не регистрировать.
- Order/return methods включаются только после response allowlist + PII regression fixtures.
- Возвраты и conditional cancellation — только чтение; никаких approve/reject/cancel mutations.

### Phase 3 — finance + reports

- Добавить current `/v1/finance/accrual/*`, balance, cash-flow, mutual-settlement, realization и прочие разрешённые finance reads.
- `/v3/finance/transaction/*` не реализовывать: сразу использовать accrual family.
- Report state machine: явная команда create → report id → отдельная команда info/list → отдельное controlled retrieval действие. Скрытого polling нет.
- AI не передаёт URL отчёта. Если нужен download, worker использует локальный opaque report token и сам проверяет сохранённый Ozon/signed origin; скачивание остаётся отдельным явным request.

### Phase 4 — Premium/search/prices/promotions

- Сохранить текущие subscription rules для `analytics_data`/product queries в общей metadata model.
- Добавить Premium-family `/v1/search-queries/text`, `/v1/search-queries/top`, `/v1/product/prices/details`.
- Добавить safe actions/seller-actions/pricing reads; любые create/update/enable/disable/state-change методы не выставлять.
- При отсутствии подписки говорить «метод существует, но текущая подписка/доступ его не разрешает».

### Phase 5 — feedback/compliance/quality/notifications

- Добавить certification dictionaries/info/lists.
- Добавить rating/error-index reads.
- Review/question content — только после allowlist/redaction tests; chat surfaces остаются закрыты.
- Notification list/type reads разрешить; `/v1/notification/check` запрещён, потому что инициирует обращение к внешнему URL.

### Phase 6 — guidance recipes + acceptance

- Для каждого planned alias: short purpose, exact template, prerequisites, pagination semantics, access note.
- Guidance может переходить catalog → stock → warehouse и между другими кластерами только через следующую явную команду.
- Acceptance: zero-request help, one-request business command, no hidden retry, fail-closed entitlement, PII fixtures, deprecated/mutation rejection, report lifecycle, prerequisite chaining.
- После provider/browser acceptance каталог становится источником генерации runtime registry; ручные дублированные списки удаляются только отдельным проверенным migration commit.

## 6. Что сознательно не реализуем

- **8 методов изменения состояния (`NO_WRITE`)**: управление остатками, создание/удаление/активация/привязка грузомест, изменение статуса ценовой стратегии. Причина: они меняют кабинет.
- **12 методов (`NO_PII`)**: chat/file/history/list, контакт курьера, детальные FBS lookup. Причина: могут раскрывать покупателя, контакты или переписку.
- **38 старых/выводимых (`NO_OLD`)**: не тратим код на старую версию; каталог указывает точную актуальную замену там, где она есть.
- **1 callback (`NO_CALLBACK`)**: `/v1/notification/check`. Причина: заставляет Ozon обращаться по внешнему адресу.
- **16 файловых/операционных (`NO_FILE`)**: PDF, PNG, этикетки, штрихкоды и похожие документы. Причина: текущий AI-канал не должен переносить такие чувствительные артефакты.

Точные 75 путей и причина для каждого записаны построчно в каталоге; при реализации повторная фильтрация не требуется.

## 7. Definition of done

- Все 228 целевых Seller methods (`SUPPORTED/ADD/ADD_REDACT/ADD_REPORT`) покрыты runtime registry и тестами; ни один из 75 `NO_*` не исполняется.
- Каждый alias имеет ровно один cluster, access policy, schema validator, response policy, quota family и test.
- Текущие 8 Seller aliases и 4 Performance aliases остаются backward-compatible.
- Missing role, subscription failure, beta unavailable, deprecated path и Bridge-not-yet-exposed — разные machine-readable состояния.
- Ни один новый production alias не включается до сверки свежего Ozon-owned contract и live-safe acceptance.

## 8. Правило актуальности

Фильтр 303 методов фиксируется этим milestone. При кодировании повторно решаем не «нужен ли метод», а только сверяем свежий Ozon-owned request/response contract, лимиты и возможную замену версии после 2026-08-25. Если Ozon позже меняет endpoint, обновляется currentness/replacement metadata, а не вся политика покрытия.
