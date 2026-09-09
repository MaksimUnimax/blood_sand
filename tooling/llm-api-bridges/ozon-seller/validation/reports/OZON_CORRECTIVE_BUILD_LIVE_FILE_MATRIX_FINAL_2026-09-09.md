# Ozon corrective-build live file matrix — final closure, 2026-09-09

## Verdict

**LIVE FILE MATRIX CLOSED FOR RETURN TO BUSINESS PERFORMANCE STRESS TESTING**

The corrective build fixed the previously observed direct Performance CSV base64-delivery defect. Every materially distinct live file branch that has a genuine current provider prerequisite was re-run on the same installed corrective build. Remaining PNG/direct-PDF/ZIP branches are not failed: they are explicitly prerequisite-blocked and were not fabricated.

## Build authority

- Repository: `MaksimUnimax/blood_sand`
- Branch: `repair/ozon-generic-direct-binary-delivery-2026-09-08`
- Corrective tested production source: `5aa1b4a21a0aad2310057a65e8c27d8f3d37c8eb`
- Bridge: `ozon-llm-api-bridge v0.1.19`
- Installable ZIP: `OZON_BRIDGE_v0.1.19_MULTI_AI_FILE_DELIVERY_5aa1b4a21a0a.zip`
- Installable ZIP bytes: `245479`
- Installable ZIP SHA-256: `a5765f11148b921baeff5e18b64b428c9d598f9fbb41b8ff91fd9cef7cb8fb83`

## Matrix

### 1. Direct Performance CSV — LIVE PASS

Operation: `performance_daily_csv`

Observed attachment:
- delivery representation: `ATTACHED_ORIGINAL_PROVIDER_FILE`
- delivery id: `manual-delivery-c32b04dd-5168-4e2b-b48e-2a5dff8382f5`
- filename: `ozon-performance_daily_csv-rpf_s_0a793523-4283-42fa-a652-2d7ed48d1eec.csv`
- MIME: `text/csv`
- bytes: `55650`
- SHA-256: `b3942ecdaaa78df7175de742df5e2bb5455d61fb9501fd675f66e111be434ced`
- source kind: `original_provider_file`

Physical file verification matched bytes/hash and confirmed real CSV content. The old base64-in-JSON live failure is closed.

Evidence commit: `49174d7035ff29e52b0881b7d8959fc2f974e48e`.

### 2. Oversized generated Bridge TXT — LIVE PASS

Operation: `performance_campaigns`

Observed attachment:
- delivery representation: `ATTACHED_COMPLETE_TEXT_DOCUMENT`
- delivery id: `manual-delivery-32ee8af2-b694-44d5-8f99-25814da647c4`
- filename: `ozon-bridge-result-manual-delivery-32ee8af2-b694-44d5-8f99-25814da647c4.txt`
- MIME: `text/plain;charset=utf-8`
- bytes: `1098880`
- SHA-256: `8401b86a1f7e07943c624b75fc777d64b84e584b2d555b5449f4fec88cd905c0`
- source kind: `generated_bridge_text`

Physical verification confirmed complete `OZON_BATCH_RESULT_V1`, one logical command, one physical business request, HTTP 200, exact request preservation, equal fingerprints, no transform, and a complete 1128-campaign payload.

Evidence commit: `de58c4f40fefa5f5e5287fa5ee23391200d9ae98`.

### 3. Provider CSV via fresh report chain — LIVE PASS

Fresh chain:
- `report_products_create` request id `fe6c58a0-d6f9-4668-8f29-079710a364c2`
- fresh code `REPORT_seller_products_2093109_1788916833_01a083c0-9b40-7763-be5f-7773d5333b24`
- `report_info` request id `e58fee4e-8145-41ba-bc6b-de65200024ec`
- fresh ref `rpf_s_c95f4be7-056f-4899-b855-20ce932204d8`
- `report_file_get` delivery id `manual-delivery-f928f29e-b5e4-4ff9-ad85-9f12330de27b`

Attachment:
- filename `736187ed-e748-4970-9476-6f9fb6f4d611.csv`
- MIME `text/csv`
- bytes `34895`
- SHA-256 `c27eb4d7d16f34f6bfa6caa80e6ebbc9800e115d973974f25f2232847cc9426d`
- source kind `original_provider_file`

Physical verification: UTF-8 BOM, `;` delimiter, 77 rows, 27 columns in every row, 76 product rows, no NUL bytes.

Evidence commit: `dd64bd77a2482295814fcb7c007943ab0e80077c`.

### 4. Provider XLSX via fresh report chain — LIVE PASS

Fresh chain:
- create request id `1ab5e188-85d8-4997-8122-33abf3668262`
- fresh code `REPORT_seller_placement_by_products_2093109_1788917370_01a083c8-cd69-7ed5-84d6-a988a0562347`
- `report_info` request id `2768cc26-ff7c-4f4d-92f4-28c4d8bbb800`
- fresh ref `rpf_s_a57252cb-55ca-429f-8d08-15851b007c85`
- delivery id `manual-delivery-4895e6d0-ebef-4b85-b9a5-c85ba56d4221`

Attachment:
- filename `REPORT_seller_placement_by_products_2093109_1788917370_01a083c8-cd69-7ed5-84d6-a988a0562347.xlsx`
- MIME `application/octet-stream`
- bytes `29741`
- SHA-256 `e2a738e30a69e63329f300118d31e037ed5b8cd45fd1fbd056a59a20000c60cf`
- source kind `original_provider_file`

