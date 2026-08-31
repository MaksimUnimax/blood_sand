# Ozon Step 7 executable regression harness v1

This gate executes the historical regression corpus instead of trusting prewritten status fields.

The required corpus is discovered from repository evidence by exact cardinality and semantic scoring:

- 219 Seller regression cases;
- 21 Performance regression cases.

The harness extracts the repository test artifacts, discovers their real package or direct test entrypoints, blocks non-local network access, executes the selected suites, and requires complete case-token or explicit test-summary coverage. Any case not covered by a suite summary must resolve to and execute a case-level command or source entrypoint.

A pass emits:

```text
STEP7_SELLER_REGRESSION_219_PASS
STEP7_PERFORMANCE_REGRESSION_21_PASS
STEP7_REGRESSION_240_PASS
```

Two reports are written:

- `regression-proof.json` — full execution diagnostics and logs metadata;
- `semantic-proof.json` — deterministic case-set evidence for Linux/Windows comparison.

The semantic proof excludes durations, temporary paths, and platform-specific logs.
