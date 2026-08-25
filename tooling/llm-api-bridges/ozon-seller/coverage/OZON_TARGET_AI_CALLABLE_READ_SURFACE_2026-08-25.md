# Ozon Seller API — target AI-callable read surface

Date: **2026-08-25**. Total target methods: **231** (8 current + 223 new).

Legend: `personal` = personal-data safe projection + explicit opt-in; `sensitive` = confidential business-data opt-in; `workflow` = explicit report/label read workflow; `file` = bounded file result; `premium` = capability/entitlement check.

## `account_access` — 2

- `/v1/roles` → `roles` (current)
- `/v1/seller/ozon-logistics/info` → `seller_ozon_logistics_info` (add)

## `catalog_products` — 13

- `/v1/product/import/info` → `product_import_info` (add)
- `/v1/product/info/description` → `product_info_description` (add)
- `/v1/product/info/subscription` → `product_info_subscription` (add)
- `/v1/product/info/wrong-volume` → `product_info_wrong_volume` (add)
- `/v1/product/quant/info` → `product_quant_info` (add)
- `/v1/product/quant/list` → `product_quant_list` (add)
- `/v1/product/rating-by-sku` → `product_rating_by_sku` (add)
- `/v1/product/related-sku/get` → `product_related_sku_get` (add)
- `/v2/product/pictures/info` → `product_pictures_info` (add)
- `/v3/product/info/list` → `product_info_list` (add)
- `/v3/product/list` → `product_list` (add)
- `/v4/product/info/attributes` → `product_info_attributes` (add)
- `/v4/product/info/limit` → `product_info_limit` (add)

## `catalog_reference` — 17

- `/v1/brand/company-certification/list` → `brand_company_certification_list` (add)
- `/v1/description-category/attribute` → `description_category_attribute` (add)
- `/v1/description-category/attribute/values` → `description_category_attribute_values` (add)
- `/v1/description-category/tips` → `description_category_tips` (add)
- `/v1/description-category/tree` → `description_category_tree` (add)
- `/v1/product/certificate/accordance-types` → `product_certificate_accordance_types` (add)
- `/v1/product/certificate/info` → `product_certificate_info` (add)
- `/v1/product/certificate/list` → `product_certificate_list` (add)
- `/v1/product/certificate/product_status/list` → `product_certificate_product_status_list` (add)
- `/v1/product/certificate/products/list` → `product_certificate_products_list` (add)
- `/v1/product/certificate/rejection_reasons/list` → `product_certificate_rejection_reasons_list` (add)
- `/v1/product/certificate/status/list` → `product_certificate_status_list` (add)
- `/v1/product/certificate/types` → `product_certificate_types` (add)
- `/v1/product/placement-zone/info` → `product_placement_zone_info` (add)
- `/v2/category/attribute/value/by-option` → `category_attribute_value_by_option` (add)
- `/v2/product/certificate/accordance-types/list` → `product_certificate_accordance_types_list` (add)
- `/v2/product/certification/list` → `product_certification_list` (add)

## `stock_inventory` — 7

- `/v1/analytics/stocks` → `analytics_stocks` (add)
- `/v1/analytics/turnover/stocks` → `analytics_turnover_stocks` (add)
- `/v1/product/info/stocks-by-warehouse/fbo` → `product_info_stocks_by_warehouse_fbo` (add)
- `/v1/product/info/warehouse/stocks` → `product_info_warehouse_stocks` (add)
- `/v2/analytics/stock_on_warehouses` → `analytics_stock_on_warehouses` (add)
- `/v2/product/info/stocks-by-warehouse/fbs` → `product_info_stocks_by_warehouse_fbs` (add)
- `/v4/product/info/stocks` → `stocks_current` (current)

## `warehouses_logistics` — 24

