# NEW-05 setup Run1 — seller_warehouse_list

Date: 2026-09-03
Mode: `COLLECT_ALL_DEFECTS_FIRST_THEN_PATCH`
Purpose: obtain a real seller FBS warehouse id before testing repaired alias `report_warehouse_stock`.

## Execution

- operation: `seller_warehouse_list`
- request id: `657a1c3c-a0d3-4160-9f2a-64f8ec681672`
- bridge: `ozon-llm-api-bridge 0.1.19`
- HTTP: `200`
- elapsed: `1352 ms`
- physical business requests: `1`
- logical business results: `1`
- external request executed: `true`
- entitlement: `SUPPORTED_AND_ENTITLED / all_accounts`
- exact request preserved: `true`
- logical fingerprint: `11b894f6`
- physical fingerprint: `11b894f6`
- command transformed: `false`

## Result relevant to NEW-05

One seller warehouse was returned:

- warehouse_id: `1020001773680000`
- name: `Златоуст Чёт`
- warehouse_type: `fbs`
- status: `created`
- is_rfbs: `false`
- is_express: `false`
- first mile: `DROP_OFF`
- has_next: `false`
- cursor: `eyJmaWVsZHMiOjEwMjAwMDE3NzM2ODAwMDB9`

Sensitive phone and courier-phone fields were redacted by the Bridge. The operational warehouse address remained visible under the existing safe-projection rule.

## Classification

`PASS_NEW_05_SETUP_REAL_FBS_WAREHOUSE_ID_RESOLVED`

This is a setup READ and does not count as one of the repaired 26 aliases. It introduces no new defect.

The exact next repaired operation is `report_warehouse_stock` with `warehouseId:["1020001773680000"]` because the repaired contract expects an array of strings.

RAW persistence:
`live-runs/repaired-26/raw/NEW_05_SETUP_RUN_1_SELLER_WAREHOUSE_LIST_RAW_2026-09-03.json`