Physical verification: valid ZIP/XLSX container; one sheet `Страница #1`; 1774 rows x 12 columns; data dates `2026-09-01` through `2026-09-08`.

Evidence commit: `e5ad5dd0998c05680f45903181b699a872e613be`.

### 5. Provider PDF via fresh generated-file chain — LIVE PASS

Fresh chain:
- `cargoes_label_create` request id `0aaded85-54b4-44b4-a3c6-f9ad2fdd44e6`
- fresh operation id `01a083ce-3ec2-7284-b86f-d3532e00ce2e`
- `cargoes_label_get` request id `ab9061ba-4b05-4c71-84b3-b8c5ccbbf418`
- fresh generated ref `rpf_s_d3c89e23-4c19-47a3-9993-b019d920adbd`
- delivery id `manual-delivery-2e536ab9-1514-4ec2-9da1-15b6ce15ca5f`

Attachment:
- filename `tag_1022100442853000.pdf`
- MIME `application/pdf`
- bytes `27181`
- SHA-256 `d8101d6b0a18815cb0b0328da7f7ff2c23c241e1d337fb8f62455402e4b957b1`
- source kind `original_provider_file`

Physical verification: `%PDF-1.4`, normal EOF, one page, unencrypted, successful render, and page content matches supply `2000063445545` / cargo `1022100442853000`.

Important separate contract observation: `cargoes_label_create` returned HTTP 200 but logical fingerprint `2139a6b1` and physical fingerprint `121a56a5`, with `exact_request_preserved=false` and `command_transformed=true`. This is preserved as separate command-transform evidence and is not classified as a file-delivery failure.

Evidence commit: `d6e1e4e26a735efed533553a90933ea1d97e8696`.

### 6. Direct PNG — BLOCKED, NOT FAILED

Registry direct-PNG routes are:
- `return_giveout_get_png`
- `posting_fbs_act_get_barcode`

Return-giveout prerequisite check:
- operation `return_giveout_barcode`
- request id `4d57dfd9-42f8-4ae6-af1f-963c6856152a`
- one logical / one physical
- provider HTTP 403
- category `auth_or_permission`
- code `7`
- automatic retry false
- exact request preserved true
- fingerprints `893e367d = 893e367d`
- command transformed false

Therefore return-giveout PNG was not invoked after a provider permission denial.

FBS prerequisite discovery:
- operation `fbs_act_list`
- request id `be601cc0-e6d1-4a79-82d1-bb7858342bdf`
- HTTP 200
- result `[]`
- logical fingerprint `053126ee`
- physical fingerprint `bc804974`
- exact request preserved false
- command transformed true

No real act ID exists in the tested real period, so no synthetic ID is allowed.

Evidence commits:
- return-giveout blocker: `4744e19219fa03ddd258cdd194007aeebc26229d`
- FBS fixture blocker: `af1aff39174d67a2df888c66e0ebec6c52c73076`

Final status: **BLOCKED — NO LEGAL LIVE FIXTURE / PROVIDER PERMISSION**.

### 7. Direct PDF — BLOCKED, NOT FAILED

Direct-PDF registry routes depend on the same two prerequisite families:
- return-giveout direct PDF: provider permission blocked at the safe prerequisite read;
- FBS direct PDF/labels: no real FBS act/posting fixture returned by live discovery.

The provider PDF route through generated ref/report_file_get is already independently LIVE PASS above, but it is not misreported as proof of the generic direct-binary PDF branch.

Final status: **BLOCKED — NO LEGAL LIVE FIXTURE / PROVIDER PERMISSION**.

### 8. Direct ZIP — BLOCKED, NOT FAILED

Registry route: `performance_statistics_report_download`, requiring a genuine previously prepared report `UUID`.

Current-build prerequisite checks:

API-created reports:
- operation `performance_statistics_list_api`
- request id `ea07a722-a842-4f0d-8156-0cbe77f0e523`
- HTTP 200
- one logical / one physical
- exact request preserved true
- fingerprints `1160fe97 = 1160fe97`
- transformed false
- `items=[]`
- `total="0"`

UI-created reports:
- operation `performance_statistics_list_ui`
- request id `aed66f72-9804-48fd-98e2-dec96a5cb2dc`
- HTTP 200
- one logical / one physical
- exact request preserved true
- fingerprints `e4f3e4b7 = e4f3e4b7`
- transformed false
- `items=[]`
- `total="0"`

No genuine prepared Performance report UUID exists on the account. A synthetic UUID is prohibited.

Final status: **BLOCKED — NO PREPARED PERFORMANCE REPORT UUID**.

## Final interpretation

Confirmed live on the corrective build:
1. direct Performance CSV attachment;
2. oversized generated Bridge TXT attachment;
3. provider CSV via fresh report chain;
4. provider XLSX via fresh report chain;
5. provider PDF via fresh generated-file chain.

Explicitly prerequisite-blocked, not failed and not falsely promoted to PASS:
6. direct PNG;
7. generic/direct PDF;
8. direct ZIP.

No remaining live file-delivery FAIL exists in the matrix. All legally exercisable materially distinct live branches are closed. Therefore the file gate no longer blocks continuation of the main Ozon Seller Bridge business-value program.

## Next action

Return to the previously paused advertising Performance stress-test. Do not restart frozen CAP-24. Do not treat the separate `review_list` 403 boundary test as the current line.