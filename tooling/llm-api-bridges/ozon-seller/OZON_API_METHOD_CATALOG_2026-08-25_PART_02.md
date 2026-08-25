# Ozon Seller API method catalog — part 02/06

Rows 52–102 of 303. Fixed columns: path, cluster, decision, alias, access, replacement.

| # | Path | Cluster | Решение | Alias | Доступ | Замена |
|---:|---|---|---|---|---|---|
| 52 | `/v1/delivery-method/return/settings/get` | `returns_cancellations` | ДОБАВИТЬ | `delivery_method_return_settings_get` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 53 | `/v1/description-category/attribute` | `catalog_products` | ДОБАВИТЬ | `description_category_attribute` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 54 | `/v1/description-category/attribute/values` | `catalog_products` | ДОБАВИТЬ | `description_category_attribute_values` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 55 | `/v1/description-category/tips` | `catalog_products` | ДОБАВИТЬ | `description_category_tips` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 56 | `/v1/description-category/tree` | `catalog_products` | ДОБАВИТЬ | `description_category_tree` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 57 | `/v1/fbp/act-from/get` | `fulfillment_supply` | ДОБАВИТЬ | `fbp_act_from_get` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 58 | `/v1/fbp/act-to/get` | `fulfillment_supply` | ДОБАВИТЬ | `fbp_act_to_get` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 59 | `/v1/fbp/archive/get` | `fulfillment_supply` | ДОБАВИТЬ | `fbp_archive_get` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 60 | `/v1/fbp/archive/list` | `fulfillment_supply` | ДОБАВИТЬ | `fbp_archive_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 61 | `/v1/fbp/draft/direct/timeslot/get` | `fulfillment_supply` | ДОБАВИТЬ | `fbp_draft_direct_timeslot_get` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 62 | `/v1/fbp/draft/drop-off/point/list` | `fulfillment_supply` | ДОБАВИТЬ | `fbp_draft_drop_off_point_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 63 | `/v1/fbp/draft/drop-off/point/timetable` | `fulfillment_supply` | ДОБАВИТЬ | `fbp_draft_drop_off_point_timetable` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 64 | `/v1/fbp/draft/drop-off/province/list` | `fulfillment_supply` | ДОБАВИТЬ | `fbp_draft_drop_off_province_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 65 | `/v1/fbp/draft/get` | `fulfillment_supply` | ДОБАВИТЬ | `fbp_draft_get` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 66 | `/v1/fbp/draft/list` | `fulfillment_supply` | ДОБАВИТЬ | `fbp_draft_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 67 | `/v1/fbp/label/get` | `fulfillment_supply` | НЕ ДОБАВЛЯТЬ: чувствительный файл/этикетка/штрихкод/PDF | — | обычный/без отдельного Premium-требования в текущем индексе | — |
| 68 | `/v1/fbp/order/direct/timeslot/list` | `fulfillment_supply` | ДОБАВИТЬ С ФИЛЬТРАЦИЕЙ | `fbp_order_direct_timeslot_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 69 | `/v1/fbp/order/drop-off/timetable` | `fulfillment_supply` | ДОБАВИТЬ С ФИЛЬТРАЦИЕЙ | `fbp_order_drop_off_timetable` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 70 | `/v1/fbp/order/get` | `fulfillment_supply` | ДОБАВИТЬ С ФИЛЬТРАЦИЕЙ | `fbp_order_get` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 71 | `/v1/fbp/order/list` | `fulfillment_supply` | ДОБАВИТЬ С ФИЛЬТРАЦИЕЙ | `fbp_order_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 72 | `/v1/fbp/warehouse/list` | `fulfillment_supply` | ДОБАВИТЬ | `fbp_warehouse_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 73 | `/v1/finance/accrual/by-day` | `finance_accounting` | ДОБАВИТЬ | `finance_accrual_by_day` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 74 | `/v1/finance/accrual/postings` | `finance_accounting` | ДОБАВИТЬ | `finance_accrual_postings` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 75 | `/v1/finance/accrual/types` | `finance_accounting` | ДОБАВИТЬ | `finance_accrual_types` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 76 | `/v1/finance/balance` | `finance_accounting` | ДОБАВИТЬ | `finance_balance` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 77 | `/v1/finance/cash-flow-statement/list` | `finance_accounting` | ДОБАВИТЬ | `finance_cash_flow_statement_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 78 | `/v1/finance/compensation` | `finance_accounting` | ДОБАВИТЬ С ФИЛЬТРАЦИЕЙ | `finance_compensation` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 79 | `/v1/finance/decompensation` | `finance_accounting` | ДОБАВИТЬ С ФИЛЬТРАЦИЕЙ | `finance_decompensation` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 80 | `/v1/finance/document-b2b-sales` | `finance_accounting` | НЕ ДОБАВЛЯТЬ: чувствительный файл/этикетка/штрихкод/PDF | — | обычный/без отдельного Premium-требования в текущем индексе | — |
| 81 | `/v1/finance/document-b2b-sales/json` | `finance_accounting` | ДОБАВИТЬ С ФИЛЬТРАЦИЕЙ | `finance_document_b2b_sales_json` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 82 | `/v1/finance/mutual-settlement` | `finance_accounting` | ДОБАВИТЬ | `finance_mutual_settlement` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 83 | `/v1/finance/products/buyout` | `finance_accounting` | ДОБАВИТЬ | `finance_products_buyout` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 84 | `/v1/finance/realization` | `finance_accounting` | НЕ ДОБАВЛЯТЬ: старая/выводимая версия | — | обычный/без отдельного Premium-требования в текущем индексе | `/v2/finance/realization` |
| 85 | `/v1/finance/realization/by-day` | `finance_accounting` | ДОБАВИТЬ | `finance_realization_by_day` | Premium-family | — |
| 86 | `/v1/finance/realization/posting` | `finance_accounting` | ДОБАВИТЬ | `finance_realization_posting` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 87 | `/v1/notification/check` | `notifications_integrations` | НЕ ДОБАВЛЯТЬ: внешний URL | — | обычный/без отдельного Premium-требования в текущем индексе | — |
| 88 | `/v1/notification/list` | `notifications_integrations` | ДОБАВИТЬ | `notification_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 89 | `/v1/notification/push-type/list` | `notifications_integrations` | ДОБАВИТЬ | `notification_push_type_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 90 | `/v1/pass/list` | `fbs_orders_delivery` | ДОБАВИТЬ | `pass_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 91 | `/v1/posting/digital/list` | `fbs_orders_delivery` | НЕ ДОБАВЛЯТЬ: старая/выводимая версия | — | обычный/без отдельного Premium-требования в текущем индексе | `/v2/posting/digital/list` |
| 92 | `/v1/posting/fbo/cancel-reason/list` | `fbs_orders_delivery` | ДОБАВИТЬ | `posting_fbo_cancel_reason_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 93 | `/v1/posting/fbp/get` | `fbs_orders_delivery` | ДОБАВИТЬ С ФИЛЬТРАЦИЕЙ | `posting_fbp_get` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 94 | `/v1/posting/fbs/cancel-reason` | `fbs_orders_delivery` | ДОБАВИТЬ | `posting_fbs_cancel_reason` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 95 | `/v1/posting/fbs/package-label/get` | `fbs_orders_delivery` | НЕ ДОБАВЛЯТЬ: чувствительный файл/этикетка/штрихкод/PDF | — | обычный/без отдельного Premium-требования в текущем индексе | — |
| 96 | `/v1/posting/fbs/presort/box/list` | `fbs_orders_delivery` | ДОБАВИТЬ | `posting_fbs_presort_box_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 97 | `/v1/posting/fbs/presort/list` | `fbs_orders_delivery` | ДОБАВИТЬ | `posting_fbs_presort_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 98 | `/v1/posting/fbs/presort/validate` | `fbs_orders_delivery` | ДОБАВИТЬ | `posting_fbs_presort_validate` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 99 | `/v1/posting/fbs/product/traceable/attribute` | `fbs_orders_delivery` | ДОБАВИТЬ | `posting_fbs_product_traceable_attribute` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 100 | `/v1/posting/fbs/restrictions` | `fbs_orders_delivery` | ДОБАВИТЬ | `posting_fbs_restrictions` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 101 | `/v1/posting/global/etgb` | `fbs_orders_delivery` | ДОБАВИТЬ С ФИЛЬТРАЦИЕЙ | `posting_global_etgb` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 102 | `/v1/posting/unpaid-legal/product/list` | `fbs_orders_delivery` | ДОБАВИТЬ С ФИЛЬТРАЦИЕЙ | `posting_unpaid_legal_product_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
