#!/usr/bin/env python3
import argparse,csv,json,pathlib
from collections import Counter

AUTHORITY={"seller_swagger_bytes":3933043,"seller_swagger_sha256":"39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40","openapi":"3.0.0","paths":463,"operations":463,"source":"original operator-supplied swagger.json; exact bytes recovered from Library and independently verified before freezing decisions"}

READS={
"GET /v1/product/certificate/accordance-types":("product_certificate_accordance_types_v1","DIRECT_JSON","safe_projection","catalog_products","certification"),
"POST /v1/cargoes-label/get":("cargoes_label_get","WORKFLOW_STATUS_URL","safe_projection","supplies_fbo","cargoes"),
"POST /v1/cargoes/label/transport-by-order/status":("cargoes_label_transport_by_order_status","WORKFLOW_STATUS_URL","safe_projection","supplies_fbo","cargoes"),
"POST /v1/cargoes/label/transport/status":("cargoes_label_transport_status","WORKFLOW_STATUS_URL","safe_projection","supplies_fbo","cargoes"),
"POST /v1/cargoes/transport/create/status":("cargoes_transport_create_status","DIRECT_JSON","safe_projection","supplies_fbo","cargoes"),
"POST /v1/carriage/act-discrepancy/pdf":("carriage_act_discrepancy_pdf","JSON_DOCUMENT_BYTES","operator_personal_data_gate","orders_postings","labels_documents"),
"POST /v1/carriage/container/document/get":("carriage_container_document_get","JSON_DOCUMENT_BYTES","operator_personal_data_gate","orders_postings","labels_documents"),
"POST /v1/carriage/container/label/get":("carriage_container_label_get","JSON_DOCUMENT_BYTES","operator_personal_data_gate","orders_postings","labels_documents"),
"POST /v1/carriage/courier-contact/get":("carriage_courier_contact_get","DIRECT_JSON","operator_personal_data_gate","orders_postings","assembly_carriage"),
"POST /v1/delivery/point/info":("delivery_point_info","DIRECT_JSON","safe_projection","warehouse_logistics","delivery_methods"),
"POST /v1/fbp/act-from/get":("fbp_act_from_get","WORKFLOW_STATUS_URL","safe_projection","supplies_fbo","acts"),
"POST /v1/fbp/act-to/get":("fbp_act_to_get","WORKFLOW_STATUS_URL","safe_projection","supplies_fbo","acts"),
"POST /v1/fbp/label/get":("fbp_label_get","WORKFLOW_STATUS_URL","safe_projection","supplies_fbo","acts"),
"POST /v1/posting/fbs/package-label/get":("posting_fbs_package_label_get_v1","WORKFLOW_STATUS_URL","safe_projection","orders_postings","labels_documents"),
"POST /v1/product/info/stocks-by-warehouse/fbs":("fbs_stock_by_warehouse_v1","DIRECT_JSON","safe_projection","stocks_inventory","warehouse_fbs"),
"POST /v1/receipts/get":("receipts_get","JSON_DOCUMENT_BYTES","operator_personal_data_gate","finance","documents_reports"),
"POST /v1/return/giveout/barcode":("return_giveout_barcode","DIRECT_JSON","safe_projection","returns_cancellations","return_giveout"),
"POST /v1/return/giveout/get-pdf":("return_giveout_get_pdf","DIRECT_BINARY","operator_personal_data_gate","returns_cancellations","return_giveout"),
"POST /v1/return/giveout/get-png":("return_giveout_get_png","DIRECT_BINARY","operator_personal_data_gate","returns_cancellations","return_giveout"),
"POST /v1/seller-actions/voucher/get":("seller_actions_voucher_get","WORKFLOW_STATUS_URL","safe_projection","prices_promotions","actions_promotions"),
"POST /v2/invoice/get":("invoice_get","DIRECT_JSON","safe_projection","finance","documents_reports"),
"POST /v2/posting/fbs/act/get-barcode":("posting_fbs_act_get_barcode","DIRECT_BINARY","operator_personal_data_gate","orders_postings","labels_documents"),
"POST /v2/posting/fbs/act/get-barcode/text":("posting_fbs_act_get_barcode_text","DIRECT_JSON","safe_projection","orders_postings","labels_documents"),
"POST /v2/posting/fbs/act/get-pdf":("posting_fbs_act_get_pdf","DIRECT_BINARY","operator_personal_data_gate","orders_postings","labels_documents"),
"POST /v2/posting/fbs/get-by-barcode":("posting_fbs_get_by_barcode","DIRECT_JSON","safe_projection","orders_postings","fbs_postings"),
"POST /v2/product/certification/params":("product_certification_params_v2","DIRECT_JSON","safe_projection","catalog_products","certification"),
"POST /v5/fbs/posting/product/exemplar/status":("fbs_posting_product_exemplar_status_v5","DIRECT_JSON","safe_projection","orders_postings","fbs_postings"),
"POST /v6/fbs/posting/product/exemplar/create-or-get":("fbs_posting_product_exemplar_create_or_get_v6","DIRECT_JSON","safe_projection","orders_postings","fbs_postings"),
}

