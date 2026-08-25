# Ozon Seller API method catalog — part 03/06

Rows 103–153 of 303. Fixed columns: path, cluster, decision, alias, access, replacement.

| # | Path | Cluster | Решение | Alias | Доступ | Замена |
|---:|---|---|---|---|---|---|
| 103 | `/v1/pricing-strategy/competitors/list` | `pricing_promotions` | ДОБАВИТЬ | `pricing_strategy_competitors_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 104 | `/v1/pricing-strategy/info` | `pricing_promotions` | ДОБАВИТЬ | `pricing_strategy_info` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 105 | `/v1/pricing-strategy/list` | `pricing_promotions` | ДОБАВИТЬ | `pricing_strategy_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 106 | `/v1/pricing-strategy/product/info` | `pricing_promotions` | ДОБАВИТЬ | `pricing_strategy_product_info` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 107 | `/v1/pricing-strategy/products/list` | `pricing_promotions` | ДОБАВИТЬ | `pricing_strategy_products_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 108 | `/v1/pricing-strategy/status` | `pricing_promotions` | НЕ ДОБАВЛЯТЬ: меняет данные/остатки/рабочий статус | — | обычный/без отдельного Premium-требования в текущем индексе | — |
| 109 | `/v1/product/action/timer/status` | `pricing_promotions` | ДОБАВИТЬ | `product_action_timer_status` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 110 | `/v1/product/certificate/accordance-types` | `certification_compliance` | НЕ ДОБАВЛЯТЬ: старая/выводимая версия | — | обычный/без отдельного Premium-требования в текущем индексе | `/v2/product/certificate/accordance-types/list` |
| 111 | `/v1/product/certificate/info` | `certification_compliance` | ДОБАВИТЬ | `product_certificate_info` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 112 | `/v1/product/certificate/list` | `certification_compliance` | ДОБАВИТЬ | `product_certificate_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 113 | `/v1/product/certificate/product_status/list` | `certification_compliance` | ДОБАВИТЬ | `product_certificate_product_status_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 114 | `/v1/product/certificate/products/list` | `certification_compliance` | ДОБАВИТЬ | `product_certificate_products_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 115 | `/v1/product/certificate/rejection_reasons/list` | `certification_compliance` | ДОБАВИТЬ | `product_certificate_rejection_reasons_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 116 | `/v1/product/certificate/status/list` | `certification_compliance` | ДОБАВИТЬ | `product_certificate_status_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 117 | `/v1/product/certificate/types` | `certification_compliance` | ДОБАВИТЬ | `product_certificate_types` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 118 | `/v1/product/import/info` | `catalog_products` | ДОБАВИТЬ | `product_import_info` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 119 | `/v1/product/info/description` | `catalog_products` | ДОБАВИТЬ | `product_info_description` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 120 | `/v1/product/info/discounted` | `catalog_products` | ДОБАВИТЬ | `product_info_discounted` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 121 | `/v1/product/info/stocks-by-warehouse/fbo` | `stock_inventory` | ДОБАВИТЬ | `stocks_by_warehouse_fbo` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 122 | `/v1/product/info/subscription` | `catalog_products` | ДОБАВИТЬ | `product_info_subscription` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 123 | `/v1/product/info/warehouse/stocks` | `stock_inventory` | ДОБАВИТЬ | `product_warehouse_stocks` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 124 | `/v1/product/info/wrong-volume` | `catalog_products` | ДОБАВИТЬ | `product_info_wrong_volume` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 125 | `/v1/product/pictures/info` | `catalog_products` | НЕ ДОБАВЛЯТЬ: старая/выводимая версия | — | обычный/без отдельного Premium-требования в текущем индексе | `/v2/product/pictures/info` |
| 126 | `/v1/product/placement-zone/info` | `catalog_products` | ДОБАВИТЬ | `product_placement_zone_info` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 127 | `/v1/product/prices/details` | `pricing_promotions` | ДОБАВИТЬ | `product_prices_details` | Premium-family | — |
| 128 | `/v1/product/quant/info` | `catalog_products` | ДОБАВИТЬ | `product_quant_info` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 129 | `/v1/product/quant/list` | `catalog_products` | ДОБАВИТЬ | `product_quant_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 130 | `/v1/product/rating-by-sku` | `catalog_products` | ДОБАВИТЬ | `product_rating_by_sku` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 131 | `/v1/product/related-sku/get` | `catalog_products` | ДОБАВИТЬ | `product_related_sku_get` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 132 | `/v1/product/stairway-discount/by-quantity/get` | `catalog_products` | ДОБАВИТЬ | `product_stairway_discount_by_quantity_get` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 133 | `/v1/product/upload_digital_codes/info` | `catalog_products` | ДОБАВИТЬ | `product_upload_digital_codes_info` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 134 | `/v1/product/visibility/info` | `catalog_products` | ДОБАВИТЬ | `product_visibility_info` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 135 | `/v1/question/answer/list` | `reviews_questions` | ДОБАВИТЬ С ФИЛЬТРАЦИЕЙ | `question_answer_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 136 | `/v1/question/count` | `reviews_questions` | ДОБАВИТЬ С ФИЛЬТРАЦИЕЙ | `question_count` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 137 | `/v1/question/info` | `reviews_questions` | ДОБАВИТЬ С ФИЛЬТРАЦИЕЙ | `question_info` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 138 | `/v1/question/list` | `reviews_questions` | НЕ ДОБАВЛЯТЬ: старая/выводимая версия | — | обычный/без отдельного Premium-требования в текущем индексе | `/v3/question/list` |
| 139 | `/v1/question/top-sku` | `reviews_questions` | ДОБАВИТЬ С ФИЛЬТРАЦИЕЙ | `question_top_sku` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 140 | `/v1/rating/history` | `seller_quality` | ДОБАВИТЬ | `rating_history` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 141 | `/v1/rating/index/fbs/info` | `seller_quality` | ДОБАВИТЬ | `rating_index_fbs_info` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 142 | `/v1/rating/index/fbs/posting/list` | `seller_quality` | ДОБАВИТЬ | `rating_index_fbs_posting_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 143 | `/v1/rating/summary` | `seller_quality` | ДОБАВИТЬ | `rating_summary` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 144 | `/v1/receipts/get` | `finance_accounting` | ДОБАВИТЬ | `receipts_get` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 145 | `/v1/receipts/seller/list` | `finance_accounting` | ДОБАВИТЬ | `receipts_seller_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 146 | `/v1/removal/from-stock/list` | `returns_cancellations` | ДОБАВИТЬ | `removal_from_stock_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 147 | `/v1/removal/from-supply/list` | `returns_cancellations` | ДОБАВИТЬ | `removal_from_supply_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 148 | `/v1/report/discounted/create` | `reports_documents` | ДОБАВИТЬ КАК ВЫГРУЗКУ | `report_discounted_create` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 149 | `/v1/report/discounted/info` | `reports_documents` | ДОБАВИТЬ | `report_discounted_info` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 150 | `/v1/report/discounted/list` | `reports_documents` | ДОБАВИТЬ | `report_discounted_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 151 | `/v1/report/finance/create` | `reports_documents` | ДОБАВИТЬ КАК ВЫГРУЗКУ | `report_finance_create` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 152 | `/v1/report/info` | `reports_documents` | ДОБАВИТЬ | `report_info` | обычный/без отдельного Premium-требования в текущем индексе | — |
| 153 | `/v1/report/list` | `reports_documents` | ДОБАВИТЬ | `report_list` | обычный/без отдельного Premium-требования в текущем индексе | — |
