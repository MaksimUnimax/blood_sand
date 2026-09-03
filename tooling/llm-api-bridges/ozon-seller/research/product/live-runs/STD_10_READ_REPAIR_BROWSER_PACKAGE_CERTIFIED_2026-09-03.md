# STD-10 — READ repair browser runtime certification

Date: 2026-09-03
Branch: `research/ozon-product-demand-2026-09-02`
Status: `CERTIFIED_READY_FOR_OPERATOR_INSTALL_AND_LIVE_STD_10_RESUME`

## Why this evidence exists

STD-10 was blocked after the Step7 terminal-matrix re-audit proved that passive report/document/label/validation generation had been incorrectly rejected from READ coverage. The historical-stock investigation specifically requires `report_placement_by_products_create` (`POST /v1/report/placement/by-products/create`) before the historical baseline can be declared unavailable.

The repair was first certified on `repair/ozon-read-effect-reclassification-2026-09-02`, then ported into the product-demand research lineage without merging the two heavily diverged branches.

## Repair authority

- repair closure commit: `72c5e972b2b122231509ce8e9199c341fd60f5f4`
- certified installable nodebundle commit in repair lineage: `8e0a4707ba437318bcf2e0034a6f697b048504b0`
- deterministic repaired nodebundle SHA-256: `0f3d7d4f230e579d2c3fe6d9f831f67c819bab285449a2ffd9c7de21b5cab6c0`

## Targeted research port

- runtime port commit: `81f5a71a2ae416a4ffc23e63f79c061237e3ad73`
- browser package workflow/gates commit: `4d2de7dce389ef4343e6c243c0824853f566dfe8`
- classifier provenance correction commit: `c6e8bfa63e165020ab58225f86fbd44a156c1588`
- package certification trigger/provenance commit: `6941a4207d89be8ff152b49196fff433f7c2a785`

The port copied the exact certified blobs for:

- `dist-step7-candidate/shared/ozon_operation_registry.js`
- `dist-step7-candidate/shared/ozon_contract.js`
- `dist-step7-candidate/shared/ozon_entitlements.js`
- `dist-step7-candidate/shared/ozon_provider.js`
- `dist-step7-candidate/shared/provider_transport_core.js`
- `dist/ozon-seller-mcp-nodebundle.js`
- the exact repair validation gates
- the repaired `build_ozon_seller_step7_terminal_matrix.py` classifier.

## Browser package CI

Workflow:
`.github/workflows/ozon-research-browser-extension-package.yml`

First run:
`33706796136` — expected FAIL after runtime partition reached `seller_enabled_reads=271`; it exposed that the old research classifier had not yet been ported. No package was certified from this run.

Corrected certification run:
`33706932929`

Result:

- Ubuntu syntax-check: PASS
- Ubuntu repaired READ gates: PASS
- Ubuntu deterministic browser ZIP: PASS
- Windows syntax-check: PASS
- Windows repaired READ gates: PASS
- Windows deterministic browser ZIP: PASS
- cross-platform ZIP byte identity: PASS
- cross-platform package manifest identity: PASS
- canonical certified artifact upload: PASS

## Certified browser artifact

Action artifact id:
`9875538634`

Artifact name:
`ozon-research-browser-extension-certified`

Inner installable Chrome extension ZIP:
`OZON_BRIDGE_v0.1.19_READ_EFFECT_REPAIR_RESEARCH_CERTIFIED.zip`

Inner ZIP bytes:
`208675`

Inner ZIP SHA-256:
`449eea7c4885e4ad22c959562168f3d1d00f63f20481b517868a29c18772a2d1`

Package manifest schema:
`OZON_RESEARCH_BROWSER_EXTENSION_PACKAGE_V1`

Manifest acceptance fields:

- `status = PASS`
- `seller_enabled_reads = 271`
- `exact_repaired_read_schemas = 26`
- `all_26_repaired_reads_e2e = true`
- `source_commit = 6941a4207d89be8ff152b49196fff433f7c2a785`

## Exact next capability now available

`report_placement_by_products_create`

Provider request:
`POST /v1/report/placement/by-products/create`

Exact request schema:

- `date_from`: `YYYY-MM-DD`, required
- `date_to`: `YYYY-MM-DD`, required
- maximum accepted window in the repaired Bridge: 31 calendar days inclusive.

For STD-10 historical reconstruction the next live request should create the August 2026 report using `date_from=2026-08-01`, `date_to=2026-08-31` so the result can be inspected across the pre-incident and post-incident period rather than sampling a single date.

The create call is only the first READ step. If it succeeds, follow the explicit async chain one read at a time: create -> `report_info` -> opaque `report_file_ref` -> `report_file_get`. Do not infer historical stock or fire loss from the report-creation acknowledgement itself.

## Gate decision

`STD_10_READ_CLASSIFICATION_BLOCK_REMOVED_AFTER_CERTIFIED_BROWSER_RUNTIME`

This does not close STD-10. It only removes the runtime-capability blocker. The historical placement report must still be executed and its actual rows inspected under `NO_SKIP_ON_FAILURE` before a damage/loss conclusion is made.
