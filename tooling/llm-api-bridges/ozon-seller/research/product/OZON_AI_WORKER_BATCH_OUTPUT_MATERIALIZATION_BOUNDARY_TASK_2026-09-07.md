# Ozon Bridge — Global File Delivery + Large-Text Document Materialization Task

Date: 2026-09-07
Status: `OPEN__MUST_COMPLETE_BEFORE_RESUMING_FROZEN_CAP24_CURSOR_2200_OF_9519`
Scope: **the whole Ozon Bridge extension delivery pipeline**, not Performance and not any single endpoint.
Executable changes: not authorized by this task alone; implementation still requires explicit operator authorization and the normal dependency/regression/package/live gate.

## 1. Why this task exists

This is a mandatory pre-resume task before returning to the currently frozen CAP-24 continuation.

Frozen business cursor:

`CAP-24 = 2200 / 9519`

Do not restart CAP-24. Do not resume it until the two global delivery functions below are tested, calibrated and, after explicit authorization, corrected and live-accepted.

The current live incident was discovered while using a large Performance batch only because that batch produced a sufficiently large payload. **The defect/boundary belongs to the global Ozon Bridge delivery pipeline, not to Performance.** Any read-only Ozon operation may be used later as a convenient source of controlled payload sizes.

## 2. Normal Ozon Bridge workflow that must be preserved

The product workflow is automatic after the operator launches the Ozon action.

Normal Manual flow:

`AI -> OZON command -> one operator Ozon-button action -> Bridge executes provider work -> Bridge prepares delivery -> Bridge stages delivery into the current AI composer -> Bridge gets native Send into a usable state -> Bridge performs the Send click -> matching user-turn appears -> Bridge confirms delivery -> AI continues`

Normal Autorun flow removes the operator Ozon-button action as well.

The operator must **not** be required to copy, cut, paste, manually create a document, manually attach a file, or manually press Send in order to return an Ozon result to the AI.

Current runtime already treats automatic result return as part of delivery: it stages outgoing text into the composer, waits for a stable Send target, performs the delivery Send, and confirms the resulting user-turn. Any manual copy/cut/paste/attach/Send workaround is diagnostic evidence only and is a failure of the normal end-to-end delivery workflow.

---

## 2A. Multi-AI target scope — mandatory architectural constraint

The delivery mechanism must account for the complete planned AI set:

1. ChatGPT;
2. Alice;
3. DeepSeek;
4. Grok;
5. Claude;
6. Gemini;
7. Qwen;
8. Kimi.

The current migration roadmap still treats ChatGPT, Alice and DeepSeek as the first mandatory migration-proof adapters. Grok, Claude, Gemini, Qwen and Kimi are additional planned targets. This task does **not** permit the shared delivery core to become a ChatGPT-specific implementation simply because the first observed large-result incident occurred in ChatGPT.

Architecture rule:

`provider artifact / generated result -> common delivery core -> target AI adapter/profile -> target AI composer/attachment/send/confirmation surface`

The common delivery core must not own site-specific DOM selectors. Each AI adapter/profile must be able to declare or implement, as applicable:

- safe plain-text limit or an explicit unknown/pending state;
- whether document/file attachment is supported;
- accepted MIME types/extensions;
- practical file-size/count limits;
- attachment strategy and selectors/profile version;
- attachment-ready detection;
- send-ready detection;
- matching-turn confirmation behavior.

The numeric threshold already frozen from live testing is **ChatGPT-specific**:

`CHATGPT_MAX_SAFE_PLAIN_TEXT_UNICODE_CHARACTERS = 1_048_000`

Do not silently inherit that number in Alice, DeepSeek, Grok, Claude, Gemini, Qwen or Kimi. Their thresholds remain adapter-specific until live evidence exists.

Qwen and Kimi are explicit targets from this point forward:

- Qwen: current official Qwen DeepResearch material proves local-file integration and explicitly names PDF, Excel and image uploads; exact normal Qwen Chat accepted formats, limits and DOM mechanics remain adapter/live-verification work;
- Kimi: current official Help Center material supports PDF/Word/Excel/PPT/images/TXT/video file processing, with documented product-level limits up to 100 MB per file and up to 50 files; exact extension upload/send mechanics still require adapter/live verification.

Evidence entry points preserved for later adapter work:

