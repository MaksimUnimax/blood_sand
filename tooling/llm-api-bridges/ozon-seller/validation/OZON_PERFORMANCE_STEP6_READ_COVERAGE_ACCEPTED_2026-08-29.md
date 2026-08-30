# Ozon Performance Step 6 read coverage — ACCEPTED

Date: 2026-08-29  
Status: `OZON_PERFORMANCE_STEP6_READ_COVERAGE_ACCEPTED`

## Scope accepted

Roadmap Step 6 is accepted as the complete implementation pass for all admissible current Performance API reads/read-results under the exact 48-operation Performance Swagger authority.

This acceptance does not merge Performance API into Seller API. Performance remains a separate provider. It also does not reinterpret report-generation starts or mutation endpoints as reads.

## Exact Performance contract authority

The exact Performance Swagger used for Step 6 is:

- bytes: `304771`;
- SHA-256: `7436e4a3e40b4d5bf926a887d7891c1db264cbb6582266299a2df10f67592fec`;
- OpenAPI: `3.0.0`;
- paths: `47`;
- HTTP operations: `48`.

The exhaustive Step 6 matrix is frozen by:

- matrix commit: `67e505af3ae4a434fe41bf6423ff178e9656c644`;
- matrix CI run: `33248945436`;
- Linux matrix: PASS;
- Windows matrix: PASS;
- evidence file: `validation/OZON_PERFORMANCE_STEP6_EXACT_MATRIX_2026-08-29.json`.

The exact 48 current operations classify as:

- `21` admissible current reads/read-results;
- `9` async report-generation starts that remain blocked;
- `16` mutation/side-effect operations that remain blocked;
- `2` deprecated read-like operations that remain unavailable.

Within the 21 admissible current reads:

- `6` were already implemented at exact current Swagger paths;
- `15` are added by Step 6;
- four documented `/json` statistics variants remain preserved as compatibility/read variants, but are not counted as extra current Swagger operations.

## Deterministic package authority

Base accepted Step 5 production tree:

`3c0412d640343e00b5a08f3419a3e6fdb7b1c327d694c8ad3351729af5c4d7ce`

Step 6 package:

- transport file: `validation/PATCH_PERFORMANCE_STEP6_READ_COVERAGE_2026-08-29.patch.gz.b64`;
- manifest: `validation/PATCH_PERFORMANCE_STEP6_READ_COVERAGE_2026-08-29_MANIFEST.json`;
- materializer: `validation/materialize_performance_step6_read_coverage_package.py`;
- semantic regression: `validation/OZON_PERFORMANCE_STEP6_READ_COVERAGE_REGRESSION_2026-08-29.mjs`.

Transport identities:

- canonical base64 text bytes: `6289`;
- canonical base64 SHA-256: `b3e44e97549effa82088053113ca8d386c74922837f9c645ddfc1943780da71f`;
- decoded gzip bytes: `4715`;
- decoded gzip SHA-256: `1bbbb53c55d4326e3904dfdec04ea62c2559141e1474ec1d8dc8a0ca3380d727`;
- raw patch bytes: `25696`;
- raw patch SHA-256: `4cee07da92b9a90960205a5eb573da6a0289769029de2e59054b138b9a711dc2`.

The base64 carrier is text and the materializer canonicalizes checkout-only `CRLF -> LF` before checking the canonical base64 text identity. Decoded gzip bytes, raw patch bytes, changed production hashes and final tree remain byte-exact and are not line-ending-normalized.

## Exact production result

Accepted Step 6 production tree:

`1f8001b6b9ca3d247f0d199de592f2b6ed2ec9a7b7f7d90ec10388ee8a82813f`

Production shape:

- files: `21`;
- JavaScript files: `18`;
- Seller aliases: `219`;
- Performance aliases: `25`;
- current exact-path Performance reads: `21`;
- new current Performance reads in Step 6: `15`;
- direct-binary Performance reads: `5`.

Exactly three production files change from accepted Step 5:

- `shared/ozon_operation_registry.js` -> `0909734578868978132720f1df6f3d79341bb32ac7432b6ea7ff76e6e47ebeae`;
- `shared/ozon_contract.js` -> `05c0d2ac2e074de861c219e029f24cc9407163ca7868e31a159ea6e65771cd22`;
- `shared/provider_transport_core.js` -> `fc104e5d0bd6ea836c066f8144f642c0666c0e270cbdbf8c3b1ec3a25071969e`.

