# Ozon Bridge full-read completion — current status

Date: 2026-08-29

This file is the compact roadmap authority after formal acceptance of corrected canonical B1, the full 511-operation inventory, B1–B49 Seller salvage, Personal Data gate audit, Seller workflow/report/document completion, and Performance read coverage.

## Current roadmap

1. ✅ Corrected canonical B1 formal acceptance.
2. ✅ Master checklist: 463 Seller + 48 Performance operations.
3. ✅ Deterministic salvage of accepted historical B1–B49 Seller reads under corrected V2 taxonomy.
4. ✅ Audit of the accepted B0 Personal Data gate across the accepted Seller read surface.
5. ✅ Seller workflow/report/document reads and terminal decisions for the Step 5 candidate surface.
6. ✅ Complete admissible Performance API read coverage under the exact 48-operation contract.
7. 🔄 Give every one of the 463 current Seller operations a terminal decision.
8. ⬜ Give every one of the 48 Performance operations a final terminal-decision acceptance.
9. ⬜ Full integration acceptance of the extension.
10. ⬜ Final release acceptance and installable artifact.

Final completion marker remains:

`FULL_OZON_READ_COVERAGE_ACCEPTED`

No B50/B51/etc. implementation stage is authorized. The fixed roadmap above controls all remaining work.

## Step 1 — closed: corrected canonical B1

Formal acceptance:

`validation/PATCH_V2_B1_STOCKS_WAREHOUSE_ACCEPTED_2026-08-29.md`

Accepted production candidate:

`10260c0c672cebd6cdb0a42cb4568bf87f9ca3c7`

Authority:

- 30 canonical Seller reads = 6 `stocks_inventory` + 24 `warehouse_logistics`;
- production shape 21 files / 18 JavaScript files;
- tree `c007f650cb46c0575561532d11a2aa4355f650dfb37be4396c6e8065c1f3276f`;
- CI run `33227432407`: Linux PASS + Windows PASS;
- artifact `9707334603` independently verified;
- artifact ZIP SHA-256 `01d27dc568a6e966e2bb581a0178e9f59719b6297ffc0fc2282ca0946be3fd2c`.

## Step 2 — closed: exact 511-operation inventory

Formal acceptance:

`validation/OZON_FULL_API_MASTER_CHECKLIST_ACCEPTED_2026-08-29.md`

Current API universe:

- Seller: 463 operations;
- Performance: 48 operations across 47 paths;
- total: 511 operations.

Exact Seller Swagger authority:

- bytes `3933043`;
- SHA-256 `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`;
- OpenAPI `3.0.0`;
- 463 operations.

Exact Performance Swagger authority:

- bytes `304771`;
- SHA-256 `7436e4a3e40b4d5bf926a887d7891c1db264cbb6582266299a2df10f67592fec`;
- OpenAPI `3.0.0`;
- 47 paths / 48 operations.

The generated 511-row master checklist remains the controlling current inventory. No final completeness claim may be based only on alias counts.

## Step 3 — closed: corrected B1–B49 Seller salvage

Formal acceptance:

`validation/OZON_V2_B1_B49_CANONICAL_SALVAGE_ACCEPTED_2026-08-29.md`

Accepted result:

- 191 Seller aliases;
- 153 historical Seller aliases salvaged beyond corrected canonical B1;
- 10 historical Performance aliases preserved separately;
- 201 aliases total in the accepted Step 3 registry;
- no unauthorized `seller_health` taxonomy;
- protected runtime unchanged;
- no hidden pagination/retry/polling/fan-out/chaining.

Exact package authority:

- run `33239719039`: Linux PASS + Windows PASS;
- artifact `9710978189`;
- ZIP SHA-256 `628cb9b9af220ee36202c53f09a9a6dea162bc361786f7aa750f91a8c35370c9`;
- tree `ae3f53084d7a9aff5de820503a44b2875ab0c63c6ffc14bf72d941e8d0dab24e`.

