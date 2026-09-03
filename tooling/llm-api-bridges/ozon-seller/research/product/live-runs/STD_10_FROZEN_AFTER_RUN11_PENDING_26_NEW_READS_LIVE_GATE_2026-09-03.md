# STD-10 — frozen after Run11 pending full live validation of repaired READ commands

Date: 2026-09-03
Branch: `research/ozon-product-demand-2026-09-02`
Status: `FROZEN_BY_OPERATOR`
Rule: `NO_SKIP_ON_FAILURE`

## Freeze point

STD-10 is frozen immediately after successful Run11.

Run11 operation:
`report_placement_by_products_create`

Provider endpoint:
`POST /v1/report/placement/by-products/create`

Requested window:
`2026-08-01..2026-08-31`

Run11 request id:
`02abef62-83d6-4333-a2dd-813cf2f947fc`

Run11 result:
HTTP `200`, exactly one physical provider request, exact request preserved, command not transformed.

Frozen report code:
`REPORT_seller_placement_by_products_2093109_1788402580_01a06519-bba3-7a6b-84b6-6ac5e04697cb`

## Explicit freeze rule

Until the separate repaired-READ live gate is fully complete:

- DO NOT call `report_info` for the frozen report code;
- DO NOT call `report_file_get` for this forensic report;
- DO NOT run additional STD-10 forensic reads;
- DO NOT advance STD-12;
- DO NOT reinterpret the Run11 create acknowledgement as historical stock evidence;
- preserve the report code exactly for later continuation.

## Resume condition

STD-10 may resume only after the separate live gate for all 26 repaired Seller READ commands/workflows is fully closed with persisted evidence.

At resume, the exact first STD-10 command remains:

`report_info` with code
`REPORT_seller_placement_by_products_2093109_1788402580_01a06519-bba3-7a6b-84b6-6ac5e04697cb`.

No new report should be created for the forensic investigation unless the frozen report later proves unusable and that failure is separately persisted.

Checkpoint:
`STD_10_FROZEN_AFTER_RUN11_REPORT_CODE_PRESERVED_RESUME_ONLY_AFTER_26_REPAIRED_READS_LIVE_GATE_COMPLETE`
