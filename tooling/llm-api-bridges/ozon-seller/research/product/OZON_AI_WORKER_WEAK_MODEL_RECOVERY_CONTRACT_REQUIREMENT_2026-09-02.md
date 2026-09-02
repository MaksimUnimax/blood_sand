# Ozon AI Worker — Weak-Model Recovery Contract Requirement

Date: 2026-09-02
Status: MANDATORY PRODUCT HARDENING REQUIREMENT DISCOVERED BY STD-01 / EXTENDED BY STD-05
Source benchmark rows: `STD-01`, `STD-05`

## Why this exists

The first Standard live benchmark exposed a product-level weakness that cannot be delegated to model intelligence.

`STD-01` asked a trivial commercial question: sales yesterday, revenue and ordered units. GPT-5.6 Sol selected the correct Standard operation and payload, but two exact `/v1/analytics/data` calls returned HTTP 429 before the same logical call later succeeded.

The important finding is not only the provider 429. GPT-5.6 Sol itself initially attempted to move to another benchmark query rather than immediately preserve the business job and repeat/investigate the same read. The operator had to enforce `NO_SKIP_ON_FAILURE`.

If the strongest baseline model can make that planning mistake, weaker consumer models are materially more likely to fail, switch endpoints, give up, invent a result, or incorrectly interpret the absence of data.

STD-05 then exposed the same general product problem in another form: `stock_on_warehouses_v2` returned two consecutive full-size `limit=100` pages while Bridge exposed `pagination:null`. GPT-5.6 Sol inferred from row count that another explicit `offset` read was needed. A weaker model may incorrectly treat the first full page as the complete dataset.

Therefore both provider-error recovery and known continuation mechanics must become Bridge/product contract capabilities rather than emergent reasoning skills expected from each AI model.

## Product principles

`DO_NOT_REQUIRE_MODEL_INTELLIGENCE_FOR_KNOWN_RECOVERY_MECHANICS`

`DO_NOT_REQUIRE_MODEL_INTELLIGENCE_TO_INFER_PAGINATION_FROM_ROW_COUNT`

The AI should reason about the business problem. The Bridge should expose deterministic machine-readable guidance for known transport/provider failure and continuation classes.

This does not relax the invariant:

`ONE EXPLICIT AI COMMAND = AT MOST ONE PHYSICAL BUSINESS API REQUEST`

Automatic hidden retry/fanout/pagination remains forbidden.

## Required 429 behavior

When a valid Bridge request reaches Ozon and receives a provider rate-limit response, the sanitized result should make all of the following explicit where evidence permits:

- `business_result_valid: false`
- `retryable: true`
- `failure_class: OZON_METHOD_RATE_LIMIT` or the strongest supported generic equivalent
- `recovery_action: REPEAT_SAME_LOGICAL_COMMAND`
- `same_operation_required: true` unless evidence proves the operation itself was wrong
- original `logical_command_fingerprint`
- `external_request_executed: true`
- `automatic_retry: false`
- `retry_after` / `retry_not_before` when supplied by Ozon
- if Ozon supplies no reset time, a Bridge-owned conservative/adaptive recommendation must be clearly labeled as local policy rather than claimed provider truth
- `do_not_interpret_as_zero_or_empty_business_data: true`
- a compact AI-facing recovery instruction that does not require the model to infer the next step from raw HTTP semantics

Illustrative contract shape only; exact schema is not frozen here:

```text
recovery: {
  retryable: true,
  action: "REPEAT_SAME_LOGICAL_COMMAND",
  same_operation_required: true,
  do_not_interpret_as_business_data: true,
  retry_not_before: "..." | null,
  timing_source: "provider_retry_after" | "bridge_local_policy" | "unknown",
  escalation: "RETRY_SAME_COMMAND" | "DIAGNOSE_AFTER_REPEATED_429"
}
```

## Repeated 429 requirement

A second provider 429 for the same logical command must not look identical to the first from the AI-planning perspective.

The Bridge should preserve enough state to expose that this is a repeated failure and escalate recovery guidance, for example:

- repeated-failure count for the quota family/logical operation;
- conservative adaptive local backoff when provider `Retry-After` is absent;
- guidance to keep the original business job active;
- after a defined evidence-backed threshold, guidance to perform a diagnostic health check rather than switch to an unrelated business query;
- explicit statement that exact provider reset semantics are unknown if Ozon did not expose them.

Do not invent a precise Ozon cooldown duration merely to make recovery deterministic.

