#!/usr/bin/env python3
from __future__ import annotations

import argparse
import re
from pathlib import Path

REGISTRY_INSERT = r"""    report_products_create: {
      provider: "seller_api", method: "POST", path: "/v1/report/products/create", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "finance", section: "documents_reports",
      guidance_visibility: "user", entitlement_key: "POST /v1/report/products/create", workflow_role: "explicit_workflow_read_step",
      purpose: "Отчёт по товарам", template: {"operation":"report_products_create","params":{}}
    },
    report_returns_create_v2: {
      provider: "seller_api", method: "POST", path: "/v2/report/returns/create", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "returns_cancellations", section: "returns",
      guidance_visibility: "user", entitlement_key: "POST /v2/report/returns/create", workflow_role: "explicit_workflow_read_step",
      purpose: "Отчёт о возвратах", template: {"operation":"report_returns_create_v2","params":{"filter":{"date_from":"2026-01-01T00:00:00Z","date_to":"2026-01-01T00:00:00Z","status":"DisputeOpened"}}}
    },
    report_postings_create: {
      provider: "seller_api", method: "POST", path: "/v1/report/postings/create", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "orders_postings", section: "labels_documents",
      guidance_visibility: "user", entitlement_key: "POST /v1/report/postings/create", workflow_role: "explicit_workflow_read_step",
      purpose: "Отчёт об отправлениях", template: {"operation":"report_postings_create","params":{"filter":{"processed_at_from":"2026-01-01T00:00:00Z","processed_at_to":"2026-01-01T00:00:00Z","delivery_schema":["FBO"]}}}
    },
    report_discounted_create: {
      provider: "seller_api", method: "POST", path: "/v1/report/discounted/create", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "finance", section: "documents_reports",
      guidance_visibility: "user", entitlement_key: "POST /v1/report/discounted/create", workflow_role: "explicit_workflow_read_step",
      purpose: "Отчёт об уценённых товарах", template: {"operation":"report_discounted_create","params":{}}
    },
    report_warehouse_stock: {
      provider: "seller_api", method: "POST", path: "/v1/report/warehouse/stock", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "stocks_inventory", section: "warehouse_fbs",
      guidance_visibility: "user", entitlement_key: "POST /v1/report/warehouse/stock", workflow_role: "explicit_workflow_read_step",
      purpose: "Отчёт об остатках на FBS-складе", template: {"operation":"report_warehouse_stock","params":{"warehouseId":["1"]}}
    },
    report_placement_by_products_create: {
      provider: "seller_api", method: "POST", path: "/v1/report/placement/by-products/create", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "stocks_inventory", section: "stock_movement_turnover",
      guidance_visibility: "user", entitlement_key: "POST /v1/report/placement/by-products/create", workflow_role: "explicit_workflow_read_step",
      purpose: "Получить отчёт о стоимости размещения по товарам", template: {"operation":"report_placement_by_products_create","params":{"date_from":"2026-01-01","date_to":"2026-01-01"}}
    },
    report_placement_by_supplies_create: {
      provider: "seller_api", method: "POST", path: "/v1/report/placement/by-supplies/create", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "supplies_fbo", section: "supply_orders",
      guidance_visibility: "user", entitlement_key: "POST /v1/report/placement/by-supplies/create", workflow_role: "explicit_workflow_read_step",
      purpose: "Получить отчёт о стоимости размещения по поставкам", template: {"operation":"report_placement_by_supplies_create","params":{"date_from":"2026-01-01","date_to":"2026-01-01"}}
    },
    report_marked_products_sales_create: {
      provider: "seller_api", method: "POST", path: "/v1/report/marked-products-sales/create", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "sales_analytics", section: "period_product_category",
      guidance_visibility: "user", entitlement_key: "POST /v1/report/marked-products-sales/create", workflow_role: "explicit_workflow_read_step",
      purpose: "Сгенерировать отчёт по продажам товаров с маркировкой", template: {"operation":"report_marked_products_sales_create","params":{}}
    },
    report_realization_posting_create: {
      provider: "seller_api", method: "POST", path: "/v1/report/realization/posting/create", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "finance", section: "realization",
      guidance_visibility: "user", entitlement_key: "POST /v1/report/realization/posting/create", workflow_role: "explicit_workflow_read_step",
      purpose: "Получить позаказный отчёт о реализации товаров", template: {"operation":"report_realization_posting_create","params":{"month":8,"year":2026}}
    },
    finance_document_b2b_sales: {
      provider: "seller_api", method: "POST", path: "/v1/finance/document-b2b-sales", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "finance", section: "documents_reports",
      guidance_visibility: "user", entitlement_key: "POST /v1/finance/document-b2b-sales", workflow_role: "explicit_workflow_read_step",
      purpose: "Реестр продаж юридическим лицам", template: {"operation":"finance_document_b2b_sales","params":{"date":"2026-01-01"}}
    },
    finance_mutual_settlement_report: {
      provider: "seller_api", method: "POST", path: "/v1/finance/mutual-settlement", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "finance", section: "documents_reports",
      guidance_visibility: "user", entitlement_key: "POST /v1/finance/mutual-settlement", workflow_role: "explicit_workflow_read_step",
      purpose: "Отчёт о взаиморасчётах", template: {"operation":"finance_mutual_settlement_report","params":{"date":"2026-01-01"}}
    },
    finance_compensation_report: {
      provider: "seller_api", method: "POST", path: "/v1/finance/compensation", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "finance", section: "documents_reports",
      guidance_visibility: "user", entitlement_key: "POST /v1/finance/compensation", workflow_role: "explicit_workflow_read_step",
      purpose: "Отчёт о компенсациях", template: {"operation":"finance_compensation_report","params":{"date":"2026-01-01"}}
    },
    finance_decompensation_report: {
      provider: "seller_api", method: "POST", path: "/v1/finance/decompensation", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "finance", section: "documents_reports",
      guidance_visibility: "user", entitlement_key: "POST /v1/finance/decompensation", workflow_role: "explicit_workflow_read_step",
      purpose: "Отчёт о декомпенсациях", template: {"operation":"finance_decompensation_report","params":{"date":"2026-01-01"}}
    },
    cargoes_label_create: {
      provider: "seller_api", method: "POST", path: "/v1/cargoes-label/create", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "supplies_fbo", section: "cargoes",
      guidance_visibility: "user", entitlement_key: "POST /v1/cargoes-label/create", workflow_role: "explicit_workflow_read_step",
      purpose: "Сгенерировать этикетки для грузомест", template: {"operation":"cargoes_label_create","params":{"supply_id":1}}
    },
    posting_fbs_act_container_labels: {
      provider: "seller_api", method: "POST", path: "/v2/posting/fbs/act/get-container-labels", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "PERSONAL_DATA_READ_GATED", privacy_policy: "operator_personal_data_gate", policy_group: "personal_data_read", default_allowed: false, cluster: "orders_postings", section: "labels_documents",
      guidance_visibility: "user", entitlement_key: "POST /v2/posting/fbs/act/get-container-labels", workflow_role: "single_read", response_style: "binary", response_content_types: ["application/pdf"],
      purpose: "Этикетки для грузового места", template: {"operation":"posting_fbs_act_container_labels","params":{"id":1}}
    },
    posting_fbs_package_label: {
      provider: "seller_api", method: "POST", path: "/v2/posting/fbs/package-label", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "PERSONAL_DATA_READ_GATED", privacy_policy: "operator_personal_data_gate", policy_group: "personal_data_read", default_allowed: false, cluster: "orders_postings", section: "labels_documents",
      guidance_visibility: "user", entitlement_key: "POST /v2/posting/fbs/package-label", workflow_role: "single_read", response_style: "binary", response_content_types: ["application/pdf"],
      purpose: "Напечатать этикетку", template: {"operation":"posting_fbs_package_label","params":{"posting_number":["POSTING_NUMBER"]}}
    },
    posting_fbs_package_label_create: {
      provider: "seller_api", method: "POST", path: "/v2/posting/fbs/package-label/create", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "orders_postings", section: "labels_documents",
      guidance_visibility: "user", entitlement_key: "POST /v2/posting/fbs/package-label/create", workflow_role: "explicit_workflow_read_step",
      purpose: "Создать задание на формирование этикеток", template: {"operation":"posting_fbs_package_label_create","params":{"posting_number":"POSTING_NUMBER"}}
    },
    cargoes_transport_label_by_order_create: {
      provider: "seller_api", method: "POST", path: "/v1/cargoes/label/transport-by-order/create", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "supplies_fbo", section: "cargoes",
      guidance_visibility: "user", entitlement_key: "POST /v1/cargoes/label/transport-by-order/create", workflow_role: "explicit_workflow_read_step",
      purpose: "Сгенерировать этикетки для транспортных грузомест по заявке", template: {"operation":"cargoes_transport_label_by_order_create","params":{"order_id":1}}
    },
    cargoes_transport_label_create: {
      provider: "seller_api", method: "POST", path: "/v1/cargoes/label/transport/create", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "supplies_fbo", section: "cargoes",
      guidance_visibility: "user", entitlement_key: "POST /v1/cargoes/label/transport/create", workflow_role: "explicit_workflow_read_step",
      purpose: "Сгенерировать этикетки транспортных грузомест", template: {"operation":"cargoes_transport_label_create","params":{"supply_id":1}}
    },
    fbp_act_from_create: {
      provider: "seller_api", method: "POST", path: "/v1/fbp/act-from/create", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "supplies_fbo", section: "acts",
      guidance_visibility: "user", entitlement_key: "POST /v1/fbp/act-from/create", workflow_role: "explicit_workflow_read_step",
      purpose: "Сгенерировать акт приёмки", template: {"operation":"fbp_act_from_create","params":{"supply_id":"1"}}
    },
    fbp_act_to_create: {
      provider: "seller_api", method: "POST", path: "/v1/fbp/act-to/create", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "supplies_fbo", section: "acts",
      guidance_visibility: "user", entitlement_key: "POST /v1/fbp/act-to/create", workflow_role: "explicit_workflow_read_step",
      purpose: "Сгенерировать транспортную накладную", template: {"operation":"fbp_act_to_create","params":{"supply_id":"1"}}
    },
    fbp_label_create: {
      provider: "seller_api", method: "POST", path: "/v1/fbp/label/create", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "supplies_fbo", section: "cargoes",
      guidance_visibility: "user", entitlement_key: "POST /v1/fbp/label/create", workflow_role: "explicit_workflow_read_step",
      purpose: "Cоздать задание на генерацию этикеток", template: {"operation":"fbp_label_create","params":{"supply_id":"1"}}
    },
    fbp_draft_direct_product_validate: {
      provider: "seller_api", method: "POST", path: "/v1/fbp/draft/direct/product/validate", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "supplies_fbo", section: "drafts",
      guidance_visibility: "user", entitlement_key: "POST /v1/fbp/draft/direct/product/validate", workflow_role: "single_read",
      purpose: "Проверить список товаров для склада партнёра", template: {"operation":"fbp_draft_direct_product_validate","params":{"skus":[{"count":1,"sku":1}],"warehouse_id":1}}
    },
    fbp_draft_dropoff_product_validate: {
      provider: "seller_api", method: "POST", path: "/v1/fbp/draft/drop-off/product/validate", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "supplies_fbo", section: "drafts",
      guidance_visibility: "user", entitlement_key: "POST /v1/fbp/draft/drop-off/product/validate", workflow_role: "single_read",
      purpose: "Проверить список товаров, которые склад партнёра может принять", template: {"operation":"fbp_draft_dropoff_product_validate","params":{"skus":[{"count":1,"sku":1}],"warehouse_id":1}}
    },
    fbp_draft_pickup_product_validate: {
      provider: "seller_api", method: "POST", path: "/v1/fbp/draft/pick-up/product/validate", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "READ_SAFE", privacy_policy: "safe_projection", cluster: "supplies_fbo", section: "drafts",
      guidance_visibility: "user", entitlement_key: "POST /v1/fbp/draft/pick-up/product/validate", workflow_role: "single_read",
      purpose: "Провалидировать список товаров для pick-up поставки", template: {"operation":"fbp_draft_pickup_product_validate","params":{"skus":[{"count":1,"sku":1}],"warehouse_id":1}}
    },
    chat_history_v3: {
      provider: "seller_api", method: "POST", path: "/v3/chat/history", effect: "READ", request_style: "json_body", execution_enabled: true,
      currentness: "current", safety_class: "PERSONAL_DATA_READ_GATED", privacy_policy: "operator_personal_data_gate", policy_group: "personal_data_read", default_allowed: false, cluster: "reviews_questions", section: "chats",
      guidance_visibility: "conditional", entitlement_key: "POST /v3/chat/history", workflow_role: "single_read",
      purpose: "История чата", template: {"operation":"chat_history_v3","params":{"chat_id":"1"}}
    },
"""

