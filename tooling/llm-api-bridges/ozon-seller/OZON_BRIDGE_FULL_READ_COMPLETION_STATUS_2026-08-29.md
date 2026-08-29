# Ozon Bridge full-read completion — current status

Date: 2026-08-29  
Status authority after canonical B1 acceptance, full 463+48 operation-inventory acceptance, and canonical B1–B49 salvage acceptance.

## Current roadmap

1. ✅ Закрепить исправленную базу и formal acceptance canonical B1.
2. ✅ Построить master-checklist всех 463 Seller + 48 Performance операций.
3. ✅ Восстановить полезный Seller read-набор из принятой работы B1–B49 по правильным разделам.
4. 🔄 Проверить существующий Personal Data gate на всём Seller read-наборе.
5. ⬜ Реализовать все допустимые Seller read-workflow/report/document операции.
6. ⬜ Завершить Performance API coverage по всем 48 операциям.
7. ⬜ Финальная полнота Seller: 463/463 имеют окончательное решение.
8. ⬜ Финальная полнота Performance: 48/48 имеют окончательное решение.
9. ⬜ Полная интеграционная проверка расширения.
10. ⬜ Release acceptance и финальный installable artifact.

Финальный маркер всей работы остаётся:

`FULL_OZON_READ_COVERAGE_ACCEPTED`

## Step 1 — closed

Canonical V2 B1 `stocks_inventory + warehouse_logistics` formally accepted by:

`validation/PATCH_V2_B1_STOCKS_WAREHOUSE_ACCEPTED_2026-08-29.md`

Accepted production candidate:

`10260c0c672cebd6cdb0a42cb4568bf87f9ca3c7`

Acceptance confirms:

- 30 Seller reads = 6 `stocks_inventory` + 24 `warehouse_logistics`;
- 21 production files / 18 JavaScript files;
- production tree SHA-256 `c007f650cb46c0575561532d11a2aa4355f650dfb37be4396c6e8065c1f3276f`;
- GitHub Actions run `33227432407`: Linux PASS + Windows PASS;
- CI artifact `9707334603` independently downloaded and verified;
- artifact digest `sha256:01d27dc568a6e966e2bb581a0178e9f59719b6297ffc0fc2282ca0946be3fd2c`;
- no fresh Seller/Performance business requests;
- no credentials;
- no production modification during acceptance.

## Step 2 — closed

Formal acceptance:

`validation/OZON_FULL_API_MASTER_CHECKLIST_ACCEPTED_2026-08-29.md`

Generated checklist authority:

- `validation/OZON_FULL_API_MASTER_CHECKLIST_2026-08-29.json`
- `validation/OZON_FULL_API_MASTER_CHECKLIST_2026-08-29.csv`
- `validation/OZON_FULL_API_MASTER_CHECKLIST_SUMMARY_2026-08-29.md`

Final generated checklist commit:

`92f3bd62de00ebaf955c4addc0af662f110dc74b`

Final CI run:

`33234410533` — PASS.

Accepted inventory counts:

- Seller: 463 current API rows;
- Performance: 48 current API rows across 47 paths;
- total current API rows: 511;
- current canonical registry aliases at Step 2: 42;
- current registry rows matching current API inventory at Step 2: 39;
- preserved compatibility routes outside current Performance inventory: 3;
- rows still requiring semantic/exact-schema classification at Step 2: 472.

The three preserved compatibility routes are:

- `performance_campaign_product` → `GET /api/client/statistics/campaign/product/json`;
- `performance_daily` → `GET /api/client/statistics/daily/json`;
- `performance_expense` → `GET /api/client/statistics/expense/json`.

They remain accepted compatibility routes but are not counted as additional current Performance Swagger operations.

Exact project contract identities remain authoritative:

Seller:

- 3,933,043 bytes;
- SHA-256 `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`;
- OpenAPI 3.0.0;
- 463 operations.

Performance:

- 304,771 bytes;
- SHA-256 `7436e4a3e40b4d5bf926a887d7891c1db264cbb6582266299a2df10f67592fec`;
- OpenAPI 3.0.0;
- 47 paths / 48 operations.

The pinned GitHub operation indexes are used as complete `method + path + purpose` inventory only. Their bundled mirror OpenAPI JSON is not treated as byte-identical schema authority. Exact request/response, deprecation, workflow, privacy, entitlement and safety decisions must still be reconciled against accepted exact-Swagger evidence before final classification or implementation.

No `UNRESOLVED` row is allowed to remain at the final Seller/Performance completeness gates.

## Correct interpretation of the old B1–B49 reconciliation

The old reconciliation remains useful for locating salvageable implementation and understanding the ordering failure, but two conclusions are superseded by the later full-read completion roadmap.

### Personal Data correction

Do not treat accepted B9/B17 as automatically defective merely because review/question responses can contain personal data.

Accepted B0 already defines the Personal Data gate:

- OFF blocks before provider execution and produces zero physical business requests;
- enabling the setting does not replay the blocked command;
- ON requires an explicit resubmit;
- the explicit resubmit may execute the allowed read.

Accepted B9 keeps `review_list`, `review_info`, and `question_list` behind that existing gate. Accepted B17 preserves the same gate for extended review/question reads. These implementations remain valid salvage/reference material.

