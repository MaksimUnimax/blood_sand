# Canonical V2 B1 Stocks + Warehouse Logistics — ACCEPTED

Date: 2026-08-29  
Status: `PATCH_V2_B1_STOCKS_WAREHOUSE_ACCEPTED`

## Acceptance authority

- Repository: `MaksimUnimax/blood_sand`
- Repair branch before this acceptance: `repair/ozon-v2-b1-stocks-warehouse-2026-08-29`
- Production candidate commit: `10260c0c672cebd6cdb0a42cb4568bf87f9ca3c7`
- Docs-only roadmap commit after candidate: `d216ea6954e407b2ea2cb69482f7eaf782b80b5c`
- Accepted base authority: B0 commit `3795359959c965fc5cd1837b9a1c978493ae2ac5`
- Accepted B0 production tree: `d313bcfdb7597e8ffc9593120f807c64ed9bd4952f6c07a69368361c3435ccfe`
- Exact Seller Swagger identity used by the candidate: 3,933,043 bytes, SHA-256 `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`, OpenAPI 3.0.0, 463 operations.

The `d216ea...` commit was compared directly against `10260c0c...` and changes only:

- `tooling/llm-api-bridges/ozon-seller/OZON_BRIDGE_FULL_READ_COMPLETION_ROADMAP_2026-08-29.md`
- `tooling/llm-api-bridges/ozon-seller/README.md`

No production file changed after the tested B1 candidate.

## Accepted B1 scope

Canonical B1 contains exactly the rebuilt first V2 Seller block:

- `stocks_inventory`: 6 reads;
- `warehouse_logistics`: 24 reads;
- total canonical B1 reads: 30;
- total registry operations on the candidate: 42, including the 12 preserved B0 operations.

This acceptance does not start canonical B2 and does not authorize ad-hoc endpoint expansion.

## Candidate identity

Candidate manifest authority:

- raw patch SHA-256: `5485652cb41ea68d27285ba1678a23a4325037f1909426c933c60bdeabacf11f`;
- gzip patch SHA-256: `e02d68c233067c258b3a115132296a4b25bdd1ab43ed061a030843fbbf475261`;
- production files: `21`;
- production JavaScript files: `18`;
- production tree SHA-256: `c007f650cb46c0575561532d11a2aa4355f650dfb37be4396c6e8065c1f3276f`.

Changed production identities:

- `shared/ozon_operation_registry.js` → `5c957a8766e42df8863dd8320fe48c476a92c3fca9abc28c92c7f28e1d694ed6`
- `shared/ozon_contract.js` → `b48e23ebb0c4ed9d38022500600d2c31c8deb93750b2138f5876ac4087013af2`
- `shared/ozon_entitlements.js` → `e3d6aab926840bb36c6be058bd7550bef0549a2924f4ad6b0c93c6f8e4b6eb2c`
- `service_worker.js` → `a85b0d47b14065266221d9b3fcf3194cbaa78d96ead792fbe20834f8ee7a54a3`

Protected identities independently rechecked on the downloaded CI artifact:

- `content_script.js` → `a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd`
- `popup.js` → `9f6ec207f4bed3bae0de912fca2f3347cc286ced9ca310369f10269400819070`
- `shared/bridge_autorun_model.js` → `c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5`
- `shared/work_session_model.js` → `11e91d850a3d69711fefdaadb6617b825350d9382b9bc55cabdbbc9b255c9855`
- `shared/ozon_provider.js` → `16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b`
- `shared/provider_transport_core.js` → `7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8`
- `shared/manual_controls.js` → `81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e`
- `shared/ozon_guidance.js` → `8de69833524c569bed09d5799479f2a0cd8f1844a2cf5d7d460caa3b1bb74508`
- `shared/runtime_names.js` → `a94bef6a25e83170ded3416bdca39a2921fa67d7a9c93504d001beebebc24a59`

## GitHub Actions acceptance

Exact workflow run: `33227432407`  
Exact workflow head: `10260c0c672cebd6cdb0a42cb4568bf87f9ca3c7`  
Workflow conclusion: `success`

Jobs:

- `linux-materialize`: PASS;
- `windows-materialize`: PASS.

Both jobs verified patch transport identity, exact materialization, accepted B0 base and canonical B1 gates. Linux published the production artifact.

## Independent CI artifact verification

Exact CI artifact:

- artifact id: `9707334603`;
- name: `ozon-v2-b1-stocks-warehouse-candidate`;
- GitHub digest: `sha256:01d27dc568a6e966e2bb581a0178e9f59719b6297ffc0fc2282ca0946be3fd2c`;
- artifact was still unexpired at acceptance time and was downloaded directly from this workflow run.

Independent verification of the downloaded ZIP produced:

- downloaded ZIP SHA-256: `01d27dc568a6e966e2bb581a0178e9f59719b6297ffc0fc2282ca0946be3fd2c` — exact GitHub digest match;
- production file count: `21`;
- production JavaScript file count: `18`;
- computed production tree: `c007f650cb46c0575561532d11a2aa4355f650dfb37be4396c6e8065c1f3276f` — exact manifest match;
- all four changed production identities matched;
- all nine protected identities matched;
- all 18 downloaded production JavaScript files passed `node --check`.

The production-tree calculation used the candidate materializer rule: sorted relative path + NUL + per-file SHA-256 + newline, then SHA-256 of the concatenated manifest.

## Safety / provider boundary

No fresh Seller API business request was made for this acceptance.  
No fresh Performance API business request was made for this acceptance.  
No credentials were used or exposed.  
No production code was modified by this acceptance.

The accepted B1 keeps the protected B0 runtime contract, including:

- fixed provider transport;
- one explicit Bridge command = at most one physical business request;
- no hidden retry, pagination, polling, fan-out or chaining;
- existing Work/Manual/Autorun, delivery/no-replay, provider quota/cache/history and credential isolation semantics.

## Decision

All required identity, CI and independently downloaded artifact evidence matches the canonical B1 candidate.

`PATCH_V2_B1_STOCKS_WAREHOUSE_ACCEPTED`

Roadmap Step 1 is complete. The next and only authorized coverage action is Roadmap Step 2: build the complete master-checklist for all 463 Seller operations and all 48 Performance operations before further endpoint expansion.