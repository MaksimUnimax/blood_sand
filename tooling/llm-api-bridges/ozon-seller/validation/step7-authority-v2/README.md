# Step 7 exact Seller Swagger authority transport v2

This directory is the fail-closed, byte-safe carrier for the accepted Ozon Seller Swagger authority used by Step 7.

## Accepted authority identity

- operator capture: `2026-08-25`
- raw bytes: `3933043`
- raw SHA-256: `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`
- OpenAPI: `3.0.0`
- paths: `463`
- operations: `463`

The migration accepts the historical carrier only after every historical part, the canonical carrier, the XZ payload, the raw bytes, and the OpenAPI shape independently match their frozen identities. It uses no network fallback.

The resulting carrier is split into 38 ordered fragments. Each fragment is individually size- and SHA-256-guarded by `manifest.json`; the hard ceiling is 9 KB and the largest fragment is 8192 bytes.

Verify and reconstruct:

```bash
python3 tooling/llm-api-bridges/ozon-seller/validation/step7-authority-v2/reconstruct_exact_swagger.py \
  --output /tmp/ozon-seller-swagger-authority.json
```

Run fail-closed regressions:

```bash
python3 tooling/llm-api-bridges/ozon-seller/validation/step7-authority-v2/test_fail_closed.py
```

Files in the historical `validation/OZON_SELLER_EXACT_SWAGGER_2026-08-30...part*` namespace are not runtime inputs after migration. The v2 verifier reads only the exact fragment list frozen in `manifest.json` and rejects missing, extra, renamed, reordered, oversized, or byte-modified fragments.
