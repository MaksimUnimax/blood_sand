#!/usr/bin/env python3
import argparse, csv, hashlib, json, re
from collections import Counter
from pathlib import Path

SELLER_SWAGGER_BYTES = 3933043
SELLER_SWAGGER_SHA256 = "39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40"
SELLER_OPERATIONS = 463
ACCEPTED_SELLER_READS = 245

SUNSET_KEYS = {
    "POST /v1/actions/discounts-task/list",
    "POST /v1/product/certification/list",
    "POST /v1/warehouse/list",
    "POST /v1/delivery-method/list",
    "POST /v1/polygon/bind",
    "POST /v1/supply-order/timeslot/get",
    "GET /v1/cargoes-label/file/{file_guid}",
    "POST /v1/carriage/delivery/list",
    "POST /v2/posting/fbs/act/create",
    "POST /v1/posting/fbs/package-label/create",
    "POST /v3/finance/transaction/totals",
    "POST /v1/analytics/manage/stocks",
}

# Project effect rule:
# A passive operation remains READ even if it starts server-side computation or
# creates a report/PDF/PNG/label/act/validation artifact. Only changes to
# seller/Ozon business/account/process state are mutations.
EFFECT_REPAIR_READ_SPECS = {
    "POST /v1/report/products/create": ["report_products_create","safe_projection","finance","documents_reports","READ_ARTIFACT_GENERATION"],
    "POST /v2/report/returns/create": ["report_returns_create_v2","safe_projection","returns_cancellations","returns","READ_ARTIFACT_GENERATION"],
    "POST /v1/report/postings/create": ["report_postings_create","safe_projection","orders_postings","labels_documents","READ_ARTIFACT_GENERATION"],
    "POST /v1/report/discounted/create": ["report_discounted_create","safe_projection","finance","documents_reports","READ_ARTIFACT_GENERATION"],
    "POST /v1/report/warehouse/stock": ["report_warehouse_stock","safe_projection","stocks_inventory","warehouse_fbs","READ_ARTIFACT_GENERATION"],
    "POST /v1/report/placement/by-products/create": ["report_placement_by_products_create","safe_projection","stocks_inventory","stock_movement_turnover","READ_ARTIFACT_GENERATION"],
    "POST /v1/report/placement/by-supplies/create": ["report_placement_by_supplies_create","safe_projection","supplies_fbo","supply_orders","READ_ARTIFACT_GENERATION"],
    "POST /v1/report/marked-products-sales/create": ["report_marked_products_sales_create","safe_projection","sales_analytics","period_product_category","READ_ARTIFACT_GENERATION"],
    "POST /v1/report/realization/posting/create": ["report_realization_posting_create","safe_projection","finance","realization","READ_ARTIFACT_GENERATION"],
    "POST /v1/finance/document-b2b-sales": ["finance_document_b2b_sales","safe_projection","finance","documents_reports","READ_ARTIFACT_GENERATION"],
    "POST /v1/finance/mutual-settlement": ["finance_mutual_settlement_report","safe_projection","finance","documents_reports","READ_ARTIFACT_GENERATION"],
    "POST /v1/finance/compensation": ["finance_compensation_report","safe_projection","finance","documents_reports","READ_ARTIFACT_GENERATION"],
    "POST /v1/finance/decompensation": ["finance_decompensation_report","safe_projection","finance","documents_reports","READ_ARTIFACT_GENERATION"],
    "POST /v1/cargoes-label/create": ["cargoes_label_create","safe_projection","supplies_fbo","cargoes","READ_ARTIFACT_GENERATION"],
    "POST /v2/posting/fbs/act/get-container-labels": ["posting_fbs_act_container_labels","operator_personal_data_gate","orders_postings","labels_documents","READ_BINARY_DOCUMENT"],
    "POST /v2/posting/fbs/package-label": ["posting_fbs_package_label","operator_personal_data_gate","orders_postings","labels_documents","READ_BINARY_DOCUMENT"],
    "POST /v2/posting/fbs/package-label/create": ["posting_fbs_package_label_create","safe_projection","orders_postings","labels_documents","READ_ARTIFACT_GENERATION"],
    "POST /v1/cargoes/label/transport-by-order/create": ["cargoes_transport_label_by_order_create","safe_projection","supplies_fbo","cargoes","READ_ARTIFACT_GENERATION"],
    "POST /v1/cargoes/label/transport/create": ["cargoes_transport_label_create","safe_projection","supplies_fbo","cargoes","READ_ARTIFACT_GENERATION"],
    "POST /v1/fbp/act-from/create": ["fbp_act_from_create","safe_projection","supplies_fbo","acts","READ_ARTIFACT_GENERATION"],
    "POST /v1/fbp/act-to/create": ["fbp_act_to_create","safe_projection","supplies_fbo","acts","READ_ARTIFACT_GENERATION"],
    "POST /v1/fbp/label/create": ["fbp_label_create","safe_projection","supplies_fbo","cargoes","READ_ARTIFACT_GENERATION"],
    "POST /v1/fbp/draft/direct/product/validate": ["fbp_draft_direct_product_validate","safe_projection","supplies_fbo","drafts","READ_VALIDATION"],
    "POST /v1/fbp/draft/drop-off/product/validate": ["fbp_draft_dropoff_product_validate","safe_projection","supplies_fbo","drafts","READ_VALIDATION"],
    "POST /v1/fbp/draft/pick-up/product/validate": ["fbp_draft_pickup_product_validate","safe_projection","supplies_fbo","drafts","READ_VALIDATION"],
    "POST /v3/chat/history": ["chat_history_v3","operator_personal_data_gate","reviews_questions","chats","READ_SENSITIVE"],
}

