# Ozon Bridge full-read completion — current status

Date: 2026-08-29

This file is the compact roadmap authority after acceptance of corrected canonical B1, the 511-operation master inventory, canonical B1–B49 salvage, Personal Data gate audit, and Seller workflow/report/document Step 5.

## Current roadmap

1. ✅ Corrected canonical B1 formal acceptance.
2. ✅ Master checklist: 463 Seller + 48 Performance operations.
3. ✅ Deterministic salvage of accepted historical B1–B49 Seller reads under corrected V2 taxonomy.
4. ✅ Audit of the accepted B0 Personal Data gate across the accepted Seller read surface.
5. ✅ Seller workflow/report/document reads and terminal decisions for the Step 5 candidate surface.
6. 🔄 Complete Performance API coverage across all 48 current operations.
7. ⬜ Give every one of the 463 Seller operations a terminal decision.
8. ⬜ Give every one of the 48 Performance operations a terminal decision.
9. ⬜ Full integration acceptance of the extension.
10. ⬜ Final release acceptance and installable artifact.

Final completion marker remains:

`FULL_OZON_READ_COVERAGE_ACCEPTED`

No B50/B51/etc. implementation stage is authorized. The fixed roadmap above controls the remaining work.

## Step 1 — closed: corrected canonical B1

Formal acceptance:

`validation/PATCH_V2_B1_STOCKS_WAREHOUSE_ACCEPTED_2026-08-29.md`

Accepted production candidate:

`10260c0c672cebd6cdb0a42cb4568bf87f9ca3c7`

Authority:

- canonical scope: 30 Seller reads = 6 `stocks_inventory` + 24 `warehouse_logistics`;
- production files: 21;
- JavaScript files: 18;
- production tree SHA-256: `c007f650cb46c0575561532d11a2aa4355f650dfb37be4396c6e8065c1f3276f`;
- GitHub Actions run `33227432407`: Linux PASS + Windows PASS;
- artifact `9707334603` independently downloaded and verified;
- artifact ZIP SHA-256: `01d27dc568a6e966e2bb581a0178e9f59719b6297ffc0fc2282ca0946be3fd2c`.

No fresh Ozon business API request was used for acceptance.

## Step 2 — closed: full 511-operation inventory

Formal acceptance:

`validation/OZON_FULL_API_MASTER_CHECKLIST_ACCEPTED_2026-08-29.md`

Generated authority:

- `validation/OZON_FULL_API_MASTER_CHECKLIST_2026-08-29.json`
- `validation/OZON_FULL_API_MASTER_CHECKLIST_2026-08-29.csv`
- `validation/OZON_FULL_API_MASTER_CHECKLIST_SUMMARY_2026-08-29.md`

Accepted counts:

- Seller: 463 current operations;
- Performance: 48 current operations across 47 paths;
- total: 511 current operations.

Exact Seller Swagger authority:

- bytes: `3933043`;
- SHA-256: `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`;
- OpenAPI `3.0.0`;
- 463 operations.

Exact Performance Swagger authority:

- bytes: `304771`;
- SHA-256: `7436e4a3e40b4d5bf926a887d7891c1db264cbb6582266299a2df10f67592fec`;
- OpenAPI `3.0.0`;
- 47 paths / 48 operations.

The master checklist is the controlling current API inventory. Public/pinned method indexes may help discovery but are not exact request/response schema authority.

## Step 3 — closed: corrected B1–B49 salvage

Formal acceptance:

`validation/OZON_V2_B1_B49_CANONICAL_SALVAGE_ACCEPTED_2026-08-29.md`

Accepted exact package authority:

- package commit: `bdcc86305746b0fccdedf567b470fcaeb85a3335`;
- exact validation head: `926b08c5d3507a206e4b80f14108146afce93ed6`;
- exact candidate run `33239719039`: Linux PASS + Windows PASS;
- exact artifact: `9710978189`;
- artifact ZIP SHA-256: `628cb9b9af220ee36202c53f09a9a6dea162bc361786f7aa750f91a8c35370c9`;
- accepted production tree: `ae3f53084d7a9aff5de820503a44b2875ab0c63c6ffc14bf72d941e8d0dab24e`;
- production shape: 21 files / 18 JavaScript files.

Accepted salvage result:

- 42 corrected canonical B1 aliases preserve canonical semantics;
- 191 Seller aliases are present;
- 153 Seller aliases were salvaged beyond corrected canonical B1;
- 10 historical Performance aliases are carried separately in the accepted registry;
- 201 registry aliases total;
- unauthorized `seller_health` is absent;
- four historical rating/error-index reads are reclassified into `sales_analytics / delivery_returns_cancellations_metrics`;
- only registry, contract, and entitlements differ from corrected B1;
- protected runtime remains byte-identical;
- no hidden pagination, retry, polling, fan-out, or provider chaining was introduced.

Deterministic transport:

