# Patch B4 — Orders / Returns / Cancellations candidate manifest

Date: 2026-08-26

- accepted B3 tree SHA-256: `fec8703195483479efce76a8606b365a6250d65eed9dc3cc9f267c3b89fb7068`
- B4 patch SHA-256: `ea93acada395545e428da24eaef4e82a6a6fd2eda113ff349590954e8530591d`
- gzip transport SHA-256: `6c4bcb8db9c29ca6112cd918ef2b50a5b68ad9036bf53b4c866081db97b2d1f7`
- B4 production tree SHA-256: `912c96234f70b34609ba1225ebe3570e8e2469a6bded2421cee6e8d4cd10b9a8`
- production file count: `21`

Changed production identities:
- `shared/ozon_operation_registry.js`: `cfaa168d5a6734b9d5948dbddeef6e090c431e17e5b312d5f536c4418753d8de`
- `shared/ozon_contract.js`: `6cc19aa7037d9f6952e7e3704e301725ba44c71730db2aa9bb5d9fb1538c66c6`
- `shared/ozon_entitlements.js`: `973518cbef3cdcfd454e11af3f13b88b4181993234dee89bfb4f807e4fec5fcf`

Protected runtime identities include:
- `content_script.js`: `a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd`
- `service_worker.js`: `b995ad6eaf6556eac31f728a3640b77b08d6354d5e7e22f5a34f030902059f87`
- `shared/bridge_autorun_model.js`: `c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5`
- `shared/work_session_model.js`: `11e91d850a3d69711fefdaadb6617b825350d9382b9bc55cabdbbc9b255c9855`
- `shared/ozon_provider.js`: `16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b`
- `shared/provider_transport_core.js`: `7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8`
- `shared/manual_controls.js`: `81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e`

Candidate semantics:
- pure read only;
- Personal Data operations default OFF/gated;
- no hidden retry/pagination/fanout/report workflow;
- report create remains unimplemented;
- one explicit command -> one fixed request maximum;
- Autorun/Work lifecycle unchanged.

Patch gzip transport: `validation/PATCH_B4_ORDERS_RETURNS_CANCELLATIONS_2026-08-26.patch.gz`; gzip SHA-256 `6c4bcb8db9c29ca6112cd918ef2b50a5b68ad9036bf53b4c866081db97b2d1f7`. Materializer decompresses it and verifies raw patch SHA-256 `ea93acada395545e428da24eaef4e82a6a6fd2eda113ff349590954e8530591d` before apply.
