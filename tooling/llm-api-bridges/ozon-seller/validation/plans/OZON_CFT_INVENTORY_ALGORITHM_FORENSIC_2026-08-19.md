# Ozon Bridge — CFT inventory algorithm forensic prompt

Date: 2026-08-19
Status: `READY_TO_DISPATCH_CFT_INVENTORY_FORENSIC`

# STANDALONE CODEX FORENSIC PROMPT

Live GitHub is the only source of truth for project authority.

Repository:
`MaksimUnimax/blood_sand`

This is validation-environment forensic work ONLY.

Do NOT run the full 01–16 gate.
Do NOT modify production, candidate, source CFT, ACLs, dependencies, or browser environment.
Do NOT launch Chrome.
Do NOT run setup.exe.

Read completely from commit:
`faaf153d9a0656d38d41a5521e6a5506d2fadc5f`

Path:
`tooling/llm-api-bridges/ozon-seller/validation/environment/CFT_INVENTORY_ALGORITHM_FORENSIC_2026-08-19.md`

Also read completely:
- RERUN8 report commit `8a7d1bbc3053a995578032104356244be6fe3bb4`
- preflight6 evidence report commit `6eaa50d9cfaf9d9bc5eb54f8e0ab7a1dde080a71`

Then inspect, without modifying, the actual validator workspace files if present:

`D:\codex\Test\qa-full-gate-composer-wait\ENV_PREFLIGHT6.mjs`
`D:\codex\Test\qa-full-gate-composer-wait\RERUN8_QUALIFIED_FULL_WRAPPER.mjs`

Use the exact current source CFT tree used by those runs:
`D:\codex\Test\qa-harness\puppeteer-extension-qa\chrome\win64-151.0.7922.47\chrome-win64`

Perform the forensic exactly as defined by the authority:

1. hash both runner files;
2. extract and compare their exact inventory algorithms;
3. run the preflight6 inventory algorithm against the current source CFT tree;
4. run the RERUN8 inventory algorithm against that same tree;
5. build one canonical normalized per-file manifest `{path,size,sha256}`;
6. prove whether the two algorithms see the same canonical per-file manifest;
7. classify exactly one of:
   - `INVENTORY_ALGORITHM_MISMATCH`
   - `SOURCE_CFT_BYTE_DRIFT`
   - `FORENSIC_INCONCLUSIVE`
8. do not infer byte drift from aggregate-hash mismatch alone;
9. publish one report-only validation commit and STOP.

Create report-only branch:
`validation/ozon-cft-inventory-algorithm-forensic-2026-08-19`

Create exactly one report under:
`tooling/llm-api-bridges/ozon-seller/validation/reports/`

Required final response schema:

```text
OZON_CFT_INVENTORY_ALGORITHM_FORENSIC_RESULT

preflight6_runner_available: PASS|FAIL
rerun8_runner_available: PASS|FAIL

runner_hashes:
  preflight6_sha256: <sha256|NONE>
  rerun8_sha256: <sha256|NONE>

algorithms:
  identical: PASS|FAIL|NOT_PROVEN
  differences: <concise exact description|NONE|UNKNOWN>

current_source_cft:
  preflight6_algorithm_file_count: <integer|NOT_RUN>
  preflight6_algorithm_inventory_sha256: <sha256|NOT_RUN>
  rerun8_algorithm_file_count: <integer|NOT_RUN>
  rerun8_algorithm_inventory_sha256: <sha256|NOT_RUN>
  canonical_manifest_identical_between_algorithms: PASS|FAIL|NOT_PROVEN
  canonical_per_file_difference_count: <integer|NOT_PROVEN>

classification:
  INVENTORY_ALGORITHM_MISMATCH|SOURCE_CFT_BYTE_DRIFT|FORENSIC_INCONCLUSIVE

network:
  real_ozon_requests: 0
  real_performance_requests: 0
  operator_browser_actions: 0

modifications:
  production: 0
  candidate: 0
  source_cft: 0

report_branch:
  <branch>

report_commit:
  <sha>
```

After publishing the report, STOP.