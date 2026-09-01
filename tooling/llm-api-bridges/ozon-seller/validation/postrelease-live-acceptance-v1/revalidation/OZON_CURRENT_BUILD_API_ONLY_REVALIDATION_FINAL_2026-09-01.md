# Ozon Bridge v0.1.19 — current-build API-only live revalidation

Date: 2026-09-01  
Scope: Ozon API behavior only; UI excluded.  
Installable SHA-256: `f954dd7cd7b8ab62cfceddcca3e700ef91794801b9082595cfd39a00120e7574`

## Decision

`OZON_API_ONLY_REVALIDATION_COMPLETE`

Status: `COMPLETE_WITH_NONBLOCKING_FIXTURE_LIMITATION_AND_RESPONSE_SIZE_ISSUE`

No further live Ozon request is required for this revalidation.

## Verified live

- Seller API credentials, fixed provider routing and representative reads: PASS.
- Seller catalog, analytics, FBS, finance, returns and rating reads: PASS.
- Performance API credentials/routing and representative reads: PASS.
- One explicit business command -> one physical business request for every command that reached provider: PASS.
- Automatic retry observed: 0.
- Hidden pagination request observed: 0.
- Capability probes observed during these runs: 0.
- Credentials/Bearer token exposed in model-visible result: no.
- Seller sensitive address redaction observed: PASS.
- Performance CSV binary/base64 transport: PASS; declared and decoded byte length matched.
- Personal Data OFF: representative gated reads blocked before provider: PASS.
- Personal Data ON: a new explicit `review_list` command reached provider: PASS; provider returned 403 permission, which is separate from the Bridge privacy policy.
- Provider error handling without retry: PASS (400 and 403 samples observed, no automatic retry).

## Final request accounting

- Submitted commands: 23.
- Terminal logical business results that reached provider: 19.
- Physical Ozon business requests: 19.
- HTTP 200: 15.
- Provider HTTP 400: 2.
- Provider HTTP 403: 2.
- Policy-blocked before provider: 3.
- Local guidance rejection caused by the original invalid `review_list limit=10` test input: 1.
- Automatic retries: 0.
- Hidden pagination requests: 0.

## PDF / PNG live-success fixture limitation

Two read-only fixture paths were checked without creating/mutating Ozon state:

1. Return giveout path: `return_giveout_list` returned HTTP 200 with zero giveouts.
2. FBS act path: after correcting provider date semantics to `YYYY-MM-DD`, `fbs_act_list` returned HTTP 200 with an empty result.

Therefore:

- PDF success live test: `LIVE_FIXTURE_UNAVAILABLE`.
- PNG success live test: `LIVE_FIXTURE_UNAVAILABLE`.
- Personal Data OFF policy gate for the PDF and PNG operations: PASS.
- This is not classified as a Bridge failure because no eligible current account entity exists and the test must not manufacture or mutate marketplace state solely to create a fixture.

## Open maintenance finding

`PERFORMANCE_CAMPAIGNS_OVERSIZED_MODEL_VISIBLE_RESPONSE`

A live `performance_campaigns` read returned 1128 full campaign objects. The resulting model-visible batch was approximately 1.35 MB and ChatGPT displayed a connection-interrupted message, although the complete batch was preserved in the attached result and all six Performance API calls had completed successfully.

Provider/API correctness: PASS.  
Reliability finding: OPEN FOR MAINTENANCE.

Recommended remediation: introduce a deterministic bounded response strategy for very large reads (explicit page/limit support, safe projection, or explicit truncation metadata) while preserving the no-hidden-pagination and one-command/one-request invariants.

## Roadmap handoff

Current live revalidation is complete. The next engineering task is not another live Ozon run. It is a maintenance change for oversized Performance responses, followed by targeted regression testing of that change.
