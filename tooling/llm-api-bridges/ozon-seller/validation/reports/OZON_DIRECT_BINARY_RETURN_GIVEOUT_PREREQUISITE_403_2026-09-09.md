# Ozon direct-binary return-giveout prerequisite — 2026-09-09

## Verdict

**BLOCKED — PROVIDER AUTH/PERMISSION, NOT A FILE-DELIVERY FAILURE**

The `return_giveout` branch was evaluated only as a prerequisite discovery path for real direct-binary PNG/PDF live certification on the corrective build. The safe barcode read itself was rejected by Ozon with HTTP 403, therefore `return_giveout_get_png` / `return_giveout_get_pdf` are not invoked from this branch and are not classified as attachment failures.

## Tested build authority

- Repository: `MaksimUnimax/blood_sand`
- Branch: `repair/ozon-generic-direct-binary-delivery-2026-09-08`
- Corrective tested production source: `5aa1b4a21a0aad2310057a65e8c27d8f3d37c8eb`
- Bridge: `ozon-llm-api-bridge v0.1.19`

## Exact command

```text
OZON_API_V1
{"operation":"return_giveout_barcode","params":{}}
```

## Exact observed result

- request_id: `4d57dfd9-42f8-4ae6-af1f-963c6856152a`
- operation: `return_giveout_barcode`
- command fingerprint: `893e367d`
- logical business result count: `1`
- physical business request count: `1`
- provider: `ozon`
- host alias: `seller_api`
- HTTP method: `POST`
- path alias: `return_giveout_barcode`
- external_request_executed: `true`
- capability_probe_executed: `false`
- HTTP status: `403`
- provider error category: `auth_or_permission`
- provider error code: `7`
- automatic_retry: `false`
- exact_request_preserved: `true`
- logical command fingerprint: `893e367d`
- physical command fingerprint: `893e367d`
- command_transformed: `false`

## Boundary classification

This result proves the request reached Ozon exactly once and was rejected by the provider authorization/permission boundary. It does **not** exercise the downstream direct-binary response/attachment path because no binary provider response was produced.

Therefore:

- `return_giveout_get_png`: **BLOCKED / NOT EXECUTED** on this prerequisite branch;
- `return_giveout_get_pdf`: **BLOCKED / NOT EXECUTED** on this prerequisite branch;
- no retry of the 403 command is permitted;
- no synthetic giveout fixture is permitted;
- direct PNG/PDF certification must use another genuine provider fixture if one exists.

## Next legal discovery path

Use a read-only FBS act/list route with real provider data to discover a genuine FBS act ID or posting number. Only if a real identifier is returned may the direct PNG/PDF FBS binary routes be invoked.