ENTITLEMENTS_INSERT = r"""      "POST /v1/report/products/create": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v2/report/returns/create": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/report/postings/create": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/report/discounted/create": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/report/warehouse/stock": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/report/placement/by-products/create": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/report/placement/by-supplies/create": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/report/marked-products-sales/create": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/report/realization/posting/create": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/finance/document-b2b-sales": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/finance/mutual-settlement": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/finance/compensation": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/finance/decompensation": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/cargoes-label/create": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v2/posting/fbs/act/get-container-labels": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v2/posting/fbs/package-label": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v2/posting/fbs/package-label/create": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/cargoes/label/transport-by-order/create": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/cargoes/label/transport/create": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/fbp/act-from/create": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/fbp/act-to/create": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/fbp/label/create": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/fbp/draft/direct/product/validate": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/fbp/draft/drop-off/product/validate": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v1/fbp/draft/pick-up/product/validate": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
      "POST /v3/chat/history": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },
"""

CONTRACT_SCHEMA_AND_VALIDATOR = r"""
  const EFFECT_REPAIR_PARAM_SCHEMAS = deepFreeze({"report_products_create":{"type":"object","properties":{"language":{"type":"string"},"offer_id":{"type":"array","items":{"type":"string"}},"search":{"type":"string"},"sku":{"type":"array","items":{"type":"integer","format":"int64"}},"visibility":{"type":"string","enum":["ALL","VALIDATION_STATE_FAIL","TO_SUPPLY","IN_SALE","REMOVED_FROM_SALE","PARTIAL_APPROVED","IMAGE_ABSENT","ARCHIVED","AUTO_ARCHIVED","MANUAL_ARCHIVED"]}}},"report_returns_create_v2":{"type":"object","required":["filter"],"properties":{"filter":{"type":"object","required":["date_from","date_to","status"],"properties":{"delivery_schema":{"type":"string","enum":["FBS","FBO","ALL"]},"date_from":{"type":"string","format":"date-time"},"date_to":{"type":"string","format":"date-time"},"status":{"type":"string","enum":["DisputeOpened","OnSellerApproval","ArrivedAtReturnPlace","OnSellerClarification","OnSellerClarificationAfterPartialCompensation","OfferedPartialCompensation","ReturnMoneyApproved","PartialCompensationReturned","CancelledDisputeNotOpen","Rejected","CrmRejected","Cancelled","Approved","ApprovedByOzon","ReceivedBySeller","MovingToSeller","ReturnCompensated","ReturningToSellerByCourier","Utilizing","Utilized","MoneyReturned","PartialCompensationInProcess","DisputeYouOpened","CompensationRejected","DisputeOpening","CompensationOffered","WaitingCompensation","SendingError","CompensationRejectedBySla","CompensationRejectedBySeller","MovingToOzon","ReturnedToOzon","MoneyReturnedBySystem","WaitingShipment"]}}},"language":{"type":"string"}}},"report_postings_create":{"type":"object","required":["filter"],"properties":{"filter":{"type":"object","required":["processed_at_from","processed_at_to","delivery_schema"],"properties":{"cancel_reason_id":{"type":"array","items":{"type":"integer","format":"int64"}},"delivery_schema":{"type":"array","items":{"type":"string"}},"offer_id":{"type":"string"},"processed_at_from":{"type":"string","format":"date-time"},"processed_at_to":{"type":"string","format":"date-time"},"status":{"type":"array","items":{"type":"string"}}}},"language":{"type":"string"},"with":{"type":"object","properties":{"analytics_data":{"type":"boolean"},"financial_data":{"type":"boolean"}}}}},"report_discounted_create":{"type":"object","properties":{}},"report_warehouse_stock":{"type":"object","required":["warehouseId"],"properties":{"language":{"type":"string"},"warehouseId":{"type":"array","items":{"type":"string"}}}},"report_placement_by_products_create":{"type":"object","required":["date_from","date_to"],"properties":{"date_from":{"type":"string"},"date_to":{"type":"string"}}},"report_placement_by_supplies_create":{"type":"object","required":["date_from","date_to"],"properties":{"date_from":{"type":"string"},"date_to":{"type":"string"}}},"report_marked_products_sales_create":{"type":"object","properties":{"date":{"type":"string"}}},"report_realization_posting_create":{"type":"object","required":["month","year"],"properties":{"month":{"type":"integer","format":"int64"},"year":{"type":"integer","format":"int64"}}},"finance_document_b2b_sales":{"type":"object","required":["date"],"properties":{"date":{"type":"string"},"language":{"type":"string"}}},"finance_mutual_settlement_report":{"type":"object","required":["date"],"properties":{"date":{"type":"string"},"language":{"type":"string"}}},"finance_compensation_report":{"type":"object","required":["date"],"properties":{"date":{"type":"string"},"language":{"type":"string"}}},"finance_decompensation_report":{"type":"object","required":["date"],"properties":{"date":{"type":"string"},"language":{"type":"string"}}},"cargoes_label_create":{"type":"object","required":["supply_id"],"properties":{"cargoes":{"type":"array","items":{"type":"integer","format":"int64"}},"supply_id":{"type":"integer","format":"int64"}}},"posting_fbs_act_container_labels":{"type":"object","required":["id"],"properties":{"id":{"type":"integer","format":"int64"}}},"posting_fbs_package_label":{"type":"object","required":["posting_number"],"properties":{"posting_number":{"type":"array","items":{"type":"string"},"maxItems":20}}},"posting_fbs_package_label_create":{"type":"object","required":["posting_number"],"properties":{"posting_number":{"type":"string"}}},"cargoes_transport_label_by_order_create":{"type":"object","required":["order_id"],"properties":{"order_id":{"type":"integer","format":"int64"}}},"cargoes_transport_label_create":{"type":"object","required":["supply_id"],"properties":{"supply_id":{"type":"integer","format":"int64"},"transport_cargo_ids":{"type":"array","items":{"type":"integer","format":"int64"}}}},"fbp_act_from_create":{"type":"object","required":["supply_id"],"properties":{"supply_id":{"type":"string"}}},"fbp_act_to_create":{"type":"object","required":["supply_id"],"properties":{"supply_id":{"type":"string"}}},"fbp_label_create":{"type":"object","required":["supply_id"],"properties":{"supply_id":{"type":"string"}}},"fbp_draft_direct_product_validate":{"type":"object","required":["skus","warehouse_id"],"properties":{"skus":{"type":"array","items":{"type":"object","required":["count","sku"],"properties":{"count":{"type":"integer","format":"int64"},"sku":{"type":"integer","format":"int64"}}}},"warehouse_id":{"type":"integer","format":"int64"}}},"fbp_draft_dropoff_product_validate":{"type":"object","required":["skus","warehouse_id"],"properties":{"skus":{"type":"array","items":{"type":"object","required":["count","sku"],"properties":{"count":{"type":"integer","format":"int64"},"sku":{"type":"integer","format":"int64"}}}},"warehouse_id":{"type":"integer","format":"int64"}}},"fbp_draft_pickup_product_validate":{"type":"object","required":["skus","warehouse_id"],"properties":{"skus":{"type":"array","items":{"type":"object","required":["count","sku"],"properties":{"count":{"type":"integer","format":"int64"},"sku":{"type":"integer","format":"int64"}}}},"warehouse_id":{"type":"integer","format":"int64"}}},"chat_history_v3":{"type":"object","required":["chat_id"],"properties":{"chat_id":{"type":"string"},"direction":{"type":"string"},"filter":{"type":"object","properties":{"message_ids":{"type":"array","items":{"type":"string","format":"uint64"}}}},"from_message_id":{"type":"integer","format":"uint64"},"limit":{"type":"integer","format":"int64"}}}});

  function validateEffectRepairValue(value, schema, path) {
    if (!schema || typeof schema !== "object") return;
    if (Array.isArray(schema.enum) && schema.enum.length && !schema.enum.includes(value)) fail("INVALID_OPERATION_PARAMS", `${path} должен быть одним из: ${schema.enum.join(", ")}.`);
    const type = schema.type;
    if (type === "object") {
      const object = requirePlainObject(value, path);
      const properties = schema.properties || {};
      assertAllowedFields(object, Object.keys(properties));
      for (const key of schema.required || []) requireField(object, key);
      for (const [key, child] of Object.entries(object)) if (Object.prototype.hasOwnProperty.call(properties, key)) validateEffectRepairValue(child, properties[key], `${path}.${key}`);
      return;
    }
    if (type === "array") {
      const array = requireArray(value, path);
      if (Number.isInteger(schema.maxItems) && array.length > schema.maxItems) fail("INVALID_OPERATION_PARAMS", `${path} содержит слишком много элементов.`);
      if (Number.isInteger(schema.minItems) && array.length < schema.minItems) fail("INVALID_OPERATION_PARAMS", `${path} содержит слишком мало элементов.`);
      for (let index = 0; index < array.length; index += 1) validateEffectRepairValue(array[index], schema.items || {}, `${path}[${index}]`);
      return;
    }
    if (type === "integer") { if (!Number.isInteger(value)) fail("INVALID_OPERATION_PARAMS", `${path} должен быть целым числом.`); return; }
    if (type === "number") { if (typeof value !== "number" || !Number.isFinite(value)) fail("INVALID_OPERATION_PARAMS", `${path} должен быть конечным числом.`); return; }
    if (type === "boolean") { if (typeof value !== "boolean") fail("INVALID_OPERATION_PARAMS", `${path} должен быть boolean.`); return; }
    if (type === "string" || !type) {
      if (typeof value !== "string") fail("INVALID_OPERATION_PARAMS", `${path} должен быть строкой.`);
      if (Number.isInteger(schema.maxLength) && value.length > schema.maxLength) fail("INVALID_OPERATION_PARAMS", `${path} длиннее допустимого.`);
      if (schema.format === "date" && !/^\d{4}-\d{2}-\d{2}$/.test(value)) fail("INVALID_OPERATION_PARAMS", `${path} должен быть датой YYYY-MM-DD.`);
      if (schema.format === "date-time" && !Number.isFinite(Date.parse(value))) fail("INVALID_OPERATION_PARAMS", `${path} должен быть ISO date-time.`);
    }
  }

  function normalizeEffectRepairParams(operation, params) {
    const schema = EFFECT_REPAIR_PARAM_SCHEMAS[operation];
    if (!schema) fail("INVALID_OPERATION_PARAMS", `Для ${operation} отсутствует effect-repair schema.`);
    const normalized = requirePlainObject(params, "params");
    validateEffectRepairValue(normalized, schema, "params");
    return normalized;
  }
"""