- `/v1/cluster/list` → `cluster_list_v1` (add)
- `/v1/delivery-method/return/settings/get` → `delivery_method_return_settings_get` (add)
- `/v1/supplier/available_warehouses` → `supplier_available_warehouses` (add)
- `/v1/warehouse/fbo/list` → `warehouse_fbo_list` (add)
- `/v1/warehouse/fbo/seller/list` → `warehouse_fbo_seller_list` (add)
- `/v1/warehouse/fbs/create/drop-off/list` → `warehouse_fbs_create_drop_off_list` (add)
- `/v1/warehouse/fbs/create/drop-off/timeslot/list` → `warehouse_fbs_create_drop_off_timeslot_list` (add)
- `/v1/warehouse/fbs/create/pick-up/timeslot/list` → `warehouse_fbs_create_pick_up_timeslot_list` (add)
- `/v1/warehouse/fbs/create/return-point/list` → `warehouse_fbs_create_return_point_list` (add)
- `/v1/warehouse/fbs/pickup/history/list` → `warehouse_fbs_pickup_history_list` (add)
- `/v1/warehouse/fbs/pickup/planning/list` → `warehouse_fbs_pickup_planning_list` (add)
- `/v1/warehouse/fbs/return-mile/check` → `warehouse_fbs_return_mile_check` (add)
- `/v1/warehouse/fbs/return-mile/info` → `warehouse_fbs_return_mile_info` (add)
- `/v1/warehouse/fbs/update/drop-off/list` → `warehouse_fbs_update_drop_off_list` (add)
- `/v1/warehouse/fbs/update/drop-off/timeslot/list` → `warehouse_fbs_update_drop_off_timeslot_list` (add)
- `/v1/warehouse/fbs/update/pick-up/timeslot/list` → `warehouse_fbs_update_pick_up_timeslot_list` (add)
- `/v1/warehouse/fbs/update/return-point/list` → `warehouse_fbs_update_return_point_list` (add)
- `/v1/warehouse/invalid-products/get` → `warehouse_invalid_products_get` (add)
- `/v1/warehouse/operation/status` → `warehouse_operation_status` (add)
- `/v1/warehouse/ozon/list` → `warehouse_ozon_list` (add)
- `/v1/warehouse/warehouses-with-invalid-products` → `warehouse_warehouses_with_invalid_products` (add)
- `/v2/cluster/list` → `cluster_list_v2` (add)
- `/v2/delivery-method/list` → `delivery_method_list` (add)
- `/v2/warehouse/list` → `warehouse_list` (add)

## `sales_analytics` — 1

- `/v1/analytics/data` → `analytics_data` (current) [premium]

## `search_visibility` — 5

- `/v1/analytics/product-queries` → `product_queries` (current) [premium]
- `/v1/analytics/product-queries/details` → `product_queries_details` (current) [premium]
- `/v1/product/visibility/info` → `product_visibility_info` (add)
- `/v1/search-queries/text` → `search_queries_text` (add) [premium]
- `/v1/search-queries/top` → `search_queries_top` (add) [premium]

## `orders_fbo` — 3

- `/v1/posting/fbo/cancel-reason/list` → `posting_fbo_cancel_reason_list` (add)
- `/v2/posting/fbo/get` → `posting_fbo_get` (add)
- `/v3/posting/fbo/list` → `posting_fbo_list` (current)

## `orders_fbs` — 22

- `/v1/posting/fbs/cancel-reason` → `posting_fbs_cancel_reason` (add)
- `/v1/posting/fbs/package-label/get` → `posting_fbs_package_label_get` (add) [personal]
- `/v1/posting/fbs/product/traceable/attribute` → `posting_fbs_product_traceable_attribute` (add)
- `/v1/posting/fbs/restrictions` → `posting_fbs_restrictions` (add)
- `/v1/posting/global/etgb` → `posting_global_etgb` (add)
- `/v1/posting/unpaid-legal/product/list` → `posting_unpaid_legal_product_list` (add)
- `/v2/posting/digital/list` → `posting_digital_list` (add)
- `/v2/posting/fbs/act/check-status` → `posting_fbs_act_check_status` (add)
- `/v2/posting/fbs/act/get-barcode` → `posting_fbs_act_get_barcode` (add) [personal]
- `/v2/posting/fbs/act/get-barcode/text` → `posting_fbs_act_get_barcode_text` (add) [personal]
- `/v2/posting/fbs/act/get-container-labels` → `posting_fbs_act_get_container_labels` (add) [personal]
- `/v2/posting/fbs/act/get-pdf` → `posting_fbs_act_get_pdf` (add) [personal]
- `/v2/posting/fbs/act/get-postings` → `posting_fbs_act_get_postings` (add) [personal]
- `/v2/posting/fbs/act/list` → `posting_fbs_act_list` (add) [personal]
- `/v2/posting/fbs/cancel-reason/list` → `posting_fbs_cancel_reason_list` (add) [personal]
- `/v2/posting/fbs/get-by-barcode` → `posting_fbs_get_by_barcode` (add) [personal]
- `/v2/posting/fbs/package-label` → `posting_fbs_package_label` (add) [file]
- `/v2/posting/fbs/product/country/list` → `posting_fbs_product_country_list` (add) [personal]
- `/v3/posting/fbs/get` → `posting_fbs_get` (add) [personal]
- `/v4/posting/fbs/list` → `posting_fbs_list` (add) [personal]
- `/v4/posting/fbs/unfulfilled/list` → `posting_fbs_unfulfilled_list` (add) [personal]
- `/v5/fbs/posting/product/exemplar/status` → `fbs_posting_product_exemplar_status` (add)

