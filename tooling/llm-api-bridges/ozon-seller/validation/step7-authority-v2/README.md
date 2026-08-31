# Step 7 exact Seller Swagger authority transport v2

This directory contains the **candidate** fail-closed, byte-safe carrier for the exact Ozon Seller Swagger authority used by Step 7.

## Required authority identity

- operator capture date: `2026-08-25`
- raw bytes: `3933043`
- raw SHA-256: `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`
- OpenAPI: `3.0.0`
- title: `Документация Ozon Seller API`
- version: `2.1`
- paths / operations: `463 / 463`

## Transport

The raw JSON is deterministically XZ-compressed with Python LZMA preset `9e`, Base64-encoded without wrapping, and split into 38 ordered fragments. Every Git-stored fragment is guarded by exact byte count and SHA-256 in `manifest.json`; the largest fragment is 8192 bytes and the hard ceiling is 9000 bytes.

Verify:

```bash
python3 tooling/llm-api-bridges/ozon-seller/validation/step7-authority-v2/reconstruct_exact_swagger.py
python3 tooling/llm-api-bridges/ozon-seller/validation/step7-authority-v2/test_fail_closed.py
```

## Quarantine boundary

The older `OZON_SELLER_EXACT_SWAGGER_2026-08-30...` carrier is truncated and is not an authority input. This v2 verifier reads only the exact ordered fragment set declared by `manifest.json` and rejects missing, extra, renamed, reordered, mixed, oversized, or byte-modified fragments before writing any raw output.

This candidate is not accepted merely because it exists in a branch. Acceptance requires Git-stored blob verification, Linux and Windows PASS, byte-identical cross-platform evidence, artifact download, independent re-verification, and a separate acceptance commit. Full Seller Step 7 remains open after this prerequisite.
