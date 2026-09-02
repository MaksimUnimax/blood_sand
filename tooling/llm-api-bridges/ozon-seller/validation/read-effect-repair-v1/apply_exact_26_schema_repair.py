#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

EXACT_SCHEMAS = {
  "report_products_create":{"type":"object","properties":{"language":{"type":"string"},"offer_id":{"type":"array","items":{"type":"string"}},"search":{"type":"string"},"sku":{"type":"array","items":{"type":"integer"}},"visibility":{"type":"string","enum":["ALL","VALIDATION_STATE_FAIL","TO_SUPPLY","IN_SALE","REMOVED_FROM_SALE","PARTIAL_APPROVED","IMAGE_ABSENT","ARCHIVED","AUTO_ARCHIVED","MANUAL_ARCHIVED"]}}},
  "report_returns_create_v2":{"type":"object","required":["filter"],"properties":{"filter":{"type":"object","required":["date_from","date_to","status"],"properties":{"delivery_schema":{"type":"string","enum":["FBS","FBO","ALL"]},"date_from":{"type":"string","format":"date-time"},"date_to":{"type":"string","format":"date-time"},"status":{"type":"string","enum":["DisputeOpened","OnSellerApproval","ArrivedAtReturnPlace","OnSellerClarification","OnSellerClarificationAfterPartialCompensation","OfferedPartialCompensation","ReturnMoneyApproved","PartialCompensationReturned","CancelledDisputeNotOpen","Rejected","CrmRejected","Cancelled","Approved","ApprovedByOzon","ReceivedBySeller","MovingToSeller","ReturnCompensated","ReturningToSellerByCourier","Utilizing","Utilized","MoneyReturned","PartialCompensationInProcess","DisputeYouOpened","CompensationRejected","DisputeOpening","CompensationOffered","WaitingCompensation","SendingError","CompensationRejectedBySla","CompensationRejectedBySeller","MovingToOzon","ReturnedToOzon","MoneyReturnedBySystem","WaitingShipment"]}}},"language":{"type":"string"}}},
  "report_postings_create":{"type":"object","required":["filter"],"properties":{"filter":{"type":"object","required":["processed_at_from","processed_at_to","delivery_schema"],"properties":{"cancel_reason_id":{"type":"array","items":{"type":"integer"}},"delivery_schema":{"type":"array","items":{"type":"string"}},"offer_id":{"type":"string"},"processed_at_from":{"type":"string","format":"date-time"},"processed_at_to":{"type":"string","format":"date-time"},"sku":{"type":"array","items":{"type":"integer"}},"status_alias":{"type":"array","items":{"type":"string"}},"statuses":{"type":"array","items":{"type":"integer"}},"title":{"type":"string"},"warehouse_id":{"type":"array","items":{"type":"integer"}},"delivery_method_id":{"type":"array","items":{"type":"integer"}},"is_express":{"type":"boolean"}}},"language":{"type":"string"},"with":{"type":"object","properties":{"additional_data":{"type":"boolean"},"analytics_data":{"type":"boolean"},"customer_data":{"type":"boolean"},"jewelry_codes":{"type":"boolean"}}}}},
  "report_discounted_create":{"type":"object"},
  "report_warehouse_stock":{"type":"object","required":["warehouseId"],"properties":{"language":{"type":"string"},"warehouseId":{"type":"array","items":{"type":"string"}}}},
  "report_placement_by_products_create":{"type":"object","required":["date_from","date_to"],"properties":{"date_from":{"type":"string","format":"date"},"date_to":{"type":"string","format":"date"}}},
  "report_placement_by_supplies_create":{"type":"object","required":["date_from","date_to"],"properties":{"date_from":{"type":"string","format":"date"},"date_to":{"type":"string","format":"date"}}},
  "report_marked_products_sales_create":{"type":"object","required":["date"],"properties":{"date":{"type":"object","required":["from","to"],"properties":{"from":{"type":"string","format":"date"},"to":{"type":"string","format":"date"}}}}},
  "report_realization_posting_create":{"type":"object","required":["month","year"],"properties":{"month":{"type":"integer","minimum":1,"maximum":12},"year":{"type":"integer","minimum":2023}}},
  "finance_document_b2b_sales":{"type":"object","required":["date"],"properties":{"date":{"type":"string","format":"month"},"language":{"type":"string"}}},
  "finance_mutual_settlement_report":{"type":"object","required":["date"],"properties":{"date":{"type":"string","format":"month"},"language":{"type":"string"}}},
  "finance_compensation_report":{"type":"object","required":["date"],"properties":{"date":{"type":"string","format":"month"},"language":{"type":"string"}}},
  "finance_decompensation_report":{"type":"object","required":["date"],"properties":{"date":{"type":"string","format":"month"},"language":{"type":"string"}}},
  "cargoes_label_create":{"type":"object","required":["supply_id"],"properties":{"cargoes":{"type":"array","items":{"type":"object","properties":{"cargo_id":{"type":"integer"}}}},"supply_id":{"type":"integer"}}},
  "posting_fbs_act_container_labels":{"type":"object","required":["id"],"properties":{"id":{"type":"integer"}}},
  "posting_fbs_package_label":{"type":"object","required":["posting_number"],"properties":{"posting_number":{"type":"array","items":{"type":"string"},"maxItems":20}}},
  "posting_fbs_package_label_create":{"type":"object","required":["posting_number"],"properties":{"posting_number":{"type":"array","items":{"type":"string"}}}},
  "cargoes_transport_label_by_order_create":{"type":"object","required":["order_id"],"properties":{"order_id":{"type":"integer"}}},
  "cargoes_transport_label_create":{"type":"object","required":["supply_id"],"properties":{"supply_id":{"type":"integer"},"transport_cargo_ids":{"type":"array","maxItems":40,"items":{"type":"string"}}}},
  "fbp_act_from_create":{"type":"object","required":["supply_id"],"properties":{"supply_id":{"type":"string"}}},
  "fbp_act_to_create":{"type":"object","required":["supply_id"],"properties":{"supply_id":{"type":"string"}}},
  "fbp_label_create":{"type":"object","required":["supply_id"],"properties":{"supply_id":{"type":"string"}}},
  "fbp_draft_direct_product_validate":{"type":"object","required":["skus","warehouse_id"],"properties":{"skus":{"type":"array","items":{"type":"object","required":["count","sku"],"properties":{"count":{"type":"integer"},"sku":{"type":"integer"}}}},"warehouse_id":{"type":"integer"}}},
  "fbp_draft_dropoff_product_validate":{"type":"object","required":["skus","warehouse_id"],"properties":{"skus":{"type":"array","items":{"type":"object","required":["count","sku"],"properties":{"count":{"type":"integer"},"sku":{"type":"integer"}}}},"warehouse_id":{"type":"integer"}}},
  "fbp_draft_pickup_product_validate":{"type":"object","required":["skus","warehouse_id"],"properties":{"skus":{"type":"array","items":{"type":"object","required":["count","sku"],"properties":{"count":{"type":"integer"},"sku":{"type":"integer"}}}},"warehouse_id":{"type":"integer"}}},
  "chat_history_v3":{"type":"object","required":["chat_id"],"properties":{"chat_id":{"type":"string"},"direction":{"type":"string"},"filter":{"type":"object","properties":{"message_ids":{"type":"array","items":{"type":"string"}}}},"from_message_id":{"type":"integer"},"limit":{"type":"integer"}}}
}

