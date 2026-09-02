# STD-10 REOPENED Run 10 — report list empty; historical baseline unavailable through accepted read surface

Date: 2026-09-02
Canonical question: `На складе Ozon был пожар или авария. Был ли там мой товар, что с ним сейчас и что мне нужно контролировать?`
Target incident warehouse: `САМАРА_РФЦ`, warehouse_id `23128509046000`.
Incident date: 2026-08-22, Chapayevsk, Samara region.

## Purpose

After Runs 7–9 proved zero ordinary FBO postings from Samara throughout local 2026-08-22..2026-09-02, attack the load-bearing missing left side of the stock balance: exact historical stock at Samara immediately before the incident.

The current Bridge does not expose an `as_of` parameter on current stock endpoints. Therefore Run 10 tests whether an already generated historical placement/storage/stock report exists and can be followed through the accepted read operation `report_info`.

## Bridge run

Operation: `report_list`
Request id: `9a9f0004-bd48-4089-b34f-22a795f21f9f`
Endpoint: `POST /v1/report/list`
HTTP: `200`
Elapsed: `1513 ms`
Physical business requests: `1`
External request executed: `true`
Entitlement: `SUPPORTED_AND_ENTITLED / all_accounts`
Exact request preserved: `true`
Command transformed: `false`
Bridge pagination metadata: `null`

Request:
- page `1`;
- page_size `100`.

## Provider result

The provider returned:
- `reports=[]`;
- `total=0`.

Therefore there are **no already formed reports of any type** available through `report_list` in this seller account at this moment.

Supported statement:

`REPORT_LIST_TOTAL_ZERO_NO_EXISTING_REPORT_PATH_TO_PREINCIDENT_SAMARA_BASELINE`.

## Final semantic classification of placement report creation

The later/final Seller 463/463 terminal matrix supersedes the older intermediate 268-operation coverage artifact.

Final Seller classification:
- 245 admissible reads;
- 218 terminal-unavailable operations;
- unresolved/pending = 0.

The final matrix explicitly classifies:

`POST /v1/report/placement/by-products/create`

as:

`REJECT_SERVER_SIDE_GENERATION_OR_CREATION`

because it initiates server-side report/artifact generation.

Therefore the absence of this endpoint from Bridge v0.1.19 is **intentional under the final accepted read-only surface**, not an implementation omission. The earlier same-day claim `FULL_READ_ROLLOUT_INCOMPLETE_FOR_PLACEMENT_REPORT_WORKFLOW` is withdrawn.

`report_list` and `report_info` remain accepted reads; report `/create` generation endpoints remain terminal unavailable by design.

## Damage-reconstruction state after Run 10

Proven:
- exact affected warehouse matched to `САМАРА_РФЦ`;
- seller goods were in the exact Samara FBO flow before the incident;
- sampled exposed SKUs are currently explicit zero at Samara;
- zero finance transactions classified as `compensation` in 2026-08-22..09-02;
- zero formal `removal_from_stock_list` rows from Samara in 2026-08-22..09-02;
- zero ordinary Samara FBO postings in three terminal windows covering local 2026-08-22..09-02;
- no existing generated report can supply the historical baseline.

Still unproven:
- exact per-SKU stock physically/accountedly present at Samara immediately before the incident;
- post-incident FBO returns/inbound to Samara;
- internal Ozon transfers or generic inventory adjustments not exposed by tested admissible read surfaces;
- write-off evidence outside the tested `compensation` transaction type;
- exact destroyed/lost unit count.

## Next step

Continue the incident reconstruction using only accepted read operations. Next inspect `returns_list`, filtered to the target Samara warehouse and post-incident logistic-return date. If the admissible read surfaces cannot reconstruct an exact historical baseline, record that as a read-only forensic coverage limit rather than reclassifying a deliberately excluded generation endpoint as a missing read.

Checkpoint:
`STD_10_REOPENED_RUN10_REPORT_LIST_TOTAL_ZERO_PLACEMENT_CREATE_INTENTIONAL_GENERATION_EXCLUSION_SAMARA_RETURNS_NEXT`
