# Ozon generic direct-binary CSV live re-verification — 2026-09-08

## Verdict

**LIVE PASS — DIRECT PERFORMANCE CSV ATTACHMENT**

This record re-verifies the previously failed `performance_daily_csv` direct-binary branch on the corrective build after the generic direct-binary attachment repair.

## Tested authority

- Repository: `MaksimUnimax/blood_sand`
- Branch: `repair/ozon-generic-direct-binary-delivery-2026-09-08`
- Corrective tested source: `5aa1b4a21a0aad2310057a65e8c27d8f3d37c8eb`
- Pre-live acceptance record commit: `11b0ef4dccfe14e81b2be840c1646bc290e9339f`
- Bridge: `ozon-llm-api-bridge v0.1.19`
- Exact installable ZIP: `OZON_BRIDGE_v0.1.19_MULTI_AI_FILE_DELIVERY_5aa1b4a21a0a.zip`
- ZIP bytes: `245479`
- ZIP SHA-256: `a5765f11148b921baeff5e18b64b428c9d598f9fbb41b8ff91fd9cef7cb8fb83`

## Exact live command

```text
OZON_API_V1
{"operation":"performance_daily_csv","params":{"dateFrom":"2026-08-01","dateTo":"2026-08-31"}}
```

## Live delivery marker

```json
{
  "delivery_representation": "ATTACHED_ORIGINAL_PROVIDER_FILE",
  "delivery_id": "manual-delivery-c32b04dd-5168-4e2b-b48e-2a5dff8382f5",
  "complete": true,
  "attachments": [
    {
      "filename": "ozon-performance_daily_csv-rpf_s_0a793523-4283-42fa-a652-2d7ed48d1eec.csv",
      "mime_type": "text/csv",
      "byte_length": 55650,
      "sha256": "b3942ecdaaa78df7175de742df5e2bb5455d61fb9501fd675f66e111be434ced",
      "source_kind": "original_provider_file"
    }
  ]
}
```

No `file_content_base64` was exposed in the live delivery result.

## Independent physical file verification

The actual attached CSV was inspected independently from the delivery marker.

- actual bytes: `55650` — exact marker match;
- actual SHA-256: `b3942ecdaaa78df7175de742df5e2bb5455d61fb9501fd675f66e111be434ced` — exact marker match;
- UTF-8 decode: PASS;
- delimiter: semicolon (`;`);
- total rows including header: `720`;
- columns per row: exactly `8` for all rows;
- header: `ID;Название;Дата;Показы;Клики;Расход, ₽;Заказы, шт.;Заказы, ₽`;
- date coverage: `2026-08-01` through `2026-08-31`;
- distinct dates: `31`;
- distinct IDs: `57`;
- NUL bytes: none;
- trailing newline: present;
- payload is actual CSV content, not JSON/base64 masquerading as CSV.

## Result

The defect frozen before repair is closed for the direct Performance CSV branch on the corrective live build:

- direct provider binary was acquired once;
- user-visible base64 leak is gone;
- exact bytes were materialized as a CSV attachment;
- marker byte length/hash match the physical file exactly;
- attachment provenance is `original_provider_file`.

**DIRECT PERFORMANCE CSV LIVE VERDICT: PASS.**

## Remaining exact-build live matrix

The remaining materially distinct file-delivery branches must still be re-run on this same corrective build before the file gate is closed:

1. oversized generated Bridge result -> generated TXT;
2. Seller provider CSV via `report_file_get`;
3. Seller provider XLSX via `report_file_get`;
4. generated Ozon PDF via generated ref + `report_file_get`;
5. direct PNG when a genuine live prerequisite/fixture can be obtained safely;
6. direct ZIP when a genuine prepared Performance report UUID exists.

No return to Performance stress-test/Autorun is authorized until this live file matrix is closed or remaining branches are explicitly classified with evidence as blocked by genuine prerequisites.
