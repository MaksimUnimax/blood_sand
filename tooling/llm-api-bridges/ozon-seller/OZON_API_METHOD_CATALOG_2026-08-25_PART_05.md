# Ozon Seller API method catalog — part 05/06

Rows 205–255 of 303. Fixed columns: path, cluster, decision, alias, access, replacement.

| # | Path | Cluster | Решение | Alias | Доступ | Замена |
|---:|---|---|---|---|---|---|
| 205 | `/v1/supply-order/timeslot/get` | `fulfillment_supply` | ДОБАВИТЬ | `supply_order_timeslot_get` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 206 | `/v1/warehouse/fbo/list` | `fulfillment_supply` | ДОБАВИТЬ | `warehouse_fbo_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 207 | `/v1/warehouse/fbo/seller/list` | `fulfillment_supply` | ДОБАВИТЬ | `seller_fbo_warehouse_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 208 | `/v1/warehouse/fbs/create/drop-off/list` | `warehouses_logistics` | ДОБАВИТЬ | `warehouse_fbs_create_drop_off_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 209 | `/v1/warehouse/fbs/create/drop-off/timeslot/list` | `warehouses_logistics` | ДОБАВИТЬ | `warehouse_fbs_create_drop_off_timeslot_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 210 | `/v1/warehouse/fbs/create/pick-up/timeslot/list` | `warehouses_logistics` | ДОБАВИТЬ | `warehouse_fbs_create_pick_up_timeslot_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 211 | `/v1/warehouse/fbs/create/return-point/list` | `warehouses_logistics` | ДОБАВИТЬ | `warehouse_fbs_create_return_point_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 212 | `/v1/warehouse/fbs/pickup/history/list` | `warehouses_logistics` | ДОБАВИТЬ | `warehouse_fbs_pickup_history_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 213 | `/v1/warehouse/fbs/pickup/planning/list` | `warehouses_logistics` | ДОБАВИТЬ | `warehouse_fbs_pickup_planning_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 214 | `/v1/warehouse/fbs/return-mile/check` | `warehouses_logistics` | ДОБАВИТЬ | `warehouse_fbs_return_mile_check` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 215 | `/v1/warehouse/fbs/return-mile/info` | `warehouses_logistics` | ДОБАВИТЬ | `warehouse_fbs_return_mile_info` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 216 | `/v1/warehouse/fbs/update/drop-off/list` | `warehouses_logistics` | ДОБАВИТЬ | `warehouse_fbs_update_drop_off_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 217 | `/v1/warehouse/fbs/update/drop-off/timeslot/list` | `warehouses_logistics` | ДОБАВИТЬ | `warehouse_fbs_update_drop_off_timeslot_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 218 | `/v1/warehouse/fbs/update/pick-up/timeslot/list` | `warehouses_logistics` | ДОБАВИТЬ | `warehouse_fbs_update_pick_up_timeslot_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 219 | `/v1/warehouse/fbs/update/return-point/list` | `warehouses_logistics` | ДОБАВИТЬ | `warehouse_fbs_update_return_point_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 220 | `/v1/warehouse/invalid-products/get` | `warehouses_logistics` | ДОБАВИТЬ | `warehouse_invalid_products_get` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 221 | `/v1/warehouse/operation/status` | `warehouses_logistics` | ДОБАВИТЬ | `warehouse_operation_status` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 222 | `/v1/warehouse/ozon/list` | `warehouses_logistics` | ДОБАВИТЬ | `ozon_warehouse_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 223 | `/v1/warehouse/product/prices` | `pricing_promotions` | ДОБАВИТЬ | `warehouse_product_prices` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 224 | `/v1/warehouse/product/prices/info` | `pricing_promotions` | ДОБАВИТЬ | `warehouse_product_prices_info` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 225 | `/v1/warehouse/warehouses-with-invalid-products` | `warehouses_logistics` | ДОБАВИТЬ | `warehouse_warehouses_with_invalid_products` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 226 | `/v2/actions/discounts-task/list` | `pricing_promotions` | ДОБАВИТЬ | `actions_discounts_task_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 227 | `/v2/analytics/stock_on_warehouses` | `stock_inventory` | ДОБАВИТЬ | `analytics_stock_by_warehouse` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 228 | `/v2/cargoes/create/info` | `fulfillment_supply` | ДОБАВИТЬ | `cargoes_create_info` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 229 | `/v2/cargoes/delete` | `fulfillment_supply` | НЕ ДОБАВЛЯТЬ: меняет данные/остатки/рабочий статус | — | обычный/без отдельного Premium-требования в текущем индексе | — |
| 230 | `/v2/cargoes/delete/status` | `fulfillment_supply` | ДОБАВИТЬ | `cargoes_delete_status` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 231 | `/v2/cargoes/get` | `fulfillment_supply` | ДОБАВИТЬ | `cargoes_get` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 232 | `/v2/carriage/delivery/list` | `fbs_orders_delivery` | ДОБАВИТЬ | `carriage_delivery_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 233 | `/v2/category/attribute/value/by-option` | `catalog_products` | ДОБАВИТЬ | `category_attribute_value_by_option` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 234 | `/v2/chat/file/*` | `customer_communications` | НЕ ДОБАВЛЯТЬ: покупатель/контакты/личная переписка | — | обычный/без отдельного Premium-требования в текущем индексе | — |
| 235 | `/v2/chat/file/{bucketName}/*` | `customer_communications` | НЕ ДОБАВЛЯТЬ: покупатель/контакты/личная переписка | — | обычный/без отдельного Premium-требования в текущем индексе | — |
| 236 | `/v2/chat/history` | `customer_communications` | НЕ ДОБАВЛЯТЬ: покупатель/контакты/личная переписка | — | обычный/без отдельного Premium-требования в текущем индексе | — |
| 237 | `/v2/chat/list` | `customer_communications` | НЕ ДОБАВЛЯТЬ: покупатель/контакты/личная переписка | — | обычный/без отдельного Premium-требования в текущем индексе | — |
| 238 | `/v2/cluster/list` | `fulfillment_supply` | ДОБАВИТЬ | `cluster_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 239 | `/v2/conditional-cancellation/list` | `returns_cancellations` | ДОБАВИТЬ | `conditional_cancellation_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 240 | `/v2/delivery-method/list` | `warehouses_logistics` | ДОБАВИТЬ | `delivery_method_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 241 | `/v2/draft/create/info` | `fulfillment_supply` | ДОБАВИТЬ | `draft_create_info` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 242 | `/v2/draft/supply/create/status` | `fulfillment_supply` | ДОБАВИТЬ | `draft_supply_create_status` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 243 | `/v2/draft/timeslot/info` | `fulfillment_supply` | ДОБАВИТЬ | `draft_timeslot_info` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 244 | `/v2/finance/realization` | `finance_accounting` | ДОБАВИТЬ | `finance_realization` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 245 | `/v2/invoice/get` | `finance_accounting` | ДОБАВИТЬ | `invoice_get` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 246 | `/v2/posting/digital/list` | `fbs_orders_delivery` | ДОБАВИТЬ С ФИЛЬТРАЦИЕЙ | `posting_digital_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 247 | `/v2/posting/fbo/get` | `fbs_orders_delivery` | ДОБАВИТЬ С ФИЛЬТРАЦИЕЙ | `posting_fbo_get` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 248 | `/v2/posting/fbo/list` | `fbs_orders_delivery` | НЕ ДОБАВЛЯТЬ: старая/выводимая версия | — | обычный/без отдельного Premium-требования в текущем индексе | `/v3/posting/fbo/list` |
| 249 | `/v2/posting/fbs/act/check-status` | `fbs_orders_delivery` | ДОБАВИТЬ | `posting_fbs_act_check_status` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 250 | `/v2/posting/fbs/act/get-barcode` | `fbs_orders_delivery` | НЕ ДОБАВЛЯТЬ: чувствительный файл/этикетка/штрихкод/PDF | — | обычный/без отдельного Premium-требования в текущем индексе | — |
| 251 | `/v2/posting/fbs/act/get-barcode/text` | `fbs_orders_delivery` | НЕ ДОБАВЛЯТЬ: чувствительный файл/этикетка/штрихкод/PDF | — | обычный/без отдельного Premium-требования в текущем индексе | — |
| 252 | `/v2/posting/fbs/act/get-container-labels` | `fbs_orders_delivery` | НЕ ДОБАВЛЯТЬ: чувствительный файл/этикетка/штрихкод/PDF | — | обычный/без отдельного Premium-требования в текущем индексе | — |
| 253 | `/v2/posting/fbs/act/get-pdf` | `fbs_orders_delivery` | НЕ ДОБАВЛЯТЬ: чувствительный файл/этикетка/штрихкод/PDF | — | обычный/без отдельного Premium-требования в текущем индексе | — |
| 254 | `/v2/posting/fbs/act/get-postings` | `fbs_orders_delivery` | ДОБАВИТЬ С ФИЛЬТРАЦИЕЙ | `posting_fbs_act_get_postings_v2` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 255 | `/v2/posting/fbs/act/list` | `fbs_orders_delivery` | ДОБАВИТЬ | `posting_fbs_act_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
