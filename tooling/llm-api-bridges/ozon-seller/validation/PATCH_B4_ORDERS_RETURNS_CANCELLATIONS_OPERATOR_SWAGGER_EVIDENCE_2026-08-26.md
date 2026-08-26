# Patch B4 — Orders / Returns / Cancellations operator Swagger evidence

Date: 2026-08-26
Status: `PATCH_B4_ORDERS_RETURNS_CANCELLATIONS_SWAGGER_EVIDENCE_CONFIRMED`

## Authority

- exact operator-supplied `swagger.json`
- byte length: `3933043`
- SHA-256: `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`
- OpenAPI: `3.0.0`
- server: `api-seller.ozon.ru`
- no SDK, mirror, third-party documentation or inferred request field was used.

## Current target paths

| Queue ID / bridge alias | Method | Current path | Request contract | B4 disposition |
| --- | --- | --- | --- | --- |
| `fbo_posting_list` / existing `posting_fbo_list` | POST | `/v3/posting/fbo/list` | JSON body | revalidate existing alias |
| `fbs_posting_list` | POST | `/v4/posting/fbs/list` | JSON body | enable, PII-gated |
| `fbs_unfulfilled_list` | POST | `/v4/posting/fbs/unfulfilled/list` | JSON body | enable, PII-gated |
| `fbs_posting_detail` / existing `posting_fbs_get` | POST | `/v3/posting/fbs/get` | JSON body | revalidate existing PII-gated alias |
| `returns_list` | POST | `/v1/returns/list` | JSON body | enable safe projection |
| `rfbs_returns_list` | POST | `/v2/returns/rfbs/list` | JSON body | enable, PII-gated |
| `return_report_create` | POST | `/v2/report/returns/create` | JSON body | **not enabled in B4** |
| `cancel_reason_list` | POST | `/v1/cancel-reason/list` | **no requestBody** | enable as `no_body` |
| `order_cancel_status` | POST | `/v1/order/cancel/status` | JSON body | enable safe projection |
| `posting_cancel_status` | POST | `/v1/posting/cancel/status` | JSON body | enable safe projection |

## Bounded request evidence

### `/v3/posting/fbo/list`

Schema `posting.v3.PostingFboListRequest`:
- root: `cursor`, `filter`, `limit`, `sort_dir`, `translit`, `with`;
- `limit` int64 min 1 max 100;
- filter: `order_numbers` max 1000, `posting_numbers` max 1000, `since`, `statuses`, `to`;
- documented FBO statuses: `awaiting_packaging`, `awaiting_deliver`, `delivering`, `delivered`, `cancelled`;
- operation description limits the period to one year;
- `sort_dir`: `ASC|DESC`;
- `with`: analytics/financial/legal booleans.

### `/v4/posting/fbs/list`

Schema `posting.v4.PostingFbsListRequest`:
- root requires `filter` and `limit`;
- filter requires `since` and `to`;
- `limit` min 1 max 100;
- `delivery_method_ids`, `provider_ids`, `warehouse_ids` are string int64 arrays max 1000;
- `order_numbers` max 100;
- `order_id` is JSON integer int64;
- filter also includes `integration_type_flow`, `is_blr_traceable`, `last_changed_status_date`, `statuses`;
- operation description limits the requested period to one year;
- `sort_dir`: `ASC|DESC`;
- response schema closure contains `addressee` and `customer` including customer address/name/phone/email fields. B4 therefore retains the existing operator Personal Data gate pattern.

### `/v4/posting/fbs/unfulfilled/list`

Schema `posting.v4.PostingFbsUnfulfilledListRequest`:
- root: `cursor`, `filter`, `limit`, `sort_dir`, `translit`, `with`;
- `limit` min 1 max 100;
- filter includes cutoff range, delivering-date range, delivery/provider/warehouse ids, `last_changed_status_date`, statuses;
- official description says cutoff and delivering-date filters cannot be combined and each selected range uses its from/to pair;
- response schema closure contains the same customer/addressee personal-data contour as FBS list. B4 gates it.

### `/v3/posting/fbs/get`

Current Swagger still requires `posting_number`; optional `with` contains analytics, barcodes, financial, legal, product exemplars, related postings and transliteration. Existing bridge alias `posting_fbs_get` already matches the current path and remains Personal Data gated.

### `/v1/returns/list`

Schema `v1GetReturnsListRequest`:
- root requires `limit`; root fields: `filter`, `limit`, `last_id`;
- description: maximum limit 500;
- only one of the three temporal filters may be used: `logistic_return_date`, `storage_tariffication_start_date`, `visual_status_change_moment`;
- `posting_numbers`: documented maximum 50;
- filter also includes `order_id`, product/offer/barcode, visual status, warehouse, return schema and compensation status;
- pagination is caller-controlled by `last_id`.

### `/v2/returns/rfbs/list`

Schema `v2ReturnsRfbsListRequest`:
- root requires `limit`; root fields: `filter`, `last_id`, `limit`;
- filter: `offer_id`, `posting_number`, `group_state`, `created_at`;
- documented group states: `All`, `New`, `Delivering`, `Checkout`, `Arbitration`, `Approved`, `Rejected`;
- response schema closure contains `client_name`; B4 gates this operation as Personal Data read.

### Cancellation reads

- `/v1/cancel-reason/list`: POST with **no OpenAPI requestBody**.
- `/v1/order/cancel/status`: body schema requires `order_number`.
- `/v1/posting/cancel/status`: body schema contains `posting_number`; current schema does not mark it required, so B4 does not invent a required constraint.

## Report-create boundary

`/v2/report/returns/create` exists and returns a report creation code. It is not enabled in B4 because the bridge's current gate is pure explicit `single_read`; report creation/retrieval is an explicit async workflow and must never be hidden behind a read command. No report create/poll/retrieve fanout is added.

## Entitlement evidence

The current Swagger descriptions for the B4 pure-read endpoints contain no subscription restriction. The repository entitlement compiler was executed against the exact Swagger SHA above and classified all enabled/revalidated B4 endpoints as `ALL_ACCOUNTS`.