## Step 4 — closed: Personal Data gate audit

Formal acceptance:

`validation/OZON_PERSONAL_DATA_GATE_AUDIT_ACCEPTED_2026-08-29.md`

Authority:

- final run `33241158626`: Linux PASS + Windows PASS;
- evidence commit `2008198a64d8144f7a45ff540eeed2977e968ba1`;
- formal acceptance commit `0f61335978cbb6c74db0a3226ed4a68988de57bb`.

Accepted Step 3 surface at the time of the audit:

- 191 accepted Seller reads;
- 10 `operator_personal_data_gate`;
- 181 `safe_projection`;
- 272 master rows had no Step 3 alias and were explicitly left for later exact-schema classification.

The 272 rows were not declared privacy-safe.

B0 gate semantics remain authoritative:

- Personal Data OFF blocks before provider execution;
- blocked command executes zero Ozon business requests;
- enabling the setting does not replay blocked work;
- explicit resubmission while enabled is required;
- the gate is registry-driven rather than alias-hardcoded.

## Step 5 — closed: Seller workflow/report/document reads

Formal acceptance:

`validation/OZON_V2_STEP5_WORKFLOW_REPORT_DOCUMENT_ACCEPTED_2026-08-29.md`

Formal acceptance commit:

`2934c32654a98d129de56f6c1076e3ffb122ed1f`

Step 5 exact decision universe:

- 203 Seller workflow/report/document candidate operations;
- 85 already accepted Step 3 candidates;
- 118 required new exact decisions;
- 28 `IMPLEMENT_READ`;
- 60 `REJECT_SERVER_SIDE_GENERATION_OR_CREATION`;
- 25 `REJECT_MUTATION_SIDE_EFFECT`;
- 3 `REJECT_SUNSET_REPLACED`;
- 2 `REJECT_DEPRECATED_REPLACED`.

Accepted production result:

- Seller aliases increase from 191 to 219;
- nine new reads attach to the existing Personal Data gate;
- four direct PDF/PNG reads use byte-preserving single-request transport;
- all 90 rejected workflow/report/document operations stay unavailable;
- all Step 3 accepted semantics remain preserved.

Exact package authority:

- final run `33248542254`: Linux PASS + Windows PASS;
- artifact `9713615780`;
- artifact ZIP SHA-256 `955a77ac08a8a26fe554dbee54aae964328756f5c716e0787696958b329d2fa4`;
- accepted tree `3c0412d640343e00b5a08f3419a3e6fdb7b1c327d694c8ad3351729af5c4d7ce`;
- artifact independently verified outside CI;
- all 18 JavaScript files passed syntax checks.

## Step 6 — closed: Performance read coverage

Formal acceptance:

`validation/OZON_PERFORMANCE_STEP6_READ_COVERAGE_ACCEPTED_2026-08-29.md`

Formal acceptance commit:

`1f51eb74bb7b83bcc3356e3fe3422b2702227c2f`

### Exact 48-operation Performance classification

Frozen matrix authority:

- matrix commit `67e505af3ae4a434fe41bf6423ff178e9656c644`;
- matrix run `33248945436`: Linux PASS + Windows PASS;
- exact Swagger: 304771 bytes, SHA-256 `7436e4a3e40b4d5bf926a887d7891c1db264cbb6582266299a2df10f67592fec`.

The 48 current Performance operations are exhaustively classified as:

- 21 admissible reads/read-results;
- 9 async report-generation starts kept blocked;
- 16 mutation/side-effect operations kept blocked;
- 2 deprecated read-like operations kept unavailable.

Among the 21 admissible current reads:

- 6 were already implemented at exact current paths;
- Step 6 adds the remaining 15;
- four documented `/json` compatibility variants remain preserved separately and are not counted as extra current Swagger operations.

### Accepted Step 6 production result

