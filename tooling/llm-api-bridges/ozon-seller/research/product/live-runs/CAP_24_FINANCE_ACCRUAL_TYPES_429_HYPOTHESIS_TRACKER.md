# CAP-24 — finance_accrual_types 429 hypothesis tracker

Date opened: 2026-09-06
Status: `LIVING_EVIDENCE_LOG__HYPOTHESIS_NOT_PROVEN`
Branch: `repair/ozon-date-contract-2026-09-04`
Runtime under observation: `ozon-llm-api-bridge v0.1.19`
Provider method under study: `POST /v1/finance/accrual/types`

## Purpose

This file is the persistent statistics/evidence log for the recurring provider HTTP 429 observed on `finance_accrual_types` during CAP-24.

The purpose is specifically to prevent an inference from being promoted into a fact without enough evidence.

This tracker must be updated whenever a new `/v1/finance/accrual/types` attempt is observed, whether it succeeds or fails.

## Authority rule

The following distinction is mandatory:

### Proven causal scope

Current live evidence proves only that the 429 behavior is provider-side and localized to `/v1/finance/accrual/types` or to a provider resource-protection state specific to that method.

Current proven class:

`METHOD_SPECIFIC_PROVIDER_THROTTLE_OR_STATE__FINANCE_ACCRUAL_TYPES`

The following broader explanations were rejected by controls:

- permanent endpoint/entitlement failure — rejected because `/types` returned HTTP 200 in Run 02;
- provider-wide hard Seller API / Client-ID block — rejected by `seller_product_list` HTTP 200 in Run 05;
- hard block shared by the entire new finance-accrual family — rejected/strongly contradicted by `finance_accrual_by_day` HTTP 200 in Run 06 immediately before `/types` returned 429 again in Run 07.

### H1 — hypothesis being tracked, NOT proven

`H1_REPEATED_IDENTICAL_TYPES_CALLS_TRIGGER_OR_PROLONG_METHOD_SPECIFIC_ANTI_REPEAT_CIRCUIT_OR_ADAPTIVE_DYNAMIC_QUOTA`

Exact wording:

> Repeated identical calls to the beta reference method `POST /v1/finance/accrual/types` may trigger or prolong an Ozon method-specific anti-repeat circuit / adaptive dynamic quota state.

`H1_STATUS = NOT_PROVEN`

Evidence that is consistent with H1 is not equivalent to proof of H1.

The earlier document `CAP_24_FINANCE_ACCRUAL_TYPES_ROOT_CAUSE_AND_OPERATING_SOLUTION_2026-09-06.md` used stronger wording (`METHOD_SPECIFIC_ANTI_REPEAT_CIRCUIT_OR_DYNAMIC_METHOD_QUOTA__FINANCE_ACCRUAL_TYPES`). For trigger-mechanism confidence, this tracker supersedes that wording: anti-repeat/repetition as the trigger remains a hypothesis until discriminating evidence proves it.

### Alternative hypotheses that remain live

- `H2_TRANSIENT_BETA_METHOD_INSTABILITY_INDEPENDENT_OF_REPEAT_PATTERN`
- `H3_UNDOCUMENTED_METHOD_SPECIFIC_QUOTA_WITH_TRIGGER_OTHER_THAN_IDENTICAL_REPETITION`
- `H4_EXTERNAL_OR_CONCURRENT_USE_OF_SAME_CREDENTIALS_INFLUENCES_METHOD_STATE`
- `H5_OTHER_PROVIDER_INTERNAL_RESOURCE_STATE_NOT_VISIBLE_TO_CLIENT`

Do not collapse these alternatives into H1 without evidence.

## Known /types attempts and incidents

### Historical incidents before Run 02

The original CAP-24 diagnosis commit `3d883215590948ee2537884ca69a1399d75fc370` recorded that the active finance sequence reached real provider HTTP 429 on `finance_accrual_types` **twice**, both exposing `Retry-After: 1`, after a preceding successful `finance_accrual_postings` request.

The individual request IDs/fingerprints for those two historical attempts were not preserved in that diagnosis file and have not been recovered from the currently checked evidence. They are therefore kept as two distinct historical observations with unknown IDs, not merged and not fabricated.

