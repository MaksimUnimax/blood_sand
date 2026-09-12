# Ozon Seller Bridge — cross-LLM business regression protocol

Status: ACTIVE DOCUMENTATION AUTHORITY
Date: 2026-09-12
Scope: business-behaviour regression across target LLM interfaces using the already completed Ozon Seller Bridge business gate.

## Purpose

This directory separates two kinds of evidence that must not be conflated:

1. a cross-LLM comparison matrix showing the latest verdict for every canonical business test on every tested LLM;
2. a dedicated regression document for each LLM containing the canonical prompts, required business result/invariants, run verdicts, and the raw dialogue evidence used to support those verdicts.

The canonical business set is the final 44-row Ozon gate: STD-01..STD-20 plus CAP-01..CAP-24. Historical Sol/GPT execution is the baseline. A target LLM does not inherit PASS from Sol/GPT; every target must be independently evidenced.

## Historical documentation

The repository already contains the older product-gate documentation:

- `research/product/OZON_AI_WORKER_PRIMARY_GATE_LIVE_RESULTS_TABLE_2026-09-02.md`
- `research/product/OZON_AI_WORKER_PRIMARY_GATE_ROW_NOTES_2026-09-02.md`

That snapshot predates final closure and contains 43 rows (STD 20 + CAP 23). It remains historical evidence and must not be rewritten as the current 44-row authority.

The current cross-LLM authority is:

- `OZON_LLM_BUSINESS_REGRESSION_MATRIX.md`

Per-LLM authorities are separate files, beginning with:

- `ALICE_BUSINESS_REGRESSION_SUITE.md`

## Canonical run rules

- Canonical prompts are business-level test prompts derived from the final 44 objectives. They are not claimed to be byte-for-byte historical wording unless the source transcript proves that.
- Dynamic seller values are expected to change. A result passes by business semantics, provenance, arithmetic, completeness, and safety — not by matching old numeric snapshots.
- Missing provider row is never silently converted to zero.
- `null` is never silently converted to zero, absence, or failure.
- Provider/API/data coverage boundaries must be stated explicitly.
- Attribution boundaries must be preserved, especially CPC vs CPO, finance rows, supply attribution, competitor coverage, and historical advertising attribution.
- A false user premise must be checked and rejected when evidence disproves it.
- Claimed complete lists require terminal pagination/completeness evidence where the API is paginated.
- No hidden retry, hidden pagination, polling, fan-out, refetch, or resend may be invented by the LLM.
- Private seller evidence and public/external evidence must remain visibly separated.
- The final answer must solve the business question; a raw API dump alone is not a PASS.

## Transcript ingestion rule

When an MD dialogue from a tested LLM is supplied, preserve it as regression evidence without silently normalizing the conversation.

For each imported dialogue record:

- source filename;
- import date;
- SHA-256 when the original file bytes are available;
- Bridge build/version when known;
- covered test IDs;
- per-test verdicts;
- regression delta versus the previous run and versus the Sol/GPT baseline;
- full raw MD transcript, preserved verbatim in the LLM-specific document unless document size later requires an explicitly linked append-only transcript artifact.

The normalized verdict/analysis is additive metadata. It never replaces the raw transcript.

## Verdict vocabulary

Recommended target-LLM verdicts:

- `NOT_RUN`
- `PASS`
- `PASS_WITH_LIMITS`
- `PARTIAL`
- `FAIL`
- `BLOCKED_PROVIDER`
- `BLOCKED_BRIDGE`
- `BLOCKED_TARGET_UI`
- `INVALID_RUN`

A target LLM only moves from `NOT_RUN` when transcript-backed evidence exists.

## Change boundary

This directory is documentation/evidence only. Updating it does not authorize or modify production Bridge runtime code.