TEMPLATE_REPLACEMENTS = {
  'template: {"operation":"report_marked_products_sales_create","params":{}}': 'template: {"operation":"report_marked_products_sales_create","params":{"date":{"from":"2026-01-01","to":"2026-01-01"}}}',
  'template: {"operation":"finance_document_b2b_sales","params":{"date":"2026-01-01"}}': 'template: {"operation":"finance_document_b2b_sales","params":{"date":"2026-01"}}',
  'template: {"operation":"finance_mutual_settlement_report","params":{"date":"2026-01-01"}}': 'template: {"operation":"finance_mutual_settlement_report","params":{"date":"2026-01"}}',
  'template: {"operation":"finance_compensation_report","params":{"date":"2026-01-01"}}': 'template: {"operation":"finance_compensation_report","params":{"date":"2026-01"}}',
  'template: {"operation":"finance_decompensation_report","params":{"date":"2026-01-01"}}': 'template: {"operation":"finance_decompensation_report","params":{"date":"2026-01"}}',
  'template: {"operation":"cargoes_label_create","params":{"supply_id":1}}': 'template: {"operation":"cargoes_label_create","params":{"supply_id":1,"cargoes":[{"cargo_id":1}]}}',
  'template: {"operation":"posting_fbs_package_label_create","params":{"posting_number":"POSTING_NUMBER"}}': 'template: {"operation":"posting_fbs_package_label_create","params":{"posting_number":["POSTING_NUMBER"]}}',
  'template: {"operation":"cargoes_transport_label_create","params":{"supply_id":1}}': 'template: {"operation":"cargoes_transport_label_create","params":{"supply_id":1,"transport_cargo_ids":["1"]}}'
}

