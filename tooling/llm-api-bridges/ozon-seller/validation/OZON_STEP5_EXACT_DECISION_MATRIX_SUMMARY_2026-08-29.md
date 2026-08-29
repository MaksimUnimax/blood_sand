# Ozon Step 5 exact workflow/report/document decision matrix

Status: `STEP5_EXACT_DECISION_MATRIX_BUILT`

## Authority

- Seller Swagger: `3,933,043` bytes; SHA-256 `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`; OpenAPI `3.0.0`; 463 paths / 463 operations.
- Source: original operator-supplied `swagger.json`, recovered from Library and byte-verified before decisions were frozen.

## Counts

- Candidate surface: **203**
- Already accepted Step 3 candidates: **85**
- Exact-schema pending resolved here: **118**
- New reads to implement: **28**
- `IMPLEMENT_READ`: 28
- `REJECT_DEPRECATED_REPLACED`: 2
- `REJECT_MUTATION_SIDE_EFFECT`: 25
- `REJECT_SERVER_SIDE_GENERATION_OR_CREATION`: 60
- `REJECT_SUNSET_REPLACED`: 3

Exact-schema correction: `POST /v1/report/warehouse/stock` is a report creator, while `POST /v1/posting/fbs/package-label/get` is an actual read of an existing async label task and belongs in the 28-read set.

## New reads

- `product_certificate_accordance_types_v1` — `GET /v1/product/certificate/accordance-types` — `DIRECT_JSON` — privacy `safe_projection`
- `cargoes_label_get` — `POST /v1/cargoes-label/get` — `WORKFLOW_STATUS_URL` — privacy `safe_projection`
- `cargoes_label_transport_by_order_status` — `POST /v1/cargoes/label/transport-by-order/status` — `WORKFLOW_STATUS_URL` — privacy `safe_projection`
- `cargoes_label_transport_status` — `POST /v1/cargoes/label/transport/status` — `WORKFLOW_STATUS_URL` — privacy `safe_projection`
- `cargoes_transport_create_status` — `POST /v1/cargoes/transport/create/status` — `DIRECT_JSON` — privacy `safe_projection`
- `carriage_act_discrepancy_pdf` — `POST /v1/carriage/act-discrepancy/pdf` — `JSON_DOCUMENT_BYTES` — privacy `operator_personal_data_gate`
- `carriage_container_document_get` — `POST /v1/carriage/container/document/get` — `JSON_DOCUMENT_BYTES` — privacy `operator_personal_data_gate`
- `carriage_container_label_get` — `POST /v1/carriage/container/label/get` — `JSON_DOCUMENT_BYTES` — privacy `operator_personal_data_gate`
- `carriage_courier_contact_get` — `POST /v1/carriage/courier-contact/get` — `DIRECT_JSON` — privacy `operator_personal_data_gate`
- `delivery_point_info` — `POST /v1/delivery/point/info` — `DIRECT_JSON` — privacy `safe_projection`
- `fbp_act_from_get` — `POST /v1/fbp/act-from/get` — `WORKFLOW_STATUS_URL` — privacy `safe_projection`
- `fbp_act_to_get` — `POST /v1/fbp/act-to/get` — `WORKFLOW_STATUS_URL` — privacy `safe_projection`
- `fbp_label_get` — `POST /v1/fbp/label/get` — `WORKFLOW_STATUS_URL` — privacy `safe_projection`
- `posting_fbs_package_label_get_v1` — `POST /v1/posting/fbs/package-label/get` — `WORKFLOW_STATUS_URL` — privacy `safe_projection`
- `fbs_stock_by_warehouse_v1` — `POST /v1/product/info/stocks-by-warehouse/fbs` — `DIRECT_JSON` — privacy `safe_projection`
- `receipts_get` — `POST /v1/receipts/get` — `JSON_DOCUMENT_BYTES` — privacy `operator_personal_data_gate`
- `return_giveout_barcode` — `POST /v1/return/giveout/barcode` — `DIRECT_JSON` — privacy `safe_projection`
- `return_giveout_get_pdf` — `POST /v1/return/giveout/get-pdf` — `DIRECT_BINARY` — privacy `operator_personal_data_gate`
- `return_giveout_get_png` — `POST /v1/return/giveout/get-png` — `DIRECT_BINARY` — privacy `operator_personal_data_gate`
- `seller_actions_voucher_get` — `POST /v1/seller-actions/voucher/get` — `WORKFLOW_STATUS_URL` — privacy `safe_projection`
- `invoice_get` — `POST /v2/invoice/get` — `DIRECT_JSON` — privacy `safe_projection`
- `posting_fbs_act_get_barcode` — `POST /v2/posting/fbs/act/get-barcode` — `DIRECT_BINARY` — privacy `operator_personal_data_gate`
- `posting_fbs_act_get_barcode_text` — `POST /v2/posting/fbs/act/get-barcode/text` — `DIRECT_JSON` — privacy `safe_projection`
- `posting_fbs_act_get_pdf` — `POST /v2/posting/fbs/act/get-pdf` — `DIRECT_BINARY` — privacy `operator_personal_data_gate`
- `posting_fbs_get_by_barcode` — `POST /v2/posting/fbs/get-by-barcode` — `DIRECT_JSON` — privacy `safe_projection`
- `product_certification_params_v2` — `POST /v2/product/certification/params` — `DIRECT_JSON` — privacy `safe_projection`
- `fbs_posting_product_exemplar_status_v5` — `POST /v5/fbs/posting/product/exemplar/status` — `DIRECT_JSON` — privacy `safe_projection`
- `fbs_posting_product_exemplar_create_or_get_v6` — `POST /v6/fbs/posting/product/exemplar/create-or-get` — `DIRECT_JSON` — privacy `safe_projection`

## Safety boundary

- No create/generate/update/delete/bind/send/accept/status-change endpoint is promoted to read.
- Deprecated/sunset reads are rejected when a current replacement exists.
- Document URLs are data only and are never automatically fetched.
- Direct PDF/PNG endpoints require byte-safe single-request transport.
