# Ozon Seller bridge

Статус: **research/design**.

Первый этап — полный аудит актуальной официальной документации Ozon API: authentication/scopes, seller/catalog, listings, attributes/media, prices, stocks/warehouses, postings/orders/returns, finance/accruals, analytics, reports, promotion/advertising, reviews/questions where officially exposed, rate limits, pagination и ограничения доступа.

После API matrix строится read-only LLM bridge с командами `OZON_API_V1` и результатами `OZON_RESULT_V1`.

Первая прикладная задача проекта после acceptance: получить полный Ozon assortment/listings и доступную историческую статистику продавца для построения общего Product/SKU master и диагностики продаж.
