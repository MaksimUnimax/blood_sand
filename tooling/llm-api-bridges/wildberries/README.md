# Wildberries bridge

Статус: **research/design**.

После завершения Ozon API matrix выполняется полный аудит актуальной официальной документации Wildberries API: token categories/scopes, content/cards, prices/discounts, warehouses/stocks, orders/sales/returns, supplies, statistics/analytics, finance/reports, promotion/advertising, feedbacks/questions where officially exposed, rate limits, pagination и ограничения доступа.

После API matrix строится read-only LLM bridge с командами `WB_API_V1` и результатами `WB_RESULT_V1`.

Первая прикладная задача проекта после acceptance: получить полный WB assortment/listings и доступную историческую статистику продавца, затем cross-platform сопоставить товары с Ozon и сформировать общий Product/SKU master.
