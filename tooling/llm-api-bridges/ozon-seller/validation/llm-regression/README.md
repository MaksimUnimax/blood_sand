# Ozon Seller Bridge — cross-LLM business regression protocol

Status: ACTIVE DOCUMENTATION AUTHORITY
Date: 2026-09-12
Scope: business-behaviour regression across target LLM interfaces using the completed Ozon Seller Bridge primary business gate.

## Purpose

This directory separates two evidence layers that must not be conflated:

1. a cross-LLM comparison matrix showing the latest verdict for every canonical business test on every tested LLM;
2. a dedicated regression document for each LLM containing the canonical business prompt, required result/invariants, per-run verdicts, and the raw dialogue evidence supporting those verdicts.

The canonical set is the final **44-row Sol/GPT gate: STD-01..STD-20 + CAP-01..CAP-24**. A target LLM does not inherit PASS from Sol/GPT; it must be independently evidenced.

## Canonical source authority

Current terminal 44-row source:

- `research/product/OZON_AI_WORKER_PRIMARY_GATE_LIVE_RESULTS_TABLE_2026-09-02.md`
  - current file state: `Updated: 2026-09-06`
  - current status: `AUTHORITATIVE_TERMINAL_SOL_RESULTS__44_OF_44_ROWS_COMPLETE`
  - STD complete: 20/20
  - CAP complete: 24/24
  - TOTAL: 44/44

Supporting cross-row authority:

- `research/product/OZON_AI_WORKER_SOL_44_CONSOLIDATED_ROOT_CAUSE_GAP_LEDGER_2026-09-06.md`
- `research/product/OZON_AI_WORKER_SOL_44_HARDENING_DESIGN_AND_REGRESSION_MATRIX_2026-09-07.md`
- row-level evidence under `research/product/live-runs/`

Older commits/snapshots of the same primary-gate table contained fewer completed rows. Those historical states are not the current terminal authority.

## Current regression documents

Cross-LLM compact matrix:

- `OZON_LLM_BUSINESS_REGRESSION_MATRIX.md`

Per-LLM authorities:

- `ALICE_BUSINESS_REGRESSION_SUITE.md`

Future target LLMs get their own sibling document rather than being mixed into Alice evidence.

## Canonical run rules

- Canonical prompts are business-level test prompts derived from the terminal 44 row objectives. They are not claimed to be byte-for-byte historical wording unless a preserved transcript proves exact wording.
- Dynamic seller values are expected to change. PASS is determined by business semantics, provenance, arithmetic, completeness, boundaries, and safety — not by reproducing stale numeric snapshots.
- Missing provider row is never silently converted to zero.
- `null` is never silently converted to zero, absence, or failure.
- Provider/API/data/queryability/entitlement boundaries must be stated explicitly.
- Attribution boundaries must be preserved, especially CPC/CPO, finance rows, supply provenance, competitor coverage, historical advertising membership, and placement attribution.
- A false user premise must be checked and rejected when evidence disproves it.
- Claimed complete lists require terminal pagination/completeness evidence where applicable.
- No hidden retry, hidden pagination, polling, fan-out, refetch, or resend may be invented by the LLM.
- Private seller evidence and public/external evidence must remain visibly separated.
- The final answer must solve the business question; a raw API dump alone is not a PASS.

## Transcript ingestion rule

When an MD dialogue from a tested LLM is supplied, preserve it as regression evidence without silently normalizing the conversation.

For each imported dialogue record preserve:

- source filename;
- import date;
- SHA-256 when original file bytes are available;
- Bridge build/version when known;
- covered canonical test IDs;
- per-test verdicts;
- failure classification where applicable: `LLM / BRIDGE / PROVIDER / TARGET_UI / INVALID_RUN`;
- regression delta versus the previous run and versus the Sol/GPT baseline;
- full raw MD transcript verbatim in the LLM-specific document, unless document size later requires an explicitly linked append-only transcript artifact.

Normalized verdict/analysis is additive metadata. It never replaces or rewrites the raw transcript.

## Verdict vocabulary

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