- `validation/PATCH_V2_B1_B49_CANONICAL_SALVAGE_2026-08-29.patch.gz`;
- gzip SHA-256: `363724a309deb6a03b04c53131108d985e02863f42ada158d0129acd4e8c6c4b`;
- raw patch SHA-256: `6f81a335f13b1a2a673763588e8aca85b1284598ccd6e267ca14beecca02d0bc`.

Step 3 did not claim Seller 463/463 or Performance 48/48 completion.

## Step 4 — closed: Personal Data gate audit

Formal acceptance:

`validation/OZON_PERSONAL_DATA_GATE_AUDIT_ACCEPTED_2026-08-29.md`

Cross-platform authority:

- final audit run: `33241158626` — PASS;
- audit head: `3b8f07461a7624ac3e08da024ee5875b9f6f56d6`;
- evidence commit: `2008198a64d8144f7a45ff540eeed2977e968ba1`;
- formal acceptance commit: `0f61335978cbb6c74db0a3226ed4a68988de57bb`.

Accepted matrix over the 463 Seller operations:

- 191 accepted Step3 Seller reads mapped one-to-one to current Seller `method + path` rows;
- 10 use `operator_personal_data_gate`;
- 181 use `safe_projection` without the operator gate;
- 272 rows had no accepted Step3 alias and remained explicitly pending later exact-schema privacy classification.

The 272 pending rows are not declared privacy-safe.

Accepted B0 gate semantics remain authoritative:

- Personal Data OFF blocks before provider execution;
- blocked commands execute zero external Ozon business requests;
- enabling Personal Data does not replay blocked work;
- explicit later resubmission while enabled may execute;
- gating is registry-driven through `policy_group: personal_data_read` and is not alias-hardcoded.

The accepted Step3 gated set at Step 4 was:

- `fbs_posting_list` — `POST /v4/posting/fbs/list`;
- `fbs_unfulfilled_list` — `POST /v4/posting/fbs/unfulfilled/list`;
- `posting_fbs_get` — `POST /v3/posting/fbs/get`;
- `rfbs_returns_list` — `POST /v2/returns/rfbs/list`;
- `review_list` — `POST /v2/review/list`;
- `review_info` — `POST /v2/review/info`;
- `review_comment_list` — `POST /v1/review/comment/list`;
- `question_list` — `POST /v1/question/list`;
- `question_answer_list` — `POST /v1/question/answer/list`;
- `question_info` — `POST /v1/question/info`.

No fresh Ozon business API requests were made for Step 4.

## Step 5 — closed: Seller workflow/report/document reads

Formal acceptance:

`validation/OZON_V2_STEP5_WORKFLOW_REPORT_DOCUMENT_ACCEPTED_2026-08-29.md`

Formal acceptance commit:

`2934c32654a98d129de56f6c1076e3ffb122ed1f`

### Decision universe

The workflow/report/document candidate surface contained 203 Seller operations:

- 85 were already accepted Step3 candidates;
- 118 required exact terminal decisions.

Frozen 118-decision breakdown:

- 28 `IMPLEMENT_READ`;
- 60 `REJECT_SERVER_SIDE_GENERATION_OR_CREATION`;
- 25 `REJECT_MUTATION_SIDE_EFFECT`;
- 3 `REJECT_SUNSET_REPLACED`;
- 2 `REJECT_DEPRECATED_REPLACED`.

Decision authority:

- generator: `validation/build_ozon_step5_exact_decision_matrix.py`;
- JSON/CSV/summary: `validation/OZON_STEP5_EXACT_DECISION_MATRIX_2026-08-29.*`;
- cross-platform decision run: `33244552814` — PASS;
- frozen evidence commit: `da82ad2c6e4f4144b400cdf046e60c4af8a4b95b`.

### Accepted production result

Step 5 adds exactly 28 new current Seller reads to the accepted Step3 surface:

- Seller aliases before Step 5: 191;
- new Step 5 reads: 28;
- Seller aliases after Step 5: 219.

Nine of the 28 new reads attach to the existing accepted B0 Personal Data gate. Step 5 does not introduce a second privacy mechanism.

Four new direct PDF/PNG reads use byte-preserving single-request transport:

- `POST /v1/return/giveout/get-pdf`;
- `POST /v1/return/giveout/get-png`;
- `POST /v2/posting/fbs/act/get-barcode`;
- `POST /v2/posting/fbs/act/get-pdf`.

A workflow/status URL is data only; the bridge never auto-fetches it.

All 90 operations rejected as generation/creation, mutation/side effect, sunset/replaced, or deprecated/replaced remain unavailable as read aliases.

All 201 accepted Step3 registry entries preserve their prior operation metadata and wire-request semantics.

### Candidate authority

Initial cross-platform production candidate:

