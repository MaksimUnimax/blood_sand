# Ozon Seller LLM API Bridge v0.1.10 — acceptance evidence

## Status

v0.1.10 is the corrective release after the logged-in v0.1.9 field run. It preserves the common Manual/Copy + Autorun batch engine from v0.1.9 and changes only the command-admission/readiness UI, the final-delivery watcher lifecycle, and command discovery separators that failed in live testing.

Automated/source/package acceptance is complete. Logged-in ChatGPT field acceptance of the newly built v0.1.10 package is **not** claimed here and remains to be rerun after installation.

## Source of truth and base

- Repository: `MaksimUnimax/blood_sand`
- Branch: `work/ozon-data-collection-2026-08-11`
- Branch HEAD inspected immediately before the v0.1.10 evidence write: `764c1bffbca4da01e29c2862a15a1fdfb75e61cb`
- Base release: Ozon Bridge v0.1.9
- Base v0.1.9 ZIP SHA-256: `22665f5e9bb6250eed88fa53a1c4372c9653877d553a23ab36429490e19a9f70`
- v0.1.9 baseline acceptance rerun before changes: **201/201 PASS**, 0 fail, 0 skipped, 0 cancelled.

## Field defects and required corrections

### 1. Manual Copy readiness is now tied to actual bridge readiness

The code-block Copy control no longer doubles as an executable Manual Ozon control while a prior manual request/delivery is active.

- Native Copy behavior is never prevented.
- When Manual mode is enabled but the bridge is busy, clicking the code-block Copy control only performs the page's normal copy action; no `OZ_EXECUTE_COMMAND` message is submitted.
- The Ozon-blue visual state is shown only while the worker reports Manual mode ready for a new batch.
- Admission of a Manual batch immediately makes the control non-ready again.
- After the delivery watcher sees Microphone and the worker acknowledges successful completion/cleanup, readiness is restored and the control becomes Ozon-blue again.

This closes the observed operator-error path where a second batch could be started before the prior delivery lifecycle had reached its Microphone success marker.

### 2. Final-delivery Send monitoring is delivery-scoped and one-shot

The v0.1.9 field diagnostics showed `BUTTON_MICROPHONE` followed by `DELIVERY_WATCH_DESTROYED`, so the recorded watcher did tear down. The remaining risk was the live interval before the next poll: a user-created Send control could appear while the delivery watcher was still waiting for Microphone.

v0.1.10 narrows the watcher behavior:

- watcher starts only for a committed report delivery;
- the old initial blind 2-second sleep is removed;
- classification starts immediately after insertion;
- MutationObserver wakeups are scoped to the active composer form, with the 2-second timer retained only as a fallback wake;
- the staged report Send control may be clicked **at most once** for that delivery;
- after that successful click, any later `send_active` state is ignored and never clicked;
- Microphone remains the sole success marker and is never clicked;
- on success/failure/stop the watcher and pending wake are destroyed/cancelled.

Therefore an ordinary user message typed after the extension has already clicked its report Send cannot be auto-sent by the same delivery watcher.

### 3. Live Unicode discovery failures fixed without weakening JSON

The v0.1.9 logged-in field matrix found three valid commands rejected at `command_discovery` with `MISSING_JSON` and `external_request_executed:false` solely because a formatting character occurred between `OZON_API_V1` and the valid JSON object:

- U+200B ZERO WIDTH SPACE
- U+2060 WORD JOINER
- U+00AD SOFT HYPHEN

v0.1.10 treats these three characters as ignorable marker-to-object separators, together with the existing whitespace handling. JSON parsing/validation itself remains strict and unchanged; malformed JSON is not repaired or normalized into validity.

## Production change surface

Exactly seven of the sixteen production files differ from accepted v0.1.9:

- `content_script.js`
- `service_worker.js`
- `shared/ozon_contract.js`
- `manifest.json`
- `popup.html`
- `popup.js`
- `shared/runtime_names.js`

The remaining nine production files are byte-identical to v0.1.9. The last four changed files above contain the v0.1.10 version/UI string update; the behavioral changes are concentrated in `content_script.js`, `service_worker.js`, and `shared/ozon_contract.js`.

No extension permission or host-permission expansion was introduced.

## Verification

