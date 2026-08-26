# Patch B4 — Orders / Returns / Cancellations production implementation result

Date: 2026-08-26
Status: `PATCH_B4_ORDERS_RETURNS_CANCELLATIONS_CANDIDATE_GREEN`

## Authority

- accepted B3 tree: `fec8703195483479efce76a8606b365a6250d65eed9dc3cc9f267c3b89fb7068`
- official Swagger SHA-256: `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`
- B4 patch SHA-256: `ea93acada395545e428da24eaef4e82a6a6fd2eda113ff349590954e8530591d`
- gzip transport SHA-256: `6c4bcb8db9c29ca6112cd918ef2b50a5b68ad9036bf53b4c866081db97b2d1f7`
- B4 candidate tree SHA-256: `912c96234f70b34609ba1225ebe3570e8e2469a6bded2421cee6e8d4cd10b9a8`

## Production delta

Exactly three production files change:

- `shared/ozon_operation_registry.js` -> `cfaa168d5a6734b9d5948dbddeef6e090c431e17e5b312d5f536c4418753d8de`
- `shared/ozon_contract.js` -> `6cc19aa7037d9f6952e7e3704e301725ba44c71730db2aa9bb5d9fb1538c66c6`
- `shared/ozon_entitlements.js` -> `973518cbef3cdcfd454e11af3f13b88b4181993234dee89bfb4f807e4fec5fcf`

No service-worker, content-script, Autorun, Work-session, Manual-control, provider, transport, credentials, quota/cache/history/no-replay or timing file changes.

## Added/revalidated operations

Revalidated:
- `posting_fbo_list`;
- `posting_fbs_get`.

Added:
- `fbs_posting_list`;
- `fbs_unfulfilled_list`;
- `returns_list`;
- `rfbs_returns_list`;
- `cancel_reason_list`;
- `order_cancel_status`;
- `posting_cancel_status`.

Not added:
- `return_report_create`.

## Deterministic local validation

Passed:
- `B4_ORDERS_RETURNS_REGISTRY_PASS`
- `B4_ORDERS_RETURNS_EXACT_REQUEST_PASS`
- `B4_ORDERS_RETURNS_CONTRACT_PASS`
- `B4_ORDERS_RETURNS_ENTITLEMENTS_PASS`
- `B4_ORDERS_RETURNS_GUIDANCE_PASS`
- `B4_SAFE_PROJECTION_AND_PII_BINDING_PASS`
- `B4_NO_HIDDEN_PAGINATION_REPORT_WORKFLOW_PASS`
- `B4_PROTECTED_RUNTIME_IDENTITIES_PASS`
- `B4_OFFICIAL_SWAGGER_CONTRACT_PASS`
- `B4_OFFICIAL_SWAGGER_ENTITLEMENT_COMPILER_PASS`

Accepted B1, B2 and B3 regressions also pass on the B4 tree. All 18 production JavaScript files pass `node --check`.

No Seller or Performance provider request was executed during implementation validation.

Patch gzip transport: `validation/PATCH_B4_ORDERS_RETURNS_CANCELLATIONS_2026-08-26.patch.gz`; gzip SHA-256 `6c4bcb8db9c29ca6112cd918ef2b50a5b68ad9036bf53b4c866081db97b2d1f7`. Materializer decompresses it and verifies raw patch SHA-256 `ea93acada395545e428da24eaef4e82a6a6fd2eda113ff349590954e8530591d` before apply.
