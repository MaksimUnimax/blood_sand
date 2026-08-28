# Ozon B1–B49 → V2 roadmap reconciliation

Date: 2026-08-28  
Status: `B1_B49_V2_RECONCILIATION_COMPLETE`  
Production changes: **none**  
B50: **BLOCKED / NOT STARTED**

## 1. Authority

This audit uses the later 2026-08-25 global Seller implementation authority, not the older account-role freeze and not the contract-extraction queues:

1. `OZON_BRIDGE_FULL_READ_DYNAMIC_ENTITLEMENTS_AND_CLUSTERS_SPEC_2026-08-25.md`
2. `OZON_BRIDGE_TARGET_READ_SURFACE_2026-08-25.json` (`OZON_BRIDGE_TARGET_READ_SURFACE_V2`)
3. exact Seller Swagger/OpenAPI snapshot: 3,933,043 bytes, SHA-256 `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`, OpenAPI 3.0.0, 463 paths/operations.

The older 303-role/231-method material is historical account/key evidence only. The later correction explicitly says it is not global implementation authority.

Both implementation contract queues were research/extraction queues, not implementation plans. In particular `OZON_IMPLEMENTATION_CONTRACT_QUEUE_V2_2026-08-26.json` says `implementation_allowed: false`.

## 2. Fixed V2 implementation order

The authoritative V2 roadmap fixes these phases and says classification/clusters must not be redesigned between batches:

- B0 — registry compiler + metadata foundation; full 463-operation terminal classification; zero unclassified; entitlement registry; metadata updater/LKG; no business coverage expansion.
- B1 — `stocks_inventory` + `warehouse_logistics`.
- B2 — `catalog_products`.
- B3 — `sales_analytics` + `search_visibility` + `prices_promotions`.
- B4 — `orders_postings` + `supplies_fbo`.
- B5 — `returns_cancellations` + `finance`.
- B6 — `reviews_questions` + `account_access`.
- B7 — explicit observational report/document workflows; explicit status/retrieval; no hidden polling/retry/download-to-model-text.
- B8 — positive privacy projections for useful `READ_PII_PROJECTION_REQUIRED` operations.

Performance remains a separate provider cluster and is outside Seller Swagger/roles accounting.

## 3. Status definitions

- `KEEP` — technically valid work already belongs to the correct V2 phase, or is valid zero-production terminal/currentness evidence. KEEP does not by itself prove that the phase is complete.
- `MOVE` — technically useful/validated work, but it was numbered/executed outside the V2 phase where its fixed business cluster belongs. Preserve the implementation while rebuilding the canonical phase lineage.
- `REWORK` — the batch mixes V2 phases, uses an unauthorized taxonomy, or contains privacy-bearing operations that cannot be accepted as-is under V2 B8. Split/reclassify/re-project before canonical acceptance.
- `DROP` — remove from the Seller roadmap lineage. This does not mean delete otherwise-valid separate-provider work.

## 4. B1–B49 reconciliation

