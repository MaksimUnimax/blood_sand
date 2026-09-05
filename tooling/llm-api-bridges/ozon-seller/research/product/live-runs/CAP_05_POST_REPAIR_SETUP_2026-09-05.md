# CAP-05 — Stock turnover / stock analytics — SETUP

Status: ACTIVE

Canonical job:

`Какие товары у меня сейчас в дефиците, какие лежат с избытком или без продаж, и на сколько дней хватит запасов? Отсортируй самые проблемные позиции и используй отдельную аналитику оборачиваемости Ozon, а не рассчитывай это только из текущего остатка.`

Capability target: prove the worker recognizes stock turnover / stock-days as a separate Ozon analytical surface and can identify shortage/overstock/no-sales risks without treating current stock or generic sales analytics as sufficient.

Fresh catalog authority: CAP-01 current catalog contains 76 SKUs.

Planned first read: `stock_turnover_analytics` over all 76 current SKUs, limit 1000, offset 0. If the dedicated turnover response is sufficient, rank/problem-classify locally. Use an additional stock-analytics read only if the first surface lacks information required by the canonical job.

Checkpoint: `CAP_05_ACTIVE_RUN_1_NEXT`