# STD-10 REOPENED — historical stock and damage reconstruction

Updated: 2026-09-03
Canonical question: `На складе Ozon был пожар или авария. Был ли там мой товар, что с ним сейчас и что мне нужно контролировать?`
Target warehouse: `САМАРА_РФЦ`, warehouse_id `23128509046000`.
Incident: 2026-08-22, Chapayevsk, Samara region.
Status: `REOPENED_IN_PROGRESS_PLACEMENT_REPORT_CREATED_REPORT_INFO_NEXT`
Rule: `NO_SKIP_ON_FAILURE`

## Why STD-10 remains reopened

The investigation has already established seller exposure to the exact affected warehouse and the current absence of sampled exposed SKUs at Samara, but that is not sufficient to state how many units, if any, were physically destroyed or lost in the incident.

The load-bearing question remains a historical stock-balance reconstruction.

## Correct accounting question

For each SKU that was physically/accountedly present at Samara immediately before the incident, reconstruct:

`pre_incident_stock + inbound_after_incident + returns_to_stock - sales/outbound_postings - removals/utilization - other_explained_outflows - current_stock = unexplained_delta`

Then correlate any unexplained delta with Ozon compensation/write-off evidence.

Interpretation:

- if all pre-incident units are explained by normal movements, there is no evidence of incident loss for those units;
- if an unexplained residual remains and compensation/write-off evidence supports it, that becomes strong damage evidence;
- if the historical baseline still cannot be obtained after the repaired report path is exercised, the result must remain bounded/inferential rather than inventing a burned quantity.

## Proven evidence before the READ repair

### Exact incident warehouse

The exact Ozon warehouse is established as:

- warehouse id: `23128509046000`
- name: `САМАРА_РФЦ`
- Chapayevsk, Samara region.

### Pre-incident seller exposure

A pre-incident `posting_fbo_list` read proved seller FBO flow through the exact affected warehouse immediately before the incident, including sampled SKUs later used for current-state comparison. This proves exposure/flow, not the exact stock balance at the fire time.

### Current sampled-SKU state

Current FBO placement for the sampled exposed SKUs shows zero at Samara while inventory exists elsewhere. This proves current Samara zero for the sampled SKUs, not incident causality.

### Reopened Run5 — compensation transaction check

Operation: `finance_transaction_list_v3`
Window: `2026-08-22..2026-09-02`
Filter: `transaction_type=compensation`
HTTP: `200`
Physical business requests: `1`
External request executed: `true`
Result: `operations=[]`, `page_count=0`, `row_count=0`.

Supported statement:
`NO_FINANCE_TRANSACTION_V3_COMPENSATION_ROWS_2026_08_22_TO_2026_09_02`.

This is negative compensation evidence only. It does not prove zero physical loss or zero future compensation.

### Reopened Run6 / Run6B — formal removal/utilization report

`removal_from_stock_list` for `2026-08-22..2026-09-02` was traversed to terminal continuation.

The complete accessible report contained one Habarovsk row and no Samara rows.

Supported statement:
`NO_FORMAL_FBO_REMOVAL_OR_UTILIZATION_ROWS_FROM_SAMARA_IN_2026_08_22_TO_2026_09_02_REPORT`.

Therefore formal removal/utilization does not explain current Samara zero in the tested post-incident window. This still does not prove destruction.

### Reopened Runs7–9 — complete post-incident Samara FBO posting windows

The post-incident period was split into explicit local-Samara windows and read with `posting_fbo_list`.

Across Runs7–9 there were zero postings attributed to:

- warehouse id `23128509046000`; or
- warehouse name `САМАРА_РФЦ`.

Supported statement:
`NO_SAMARA_FBO_POSTINGS_IN_TESTED_POSTINCIDENT_2026_08_22_TO_2026_09_02_WINDOWS`.

Therefore ordinary FBO outbound postings do not explain current sampled-SKU Samara zero during the tested post-incident period.

### Reopened Run10 — existing report inventory

`report_list` returned:

- `reports=[]`
- `total=0`.

That means no already-existing report was available through the list surface for direct reuse.

It did **not** justify declaring the historical baseline unavailable, because the then-current READ registry had incorrectly excluded passive report creation workflows.

## READ-classification blocker and repair

The Step7 terminal-matrix re-audit found a generic false-negative rule that treated server-side report/document/label/validation generation as non-READ even where the operation only materialized existing business state.

