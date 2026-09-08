# Ozon Bridge — Global Large-Text Delivery Threshold

Date: 2026-09-08
Status: `OWNER_FROZEN__IMPLEMENTATION_REQUIRED`
Scope: **the whole Ozon Bridge extension delivery pipeline**, not Performance and not any single endpoint.
Related task: `OZON_AI_WORKER_BATCH_OUTPUT_MATERIALIZATION_BOUNDARY_TASK_2026-09-07.md`

## 1. Owner decision

The live lower-bound search is complete enough for product calibration. Do not spend more provider traffic trying to find a smaller numerical interval.

The owner freezes the operational plain-text ceiling at:

`MAX_SAFE_PLAIN_TEXT_UNICODE_CHARACTERS = 1_048_000`

Required global delivery rule:

- payload length `<= 1_048_000` Unicode characters -> normal automatic plain-text composer delivery;
- payload length `> 1_048_000` Unicode characters -> do **not** stage the full payload as ordinary composer text; materialize the **complete** result into a text document, attach it to the current ChatGPT composer, automatically Send, confirm the matching user-turn, then return control to the AI.

This is an Ozon Bridge operational threshold selected from live ChatGPT-composer evidence. It is **not** an Ozon API limit and must not be documented as a provider limit.

## 2. Last owner-accepted plain-text PASS

The final live calibration point accepted by the owner as the maximum normal plain-text payload used this three-command batch:

```text
OZON_API_V1
{"operation":"performance_campaign_product","params":{"dateFrom":"2026-07-07","dateTo":"2026-09-06"}}

OZON_API_V1
{"operation":"performance_expense","params":{"dateFrom":"2026-07-07","dateTo":"2026-09-05"}}

OZON_API_V1
{"operation":"performance_daily","params":{"dateFrom":"2026-07-09","dateTo":"2026-09-06"}}
```

Observed end-to-end result:

- Bridge completed the three logical commands;
- the delivered batch appeared as a new user-turn in the chat;
- normal automatic text delivery therefore passed at this calibration point;
- the owner explicitly chose this point as the maximum plain-text operating point and ended further threshold search.

The `1_048_000` character constant is the owner-selected implementation ceiling derived from this PASS point. Do not relabel the estimated live payload size as an exact byte-for-byte measurement of that specific run unless a preserved full payload is later measured.

## 3. Nearest measured FAIL evidence

A preserved failing large-text payload from the immediately adjacent calibration series measured:

- `1,053,496` Unicode characters;
- `1,091,381` UTF-8 bytes.

At the failing class of points, Bridge successfully staged the large text in the ChatGPT composer but native Send did not become usable, so the intended automatic delivery workflow could not complete.

Earlier failing points also included approximately `1.09M` characters and the original approximately `2.16M` character batch.

The fixed `1_048_000` ceiling intentionally stays below the nearest measured FAIL point.

## 4. Required generated-text implementation behavior

### At or below the ceiling

`generated OZON_RESULT/OZON_BATCH_RESULT -> measure Unicode length -> <= 1_048_000 -> stage plain text -> native Send usable -> automatic Send -> matching user-turn -> AI continues`

### Above the ceiling

`generated OZON_RESULT/OZON_BATCH_RESULT -> measure Unicode length -> > 1_048_000 -> do not stage full plain text -> create complete text document -> attach document -> native Send usable -> automatic Send -> matching user-turn -> AI receives complete result -> AI continues`

No manual copy, cut, paste, file creation, attachment or Send is part of the supported product workflow.

The generated text document must contain the complete Bridge delivery payload. It must not silently summarize, truncate, drop logical results, or change the command/result ordering.

## 5. Keep real report/file delivery separate

This threshold applies only to **generated textual Bridge deliveries**.

It does not replace the separate real-file mechanism required by the parent task:

`Ozon report/file reference -> download original complete file -> attach original complete file -> automatic Send -> matching user-turn -> AI continues`

Two global functions therefore remain distinct:

1. `REAL_REPORT_FILE_DELIVERY` — original provider/report file is downloaded and attached as the original document.
2. `LARGE_GENERATED_TEXT_DELIVERY` — Bridge-generated text over `1_048_000` Unicode characters is materialized by the extension into a text document and attached.

Do not convert existing XLSX/CSV/report artifacts into text merely because the generated-text threshold exists.

## 6. Required regressions / live acceptance

Before this calibration can be considered implemented, regression and live evidence must prove at minimum:

- `< threshold` generated text still uses plain-text auto-delivery;
- `= threshold` follows the defined plain-text branch deterministically;
- `> threshold` never stages the full oversized payload as ordinary composer text;
- `> threshold` creates a complete text document and attaches it;
- attachment Send is automatic;
- matching user-turn confirmation still works;
- exactly-once delivery remains intact;
- no hidden resend/retry is introduced;
- no stale BUSY state remains;
- Manual and Autorun share the intended representation-selection rule;
- real Ozon report/file delivery remains a separate original-file attachment path.

## 7. Work ordering / CAP-24

The numerical text-boundary search is now closed by owner decision.

The remaining mandatory pre-resume work is to recalibrate / implement / live-accept both global delivery functions:

1. real report/file download -> original document attachment -> automatic Send;
2. generated text representation switch using the frozen `1_048_000` character ceiling.

Frozen business cursor remains:

`CAP-24 = 2200 / 9519`

Do not resume or restart CAP-24 until the parent global-delivery task completion gate passes.