## `fulfillment_supply` — 39

- `/v1/cargoes-label/create` → `cargoes_label_create` (add) [workflow]
- `/v1/cargoes-label/file/*` → `cargoes_label_file_file` (add) [file]
- `/v1/cargoes-label/get` → `cargoes_label_get` (add)
- `/v1/cargoes/delete/status` → `cargoes_delete_status_v1` (add)
- `/v1/cargoes/get` → `cargoes_get_v1` (add)
- `/v1/cargoes/label/transport-by-order/create` → `cargoes_label_transport_by_order_create` (add) [workflow]
- `/v1/cargoes/label/transport-by-order/status` → `cargoes_label_transport_by_order_status` (add)
- `/v1/cargoes/label/transport/create` → `cargoes_label_transport_create` (add) [workflow]
- `/v1/cargoes/label/transport/status` → `cargoes_label_transport_status` (add)
- `/v1/cargoes/rules/get` → `cargoes_rules_get` (add)
- `/v1/cargoes/supplies/get` → `cargoes_supplies_get` (add)
- `/v1/cargoes/transport/activate/status` → `cargoes_transport_activate_status` (add)
- `/v1/cargoes/transport/bind/status` → `cargoes_transport_bind_status` (add)
- `/v1/cargoes/transport/create/status` → `cargoes_transport_create_status` (add)
- `/v1/carriage/act-discrepancy/pdf` → `carriage_act_discrepancy_pdf` (add) [file]
- `/v1/carriage/courier-contact/get` → `carriage_courier_contact_get` (add) [personal]
- `/v1/carriage/ettn/status` → `carriage_ettn_status` (add)
- `/v1/carriage/get` → `carriage_get` (add)
- `/v1/pass/list` → `pass_list` (add)
- `/v1/supply-order/act/accept/status` → `supply_order_act_accept_status` (add)
- `/v1/supply-order/act/product/get` → `supply_order_act_product_get` (add)
- `/v1/supply-order/act/summary/get` → `supply_order_act_summary_get` (add)
- `/v1/supply-order/bundle` → `supply_order_bundle` (add)
- `/v1/supply-order/cancel/status` → `supply_order_cancel_status` (add)
- `/v1/supply-order/content/update/status` → `supply_order_content_update_status` (add)
- `/v1/supply-order/content/update/validation` → `supply_order_content_update_validation` (add)
- `/v1/supply-order/details` → `supply_order_details` (current)
- `/v1/supply-order/status/counter` → `supply_order_status_counter` (add)
- `/v1/supply-order/timeslot/get` → `supply_order_timeslot_get` (add)
- `/v2/cargoes/create/info` → `cargoes_create_info` (add)
- `/v2/cargoes/delete/status` → `cargoes_delete_status_v2` (add)
- `/v2/cargoes/get` → `cargoes_get_v2` (add)
- `/v2/carriage/delivery/list` → `carriage_delivery_list` (add)
- `/v2/draft/create/info` → `draft_create_info` (add)
- `/v2/draft/supply/create/status` → `draft_supply_create_status` (add)
- `/v2/draft/timeslot/info` → `draft_timeslot_info` (add)
- `/v2/supply-order/timeslot/list` → `supply_order_timeslot_list` (add)
- `/v3/supply-order/get` → `supply_order_get` (current)
- `/v3/supply-order/list` → `supply_order_list` (add)