- `https://qwen.ai/qwenchat`
- `https://qwen.ai/blog?id=qwen-deepresearch`
- `https://www.kimi.com/en/help/new-user-guide/overview`
- `https://www.kimi.com/en/help/features/project`

Architecture support is not a live PASS. An AI is marked end-to-end delivery PASS only after its actual adapter/browser flow is implemented and tested.

---

# TASK A — REAL OZON REPORT / FILE DELIVERY

## 3. Required function

When an Ozon workflow produces a real report/file reference, the extension must support the complete automatic file-delivery chain:

`Ozon report/file reference -> download the real file -> preserve the complete file -> query target AI adapter file capabilities -> attach the original file when supported -> automatic Send -> matching user-turn confirmation -> AI continues`

A real Ozon report/file must not be unnecessarily converted into a huge plain-text representation.

If the provider/report workflow already produces XLSX, CSV or another supported file, the Bridge should deliver that **original complete file** when the target AI supports that file type.

If the target AI does not support the original file type, the Bridge must not falsely claim original-file delivery. It must fail honestly or use a separately designed, evidence-backed derived-document fallback that is clearly labelled as derived and does not silently pretend to be the original provider artifact.

## 4. Evidence required for real-file delivery

Test the shared mechanism, not just one report endpoint.

Record and verify at minimum:

- report/file reference acquisition;
- successful real file download;
- complete bytes preserved without silent truncation;
- correct or deterministic filename;
- correct or deterministic MIME/type and extension;
- target adapter declares the file supported before attachment;
- attachment appears in the intended current AI composer;
- native Send becomes usable for that attachment state;
- Bridge performs the automatic Send;
- a matching new user-turn is confirmed;
- no duplicate send;
- no hidden resend/retry;
- no stale BUSY state;
- deterministic recovery/terminalization on attachment failure;
- behavior across more than one practical report/file size or type where available.

Target when original format is supported:

`REPORT -> DOWNLOAD FULL FILE -> ATTACH ORIGINAL DOCUMENT -> AUTO SEND -> CONFIRM USER TURN -> AI CONTINUES`

---

# TASK B — LARGE GENERATED TEXT DELIVERY

## 5. Live incident already captured

The Bridge successfully completed a five-command batch on the provider/business side:

- `result_count = 5`;
- `logical_business_result_count = 5`;
- `physical_business_request_count = 5`;
- all five logical results returned provider `HTTP 200`;
- no capability probe was required.

The resulting `OZON_BATCH_RESULT_V1` was extremely large. The preserved copy measures approximately:

- `2,161,883` Unicode characters;
- `2,207,799` UTF-8 bytes.

Approximate contribution by logical result in that captured batch text:

- result 1: ~1,091,072 characters;
- result 2: ~292,150 characters;
- result 3: ~379,574 characters;
- result 4: ~391,714 characters;
- result 5: ~6,852 characters.

Observed live UI behavior:

1. Bridge inserted the very large result visibly into the ChatGPT composer as ordinary plain text.
2. The native ChatGPT Send control did **not** become usable for automatic delivery.
3. Therefore the normal automatic delivery workflow could not complete.
4. The operator manually cut the text and pasted it back only as a diagnostic experiment.
5. ChatGPT then materialized that same large paste as a text document/file attachment.
6. That demonstrated that this payload class should not necessarily be delivered as megabytes of plain composer text.

The manual CUT -> PASTE operation is **not** acceptable product behavior. It is evidence that large generated text needs an automatic document-materialization path inside the extension.

## 6. Required target behavior for generated text

For ordinary generated `OZON_RESULT_V1` / `OZON_BATCH_RESULT_V1` text, the Bridge must choose the delivery representation from the target AI adapter/profile's calibrated safe size boundary.

### Below the target adapter's safe plain-text boundary

`Bridge result -> plain-text composer insertion -> native Send usable -> automatic Send -> matching user-turn -> AI continues`

### Above the target adapter's safe plain-text boundary

`Bridge result -> DO NOT stage oversized ordinary composer text -> materialize the COMPLETE result into a text document -> verify target adapter supports that document class -> attach that text document -> automatic Send -> matching user-turn -> AI receives the full result -> AI continues`

For ChatGPT the frozen boundary is `1_048_000` Unicode characters. Other AI adapters must not inherit that number without their own live evidence.

The extension performs this switch automatically. The operator does not copy/paste/create/attach/send manually.

---

