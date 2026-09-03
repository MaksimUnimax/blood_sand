# STD-10 REOPENED — historical stock and damage reconstruction

Updated: 2026-09-03
Canonical question: `На складе Ozon был пожар или авария. Был ли там мой товар, что с ним сейчас и что мне нужно контролировать?`
Target warehouse: `САМАРА_РФЦ`, warehouse_id `23128509046000`.
Incident: 2026-08-22, Chapayevsk, Samara region.
Status: `FROZEN_BY_OPERATOR_AFTER_RUN11`
Rule: `NO_SKIP_ON_FAILURE`

## Freeze decision

The operator explicitly froze STD-10 immediately after successful Run11 in order to fully live-test the 26 repaired Seller READ commands/workflows before continuing the forensic investigation.

Separate freeze authority:
`live-runs/STD_10_FROZEN_AFTER_RUN11_PENDING_26_NEW_READS_LIVE_GATE_2026-09-03.md`

Active priority gate while STD-10 is frozen:
`OZON_AI_WORKER_REPAIRED_26_READS_LIVE_GATE_2026-09-03.md`

## Correct accounting question preserved for later resume

For each SKU that was physically/accountedly present at Samara immediately before the incident, reconstruct:

`pre_incident_stock + inbound_after_incident + returns_to_stock - sales/outbound_postings - removals/utilization - other_explained_outflows - current_stock = unexplained_delta`

Then correlate any unexplained delta with Ozon compensation/write-off evidence.

No numerical burned/lost quantity is currently supported.

## Proven evidence before freeze

- exact incident warehouse: `23128509046000` / `САМАРА_РФЦ`;
- seller FBO flow through the exact warehouse immediately before the incident;
- current sampled exposed-SKU Samara zero;
- Run5: zero `finance_transaction_list_v3` rows with `transaction_type=compensation` in the tested window;
- Run6/6B: complete accessible `removal_from_stock_list` traversal contained no Samara removal/utilization rows;
- Runs7–9: zero ordinary FBO postings from Samara across the tested local 2026-08-22..2026-09-02 windows;
- Run10: `report_list` returned `reports=[]`, `total=0`;
- READ-effect repair restored/certified 26 false-negative READ workflows, including historical placement report creation;
- repaired runtime/browser package certified at 271 Seller READ aliases / 26 exact repaired schemas / 26-of-26 mocked E2E workflows on Linux and Windows.

## Run11 — live historical placement report creation

Operation:
`report_placement_by_products_create`

Requested window:
`2026-08-01..2026-08-31`

Execution:

- request id: `02abef62-83d6-4333-a2dd-813cf2f947fc`
- physical business requests: `1`
- external request executed: `true`
- HTTP: `200`
- elapsed: `346 ms`
- entitlement: `SUPPORTED_AND_ENTITLED`
- exact request preserved: `true`
- command transformed: `false`
- fingerprint: `973a081a`.

Ozon returned report code:

`REPORT_seller_placement_by_products_2093109_1788402580_01a06519-bba3-7a6b-84b6-6ac5e04697cb`

Run11 classification before freeze:
`PASS_REPORT_CREATE_REPORT_INFO_NEXT`.

Detailed Run11 evidence:
`live-runs/STD_10_REOPENED_RUN_11_PLACEMENT_BY_PRODUCTS_REPORT_CREATED_2026-09-03.md`.

## Frozen report code handling

The report code above is preserved exactly.

While STD-10 is frozen:

- do not call `report_info` for it;
- do not call `report_file_get` for it;
- do not create a replacement forensic report;
- do not perform more STD-10 movement/compensation reads;
- do not advance STD-12.

The separate 26-command gate may test `report_placement_by_products_create` only with its own generic report instance. It must not consume the frozen forensic code.

## Resume condition

Resume STD-10 only after all 26 repaired READ commands/workflows have completed their separate live gate.

At resume, the first and only next STD-10 command is:

`report_info`

with:

`REPORT_seller_placement_by_products_2093109_1788402580_01a06519-bba3-7a6b-84b6-6ac5e04697cb`

If that report is ready and exposes an opaque `report_file_ref`, only the following explicit step may call `report_file_get`.

## Current checkpoint

`STD_10_FROZEN_AFTER_RUN11_REPORT_CODE_PRESERVED_REPAIRED_26_READS_LIVE_GATE_MUST_COMPLETE_BEFORE_REPORT_INFO`
