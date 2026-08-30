#!/usr/bin/env python3
import argparse, csv, hashlib, json, re
from collections import Counter
from pathlib import Path

SELLER_SWAGGER_BYTES = 3933043
SELLER_SWAGGER_SHA256 = "39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40"
SELLER_OPERATIONS = 463
ACCEPTED_SELLER_READS = 219

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

NEW_READ_SPECS = {
    "POST /v1/pass/list": ["arrival_pass_list","operator_personal_data_gate","orders_postings","assembly_carriage"],
    "POST /v5/fbs/posting/product/exemplar/validate": ["fbs_product_exemplar_validate","safe_projection","orders_postings","fbs_postings"],
    "POST /v2/carriage/delivery/list": ["carriage_delivery_list_v2","safe_projection","orders_postings","assembly_carriage"],
    "POST /v1/posting/fbs/pick-up-code/verify": ["posting_fbs_pickup_code_verify","safe_projection","orders_postings","fbs_postings"],
    "POST /v1/posting/global/etgb": ["posting_global_etgb","safe_projection","orders_postings","labels_documents"],
    "POST /v2/returns/rfbs/get": ["rfbs_returns_get","operator_personal_data_gate","returns_cancellations","returns"],
    "POST /v2/conditional-cancellation/list": ["conditional_cancellation_list","operator_personal_data_gate","returns_cancellations","cancellations"],
    "POST /v3/chat/list": ["chat_list_v3","safe_projection","reviews_questions","chats"],
    "POST /v1/finance/document-b2b-sales/json": ["finance_b2b_sales_json","operator_personal_data_gate","finance","documents_reports"],
    "POST /v1/receipts/seller/list": ["receipts_seller_list","safe_projection","finance","documents_reports"],
    "POST /v2/actions/discounts-task/list": ["discount_task_list_v2","operator_personal_data_gate","prices_promotions","actions_promotions"],
    "POST /v2/posting/digital/list": ["posting_digital_list_v2","safe_projection","orders_postings","fbs_postings"],
    "POST /v1/notification/list": ["notification_list","safe_projection","account_access","seller_settings"],
    "POST /v1/notification/push-type/list": ["notification_push_type_list","safe_projection","account_access","seller_settings"],
    "POST /v1/fbp/archive/get": ["fbp_archive_get","operator_personal_data_gate","supplies_fbo","supply_orders"],
    "POST /v1/fbp/archive/list": ["fbp_archive_list","operator_personal_data_gate","supplies_fbo","supply_orders"],
    "POST /v1/fbp/draft/get": ["fbp_draft_get","operator_personal_data_gate","supplies_fbo","drafts"],
    "POST /v1/fbp/draft/list": ["fbp_draft_list","operator_personal_data_gate","supplies_fbo","drafts"],
    "POST /v1/fbp/order/get": ["fbp_order_get","operator_personal_data_gate","supplies_fbo","supply_orders"],
    "POST /v1/fbp/order/list": ["fbp_order_list","operator_personal_data_gate","supplies_fbo","supply_orders"],
    "POST /v1/delivery/check": ["delivery_check","operator_personal_data_gate","warehouse_logistics","delivery_methods"],
    "POST /v2/delivery/checkout": ["delivery_checkout_v2","operator_personal_data_gate","warehouse_logistics","delivery_methods"],
    "POST /v1/delivery/map": ["delivery_map","safe_projection","warehouse_logistics","delivery_methods"],
    "POST /v1/delivery/point/list": ["delivery_point_list","safe_projection","warehouse_logistics","delivery_methods"],
    "POST /v1/order/cancel/check": ["order_cancel_check","safe_projection","returns_cancellations","cancellations"],
    "POST /v1/posting/marks": ["posting_marks","safe_projection","orders_postings","fbs_postings"],
}

SPECIAL_REJECTS = {
    "POST /v3/chat/history": ["REJECT_SENSITIVE_UNSTRUCTURED_CONTENT","raw buyer/seller/courier chat message bodies are unstructured model input"],
    "POST /v1/notification/check": ["REJECT_NON_READ_EXTERNAL_EFFECT_CONTROL","checks a caller-supplied webhook URL and is not a passive Seller data read"],
}