## Pagination / continuation requirement discovered by STD-05

### Evidence

During STD-05, operation `stock_on_warehouses_v2` was called with explicit `limit=100` and offsets `0` then `100`.

Both responses:

- returned HTTP 200;
- returned exactly 100 rows;
- exposed `pagination: null` at the Bridge result level;
- required the AI to infer that another explicit offset read was likely necessary.

This is a weak-model portability gap because the result does not deterministically distinguish:

- complete dataset of exactly 100 rows;
- non-terminal page that happens to contain the full requested page size.

### Required contract behavior

For every read operation with explicit `limit/offset` semantics, Bridge should expose the strongest safe continuation state available without inventing provider truth.

Candidate machine-readable fields:

```text
continuation: {
  result_complete: true | false | null,
  page_size_requested: 100,
  rows_returned: 100,
  next_offset: 100 | null,
  next_read_recommended: true | false | null,
  terminal_signal_source: "provider" | "short_page" | "bridge_contract" | "unknown",
  automatic_pagination: false
}
```

Rules:

- never hide-follow the next page;
- never claim completeness if the provider/contract cannot prove it;
- if `rows_returned == limit` and no provider terminal signal exists, explicitly state that completeness is unknown and another explicit offset read may be required;
- if `rows_returned < limit`, Bridge may expose a `short_page` terminal signal only when the endpoint contract makes that inference safe;
- preserve exact next offset when derivable from the explicit request;
- tell the AI not to present the dataset as complete until a terminal condition is reached;
- maintain one-command/one-physical-request invariant.

### Product consequence

A weak AI should not need to know Ozon's pagination conventions or inspect row count arithmetic to continue a business investigation. Bridge should make continuation mechanics explicit while leaving the decision to issue the next read to the AI.

## Candidate implementation directions to evaluate after Sol benchmark

These are design candidates, not yet accepted implementation decisions:

1. **Recovery metadata only** — keep execution behavior unchanged but make the next action deterministic for weak models.
2. **Adaptive local cooldown state** — after provider 429 without `Retry-After`, increase the local no-send window using an explicitly Bridge-owned policy.
3. **Local preflight refusal** — if the AI resubmits too early, return `external_request_executed:false` plus exact retry guidance instead of spending another provider request.
4. **Exact retry-command echo** — expose the sanitized logical command/payload that should be repeated, so a weak model does not reconstruct or mutate it.
5. **Diagnostic escalation contract** — after repeated identical 429s, expose a deterministic next diagnostic action such as a non-analytics health check when supported.
6. **Continuation metadata** — expose explicit page completeness/next-offset guidance for offset-based reads while preserving explicit AI-issued pagination.

Any accepted design must preserve no-hidden-retry, no-hidden-pagination and one-command/one-physical-request invariants.

## Benchmark consequences

`STD-01` is not a clean PASS. It is:

`PASS_WITH_RECORDED_TRANSIENT_429_INCIDENT_AND_RECOVERY_GUIDANCE_GAP`

The business question is answerable, but first-attempt operational reliability and model-independent recovery are not yet good enough for weak-AI portability.

`STD-05` has additionally discovered:

`FULL_PAGE_WITH_NULL_PAGINATION_REQUIRES_MODEL_INFERENCE`

All later Sol rows must record whether failures or continuation mechanics required operator intervention or model-specific inference.

Before Alice Free benchmark:

1. complete the Sol Standard benchmark on the current accepted build;
2. collect all recurring weak-model contract/guidance gaps;
3. implement one evidence-backed Bridge guidance-hardening package;
4. rerun affected Sol rows on the hardened candidate;
5. only then freeze the Bridge candidate for Alice and later weaker-provider comparison.

This avoids changing the Bridge independently for every provider while also preventing the Alice benchmark from measuring raw error-code interpretation skill or pagination-guessing skill that should have been normalized by Bridge.

## Commercial significance

Preferred-AI portability is part of the product value proposition. Therefore the Bridge must normalize provider/API complexity sufficiently that weaker consumer AIs can act as reliable workers.

A product that only works because GPT-5.6 Sol can reverse-engineer raw API failures or infer continuation from page length is not commercially portable across AI providers.

## Current checkpoint

`WEAK_MODEL_RECOVERY_AND_PAGINATION_GUIDANCE_GAPS_DISCOVERED_MUST_HARDEN_AFTER_SOL_BEFORE_ALICE`
