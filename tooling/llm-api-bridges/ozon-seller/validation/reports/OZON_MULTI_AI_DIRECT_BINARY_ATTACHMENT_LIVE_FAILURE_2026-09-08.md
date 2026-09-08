# Ozon multi-AI direct-binary attachment live failure — 2026-09-08

## Status

**LIVE FAILURE — FROZEN BEFORE PRODUCTION REPAIR**

This evidence freezes a post-install live failure discovered after the wake/export corrective patch had already passed its prior pre-handoff gate.

No provider retry is authorized by this record. The failing provider request completed successfully and must not be repeated merely to reproduce an already-proven downstream delivery defect.

## Tested authority

- Repository: `MaksimUnimax/blood_sand`
- Branch: `repair/ozon-multi-ai-file-delivery-2026-09-08`
- Bridge: `ozon-llm-api-bridge v0.1.19`
- Live-tested branch HEAD before this evidence-only commit: `0ae8fc4c48fd3819e61a4d540067fb210be2e367`
- Live-tested tree: `d434a661a2880bc630a10f836f3ef73d9e37cf7e`
- Previously tested source parent: `e62f75d8d0d34fecb1451dba3208f0c4c2ebd407`

## Exact live command

```text
OZON_API_V1
{"operation":"performance_daily_csv","params":{"dateFrom":"2026-08-01","dateTo":"2026-08-31"}}
```

## Exact provider/accounting result

- Request ID: `f3b25dbc-b96b-4401-ba4b-e5a8496a6c74`
- Operation: `performance_daily_csv`
- Logical command fingerprint: `dff9cd27`
- Physical command fingerprint: `dff9cd27`
- `command_transformed`: `false`
- `exact_request_preserved`: `true`
- Logical business result count: `1`
- Physical business request count: `1`
- `external_request_executed`: `true`
- Provider: `performance_api`
- HTTP status: `200`
- Provider content type: `text/csv`
- Provider binary byte length: `55650`
- Returned transport encoding: `base64`
- Returned payload field: `file_content_base64`
- Automatic retry: **none**

The Ozon Performance request itself succeeded. This is not a provider failure and not an authorization failure.

## Observed delivery failure

Expected post-patch behavior for a successful provider binary file:

1. preserve the exact provider bytes from the single completed provider request;
2. expose an opaque internal file reference without exposing raw/base64 bytes to the AI conversation;
3. materialize a browser `File` with the original provider MIME/bytes;
4. attach the file to ChatGPT;
5. deliver a compact attachment marker rather than embedding the binary payload in result text;
6. perform no second provider download and no hidden retry.

Observed behavior:

- no CSV attachment was created;
- the successful binary payload remained in `OZON_RESULT_V1.result` as a very large `file_content_base64` string;
- therefore direct Performance binary delivery bypassed the attachment path.

**LIVE VERDICT: FAIL — DIRECT BINARY PROVIDER RESULT IS NOT MATERIALIZED AS AN ATTACHMENT.**

## Failure boundary

The failure boundary is **after successful provider binary acquisition/serialization and before durable attachment planning/materialization**.

The transport layer already performs one binary read and returns exact bytes as base64 metadata. The defect is downstream of that successful read.

## Source-proven closed-set assumptions discovered during diagnosis

The following pre-existing closed sets prevent generic direct-binary attachment delivery:

1. `shared/ozon_provider.js`
   - report-session normalization accepts inline base64 only when `content_type === "application/pdf"`;
   - direct inline generated-document registration is PDF-only;
   - `DIRECT_PDF_OPERATIONS` contains only `posting_fbs_act_container_labels` and `posting_fbs_package_label`.

2. `shared/file_delivery_model_policy.js` / base delivery planning
   - provider-file discovery treats a completed entry as attachable only when the operation is exactly `report_file_get`;
   - a direct binary operation such as `performance_daily_csv` therefore does not become a provider attachment reference.

3. `service_worker.js`
   - durable completed batch entries persist `report_text` and request/accounting metadata but not a safe generated/provider file reference from the provider result;
   - raw base64 must not be added to durable batch text/state merely to bridge this gap.

4. `shared/file_delivery_port_worker.js`
   - the existing materializer can already decode an inline opaque report-session record without a second provider fetch;
   - filename extension inference currently covers CSV/XLSX/PDF/TXT but does not cover ZIP or PNG.

5. `shared/ai_delivery_capabilities.js`
   - ChatGPT accepted MIME/extension policy currently lacks `application/zip` / `.zip` and `image/png` / `.png`.

## Affected direct-binary surface

The current operation registry exposes multiple direct binary branches, including:

- direct PDF: `posting_fbs_act_container_labels`, `posting_fbs_package_label`, `return_giveout_get_pdf`, `posting_fbs_act_get_pdf`;
- direct PNG: `return_giveout_get_png`, `posting_fbs_act_get_barcode`;
- direct Performance CSV: `performance_media_csv`, `performance_campaign_product_csv`, `performance_expense_csv`, `performance_daily_csv`;
- Performance report download: `performance_statistics_report_download`, documented as `text/csv` or `application/zip`.

The repair must address the generic direct-binary class rather than add another single-operation whitelist.

## Required repair contract

The corrective patch must satisfy all of the following:

- convert every supported successful direct-binary provider response into an opaque provider-file reference suitable for attachment delivery;
- preserve original provider bytes, MIME, provenance and byte length;
- remove `file_content_base64` from user-visible result text once safely captured;
- never perform a second provider business request to materialize a direct-binary file;
- never auto-retry the original provider request;
- carry only a safe opaque file reference through durable batch state/restoration;
- preserve personal-data gating semantics (`rpf_p_*` versus `rpf_s_*` or equivalent policy-bearing reference);
- support CSV, ZIP, PDF and PNG as raw attachments where ChatGPT attachment capability permits them;
- keep `report_file_get` URL-backed/original-provider-file behavior unchanged;
- preserve stale/unknown-ref fail-closed behavior;
- preserve request accounting and exact-request fingerprints;
- add deterministic no-provider regression coverage for direct CSV, ZIP, PDF and PNG plus reload/fresh-state delivery lifecycle;
- run packaging/deterministic ZIP/fresh-extract equivalence/CI before any new live provider verification.

## Live verification state at freeze point

Already post-patch live-proven with physical attachment bytes:

- oversized generated Bridge text -> TXT: **PASS**;
- Seller report -> original CSV via `report_file_get`: **PASS**;
- Seller report -> original XLSX via `report_file_get`: **PASS**;
- generated Ozon cargo label -> original PDF via generated ref + `report_file_get`: **PASS**.

Direct binary:

- `performance_daily_csv` direct CSV: **FAIL**, frozen by this record.
- direct PNG: **NOT RUN after defect discovery**; source inspection already proves the current PDF-only/session/capability closed sets, so another provider call would not be justified before repair.
- direct ZIP: **LIVE PREREQUISITE BLOCKED** because both `performance_statistics_list_api` and `performance_statistics_list_ui` returned zero prepared reports; there is no genuine UUID available for `performance_statistics_report_download`.

## Next action

`NEXT_ACTION = REPAIR_GENERIC_DIRECT_BINARY_PROVIDER_FILE_CAPTURE__DURABLE_REF_PROPAGATION__CSV_ZIP_PDF_PNG_ATTACHMENT_DELIVERY__NO_SECOND_PROVIDER_REQUEST`
