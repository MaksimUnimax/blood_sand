# STD-10 REOPENED Run 6B — removal/utilization continuation terminal

Date: 2026-09-02
Canonical question: `На складе Ozon был пожар или авария. Был ли там мой товар, что с ним сейчас и что мне нужно контролировать?`
Target incident warehouse: `САМАРА_РФЦ`, warehouse_id `23128509046000`.
Incident: 2026-08-22, Chapayevsk, Samara region.

## Purpose

Verify completeness of the post-incident FBO removal/utilization report after Run 6 page 1 returned one unrelated Habarovsk row plus a non-empty `last_id`.

## Bridge run

Operation: `removal_from_stock_list`
Request id: `ecc6ef8f-51a3-4e48-b894-d92298ba5919`
Endpoint: `POST /v1/removal/from-stock/list`
HTTP: `200`
Elapsed: `1379 ms`
Physical business requests: `1`
External request executed: `true`
Entitlement: `SUPPORTED_AND_ENTITLED / all_accounts`
Exact request preserved: `true`
Command transformed: `false`
Bridge pagination metadata: `null`

Continuation input:
- date_from `2026-08-22`;
- date_to `2026-09-02`;
- limit `500`;
- last_id `whcReturnId:31221505_boxId:20250353996_itemIndex:0`.

## Provider result

The continuation returned:
- `returns_summary_report_rows=[]`;
- `last_id=whcReturnId:31221505_boxId:20250353996_itemIndex:0` — unchanged from the input token.

An empty continuation page with an unchanged continuation token means there are no further rows reachable after Run 6 page 1. Continuing the identical token again would only repeat the same empty terminal state.

## Final removal/utilization conclusion for 2026-08-22..2026-09-02

The complete accessible `removal_from_stock_list` evidence for the window contains exactly one row:
- SKU `1602722942` / `Вегвизир - Рунический компас`;
- quantity `1`;
- stock type `Брак, доступный к вывозу со стока`;
- clearing warehouse `ХАБАРОВСК_2_РФЦ`;
- created 2026-08-31;
- state `В пути`;
- destination `ЗЛАТОУСТ_28`;
- no utilization date.

There are **no rows from `САМАРА_РФЦ`** in the full post-incident removal/utilization report.

Supported statement:
`NO_FORMAL_FBO_REMOVAL_OR_UTILIZATION_ROWS_FROM_SAMARA_IN_2026_08_22_TO_2026_09_02_REPORT`.

This eliminates formal `removal_from_stock_list` removal/utilization as an explanation for current Samara zero stock during the tested window. It still does not by itself prove destruction or loss; sales/postings, returns, supplies/transfers, historical baseline and write-off/compensation evidence remain to be reconciled.

## Next step

Collect all FBO postings attributable to `САМАРА_РФЦ` after the incident, using bounded windows and `analytics_data=true`, so normal outbound sales/order flow can be subtracted from the future historical stock baseline.

Checkpoint:
`STD_10_REOPENED_RUN6_REMOVAL_REPORT_COMPLETE_NO_SAMARA_ROWS_POSTINCIDENT_SAMARA_FBO_POSTINGS_NEXT`