### Full regression suite

Final development tree:

- tests: **208**
- pass: **208**
- fail: **0**
- cancelled: **0**
- skipped: **0**

Fresh extraction directly from the final ZIP, with the same test harness applied externally:

- tests: **208**
- pass: **208**
- fail: **0**
- cancelled: **0**
- skipped: **0**

The suite retains the v0.1.9 batch/recovery/provider/security matrix and adds direct regressions for the newly observed field behavior.

### Explicit field-form discovery regression

The exact classes exercised live during the session are now permanent automated regressions:

- field forms 1–10: expected 10 commands;
- field forms 11–20: expected 10 commands;
- field forms 21–30: expected 11 commands because the final case contains two adjacent valid commands;
- field forms 31–40: expected 10 commands, including U+200B, U+2060 and U+00AD.

All four groups PASS in v0.1.10.

### Explicit readiness/watcher regressions

PASS cases include:

- busy Manual Copy is bridge-inactive and remains native-copy-only;
- Manual Copy becomes Ozon-blue only when bridge readiness is true;
- admission immediately removes ready/blue state;
- confirmed Microphone completion restores readiness;
- staged report Send is clicked at most once;
- later user Send controls are ignored by the delivery watcher;
- Microphone is the sole delivery success marker;
- delivery watcher teardown prevents ordinary user Send controls from being clicked afterward;
- worker Manual state exposes readiness from actual active-operation state.

### Existing batch and safety regression retained

The full suite continues to cover the common Manual/Copy + Autorun batch architecture, including:

- single command as batch size 1;
- scale matrix 1 / 2 / 5 / 15 / 30 / 60;
- strict serial provider execution with max concurrency 1;
- identical commands execute separately with no deduplication;
- arbitrary prose/Markdown/unrelated JSON between markers;
- valid / malformed / valid isolation;
- pre-request failures execute zero provider requests;
- one combined final delivery;
- one-shot insertion commit and actor-bound acknowledgements;
- completed provider results are not replayed during recovery;
- unknown in-flight outcome fails closed without blind retry;
- user-draft pre-insert protection;
- enabled Ozon operation contracts, provider/credential failures, result sanitization/PII boundaries and read-only security invariants.

### Syntax, package and deterministic build

- every production `.js` passes `node --check`;
- `manifest.json` parses with version `0.1.10`;
- final ZIP contains exactly **16 production files**;
- fresh ZIP extraction is byte-identical to the staged 16-file production tree;
- Chromium `144.0.7559.96` `--pack-extension` exits **0**;
- deterministic ZIP rebuild is byte-identical.

## Final artifact

- ZIP: `ozon-bridge-v0.1.10-extension.zip`
- size: 91,417 bytes
- files: 16
- SHA-256: `e84ecce82bd97f6a57b9e9a08228d0773d625422b2c075bc5a5da28ba75ad818`

## Reproducible v0.1.9 → v0.1.10 patch

- raw patch SHA-256: `96a106a4eacfac0c774ab49d62cd842d5cd29c2f03ad56d1fe8fe21ac638a54d`
- deterministic gzip (`gzip -n -9`) SHA-256: `8d808e8c28c2ff9198f96f8ad2f4a23ca98e6e90f8464a5adc803a7aae8d01ab`
- base64 SHA-256: `92bb0517ade10246ab91022151134b1d0971f8c186d295331efef266459ffcbd`
- part01 SHA-256: `5ab9c0d1fcc5ae70f5870f7e88855f287d81f0c0466fdcc8ae1340fce35af30e`
- part02 SHA-256: `098ae2086ec888cf43aebe55d0dab04af6d9534e029ebece99e045b0e967e2d2`

Concatenating part01 + part02 reconstructs the exact base64 file. Decoding and gunzipping reconstructs the exact raw patch. Applying that patch to the accepted v0.1.9 production tree was verified to produce a byte-identical v0.1.10 production tree.

## Acceptance boundary

Automated/source/package/emulator regression acceptance is complete for v0.1.10. The new package still requires the same logged-in ChatGPT field check by the installed extension before claiming live v0.1.10 acceptance. In particular, the readiness color/copy-only transition and ordinary user-chat non-interference must be observed in the real UI after installation.
