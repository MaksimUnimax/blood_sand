# Ozon Seller API method catalog — part 06/06

Rows 256–303 of 303. Fixed columns: path, cluster, decision, alias, access, replacement.

| # | Path | Cluster | Решение | Alias | Доступ | Замена |
|---:|---|---|---|---|---|---|
| 256 | `/v2/posting/fbs/cancel-reason/list` | `fbs_orders_delivery` | ДОБАВИТЬ | `posting_fbs_cancel_reason_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 257 | `/v2/posting/fbs/get-by-barcode` | `fbs_orders_delivery` | НЕ ДОБАВЛЯТЬ: покупатель/контакты/личная переписка | — | обычный/без отдельного Premium-требования в текущем индексе | — |
| 258 | `/v2/posting/fbs/list` | `fbs_orders_delivery` | НЕ ДОБАВЛЯТЬ: старая/выводимая версия | — | обычный/без отдельного Premium-требования в текущем индексе | `/v4/posting/fbs/list` |
| 259 | `/v2/posting/fbs/package-label` | `fbs_orders_delivery` | НЕ ДОБАВЛЯТЬ: чувствительный файл/этикетка/штрихкод/PDF | — | обычный/без отдельного Premium-требования в текущем индексе | — |
| 260 | `/v2/posting/fbs/product/country/list` | `fbs_orders_delivery` | ДОБАВИТЬ | `posting_fbs_product_country_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 261 | `/v2/product/certificate/accordance-types/list` | `certification_compliance` | ДОБАВИТЬ | `product_certificate_accordance_types_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 262 | `/v2/product/certification/list` | `certification_compliance` | ДОБАВИТЬ | `product_certification_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 263 | `/v2/product/info` | `catalog_products` | НЕ ДОБАВЛЯТЬ: старая/выводимая версия | — | обычный/без отдельного Premium-требования в текущем индексе | `/v3/product/info/list` |
| 264 | `/v2/product/info/limit` | `catalog_products` | НЕ ДОБАВЛЯТЬ: старая/выводимая версия | — | обычный/без отдельного Premium-требования в текущем индексе | `/v4/product/info/limit` |
| 265 | `/v2/product/info/list` | `catalog_products` | НЕ ДОБАВЛЯТЬ: старая/выводимая версия | — | обычный/без отдельного Premium-требования в текущем индексе | `/v3/product/info/list` |
| 266 | `/v2/product/info/stocks-by-warehouse/fbs` | `stock_inventory` | ДОБАВИТЬ | `stocks_by_warehouse_fbs` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 267 | `/v2/product/list` | `catalog_products` | НЕ ДОБАВЛЯТЬ: старая/выводимая версия | — | обычный/без отдельного Premium-требования в текущем индексе | `/v3/product/list` |
| 268 | `/v2/product/pictures/info` | `catalog_products` | ДОБАВИТЬ | `product_pictures` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 269 | `/v2/question/list` | `reviews_questions` | НЕ ДОБАВЛЯТЬ: старая/выводимая версия | — | обычный/без отдельного Premium-требования в текущем индексе | `/v3/question/list` |
| 270 | `/v2/report/returns/create` | `reports_documents` | ДОБАВИТЬ КАК ВЫГРУЗКУ | `report_returns_create` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 271 | `/v2/returns/rfbs/get` | `returns_cancellations` | ДОБАВИТЬ С ФИЛЬТРАЦИЕЙ | `returns_rfbs_get` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 272 | `/v2/returns/rfbs/list` | `returns_cancellations` | ДОБАВИТЬ С ФИЛЬТРАЦИЕЙ | `returns_rfbs_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 273 | `/v2/review/count` | `reviews_questions` | ДОБАВИТЬ С ФИЛЬТРАЦИЕЙ | `review_count` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 274 | `/v2/review/info` | `reviews_questions` | ДОБАВИТЬ С ФИЛЬТРАЦИЕЙ | `review_info` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 275 | `/v2/review/list` | `reviews_questions` | ДОБАВИТЬ С ФИЛЬТРАЦИЕЙ | `review_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 276 | `/v2/supply-order/get` | `fulfillment_supply` | НЕ ДОБАВЛЯТЬ: старая/выводимая версия | — | обычный/без отдельного Premium-требования в текущем индексе | `/v3/supply-order/get` |
| 277 | `/v2/supply-order/list` | `fulfillment_supply` | НЕ ДОБАВЛЯТЬ: старая/выводимая версия | — | обычный/без отдельного Premium-требования в текущем индексе | `/v3/supply-order/list` |
| 278 | `/v2/supply-order/timeslot/list` | `fulfillment_supply` | ДОБАВИТЬ | `supply_order_timeslot_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 279 | `/v2/warehouse/list` | `warehouses_logistics` | ДОБАВИТЬ | `warehouse_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 280 | `/v3/chat/history` | `customer_communications` | НЕ ДОБАВЛЯТЬ: покупатель/контакты/личная переписка | — | обычный/без отдельного Premium-требования в текущем индексе | — |
| 281 | `/v3/chat/list` | `customer_communications` | НЕ ДОБАВЛЯТЬ: покупатель/контакты/личная переписка | — | обычный/без отдельного Premium-требования в текущем индексе | — |
| 282 | `/v3/finance/transaction/list` | `finance_accounting` | НЕ ДОБАВЛЯТЬ: старая/выводимая версия | — | обычный/без отдельного Premium-требования в текущем индексе | `/v1/finance/accrual/postings` |
| 283 | `/v3/finance/transaction/totals` | `finance_accounting` | НЕ ДОБАВЛЯТЬ: старая/выводимая версия | — | обычный/без отдельного Premium-требования в текущем индексе | `/v1/finance/accrual/by-day` |
| 284 | `/v3/posting/fbo/list` | `fbs_orders_delivery` | УЖЕ РАБОТАЕТ | `posting_fbo_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 285 | `/v3/posting/fbs/act/get-postings` | `fbs_orders_delivery` | ДОБАВИТЬ С ФИЛЬТРАЦИЕЙ | `posting_fbs_act_get_postings_v3` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 286 | `/v3/posting/fbs/get` | `fbs_orders_delivery` | НЕ ДОБАВЛЯТЬ: покупатель/контакты/личная переписка | — | обычный/без отдельного Premium-требования в текущем индексе | — |
| 287 | `/v3/posting/fbs/list` | `fbs_orders_delivery` | НЕ ДОБАВЛЯТЬ: старая/выводимая версия | — | обычный/без отдельного Premium-требования в текущем индексе | `/v4/posting/fbs/list` |
| 288 | `/v3/posting/fbs/unfulfilled/list` | `fbs_orders_delivery` | НЕ ДОБАВЛЯТЬ: старая/выводимая версия | — | обычный/без отдельного Premium-требования в текущем индексе | `/v4/posting/fbs/unfulfilled/list` |
| 289 | `/v3/product/info/list` | `catalog_products` | ДОБАВИТЬ | `product_info_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 290 | `/v3/product/info/stocks` | `stock_inventory` | НЕ ДОБАВЛЯТЬ: старая/выводимая версия | — | обычный/без отдельного Premium-требования в текущем индексе | `/v4/product/info/stocks` |
| 291 | `/v3/product/list` | `catalog_products` | ДОБАВИТЬ | `product_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 292 | `/v3/products/info/attributes` | `catalog_products` | НЕ ДОБАВЛЯТЬ: старая/выводимая версия | — | обычный/без отдельного Premium-требования в текущем индексе | `/v4/product/info/attributes` |
| 293 | `/v3/question/list` | `reviews_questions` | ДОБАВИТЬ С ФИЛЬТРАЦИЕЙ | `question_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 294 | `/v3/supply-order/get` | `fulfillment_supply` | УЖЕ РАБОТАЕТ | `supply_order_get` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 295 | `/v3/supply-order/list` | `fulfillment_supply` | ДОБАВИТЬ | `supply_order_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 296 | `/v4/posting/fbs/list` | `fbs_orders_delivery` | ДОБАВИТЬ С ФИЛЬТРАЦИЕЙ | `posting_fbs_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 297 | `/v4/posting/fbs/unfulfilled/list` | `fbs_orders_delivery` | ДОБАВИТЬ С ФИЛЬТРАЦИЕЙ | `posting_fbs_unfulfilled_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 298 | `/v4/product/info/attributes` | `catalog_products` | ДОБАВИТЬ | `product_attributes` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 299 | `/v4/product/info/limit` | `catalog_products` | ДОБАВИТЬ | `product_limits` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 300 | `/v4/product/info/prices` | `pricing_promotions` | НЕ ДОБАВЛЯТЬ: старая/выводимая версия | — | обычный/без отдельного Premium-требования в текущем индексе | `/v5/product/info/prices` |
| 301 | `/v4/product/info/stocks` | `stock_inventory` | УЖЕ РАБОТАЕТ | `stocks_current` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 302 | `/v5/fbs/posting/product/exemplar/status` | `fbs_orders_delivery` | ДОБАВИТЬ | `fbs_posting_product_exemplar_status` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 303 | `/v5/product/info/prices` | `pricing_promotions` | ДОБАВИТЬ | `product_prices` | обычный/без отдельного Premium-требования в текущем индексе | — |