# These 38 operations were previously mixed into the generic "generation"
# bucket, but they actually create/update persistent business/process state.
OLD_GENERATION_BUCKET_TRUE_WRITE_KEYS = {
    "POST /v3/product/import",
    "POST /v1/product/import-by-sku",
    "POST /v1/barcode/add",
    "POST /v1/barcode/generate",
    "POST /v1/pricing-strategy/create",
    "POST /v1/carriage/pass/create",
    "POST /v1/return/pass/create",
    "POST /v1/polygon/create",
    "POST /v1/supply-order/pass/create",
    "POST /v1/draft/crossdock/create",
    "POST /v1/draft/direct/create",
    "POST /v1/draft/multi-cluster/create",
    "POST /v1/cargoes/create",
    "POST /v2/draft/supply/create",
    "POST /v1/carriage/create",
    "POST /v1/return/giveout/barcode-reset",
    "POST /v2/invoice/create-or-update",
    "POST /v1/review/comment/create",
    "POST /v1/question/answer/create",
    "POST /v2/product/certificate/create",
    "POST /v1/warehouse/fbs/create",
    "POST /v1/warehouse/fbs/pickup/courier/create",
    "POST /v1/warehouse/erfbs/aggregator/create",
    "POST /v1/warehouse/erfbs/non-integrated/create",
    "POST /v1/seller-actions/create/discount",
    "POST /v1/seller-actions/create/discount-with-condition",
    "POST /v1/seller-actions/create/installment",
    "POST /v1/seller-actions/create/multi-level-discount",
    "POST /v1/seller-actions/create/voucher",
    "POST /v1/cargoes/transport/create",
    "POST /v1/fbp/draft/direct/seller-dlv/create",
    "POST /v1/fbp/draft/direct/create",
    "POST /v1/fbp/draft/drop-off/create",
    "POST /v1/fbp/draft/pick-up/create",
    "POST /v1/fbp/draft/direct/tpl-dlv/create",
    "POST /v1/carriage/container/create",
    "POST /v1/chat/start",
    "POST /v2/order/create",
}

SPECIAL_REJECTS = {
    "POST /v1/notification/check": [
        "REJECT_NON_READ_EXTERNAL_EFFECT_CONTROL",
        "checks a caller-supplied webhook URL and causes an active external callback; separate effect policy required",
    ],
}