GENERATION=set('''POST /v1/barcode/add
POST /v1/barcode/generate
POST /v1/cargoes-label/create
POST /v1/cargoes/create
POST /v1/cargoes/label/transport-by-order/create
POST /v1/cargoes/label/transport/create
POST /v1/cargoes/transport/create
POST /v1/carriage/container/create
POST /v1/carriage/create
POST /v1/carriage/pass/create
POST /v1/chat/start
POST /v1/draft/crossdock/create
POST /v1/draft/direct/create
POST /v1/draft/multi-cluster/create
POST /v1/fbp/act-from/create
POST /v1/fbp/act-to/create
POST /v1/fbp/draft/direct/create
POST /v1/fbp/draft/direct/seller-dlv/create
POST /v1/fbp/draft/direct/tpl-dlv/create
POST /v1/fbp/draft/drop-off/create
POST /v1/fbp/draft/pick-up/create
POST /v1/fbp/label/create
POST /v1/finance/compensation
POST /v1/finance/decompensation
POST /v1/finance/mutual-settlement
POST /v1/polygon/create
POST /v1/posting/fbs/package-label/create
POST /v1/pricing-strategy/create
POST /v1/product/certificate/create
POST /v1/product/import-by-sku
POST /v1/question/answer/create
POST /v1/report/discounted/create
POST /v1/report/marked-products-sales/create
POST /v1/report/placement/by-products/create
POST /v1/report/placement/by-supplies/create
POST /v1/report/postings/create
POST /v1/report/products/create
POST /v1/report/realization/posting/create
POST /v1/report/warehouse/stock
POST /v1/return/giveout/barcode-reset
POST /v1/return/pass/create
POST /v1/review/comment/create
POST /v1/seller-actions/create/discount
POST /v1/seller-actions/create/discount-with-condition
POST /v1/seller-actions/create/installment
POST /v1/seller-actions/create/multi-level-discount
POST /v1/seller-actions/create/voucher
POST /v1/supply-order/pass/create
POST /v1/warehouse/erfbs/aggregator/create
POST /v1/warehouse/erfbs/non-integrated/create
POST /v1/warehouse/fbs/create
POST /v1/warehouse/fbs/pickup/courier/create
POST /v2/draft/supply/create
POST /v2/invoice/create-or-update
POST /v2/order/create
POST /v2/posting/fbs/act/create
POST /v2/posting/fbs/package-label
POST /v2/posting/fbs/package-label/create
POST /v2/product/certificate/create
POST /v2/report/returns/create'''.splitlines())

MUTATIONS=set('''POST /v1/carriage/courier-contact/set
POST /v1/chat/send/file
POST /v1/fbp/draft/direct/timeslot/edit
POST /v1/fbp/draft/direct/tpl-dlv/edit
POST /v1/fbp/draft/drop-off/dlv/edit
POST /v1/fbp/order/direct/timeslot/edit
POST /v1/fbp/order/drop-off/dlv/edit
POST /v1/invoice/delete
POST /v1/invoice/file/upload
POST /v1/pricing-strategy/status
POST /v1/product/action/timer/update
POST /v1/product/attributes/update
POST /v1/product/certificate/bind
POST /v1/product/certificate/delete
POST /v1/product/certificate/unbind
POST /v1/question/change-status
POST /v1/review/change-status
POST /v1/supply-order/act/accept
POST /v1/supply-order/content/update
POST /v2/fbs/posting/delivered
POST /v2/fbs/posting/delivering
POST /v2/fbs/posting/last-mile
POST /v2/posting/fbs/act/get-container-labels
POST /v2/review/change-status
POST /v3/product/import'''.splitlines())
SUNSET={"GET /v1/cargoes-label/file/{file_guid}","POST /v2/posting/fbs/digital/act/check-status","POST /v2/posting/fbs/digital/act/get-pdf"}
DEPRECATED={"POST /v1/review/count","POST /v1/review/info"}
INVARIANTS=["NO_HIDDEN_PAGINATION","NO_HIDDEN_RETRY","NO_HIDDEN_POLLING","NO_HIDDEN_FANOUT","NO_PROVIDER_CHAINING","ONE_EXPLICIT_COMMAND_ONE_BUSINESS_REQUEST","DOCUMENT_URL_IS_NEVER_AUTO_FETCHED","SERVER_SIDE_REPORT_GENERATION_IS_NOT_A_READ"]