## `fbp_fulfillment` — 17

- `/v1/fbp/act-from/get` → `fbp_act_from_get` (add)
- `/v1/fbp/act-to/get` → `fbp_act_to_get` (add)
- `/v1/fbp/archive/get` → `fbp_archive_get` (add)
- `/v1/fbp/archive/list` → `fbp_archive_list` (add)
- `/v1/fbp/draft/direct/timeslot/get` → `fbp_draft_direct_timeslot_get` (add)
- `/v1/fbp/draft/drop-off/point/list` → `fbp_draft_drop_off_point_list` (add)
- `/v1/fbp/draft/drop-off/point/timetable` → `fbp_draft_drop_off_point_timetable` (add)
- `/v1/fbp/draft/drop-off/province/list` → `fbp_draft_drop_off_province_list` (add)
- `/v1/fbp/draft/get` → `fbp_draft_get` (add)
- `/v1/fbp/draft/list` → `fbp_draft_list` (add)
- `/v1/fbp/label/get` → `fbp_label_get` (add)
- `/v1/fbp/order/direct/timeslot/list` → `fbp_order_direct_timeslot_list` (add)
- `/v1/fbp/order/drop-off/timetable` → `fbp_order_drop_off_timetable` (add)
- `/v1/fbp/order/get` → `fbp_order_get` (add)
- `/v1/fbp/order/list` → `fbp_order_list` (add)
- `/v1/fbp/warehouse/list` → `fbp_warehouse_list` (add)
- `/v1/posting/fbp/get` → `posting_fbp_get` (add)

## `returns_cancellations` — 11

- `/v1/return/giveout/get-pdf` → `return_giveout_get_pdf` (add) [personal]
- `/v1/return/giveout/get-png` → `return_giveout_get_png` (add) [personal]
- `/v1/return/giveout/info` → `return_giveout_info` (add) [personal]
- `/v1/return/giveout/list` → `return_giveout_list` (add) [personal]
- `/v1/returns/company/fbs/info` → `returns_company_fbs_info` (add) [personal]
- `/v1/returns/list` → `returns_list` (add) [personal]
- `/v1/returns/settings/utilization/history` → `returns_settings_utilization_history` (add) [personal]
- `/v1/returns/settings/utilization/info` → `returns_settings_utilization_info` (add) [personal]
- `/v2/conditional-cancellation/list` → `conditional_cancellation_list` (add)
- `/v2/returns/rfbs/get` → `returns_rfbs_get` (add) [personal]
- `/v2/returns/rfbs/list` → `returns_rfbs_list` (add) [personal]

## `finance_accounting` — 19

- `/v1/finance/accrual/by-day` → `finance_accrual_by_day` (add) [sensitive]
- `/v1/finance/accrual/postings` → `finance_accrual_postings` (add) [sensitive]
- `/v1/finance/accrual/types` → `finance_accrual_types` (add) [sensitive]
- `/v1/finance/balance` → `finance_balance` (add) [sensitive]
- `/v1/finance/cash-flow-statement/list` → `finance_cash_flow_statement_list` (add) [sensitive]
- `/v1/finance/compensation` → `finance_compensation` (add) [sensitive]
- `/v1/finance/decompensation` → `finance_decompensation` (add) [sensitive]
- `/v1/finance/document-b2b-sales` → `finance_document_b2b_sales` (add) [sensitive]
- `/v1/finance/document-b2b-sales/json` → `finance_document_b2b_sales_json` (add) [sensitive]
- `/v1/finance/mutual-settlement` → `finance_mutual_settlement` (add) [sensitive]
- `/v1/finance/products/buyout` → `finance_products_buyout` (add) [sensitive]
- `/v1/finance/realization/by-day` → `finance_realization_by_day` (add) [sensitive, premium]
- `/v1/finance/realization/posting` → `finance_realization_posting` (add) [sensitive]
- `/v1/receipts/get` → `receipts_get` (add) [personal]
- `/v1/receipts/seller/list` → `receipts_seller_list` (add) [personal]
- `/v2/finance/realization` → `finance_realization` (add) [sensitive]
- `/v2/invoice/get` → `invoice_get` (add) [sensitive]
- `/v3/finance/transaction/list` → `finance_transaction_list` (add) [sensitive]
- `/v3/finance/transaction/totals` → `finance_transaction_totals` (add) [sensitive]

