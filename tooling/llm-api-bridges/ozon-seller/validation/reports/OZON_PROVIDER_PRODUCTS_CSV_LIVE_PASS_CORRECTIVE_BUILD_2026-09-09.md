# Ozon seller-products CSV live re-verification on corrective build — 2026-09-09

## Verdict

**LIVE PASS — PROVIDER CSV VIA FRESH REPORT CHAIN**

This record re-verifies the seller-products provider CSV delivery path on the installed generic direct-binary corrective build.

## Authority

- Repository: `MaksimUnimax/blood_sand`
- Branch: `repair/ozon-generic-direct-binary-delivery-2026-09-08`
- Corrective tested source: `5aa1b4a21a0aad2310057a65e8c27d8f3d37c8eb`
- Bridge: `ozon-llm-api-bridge v0.1.19`
- Exact installable ZIP: `OZON_BRIDGE_v0.1.19_MULTI_AI_FILE_DELIVERY_5aa1b4a21a0a.zip`

## Fresh dependent chain

### 1. report_products_create

Command:

```text
OZON_API_V1
{"operation":"report_products_create","params":{}}
```

Observed:

- request_id: `fe6c58a0-d6f9-4668-8f29-079710a364c2`
- HTTP 200
- one logical business result
- one physical business request
- `external_request_executed=true`
- `exact_request_preserved=true`
- logical fingerprint `e289e300`
- physical fingerprint `e289e300`
- `command_transformed=false`
- fresh code: `REPORT_seller_products_2093109_1788916833_01a083c0-9b40-7763-be5f-7773d5333b24`

### 2. report_info

Command:

```text
OZON_API_V1
{"operation":"report_info","params":{"code":"REPORT_seller_products_2093109_1788916833_01a083c0-9b40-7763-be5f-7773d5333b24"}}
```

Observed:

- request_id: `e58fee4e-8145-41ba-bc6b-de65200024ec`
- HTTP 200
- one logical business result
- one physical business request
- `external_request_executed=true`
- `exact_request_preserved=true`
- logical fingerprint `4b185b0c`
- physical fingerprint `4b185b0c`
- `command_transformed=false`
- report status: `success`
- fresh report file ref: `rpf_s_c95f4be7-056f-4899-b855-20ce932204d8`

### 3. report_file_get

Command:

```text
OZON_API_V1
{"operation":"report_file_get","params":{"file_ref":"rpf_s_c95f4be7-056f-4899-b855-20ce932204d8"}}
```

Delivery marker:

```json
{
  "delivery_representation":"ATTACHED_ORIGINAL_PROVIDER_FILE",
  "delivery_id":"manual-delivery-f928f29e-b5e4-4ff9-ad85-9f12330de27b",
  "complete":true,
  "attachments":[{
    "filename":"736187ed-e748-4970-9476-6f9fb6f4d611.csv",
    "mime_type":"text/csv",
    "byte_length":34895,
    "sha256":"c27eb4d7d16f34f6bfa6caa80e6ebbc9800e115d973974f25f2232847cc9426d",
    "source_kind":"original_provider_file"
  }]
}
```

## Independent physical file verification

The attached CSV was inspected independently from the delivery marker.

- actual bytes: `34895` — exact match
- actual SHA-256: `c27eb4d7d16f34f6bfa6caa80e6ebbc9800e115d973974f25f2232847cc9426d` — exact match
- UTF-8 BOM: present
- delimiter: `;`
- total CSV rows: `77`
- header rows: `1`
- product data rows: `76`
- columns per row: exactly `27` for all `77` rows
- NUL bytes: `0`
- content sanity: seller-products table with normal headers including `Артикул`, `Ozon Product ID`, `SKU`, barcode, product name, content rating, brand, product status, labels, reviews, etc.

## Result

The materially distinct provider CSV path `report_products_create -> report_info -> fresh report_file_ref -> report_file_get -> original provider attachment` remains LIVE PASS on the generic direct-binary corrective build.

No stale report code/ref was reused.
