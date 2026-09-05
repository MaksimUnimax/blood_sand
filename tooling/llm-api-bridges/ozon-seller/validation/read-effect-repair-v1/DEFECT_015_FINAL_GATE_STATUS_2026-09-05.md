# DEFECT-015 final gate status — 2026-09-05

Branch: `repair/ozon-date-contract-2026-09-04`

Exact gated artifact:
- `OZON_BRIDGE_v0.1.19_DEFECT_015_DATE_CONTRACT_REPAIR_2892a1ddeee5.zip`
- SHA-256 `ff6a766837195e74e09c3a9439afd057f71dca20b042b472cbd1401b2574549a`
- repair commit `2892a1ddeee5ac8f72f63214e5a38628dc08ee33`
- repair tree `ad47ebdf28ebb0aa18eb009d4c9e23ada22bfc90`

## Gate matrix

| Gate | Status |
|---|---|
| deterministic DEFECT-015 repair gate | PASS |
| Ubuntu complete `run_*.mjs` family | PASS |
| Windows complete `run_*.mjs` family | PASS |
| old authority negative proof | PASS (`FAIL AS EXPECTED`) |
| exact committed repair-tree mandatory rerun | PASS |
| candidate/MCP nodebundle coherence | PASS |
| exact installable ZIP build + hash | PASS |
| artifact publication | PASS |
| exact artifact installed in operator browser | PENDING OPERATOR INSTALL/ATTESTATION |
| live `finance_balance` rerun on exact artifact | PENDING |
| exactly one physical provider request | PENDING |
| automatic retry absent | PENDING |
| HTTP 200/provider success | PENDING |
| DEFECT-015 post-install live gate | BLOCKED ON ABOVE |
| STD-06 unfreeze | BLOCKED |
| STD-07 | BLOCKED UNTIL STD-06 COMPLETE |

## Mandatory live command

`OZON_API_V1 {"operation":"finance_balance","params":{"date_from":"2026-08-28","date_to":"2026-09-03"}}`

The post-install gate MUST NOT be marked PASS from static/source/CI evidence. It requires the exact certified artifact installed in the operator browser and live provider evidence from that artifact.

Live evidence is accepted only through `verify_defect_015_post_install_live_evidence.mjs` and must prove: exact artifact identity/installation attestation, date-only request, `external_request_executed=true`, `exact_request_preserved=true`, `command_transformed=false`, one physical business request, no automatic retry, HTTP 200, and provider success.

Current verdict: `DEFECT_015_FINAL_GATE = PENDING_POST_INSTALL_LIVE_FINANCE_BALANCE`.
