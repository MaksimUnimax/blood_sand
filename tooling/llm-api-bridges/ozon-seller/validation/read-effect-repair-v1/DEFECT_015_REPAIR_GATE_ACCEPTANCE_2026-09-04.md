# DEFECT-015 repair gate acceptance — 2026-09-04

Repair commit: `2892a1ddeee5ac8f72f63214e5a38628dc08ee33`

Repair tree: `ad47ebdf28ebb0aa18eb009d4c9e23ada22bfc90`

Production-tree SHA-256: `984e75d34ec53c05a56059405fb09f489f6903651e8fa8057407c48693b5b46b`

Artifact: `OZON_BRIDGE_v0.1.19_DEFECT_015_DATE_CONTRACT_REPAIR_2892a1ddeee5.zip`

Artifact SHA-256: `ff6a766837195e74e09c3a9439afd057f71dca20b042b472cbd1401b2574549a`

## Certification

- Ubuntu complete `run_*.mjs` read-effect gate family: **PASS**.
- Windows complete `run_*.mjs` read-effect gate family: **PASS**.
- New DEFECT-015 gate against old authority `249029b0...`: **FAIL AS EXPECTED**, with independent reproduction of the old wrong finance/date/currentness behavior.
- Exact committed repair tree mandatory gate rerun: **PASS**.
- Candidate/MCP nodebundle repaired authority coherence: **PASS**.
- Installable ZIP built from the exact repaired candidate: **PASS**.
- Live Ozon calls during repair/certification: **0**.

STD-06 remains **FROZEN PENDING POST-INSTALL**. It may be unfrozen only after the operator installs this exact artifact and the previously failed `finance_balance` step is rerun with provider-valid date-only input and passes.