Step 4 verifies that every Seller operation that needs Personal Data is correctly attached to this existing gate. Do not invent a replacement privacy mechanism merely because an operation can return personal data.

### Performance correction

Do not drop Performance API from the product completion goal.

Accepted Performance B6 is valid separate-provider work. It used the exact Performance Swagger identity above and accepted a Performance Read Core, but it did not prove full 48/48 coverage.

Step 6 must complete all admissible Performance reads/read-workflows; Step 8 must give all 48 operations terminal decisions.

## Where the old work actually went wrong

Accepted B0 was the last clean roadmap base. The first post-B0 implementation batch already diverged from the fixed V2 order: old B1 implemented catalogue assortment while canonical V2 B1 was stocks + warehouse logistics.

The process failure was not that all B1–B49 code was useless. Much of it is validated read-contract work. The failure was using research/contract-gap queues as an implementation roadmap and assigning each next discovered gap a new B-number.

Consequences:

- useful implementations landed in the wrong canonical phase;
- several batches mixed business domains that must be split;
- an unauthorized top-level Seller taxonomy such as `seller_health` appeared;
- research queues with `implementation_allowed: false` were treated as implementation ordering;
- no final full-contract gate proved every Seller operation had a terminal decision;
- systematic Seller read-workflow/report/document completion was not done;
- full Performance 48/48 completion was not done.

Do not delete B1–B49 wholesale. Use accepted/validated pieces as salvage/reference under the master checklist and fixed canonical business groups.

## Step 3 — closed

Formal acceptance:

`validation/OZON_V2_B1_B49_CANONICAL_SALVAGE_ACCEPTED_2026-08-29.md`

Accepted deterministic package authority:

- package commit `bdcc86305746b0fccdedf567b470fcaeb85a3335`;
- exact validation marker/head `926b08c5d3507a206e4b80f14108146afce93ed6`;
- exact packaged candidate run `33239719039`: Linux PASS + Windows PASS;
- exact artifact `9710978189`;
- exact artifact ZIP SHA-256 `628cb9b9af220ee36202c53f09a9a6dea162bc361786f7aa750f91a8c35370c9`;
- final production tree SHA-256 `ae3f53084d7a9aff5de820503a44b2875ab0c63c6ffc14bf72d941e8d0dab24e`;
- 21 production files / 18 JavaScript files.

Deterministic patch transport:

- `validation/PATCH_V2_B1_B49_CANONICAL_SALVAGE_2026-08-29.patch.gz`;
- gzip SHA-256 `363724a309deb6a03b04c53131108d985e02863f42ada158d0129acd4e8c6c4b`;
- raw patch SHA-256 `6f81a335f13b1a2a673763588e8aca85b1284598ccd6e267ca14beecca02d0bc`;
- manifest `validation/PATCH_V2_B1_B49_CANONICAL_SALVAGE_2026-08-29_MANIFEST.json`;
- materializer `validation/materialize_v2_b1_b49_canonical_salvage_candidate.py`.

Accepted salvage result:

- 42 corrected canonical B1 aliases preserve canonical registry/request/entitlement semantics;
- 191 historical Seller aliases are present;
- 153 historical Seller aliases are salvaged beyond corrected canonical B1;
- 10 accepted historical Performance aliases are preserved as separate-provider carry-forward;
- 201 aliases total in the accepted salvage registry;
- four B10 rating/error-index reads are reclassified into existing fixed `sales_analytics / delivery_returns_cancellations_metrics`;
- unauthorized `seller_health` is absent;
- protected runtime remains byte-identical to corrected canonical B1;
- only `shared/ozon_operation_registry.js`, `shared/ozon_contract.js`, and `shared/ozon_entitlements.js` differ;
- single-command/single-request and catalog validation gates pass;
- no hidden pagination, automatic retry, polling, fanout or chaining was introduced.

Independent verification of both the initial validated artifact and the final exact packaged artifact reproduced the expected ZIP identities, 21/18 file counts, production tree, changed-core hashes, and all 18 JavaScript `node --check` results.

Step 3 does not claim Seller 463/463 completion or Performance 48/48 completion.

No fresh Seller or Performance business API requests were made for salvage or acceptance.

## Step 4 — current action

Current task: audit the already accepted B0 Personal Data gate across the Seller read surface, beginning with the accepted Step 3 exact candidate and controlling the audit against the 463-row Seller master checklist.

The gate behavior itself is not being redesigned. The accepted behavior to preserve is:

- Personal Data OFF blocks before provider execution;
- blocked execution produces zero physical business requests;
- enabling Personal Data does not replay a blocked command;
- explicit resubmit is required after enabling;
- only that explicit resubmit may execute an otherwise allowed read.

Audit requirements:

- identify every accepted/salvaged Seller read whose existing metadata requires the Personal Data gate;
- verify that the runtime gate is actually attached before provider execution for those reads;
- verify that reads not requiring the Personal Data gate are not arbitrarily forced behind a new mechanism;
- preserve accepted B9/B17 review/question behavior;
- map the audit result back to Seller `method + path` rows in the 463-row master checklist;
- distinguish `personal_data_gate` decisions from safe-projection/redaction behavior rather than conflating them;
- record any uncovered operation as an explicit Step 4 audit gap for later classification, not as a new B50/B51 stage.

No fresh Seller or Performance business API requests are authorized for this audit.
