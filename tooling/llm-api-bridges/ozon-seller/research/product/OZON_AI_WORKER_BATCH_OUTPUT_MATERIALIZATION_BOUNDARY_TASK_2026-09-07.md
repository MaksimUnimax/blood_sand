# Ozon AI Worker — Batch Output / Composer Materialization Boundary Task

Date: 2026-09-07
Status: `OPEN__MUST_COMPLETE_BEFORE_RESUMING_FROZEN_CAP24_CURSOR_2200_OF_9519`
Scope: live orchestration/output/delivery boundary characterization; no executable Bridge patch is authorized by this task.
Related authority: `OZON_AI_WORKER_EXPLICIT_BATCH_ORCHESTRATION_DEFECT_AND_RULE_2026-09-06.md`

## Why this task exists

The explicit-batch authority already requires bounded batches and explicitly warns that an oversized response can create avoidable output/materialization risk. The current live Performance batch has now produced direct evidence of that risk.

The five-command Performance batch completed on the business/provider side:

- `result_count = 5`;
- `logical_business_result_count = 5`;
- `physical_business_request_count = 5`;
- all five logical results returned provider `HTTP 200`;
- no capability probe was required.

However, the single delivered `OZON_BATCH_RESULT_V1` was extremely large. The preserved user-side text copy measures approximately:

- `2,161,883` Unicode characters;
- `2,207,799` UTF-8 bytes.

Approximate contribution by logical result in the preserved batch text:

- result 1 / `performance_campaigns`: ~1,091,072 characters;
- result 2 / `performance_expense`: ~292,150 characters;
- result 3 / `performance_daily`: ~379,574 characters;
- result 4 / `performance_campaign_product`: ~391,714 characters;
- result 5 / `performance_media`: ~6,852 characters.

Observed live UI behavior:

1. Bridge delivery inserted the very large result visibly into the ChatGPT composer as text.
2. The native ChatGPT send button did not become enabled, so the operator could not send the injected text normally.
3. After the operator cut the text and pasted it manually, ChatGPT converted the large paste into a document/file attachment; only then could it be attached/sent through the normal UI path.

This means provider/business execution passed while the end-to-end operator workflow hit a separate output/materialization/composer-admission boundary.

Do not classify the cause yet as a Bridge bug or as a ChatGPT platform limit. The current evidence proves the failing boundary, not its root cause.

## What is being tested at the same time

This live work has two simultaneous purposes:

1. **Commercial/business boundary testing** — establish which Performance advertising reads the Ozon Seller Bridge can actually execute and what seller work they can replace or accelerate.
2. **Operational batch-size/output boundary testing** — determine how much successful provider evidence can be returned in one `sequential_batch_single_delivery` before the delivery becomes impractical or unsendable in the target ChatGPT composer workflow.

The second purpose is required by the existing explicit-batch rule: batching must remove needless operator round trips without creating an oversized output/materialization failure.

## Boundary-search method

Continue with smaller, bounded live requests. Do not repeat the 2.2 MB batch merely to reproduce the same failure.

For each run record:

- exact explicit commands and parameters;
- logical result count;
- physical business request count;
- provider HTTP status per item;
- exact delivered text character/byte size when measurable;
- whether text is visibly inserted into the composer;
- whether the native send button becomes enabled;
- whether ChatGPT automatically/materially converts the payload into an attachment;
- whether manual cut/paste changes the representation;
- whether Bridge returns to READY / leaves no stale BUSY state.

Reduce one dimension at a time where practical:

- fewer independent commands per batch;
- smaller date windows for statistics reads;
- explicit bounded page/page-size where the operation supports it;
- narrower campaign/SKU scope when already-known identifiers are valid for the selected operation.

Prefer a small number of high-information tests. The aim is to bracket the boundary, not generate unnecessary provider traffic.

## Required evidence before this task is closed

At minimum establish:

- a largest known passing delivered payload;
- a smallest known failing delivered payload, or a sufficiently narrow bounded interval if an exact threshold is not stable;
- whether failure correlates primarily with total delivered text size, a specific operation/result shape, composer injection semantics, or another reproducible condition;
- whether the failure occurs before or after Bridge delivery completion;
- whether native user paste and Bridge injection are treated differently by ChatGPT for the same/similar payload size;
- a safe orchestration/batch-sizing rule that can be persisted without inventing a provider limit.

Classification at closure must distinguish one of:

- `BRIDGE_EXECUTION_DEFECT`;
- `BRIDGE_DELIVERY_OR_COMPOSER_INTEGRATION_DEFECT`;
- `OUTPUT_OR_ARTIFACT_GAP`;
- `CHATGPT_COMPOSER_PLATFORM_BOUNDARY`;
- `DOCUMENTED_ORCHESTRATION_LIMIT_NO_PATCH_REQUIRED`;
- another evidence-backed class if the observations prove it.

If an executable Bridge change is needed, implementation still requires explicit operator authorization and the full dependency / regression / package / live gate process.

## Execution ordering

This task is an explicit pre-resume side task for the currently frozen CAP-24 continuation.

Current frozen business cursor:

`CAP-24 offset = 2200 / 9519`

Required ordering:

`smaller Performance/output boundary runs -> bracket delivery/materialization limit -> classify/persist safe batch-size guidance -> only then resume frozen CAP-24 from offset 2200 (do not restart)`

The separate `review_list` live `HTTP 403` boundary observed after the freeze remains evidence to preserve, but it does not replace this output/materialization task and does not change the CAP-24 saved cursor.