## `reports_exports` — 13

- `/v1/removal/from-stock/list` → `removal_from_stock_list` (add)
- `/v1/removal/from-supply/list` → `removal_from_supply_list` (add)
- `/v1/report/discounted/create` → `report_discounted_create` (add) [workflow]
- `/v1/report/info` → `report_info` (add)
- `/v1/report/list` → `report_list` (add)
- `/v1/report/marked-products-sales/create` → `report_marked_products_sales_create` (add) [workflow]
- `/v1/report/placement/by-products/create` → `report_placement_by_products_create` (add) [workflow]
- `/v1/report/placement/by-supplies/create` → `report_placement_by_supplies_create` (add) [workflow]
- `/v1/report/postings/create` → `report_postings_create` (add) [workflow]
- `/v1/report/products/create` → `report_products_create` (add) [workflow]
- `/v1/report/realization/posting/create` → `report_realization_posting_create` (add) [workflow]
- `/v1/report/warehouse/stock` → `report_warehouse_stock` (add)
- `/v2/report/returns/create` → `report_returns_create` (add) [workflow]

## `pricing_promotions` — 21

- `/v1/actions` → `actions` (add)
- `/v1/actions/auto-add/products/candidates` → `actions_auto_add_products_candidates` (add)
- `/v1/actions/auto-add/products/list` → `actions_auto_add_products_list` (add)
- `/v1/actions/candidates` → `actions_candidates` (add)
- `/v1/actions/discounts-task/list` → `actions_discounts_task_list_v1` (add)
- `/v1/actions/products` → `actions_products` (add)
- `/v1/pricing-strategy/competitors/list` → `pricing_strategy_competitors_list` (add)
- `/v1/pricing-strategy/info` → `pricing_strategy_info` (add)
- `/v1/pricing-strategy/list` → `pricing_strategy_list` (add)
- `/v1/pricing-strategy/product/info` → `pricing_strategy_product_info` (add)
- `/v1/pricing-strategy/products/list` → `pricing_strategy_products_list` (add)
- `/v1/product/action/timer/status` → `product_action_timer_status` (add)
- `/v1/product/info/discounted` → `product_info_discounted` (add)
- `/v1/product/prices/details` → `product_prices_details` (add) [premium]
- `/v1/product/stairway-discount/by-quantity/get` → `product_stairway_discount_by_quantity_get` (add)
- `/v1/seller-actions/list` → `seller_actions_list` (add)
- `/v1/seller-actions/products/candidates` → `seller_actions_products_candidates` (add)
- `/v1/seller-actions/products/list` → `seller_actions_products_list` (add)
- `/v1/seller-actions/voucher/get` → `seller_actions_voucher_get` (add) [sensitive]
- `/v2/actions/discounts-task/list` → `actions_discounts_task_list_v2` (add)
- `/v5/product/info/prices` → `product_info_prices` (add)

## `customer_feedback` — 9

- `/v1/question/answer/list` → `question_answer_list` (add)
- `/v1/question/count` → `question_count` (add)
- `/v1/question/info` → `question_info` (add)
- `/v1/question/list` → `question_list` (add)
- `/v1/question/top-sku` → `question_top_sku` (add)
- `/v1/review/comment/list` → `review_comment_list` (add)
- `/v2/review/count` → `review_count` (add)
- `/v2/review/info` → `review_info` (add)
- `/v2/review/list` → `review_list` (add)

## `communications` — 4

- `/v1/notification/list` → `notification_list` (add)
- `/v1/notification/push-type/list` → `notification_push_type_list` (add)
- `/v3/chat/history` → `chat_history` (add) [personal]
- `/v3/chat/list` → `chat_list` (add) [personal]

## `seller_rating` — 4

- `/v1/rating/history` → `rating_history` (add)
- `/v1/rating/index/fbs/info` → `rating_index_fbs_info` (add)
- `/v1/rating/index/fbs/posting/list` → `rating_index_fbs_posting_list` (add)
- `/v1/rating/summary` → `rating_summary` (add)
