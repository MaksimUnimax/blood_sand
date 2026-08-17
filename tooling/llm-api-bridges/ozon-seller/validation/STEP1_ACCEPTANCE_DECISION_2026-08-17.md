# Ozon Bridge Step 1 acceptance decision

Date: 2026-08-17
Decision: `STEP1_ACCEPTED_FOR_STEP2`

Repository: `MaksimUnimax/blood_sand`

## Accepted authority

Original Step-1 production-logic SHA:

`370e45a1803976f43d27d5a9d4b5613e09a91623`

Exact reconstruction-v2 target independently tested:

`298a4d618c69e8ffd33735ff96a153d42d160143`

Independent validation branch:

`validation/ozon-step1-contract-capability-retest-v2-2026-08-17`

Independent report commit:

`249669986d61c5df708dd5b635fe30662120336f`

Report path:

`tooling/llm-api-bridges/ozon-seller/validation/reports/OZON_STEP1_CONTRACT_CAPABILITY_RETEST_V2_2026-08-17.md`

## Review conclusion

The full GitHub report was reviewed, not merely the short Codex summary. All load-bearing Step-1 gates are PASS.

Accepted evidence includes:

- exact target and clean start;
- exact operator baseline reconstruction v2;
- baseline ZIP size 100320 bytes and SHA-256 `2b86518bfdc81081e271c7f8346188fc7047999385d1da4428fa2a133dba15bf`;
- raw Step-1 patch-part hashes and concatenated patch SHA-256 `5afe153c15eb4005a836d005bab531f8905dbdcd5b0541d52a6112a3ebb0e3ce`;
- exactly three intended production files changed;
- fourteen protected production files byte-identical;
- strict contract behavior and zero business requests on pre-execution failures;
- capability resolver, seller-info privacy and non-AI-callability;
- entitlement matrix;
- at most one capability probe per relevant logical batch;
- zero probe for universal/performance-only batches;
- no blind retry after previous-worker in-flight capability state;
- logical/physical provenance;
- security, Seller and Performance regressions;
- accepted MV3 browser harness sanity;
- `OPERATOR_BROWSER_ACTIONS = 0`;
- `REAL_OZON_REQUESTS = 0`.

The two earlier Step-1 rejected reports remain valid historical evidence of reconstruction-artifact failures only. They did not establish a production-logic failure and are not rewritten.

## Boundary

This acceptance opens Step 2 only.

Step 2: Query planner + safe coalescing.

Step 3 global quota scheduling/response-verifier redesign and Step 4 cache/prefetch/integrated acceptance remain blocked until their preceding major-step gates pass.

Canonical GitHub release/evidence lineage remains v0.1.11. This acceptance does not promote operator v0.1.19 into a canonical release.
