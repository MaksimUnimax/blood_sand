# Wildberries Bridge v0.1.2 — exact reference

This directory preserves the exact production release identity for Wildberries Bridge v0.1.2.

## Artifact

- file: `wildberries-bridge-v0.1.2-extension.zip`
- bytes: `84964`
- SHA-256: `56f0c78911db8ea84c82c3e874c8ac59c46acbf633886b014225d5ab0afe8715`
- production files: **17**

Reconstruct the byte-exact install ZIP with `rebuild_extension.py`; verify it with `verify_extension.py`.

## Source and tests

This reference retains the v0.1.2 tests used for this release. The complete 17-file production source remains byte-exact inside the reconstructable release ZIP; `run_provider_registry_test.py` reconstructs and extracts those exact bytes before executing the provider/registry suite.

`tests/provider_registry_test.js` executes the reconstructed exact production credential, registry, contract, transport and provider modules against every executable alias. `tests/openapi_coverage.json` records the exhaustive current OpenAPI coverage result.

## Currentness basis

The registry was rebuilt from the 13/13 machine-readable OpenAPI 3.0.1 specifications exposed by the official Wildberries Swagger navigation on 2026-08-12, covering 265 paths / 286 operations. See `../../WB_CURRENT_READ_ONLY_INVENTORY_2026-08-12.md` and `../../WB_CURRENTNESS_V0.1.2_2026-08-12.md`.
