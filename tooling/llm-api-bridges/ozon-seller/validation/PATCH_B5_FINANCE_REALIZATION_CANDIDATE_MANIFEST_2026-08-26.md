# Patch B5 — Finance / Realization candidate manifest

Date: 2026-08-26

- accepted B4 tree SHA-256: `912c96234f70b34609ba1225ebe3570e8e2469a6bded2421cee6e8d4cd10b9a8`
- B5 raw patch SHA-256: `eb8d3fa8b8347ab58b363460e99b17fe2c0c014ac46158a5d58377fe561afce5`
- B5 gzip transport SHA-256: `c564134bfc330930d8f23f805424d897a68ef97ca421d81d5f3e2b7394b2b6a5`
- B5 production tree SHA-256: `7360209bfe0d09a255fa609840ae5e53bc4573c681f9b432e5e532183b056114`
- production file count: `21`

Changed production identities:

- `shared/ozon_operation_registry.js`: `aab1a5450c48df220eab35d61b61227faa4bb70464d5e6c708e08850c2360d38`
- `shared/ozon_contract.js`: `bfe95477789d27a15ff4acf0dda27f8b9ff21fb4e111a258ab9cc1745c7ef7f9`
- `shared/ozon_entitlements.js`: `e9fba5b171df930ca99d8ac6d13e92ea52fc319016026d74a8c137220c7eabb0`

Protected runtime identities:

- `content_script.js`: `a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd`
- `service_worker.js`: `b995ad6eaf6556eac31f728a3640b77b08d6354d5e7e22f5a34f030902059f87`
- `shared/bridge_autorun_model.js`: `c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5`
- `shared/work_session_model.js`: `11e91d850a3d69711fefdaadb6617b825350d9382b9bc55cabdbbc9b255c9855`
- `shared/ozon_provider.js`: `16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b`
- `shared/provider_transport_core.js`: `7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8`
- `shared/manual_controls.js`: `81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e`

Candidate semantics:

- five pure reads enabled;
- realization posting deferred for unresolved non-subscription account eligibility;
- realization report create excluded;
- report file URLs redacted;
- no hidden retry/pagination/fanout/report chain;
- one explicit command -> one fixed request maximum;
- Autorun/Work lifecycle unchanged.

Patch transport is deterministic gzip. Materializer verifies both gzip and decompressed raw patch SHA before apply.
