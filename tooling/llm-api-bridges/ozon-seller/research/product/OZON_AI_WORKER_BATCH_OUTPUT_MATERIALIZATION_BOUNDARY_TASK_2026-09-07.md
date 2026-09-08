# Ozon Bridge — Global File Delivery + Large-Text Document Materialization Task

Date: 2026-09-07
Status: `OPEN__MUST_COMPLETE_BEFORE_RESUMING_FROZEN_CAP24_CURSOR_2200_OF_9519`
Scope: **the whole Ozon Bridge extension delivery pipeline across the planned AI-adapter set**, not Performance, not any single endpoint, and not ChatGPT alone.
Executable changes: not authorized by this task alone; implementation still requires explicit operator authorization and the normal dependency/regression/package/live gate.
Related threshold authority: `OZON_AI_WORKER_LARGE_TEXT_DELIVERY_THRESHOLD_2026-09-08.md`.
Related multi-AI roadmap: `OZON_BRIDGE_MULTI_AI_MIGRATION_ROADMAP_2026-08-13.md`.

## 1. Why this task exists

This is a mandatory pre-resume task before returning to the currently frozen CAP-24 continuation.

Frozen business cursor:

`CAP-24 = 2200 / 9519`

Do not restart CAP-24. Do not resume it until the two global delivery functions below are tested, calibrated and, after explicit authorization, corrected and live-accepted for the currently supported product surface, while the shared implementation remains compatible with the full planned AI-adapter set.

The current live incident was discovered while using a large Performance batch only because that batch produced a sufficiently large payload. **The defect/boundary belongs to the global Ozon Bridge delivery pipeline, not to Performance.** Any read-only Ozon operation may be used later as a convenient source of controlled payload sizes.

## 2. Normal Ozon Bridge workflow that must be preserved

The product workflow is automatic after the operator launches the Ozon action.

Normal Manual flow:

`AI -> OZON command -> one operator Ozon-button action -> Bridge executes provider work -> Bridge prepares delivery -> Bridge stages or attaches delivery into the current AI composer -> Bridge gets native Send into a usable state -> Bridge performs the Send click -> matching user-turn appears -> Bridge confirms delivery -> AI continues`

Normal Autorun flow removes the operator Ozon-button action as well.

The operator must **not** be required to copy, cut, paste, manually create a document, manually attach a file, or manually press Send in order to return an Ozon result to the AI.

Current runtime already treats automatic result return as part of delivery: it stages outgoing text into the composer, waits for a stable Send target, performs the delivery Send, and confirms the resulting user-turn. Any manual copy/cut/paste/attach/Send workaround is diagnostic evidence only and is a failure of the normal end-to-end delivery workflow.

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

- Qwen: current official product material supports document/data-file upload, including CSV/Excel/text-class inputs; exact consumer-web limits and DOM mechanics remain adapter/live-verification work;
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

If the provider/report workflow already produces XLSX, CSV or another file, the Bridge should preserve and deliver that **original complete file** when the target AI accepts that format.

If a target AI does not accept the original MIME/extension, the Bridge must not pretend the original was delivered. The supported choices are:

- explicit deterministic unsupported-format failure; or
- a separately designed, evidence-backed, provenance-preserving derived-file fallback.

A derived artifact must remain distinguishable from the original provider file and must record at minimum source filename/hash, derived format, derivation reason and completeness/truncation state.

## 4. Evidence required for real-file delivery

Test the shared mechanism, not just one report endpoint and not only one AI DOM implementation.

Record and verify at minimum:

- report/file reference acquisition;
- successful real file download;
- complete bytes preserved without silent truncation;
- correct or deterministic filename;
- correct or deterministic MIME/type and extension;
- target AI adapter/profile and version used;
- target adapter file-capability decision;
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

`REPORT -> DOWNLOAD FULL FILE -> PRESERVE ORIGINAL -> ATTACH ORIGINAL DOCUMENT -> AUTO SEND -> CONFIRM USER TURN -> AI CONTINUES`

