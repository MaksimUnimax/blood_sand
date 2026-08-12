# Wildberries Bridge v0.1.2 — exact reference

This directory preserves the exact production release identity for Wildberries Bridge v0.1.2.

## Canonical install artifact

- file: `wildberries-bridge-v0.1.2-extension.zip`
- bytes: **84964**
- SHA-256: `56f0c78911db8ea84c82c3e874c8ac59c46acbf633886b014225d5ab0afe8715`
- production files: **17**

Reconstruct the byte-exact install ZIP with `rebuild_extension.py`; verify it with `verify_extension.py`.

`run_provider_registry_test.py` reconstructs the exact ZIP, extracts those exact production bytes, and executes the retained provider/registry regression. Canonical result:

```json
{"ok":true,"checks":1239,"registry":188,"enabled":172,"blocked":16,"fetches":173}
```

## Registry identity

The canonical v0.1.2 registry contains **188 current read/read-derived records**:

- **172 executable** in this Personal-token-only build
- **13 direct-PII reads execution-disabled**
- **3 Service-token-only reads execution-disabled**

The three Service-token-only records are `subscriptions`, `seller_rating`, and `tariff_constructor_options`. They remain represented for currentness completeness but fail before network execution in this release.

## Currentness basis

The registry was rebuilt from the **13/13 machine-readable OpenAPI 3.0.1 specifications** exposed by the official Wildberries Swagger navigation on 2026-08-12, covering **265 paths / 286 operations**. See:

- `../WB_CURRENT_READ_ONLY_INVENTORY_2026-08-12.md`
- `../WB_CURRENTNESS_V0.1.2_2026-08-12.md`
- `../WB_SECURITY_AND_BLOCKED_SURFACE_V0.1.2.md`
- `../WB_BRIDGE_V0.1.2_BUILD_EVIDENCE.md`

The original OpenAPI snapshot is a separate documentation/evidence payload; it is not inserted into the install ZIP because the install artifact contains production extension files only.
