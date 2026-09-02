# Ozon AI Worker — Standard-only Live Test Scope

Date: 2026-09-02
Status: OPERATOR SCOPE OVERRIDE / ACTIVE
Benchmark table: `OZON_AI_WORKER_STANDARD_LIVE_BENCHMARK_V1_2026-09-02.md`

## Operator decision

For the current commercial validation pass, live tests are run **only on the Ozon non-Premium / Standard contour**.

Premium, Premium Plus and Premium Pro questions are not live-tested now. Their likely product coverage is assessed later by conservative extrapolation from:

- the Standard live results;
- whether the AI can correctly orchestrate multi-step investigations/correlations;
- documented Premium data availability/entitlements;
- any failure that is clearly data-entitlement-related rather than a reasoning/Bridge/adapter failure.

No extrapolated Premium result may be labeled as a live PASS.

## Required provider sequence

1. GPT-5.6 Sol + Ozon Bridge — run first and record every query/run/result.
2. Alice Free authenticated + Ozon Bridge — run only after Sol baseline is complete.
3. Additional AI providers later.

## Live interaction protocol

For every benchmark row:

1. Present the natural-language user question exactly.
2. GPT-5.6 Sol decides what evidence is needed.
3. Sol emits exactly one next `OZON_API_V1` command.
4. Operator manually sends it through the Bridge and returns the result.
5. Sol analyses the result.
6. If the business question requires more evidence, Sol emits the next single Bridge command and repeats.
7. Web/current context and calculations may be used when materially relevant.
8. Multi-run answers are explicitly allowed and expected.
9. Only after the final business answer is produced is the row marked PASS/PARTIAL/FAIL/BLOCKED.
10. Every Bridge run, intermediate finding, final answer and failure reason is persisted in the benchmark table/log.

## Frozen initial set

The first Standard live benchmark contains **28 deliberately diverse queries**, exceeding the operator minimum of 20.

It covers:

- direct sales analytics;
- time-series/ranking/comparison BI;
- sales root-cause investigation;
- cabinet health/prioritization;
- inventory/turnover;
- warehouse and incident investigation;
- supplies;
- visibility/logistics;
- advertising analytics and DRR;
- ads × stocks/content correlations;
- finance and payout reconciliation;
- unit economics;
- promotions;
- returns/cancellations;
- ratings/FBS errors;
- listing quality;
- full weekly manager report.

## Current exact checkpoint

`STANDARD_ONLY_LIVE_BENCHMARK_28_ROWS_SOL_STD_01_RUN_1_READY`

Premium live tests: `DEFERRED`.
Alice live tests: `BLOCKED_ON_SOL_BASELINE`.
