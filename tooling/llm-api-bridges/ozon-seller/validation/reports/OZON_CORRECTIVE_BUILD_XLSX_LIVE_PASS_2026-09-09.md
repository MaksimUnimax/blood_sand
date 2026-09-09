# Ozon corrective-build XLSX live re-verification — 2026-09-09

## Verdict

**LIVE PASS — PROVIDER XLSX VIA FRESH REPORT CHAIN**

Tested on the corrective multi-AI file-delivery build installed from `OZON_BRIDGE_v0.1.19_MULTI_AI_FILE_DELIVERY_5aa1b4a21a0a.zip`.

## Fresh dependent chain

1. `report_placement_by_products_create`
   - request_id: `1ab5e188-85d8-4997-8122-33abf3668262`
   - HTTP 200
   - logical business result count: 1
   - physical business request count: 1
   - exact request preserved: true
   - logical fingerprint: `93c6bb2c`
   - physical fingerprint: `93c6bb2c`
   - command transformed: false
   - fresh code: `REPORT_seller_placement_by_products_2093109_1788917370_01a083c8-cd69-7ed5-84d6-a988a0562347`

2. `report_info`
   - request_id: `2768cc26-ff7c-4f4d-92f4-28c4d8bbb800`
   - HTTP 200
   - logical business result count: 1
   - physical business request count: 1
   - exact request preserved: true
   - logical fingerprint: `a8b3cff6`
   - physical fingerprint: `a8b3cff6`
   - command transformed: false
   - status: `success`
   - fresh ref: `rpf_s_a57252cb-55ca-429f-8d08-15851b007c85`

3. `report_file_get`
   - delivery id: `manual-delivery-4895e6d0-ebef-4b85-b9a5-c85ba56d4221`
   - representation: `ATTACHED_ORIGINAL_PROVIDER_FILE`
   - filename: `REPORT_seller_placement_by_products_2093109_1788917370_01a083c8-cd69-7ed5-84d6-a988a0562347.xlsx`
   - MIME: `application/octet-stream`
   - source_kind: `original_provider_file`

## Independent physical verification

- marker bytes: `29741`
- actual bytes: `29741`
- bytes match: PASS
- marker SHA-256: `e2a738e30a69e63329f300118d31e037ed5b8cd45fd1fbd056a59a20000c60cf`
- actual SHA-256: `e2a738e30a69e63329f300118d31e037ed5b8cd45fd1fbd056a59a20000c60cf`
- SHA match: PASS
- ZIP/XLSX container integrity (`testzip`): PASS
- workbook sheet count: 1
- sheet: `Страница #1`
- XML data rows: `1774`
- columns in every row: `12`
- data date range: `2026-09-01` through `2026-09-08`
- distinct data dates: `8`

Header fields include date, SKU, article, product category, descriptive type, warehouse, product marker, volume/count and accrued placement cost.

## Result

The materially distinct provider-XLSX attachment branch is re-verified live on the corrective build. No stale report code or file ref was reused.