GENERATION_OVERRIDE_KEYS = {
    "POST /v1/barcode/add",
    "POST /v1/barcode/generate",
    "POST /v1/cargoes/create",
    "POST /v1/cargoes-label/create",
    "POST /v2/posting/fbs/act/get-container-labels",
    "POST /v2/posting/fbs/package-label",
    "POST /v2/posting/fbs/package-label/create",
    "POST /v1/return/giveout/barcode-reset",
    "POST /v1/fbp/draft/direct/product/validate",
    "POST /v1/fbp/draft/drop-off/product/validate",
    "POST /v1/fbp/draft/pick-up/product/validate",
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


def is_generation(row):
    if row["operation_key"] in GENERATION_OVERRIDE_KEYS:
        return True
    oid=row["operation_id"].lower()
    summary=row["purpose"].lower()
    return (
        "create" in oid or "generate" in oid or "report" in oid or
        any(x in summary for x in [
            "создать ", "создание ", "сгенерировать", "генерирует",
            "создаёт", "создает", "задание на формирование",
            "задание на выгрузку", "задание на генерацию"
        ])
    )


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
    for row in rows:
        key=row["operation_key"]
        out={k:v for k,v in row.items() if k!="description"}
        if key in seller:
            alias,meta=seller[key]
            out.update({
                "terminal_decision":"ACCEPTED_IMPLEMENTED_READ",
                "decision_reason":"accepted Step6 Seller registry exact method+path",
                "alias":alias,
                "privacy_policy":meta.get("privacy_policy"),
                "cluster":meta.get("cluster"),
                "section":meta.get("section"),
            })
            if key in step5 and step5[key]!="IMPLEMENT_READ":
                raise SystemExit(f"SELLER_STEP7_STEP5_REJECT_BECAME_ACCEPTED_FAIL:{key}:{step5[key]}")
        elif key in step5:
            d=step5[key]
            if d=="IMPLEMENT_READ":
                raise SystemExit(f"SELLER_STEP7_STEP5_READ_MISSING_FROM_ACCEPTED_BASE_FAIL:{key}")
            out.update({
                "terminal_decision":d,
                "decision_reason":"preserved accepted Step5 exact terminal decision",
            })
        elif row["deprecated"]:
            out.update({
                "terminal_decision":"REJECT_DEPRECATED_REPLACED",
                "decision_reason":"exact Swagger operation has deprecated=true",
            })
        elif key in SUNSET_KEYS:
            out.update({
                "terminal_decision":"REJECT_SUNSET_REPLACED",
                "decision_reason":"exact Swagger description/changelog names shutdown or current replacement",
            })
        elif key in NEW_READ_SPECS:
            alias,privacy,cluster,section=NEW_READ_SPECS[key]
            out.update({
                "terminal_decision":"IMPLEMENT_READ_STEP7",
                "decision_reason":"exact schema is passive read/read-like computation with no Seller state mutation",
                "alias":alias,
                "privacy_policy":privacy,
                "cluster":cluster,
                "section":section,
            })
        elif key in SPECIAL_REJECTS:
            d,why=SPECIAL_REJECTS[key]
            out.update({"terminal_decision":d,"decision_reason":why})
        elif is_generation(row):
            out.update({
                "terminal_decision":"REJECT_SERVER_SIDE_GENERATION_OR_CREATION",
                "decision_reason":"operation creates business state, job, artifact, draft, label, report, or validated bundle",
            })
        else:
            text=f'{row["operation_id"]} {row["purpose"]}'
            if READLIKE_RE.search(text) and key not in READLIKE_MUTATION_KEYS:
                raise SystemExit(f"SELLER_STEP7_UNREVIEWED_READLIKE_REJECT_FAIL:{key}")
            out.update({
                "terminal_decision":"REJECT_MUTATION_SIDE_EFFECT",
                "decision_reason":"operation changes Seller/Ozon business or account state",
            })
        output.append(out)

    counts=Counter(r["terminal_decision"] for r in output)
    expected={
        "ACCEPTED_IMPLEMENTED_READ":219,
        "IMPLEMENT_READ_STEP7":26,
        "REJECT_DEPRECATED_REPLACED":8,
        "REJECT_SUNSET_REPLACED":12,
        "REJECT_SERVER_SIDE_GENERATION_OR_CREATION":64,
        "REJECT_MUTATION_SIDE_EFFECT":132,
        "REJECT_SENSITIVE_UNSTRUCTURED_CONTENT":1,
        "REJECT_NON_READ_EXTERNAL_EFFECT_CONTROL":1,
    }
    if dict(counts)!=expected:
        raise SystemExit(f"SELLER_STEP7_TERMINAL_COUNTS_FAIL:{dict(counts)}")
    if len(output)!=463 or sum(counts.values())!=463:
        raise SystemExit("SELLER_STEP7_463_EXHAUSTIVE_FAIL")
    if any(x in r["terminal_decision"] for r in output for x in ["PENDING","UNKNOWN","UNRESOLVED"]):
        raise SystemExit("SELLER_STEP7_NONTERMINAL_DECISION_FAIL")

    new_privacy=Counter(r.get("privacy_policy") for r in output if r["terminal_decision"]=="IMPLEMENT_READ_STEP7")
    if new_privacy!=Counter({"safe_projection":13,"operator_personal_data_gate":13}):
        raise SystemExit(f"SELLER_STEP7_NEW_READ_PRIVACY_COUNTS_FAIL:{dict(new_privacy)}")

    payload={
        "schema":"OZON_SELLER_STEP7_TERMINAL_MATRIX_V2",
        "as_of":"2026-08-30",
        "roadmap_step":7,
        "authority":{
            "swagger_bytes":SELLER_SWAGGER_BYTES,
            "swagger_sha256":SELLER_SWAGGER_SHA256,
            "openapi":"3.0.0",
            "paths":463,
            "operations":463,
            "step5_terminal_decisions_preserved":118,
        },
        "base":{"accepted_step6_seller_reads":219},
        "counts":{
            "rows":463,
            "accepted_implemented_reads":219,
            "new_reads_to_implement":26,
            "final_admissible_reads":245,
            "final_non_reads":218,
            **expected,
            "new_safe_projection":13,
            "new_personal_data_gate":13,
        },
        "invariants":[
            "ALL_463_CURRENT_SELLER_OPERATIONS_EXACTLY_ONCE",
            "ALL_118_ACCEPTED_STEP5_TERMINAL_DECISIONS_PRESERVED",
            "ZERO_UNKNOWN_PENDING_UNRESOLVED",
            "ONE_EXPLICIT_COMMAND_ONE_BUSINESS_REQUEST",
            "NO_HIDDEN_PAGINATION_RETRY_POLLING_FANOUT_CHAINING",
            "EXISTING_B0_PERSONAL_DATA_GATE_ONLY",
            "NO_MUTATION_UNDER_READ_ALIAS",
            "NO_DEPRECATED_ENDPOINT_INSTEAD_OF_CURRENT_REPLACEMENT",
            "SERVER_SIDE_GENERATION_IS_NOT_A_READ",
            "RAW_CHAT_MESSAGE_HISTORY_REMAINS_UNAVAILABLE",
            "CALLER_SUPPLIED_WEBHOOK_CHECK_REMAINS_UNAVAILABLE",
        ],
        "rows":output,
    }
    Path(args.out_json).write_text(json.dumps(payload,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    fields=["operation_key","http_method","fixed_path","operation_id","source_category_tag","purpose","deprecated","terminal_decision","decision_reason","alias","privacy_policy","cluster","section"]
    with Path(args.out_csv).open("w",encoding="utf-8",newline="") as f:
        w=csv.DictWriter(f,fieldnames=fields,extrasaction="ignore")
        w.writeheader(); w.writerows(output)
    summary=[
        "# Ozon Seller Step 7 — 463/463 terminal decision matrix",
        "",
        f"- Exact Seller Swagger: `{SELLER_SWAGGER_BYTES}` bytes / `{SELLER_SWAGGER_SHA256}`.",
        "- Current operations: **463/463 classified exactly once**.",
        "- Accepted Step 6 Seller reads carried forward: **219**.",
        "- Accepted Step 5 terminal decisions preserved: **118/118**.",
        "- New admissible reads to implement in Step 7: **26**.",
        "- Final admissible Seller read surface after implementation: **245**.",
        "- Final non-read/unavailable operations: **218**.",
        "",
        "## Terminal decisions",
        "",
    ]
    for name,count in sorted(expected.items()): summary.append(f"- `{name}`: **{count}**")
    summary += [
        "", "## New read privacy", "",
        "- `safe_projection`: **13**",
        "- `operator_personal_data_gate`: **13**",
        "",
        "There are no `UNKNOWN`, `PENDING`, or `UNRESOLVED` rows.",
        "Production acceptance still requires implementation of all 26 `IMPLEMENT_READ_STEP7` rows and cross-platform artifact verification.",
    ]
    Path(args.out_summary).write_text("\n".join(summary)+"\n",encoding="utf-8")
    print("SELLER_STEP7_EXACT_SWAGGER_IDENTITY_PASS")
    print("SELLER_STEP7_ACCEPTED_219_BASE_RECONCILIATION_PASS")
    print("SELLER_STEP7_STEP5_118_TERMINAL_DECISIONS_PRESERVED_PASS")
    print("SELLER_STEP7_463_EXHAUSTIVE_TERMINAL_MATRIX_PASS")
    print("SELLER_STEP7_NEW_READS_26_PASS")
    print("SELLER_STEP7_NEW_READ_PRIVACY_13_GATE_13_SAFE_PASS")
    print("SELLER_STEP7_ZERO_UNKNOWN_PENDING_UNRESOLVED_PASS")
    print(json.dumps(payload["counts"],ensure_ascii=False,sort_keys=True))
    print("OZON_SELLER_STEP7_TERMINAL_MATRIX_PASS")

if __name__=="__main__":
    main()
