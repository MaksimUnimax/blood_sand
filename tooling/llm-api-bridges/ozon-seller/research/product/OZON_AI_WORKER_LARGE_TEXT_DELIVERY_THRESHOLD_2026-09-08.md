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
| Qwen | `PENDING_LIVE_CALIBRATION` | Official Qwen DeepResearch material proves local-file integration for PDF, Excel and images; exact normal Qwen Chat formats/limits and DOM flow require current adapter/live verification |
| Kimi | `PENDING_LIVE_CALIBRATION` | Official Kimi web/help surface supports document/file upload; exact adapter DOM flow still requires live verification |

No `PENDING_LIVE_CALIBRATION` row may be promoted to the ChatGPT threshold without direct evidence.

## 4. Current official file-capability evidence relevant to Qwen and Kimi

Qwen is now an explicit planned AI target. Current official Qwen DeepResearch material documents local-file integration and explicitly names PDF, Excel and image uploads. That is enough to require Qwen-compatible document-delivery architecture, but it does **not** establish the complete accepted-format list, size/count limits or DOM upload mechanism of ordinary Qwen Chat. Those remain adapter/live-verification work.

Current official evidence entry points:

- `https://qwen.ai/qwenchat`
- `https://qwen.ai/blog?id=qwen-deepresearch`

Kimi is now an explicit planned AI target. Current official Kimi Help Center material states that normal Kimi chat supports file processing including PDF, Word, Excel, PPT, images, TXT and video, with up to 100 MB per file and up to 50 files in the documented product surface. The extension still must prove the actual current browser attachment mechanism and automatic Send/confirmation path before Kimi delivery is marked PASS.

Current official evidence entry points:

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
- the delivered batch appeared as a new user-turn in the chat;
- normal automatic text delivery therefore passed at this calibration point;
- the owner explicitly chose this point as the maximum plain-text operating point and ended further threshold search.

The `1_048_000` character constant is the owner-selected ChatGPT implementation ceiling derived from this PASS point. Do not relabel the estimated live payload size as an exact byte-for-byte measurement of that specific run unless a preserved full payload is later measured.

## 6. Nearest measured ChatGPT FAIL evidence

A preserved failing large-text payload from the immediately adjacent calibration series measured:

- `1,053,496` Unicode characters;
- `1,091,381` UTF-8 bytes.

At the failing class of points, Bridge successfully staged the large text in the ChatGPT composer but native Send did not become usable, so the intended automatic delivery workflow could not complete.

Earlier failing points also included approximately `1.09M` characters and the original approximately `2.16M` character batch.

The fixed ChatGPT `1_048_000` ceiling intentionally stays below the nearest measured FAIL point.

## 7. Required generated-text implementation behavior

### ChatGPT at or below its frozen ceiling

`generated OZON_RESULT/OZON_BATCH_RESULT -> measure Unicode length -> <= 1_048_000 -> stage plain text -> native Send usable -> automatic Send -> matching user-turn -> AI continues`

### ChatGPT above its frozen ceiling

`generated OZON_RESULT/OZON_BATCH_RESULT -> measure Unicode length -> > 1_048_000 -> do not stage full plain text -> create complete text document -> attach document -> native Send usable -> automatic Send -> matching user-turn -> AI receives complete result -> AI continues`

### Other AI adapters

The same representation selector must query that adapter's own calibrated capability/profile instead of using the ChatGPT number. Until evidence exists, the threshold remains explicitly unknown/pending for that adapter; no inherited `1_048_000` assumption is allowed.

No manual copy, cut, paste, file creation, attachment or Send is part of the supported product workflow.

The generated text document must contain the complete Bridge delivery payload. It must not silently summarize, truncate, drop logical results, or change the command/result ordering.

## 8. Keep real report/file delivery separate

This threshold applies only to **generated textual Bridge deliveries**.

It does not replace the separate real-file mechanism required by the parent task:

`Ozon report/file reference -> download original complete file -> query target AI adapter file capabilities -> attach original complete file when supported -> automatic Send -> matching user-turn -> AI continues`

Two global functions therefore remain distinct:

1. `REAL_REPORT_FILE_DELIVERY` — original provider/report file is downloaded and attached as the original document when the target AI supports that file class.
2. `LARGE_GENERATED_TEXT_DELIVERY` — Bridge-generated text above the target adapter's calibrated safe plain-text boundary is materialized by the extension into a text document and attached.

Do not convert existing XLSX/CSV/report artifacts into text merely because the generated-text threshold exists. If the target AI does not support the original file type, the Bridge must fail honestly or use a separately designed/evidence-backed derived-document fallback that is explicitly labelled as derived rather than original.

## 9. Required regressions / live acceptance

Before this calibration can be considered implemented, regression and live evidence must prove at minimum:

- ChatGPT `< threshold` generated text still uses plain-text auto-delivery;
- ChatGPT `= threshold` follows the defined plain-text branch deterministically;
- ChatGPT `> threshold` never stages the full oversized payload as ordinary composer text;
- ChatGPT `> threshold` creates a complete text document and attaches it;
- attachment Send is automatic;
- matching user-turn confirmation still works;
- exactly-once delivery remains intact;
- no hidden resend/retry is introduced;
- no stale BUSY state remains;
- Manual and Autorun share the intended representation-selection rule;
- real Ozon report/file delivery remains a separate original-file attachment path;
- per-AI threshold/file assumptions are adapter/profile-owned, not hard-coded globally;
- unimplemented/planned adapters remain explicit `PENDING`, not false PASS.

## 10. Work ordering / CAP-24

The numerical ChatGPT text-boundary search is now closed by owner decision.

The remaining mandatory pre-resume work is to recalibrate / implement / live-accept both global delivery functions through the multi-AI-capable delivery architecture:

1. real report/file download -> target-AI capability check -> original document attachment when supported -> automatic Send;
2. generated text representation switch using the target adapter's threshold, with ChatGPT frozen at `1_048_000`.

Frozen business cursor remains:

`CAP-24 = 2200 / 9519`

Do not resume or restart CAP-24 until the parent global-delivery task completion gate passes.
