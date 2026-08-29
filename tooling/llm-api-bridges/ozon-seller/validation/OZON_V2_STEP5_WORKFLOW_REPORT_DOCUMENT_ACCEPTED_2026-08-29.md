# Ozon V2 Step 5 workflow/report/document reads — accepted

Status: `OZON_V2_STEP5_WORKFLOW_REPORT_DOCUMENT_ACCEPTED`

Date: 2026-08-29
Roadmap step: 5
Branch: `repair/ozon-v2-b1-stocks-warehouse-2026-08-29`

## Acceptance statement

Roadmap Step 5 is formally accepted. The Seller workflow/report/document candidate universe was resolved against the exact accepted Seller Swagger and the accepted Step3 production tree, then materialized and regression-tested on Linux and Windows from a deterministic Step3→Step5 patch package. The resulting exact package was downloaded from GitHub Actions and independently verified byte-for-byte outside the workflow.

This acceptance does not perform or depend on any fresh Ozon Seller business API request.

## Exact decision authority

Exact Seller Swagger authority:

- bytes: `3933043`
- SHA-256: `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`
- OpenAPI: `3.0.0`
- operations: `463`

Step 5 workflow/report/document candidate surface:

- candidate operations: `203`
- already accepted by Step3: `85`
- exact-schema terminal decisions frozen here: `118`

Terminal decisions over the 118-operation pending surface:

- `IMPLEMENT_READ`: `28`
- `REJECT_SERVER_SIDE_GENERATION_OR_CREATION`: `60`
- `REJECT_MUTATION_SIDE_EFFECT`: `25`
- `REJECT_SUNSET_REPLACED`: `3`
- `REJECT_DEPRECATED_REPLACED`: `2`

Decision evidence:

- generator: `build_ozon_step5_exact_decision_matrix.py`
- JSON: `OZON_STEP5_EXACT_DECISION_MATRIX_2026-08-29.json`
- CSV: `OZON_STEP5_EXACT_DECISION_MATRIX_2026-08-29.csv`
- summary: `OZON_STEP5_EXACT_DECISION_MATRIX_SUMMARY_2026-08-29.md`
- cross-platform decision run: `33244552814`
- frozen evidence commit: `da82ad2c6e4f4144b400cdf046e60c4af8a4b95b`

## Accepted production delta

Exact Step3 base production tree:

`ae3f53084d7a9aff5de820503a44b2875ab0c63c6ffc14bf72d941e8d0dab24e`

Exact accepted Step5 production tree:

`3c0412d640343e00b5a08f3419a3e6fdb7b1c327d694c8ad3351729af5c4d7ce`

Seller read surface:

- accepted Step3 Seller aliases before Step5: `191`
- new Step5 Seller reads: `28`
- accepted Seller aliases after Step5: `219`

Only four production files differ from the accepted Step3 tree:

- `shared/ozon_operation_registry.js` — SHA-256 `2b3143632d964e4c10ad29b5a85b36c69698d9bf59521ade92279f88de6ec91f`
- `shared/ozon_contract.js` — SHA-256 `4e6f488b707cd1e66f78ccbdb50688d18d430c47b796b1684c1f96e245235920`
- `shared/ozon_entitlements.js` — SHA-256 `5f31664e1a0fbb7cada89c0d7673a7720c72ee2ce60fa27a7294ddec9ad30ad3`
- `shared/provider_transport_core.js` — SHA-256 `5b8d085a6be3a26a4278aa6ea718656fd66293a72b7957c5e377284c9f6188a7`

Protected runtime identities remain unchanged, including:

- `service_worker.js` — `a85b0d47b14065266221d9b3fcf3194cbaa78d96ead792fbe20834f8ee7a54a3`
- `shared/ozon_provider.js` — `16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b`
- `content_script.js` — `a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd`
- `popup.js` — `9f6ec207f4bed3bae0de912fca2f3347cc286ced9ca310369f10269400819070`

The accepted package contains `21` production files and `18` JavaScript files.

## Personal Data boundary

Nine of the 28 new reads are attached to the already accepted B0 Personal Data mechanism. Step 5 does not introduce a second privacy mechanism or redesign the gate.

The accepted behavior remains:

- Personal Data OFF blocks gated commands before provider execution;
- blocked commands produce zero external Ozon business requests;
- enabling Personal Data does not replay a blocked command;
- a later explicit resubmission while enabled may execute normally.

After Step 5 the accepted Seller read surface contains the previous 10 gated Seller aliases plus 9 newly attached gated reads. All gating is registry-driven through the existing `personal_data_read` policy group.

## Binary/document transport boundary

Four new reads return direct PDF/PNG binary content and are accepted with byte-preserving single-request transport:

- `POST /v1/return/giveout/get-pdf`
- `POST /v1/return/giveout/get-png`
- `POST /v2/posting/fbs/act/get-barcode`
- `POST /v2/posting/fbs/act/get-pdf`