| ID | Evidence level | Operation | Request ID | Fingerprint | Preceding known context | HTTP | Provider code | Retry-After | Physical requests | Interpretation |
|---|---|---|---|---|---|---:|---|---|---:|---|
| HIST-01 | historical diagnosis, individual ID not recovered | `finance_accrual_types` | `NOT_RECOVERED` | `NOT_RECOVERED` | finance sequence; preceding `/postings` had succeeded | 429 | not preserved in diagnosis | `1` | external provider call occurred | first of two early `/types` 429s; supports method-specific failure class, trigger not proven |
| HIST-02 | historical diagnosis, individual ID not recovered | `finance_accrual_types` | `NOT_RECOVERED` | `NOT_RECOVERED` | same active finance investigation | 429 | not preserved in diagnosis | `1` | external provider call occurred | second of two early `/types` 429s; repeated failure observed, trigger not proven |

### Direct identified attempts

| ID | Operation | Request ID | Fingerprint | Preceding known context | HTTP | Provider code | Retry-After | Physical requests | What it proves / does not prove |
|---|---|---|---|---|---:|---|---|---:|---|
| RUN-02 | `finance_accrual_types` | `6ceb04e1-5721-4d61-9f54-021c3c9f062d` | `405f0634` | isolated after quiet period | 200 | — | — | 1 | endpoint is callable; permanent block/entitlement failure rejected; does not establish why other attempts 429 |
| RUN-03 | `finance_accrual_types` | `afff2a40-88cd-4a05-98fa-500f15b305bd` | `405f0634` | one-request batch; exact interval since prior success not encoded | 429 | `8` | `1` | 1 | same exact command can later 429; `/postings` is not required in the same batch; trigger still unknown |
| RUN-04 | `finance_accrual_types` | `689f9bfb-0666-4a2e-a0f0-2f8fb275e011` | `405f0634` | supplied as requested quiet-baseline test; exact wall-clock wait not encoded in result | 429 | `8` | `1` | 1 | simple immediate-repeat explanation is insufficient if operator quiet window was observed; exact reset rule unknown |
| RUN-07 | `finance_accrual_types` | `2f01d55b-6ff3-4449-b1f8-b8da9c44ed9d` | `405f0634` | immediately after successful same-family `/by-day` Run 06 | 429 | `8` | `1` | localizes failing state to `/types`/method-specific protection; rejects hard family-wide block as primary explanation; repetition trigger still not proven |

## Control observations

These controls are not `/types` attempts and must never be counted in the `/types` 429 denominator. They are included only to localize scope.

| Control | Operation | Request ID | Fingerprint | HTTP | Meaning |
|---|---|---|---|---:|---|
| CONTROL-05 | `seller_product_list` | `b43da9ca-373e-4797-8748-a363af720268` | `9d82cd2e` | 200 | provider-wide hard Seller API / Client-ID block not active at that moment |
| CONTROL-06 | `finance_accrual_by_day` | `2a87e47f-78bf-4de7-999f-d0a22c34a4d2` | `5940f840` | 200 | sibling finance-accrual method operational; immediately followed by RUN-07 `/types` 429 |

### Explicit exclusion

`CAP_24_RUN_01_RATE_LIMIT_2026-09-06.md` is an `analytics_data` local/provider-quota case and is **not** a `/types` incident. It must not be included in the statistics below.

## Current statistics

Two views are maintained because the two earliest 429s lack individual request IDs.

### A. Direct identified `/types` attempts only

- identified attempts: `4`
- HTTP 200: `1`
- HTTP 429: `3`
- observed 429 rate: `3 / 4 = 75%`
- identified 429s with provider code `8`: `3 / 3`
- identified 429s with `Retry-After: 1`: `3 / 3`
- identified 429s with exact fingerprint `405f0634`: `3 / 3`
- identified success with exact fingerprint `405f0634`: `1 / 1`
- same-family control HTTP 200 immediately before `/types` 429: `1` sequence (RUN-06 -> RUN-07)
- non-finance control HTTP 200 while `/types` failing: `1` sequence/control (CONTROL-05)

### B. Minimum known history including the two earlier diagnosis-recorded 429s

- minimum known `/types` attempts: `6`
- known HTTP 200: `1`
- known HTTP 429: `5`
- minimum-known observed 429 proportion: `5 / 6 ~= 83.3%`

The `83.3%` figure is descriptive only. The test sequence was intentionally diagnostic and is not a random sample of normal production traffic, so it must not be interpreted as a production failure probability.

## Evidence relation to H1

### Evidence consistent with H1