CONTRACT_MAP_INSERT = r"""    report_products_create: { normalizeParams: (params) => normalizeEffectRepairParams("report_products_create", params), sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_09_02_effect_repair" },
    report_returns_create_v2: { normalizeParams: (params) => normalizeEffectRepairParams("report_returns_create_v2", params), sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_09_02_effect_repair" },
    report_postings_create: { normalizeParams: (params) => normalizeEffectRepairParams("report_postings_create", params), sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_09_02_effect_repair" },
    report_discounted_create: { normalizeParams: (params) => normalizeEffectRepairParams("report_discounted_create", params), sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_09_02_effect_repair" },
    report_warehouse_stock: { normalizeParams: (params) => normalizeEffectRepairParams("report_warehouse_stock", params), sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_09_02_effect_repair" },
    report_placement_by_products_create: { normalizeParams: (params) => normalizeEffectRepairParams("report_placement_by_products_create", params), sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_09_02_effect_repair" },
    report_placement_by_supplies_create: { normalizeParams: (params) => normalizeEffectRepairParams("report_placement_by_supplies_create", params), sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_09_02_effect_repair" },
    report_marked_products_sales_create: { normalizeParams: (params) => normalizeEffectRepairParams("report_marked_products_sales_create", params), sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_09_02_effect_repair" },
    report_realization_posting_create: { normalizeParams: (params) => normalizeEffectRepairParams("report_realization_posting_create", params), sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_09_02_effect_repair" },
    finance_document_b2b_sales: { normalizeParams: (params) => normalizeEffectRepairParams("finance_document_b2b_sales", params), sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_09_02_effect_repair" },
    finance_mutual_settlement_report: { normalizeParams: (params) => normalizeEffectRepairParams("finance_mutual_settlement_report", params), sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_09_02_effect_repair" },
    finance_compensation_report: { normalizeParams: (params) => normalizeEffectRepairParams("finance_compensation_report", params), sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_09_02_effect_repair" },
    finance_decompensation_report: { normalizeParams: (params) => normalizeEffectRepairParams("finance_decompensation_report", params), sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_09_02_effect_repair" },
    cargoes_label_create: { normalizeParams: (params) => normalizeEffectRepairParams("cargoes_label_create", params), sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_09_02_effect_repair" },
    posting_fbs_act_container_labels: { normalizeParams: (params) => normalizeEffectRepairParams("posting_fbs_act_container_labels", params), sanitizeResult: authorizedPersonalDataReadResult, contract_state: "exact_swagger_2026_09_02_effect_repair" },
    posting_fbs_package_label: { normalizeParams: (params) => normalizeEffectRepairParams("posting_fbs_package_label", params), sanitizeResult: authorizedPersonalDataReadResult, contract_state: "exact_swagger_2026_09_02_effect_repair" },
    posting_fbs_package_label_create: { normalizeParams: (params) => normalizeEffectRepairParams("posting_fbs_package_label_create", params), sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_09_02_effect_repair" },
    cargoes_transport_label_by_order_create: { normalizeParams: (params) => normalizeEffectRepairParams("cargoes_transport_label_by_order_create", params), sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_09_02_effect_repair" },
    cargoes_transport_label_create: { normalizeParams: (params) => normalizeEffectRepairParams("cargoes_transport_label_create", params), sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_09_02_effect_repair" },
    fbp_act_from_create: { normalizeParams: (params) => normalizeEffectRepairParams("fbp_act_from_create", params), sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_09_02_effect_repair" },
    fbp_act_to_create: { normalizeParams: (params) => normalizeEffectRepairParams("fbp_act_to_create", params), sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_09_02_effect_repair" },
    fbp_label_create: { normalizeParams: (params) => normalizeEffectRepairParams("fbp_label_create", params), sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_09_02_effect_repair" },
    fbp_draft_direct_product_validate: { normalizeParams: (params) => normalizeEffectRepairParams("fbp_draft_direct_product_validate", params), sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_09_02_effect_repair" },
    fbp_draft_dropoff_product_validate: { normalizeParams: (params) => normalizeEffectRepairParams("fbp_draft_dropoff_product_validate", params), sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_09_02_effect_repair" },
    fbp_draft_pickup_product_validate: { normalizeParams: (params) => normalizeEffectRepairParams("fbp_draft_pickup_product_validate", params), sanitizeResult: safeReadResult, contract_state: "exact_swagger_2026_09_02_effect_repair" },
    chat_history_v3: { normalizeParams: (params) => normalizeEffectRepairParams("chat_history_v3", params), sanitizeResult: authorizedPersonalDataReadResult, contract_state: "exact_swagger_2026_09_02_effect_repair" },
"""