- run `33247970286`: Linux PASS + Windows PASS;
- head `1903579f64342b23971b65e92b8ae50091fc26eb`;
- artifact `9713449174`;
- artifact ZIP SHA-256 `d20876c558b1d5912221d1ee388d347811d0e7acc7e319ea7347bfebb26188c4`.

### Deterministic exact package

Base Step3 tree:

`ae3f53084d7a9aff5de820503a44b2875ab0c63c6ffc14bf72d941e8d0dab24e`

Accepted Step5 tree:

`3c0412d640343e00b5a08f3419a3e6fdb7b1c327d694c8ad3351729af5c4d7ce`

Only four production files change:

- `shared/ozon_operation_registry.js` — `2b3143632d964e4c10ad29b5a85b36c69698d9bf59521ade92279f88de6ec91f`;
- `shared/ozon_contract.js` — `4e6f488b707cd1e66f78ccbdb50688d18d430c47b796b1684c1f96e245235920`;
- `shared/ozon_entitlements.js` — `5f31664e1a0fbb7cada89c0d7673a7720c72ee2ce60fa27a7294ddec9ad30ad3`;
- `shared/provider_transport_core.js` — `5b8d085a6be3a26a4278aa6ea718656fd66293a72b7957c5e377284c9f6188a7`.

Protected runtime remains exact, including `service_worker.js`, `shared/ozon_provider.js`, `content_script.js`, and `popup.js`.

Package transport:

- `validation/PATCH_STEP5_WORKFLOW_REPORT_DOCUMENT_2026-08-29.patch.gz.b64`;
- base64 text SHA-256 `2260e18915869843103533e866f37eb43dcbdca00e93cb8cea681ecb30f8873c`;
- decoded gzip SHA-256 `69ff1d77c6e0bfc5d511977519ffa11de46377eeea0be7d7e88021d564c7039b`;
- raw patch SHA-256 `e3f4606d793becd065869d251080e3c7984ac48f8b7159725616007066b39cc9`;
- manifest `validation/PATCH_STEP5_WORKFLOW_REPORT_DOCUMENT_2026-08-29_MANIFEST.json`.

Corrected exact-package authority:

- run `33248542254`: Linux PASS + Windows PASS;
- exact-package head `e19b7d39cdaa3914e10e7fb26903fd2ec3405dec`;
- artifact ID `9713615780`;
- artifact name `ozon-step5-workflow-report-document-exact-package`;
- artifact size `191713` bytes;
- artifact ZIP SHA-256 `955a77ac08a8a26fe554dbee54aae964328756f5c716e0787696958b329d2fa4`;
- production shape 21 files / 18 JavaScript files.

The exact-package artifact was independently downloaded and verified outside the workflow:

- ZIP digest matched GitHub;
- file counts matched;
- tree matched `3c0412d640343e00b5a08f3419a3e6fdb7b1c327d694c8ad3351729af5c4d7ce`;
- all changed and protected hashes matched;
- all 18 JavaScript files passed `node --check`.

Accepted Step 5 invariants:

- one explicit command maps to at most one Ozon business request;
- no hidden pagination;
- no hidden retry;
- no hidden polling;
- no hidden fan-out;
- no provider chaining;
- no automatic URL/document fetch;
- server-side generation is not disguised as read;
- Personal Data gating continues to use the existing accepted mechanism;
- Work/manual/session lifecycle is outside the Step 5 production delta.

No fresh Seller or Performance business API request was made for Step 5 research, implementation validation, or acceptance.

## Step 6 — current action: Performance 48/48

The exact Performance Swagger authority is already fixed:

- 304771 bytes;
- SHA-256 `7436e4a3e40b4d5bf926a887d7891c1db264cbb6582266299a2df10f67592fec`;
- OpenAPI `3.0.0`;
- 47 paths / 48 operations.

Historical accepted Performance B6 is useful salvage/reference work but is not full coverage. Its accepted commit is:

`d6ec73e48e3ad51da23323016b2dcdf34f21ef0c`

Historical B6 proved six accepted Performance reads. The accepted Step3 registry currently carries ten Performance aliases, including legacy `/json` compatibility routes. Compatibility aliases must not be miscounted as extra current Swagger operations.

Step 6 must now:

1. reconstruct the exact 48-operation current Performance matrix from accepted exact-Swagger evidence;
2. map the six historical accepted B6 reads and all current accepted Performance aliases onto exact current `method + path` rows;
3. preserve the separate Performance provider and entitlement model;
4. classify every admissible Performance read/read-workflow without inventing hidden polling, fan-out, retry, or side effects;
5. implement missing admissible reads deterministically;
6. keep compatibility aliases separate from the 48-current-operation completeness count;
7. produce Linux + Windows deterministic candidate evidence and an independently verified artifact before closing Step 6.

Step 6 does not replace Step 8: Step 8 is still the final requirement that all 48 Performance operations, including non-reads, have terminal decisions.

No fresh Ozon Performance business API request is authorized for Step 6 research or deterministic validation.
