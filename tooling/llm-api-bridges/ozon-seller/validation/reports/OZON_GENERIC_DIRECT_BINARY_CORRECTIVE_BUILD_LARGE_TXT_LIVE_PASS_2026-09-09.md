# Ozon corrective-build large generated TXT live re-verification — 2026-09-09

## Verdict

**LIVE PASS — LARGE GENERATED BRIDGE TXT ATTACHMENT**

This record re-verifies the oversized generated Bridge text delivery branch on the exact corrective build used for the generic direct-binary repair live acceptance.

## Tested authority

- Repository: `MaksimUnimax/blood_sand`
- Branch: `repair/ozon-generic-direct-binary-delivery-2026-09-08`
- Corrective tested source/package authority: `5aa1b4a21a0aad2310057a65e8c27d8f3d37c8eb`
- Bridge: `ozon-llm-api-bridge v0.1.19`
- Installed package: `OZON_BRIDGE_v0.1.19_MULTI_AI_FILE_DELIVERY_5aa1b4a21a0a.zip`

## Exact live command

```text
OZON_API_V1
{"operation":"performance_campaigns","params":{}}
```

## Provider/accounting result

- request id: `cc82ab32-4fa7-43ef-9103-2b1dd83818b0`
- HTTP: `200`
- logical business commands: `1`
- physical business requests: `1`
- `external_request_executed=true`
- `exact_request_preserved=true`
- logical fingerprint: `051bb998`
- physical fingerprint: `051bb998`
- `command_transformed=false`
- campaigns in result list: `1128`
- `result.total="1128"`

## Attachment marker

- representation: `ATTACHED_COMPLETE_TEXT_DOCUMENT`
- delivery id: `manual-delivery-32ee8af2-b694-44d5-8f99-25814da647c4`
- filename: `ozon-bridge-result-manual-delivery-32ee8af2-b694-44d5-8f99-25814da647c4.txt`
- MIME: `text/plain;charset=utf-8`
- marker bytes: `1098880`
- marker SHA-256: `8401b86a1f7e07943c624b75fc777d64b84e584b2d555b5449f4fec88cd905c0`
- source kind: `generated_bridge_text`
- complete: `true`

## Independent physical verification

The uploaded TXT was verified independently from the marker:

- actual bytes: `1098880` — exact match;
- actual SHA-256: `8401b86a1f7e07943c624b75fc777d64b84e584b2d555b5449f4fec88cd905c0` — exact match;
- starts with complete `OZON_BATCH_RESULT_V1` structure;
- parses as one complete `OZON_BATCH_RESULT_V1` + one complete `OZON_RESULT_V1`;
- contains exactly `1128` campaign objects;
- `result.total` equals `1128`;
- ends with normal closed JSON, not truncation.

## Conclusion

The corrective build preserves the previously accepted oversized-text delivery behavior while the direct-binary repair is installed. The branch is **LIVE PASS**.

Next required materially distinct branch: a fresh Seller provider CSV report lifecycle (`report_products_create` -> fresh report code -> `report_info` -> fresh file ref -> `report_file_get`) on the same installed corrective build. No stale report code/file ref may be reused.