ALIASES = ["report_products_create","report_returns_create_v2","report_postings_create","report_discounted_create","report_warehouse_stock","report_placement_by_products_create","report_placement_by_supplies_create","report_marked_products_sales_create","report_realization_posting_create","finance_document_b2b_sales","finance_mutual_settlement_report","finance_compensation_report","finance_decompensation_report","cargoes_label_create","posting_fbs_act_container_labels","posting_fbs_package_label","posting_fbs_package_label_create","cargoes_transport_label_by_order_create","cargoes_transport_label_create","fbp_act_from_create","fbp_act_to_create","fbp_label_create","fbp_draft_direct_product_validate","fbp_draft_dropoff_product_validate","fbp_draft_pickup_product_validate","chat_history_v3"]

def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{label} anchor count {count}, expected 1")
    return text.replace(old, new, 1)

def patch_file(path: Path, transform):
    original = path.read_text(encoding="utf-8")
    updated = transform(original)
    if updated == original:
        raise RuntimeError(f"no change produced for {path}")
    path.write_text(updated, encoding="utf-8", newline="\n")

def patch_registry(text: str) -> str:
    text = replace_once(text, '    supply_order_list: {', REGISTRY_INSERT + '    supply_order_list: {', "registry operation insertion")
    replacements = {
        r"(total_aliases\s*:\s*)270\b": r"\g<1>296",
        r"(seller_aliases\s*:\s*)245\b": r"\g<1>271",
        r"(current_read_aliases\s*:\s*)270\b": r"\g<1>296",
        r"(execution_enabled_aliases\s*:\s*)270\b": r"\g<1>296",
    }
    for pattern, repl in replacements.items():
        text = re.sub(pattern, repl, text)
    return text