READLIKE_MUTATION_KEYS = {
    "POST /v1/pricing-strategy/status",
    "POST /v6/fbs/posting/product/exemplar/set",
    "POST /v2/fbs/posting/delivering",
    "POST /v2/fbs/posting/last-mile",
    "POST /v2/fbs/posting/delivered",
    "POST /v2/posting/fbs/product/country/set",
    "POST /v2/review/change-status",
    "POST /v1/question/change-status",
    "POST /v1/seller-actions/update/discount-with-condition",
    "POST /v1/seller-actions/update/multi-level-discount",
    "POST /v1/fbp/draft/direct/seller-dlv/edit",
    "POST /v1/fbp/order/direct/seller-dlv/edit",
    "POST /v1/fbp/order/drop-off/dlv/edit",
}

HTTP = {"get","post","put","patch","delete"}
READLIKE_RE = re.compile(r"Get|List|Info|Check|Validate|Status|Получить|Список|Информац|Провер|Валидац|Статус|Сумм|маркиров", re.I)

def sha256(data):
    return hashlib.sha256(data).hexdigest()

def operation_rows(swagger):
    rows=[]
    for path,item in swagger["paths"].items():
        for method,op in item.items():
            if method.lower() not in HTTP:
                continue
            rows.append({
                "operation_key": f"{method.upper()} {path}",
                "http_method": method.upper(),
                "fixed_path": path,
                "operation_id": op.get("operationId") or "",
                "source_category_tag": (op.get("tags") or [""])[0],
                "purpose": op.get("summary") or "",
                "description": op.get("description") or "",
                "deprecated": bool(op.get("deprecated", False)),
            })
    return rows

