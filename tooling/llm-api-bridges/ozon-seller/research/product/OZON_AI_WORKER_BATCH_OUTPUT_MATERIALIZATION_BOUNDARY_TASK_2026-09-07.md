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

# TASK A — REAL OZON REPORT / FILE DELIVERY

## 3. Required function

When an Ozon workflow produces a real report/file reference, the extension must support the complete automatic file-delivery chain:

`Ozon report/file reference -> download the real file -> preserve the complete file -> attach it to the current AI composer as a document -> automatic Send -> matching user-turn confirmation -> AI continues`

A real Ozon report/file must not be unnecessarily converted into a huge plain-text representation.

If the provider/report workflow already produces XLSX, CSV or another supported file, the Bridge should deliver that **original complete file** as the document payload.

## 4. Evidence required for real-file delivery

Test the shared mechanism, not just one report endpoint.

Record and verify at minimum:

- report/file reference acquisition;
- successful real file download;
- complete bytes preserved without silent truncation;
- correct or deterministic filename;
- correct or deterministic MIME/type and extension;
- attachment appears in the intended current AI composer;
- native Send becomes usable for that attachment state;
- Bridge performs the automatic Send;
- a matching new user-turn is confirmed;
- no duplicate send;
- no hidden resend/retry;
- no stale BUSY state;
- deterministic recovery/terminalization on attachment failure;
- behavior across more than one practical report/file size or type where available.

Target:

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

For ordinary generated `OZON_RESULT_V1` / `OZON_BATCH_RESULT_V1` text, the Bridge must choose the delivery representation based on a calibrated safe size boundary.

### Below the safe plain-text boundary

`Bridge result -> plain-text composer insertion -> native Send usable -> automatic Send -> matching user-turn -> AI continues`

### Above the safe plain-text boundary

`Bridge result -> DO NOT stage megabytes as ordinary composer text -> materialize the COMPLETE result into a text document -> attach that text document to the current AI composer -> automatic Send -> matching user-turn -> AI receives the full result -> AI continues`

The extension performs this switch automatically. The operator does not copy/paste/create/attach/send manually.

---

# TASK C — FIND THE LOWER TEXT->DOCUMENT BOUNDARY

## 7. Known failing point

Current known failing plain-text point:

`~2.16 million characters / ~2.21 MB UTF-8`

Observed classification at that point:

`PLAIN_TEXT_STAGED = YES`

`NATIVE_AUTO_SEND_READY = NO`

Therefore that point is already above the safe normal text-delivery range.

## 8. What must be measured now

Find the lower practical switching boundary by running **smaller controlled payload tests**.

Required bracket:

`LARGEST_KNOWN_SAFE_PLAIN_TEXT`

and

`SMALLEST_KNOWN_DOCUMENT_REQUIRED`

The purpose is to determine the practical interval in which the extension should switch from normal plain-text delivery to automatic text-document materialization.

Do not rerun the full ~2.2 MB payload merely to reproduce the same known failure.

Start with materially smaller payloads, then narrow the PASS/FAIL interval.

This boundary test applies to the **whole extension**. A convenient read-only Ozon operation may be chosen only to generate the needed amount of output; the resulting threshold must not be documented as a Performance-specific limit.

## 9. Evidence to record for every boundary point

For each live calibration run record:

- exact command(s) and parameters used to generate the test payload;
- logical result count;
- physical business request count;
- provider status per command;
- exact delivered Unicode character count when measurable;
- exact UTF-8 byte count when measurable;
- whether the complete payload was staged;
- whether native Send became usable;
- whether Bridge performed automatic Send;
- whether a matching new user-turn appeared;
- whether the complete payload remained intact after delivery;
- whether ChatGPT represented the result as plain text or attachment;
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

`Ozon file -> download original complete file -> attach original complete file -> automatic Send -> confirm user-turn`

Do not replace the original file with a generated text dump unless a separate evidence-backed fallback design explicitly requires it.

### B. Large generated Bridge text

No source file exists initially. The Bridge generated a very large textual result.

Required handling:

`generated text -> measure payload -> below safe threshold: normal text delivery -> above safe threshold: create full text document -> attach -> automatic Send -> confirm user-turn`

These are two distinct mechanisms and must have distinct tests and regressions.

---

# 11. Required completion gate before CAP-24 resumes

This task is not complete until evidence supports all of the following:

1. A live PASS exists for the real report/file workflow:
   `DOWNLOAD -> ATTACH -> AUTO SEND -> CONFIRM`.
2. The large-text calibration has a useful PASS/FAIL bracket:
   `LARGEST_KNOWN_SAFE_PLAIN_TEXT` and `SMALLEST_KNOWN_DOCUMENT_REQUIRED`, or a sufficiently narrow evidence-backed transition interval if the platform threshold is not perfectly stable.
3. A safe automatic text->document switching rule is defined without inventing an Ozon provider limit.
4. After explicit authorization, large generated results above that rule are automatically materialized as complete text documents and automatically delivered.
5. Small/normal generated results still use normal automatic plain-text delivery.
6. Real Ozon/report files still use original-file document delivery.
7. No supported path requires manual copy/cut/paste/attach/Send.
8. Exactly-once delivery semantics remain intact.
9. No hidden resend/retry is introduced.
10. No stale BUSY/lifecycle regression remains.
11. Shared Manual and Autorun regressions cover the affected delivery paths.
12. Final thresholds, transition rules and file-delivery behavior are persisted in permanent project authority.

Only after this gate passes:

`RESUME CAP-24 FROM 2200 / 9519`

Do not repeat already-collected CAP-24 evidence and do not restart CAP-24 from zero.

## 12. Separate preserved boundary evidence

The separate `review_list` live `HTTP 403` observation made after CAP-24 was frozen remains preserved as an independent capability/entitlement boundary observation. It does not replace this global delivery task and does not change the CAP-24 saved cursor.