# TASK C — CHATGPT BOUNDARY CLOSED; OTHER AI THRESHOLDS REMAIN ADAPTER-SPECIFIC

## 7. ChatGPT owner-frozen boundary

The owner ended further numerical ChatGPT threshold search and froze:

`CHATGPT_MAX_SAFE_PLAIN_TEXT_UNICODE_CHARACTERS = 1_048_000`

Nearest preserved measured ChatGPT FAIL in the adjacent calibration series:

- `1,053,496` Unicode characters;
- `1,091,381` UTF-8 bytes.

Do not spend additional Ozon provider traffic narrowing the ChatGPT threshold.

## 8. Other AI adapters

Alice / DeepSeek / Grok / Claude / Gemini / Qwen / Kimi remain:

`PENDING_LIVE_CALIBRATION`

Their thresholds and attachment behavior must be established through their own adapter/browser evidence when those adapters are implemented or brought into this task's live acceptance scope. Prefer synthetic/local payload generation for size calibration where possible so provider traffic is not wasted merely to create payload bytes.

For every calibration point record:

- adapter/profile version;
- browser/version;
- exact Unicode character and UTF-8 byte count;
- whether complete payload was staged;
- whether native Send became usable;
- whether Bridge performed automatic Send;
- whether a matching new user-turn appeared;
- whether representation was plain text or attachment;
- whether payload/file integrity was preserved;
- whether Bridge returned to READY/terminal state;
- whether stale BUSY remained;
- whether any manual intervention was required.

---

# TASK D — RECALIBRATE BOTH GLOBAL DELIVERY FUNCTIONS

## 9. Keep the two delivery classes separate

### A. Existing real provider/report file

The file already exists as an Ozon/report artifact.

Required handling:

`Ozon file -> download original complete file -> target-AI format/size capability check -> attach original complete file when supported -> automatic Send -> confirm user-turn`

Do not replace the original file with a generated text dump unless a separate evidence-backed fallback design explicitly requires it.

### B. Large generated Bridge text

No source file exists initially. The Bridge generated a very large textual result.

Required handling:

`generated text -> measure payload -> consult target adapter threshold -> below safe threshold: normal text delivery -> above safe threshold: create full text document -> target-AI attachment capability check -> attach -> automatic Send -> confirm user-turn`

These are two distinct mechanisms and must have distinct tests and regressions.

---

# 10. Required completion gate before CAP-24 resumes

This task is not complete until evidence supports all of the following:

1. A live PASS exists for at least the currently accepted real report/file workflow on a target AI that supports the original file type: `DOWNLOAD -> ATTACH ORIGINAL -> AUTO SEND -> CONFIRM`.
2. The ChatGPT generated-text switch uses the owner-frozen `1_048_000` boundary.
3. Other AI thresholds remain explicit adapter-specific `PENDING` until directly calibrated; no ChatGPT-limit inheritance exists in core.
4. After explicit authorization, large generated results above the applicable adapter rule are automatically materialized as complete text documents and automatically delivered.
5. Small/normal generated results still use normal automatic plain-text delivery.
6. Real Ozon/report files use original-file document delivery whenever the target AI supports the original file class.
7. Unsupported target-AI file formats fail honestly or use only separately approved/evidence-backed derived-document fallback behavior.
8. No supported path requires manual copy/cut/paste/attach/Send.
9. Exactly-once delivery semantics remain intact.
10. No hidden resend/retry is introduced.
11. No stale BUSY/lifecycle regression remains.
12. Shared Manual and Autorun regressions cover the affected delivery paths.
13. Common core contains no AI-site selectors and no one-AI hard-coded attachment mechanics.
14. The delivery capability contract accounts for ChatGPT, Alice, DeepSeek, Grok, Claude, Gemini, Qwen and Kimi, while unimplemented adapters remain explicit PENDING rather than false PASS.
15. Final per-adapter thresholds, transition rules and file-delivery behavior are persisted in permanent project authority.

Only after this gate passes:

`RESUME CAP-24 FROM 2200 / 9519`

Do not repeat already-collected CAP-24 evidence and do not restart CAP-24 from zero.

## 11. Separate preserved boundary evidence

The separate `review_list` live `HTTP 403` observation made after CAP-24 was frozen remains preserved as an independent capability/entitlement boundary observation. It does not replace this global delivery task and does not change the CAP-24 saved cursor.
