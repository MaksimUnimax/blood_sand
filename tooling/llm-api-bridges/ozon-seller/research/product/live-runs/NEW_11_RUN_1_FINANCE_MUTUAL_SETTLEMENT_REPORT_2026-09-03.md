# NEW-11 Run1 — finance_mutual_settlement_report

Date: 2026-09-03
Branch: `research/ozon-product-demand-2026-09-02`
Gate mode: `COLLECT_ALL_DEFECTS_FIRST_THEN_PATCH`

## Command

`finance_mutual_settlement_report` with completed month `2026-08`.

## Result

Status: `PASS_CREATE_REPORT_CODE_RETURNED`

- request_id: `57544b21-6d26-4ad3-80fa-fb4bed1b9a85`
- HTTP: `200`
- elapsed_ms: `1468`
- result_count: `1`
- logical_business_result_count: `1`
- physical_business_request_count: `1`
- external_request_executed: `true`
- capability probe: not needed
- entitlement: `SUPPORTED_AND_ENTITLED / all_accounts`
- exact_request_preserved: `true`
- logical fingerprint: `29860803`
- physical fingerprint: `29860803`
- command_transformed: `false`
- coalesced_group_count: `0`
- coalesced_logical_count: `0`

Provider returned report code:
`REPORT_mutual_settlement_2093109_1788412383_01a065af-5079-78cb-a6b5-1110c3c9686a`

## Defect assessment

No new defect is established by Run1. The create path is a clean counterexample to DEFECT-002 because logical and physical fingerprints are identical and `command_transformed=false`.

Do not patch runtime. Continue the NEW-11 standalone chain with explicit `report_info` for this exact independent code. Do not touch the frozen STD-10 code.