def patch_entitlements(text: str) -> str:
    anchor = '      "POST /v3/supply-order/list": { default_access: "ALL_ACCOUNTS", endpoint_allowed_subscription_types: null, feature_rules: [] },'
    return replace_once(text, anchor, ENTITLEMENTS_INSERT + anchor, "entitlements operation insertion")

def patch_contract(text: str) -> str:
    text = replace_once(text, '  function normalizeSupplyOrderListParams(params) {', CONTRACT_SCHEMA_AND_VALIDATOR + '\n  function normalizeSupplyOrderListParams(params) {', "contract validator insertion")
    text = replace_once(text, '    supply_order_list: { normalizeParams: normalizeSupplyOrderListParams,', CONTRACT_MAP_INSERT + '    supply_order_list: { normalizeParams: normalizeSupplyOrderListParams,', "contract map insertion")
    return text

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo-root", type=Path, required=True)
    args = ap.parse_args()
    root = args.repo_root.resolve()
    shared = root / "tooling/llm-api-bridges/ozon-seller/dist-step7-candidate/shared"
    registry = shared / "ozon_operation_registry.js"
    contract = shared / "ozon_contract.js"
    entitlements = shared / "ozon_entitlements.js"
    for path in (registry, contract, entitlements):
        if not path.is_file():
            raise RuntimeError(f"missing runtime source {path}")
    patch_file(registry, patch_registry)
    patch_file(contract, patch_contract)
    patch_file(entitlements, patch_entitlements)
    registry_text = registry.read_text(encoding="utf-8")
    missing = [alias for alias in ALIASES if f"    {alias}: {{" not in registry_text]
    if missing: raise RuntimeError(f"repaired aliases missing from registry: {missing}")
    contract_text = contract.read_text(encoding="utf-8")
    missing_contract = [alias for alias in ALIASES if f"    {alias}: {{" not in contract_text]
    if missing_contract: raise RuntimeError(f"repaired aliases missing from contract: {missing_contract}")
    print("OZON_EFFECT_READ_REPAIR_REGISTRY_26_PASS")
    print("OZON_EFFECT_READ_REPAIR_CONTRACT_26_PASS")
    print("OZON_EFFECT_READ_REPAIR_ENTITLEMENTS_26_PASS")
    print("OZON_EFFECT_READ_REPAIR_APPLY_PASS")

if __name__ == "__main__":
    main()