At least 26 false-negative Seller READ aliases were confirmed, including the load-bearing historical investigation surface:

`report_placement_by_products_create` -> `POST /v1/report/placement/by-products/create`.

The repair is certified and ported into the research lineage.

Repair authority closure:
`72c5e972b2b122231509ce8e9199c341fd60f5f4`

Research runtime port:
`81f5a71a2ae416a4ffc23e63f79c061237e3ad73`

Repaired classifier port:
`c6e8bfa63e165020ab58225f86fbd44a156c1588`

Browser-package certification run:
`33706932929`

Certified browser package:
`OZON_BRIDGE_v0.1.19_READ_EFFECT_REPAIR_RESEARCH_CERTIFIED.zip`

Package SHA-256:
`449eea7c4885e4ad22c959562168f3d1d00f63f20481b517868a29c18772a2d1`

Certified repaired surface:

- Seller enabled READ aliases: `271`
- exact repaired READ schemas: `26`
- repaired workflows E2E: `26/26`
- Ubuntu: PASS
- Windows: PASS
- deterministic cross-platform browser ZIP identity: PASS.

Detailed certification evidence:
`live-runs/STD_10_READ_REPAIR_BROWSER_PACKAGE_CERTIFIED_2026-09-03.md`.

## Reopened Run11 — live placement-by-products report creation

The repaired capability has now been exercised against the real Ozon Seller API.

Operation:
`report_placement_by_products_create`

Requested window:
`2026-08-01..2026-08-31`

Execution evidence:

- bridge version: `0.1.19`
- request id: `02abef62-83d6-4333-a2dd-813cf2f947fc`
- query planner: `complete`
- logical business results: `1`
- physical business requests: `1`
- external request executed: `true`
- HTTP: `200`
- elapsed: `346 ms`
- entitlement: `SUPPORTED_AND_ENTITLED`
- entitlement reason: `all_accounts`
- exact request preserved: `true`
- command transformed: `false`
- command fingerprint: `973a081a`.

Ozon accepted the historical placement report request and returned:

`REPORT_seller_placement_by_products_2093109_1788402580_01a06519-bba3-7a6b-84b6-6ac5e04697cb`

Run11 classification:

`PASS_REPORT_CREATE_REPORT_INFO_NEXT`

Operational reliability:

`PASS_FIRST_POST_REPAIR_LIVE_PLACEMENT_REPORT_CREATE`

This is direct live proof that the repaired READ surface works in the operator's real Bridge environment.

Detailed evidence:
`live-runs/STD_10_REOPENED_RUN_11_PLACEMENT_BY_PRODUCTS_REPORT_CREATED_2026-09-03.md`.

## What Run11 proves and does not prove

Run11 proves only that Ozon accepted the report request and issued a report code. It does not expose the report rows.

Therefore Run11 does **not** yet prove:

- pre-incident Samara stock by SKU;
- historical Samara quantity on 2026-08-21/22;
- any burned/lost quantity;
- incident causality for current Samara zero;
- compensation liability.

No damage conclusion may be advanced from the create acknowledgement alone.

## Explicit safe report chain

The repaired Bridge supports the async report path:

1. `report_placement_by_products_create` — **completed in Run11**;
2. `report_info` — **next**;
3. receive an opaque `report_file_ref` if the provider report is ready;
4. `report_file_get` — only as a later explicit business step;
5. inspect bounded structured CSV/XLSX rows if returned in a supported format.

## Immediate next live read

Execute exactly one `report_info` request for:

`REPORT_seller_placement_by_products_2093109_1788402580_01a06519-bba3-7a6b-84b6-6ac5e04697cb`

If `report_info` says the report is still processing, record that state and do not skip ahead. If it exposes an opaque `report_file_ref`, then the following step will be one explicit `report_file_get`.

## Current forensic conclusion

Current evidence narrows the unexplained Samara-zero problem because, in the tested post-incident interval, it is not explained by:

- ordinary Samara FBO postings;
- formal Samara removal/utilization rows;
- finance transactions classified as compensation.

The historical placement report has now been successfully requested, but its data has not yet been retrieved. There is still **no evidence-backed numerical burned/lost quantity**.

Checkpoint:
`STD_10_REOPENED_RUN11_PLACEMENT_REPORT_CREATED_REPORT_INFO_NEXT`
