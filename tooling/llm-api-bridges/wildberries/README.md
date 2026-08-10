# Wildberries API research

Статус: **research complete for initial read-only design; Wildberries browser extension NOT STARTED**.

## Что здесь хранится сейчас

Только исследовательские материалы официальной WB API surface для будущего marketplace bridge и последующего сбора полного ассортимента/статистики продавца.

Wildberries extension сейчас не существует. Разработка относится к отдельному будущему roadmap-шагу 03A.6.

## Research artifacts

- `WB_API_CAPABILITY_AUDIT_2026-08-10.md` — исходный полный аудит API-классов;
- `WB_API_CAPABILITY_CORRECTIONS_2026-08-10.md` — current-2026 corrections; имеет приоритет при конфликте со старым audit;
- `READ_ONLY_OPERATION_MATRIX_V1.md` — research capability matrix для будущего design, не implementation allowlist.

## Существенные current corrections

На текущую дату исследования нельзя строить будущую интеграцию на старых deprecated статистических endpoints:

- legacy `GET /api/v1/supplier/stocks` не является current foundation для остатков WB;
- legacy `GET /api/v5/supplier/reportDetailByPeriod` был объявлен к отключению 2026-07-15 и не является current finance foundation.

Current research фиксирует новые warehouse-remains Analytics и Finance API families, а также актуальные cards, prices, warehouses/FBS stock, funnel, orders, promotion/calendar, feedback/questions capabilities.

## Будущая разработка

Перед началом coding:

1. повторно открыть official WB category Swagger/release notes на дату разработки;
2. подтвердить exact endpoints, token type/category, schemas, rate limits, pagination/history;
3. удалить из будущего design всё, что WB успел deprecated;
4. только затем зафиксировать отдельный implementation allowlist и начать разработку `WB_API_V1 → WB_RESULT_V1` bridge по roadmap 03A.6.

До этого `WB_API_V1` — только запланированное семейство команд, а не существующий инструмент.