def load_step5(path):
    p=Path(path)
    if p.suffix.lower()=='.csv':
        rows=list(csv.DictReader(p.open(encoding='utf-8')))
    else:
        rows=json.loads(p.read_text(encoding='utf-8'))['rows']
    if len(rows)!=118:
        raise SystemExit(f"SELLER_STEP7_STEP5_DECISION_COUNT_FAIL:{len(rows)}")
    return {r['operation_key']:r['terminal_decision'] for r in rows}

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--swagger", required=True)
    ap.add_argument("--registry-json", required=True)
    ap.add_argument("--step5-decisions", required=True)
    ap.add_argument("--out-json", required=True)
    ap.add_argument("--out-csv", required=True)
    ap.add_argument("--out-summary", required=True)
    args=ap.parse_args()

    swagger_bytes=Path(args.swagger).read_bytes()
    if len(swagger_bytes)!=SELLER_SWAGGER_BYTES or sha256(swagger_bytes)!=SELLER_SWAGGER_SHA256:
        raise SystemExit("SELLER_STEP7_EXACT_SWAGGER_IDENTITY_FAIL")
    swagger=json.loads(swagger_bytes)
    rows=operation_rows(swagger)
    if swagger.get("openapi")!="3.0.0" or len(rows)!=SELLER_OPERATIONS or len(swagger.get("paths",{}))!=SELLER_OPERATIONS:
        raise SystemExit("SELLER_STEP7_EXACT_SWAGGER_SHAPE_FAIL")
    keys=[r["operation_key"] for r in rows]
    if len(keys)!=len(set(keys)):
        raise SystemExit("SELLER_STEP7_DUPLICATE_METHOD_PATH_FAIL")

    registry=json.loads(Path(args.registry_json).read_text(encoding="utf-8"))
    seller={}
    for alias,meta in registry.items():
        if str(meta.get("provider","seller_api"))!="seller_api":
            continue
        if meta.get("effect") not in (None, "READ"):
            continue
        if meta.get("execution_enabled") is False:
            continue
        key=f'{str(meta["method"]).upper()} {meta["path"]}'
        if key in seller:
            raise SystemExit(f"SELLER_STEP7_DUPLICATE_ACCEPTED_METHOD_PATH_FAIL:{key}")
        seller[key]=(alias,meta)
    if len(seller)!=ACCEPTED_SELLER_READS:
        raise SystemExit(f"SELLER_STEP7_ACCEPTED_BASE_COUNT_FAIL:{len(seller)}")
    if not set(seller).issubset(set(keys)):
        raise SystemExit("SELLER_STEP7_ACCEPTED_BASE_OUTSIDE_SWAGGER_FAIL")

    step5=load_step5(args.step5_decisions)
    if not set(step5).issubset(set(keys)):
        raise SystemExit("SELLER_STEP7_STEP5_OUTSIDE_SWAGGER_FAIL")

    output=[]
    step5_overrides=[]
    for row in rows:
        key=row["operation_key"]
        out={k:v for k,v in row.items() if k!="description"}
        if key in seller:
            alias,meta=seller[key]
            out.update({
                "terminal_decision":"ACCEPTED_IMPLEMENTED_READ",
                "decision_reason":"current 245-read Seller production registry exact method+path",
                "alias":alias,
                "privacy_policy":meta.get("privacy_policy"),
                "cluster":meta.get("cluster"),
                "section":meta.get("section"),
                "effect_class":"READ_CURRENT",
            })
            if key in step5 and step5[key] not in ("IMPLEMENT_READ","ACCEPTED_IMPLEMENTED_READ"):
                step5_overrides.append({"operation_key":key,"old_decision":step5[key],"new_decision":"ACCEPTED_IMPLEMENTED_READ"})
        elif key in EFFECT_REPAIR_READ_SPECS:
            alias,privacy,cluster,section,effect_class=EFFECT_REPAIR_READ_SPECS[key]
            out.update({
                "terminal_decision":"IMPLEMENT_READ_EFFECT_REPAIR",
                "decision_reason":"passive computation/artifact generation; no Seller/Ozon business/account/process state mutation",
                "alias":alias,
                "privacy_policy":privacy,
                "cluster":cluster,
                "section":section,
                "effect_class":effect_class,
            })
            if key in step5 and step5[key] not in ("IMPLEMENT_READ","ACCEPTED_IMPLEMENTED_READ"):
                step5_overrides.append({"operation_key":key,"old_decision":step5[key],"new_decision":"IMPLEMENT_READ_EFFECT_REPAIR"})
        elif row["deprecated"]:
            out.update({
                "terminal_decision":"REJECT_DEPRECATED_REPLACED",
                "decision_reason":"exact Swagger operation has deprecated=true",
                "effect_class":"DEPRECATED",
            })
        elif key in SUNSET_KEYS:
            out.update({
                "terminal_decision":"REJECT_SUNSET_REPLACED",
                "decision_reason":"exact Swagger description/changelog names shutdown or current replacement",
                "effect_class":"SUNSET_REPLACED",
            })
        elif key in SPECIAL_REJECTS:
            d,why=SPECIAL_REJECTS[key]
            out.update({"terminal_decision":d,"decision_reason":why,"effect_class":"EXTERNAL_ACTIVE_EFFECT"})
        elif key in OLD_GENERATION_BUCKET_TRUE_WRITE_KEYS:
            out.update({
                "terminal_decision":"REJECT_MUTATION_SIDE_EFFECT",
                "decision_reason":"operation creates or changes persistent Seller/Ozon business/account/process state",
                "effect_class":"WRITE_BUSINESS_STATE",
            })
        elif key in step5:
            d=step5[key]
            if d=="IMPLEMENT_READ":
                raise SystemExit(f"SELLER_EFFECT_REAUDIT_STEP5_READ_MISSING_FROM_CURRENT_REGISTRY:{key}")
            if d in ("REJECT_SERVER_SIDE_GENERATION_OR_CREATION","REJECT_SENSITIVE_UNSTRUCTURED_CONTENT"):
                raise SystemExit(f"SELLER_EFFECT_REAUDIT_UNREVIEWED_OLD_FALSE_NEGATIVE_CLASS:{key}:{d}")
            out.update({
                "terminal_decision":d,
                "decision_reason":"preserved Step5 decision after effect re-audit; not in corrected passive-generation/sensitive-read sets",
                "effect_class":"PRESERVED_TERMINAL",
            })
        else:
            text=f'{row["operation_id"]} {row["purpose"]}'
            if READLIKE_RE.search(text) and key not in READLIKE_MUTATION_KEYS:
                raise SystemExit(f"SELLER_EFFECT_REAUDIT_UNREVIEWED_READLIKE_REJECT:{key}")
            out.update({
                "terminal_decision":"REJECT_MUTATION_SIDE_EFFECT",
                "decision_reason":"operation changes Seller/Ozon business/account/process state",
                "effect_class":"WRITE_BUSINESS_STATE",
            })
        output.append(out)

    counts=Counter(r["terminal_decision"] for r in output)
    expected={
        "ACCEPTED_IMPLEMENTED_READ":245,
        "IMPLEMENT_READ_EFFECT_REPAIR":26,
        "REJECT_DEPRECATED_REPLACED":12,
        "REJECT_SUNSET_REPLACED":12,
        "REJECT_MUTATION_SIDE_EFFECT":167,
        "REJECT_NON_READ_EXTERNAL_EFFECT_CONTROL":1,
    }
    if dict(counts)!=expected:
        raise SystemExit(f"SELLER_EFFECT_REAUDIT_TERMINAL_COUNTS_FAIL:{dict(counts)}")
    if len(output)!=463 or sum(counts.values())!=463:
        raise SystemExit("SELLER_EFFECT_REAUDIT_463_EXHAUSTIVE_FAIL")
    if any(x in r["terminal_decision"] for r in output for x in ["PENDING","UNKNOWN","UNRESOLVED"]):
        raise SystemExit("SELLER_EFFECT_REAUDIT_NONTERMINAL_DECISION_FAIL")
    if any(r["terminal_decision"]=="REJECT_SERVER_SIDE_GENERATION_OR_CREATION" for r in output):
        raise SystemExit("SELLER_EFFECT_REAUDIT_GENERIC_GENERATION_REJECT_STILL_PRESENT")
    if any(r["terminal_decision"]=="REJECT_SENSITIVE_UNSTRUCTURED_CONTENT" for r in output):
        raise SystemExit("SELLER_EFFECT_REAUDIT_SENSITIVE_READ_FALSE_NEGATIVE_STILL_PRESENT")

    repair_privacy=Counter(r.get("privacy_policy") for r in output if r["terminal_decision"]=="IMPLEMENT_READ_EFFECT_REPAIR")
    if repair_privacy!=Counter({"safe_projection":23,"operator_personal_data_gate":3}):
        raise SystemExit(f"SELLER_EFFECT_REAUDIT_REPAIR_PRIVACY_COUNTS_FAIL:{dict(repair_privacy)}")

    payload={
        "schema":"OZON_SELLER_EFFECT_REAUDIT_TERMINAL_MATRIX_V1",
        "as_of":"2026-09-02",
        "authority":{
            "swagger_bytes":SELLER_SWAGGER_BYTES,
            "swagger_sha256":SELLER_SWAGGER_SHA256,
            "openapi":"3.0.0",
            "paths":463,
            "operations":463,
            "historical_step5_decisions_loaded":118,
            "historical_step5_false_negative_overrides":len(step5_overrides),
        },
        "base":{"current_production_seller_reads":245},
        "counts":{
            "rows":463,
            "accepted_implemented_reads":245,
            "reads_to_add_effect_repair":26,
            "corrected_admissible_reads":271,
            "corrected_non_reads":192,
            **expected,
            "repair_safe_projection":23,
            "repair_personal_data_gate":3,
        },
        "governing_rule":"READ iff the operation does not change Seller/Ozon business/account data or business-process state; passive report/document/label/act/validation generation remains READ",
        "invariants":[
            "ALL_463_CURRENT_SELLER_OPERATIONS_EXACTLY_ONCE",
            "ZERO_UNKNOWN_PENDING_UNRESOLVED",
            "ONE_EXPLICIT_COMMAND_ONE_BUSINESS_REQUEST",
            "NO_HIDDEN_PAGINATION_RETRY_POLLING_FANOUT_CHAINING",
            "EXISTING_B0_PERSONAL_DATA_GATE_ONLY",
            "NO_MUTATION_UNDER_READ_ALIAS",
            "NO_DEPRECATED_ENDPOINT_INSTEAD_OF_CURRENT_REPLACEMENT",
            "PASSIVE_ARTIFACT_GENERATION_WITHOUT_BUSINESS_STATE_CHANGE_IS_READ",
            "SENSITIVE_READS_USE_EXISTING_PERSONAL_DATA_GATE_NOT_COVERAGE_REMOVAL",
            "NO_GENERIC_CREATE_GENERATE_REPORT_NAME_BASED_REJECTION",
        ],
        "step5_false_negative_overrides":step5_overrides,
        "rows":output,
    }
    Path(args.out_json).write_text(json.dumps(payload,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    fields=["operation_key","http_method","fixed_path","operation_id","source_category_tag","purpose","deprecated","terminal_decision","effect_class","decision_reason","alias","privacy_policy","cluster","section"]
    with Path(args.out_csv).open("w",encoding="utf-8",newline="") as f:
        w=csv.DictWriter(f,fieldnames=fields,extrasaction="ignore")
        w.writeheader(); w.writerows(output)

    summary=[
        "# Ozon Seller effect re-audit — 463/463",
        "",
        f"- Exact Seller Swagger: `{SELLER_SWAGGER_BYTES}` bytes / `{SELLER_SWAGGER_SHA256}`.",
        "- Current operations: **463/463 classified exactly once by business effect**.",
        "- Current production Seller reads carried forward: **245**.",
        "- False-negative READs to add: **26**.",
        "- Corrected Seller READ surface: **271**.",
        "- Corrected terminal non-read/unavailable: **192**.",
        "",
        "## Governing rule",
        "",
        "An operation is READ when it does not change Seller/Ozon business/account data or business-process state.",
        "Report/PDF/PNG/label/act/validation generation is therefore READ when it only computes/produces requested output.",
        "",
        "## Terminal decisions",
        "",
    ]
    for name,count in sorted(expected.items()): summary.append(f"- `{name}`: **{count}**")
    summary += [
        "",
        "## Effect-repair privacy",
        "",
        "- `safe_projection`: **23**",
        "- `operator_personal_data_gate`: **3**",
        "",
        f"Historical Step5 false-negative decisions overridden by effect rule: **{len(step5_overrides)}**.",
        "There are no `UNKNOWN`, `PENDING`, `UNRESOLVED`, generic generation rejects, or sensitive-read coverage removals.",
        "Production acceptance still requires implementing all 26 `IMPLEMENT_READ_EFFECT_REPAIR` rows, strict per-operation schemas, binary/document handling, and cross-platform artifact verification.",
    ]
    Path(args.out_summary).write_text("\n".join(summary)+"\n",encoding="utf-8")
    print("SELLER_EFFECT_REAUDIT_EXACT_SWAGGER_IDENTITY_PASS")
    print("SELLER_EFFECT_REAUDIT_CURRENT_245_BASE_PASS")
    print("SELLER_EFFECT_REAUDIT_463_EXHAUSTIVE_PASS")
    print("SELLER_EFFECT_REAUDIT_FALSE_NEGATIVE_READS_26_PASS")
    print("SELLER_EFFECT_REAUDIT_CORRECTED_READ_SURFACE_271_PASS")
    print("SELLER_EFFECT_REAUDIT_NO_GENERIC_GENERATION_REJECT_PASS")
    print("SELLER_EFFECT_REAUDIT_SENSITIVE_READ_GATE_PASS")
    print("SELLER_EFFECT_REAUDIT_ZERO_UNKNOWN_PENDING_UNRESOLVED_PASS")
    print(json.dumps(payload["counts"],ensure_ascii=False,sort_keys=True))
    print("OZON_SELLER_EFFECT_REAUDIT_TERMINAL_MATRIX_PASS")

if __name__=="__main__":
    main()