Accepted transport properties:

- exactly one explicit command maps to exactly one Ozon business request;
- response bytes are preserved in the bridge result envelope;
- a JSON error response remains a JSON error response;
- an unexpected binary content type fails closed after that same single request;
- URLs returned by workflow/status operations are data only and are never automatically fetched by the bridge.

## Preserved Step3 behavior

The semantic regression proves that all `201` accepted Step3 registry entries preserve their prior operation metadata and wire-request semantics. This includes the `191` accepted Seller aliases and the historical Performance compatibility entries carried through Step3.

The Step 5 candidate does not add hidden pagination, retries, polling, fan-out, provider chaining, or automatic URL/document fetching.

All `90` Step5 operations rejected as server-side generation/creation, mutation/side effect, sunset/replaced, or deprecated/replaced remain unavailable as read operations.

Work/manual/session lifecycle code is outside the Step 5 production delta.

## Candidate CI evidence

Production candidate workflow run:

- run: `33247970286`
- head: `1903579f64342b23971b65e92b8ae50091fc26eb`
- Linux candidate: PASS
- Windows candidate: PASS
- artifact: `9713449174`
- artifact name: `ozon-step5-workflow-report-document-candidate`
- artifact ZIP SHA-256: `d20876c558b1d5912221d1ee388d347811d0e7acc7e319ea7347bfebb26188c4`

That candidate artifact was independently downloaded and verified as 21 files / 18 JS, exact tree `3c0412d640343e00b5a08f3419a3e6fdb7b1c327d694c8ad3351729af5c4d7ce`, exact changed-file hashes, and all JavaScript syntax checks PASS.

## Deterministic exact-package authority

Package transport:

- file: `PATCH_STEP5_WORKFLOW_REPORT_DOCUMENT_2026-08-29.patch.gz.b64`
- base64 text bytes: `10524`
- base64 text SHA-256: `2260e18915869843103533e866f37eb43dcbdca00e93cb8cea681ecb30f8873c`
- decoded gzip bytes: `7893`
- decoded gzip SHA-256: `69ff1d77c6e0bfc5d511977519ffa11de46377eeea0be7d7e88021d564c7039b`
- raw patch bytes: `20735`
- raw patch SHA-256: `e3f4606d793becd065869d251080e3c7984ac48f8b7159725616007066b39cc9`

Package manifest:

- `PATCH_STEP5_WORKFLOW_REPORT_DOCUMENT_2026-08-29_MANIFEST.json`
- schema: `OZON_STEP5_WORKFLOW_REPORT_DOCUMENT_PATCH_PACKAGE_V1`

Corrected exact-package CI:

- run: `33248542254`
- head: `e19b7d39cdaa3914e10e7fb26903fd2ec3405dec`
- Linux exact package: PASS
- Windows exact package: PASS
- exact-package artifact ID: `9713615780`
- artifact name: `ozon-step5-workflow-report-document-exact-package`
- artifact size: `191713` bytes
- artifact ZIP SHA-256: `955a77ac08a8a26fe554dbee54aae964328756f5c716e0787696958b329d2fa4`

Both operating systems proved:

- base64 package transport identity;
- decoded gzip identity;
- raw patch identity;
- exact Step3 base tree identity;
- patch application;
- exact 21-file / 18-JS package shape;
- exact changed and protected file identities;
- exact final Step5 tree;
- frozen 118-decision authority;
- exact +28 Seller read bindings;
- preservation of all 201 Step3 operation semantics;
- existing Personal Data gate attachment for the 9 new gated reads;
- direct-binary metadata for all 4 binary reads;
- exact request normalization;
- URL-as-data sanitization;
- byte-preserving single-request binary behavior;
- JSON error preservation;
- binary content-type fail-closed behavior;
- exclusion of all 90 non-read/replaced operations;
- absence of hidden polling/fan-out/chaining/URL fetch;
- all JavaScript syntax checks.

## Independent exact-package artifact verification

Artifact `9713615780` was downloaded after the clean corrected package run and checked independently from the workflow.

Verified:

- ZIP SHA-256 equals GitHub artifact digest: `955a77ac08a8a26fe554dbee54aae964328756f5c716e0787696958b329d2fa4`;
- production files: `21`;
- JavaScript files: `18`;
- tree SHA-256: `3c0412d640343e00b5a08f3419a3e6fdb7b1c327d694c8ad3351729af5c4d7ce`;
- all four changed production-file hashes match the package manifest;
- protected `service_worker.js`, `shared/ozon_provider.js`, `content_script.js`, and `popup.js` hashes remain exact;
- all 18 JavaScript files pass `node --check`.

## Acceptance marker

`OZON_V2_STEP5_WORKFLOW_REPORT_DOCUMENT_ACCEPTED`

Roadmap Step 5 is closed. Roadmap Step 6 — full Performance 48/48 coverage — is the next active step.