- multiple identical identified commands used the same fingerprint `405f0634`;
- one such command succeeded, later identical commands repeatedly returned 429;
- the failure is method-specific in the observed controls;
- Ozon documentation warns that many identical or erroneous requests may cause restrictions and documents method-level protection states;
- `/types` is a reference/beta method, so repeatedly refetching the same dictionary is not necessary for ordinary transaction-data acquisition.

### Evidence that prevents H1 from being called proven

- exact wall-clock timing between most `/types` attempts is not preserved;
- RUN-04 result does not itself encode the instructed quiet duration;
- literal provider error message was not preserved in model-visible evidence, so `Circle is open` cannot be confirmed for these historical 429s;
- provider code `8` / `RESOURCE_EXHAUSTED` establishes resource/quota-style exhaustion but not the exact trigger;
- no official numeric `/types` request threshold/reset interval has been found;
- external/concurrent use of the same credentials has not been excluded for every interval;
- no controlled experiment has yet compared repeated-identical `/types` calls against a matched non-repeated `/types` condition because `/types` has no meaningful variable request payload;
- beta-method instability independent of repetition remains possible.

Therefore:

`H1_CONFIDENCE = SUPPORTED_BUT_NOT_PROVEN`

This confidence label must not be upgraded merely because another 429 occurs. A new 429 adds frequency evidence; it does not by itself identify the trigger.

## What would materially strengthen or weaken H1

### Strengthen H1

- provider raw/sanitized diagnostic literal identifying `Circle is open` or another explicit method anti-repeat/circuit condition;
- official Ozon documentation of a `/types`-specific repetition/quota rule;
- controlled timestamped sequence where a proven recovered `/types` succeeds and repeated identical access reproducibly transitions the same method into a protection state while matched controls remain healthy;
- reproduction across separate clean credential/client environments with no concurrent Ozon usage.

### Weaken H1

- `/types` 429 on a first-ever request in a genuinely fresh Client ID / credential environment;
- official Ozon evidence that the 429 is caused by a different condition unrelated to repetition;
- repeated `/types` successes under the same timing/load pattern that previously supposedly triggers H1;
- correlated provider incident affecting `/types` independent of client request history.

## Future append protocol

Every future explicit `finance_accrual_types` attempt must be appended to this file with, when available:

1. absolute timestamp/start/end;
2. request_id;
3. fingerprint;
4. HTTP status;
5. provider code;
6. `Retry-After`;
7. physical request count;
8. immediately preceding Ozon operation and its status;
9. measured interval since the previous `/types` attempt;
10. whether any other client/process could have used the same credentials;
11. whether this was a business-required dictionary refresh or a diagnostic test;
12. interpretation separated from raw facts.

Rules:

- append both successes and failures;
- never delete a historical row; if interpretation changes, mark it superseded/corrected;
- never invent missing timestamps/request IDs;
- never count non-`/types` 429s in this tracker;
- do not call `/types` solely to increase the sample size unless an explicit diagnostic experiment is authorized;
- do not turn `Retry-After: 1` into a fixed local one-second policy without provider evidence;
- do not label H1 as fact until discriminating evidence closes the alternatives.

## Operational note separate from hypothesis statistics

A successful 124-row `/types` dictionary already exists from Run 02. CAP-24 can use that provider-derived dictionary to decode known `type_id` values while acquiring changing finance facts from `/by-day` and `/postings`.

That operating pattern is useful even if H1 later proves false, because `/types` is a reference dictionary and repeated refetching is not required for every finance transaction read.

## Current tracker state

`PROVEN_SCOPE = METHOD_SPECIFIC_PROVIDER_THROTTLE_OR_STATE__FINANCE_ACCRUAL_TYPES`

`H1 = REPEATED_IDENTICAL_CALLS_MAY_TRIGGER_OR_PROLONG_ANTI_REPEAT_CIRCUIT_OR_DYNAMIC_QUOTA`

`H1_STATUS = SUPPORTED_BUT_NOT_PROVEN`

`DIRECT_IDENTIFIED_TYPES_ATTEMPTS = 4`

`DIRECT_IDENTIFIED_429 = 3`

`HISTORICAL_ADDITIONAL_429_WITHOUT_RECOVERED_IDS = 2`

`MINIMUM_KNOWN_TYPES_ATTEMPTS = 6`

`MINIMUM_KNOWN_TYPES_429 = 5`
