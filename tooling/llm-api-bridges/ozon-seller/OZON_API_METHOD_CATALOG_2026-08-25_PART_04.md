# Ozon Seller API method catalog — part 04/06

Rows 154–204 of 303. Fixed columns: path, cluster, decision, alias, access, replacement.

| # | Path | Cluster | Решение | Alias | Доступ | Замена |
|---:|---|---|---|---|---|---|
| 154 | `/v1/report/marked-products-sales/create` | `reports_documents` | ДОБАВИТЬ КАК ВЫГРУЗКУ | `report_marked_products_sales_create` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 155 | `/v1/report/placement/by-products/create` | `stock_inventory` | ДОБАВИТЬ КАК ВЫГРУЗКУ | `report_placement_by_products_create` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 156 | `/v1/report/placement/by-supplies/create` | `stock_inventory` | ДОБАВИТЬ КАК ВЫГРУЗКУ | `report_placement_by_supplies_create` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 157 | `/v1/report/postings/create` | `reports_documents` | ДОБАВИТЬ КАК ВЫГРУЗКУ | `report_postings_create` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 158 | `/v1/report/products/create` | `reports_documents` | ДОБАВИТЬ КАК ВЫГРУЗКУ | `report_products_create` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 159 | `/v1/report/products/movement/create` | `stock_inventory` | ДОБАВИТЬ КАК ВЫГРУЗКУ | `report_products_movement_create` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 160 | `/v1/report/products/prices/create` | `pricing_promotions` | ДОБАВИТЬ КАК ВЫГРУЗКУ | `report_products_prices_create` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 161 | `/v1/report/realization/posting/create` | `reports_documents` | ДОБАВИТЬ КАК ВЫГРУЗКУ | `report_realization_posting_create` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 162 | `/v1/report/returns/create` | `reports_documents` | НЕ ДОБАВЛЯТЬ: старая/выводимая версия | — | обычный/без отдельного Premium-требования в текущем индексе | `/v2/report/returns/create` |
| 163 | `/v1/report/stock/create` | `stock_inventory` | ДОБАВИТЬ КАК ВЫГРУЗКУ | `report_stock_create` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 164 | `/v1/report/transactions/create` | `reports_documents` | ДОБАВИТЬ КАК ВЫГРУЗКУ | `report_transactions_create` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 165 | `/v1/report/warehouse/stock` | `stock_inventory` | ДОБАВИТЬ КАК ВЫГРУЗКУ | `warehouse_stock_report` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 166 | `/v1/return/giveout/get-pdf` | `returns_cancellations` | НЕ ДОБАВЛЯТЬ: чувствительный файл/этикетка/штрихкод/PDF | — | обычный/без отдельного Premium-требования в текущем индексе | — |
| 167 | `/v1/return/giveout/get-png` | `returns_cancellations` | НЕ ДОБАВЛЯТЬ: чувствительный файл/этикетка/штрихкод/PDF | — | обычный/без отдельного Premium-требования в текущем индексе | — |
| 168 | `/v1/return/giveout/info` | `returns_cancellations` | ДОБАВИТЬ С ФИЛЬТРАЦИЕЙ | `return_giveout_info` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 169 | `/v1/return/giveout/list` | `returns_cancellations` | ДОБАВИТЬ С ФИЛЬТРАЦИЕЙ | `return_giveout_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 170 | `/v1/returns/company/fbs/info` | `returns_cancellations` | ДОБАВИТЬ С ФИЛЬТРАЦИЕЙ | `returns_company_fbs_info` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 171 | `/v1/returns/list` | `returns_cancellations` | ДОБАВИТЬ С ФИЛЬТРАЦИЕЙ | `returns_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 172 | `/v1/returns/rfbs/get` | `returns_cancellations` | НЕ ДОБАВЛЯТЬ: старая/выводимая версия | — | обычный/без отдельного Premium-требования в текущем индексе | `/v2/returns/rfbs/get` |
| 173 | `/v1/returns/rfbs/list` | `returns_cancellations` | НЕ ДОБАВЛЯТЬ: старая/выводимая версия | — | обычный/без отдельного Premium-требования в текущем индексе | `/v2/returns/rfbs/list` |
| 174 | `/v1/returns/settings/utilization/history` | `returns_cancellations` | ДОБАВИТЬ С ФИЛЬТРАЦИЕЙ | `returns_settings_utilization_history` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 175 | `/v1/returns/settings/utilization/info` | `returns_cancellations` | ДОБАВИТЬ С ФИЛЬТРАЦИЕЙ | `returns_settings_utilization_info` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 176 | `/v1/review/comment/list` | `reviews_questions` | ДОБАВИТЬ С ФИЛЬТРАЦИЕЙ | `review_comment_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 177 | `/v1/review/count` | `reviews_questions` | НЕ ДОБАВЛЯТЬ: старая/выводимая версия | — | обычный/без отдельного Premium-требования в текущем индексе | `/v2/review/count` |
| 178 | `/v1/review/info` | `reviews_questions` | НЕ ДОБАВЛЯТЬ: старая/выводимая версия | — | обычный/без отдельного Premium-требования в текущем индексе | `/v2/review/info` |
| 179 | `/v1/review/list` | `reviews_questions` | НЕ ДОБАВЛЯТЬ: старая/выводимая версия | — | обычный/без отдельного Premium-требования в текущем индексе | `/v2/review/list` |
| 180 | `/v1/roles` | `account_access` | УЖЕ РАБОТАЕТ | `roles` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 181 | `/v1/search-queries/text` | `search_visibility` | ДОБАВИТЬ | `search_queries_text` | Premium-family | — |
| 182 | `/v1/search-queries/top` | `search_visibility` | ДОБАВИТЬ | `search_queries_top` | Premium-family | — |
| 183 | `/v1/seller-actions/list` | `pricing_promotions` | ДОБАВИТЬ | `seller_actions_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 184 | `/v1/seller-actions/products/candidates` | `pricing_promotions` | ДОБАВИТЬ | `seller_actions_products_candidates` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 185 | `/v1/seller-actions/products/list` | `pricing_promotions` | ДОБАВИТЬ | `seller_actions_products_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 186 | `/v1/seller-actions/voucher/get` | `pricing_promotions` | ДОБАВИТЬ | `seller_actions_voucher_get` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 187 | `/v1/seller/info` | `account_access` | ДОБАВИТЬ | `seller_info` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 188 | `/v1/seller/ozon-logistics/info` | `warehouses_logistics` | ДОБАВИТЬ | `seller_ozon_logistics_info` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 189 | `/v1/supplier/available_warehouses` | `fulfillment_supply` | ДОБАВИТЬ | `supplier_available_warehouses` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 190 | `/v1/supplier/orders/{orderId}/waybill_acceptance_results` | `fulfillment_supply` | ДОБАВИТЬ | `supplier_orders_orderid_waybill_acceptance_results` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 191 | `/v1/supplier/waybill_acceptance_results/{waybillId}` | `fulfillment_supply` | ДОБАВИТЬ | `supplier_waybill_acceptance_results_waybillid` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 192 | `/v1/supply-order/act/accept/status` | `fulfillment_supply` | ДОБАВИТЬ | `supply_order_act_accept_status` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 193 | `/v1/supply-order/act/product/get` | `fulfillment_supply` | ДОБАВИТЬ | `supply_order_act_product_get` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 194 | `/v1/supply-order/act/summary/get` | `fulfillment_supply` | ДОБАВИТЬ | `supply_order_act_summary_get` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 195 | `/v1/supply-order/bundle` | `fulfillment_supply` | ДОБАВИТЬ | `supply_order_bundle` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 196 | `/v1/supply-order/cancel/status` | `fulfillment_supply` | ДОБАВИТЬ | `supply_order_cancel_status` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 197 | `/v1/supply-order/content/update/status` | `fulfillment_supply` | ДОБАВИТЬ | `supply_order_content_update_status` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 198 | `/v1/supply-order/content/update/validation` | `fulfillment_supply` | ДОБАВИТЬ | `supply_order_content_update_validation` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 199 | `/v1/supply-order/details` | `fulfillment_supply` | УЖЕ РАБОТАЕТ | `supply_order_details` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 200 | `/v1/supply-order/get` | `fulfillment_supply` | НЕ ДОБАВЛЯТЬ: старая/выводимая версия | — | обычный/без отдельного Premium-требования в текущем индексе | `/v3/supply-order/get` |
| 201 | `/v1/supply-order/items` | `fulfillment_supply` | ДОБАВИТЬ | `supply_order_items` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 202 | `/v1/supply-order/list` | `fulfillment_supply` | НЕ ДОБАВЛЯТЬ: старая/выводимая версия | — | обычный/без отдельного Premium-требования в текущем индексе | `/v3/supply-order/list` |
| 203 | `/v1/supply-order/shipment-plan-compliance/get` | `fulfillment_supply` | ДОБАВИТЬ | `supply_order_shipment_plan_compliance_get` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 204 | `/v1/supply-order/status/counter` | `fulfillment_supply` | ДОБАВИТЬ | `supply_order_status_counter` | обычный/без отдельного Premium-требования в текущем индексе | — |