SEMANTIC_INSERT = r'''
    if (operation === "report_placement_by_products_create" || operation === "report_placement_by_supplies_create") {
      const start = Date.parse(`${normalized.date_from}T00:00:00Z`);
      const end = Date.parse(`${normalized.date_to}T00:00:00Z`);
      if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) fail("INVALID_OPERATION_PARAMS", "params.date_to должен быть не раньше params.date_from.");
      if ((end - start) / 86400000 > 30) fail("INVALID_OPERATION_PARAMS", "Период placement-отчёта не может превышать 31 календарный день.");
    }
    if (operation === "report_marked_products_sales_create") {
      const start = Date.parse(`${normalized.date.from}T00:00:00Z`);
      const end = Date.parse(`${normalized.date.to}T00:00:00Z`);
      if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) fail("INVALID_OPERATION_PARAMS", "params.date.to должен быть не раньше params.date.from.");
    }
'''


def patch_file(path: Path, transform):
    original = path.read_text(encoding="utf-8")
    updated = transform(original)
    if updated == original:
        raise RuntimeError(f"no change produced for {path}")
    path.write_text(updated, encoding="utf-8", newline="\n")


def patch_registry(text: str) -> str:
    for old, new in TEMPLATE_REPLACEMENTS.items():
        count = text.count(old)
        if count != 1:
            raise RuntimeError(f"registry template anchor count {count}: {old}")
        text = text.replace(old, new, 1)
    return text


def patch_contract(text: str) -> str:
    schema_json = json.dumps(EXACT_SCHEMAS, ensure_ascii=False, separators=(",", ":"))
    pattern = re.compile(r"  const EFFECT_REPAIR_PARAM_SCHEMAS = deepFreeze\(\{.*?\}\);", re.S)
    replacement = f"  const EFFECT_REPAIR_PARAM_SCHEMAS = deepFreeze({schema_json});"
    text, count = pattern.subn(replacement, text, count=1)
    if count != 1:
        raise RuntimeError(f"effect schema block replacement count {count}")
    old_month_anchor = '      if (schema.format === "date" && !/^\\d{4}-\\d{2}-\\d{2}$/.test(value)) fail("INVALID_OPERATION_PARAMS", `${path} должен быть датой YYYY-MM-DD.`);\n      if (schema.format === "date-time" && !Number.isFinite(Date.parse(value))) fail("INVALID_OPERATION_PARAMS", `${path} должен быть ISO date-time.`);'
    new_month_anchor = '      if (schema.format === "date" && !/^\\d{4}-\\d{2}-\\d{2}$/.test(value)) fail("INVALID_OPERATION_PARAMS", `${path} должен быть датой YYYY-MM-DD.`);\n      if (schema.format === "month" && !/^\\d{4}-(0[1-9]|1[0-2])$/.test(value)) fail("INVALID_OPERATION_PARAMS", `${path} должен быть периодом YYYY-MM.`);\n      if (schema.format === "date-time" && !Number.isFinite(Date.parse(value))) fail("INVALID_OPERATION_PARAMS", `${path} должен быть ISO date-time.`);'
    if text.count(old_month_anchor) != 1:
        raise RuntimeError("month-format validation anchor mismatch")
    text = text.replace(old_month_anchor, new_month_anchor, 1)
    old_normalize = '    validateEffectRepairValue(normalized, schema, "params");\n    return normalized;'
    new_normalize = '    validateEffectRepairValue(normalized, schema, "params");\n' + SEMANTIC_INSERT + '    return normalized;'
    if text.count(old_normalize) != 1:
        raise RuntimeError("effect normalize semantic anchor mismatch")
    text = text.replace(old_normalize, new_normalize, 1)
    return text


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo-root", type=Path, required=True)
    args = ap.parse_args()
    shared = args.repo_root.resolve() / "tooling/llm-api-bridges/ozon-seller/dist-step7-candidate/shared"
    registry = shared / "ozon_operation_registry.js"
    contract = shared / "ozon_contract.js"
    if not registry.is_file() or not contract.is_file():
        raise RuntimeError("missing repaired runtime files")
    patch_file(registry, patch_registry)
    patch_file(contract, patch_contract)
    print("OZON_26_EXACT_SWAGGER_SCHEMA_REPAIR_PASS")
    print("OZON_26_EXACT_TEMPLATES_REPAIR_PASS")
    print("OZON_FINANCE_MONTH_FORMAT_PASS")
    print("OZON_PLACEMENT_31_DAY_BOUND_PASS")
    print("OZON_MARKED_SALES_DATE_OBJECT_PASS")
    print("OZON_CARGOES_LABEL_OBJECT_SCHEMA_PASS")
    print("OZON_PACKAGE_LABEL_BATCH_ARRAY_SCHEMA_PASS")

if __name__ == "__main__":
    main()
