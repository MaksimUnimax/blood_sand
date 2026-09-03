# NEW-05 Run1 — report_warehouse_stock create

Date: 2026-09-03
Mode: `COLLECT_ALL_DEFECTS_FIRST_THEN_PATCH`
Alias: `report_warehouse_stock`

Setup warehouse:
- seller FBS warehouse id: `1020001773680000`
- name: `Златоуст Чёт`
- warehouse type: `fbs`

Live result:
- request id: `bd63066b-55bf-44cc-baec-98bed0d4ed47`
- HTTP: `200`
- elapsed: `1287 ms`
- logical business results: `1`
- physical business requests: `1`
- external request executed: `true`
- entitlement: `SUPPORTED_AND_ENTITLED / all_accounts`
- exact request preserved: `true`
- logical fingerprint: `f8e4cdac`
- physical fingerprint: `f8e4cdac`
- command transformed: `false`
- report code: `REPORT_seller_stocks_2093109_1788407283_01a06561-80f3-78d2-9c6a-3c829871385f`

Classification:
`PASS_NEW_05_REPORT_WAREHOUSE_STOCK_CREATE_CLEAN_METADATA`

Interpretation:
The repaired READ alias successfully created a real FBS warehouse stock report for a live seller warehouse. No new defect was observed. This is another clean counterexample narrowing DEFECT-002: not every repaired create path changes the physical fingerprint or reports `command_transformed=true`.

NEW-05 remains incomplete until `report_info` and, when ready, `report_file_get` are exercised. File retrieval may reproduce existing DEFECT-001 and must be recorded rather than patched during the collection phase.

RAW:
`live-runs/repaired-26/raw/NEW_05_RUN_1_REPORT_WAREHOUSE_STOCK_CREATE_RAW_2026-09-03.json`
