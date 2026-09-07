# Ozon AI Worker — Primary Gate Index

Updated: 2026-09-06
Branch: `repair/ozon-date-contract-2026-09-04`
Status: `AUTHORITATIVE_GATE_SIZE_44__SOL_PRIMARY_GATE_COMPLETE__HARDENING_NEXT`

## Gate policy

The original 40-test gate is a baseline, not a hard ceiling.

Primary gate expands only for materially distinct commercial capabilities or meaningful entitlement/coverage boundaries.

`EXPAND_GATE_FOR_DISTINCT_COMMERCIAL_CAPABILITY_NOT_FOR_TEST_COUNT`

Every promoted test must preserve `NO_SKIP_ON_FAILURE`, persist meaningful runs/results, and record capability/entitlement/recovery/coverage gaps.

## Current primary gate

Current authoritative size: **44 rows**.

- Rows 1–20: `STD-01` … `STD-20`.
- Rows 21–44: `CAP-01` … `CAP-24`.

CAP-21..CAP-23 were previously promoted for SEO/competitor/category-position capabilities.
CAP-24 was subsequently promoted for SKU monthly unit economics and expanded the gate from 43 to 44 rows.

CAP-24 promotion authority:
`OZON_AI_WORKER_UNIT_ECONOMICS_CAPABILITY_REQUIREMENT_2026-09-06.md`

Primary live-result master:
`OZON_AI_WORKER_PRIMARY_GATE_LIVE_RESULTS_TABLE_2026-09-02.md`

Extension ledger:
`OZON_AI_WORKER_PRIMARY_GATE_EXTENSION_RESULTS_2026-09-02.md`

Detailed run/final evidence:
`research/product/live-runs/`

## Current execution state

The Sol primary gate is now **complete for all 44 rows**.

This completion statement means every primary-gate business/capability row has reached a terminal evidence-backed business classification. It does **not** mean every row was first-attempt clean or that all Bridge/product gaps are closed.

Important examples deliberately preserved as non-clean outcomes include:

- transient provider 429 recovery cases;
- guidance/parameter-repair gaps;
- privacy/entitlement and data-readiness boundaries;
- explicit batching/orchestration lessons;
- competitor/category/search coverage limits;
- CAP-24 advertising and placement attribution coverage boundaries;
- the real XLSX relationship-target parser defect discovered during CAP-24, repaired at root cause and live-retested.

These findings are inputs to hardening, not reasons to reopen already completed business rows blindly.

## Historical freeze — no longer current

An earlier checkpoint froze the product-demand gate after STD-10 Run11 while the repaired-26 READ live gate was executed. Documents created at that time may still mention:

`PRIMARY_GATE_43_FROZEN_AFTER_STD10_RUN11...`

That state is **historical only** and must not be used as the current restart position.

The repaired-26 dependency was later closed, the Standard rows were resumed and completed through STD-20, CAP-01..CAP-23 were completed, and CAP-24 was promoted and completed.

Likewise, any older statement that rows STD-12 onward or CAP rows are `FROZEN` / `PENDING` is superseded by the current final evidence and reconciled primary-gate master.

## Completed extension rows

| Row | ID | Final classification |
|---:|---|---|
| 41 | CAP-21 | `PASS_WITH_RECOVERY_AND_DATA_READINESS_GUIDANCE_GAP` |
| 42 | CAP-22 | `PARTIAL_WITH_COMPETITOR_DISCOVERY_COVERAGE_BOUNDARY` |
| 43 | CAP-23 | `PASS_WITH_SEARCH_POSITION_AND_CATEGORY_COVERAGE_BOUNDARIES` |
| 44 | CAP-24 | `PASS_WITH_ATTRIBUTION_COVERAGE_BOUNDARY` |

Authority:
`OZON_AI_WORKER_PRIMARY_GATE_EXTENSION_RESULTS_2026-09-02.md`

## Next phase

Do **not** start a new primary-gate business row: there is no `CAP-25` in the current gate.

The next work is the consolidated hardening phase:

1. reconcile all observed Sol failures/recovery/guidance/capability-awareness/orchestration gaps across the 44 rows;
2. distinguish provider/account/entitlement/data-readiness limitations from actual Bridge defects and AI-orchestration errors;
3. design one coherent Bridge guidance/hardening package rather than per-test prompt hacks;
4. preserve one explicit command -> at most one physical business request and explicit-batch semantics for independent known-upfront reads;
5. make executable Bridge changes only with explicit operator authorization;
6. rerun every affected Sol row after the hardening package;
7. require hardened Sol regression before moving to Alice Free.

## Current checkpoint

`PRIMARY_GATE_44_SOL_COMPLETE__NEXT_CONSOLIDATED_GAP_LEDGER_AND_HARDENING_PACKAGE`
