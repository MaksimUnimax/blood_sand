# Patch B6 Performance API — implementation result

Date: 2026-08-26
Status: candidate pending independent validation

## Base

- accepted B5 authority commit: `e296ff76b975470e8e12e566e2c4aff29adea00c`
- accepted B5 production tree SHA-256: `7360209bfe0d09a255fa609840ae5e53bc4573c681f9b432e5e532183b056114`

The previous chat ended with an unpublished local B6 build. That unpublished byte identity was never committed and is not treated as repository authority. This candidate is a clean rebuild from the exact accepted B5 tree and the exact original operator-supplied Performance Swagger.

## Production delta

Exactly two production files change from accepted B5:

- `shared/ozon_operation_registry.js` -> `d4d1ed39a69e84cef21bc993cc3ede0190c73c7716ba7712db13639fe9050c4b`
- `shared/ozon_contract.js` -> `e62d84c1c2f77d4a8e87068716345cf857f9cce4c646ac4274c17770b8b8c6b7`

`shared/ozon_entitlements.js` remains byte-identical to B5:

`e9fba5b171df930ca99d8ac6d13e92ea52fc319016026d74a8c137220c7eabb0`

B6 production tree SHA-256:

`2420e3590025a4e69c7ebb17aabcc26e7efa676fb5d7e53635d558533e8b1d57`

Production file count remains `21`.

## Patch transport

- raw patch SHA-256: `2b780f1d4bba1e6b4bf2b2a8d6072163bd534f505c63a2f209b95dc21c4bfd9f`
- deterministic gzip patch SHA-256: `04f4151c035b14698107e3e7a54cf6da3c4f137b7a294db976e8df2d5a9c2ac9`

## Local deterministic results

Observed markers on the exact B6 tree:

- `B6_PERFORMANCE_REGISTRY_PASS`
- `B6_PERFORMANCE_EXACT_REQUEST_PASS`
- `B6_PERFORMANCE_CONTRACTS_PASS`
- `B6_PERFORMANCE_ASYNC_REPORT_SIDE_EFFECTS_BLOCKED_PASS`
- `B6_PERFORMANCE_MUTATIONS_STAY_BLOCKED_PASS`
- `B6_PERFORMANCE_NO_SELLER_CAPABILITY_PROBE_PASS`
- `B6_PERFORMANCE_GUIDANCE_ZERO_REQUEST_PASS`
- `B6_PERFORMANCE_EXISTING_JSON_ROUTES_PRESERVED_PASS`
- `B6_PERFORMANCE_PROTECTED_RUNTIME_IDENTITIES_PASS`
- `B6_PERFORMANCE_EXACT_SWAGGER_PASS`

All JavaScript production files pass `node --check`.

Seller business requests during deterministic testing: `0`.
Performance business requests during deterministic testing: `0`.

## Protected runtime

The following remain byte-identical to accepted B5/B4 runtime authority:

- `content_script.js` -> `a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd`
- `service_worker.js` -> `b995ad6eaf6556eac31f728a3640b77b08d6354d5e7e22f5a34f030902059f87`
- `shared/bridge_autorun_model.js` -> `c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5`
- `shared/work_session_model.js` -> `11e91d850a3d69711fefdaadb6617b825350d9382b9bc55cabdbbc9b255c9855`
- `shared/ozon_provider.js` -> `16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b`
- `shared/provider_transport_core.js` -> `7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8`
- `shared/manual_controls.js` -> `81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e`
