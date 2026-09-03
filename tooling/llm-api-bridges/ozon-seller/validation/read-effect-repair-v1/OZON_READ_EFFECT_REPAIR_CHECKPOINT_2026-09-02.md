# Ozon Seller READ-effect repair checkpoint — final installable closure

## Status

**CLOSED / CERTIFIED on 2026-09-03.**

The previous pause marker `OZON_READ_EFFECT_REPAIR_PAUSED_AFTER_26_E2E_GATE_ADDED_BEFORE_WORKFLOW_WIRING` is superseded.

Final checkpoint marker:

`OZON_READ_EFFECT_REPAIR_271_READS_26_OF_26_E2E_INSTALLABLE_BUNDLE_CERTIFIED`

Branch:

`repair/ozon-read-effect-reclassification-2026-09-02`

Certified installable HEAD:

`8e0a4707ba437318bcf2e0034a6f697b048504b0`

Commit message:

`freeze(ozon): ship 271-read repaired installable bundle`

Installable path:

`tooling/llm-api-bridges/ozon-seller/dist/ozon-seller-mcp-nodebundle.js`

Git blob SHA at the certified HEAD:

`2d8d0ae6e37bd4a89932b1299f0a6a1bad29461d`

Deterministic bundle SHA-256:

`0f3d7d4f230e579d2c3fe6d9f831f67c819bab285449a2ffd9c7de21b5cab6c0`

Bundle bytes:

`659904`

## Governing semantic rule

An operation is `READ` when it does not modify Seller/Ozon business/account data or business-process state. Passive generation of a report, label, PDF or validation result is treated as READ when the operation only materializes a representation of existing state and does not create/update/delete business state.

## Final repaired surface

Certified registry/runtime partition:

- registry aliases: **297** including one internal report-file helper;
- Seller enabled READ aliases: **271**;
- Seller current READ aliases: **269**;
- Seller beta READ aliases: **2**;
- Performance enabled READ aliases: **25**;
- internal `report_file_get`: **1**;
- exact repaired Seller READ workflows covered end to end: **26 / 26**.

The 26 repaired Seller READ aliases are:

1. `report_products_create`
2. `report_returns_create_v2`
3. `report_postings_create`
4. `report_discounted_create`
5. `report_warehouse_stock`
6. `report_placement_by_products_create`
7. `report_placement_by_supplies_create`
8. `report_marked_products_sales_create`
9. `report_realization_posting_create`
10. `finance_document_b2b_sales`
11. `finance_mutual_settlement_report`
12. `finance_compensation_report`
13. `finance_decompensation_report`
14. `cargoes_label_create`
15. `posting_fbs_act_container_labels`
16. `posting_fbs_package_label`
17. `posting_fbs_package_label_create`
18. `cargoes_transport_label_by_order_create`
19. `cargoes_transport_label_create`
20. `fbp_act_from_create`
21. `fbp_act_to_create`
22. `fbp_label_create`
23. `fbp_draft_direct_product_validate`
24. `fbp_draft_dropoff_product_validate`
25. `fbp_draft_pickup_product_validate`
26. `chat_history_v3`

## Completed implementation layers

### 1. READ reclassification and executable contracts

The 26 operations are executable Seller READ operations with entitlements and contract mappings.

### 2. Opaque report-file workflow

`report_info.file` and generated document URLs are not exposed to GPT. Provider session state stores the trusted URL behind an opaque `rpf_*` reference. `report_file_get` performs the explicit trusted file read. Seller credentials are not forwarded to the file host. Unknown/expired refs fail closed before network execution.

### 3. AI-readable report ingestion

The bridge supports bounded structured ingestion for CSV/XLSX and ZIP containers carrying those formats. GPT-visible output contains structured rows/columns and pagination metadata rather than raw report bytes/base64.

### 4. Generated PDF/document delivery

Generated labels/acts/documents expose opaque refs. Direct Seller PDF responses are kept in memory behind an opaque ref. `report_file_get` returns bounded PDF text/metadata without `file_content_base64`.

### 5. Exact request-schema repair

All 26 repaired operations have explicit request-shape tests. Prior guessed schemas were corrected against the source Swagger, including finance month formats, marked-products date objects, postings filters, cargo payloads, package-label arrays, transport cargo identifiers and placement date-window constraints.

### 6. Full 26/26 E2E gate

`run_all_26_e2e_gate.mjs` is wired into the read-effect CI and passes on Linux, Windows and the frozen runtime. It covers:

- 13 report workflows through create -> report_info -> opaque ref -> structured file read;
- 2 direct PDF workflows;
- 7 async generated-document workflows;
- 3 validation READs;
- `chat_history_v3` with personal-data gating.

### 7. Installable nodebundle packaging boundary

The previous packaging gap is closed.

Before closure, `dist-step7-candidate/shared/*` contained the repaired runtime while `dist/ozon-seller-mcp-nodebundle.js` still contained the older embedded shared sections. Step9 treated the existing bundle as an input and therefore did not guarantee that the installable bundle matched the repaired candidate.

