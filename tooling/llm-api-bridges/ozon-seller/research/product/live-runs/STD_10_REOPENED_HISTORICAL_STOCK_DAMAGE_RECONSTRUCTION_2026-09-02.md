# STD-10 REOPENED — historical stock and damage reconstruction

Updated: 2026-09-03
Canonical question: `На складе Ozon был пожар или авария. Был ли там мой товар, что с ним сейчас и что мне нужно контролировать?`
Target warehouse: `САМАРА_РФЦ`, warehouse_id `23128509046000`.
Incident: 2026-08-22, Chapayevsk, Samara region.
Status: `REOPENED_READY_AFTER_CERTIFIED_READ_REPAIR`
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

## READ-classification blocker discovered after Run10

The Step7 terminal-matrix re-audit found a generic false-negative rule that treated server-side report/document/label/validation generation as non-READ even where the operation only materialized existing business state.

At least 26 false-negative Seller READ aliases were confirmed, including the load-bearing historical investigation surface:

`report_placement_by_products_create` -> `POST /v1/report/placement/by-products/create`.

`chat_history_v3` was also incorrectly removed instead of being handled through its Personal Data gate.

Under `NO_SKIP_ON_FAILURE`, STD-10 was correctly blocked until this READ surface was repaired and certified.

## READ repair is now certified and ported into the research lineage

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

## Historical baseline path is now testable

The previous capability-gap statement is superseded for the repaired runtime. The Bridge now registers:

`report_placement_by_products_create`

Provider endpoint:
`POST /v1/report/placement/by-products/create`

Exact request shape:

- `date_from`: required `YYYY-MM-DD`
- `date_to`: required `YYYY-MM-DD`
- repaired Bridge limit: at most 31 calendar days inclusive.

The Bridge also now supports the explicit safe async report chain:

1. create the placement-by-products report;
2. call `report_info` with the returned report code;
3. receive an opaque `report_file_ref` rather than a signed provider URL;
4. call `report_file_get` explicitly;
5. inspect bounded structured CSV/XLSX rows if the provider report uses a supported tabular format.

## Immediate next live read

After the operator installs/reloads the certified browser package, create the full August 2026 placement-by-products report:

```text
OZON_API_V1
{
  "operation": "report_placement_by_products_create",
  "params": {
    "date_from": "2026-08-01",
    "date_to": "2026-08-31"
  }
}
```

Why the full month:

- it stays inside the repaired 31-calendar-day limit;
- it spans both the pre-incident and post-incident periods;
- it gives the strongest chance of obtaining a daily/product placement history useful for the Samara baseline instead of sampling one isolated date.

## What the create result is allowed to prove

The create acknowledgement can only prove that the report request was accepted and provide its report identifier/code.

It cannot by itself prove:

- that seller stock was present at Samara at incident time;
- how many units were present;
- how many units were lost/destroyed;
- whether Ozon owes or paid compensation.

If the create call succeeds, the next action is exactly one explicit `report_info` read for the returned code. Do not batch `report_info` or `report_file_get` into the same operator step.

## Current forensic conclusion

Current evidence narrows the unexplained Samara-zero problem because, in the tested post-incident interval, it is not explained by:

- ordinary Samara FBO postings;
- formal Samara removal/utilization rows;
- finance transactions classified as compensation.

But there is still **no evidence-backed numerical burned/lost quantity**. The repaired historical placement report is now the next load-bearing evidence source.

Checkpoint:
`STD_10_REOPENED_READ_REPAIR_CERTIFIED_BROWSER_PACKAGE_READY_PLACEMENT_BY_PRODUCTS_CREATE_NEXT`
