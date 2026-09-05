# CAP-09 — FBO postings/orders — SETUP

Status: ACTIVE

Canonical job:

`Какие FBO-заказы были созданы за 4 сентября 2026 года? Покажи posting/order, товары, количество, текущий статус и склад исполнения. Используй именно данные FBO postings Ozon, а не агрегированную аналитику продаж.`

Capability target: prove the worker recognizes FBO posting/order evidence as a distinct operational surface and can retrieve order/posting/product/warehouse/status evidence without falling back to aggregate analytics.

Frozen window: `2026-09-04T00:00:00Z` through `2026-09-05T00:00:00Z` (one complete UTC day).

Planned first read: `posting_fbo_list`, limit 100. Follow provider cursor only if `has_next=true`.

Checkpoint: `CAP_09_ACTIVE_RUN_1_NEXT`