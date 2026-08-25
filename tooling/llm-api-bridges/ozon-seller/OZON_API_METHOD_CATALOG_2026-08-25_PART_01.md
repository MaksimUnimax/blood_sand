# Ozon Seller API method catalog — part 01/06

Rows 1–51 of 303. Fixed columns: path, cluster, decision, alias, access, replacement.

| # | Path | Cluster | Решение | Alias | Доступ | Замена |
|---:|---|---|---|---|---|---|
| 1 | `/beta/description-category/attribute/values/search` | `catalog_products` | ДОБАВИТЬ | `description_category_attribute_values_search` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 2 | `/v1/actions` | `pricing_promotions` | ДОБАВИТЬ | `actions` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 3 | `/v1/actions/auto-add/products/candidates` | `pricing_promotions` | ДОБАВИТЬ | `actions_auto_add_products_candidates` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 4 | `/v1/actions/auto-add/products/list` | `pricing_promotions` | ДОБАВИТЬ | `actions_auto_add_products_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 5 | `/v1/actions/candidates` | `pricing_promotions` | ДОБАВИТЬ | `actions_candidates` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 6 | `/v1/actions/discounts-task/list` | `pricing_promotions` | НЕ ДОБАВЛЯТЬ: старая/выводимая версия | — | обычный/без отдельного Premium-требования в текущем индексе | `/v2/actions/discounts-task/list` |
| 7 | `/v1/actions/hotsales/list` | `pricing_promotions` | ДОБАВИТЬ | `actions_hotsales_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 8 | `/v1/actions/hotsales/products` | `pricing_promotions` | ДОБАВИТЬ | `actions_hotsales_products` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 9 | `/v1/actions/products` | `pricing_promotions` | ДОБАВИТЬ | `actions_products` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 10 | `/v1/analytics/average-delivery-time` | `seller_quality` | НЕ ДОБАВЛЯТЬ: старая/выводимая версия | — | обычный/без отдельного Premium-требования в текущем индексе | — |
| 11 | `/v1/analytics/average-delivery-time/details` | `seller_quality` | НЕ ДОБАВЛЯТЬ: старая/выводимая версия | — | обычный/без отдельного Premium-требования в текущем индексе | — |
| 12 | `/v1/analytics/average-delivery-time/summary` | `seller_quality` | НЕ ДОБАВЛЯТЬ: старая/выводимая версия | — | обычный/без отдельного Premium-требования в текущем индексе | — |
| 13 | `/v1/analytics/category/comparison` | `sales_analytics` | ДОБАВИТЬ | `analytics_category_comparison` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 14 | `/v1/analytics/data` | `sales_analytics` | УЖЕ РАБОТАЕТ | `analytics_data` | Premium-family | — |
| 15 | `/v1/analytics/item_turnover` | `stock_inventory` | ДОБАВИТЬ | `analytics_item_turnover` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 16 | `/v1/analytics/manage/stocks` | `stock_inventory` | НЕ ДОБАВЛЯТЬ: меняет данные/остатки/рабочий статус | — | обычный/без отдельного Premium-требования в текущем индексе | — |
| 17 | `/v1/analytics/product-queries` | `search_visibility` | УЖЕ РАБОТАЕТ | `product_queries` | Premium-family | — |
| 18 | `/v1/analytics/product-queries/details` | `search_visibility` | УЖЕ РАБОТАЕТ | `product_queries_details` | Premium-family | — |
| 19 | `/v1/analytics/stock_on_warehouses` | `stock_inventory` | НЕ ДОБАВЛЯТЬ: старая/выводимая версия | — | обычный/без отдельного Premium-требования в текущем индексе | `/v2/analytics/stock_on_warehouses` |
| 20 | `/v1/analytics/stocks` | `stock_inventory` | ДОБАВИТЬ | `analytics_stocks` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 21 | `/v1/analytics/turnover/stocks` | `stock_inventory` | ДОБАВИТЬ | `analytics_turnover_stocks` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 22 | `/v1/answer/list` | `reviews_questions` | ДОБАВИТЬ С ФИЛЬТРАЦИЕЙ | `answer_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 23 | `/v1/brand/company-certification/list` | `certification_compliance` | ДОБАВИТЬ | `brand_company_certification_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 24 | `/v1/cargoes-label/create` | `fulfillment_supply` | НЕ ДОБАВЛЯТЬ: чувствительный файл/этикетка/штрихкод/PDF | — | обычный/без отдельного Premium-требования в текущем индексе | — |
| 25 | `/v1/cargoes-label/file/*` | `fulfillment_supply` | НЕ ДОБАВЛЯТЬ: чувствительный файл/этикетка/штрихкод/PDF | — | обычный/без отдельного Premium-требования в текущем индексе | — |
| 26 | `/v1/cargoes-label/get` | `fulfillment_supply` | НЕ ДОБАВЛЯТЬ: чувствительный файл/этикетка/штрихкод/PDF | — | обычный/без отдельного Premium-требования в текущем индексе | — |
| 27 | `/v1/cargoes/create` | `fulfillment_supply` | НЕ ДОБАВЛЯТЬ: меняет данные/остатки/рабочий статус | — | обычный/без отдельного Premium-требования в текущем индексе | — |
| 28 | `/v1/cargoes/create/info` | `fulfillment_supply` | НЕ ДОБАВЛЯТЬ: старая/выводимая версия | — | обычный/без отдельного Premium-требования в текущем индексе | `/v2/cargoes/create/info` |
| 29 | `/v1/cargoes/delete` | `fulfillment_supply` | НЕ ДОБАВЛЯТЬ: меняет данные/остатки/рабочий статус | — | обычный/без отдельного Premium-требования в текущем индексе | — |
| 30 | `/v1/cargoes/delete/status` | `fulfillment_supply` | НЕ ДОБАВЛЯТЬ: старая/выводимая версия | — | обычный/без отдельного Premium-требования в текущем индексе | `/v2/cargoes/delete/status` |
| 31 | `/v1/cargoes/get` | `fulfillment_supply` | НЕ ДОБАВЛЯТЬ: старая/выводимая версия | — | обычный/без отдельного Premium-требования в текущем индексе | `/v2/cargoes/get` |
| 32 | `/v1/cargoes/label/transport-by-order/create` | `fulfillment_supply` | НЕ ДОБАВЛЯТЬ: чувствительный файл/этикетка/штрихкод/PDF | — | обычный/без отдельного Premium-требования в текущем индексе | — |
| 33 | `/v1/cargoes/label/transport-by-order/status` | `fulfillment_supply` | ДОБАВИТЬ | `cargoes_label_transport_by_order_status` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 34 | `/v1/cargoes/label/transport/create` | `fulfillment_supply` | НЕ ДОБАВЛЯТЬ: чувствительный файл/этикетка/штрихкод/PDF | — | обычный/без отдельного Premium-требования в текущем индексе | — |
| 35 | `/v1/cargoes/label/transport/status` | `fulfillment_supply` | ДОБАВИТЬ | `cargoes_label_transport_status` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 36 | `/v1/cargoes/rules/get` | `fulfillment_supply` | ДОБАВИТЬ | `cargoes_rules_get` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 37 | `/v1/cargoes/supplies/get` | `fulfillment_supply` | ДОБАВИТЬ | `cargoes_supplies_get` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 38 | `/v1/cargoes/transport/activate` | `fulfillment_supply` | НЕ ДОБАВЛЯТЬ: меняет данные/остатки/рабочий статус | — | обычный/без отдельного Premium-требования в текущем индексе | — |
| 39 | `/v1/cargoes/transport/activate/status` | `fulfillment_supply` | ДОБАВИТЬ | `cargoes_transport_activate_status` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 40 | `/v1/cargoes/transport/bind` | `fulfillment_supply` | НЕ ДОБАВЛЯТЬ: меняет данные/остатки/рабочий статус | — | обычный/без отдельного Premium-требования в текущем индексе | — |
| 41 | `/v1/cargoes/transport/bind/status` | `fulfillment_supply` | ДОБАВИТЬ | `cargoes_transport_bind_status` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 42 | `/v1/cargoes/transport/create` | `fulfillment_supply` | НЕ ДОБАВЛЯТЬ: меняет данные/остатки/рабочий статус | — | обычный/без отдельного Premium-требования в текущем индексе | — |
| 43 | `/v1/cargoes/transport/create/status` | `fulfillment_supply` | ДОБАВИТЬ | `cargoes_transport_create_status` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 44 | `/v1/carriage/act-discrepancy/pdf` | `fbs_orders_delivery` | НЕ ДОБАВЛЯТЬ: чувствительный файл/этикетка/штрихкод/PDF | — | обычный/без отдельного Premium-требования в текущем индексе | — |
| 45 | `/v1/carriage/courier-contact/get` | `fbs_orders_delivery` | НЕ ДОБАВЛЯТЬ: покупатель/контакты/личная переписка | — | обычный/без отдельного Premium-требования в текущем индексе | — |
| 46 | `/v1/carriage/ettn/status` | `fbs_orders_delivery` | ДОБАВИТЬ | `carriage_ettn_status` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 47 | `/v1/carriage/get` | `fbs_orders_delivery` | ДОБАВИТЬ | `carriage_get` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 48 | `/v1/chat/file/*` | `customer_communications` | НЕ ДОБАВЛЯТЬ: покупатель/контакты/личная переписка | — | обычный/без отдельного Premium-требования в текущем индексе | — |
| 49 | `/v1/chat/history` | `customer_communications` | НЕ ДОБАВЛЯТЬ: покупатель/контакты/личная переписка | — | обычный/без отдельного Premium-требования в текущем индексе | — |
| 50 | `/v1/chat/list` | `customer_communications` | НЕ ДОБАВЛЯТЬ: покупатель/контакты/личная переписка | — | обычный/без отдельного Premium-требования в текущем индексе | — |
| 51 | `/v1/cluster/list` | `fulfillment_supply` | НЕ ДОБАВЛЯТЬ: старая/выводимая версия | — | обычный/без отдельного Premium-требования в текущем индексе | `/v2/cluster/list` |