---

# TASK B — LARGE GENERATED TEXT DELIVERY

## 5. Live ChatGPT incident already captured

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

Observed live ChatGPT UI behavior:

1. Bridge inserted the very large result visibly into the ChatGPT composer as ordinary plain text.
2. The native ChatGPT Send control did **not** become usable for automatic delivery.
3. Therefore the normal automatic delivery workflow could not complete.
4. The operator manually cut the text and pasted it back only as a diagnostic experiment.
5. ChatGPT then materialized that same large paste as a text document/file attachment.
6. That demonstrated that this payload class should not necessarily be delivered as megabytes of plain composer text in the ChatGPT adapter.

The manual CUT -> PASTE operation is **not** acceptable product behavior. It is evidence that large generated text needs an automatic document-materialization path inside the extension.

## 6. Required target behavior for generated text

For ordinary generated `OZON_RESULT_V1` / `OZON_BATCH_RESULT_V1` text, the Bridge must choose the delivery representation through the target AI adapter/profile rather than one universal hard-coded site limit.

Generic rule:

`generated result -> measure payload -> target adapter delivery policy -> plain text OR complete document attachment -> automatic Send -> matching user-turn -> AI continues`

For ChatGPT the owner-frozen rule is:

### ChatGPT at or below the safe plain-text boundary

`Bridge result -> <= 1_048_000 Unicode characters -> plain-text composer insertion -> native Send usable -> automatic Send -> matching user-turn -> AI continues`

### ChatGPT above the safe plain-text boundary

`Bridge result -> > 1_048_000 Unicode characters -> DO NOT stage the full result as ordinary composer text -> materialize the COMPLETE result into a text document -> attach that text document to the current ChatGPT composer -> automatic Send -> matching user-turn -> AI receives the full result -> AI continues`

For Alice / DeepSeek / Grok / Claude / Gemini / Qwen / Kimi, the safe switching rule must remain adapter-specific until calibrated or otherwise safely capability-gated.

The extension performs the switch automatically. The operator does not copy/paste/create/attach/send manually.

---

# TASK C — PER-AI TEXT->DOCUMENT BOUNDARY / CAPABILITY CALIBRATION

## 7. ChatGPT calibration status

The ChatGPT numerical search is closed by owner decision and moved into the permanent threshold authority:

`OZON_AI_WORKER_LARGE_TEXT_DELIVERY_THRESHOLD_2026-09-08.md`

Frozen ChatGPT ceiling:

`CHATGPT_MAX_SAFE_PLAIN_TEXT_UNICODE_CHARACTERS = 1_048_000`

Nearest preserved measured ChatGPT FAIL evidence:

- `1,053,496` Unicode characters;
- `1,091,381` UTF-8 bytes.

Do not spend additional provider traffic merely to narrow the ChatGPT numerical interval further.

## 8. What remains to be calibrated

The global product needs a **per-target-AI** delivery capability model, not a single global composer threshold.

For every implemented/currently supported AI adapter, establish or safely gate:

- `LARGEST_KNOWN_SAFE_PLAIN_TEXT` where useful;
- `SMALLEST_KNOWN_DOCUMENT_REQUIRED` where useful;
- accepted document/file types;
- attachment limits relevant to Bridge delivery;
- whether the complete automatic workflow reaches matching-turn confirmation without manual intervention.

For planned-but-not-yet-implemented adapters, keep these values explicit as `PENDING_LIVE_CALIBRATION` rather than copying ChatGPT values.

A convenient read-only Ozon operation may be chosen only to generate controlled output. The resulting threshold belongs to the target AI adapter, not to Performance and not to Ozon API.

## 9. Evidence to record for every future boundary/capability point

For each live calibration run record:

- target AI, adapter/profile version and browser;
- exact command(s) and parameters used to generate the test payload;
- logical result count;
- physical business request count;
- provider status per command;
- exact delivered Unicode character count when measurable;
- exact UTF-8 byte count when measurable;
- whether the complete payload was staged/attached;
- whether native Send became usable;
- whether Bridge performed automatic Send;
- whether a matching new user-turn appeared;
- whether the complete payload remained intact after delivery;
- whether the target AI represented the result as plain text or attachment;
- whether Bridge returned to READY / terminal state;
- whether stale BUSY remained;
- whether **any** manual copy/cut/paste/attach/Send intervention was required.

Normal workflow PASS requires:

`NO MANUAL OPERATOR ACTION REQUIRED AFTER LAUNCH`

If manual copy/cut/paste/attachment/Send is needed to get the Ozon result back to the AI, classify that delivery point as FAIL for the intended product workflow.

---

# TASK D — RECALIBRATE BOTH GLOBAL DELIVERY FUNCTIONS

## 10. Keep the two delivery classes separate

### A. Existing real provider/report file

The file already exists as an Ozon/report artifact.

Required handling:

`Ozon file -> download original complete file -> preserve original bytes/hash -> target adapter capability check -> attach original when supported -> automatic Send -> confirm user-turn`

Do not replace the original file with a generated text dump unless a separate evidence-backed fallback design explicitly requires it.

### B. Large generated Bridge text

No source file exists initially. The Bridge generated a very large textual result.

Required handling:

`generated text -> measure payload -> target adapter policy -> safe plain-text delivery OR create complete text document -> attach -> automatic Send -> confirm user-turn`

For ChatGPT, use the frozen `1_048_000`-Unicode-character threshold. For other AIs, use only their own evidence-backed or safely gated adapter rule.

These are two distinct mechanisms and must have distinct tests and regressions.

---

# 11. Required completion gate before CAP-24 resumes

This task is not complete until evidence supports all of the following for the currently supported release surface, while preserving the generic eight-AI adapter contract:

1. A live PASS exists for the real report/file workflow on at least one supported original-file target path:
   `DOWNLOAD -> PRESERVE ORIGINAL -> CAPABILITY CHECK -> ATTACH -> AUTO SEND -> CONFIRM`.
2. ChatGPT generated-text delivery uses the owner-frozen `1_048_000` Unicode-character adapter ceiling and does not expose that number as a universal AI constant.
3. A safe automatic text->document switching mechanism exists in the common delivery architecture without inventing an Ozon provider limit.
4. After explicit authorization, large generated ChatGPT results above its rule are automatically materialized as complete text documents and automatically delivered.
5. Small/normal generated ChatGPT results still use normal automatic plain-text delivery.
6. Every other currently shipped AI adapter uses the same common artifact/delivery contract and either has its own evidence-backed representation policy or fails safely without inheriting ChatGPT assumptions.
7. Real Ozon/report files preserve original bytes and use original-file document delivery whenever the target AI supports the original format.
8. Unsupported target-AI file formats do not silently masquerade as successful original-file delivery.
9. No supported path requires manual copy/cut/paste/attach/Send.
10. Exactly-once delivery semantics remain intact.
11. No hidden resend/retry is introduced.
12. No stale BUSY/lifecycle regression remains.
13. Shared Manual and Autorun regressions cover the affected delivery paths.
14. Qwen and Kimi are present in the planned AI capability matrix alongside ChatGPT, Alice, DeepSeek, Grok, Claude and Gemini, with unknown values explicitly left pending rather than guessed.
15. Future adapters can implement attachment/text-limit behavior through the generic adapter contract without adding special-case Ozon/provider logic to the common core.
16. Final per-AI thresholds, transition rules and file-delivery behavior are persisted in permanent project authority as they are proven.

Only after this gate passes:

`RESUME CAP-24 FROM 2200 / 9519`

Do not repeat already-collected CAP-24 evidence and do not restart CAP-24 from zero.

## 12. Separate preserved boundary evidence

The separate `review_list` live `HTTP 403` observation made after CAP-24 was frozen remains preserved as an independent capability/entitlement boundary observation. It does not replace this global delivery task and does not change the CAP-24 saved cursor.