Protected production identities remain unchanged:

- `shared/ozon_entitlements.js` -> `5f31664e1a0fbb7cada89c0d7673a7720c72ee2ce60fa27a7294ddec9ad30ad3`;
- `shared/ozon_provider.js` -> `16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b`;
- `service_worker.js` -> `a85b0d47b14065266221d9b3fcf3194cbaa78d96ead792fbe20834f8ee7a54a3`;
- `content_script.js` -> `a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd`;
- `popup.js` -> `9f6ec207f4bed3bae0de912fca2f3347cc286ced9ca310369f10269400819070`.

Seller subscription entitlements are not invented for Performance API. Performance remains routed through the accepted separate Performance provider.

## Cross-platform production validation

Final clean candidate run:

`33249407022`

Head:

`5e2b0544ef701245642486e6caa82c07f630c698`

Result:

- Linux exact candidate: PASS;
- Windows exact candidate: PASS;
- exact package materialization: PASS on both OSes;
- semantic regression: PASS on both OSes;
- all 18 production JavaScript files: `node --check` PASS on both OSes.

Both OSes prove:

- frozen 48-operation matrix identity;
- exactly three production files changed;
- all `229` accepted Step 5 aliases and their wire semantics preserved;
- exactly `15` new current Performance read bindings;
- exactly `5` direct-binary Performance reads;
- exact trusted request construction and input normalization;
- `16` mutation operations remain unavailable;
- `9` async report-generation starts remain unavailable;
- `2` deprecated read-like operations remain unavailable;
- Seller transport semantics remain preserved;
- binary responses are byte-preserving and execute exactly one physical business request;
- JSON errors on binary endpoints remain JSON errors after the same single request;
- unexpected binary success content types fail closed;
- no hidden polling, retry, fan-out or provider chaining is introduced.

The earlier run `33249356400` had Linux PASS but Windows stopped before semantic regression because Git checkout converted the final LF in the text `.b64` carrier to CRLF. This was a validation transport portability issue only. The deterministic gzip/raw patch and production candidate were not changed. The clean replacement run `33249407022` passes on both operating systems.

## CI artifact and independent verification

Final exact candidate artifact:

- run: `33249407022`;
- artifact ID: `9713867514`;
- artifact name: `ozon-performance-step6-read-coverage-exact-candidate`;
- ZIP bytes: `193297`;
- ZIP SHA-256: `d48b6121b8740f234aa0f5685f62392861f8892d4abfd384656cf6c9b43ae734`.

The artifact was independently downloaded after CI and verified outside GitHub Actions:

- ZIP SHA-256 matched;
- production file count = `21`;
- JavaScript file count = `18`;
- production tree = `1f8001b6b9ca3d247f0d199de592f2b6ed2ec9a7b7f7d90ec10388ee8a82813f`;
- all three changed production hashes matched the manifest;
- all protected production hashes matched the manifest;
- all 18 JavaScript files passed `node --check`.

## Safety and lifecycle invariants

Step 6 preserves all required product boundaries:

- one explicit Bridge command performs at most one physical Ozon business request;
- no hidden pagination;
- no hidden retry;
- no hidden polling;
- no hidden fan-out;
- no provider chaining;
- no automatic continuation from report start to status/download;
- async Performance report-generation starts are not exposed as reads;
- campaign/product/bid mutation operations remain unavailable;
- deprecated read-like operations are not enabled in place of current contracts;
- caller-controlled host, arbitrary URL/path/method/header/authorization injection remains forbidden;
- `service_worker.js`, Work-session lifecycle, Manual controls, Autorun behavior and session state are unchanged;
- Seller Personal Data behavior is unchanged;
- no fresh Seller API business request was made for Step 6 validation;
- no fresh Performance API business request was made for Step 6 validation;
- no credentials were used for Step 6 deterministic validation.

## Roadmap consequence

Roadmap Step 6 is closed.

Step 7 becomes active: reconcile the complete Seller master inventory so every one of the `463` current Seller operations has an explicit terminal decision. Step 7 must use the accepted Step 6 production candidate as the current product base and must not create another ad-hoc B-number stage.

Formal marker:

`OZON_PERFORMANCE_STEP6_READ_COVERAGE_ACCEPTED`
