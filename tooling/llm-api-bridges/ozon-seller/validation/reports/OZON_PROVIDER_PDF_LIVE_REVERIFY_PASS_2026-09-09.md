# Ozon provider PDF live re-verification — 2026-09-09

## Verdict

**LIVE PASS — ORIGINAL PROVIDER PDF ATTACHMENT**

This record re-verifies the provider-PDF delivery branch on the corrective generic direct-binary build before resuming any business stress/Autorun work.

## Tested authority

- Repository: `MaksimUnimax/blood_sand`
- Branch: `repair/ozon-generic-direct-binary-delivery-2026-09-08`
- Corrective tested source: `5aa1b4a21a0aad2310057a65e8c27d8f3d37c8eb`
- Bridge: `ozon-llm-api-bridge v0.1.19`
- Installed package authority: `OZON_BRIDGE_v0.1.19_MULTI_AI_FILE_DELIVERY_5aa1b4a21a0a.zip`
- Package SHA-256: `a5765f11148b921baeff5e18b64b428c9d598f9fbb41b8ff91fd9cef7cb8fb83`

## Fresh dependent live chain

Real provider entities used:

- supply_id: `2000063445545`
- cargo_id: `1022100442853000`

Fresh `cargoes_label_create`:

- request_id: `0aaded85-54b4-44b4-a3c6-f9ad2fdd44e6`
- logical business result count: `1`
- physical business request count: `1`
- HTTP: `200`
- external_request_executed: `true`
- logical fingerprint: `2139a6b1`
- physical fingerprint: `121a56a5`
- exact_request_preserved: `false`
- command_transformed: `true`
- fresh operation_id: `01a083ce-3ec2-7284-b86f-d3532e00ce2e`

The command transformation is preserved as evidence and was not hidden or retried.

Fresh `cargoes_label_get`:

- request_id: `ab9061ba-4b05-4c71-84b3-b8c5ccbbf418`
- logical business result count: `1`
- physical business request count: `1`
- HTTP: `200`
- external_request_executed: `true`
- exact_request_preserved: `true`
- logical fingerprint: `2b01542f`
- physical fingerprint: `2b01542f`
- command_transformed: `false`
- status: `SUCCESS`
- file_guid: `6dc46e6d-c60d-4d54-98a4-2ef153c2cbbd`
- fresh generated_file_ref: `rpf_s_d3c89e23-4c19-47a3-9993-b019d920adbd`

Fresh `report_file_get` delivery marker:

```json
{
  "delivery_representation": "ATTACHED_ORIGINAL_PROVIDER_FILE",
  "delivery_id": "manual-delivery-2e536ab9-1514-4ec2-9da1-15b6ce15ca5f",
  "complete": true,
  "attachments": [
    {
      "filename": "tag_1022100442853000.pdf",
      "mime_type": "application/pdf",
      "byte_length": 27181,
      "sha256": "d8101d6b0a18815cb0b0328da7f7ff2c23c241e1d337fb8f62455402e4b957b1",
      "source_kind": "original_provider_file"
    }
  ]
}
```

## Independent physical verification

The actual attached file was inspected independently, not accepted from the delivery marker alone.

- actual bytes: `27181` — exact marker match
- actual SHA-256: `d8101d6b0a18815cb0b0328da7f7ff2c23c241e1d337fb8f62455402e4b957b1` — exact marker match
- header: `%PDF-1.4`
- trailer ends with a normal `%%EOF`
- pages: `1`
- encrypted: `no`
- PDF version: `1.4`
- render: PASS
- rendered label visibly contains supply `2000063445545`
- rendered label visibly contains cargo `1022100442853000`
- rendered label shows dropoff `ЗЛАТОУСТ_89`

## Gate conclusion

The original-provider PDF route through a fresh generated ref and `report_file_get` remains healthy on the exact corrective build.

**PROVIDER_PDF_FRESH_CHAIN_LIVE_REVERIFY = PASS**

This does not by itself prove every direct-binary PDF/PNG/ZIP registry branch. Those remain separate matrix rows and must be tested only with genuine provider prerequisites; unavailable fixtures must be classified as blocked/pending rather than fabricated.