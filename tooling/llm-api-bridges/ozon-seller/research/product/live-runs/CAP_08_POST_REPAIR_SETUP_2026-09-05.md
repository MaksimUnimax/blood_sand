# CAP-08 — Supply-order details / acceptance — SETUP

Status: ACTIVE

Canonical job:

`Поставка 122149074 уже дошла до этапа приёмки на складе Ozon. Проверь её подробности: принят ли сам supply, какой у него supply_id и bundle_id, есть ли уже storage warehouse, crossdock ли это и есть ли признак просрочки. Не ограничивайся общим статусом order.`

Capability target: prove the worker can drill from an order identifier discovered through the supply-order list/status workflow into the dedicated supply-order details/acceptance surface and distinguish parent-order lifecycle state from nested supply acceptance evidence.

Fresh authority from CAP-07: order `122149074` is the one current active order in `ACCEPTANCE_AT_STORAGE_WAREHOUSE`.

Planned first read: `supply_order_details` with `order_id=122149074`. Use additional reads only if the dedicated details response does not resolve the canonical acceptance questions.

Checkpoint: `CAP_08_ACTIVE_RUN_1_NEXT`