def main():
    p=argparse.ArgumentParser();p.add_argument('--inventory',required=True);p.add_argument('--out-json',required=True);p.add_argument('--out-csv',required=True);p.add_argument('--out-summary',required=True);a=p.parse_args()
    inv=json.loads(pathlib.Path(a.inventory).read_text(encoding='utf-8'))
    pending=[r for r in inv['rows'] if r.get('exact_schema_decision')=='REQUIRES_EXACT_ACCEPTED_SWAGGER_SNAPSHOT']
    assert len(inv['rows'])==203 and inv['counts']['accepted_step3_candidate_rows']==85 and len(pending)==118
    decision_keys=set(READS)|GENERATION|MUTATIONS|SUNSET|DEPRECATED
    pending_keys={r['operation_key'] for r in pending}
    assert decision_keys==pending_keys, sorted(decision_keys^pending_keys)
    assert not ((set(READS)&GENERATION)|(set(READS)&MUTATIONS)|(GENERATION&MUTATIONS))
    rows=[]
    for src in pending:
        key=src['operation_key'];row={"operation_key":key,"http_method":src['http_method'],"fixed_path":src['fixed_path'],"source_category_tag":src['source_category_tag'],"purpose":src['purpose'],"detection_reasons":src['detection_reasons']}
        if key in READS:
            alias,response_kind,privacy,cluster,section=READS[key];row.update(terminal_decision='IMPLEMENT_READ',alias=alias,response_kind=response_kind,privacy_policy=privacy,cluster=cluster,section=section)
        elif key in GENERATION: row.update(terminal_decision='REJECT_SERVER_SIDE_GENERATION_OR_CREATION')
        elif key in MUTATIONS: row.update(terminal_decision='REJECT_MUTATION_SIDE_EFFECT')
        elif key in SUNSET: row.update(terminal_decision='REJECT_SUNSET_REPLACED')
        else: row.update(terminal_decision='REJECT_DEPRECATED_REPLACED')
        rows.append(row)
    counts=Counter(r['terminal_decision'] for r in rows)
    expected={'IMPLEMENT_READ':28,'REJECT_SERVER_SIDE_GENERATION_OR_CREATION':60,'REJECT_MUTATION_SIDE_EFFECT':25,'REJECT_SUNSET_REPLACED':3,'REJECT_DEPRECATED_REPLACED':2}
    assert all(counts[k]==v for k,v in expected.items()),counts
    out={'schema':'OZON_STEP5_EXACT_DECISION_MATRIX_V1','as_of':'2026-08-29','roadmap_step':5,'status':'STEP5_EXACT_DECISION_MATRIX_BUILT','authority':AUTHORITY,'input_inventory':{'step5_candidate_rows':203,'accepted_step3_candidate_rows':85,'pending_exact_schema_rows':118},'invariants':INVARIANTS,'counts':{'rows':118,'implement_reads':28,**dict(sorted(counts.items()))},'rows':rows}
    pathlib.Path(a.out_json).write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    fields=['operation_key','http_method','fixed_path','source_category_tag','purpose','terminal_decision','alias','response_kind','privacy_policy','cluster','section']
    with pathlib.Path(a.out_csv).open('w',encoding='utf-8',newline='') as f:
        w=csv.DictWriter(f,fieldnames=fields);w.writeheader();w.writerows({k:r.get(k) for k in fields} for r in rows)
    lines=['# Ozon Step 5 exact workflow/report/document decision matrix','','Status: `STEP5_EXACT_DECISION_MATRIX_BUILT`','','## Authority','',f"- Seller Swagger: `{AUTHORITY['seller_swagger_bytes']:,}` bytes; SHA-256 `{AUTHORITY['seller_swagger_sha256']}`; OpenAPI `3.0.0`; 463 paths / 463 operations.",'- Source: original operator-supplied `swagger.json`, recovered from Library and byte-verified before decisions were frozen.','','## Counts','','- Candidate surface: **203**','- Already accepted Step 3 candidates: **85**','- Exact-schema pending resolved here: **118**','- New reads to implement: **28**']
    for k,v in sorted(counts.items()): lines.append(f'- `{k}`: {v}')
    lines += ['','Exact-schema correction: `POST /v1/report/warehouse/stock` is a report creator, while `POST /v1/posting/fbs/package-label/get` is an actual read of an existing async label task and belongs in the 28-read set.','','## New reads','']
    for r in rows:
        if r['terminal_decision']=='IMPLEMENT_READ': lines.append(f"- `{r['alias']}` — `{r['operation_key']}` — `{r['response_kind']}` — privacy `{r['privacy_policy']}`")
    lines += ['','## Safety boundary','','- No create/generate/update/delete/bind/send/accept/status-change endpoint is promoted to read.','- Deprecated/sunset reads are rejected when a current replacement exists.','- Document URLs are data only and are never automatically fetched.','- Direct PDF/PNG endpoints require byte-safe single-request transport.','']
    pathlib.Path(a.out_summary).write_text('\n'.join(lines),encoding='utf-8')
    print(json.dumps(out['counts'],sort_keys=True));print('STEP5_EXACT_DECISION_MATRIX_118_TERMINAL_DECISIONS_PASS')
if __name__=='__main__': main()