Added deterministic materializer:

`tooling/llm-api-bridges/ozon-seller/validation/read-effect-repair-v1/materialize_installable_nodebundle.py`

It preserves the existing nodebundle bootstrap/stdio shell and replaces the explicitly delimited `/* BEGIN shared/... */` / `/* END shared/... */` runtime sections from the frozen authoritative `dist-step7-candidate/shared` sources. It normalizes LF output, verifies marker uniqueness/order, requires all repaired sections and emits a deterministic manifest.

Added bundle-level wrapper gate:

`tooling/llm-api-bridges/ozon-seller/validation/read-effect-repair-v1/run_installable_bundle_26_e2e_gate.mjs`

The wrapper extracts the shared runtime sections actually embedded in the installable bundle, verifies the repaired sections are byte-equivalent to the frozen candidate, and executes the existing `run_all_26_e2e_gate.mjs` against those extracted bundle sections. Candidate and installable bundle therefore use the same 26-workflow acceptance logic.

Added packaging CI:

`.github/workflows/ozon-read-effect-packaging.yml`

The workflow requires:

1. deterministic nodebundle materialization;
2. Node syntax PASS;
3. candidate 26/26 E2E PASS;
4. installable-bundle 26/26 E2E PASS using the same gate;
5. deterministic fixed-point PASS;
6. Linux artifact PASS;
7. Windows artifact PASS;
8. byte-identical Linux/Windows bundle and manifest;
9. repository `dist` rematerialization identical to both platform artifacts;
10. final bundle-level 26/26 PASS before committing `dist`.

## Final packaging CI evidence

Packaging source commit:

`ae4842aa032f0f62622edea3e72130669bbf63bb`

Workflow run:

`33706019796`

Conclusion:

**SUCCESS**

Platform/freeze result:

- Ubuntu build-and-test: **PASS**
- Windows build-and-test: **PASS**
- deterministic fixed-point: **PASS** on both platforms
- Linux/Windows internal bundle bytes: **IDENTICAL**
- Linux/Windows materialization manifests: **IDENTICAL**
- repository freeze materialization: **PASS**
- final installable-bundle 26/26 gate: **PASS**
- certified `dist` commit: **PASS**

Materialization manifest recorded:

- `section_count = 7`
- `changed_section_count = 5`
- `output_bytes = 659904`
- `output_sha256 = 0f3d7d4f230e579d2c3fe6d9f831f67c819bab285449a2ffd9c7de21b5cab6c0`
- `stdio_shell_preserved = true`
- line endings: `LF`

Exactly five embedded sections changed from the old installable bundle:

- `shared/ozon_contract.js`
- `shared/ozon_entitlements.js`
- `shared/ozon_operation_registry.js`
- `shared/ozon_provider.js`
- `shared/provider_transport_core.js`

The unchanged embedded sections were also rematerialized/verified from the authoritative candidate:

- `shared/runtime_names.js`
- `shared/ozon_credentials.js`

The old installable template was 589363 bytes with SHA-256 `b961f7b0b7c080dfa13df197acdfd4e38b69dc3e6ff5141d696828274a242947`.

## Important commits in the closure segment

- `c012326d855b1a57ce83c9a839ac191545cdde8b` — wire full 26-read E2E gate into Linux/Windows/freeze CI.
- `ae4842aa032f0f62622edea3e72130669bbf63bb` — add deterministic installable materializer, bundle 26/26 wrapper gate and cross-platform packaging workflow.
- `8e0a4707ba437318bcf2e0034a6f697b048504b0` — freeze and ship the certified 271-read repaired installable nodebundle.

## Authoritative 26-operation E2E matrix

`tooling/llm-api-bridges/ozon-seller/validation/read-effect-repair-v1/OZON_SELLER_26_REPAIRED_READ_E2E_MATRIX_2026-09-02.json`

It records endpoint, result class, first-call identifier/result, exact next READ for async workflows, opaque file step where applicable and GPT-consumable output shape.

## Repair decision

The READ-effect repair is now complete at all three relevant boundaries:

1. **candidate/frozen shared runtime — certified**;
2. **cross-platform generated runtime artifact — certified**;
3. **actual installable `dist/ozon-seller-mcp-nodebundle.js` — certified and committed**.

Do not reopen this repair merely because the historical Step9 workflow accepted an already-existing bundle as input. That packaging gap is now covered by the dedicated deterministic installable packaging workflow.

## Next project resume point

The repair branch itself needs no further functional work before returning to product validation.

Next project action after this checkpoint:

1. return to the paused Ozon product-demand primary gate;
2. rebase/port/use the certified repaired installable runtime as required by the test environment;
3. resume the previously paused STD-10 historical stock/damage forensic investigation from its authoritative checkpoint;
4. preserve `NO_SKIP_ON_FAILURE` and one explicit Ozon business request at a time;
5. keep STD-12 paused until STD-10 is closed.

Do not resume the separate multi-AI workstream as part of this handoff.