- Seller aliases remain 219;
- Performance aliases become 25;
- exact current Performance reads = 21/21 admissible reads;
- direct-binary Performance reads = 5;
- production shape remains 21 files / 18 JavaScript files.

Only three production files change from accepted Step 5:

- `shared/ozon_operation_registry.js` -> `0909734578868978132720f1df6f3d79341bb32ac7432b6ea7ff76e6e47ebeae`;
- `shared/ozon_contract.js` -> `05c0d2ac2e074de861c219e029f24cc9407163ca7868e31a159ea6e65771cd22`;
- `shared/provider_transport_core.js` -> `fc104e5d0bd6ea836c066f8144f642c0666c0e270cbdbf8c3b1ec3a25071969e`.

Accepted production tree:

`1f8001b6b9ca3d247f0d199de592f2b6ed2ec9a7b7f7d90ec10388ee8a82813f`

Final clean CI authority:

- run `33249407022`;
- head `5e2b0544ef701245642486e6caa82c07f630c698`;
- Linux candidate PASS;
- Windows candidate PASS;
- artifact `9713867514`;
- artifact bytes `193297`;
- artifact ZIP SHA-256 `d48b6121b8740f234aa0f5685f62392861f8892d4abfd384656cf6c9b43ae734`.

The artifact was independently downloaded and verified outside Actions:

- 21 files / 18 JavaScript files;
- tree matched `1f8001b6b9ca3d247f0d199de592f2b6ed2ec9a7b7f7d90ec10388ee8a82813f`;
- all changed and protected hashes matched;
- all 18 JavaScript syntax checks passed.

Step 6 preserves:

- separate Performance provider;
- Seller entitlements model unchanged;
- one explicit command = at most one physical Ozon business request;
- no hidden pagination/retry/polling/fan-out/provider chaining;
- no automatic continuation from report start to status/download;
- Work/manual/session/Autorun runtime unchanged;
- no fresh Seller or Performance business API requests during deterministic validation.

## Step 7 — current action: Seller 463/463 terminal decisions

Step 7 is not another implementation batch number. It is the full-current-contract Seller reconciliation gate.

The controlling Seller universe is exactly 463 current operations from the accepted master checklist and exact Seller Swagger authority.

Current accepted implementation baseline entering Step 7:

- accepted Seller aliases: 219;
- accepted production base: Step 6 tree `1f8001b6b9ca3d247f0d199de592f2b6ed2ec9a7b7f7d90ec10388ee8a82813f`;
- Step 5 already supplied exact workflow/report/document decisions for 118 previously undecided candidate operations;
- Personal Data attachment must be reconciled for every newly accepted read, using the existing B0 gate only where exact schema requires it.

Step 7 must produce one terminal decision for every Seller `method + path` row. At minimum the allowed terminal classes must distinguish:

- accepted/implemented current read;
- current admissible read still requiring implementation;
- mutation/side-effect operation — unavailable;
- server-side generation/creation — unavailable as an ordinary read;
- deprecated/sunset/replaced operation — unavailable in favor of current replacement;
- non-read control/action operation — unavailable;
- any other exact-contract reason that is explicit and reviewable.

Before Step 7 can close:

- all 463 Seller rows must be present exactly once;
- `UNRESOLVED`, `UNKNOWN`, `PENDING`, and unclassified counts must all be zero;
- every implemented/read decision must reconcile to the accepted Step 6 registry and exact Seller contract;
- every newly accepted Personal Data read must attach to the existing B0 gate before provider execution;
- no mutation may be exposed under a read alias;
- no deprecated endpoint may be enabled instead of its current replacement;
- no hidden retry/pagination/polling/fan-out/chaining may be introduced;
- any missing admissible current Seller reads discovered by the 463/463 reconciliation must be implemented deterministically before Step 7 acceptance;
- Linux + Windows evidence and independent artifact verification are required if Step 7 changes production.

No fresh Seller or Performance business API request is authorized for Step 7 research or deterministic validation.