| Actual batch | Actual scope | Verdict | Canonical V2 destination/action |
| --- | --- | --- | --- |
| B1 | Assortment Master | MOVE | B2 `catalog_products` |
| B2 | Prices / Listing State | MOVE | B3 `prices_promotions` |
| B3 | Warehouse / Stock Geography | MOVE | B1 `stocks_inventory` + `warehouse_logistics` |
| B4 | Orders + Returns + Cancellations | REWORK | Split: orders/postings → B4; returns/cancellations → B5; preserve validated contracts |
| B5 | Finance / Realization | KEEP | B5 `finance`; valid delta, but not proof that all B5 finance/returns reads are complete |
| B6 | Performance API Read Core | DROP | Drop **from Seller lineage only**; preserve as separately gated `advertising_performance` provider work |
| B7 | Analytics / Search | MOVE | B3 `sales_analytics` + `search_visibility`; preserve the entitlement-parser fix |
| B8 | Supply / Replenishment | MOVE | B4 `supplies_fbo` |
| B9 | Reviews / Questions | REWORK | B6 for aggregate/content family placement; free-text/author-bearing reads remain behind B8 positive-projection acceptance |
| B10 | Seller Health / Ratings | REWORK | Valid reads require reassignment by the B0/V2 compiler into existing fixed clusters; remove unauthorized top-level `seller_health` taxonomy |
| B11 | Catalog Diagnostics / Content | MOVE | B2 `catalog_products` |
| B12 | Finance Transactions Sunset | KEEP | Keep zero-production deprecation/currentness closure as B0/B5 audit evidence; not a new roadmap phase |
| B13 | Promotions Market Reads | MOVE | B3 `prices_promotions` |
| B14 | Pricing Strategy Reads | MOVE | B3 `prices_promotions` |
| B15 | Catalog Reference Reads | MOVE | B2 `catalog_products` |
| B16 | Warehouse / Delivery Diagnostics | MOVE | B1 `warehouse_logistics` |
| B17 | Reviews / Questions Extended | REWORK | Safe aggregate reads → B6; free-text/author-name reads → B8 projection work before enablement |
| B18 | Pricing Strategy Extended Reads | MOVE | B3 `prices_promotions` |
| B19 | Catalog Certification Reference Reads | MOVE | B2 `catalog_products` |
| B20 | Catalog Certificate Data Reads | MOVE | B2 `catalog_products` |
| B21 | Return Giveout Reads | MOVE | B5 `returns_cancellations`; barcode/PDF/PNG/reset exclusions remain preserved |
| B22 | Cancellation Reason Reads | MOVE | B5 `returns_cancellations` |
| B23 | Seller Account / Ozon Logistics | MOVE | B6 `account_access` |
| B24 | FBO Supply Status / Act Reads | MOVE | B4 `supplies_fbo`; keep explicit caller-supplied operation IDs and no polling |
| B25 | Safe Reference / Settings No-Body Reads | REWORK | Split: warehouse reads → B1; certification → B2; return/cancel settings → B5 |
| B26 | FBO Draft Cargo Reads | MOVE | B4 `supplies_fbo` |
| B27 | FBO Draft Location Planning Reads | MOVE | B4 `supplies_fbo` |
| B28 | FBO Transport Cargo Reads | MOVE | B4 `supplies_fbo` |
| B29 | Product Stock Reads | MOVE | B1 `stocks_inventory` |
| B30 | FBS Delivery / Assembly Reads | MOVE | B4 `orders_postings` |
| B31 | FBS Carriage / Container Reads | MOVE | B4 `orders_postings` |
| B32 | FBS Operational Reference Reads | REWORK | Split: posting/act reference reads → B4; return-mile warehouse logistics → B1 |
| B33 | Operational Status / Reference Reads | REWORK | Split by fixed registry assignment across B1 warehouse, B2 catalog, and B4 order/supply families |
| B34 | Stock Analytics Extended Reads | MOVE | B1 `stocks_inventory` |
| B35 | Marketplace Search Query Reads | MOVE | B3 `search_visibility` |
| B36 | FBP Planning Reads | MOVE | B4 `orders_postings` |
| B37 | FBO Removal List Reads | MOVE | B5 `returns_cancellations`; these are direct single reads, not B7 async report workflows |
| B38 | Finance Ledger Reads | MOVE | B5 `finance` |
| B39 | FBS Pickup Geography Reads | MOVE | B1 `warehouse_logistics` |
| B40 | Finance Balance / Realization Reads | MOVE | B5 `finance` |
| B41 | Finance Buyout Read | MOVE | B5 `finance` |
| B42 | FBS Warehouse Setup Reference Reads | MOVE | B1 `warehouse_logistics` |
| B43 | FBP Posting Reads | MOVE | B4 `orders_postings` |
| B44 | FBO Posting Get | MOVE | B4 `orders_postings`; preserve accepted projection that removes sensitive legal/digital-code fields |
| B45 | Seller Action Candidates | MOVE | B3 `prices_promotions` |
| B46 | FBS Posting Cancel Reason | MOVE | B5 `returns_cancellations` |
| B47 | Unpaid Legal Products | MOVE | B4 `orders_postings`; exact accepted response contains product fields/cursor, not buyer/company identity |
| B48 | FBO Draft Timeslot Info | MOVE | B4 `supplies_fbo` |
| B49 | FBS Posting Timeslot Change Restrictions | MOVE | B4 `orders_postings` |

Reconciliation totals:

- `KEEP = 2`
- `MOVE = 39`
- `REWORK = 7`
- `DROP = 1`
- total = `49`

## 5. Proven first divergence and root cause

Accepted B0 is the last clean roadmap authority before the numbering/scope drift:

- accepted B0 commit: `3795359959c965fc5cd1837b9a1c978493ae2ac5`
- accepted B0 production tree: `d313bcfdb7597e8ffc9593120f807c64ed9bd4952f6c07a69368361c3435ccfe`

The first actual post-B0 batch was B1 Assortment Master, but V2 B1 requires stocks + warehouse logistics. Therefore the first implementation-order divergence starts immediately after accepted B0.

The root process error was treating contract-extraction priority queues as implementation roadmaps. The later post-B9 queue repeats the same warning explicitly: `implementation_allowed: false`.

