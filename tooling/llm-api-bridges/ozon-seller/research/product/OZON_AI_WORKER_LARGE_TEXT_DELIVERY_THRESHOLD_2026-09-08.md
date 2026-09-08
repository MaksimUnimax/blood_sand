# Ozon Bridge — ChatGPT-Calibrated Large-Text Threshold inside the Multi-AI Delivery Architecture

Date: 2026-09-08
Status: `OWNER_FROZEN_CHATGPT_THRESHOLD__MULTI_AI_IMPLEMENTATION_REQUIRED`
Scope: **the whole Ozon Bridge extension delivery architecture**, not Performance and not any single endpoint. The numeric threshold frozen in this document is calibrated only for the ChatGPT adapter and must not be treated as a universal limit for every AI.
Related task: `OZON_AI_WORKER_BATCH_OUTPUT_MATERIALIZATION_BOUNDARY_TASK_2026-09-07.md`
Related multi-AI roadmap: `OZON_BRIDGE_MULTI_AI_MIGRATION_ROADMAP_2026-08-13.md`

## 1. Owner decision — preserve the calibration, correct the scope

The live lower-bound search performed in ChatGPT is complete enough for the ChatGPT adapter. Do not spend more provider traffic trying to find a smaller numerical interval for ChatGPT.

The owner freezes the ChatGPT operational plain-text ceiling at:

`CHATGPT_MAX_SAFE_PLAIN_TEXT_UNICODE_CHARACTERS = 1_048_000`

Required ChatGPT delivery rule:

- payload length `<= 1_048_000` Unicode characters -> normal automatic plain-text ChatGPT composer delivery;
- payload length `> 1_048_000` Unicode characters -> do **not** stage the full payload as ordinary ChatGPT composer text; materialize the **complete** result into a text document, attach it to the current ChatGPT composer, automatically Send, confirm the matching user-turn, then return control to the AI.

This is an Ozon Bridge **ChatGPT-adapter threshold** selected from live ChatGPT-composer evidence. It is **not** an Ozon API limit, not a provider limit, and not a proven Alice / DeepSeek / Grok / Claude / Gemini / Qwen / Kimi limit.

The earlier wording `MAX_SAFE_PLAIN_TEXT_UNICODE_CHARACTERS = 1_048_000` as a universal global threshold is superseded by this owner correction. The numeric decision remains frozen for ChatGPT; only its scope is corrected.

## 2. Multi-AI target set that the delivery architecture must account for

The shared delivery architecture must be designed for the complete planned AI set, not as a ChatGPT-only patch:

1. ChatGPT;
2. Alice;
3. DeepSeek;
4. Grok;
5. Claude;
6. Gemini;
7. Qwen;
8. Kimi.

Current roadmap roles remain unchanged unless separately revised:

- ChatGPT, Alice and DeepSeek are the first mandatory migration-proof adapters;
- Grok, Claude, Gemini, Qwen and Kimi are additional planned adapter targets that must already be accounted for by the common delivery contract so later support does not require special-case core logic.

For the current file-delivery / large-text work, **all eight are architecture targets** even when a concrete adapter has not yet been implemented or live-certified.

## 3. Per-AI capability rule — no universal composer/file assumptions

The common bridge core must not contain a hard-coded assumption such as:

`all AIs share the ChatGPT 1_048_000-character limit`

or:

`all AIs accept the same original report file formats`.

Representation selection belongs to the target AI adapter/profile through capabilities equivalent to:

- `plain_text_max_chars`;
- `attachments_supported`;
- accepted MIME types/extensions;
- maximum attachment bytes;
- maximum files per turn;
- supported attachment strategy/profile version;
- attachment-ready detection;
- send-ready detection;
- delivery confirmation semantics.

The common core owns artifact integrity, representation selection using the adapter capability contract, exactly-once delivery ownership, recovery/no-replay semantics and provider isolation. Site-specific DOM selectors and upload mechanics remain adapter responsibilities.

Current threshold authority:

| AI | Plain-text ceiling authority | File/document handling status for this task |
|---|---|---|
| ChatGPT | `1_048_000` Unicode characters, owner-frozen from live evidence | Generated text-document + original-file delivery must be implemented/live-accepted |
| Alice | `PENDING_LIVE_CALIBRATION` | Adapter-specific format/size behavior required; do not inherit ChatGPT limits |
| DeepSeek | `PENDING_LIVE_CALIBRATION` | Current consumer-web document attachment contract must be live/currently verified before PASS |
| Grok | `PENDING_LIVE_CALIBRATION` | Adapter-specific attachment capability/profile required |
| Claude | `PENDING_LIVE_CALIBRATION` | Adapter-specific attachment capability/profile required |
| Gemini | `PENDING_LIVE_CALIBRATION` | Adapter-specific attachment capability/profile required |
| Qwen | `PENDING_LIVE_CALIBRATION` | Official product surface supports document/data-file upload, but exact consumer-web limits and DOM flow require adapter/live verification |
| Kimi | `PENDING_LIVE_CALIBRATION` | Official Kimi web/help surface supports document/file upload; exact adapter DOM flow still requires live verification |

No `PENDING_LIVE_CALIBRATION` row may be promoted to the ChatGPT threshold without direct evidence.

## 4. Current official file-capability evidence relevant to Qwen and Kimi

Qwen is now an explicit planned AI target. Current official Qwen product material describes uploading structured or unstructured data files such as CSV, Excel and text documents for analysis, and Qwen DeepResearch material describes local-file integration including PDF and Excel. Exact consumer-web size/count limits and the exact attachment DOM mechanism remain a live-adapter question rather than a core assumption.

Current evidence entry points:

