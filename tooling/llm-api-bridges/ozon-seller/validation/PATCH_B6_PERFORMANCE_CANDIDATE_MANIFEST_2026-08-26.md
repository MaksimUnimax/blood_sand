# Patch B6 Performance API — candidate manifest

Date: 2026-08-26

- accepted B5 authority: `e296ff76b975470e8e12e566e2c4aff29adea00c`
- accepted B5 tree SHA-256: `7360209bfe0d09a255fa609840ae5e53bc4573c681f9b432e5e532183b056114`
- B6 raw patch SHA-256: `2b780f1d4bba1e6b4bf2b2a8d6072163bd534f505c63a2f209b95dc21c4bfd9f`
- B6 gzip patch SHA-256: `04f4151c035b14698107e3e7a54cf6da3c4f137b7a294db976e8df2d5a9c2ac9`
- B6 production tree SHA-256: `2420e3590025a4e69c7ebb17aabcc26e7efa676fb5d7e53635d558533e8b1d57`
- production file count: `21`
- exact Performance Swagger byte length: `304771`
- exact Performance Swagger SHA-256: `7436e4a3e40b4d5bf926a887d7891c1db264cbb6582266299a2df10f67592fec`
- exact Performance Swagger paths / HTTP operations: `47 / 48`

Changed production files only:

- `shared/ozon_operation_registry.js` -> `d4d1ed39a69e84cef21bc993cc3ede0190c73c7716ba7712db13639fe9050c4b`
- `shared/ozon_contract.js` -> `e62d84c1c2f77d4a8e87068716345cf857f9cce4c646ac4274c17770b8b8c6b7`

Explicitly protected / unchanged:

- `shared/ozon_entitlements.js` -> `e9fba5b171df930ca99d8ac6d13e92ea52fc319016026d74a8c137220c7eabb0`
- `content_script.js` -> `a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd`
- `service_worker.js` -> `b995ad6eaf6556eac31f728a3640b77b08d6354d5e7e22f5a34f030902059f87`
- `shared/bridge_autorun_model.js` -> `c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5`
- `shared/work_session_model.js` -> `11e91d850a3d69711fefdaadb6617b825350d9382b9bc55cabdbbc9b255c9855`
- `shared/ozon_provider.js` -> `16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b`
- `shared/provider_transport_core.js` -> `7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8`
- `shared/manual_controls.js` -> `81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e`

B6 acceptance is not granted by this manifest. Independent validation is required after successful Linux + Windows exact-materialization CI.
