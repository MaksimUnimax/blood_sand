# Ozon Seller READ-effect repair checkpoint — 2026-09-02

## Pause state

**PAUSED BY OPERATOR. Do not continue until an explicit command to resume.**

Checkpoint marker:

`OZON_READ_EFFECT_REPAIR_PAUSED_AFTER_26_E2E_GATE_ADDED_BEFORE_WORKFLOW_WIRING`

Branch:

`repair/ozon-read-effect-reclassification-2026-09-02`

Checkpoint source HEAD before this documentation commit:

`b6911ce7e787ccacdeffc16d8ce24e9eb2f1ef10`

That commit added the full mock end-to-end runner for all 26 repaired READ operations. The runner exists but is **not yet wired into the GitHub Actions workflow**, so it has not yet been executed by CI. Do not claim 26/26 E2E gate PASS until that happens.

## Governing semantic rule

An operation is `READ` when it does not modify Seller/Ozon business/account data or business-process state. Passive generation of a report, label, PDF or validation result is treated as READ when the operation only materializes a representation of existing state and does not create/update/delete business state.

## Current repaired surface

Current registry partition verified by CI:

- registry aliases: **297** including one internal report-file helper;
- Seller enabled READ aliases: **271**;
- Seller current READ aliases: **269**;
- Seller beta READ aliases: **2**;
- Performance enabled READ aliases: **25**;
- internal `report_file_get`: **1**.

The 26 newly repaired Seller READ aliases are:

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

The 26 operations were changed from rejected/server-side-generation classification into executable Seller READ operations, with entitlements and contract mappings.

### 2. Opaque report-file workflow

Implemented internal `report_file_get`:

- `report_info.file` is redacted from GPT-visible output;
- raw signed Ozon URL is stored only in provider session state;
- GPT receives an opaque `rpf_*` reference;
- URL-backed file reads use one explicit trusted HTTPS GET;
- Seller credentials are never forwarded to the file host;
- only trusted Ozon/Ozone HTTPS hosts are accepted;
- unknown/expired refs fail before network execution.

Key fix:

- `report_file_get` uses provider `report_file`, request style `opaque_file_ref`;
- it is exempted from the normal Seller GET/query-builder rule while `report_file` itself is restricted to `opaque_file_ref`.

### 3. AI-readable CSV/XLSX/ZIP report ingestion

Implemented pure-JS parser inside the bridge:

- CSV -> `columns + rows + row_count + has_more + next_offset`;
- XLSX -> OOXML ZIP reader, workbook/sharedStrings/sheets parsing;
- ZIP containing CSV/XLSX supported;
- bounded `sheet`, `offset`, `limit` parameters;
- unsupported formats fail closed;
- report bytes/base64 are not exposed to GPT.

### 4. Generated document/PDF delivery

Implemented safe delivery for generated labels/acts/documents:

- status/get endpoints returning `file_url`, `cdn_url`, or `label_url` redact those URLs;
- GPT receives `generated_file_ref`;
- `report_file_get` resolves that opaque ref and returns PDF text/metadata;
- direct Seller PDF endpoints convert returned bytes into an in-memory opaque ref;
- subsequent `report_file_get` on an inline PDF performs **zero** extra network requests;
- `file_content_base64` is removed from GPT-visible output;
- PDF output currently exposes bounded text extraction metadata (`format`, `text_extract_available`, `text_extract`, `text_truncated`).

Covered URL-backed retrieval operations:

- `cargoes_label_get`
- `posting_fbs_package_label_get_v1`
- `cargoes_label_transport_by_order_status`
- `cargoes_label_transport_status`
- `fbp_act_from_get`
- `fbp_act_to_get`
- `fbp_label_get`

Direct PDF operations:

- `posting_fbs_act_container_labels`
- `posting_fbs_package_label`

### 5. Exact Swagger request-schema repair for all 26

The initial repair patch contained several guessed/oversimplified schemas. These were explicitly corrected against the source Swagger.

Corrections include:

- finance report `date` is `YYYY-MM`, not `YYYY-MM-DD`;
- `report_marked_products_sales_create.date` is an object `{from,to}`;
- `report_postings_create.filter` now uses the actual Swagger fields (`sku`, `status_alias`, `statuses`, `title`, `warehouse_id`, `delivery_method_id`, `is_express`, etc.) and removes the invented `status` field;
- `cargoes_label_create.cargoes[]` uses objects with `cargo_id`;
- `posting_fbs_package_label_create.posting_number` is an array;
- `cargoes_transport_label_create.transport_cargo_ids[]` is string-valued and bounded;
- realization report month numeric bound is enforced;
- placement report date format/order and 31-calendar-day limit are enforced.