- `https://qwen.ai/qwenchat`
- `https://qwen.ai/blog?id=qwen-deepresearch`

Kimi is now an explicit planned AI target. Current official Kimi Help Center material states that normal Kimi chat supports file processing including PDF, Word, Excel, PPT, images, TXT and video, with up to 100 MB per file and up to 50 files in the documented product surface. The extension still must prove the actual current browser attachment mechanism and automatic Send/confirmation path before Kimi delivery is marked PASS.

Current evidence entry points:

- `https://www.kimi.com/en/help/new-user-guide/overview`
- `https://www.kimi.com/en/help/features/project`

These product-level statements prove that Qwen and Kimi belong in the document-delivery capability model. They do not prove our extension selectors, upload strategy, safe plain-text threshold, or exactly-once end-to-end delivery for those sites.

## 5. Last owner-accepted ChatGPT plain-text PASS

The final live ChatGPT calibration point accepted by the owner as the maximum normal plain-text payload used this three-command batch:

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
- the delivered batch appeared as a new user-turn in ChatGPT;
- normal automatic ChatGPT text delivery therefore passed at this calibration point;
- the owner explicitly chose this point as the maximum ChatGPT plain-text operating point and ended further ChatGPT threshold search.

The `1_048_000` character constant is the owner-selected ChatGPT implementation ceiling derived from this PASS point. Do not relabel the estimated live payload size as an exact byte-for-byte measurement of that specific run unless a preserved full payload is later measured.

## 6. Nearest measured ChatGPT FAIL evidence

A preserved failing large-text payload from the immediately adjacent ChatGPT calibration series measured:

- `1,053,496` Unicode characters;
- `1,091,381` UTF-8 bytes.

At the failing class of points, Bridge successfully staged the large text in the ChatGPT composer but native Send did not become usable, so the intended automatic delivery workflow could not complete.

Earlier failing ChatGPT points also included approximately `1.09M` characters and the original approximately `2.16M` character batch.

The fixed ChatGPT `1_048_000` ceiling intentionally stays below the nearest measured ChatGPT FAIL point.

## 7. Required generated-text implementation behavior

### Shared behavior

`generated OZON_RESULT/OZON_BATCH_RESULT -> measure payload -> query target AI adapter delivery capabilities -> choose safe representation -> stage/attach -> automatic Send -> matching user-turn -> AI continues`

### ChatGPT at or below its ceiling

`generated result -> <= 1_048_000 -> stage plain text -> native Send usable -> automatic Send -> matching user-turn -> AI continues`

### ChatGPT above its ceiling

`generated result -> > 1_048_000 -> do not stage full plain text -> create complete text document -> attach document -> native Send usable -> automatic Send -> matching user-turn -> AI receives complete result -> AI continues`

### Other AIs

For Alice / DeepSeek / Grok / Claude / Gemini / Qwen / Kimi, the corresponding plain-text/document switching rule remains adapter-specific and must be calibrated or safely capability-gated. Until a threshold is proven, the core must not silently reuse the ChatGPT value.

No manual copy, cut, paste, file creation, attachment or Send is part of the supported product workflow.

The generated text document must contain the complete Bridge delivery payload. It must not silently summarize, truncate, drop logical results, or change the command/result ordering.

## 8. Keep real report/file delivery separate

The ChatGPT numeric threshold applies only to **generated textual Bridge deliveries through the ChatGPT adapter**.

It does not replace the separate real-file mechanism required by the parent task:

`Ozon report/file reference -> download original complete file -> target AI adapter capability check -> attach original complete file when supported -> automatic Send -> matching user-turn -> AI continues`

Two shared source classes therefore remain distinct:

1. `REAL_REPORT_FILE_DELIVERY` — original provider/report file is downloaded and preserved byte-complete.
2. `LARGE_GENERATED_TEXT_DELIVERY` — Bridge-generated text may be materialized by the extension into a text document when the target AI's representation policy requires it.

For a real provider file, the core must ask the target adapter whether that original MIME/extension is supported. If supported, attach the original bytes. If not supported, do not pretend the original file was delivered. Use an explicit safe failure or a separately designed and provenance-preserving derived-file fallback. Any derived artifact must remain distinguishable from the original provider file.

Do not convert existing XLSX/CSV/report artifacts into text merely because a generated-text threshold exists.

## 9. Required regressions / live acceptance

Before this calibration can be considered implemented, regression and live evidence must prove at minimum for ChatGPT:

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

The common-core regression contract must also prove that:

- the numeric ChatGPT threshold is read through ChatGPT adapter/profile capability rather than hard-coded as a universal AI constant;
- switching to another AI cannot accidentally inherit ChatGPT DOM selectors or file-format assumptions;
- unsupported file types fail or use an explicitly designed derived-artifact path without corrupting original-file provenance;
- future Qwen and Kimi adapters can implement the same generic attachment/delivery contract without core special cases.

Each additional AI is marked delivery PASS only after its own live/browser adapter evidence exists. Architecture support is not the same as live acceptance.

## 10. Work ordering / CAP-24

The numerical ChatGPT text-boundary search is now closed by owner decision.

The remaining mandatory pre-resume work is to design / implement / live-accept both shared delivery functions without a ChatGPT-only core hack:

1. real report/file download -> preserve original -> target-adapter capability check -> attachment -> automatic Send;
2. generated text representation switch -> target-adapter policy, using the frozen `1_048_000` character ceiling specifically for ChatGPT and independently calibrated/capability-gated rules for other AIs.

Frozen business cursor remains:

`CAP-24 = 2200 / 9519`

Do not resume or restart CAP-24 until the parent global-delivery task completion gate passes.