## 6. Required missing work before any new endpoint expansion

### MISSING-1 — canonical phase completion audit

Rebuild a machine reconciliation of the full 463-operation Swagger against the canonical tree and prove for every current operation exactly one terminal class:

- `READ_SAFE`
- `READ_WORKFLOW`
- `READ_PII_PROJECTION_REQUIRED`
- `MUTATION_BLOCKED`
- `DEPRECATED_REPLACED`
- `CONTRACT_UNRESOLVED`

Release gate: zero `PENDING`, zero `UNCLASSIFIED`.

The fact that many B1–B49 deltas passed CI does not prove that V2 B1–B6 each contain **all** safe current reads in their assigned clusters.

### MISSING-2 — real V2 B7 report/document workflow stage

A systematic B7 was never completed. Several old batches intentionally excluded report creation/workflow contours, and the post-B9 research queue explicitly excluded async report creation. That policy cannot substitute for V2 B7.

Canonical B7 must classify and implement only observational workflows that V2 permits, with explicit separate commands for create/status/retrieval where applicable, no hidden polling/retry/fanout, and binary/file results represented as file/artifact metadata rather than silently downloaded into model text.

Direct list reads whose names contain “report” do not count as B7 workflow completion.

### MISSING-3 — real V2 B8 positive privacy projections

B9/B17 correctly noticed free text/author-name risk and kept those surfaces behind an operator personal-data gate, but that is not the V2 B8 completion rule.

For each useful `READ_PII_PROJECTION_REQUIRED` operation, B8 must enumerate exact response fields and define/test a **positive allowlist**. Raw PII-bearing payloads must remain disabled until that projection is accepted. Synthetic fixtures must prove forbidden fields cannot escape through result, diagnostics, cache/history, or delivery paths.

### MISSING-4 — taxonomy repair

At least B10 introduced top-level cluster `seller_health`, which is not one of the fixed 12 Seller V2 business clusters. Re-run the B0 registry compiler over the canonical set and reject any non-V2 top-level Seller cluster rather than carrying ad-hoc taxonomy forward.

### MISSING-5 — queue/roadmap separation

Contract queues remain evidence/research inputs only. Their priority order must never again advance production merely because a gap appears next. Implementation order comes from the V2 spec and machine registry classification.

### MISSING-6 — orphan branch quarantine

Two duplicate-number branches diverged at B24 and are not part of the accepted B49 lineage:

- `feature/ozon-b25-cancellation-read-completion-2026-08-28`
- `feature/ozon-b26-fbo-posting-detail-read-2026-08-28`

The accepted B49 lineage instead uses:

- B25 `feature/ozon-b25-safe-reference-settings-no-body-reads-2026-08-28`
- B26 `feature/ozon-b26-fbo-draft-cargo-reads-2026-08-28`

Do not accidentally reintroduce the orphan deltas during repair.

## 7. Corrective lineage

The safest canonical repair base is accepted B0:

`3795359959c965fc5cd1837b9a1c978493ae2ac5`

Reason:

- B0 is the accepted V2 foundation;
- its acceptance explicitly gates subsequent B1–B8 work;
- the first roadmap scope divergence begins immediately after B0;
- B49 is useful as a salvage/reference source for validated contracts, but should not be the semantic authority for canonical phase ordering/taxonomy.

Repair strategy:

1. branch from accepted B0;
2. regenerate the full 463-operation terminal manifest and fixed V2 cluster assignment;
3. replay/rebuild only validated production deltas from `KEEP`/`MOVE` rows into their canonical B1–B6 phase groups;
4. split every `REWORK` batch by fixed cluster and privacy class;
5. omit B6 Performance from Seller lineage while preserving it as separate Performance-provider work;
6. complete V2 B7 workflows;
7. complete V2 B8 positive privacy projections;
8. run final full-463 zero-unclassified gate plus protected-runtime/regression/CI validation;
9. only after that may a new Seller coverage batch be considered.

Do **not** blindly cherry-pick the recursive validation commits from B1–B49 into the repair branch. Their evidence remains useful, but their batch ordering and some taxonomy/privacy assumptions are precisely what this reconciliation invalidates.

## 8. Stop gate

`B50_BLOCKED`

No B50 endpoint selection, gap hunting, production patch, provider request, or new coverage batch is authorized until the reconciliation repair above is completed and accepted.

Seller business requests during this reconciliation: `0`  
Performance business requests during this reconciliation: `0`  
Credentials used during this reconciliation: `0`  
Production files modified by this reconciliation: `0`