## CI evidence already green

Latest fully completed CI run before pause:

- workflow run: `33643793664`
- source commit: `b6911ce7e787ccacdeffc16d8ce24e9eb2f1ef10`
- conclusion: **success**
- Ubuntu: success
- Windows: success
- freeze-runtime: success

The run verified:

1. syntax-check repaired runtime;
2. 271 Seller READ surface;
3. exact schemas for all 26 repaired reads;
4. opaque report-file workflow;
5. AI-readable report parser;
6. generated document delivery;
7. deterministic runtime artifact build.

Important limitation: the newly added `run_all_26_e2e_gate.mjs` is not yet invoked by the workflow. Therefore the mock full-chain 26/26 E2E runner is **prepared, not CI-certified**.

## Important commits in this work segment

- `728f89da20a6e4528f85b4fc16df440f2a74a5a4` — exempt opaque internal report-file GET from Seller query-builder rule; CI green.
- `1adf3800285be18b0e60ce9b4719260210e2e5fb` — add AI-readable CSV/XLSX parser source patch.
- `ec231cd266f83dbbc82ae78e2c30795c435c2761` — add deterministic XLSX/CSV parser gate.
- `201ac000422fd70c46a14680553150739661b3bc` — wire report parser into CI.
- `0d00e3a4544f931705cfa80881d7393b67d5e843` — update report-file gate to structured CSV rows; Linux/Windows/freeze green.
- `3755dd6c9d50ef3e00e18ee98913b0892524e498` — add generated-document opaque delivery source patch.
- `cad07572fbbb2e4428cd2fa013e60879be8ef408` — add generated PDF delivery gate.
- `095dccbe02cebe58fe862551336dbf03a3bad243` — wire generated-document delivery into CI.
- `7aabe374ed502f674d7423394e5ff2b151aebef1` — fix final generated-document test assertion.
- `208a8b86cf79d7ef6d150c76913c51c49ee98014` — frozen runtime with generated-document opaque delivery.
- `be3628a414e86ee222f90cace85f688ef5f57449` / `f57faac19135ef5c73a710f54b473afb03cef57e` — exact 26-schema repair source patch and numeric-bound refinement.
- `39d5a0bf8b3b571e635463ddf43599a04e6873aa` — exact 26-schema gate.
- `686a73c982768318094909a0bb6f26a81af64a2f` — wire exact 26-schema gate into CI.
- `883c22d89f9ebc13706e224080e9f7b4757a3752` — complete 26-operation E2E delivery matrix.
- `b6911ce7e787ccacdeffc16d8ce24e9eb2f1ef10` — add full mock `run_all_26_e2e_gate.mjs` runner.

## E2E matrix

Authoritative prepared chain matrix:

`tooling/llm-api-bridges/ozon-seller/validation/read-effect-repair-v1/OZON_SELLER_26_REPAIRED_READ_E2E_MATRIX_2026-09-02.json`

It records for each of the 26 aliases:

- endpoint;
- result class;
- first-call identifier/result;
- exact next READ for async workflows;
- opaque file step where applicable;
- GPT-consumable output shape.

## Exact resume point

On explicit operator command to continue, **do not return to live Ozon product tests yet**.

Resume in this order:

1. Wire `run_all_26_e2e_gate.mjs` into both matrix jobs and `freeze-runtime` in `.github/workflows/ozon-read-effect-repair.yml`.
2. Run Linux + Windows + freeze.
3. If any 26/26 mock chain fails, fix the exact chain/schema/result handling and rerun; do not skip failures.
4. After the full mock 26/26 E2E gate is green, inspect the final frozen runtime and artifact manifest.
5. Update this checkpoint/authority with the final green E2E run IDs and commit SHA.
6. Only then decide whether to merge/port the repair and return to the paused live Ozon primary gate / STD-10 forensic workflow.

## Do not do while paused

- Do not execute more GitHub writes except an explicit operator-requested correction to this checkpoint.
- Do not start or resume live Ozon Seller API tests.
- Do not resume STD-10/STD-12.
- Do not resume the multi-AI workstream.
- Do not claim the final all-26 E2E gate is green until `run_all_26_e2e_gate.mjs` is actually wired and passes on Linux and Windows.
