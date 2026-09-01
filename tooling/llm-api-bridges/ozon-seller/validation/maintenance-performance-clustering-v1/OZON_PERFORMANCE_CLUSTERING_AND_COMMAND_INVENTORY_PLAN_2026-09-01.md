# Ozon Bridge — Performance clustering, command inventory and bounded-response plan

Date: 2026-09-01
Status: IN_PROGRESS
Scope: Ozon API behavior and command guidance only. UI excluded.

## Owner-ordered sequence — do not reorder

1. Keep the existing intended behavior for advertising requests:
   - generic `campaigns` request -> use explicit `page` / `pageSize` (bounded result, e.g. 100);
   - `latest` / `newest` campaigns -> choose a command/path that allows deterministic newest-first behavior without hidden Ozon requests; where Ozon provides no server sort, local deterministic sorting may be used only after the single provider response and must be explicit in result metadata;
   - campaigns/statistics by product -> use product-oriented Performance endpoints rather than dumping all campaigns;
   - concrete campaigns -> use `campaignIds`;
   - active campaigns -> use `state`.
2. Before implementing the advertising sorting/bounded-response patch, inspect the project documentation and current clustering implementation.
3. Determine exactly why clustering exists, how a request moves from AI -> Bridge guidance -> AI command selection -> Bridge -> Ozon, and preserve that workflow.
4. Audit whether every current operation added by the latest patches is present in the operation registry / cluster guidance. Do not assume coverage.
5. Propose a revised clustering model consistent with the expanded command surface. Reuse existing clusters where semantically correct; add/restructure clusters only where needed.
6. Advertising guidance must behave as a two-step explicit command selection flow when the initial intent is underspecified:
   - AI sends an advertising intent/request to the extension;
   - Bridge returns the matching available command choices / sort-filter alternatives to the AI, without a hidden business request when a command still needs to be selected;
   - AI reads the guidance, chooses one exact command and sends a new explicit command;
   - Bridge executes that exact command and returns the Ozon result;
   - no hidden pagination, fan-out, retry, or autonomous follow-up provider calls.
7. Produce/export one JSON inventory containing all current operations and the fields needed for manual coverage review, including at minimum alias, provider, method, path, effect, currentness, safety/privacy, cluster, section, guidance visibility, workflow role, purpose and template.
8. Give the owner a direct command to obtain/download that JSON and manually verify that all current commands are present.
9. ONLY AFTER the command JSON is reviewed/accepted, implement the advertising sorting/bounded-response patch.
10. Persist findings, proposed clustering and later patch evidence in GitHub so the task survives chat/network interruption.

## Invariants

- One explicit business command -> at most one physical Ozon business request.
- No hidden pagination.
- No hidden retry.
- No hidden fan-out.
- No autonomous multi-command workflow after guidance.
- Guidance may suggest exact next commands but execution requires a new explicit AI command.
- Personal Data gate semantics remain unchanged.
- Seller and Performance provider isolation remains unchanged.
- Existing accepted operations must not disappear during clustering refactor.

## Required deliverables before advertising patch

- `CLUSTERING_CURRENT_STATE_AUDIT`: current cluster/section/guidance architecture and purpose.
- `CURRENT_OPERATION_CLUSTER_COVERAGE`: exact current-operation coverage, including latest Seller + Performance additions, with missing/orphaned/hidden mismatches enumerated.
- `PROPOSED_CLUSTERING_V2`: proposed cluster and section structure plus migration map from existing cluster IDs.
- `CURRENT_OPERATIONS_EXPORT.json`: machine-readable complete current command inventory for owner review.
- Owner download/export command for that JSON.
- Owner confirmation that inventory is complete.

## Advertising patch — blocked until owner inventory review

Patch is explicitly BLOCKED until the owner reviews `CURRENT_OPERATIONS_EXPORT.json`.

Planned behavior after unblock:

- Generic campaigns: explicit bounded page/pageSize default/recommendation.
- Latest/newest: deterministic newest-first selection/sort semantics, with metadata describing whether sorting occurred provider-side or locally after one provider response.
- By product: route guidance to product-oriented Performance reads.
- Concrete campaigns: `campaignIds`.
- Active campaigns: `state`.
- Underspecified advertising intent: Bridge guidance returns available exact command alternatives first; AI sends a second explicit command; only then is a provider request executed.

## Current live finding motivating the work

`performance_campaigns` returned 1128 full campaign objects in one successful provider response. The model-visible batch was approximately 1.35 MB and ChatGPT displayed a connection-interrupted message. Provider/API correctness passed; bounded result/guidance behavior requires maintenance.
