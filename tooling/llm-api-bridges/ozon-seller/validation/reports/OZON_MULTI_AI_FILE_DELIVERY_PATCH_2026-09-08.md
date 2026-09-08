# Ozon Bridge — Multi-AI File Delivery Patch Validation

Date: 2026-09-08
Status: `IN_PROGRESS__FINAL_GATE35_AND_LIVE_INSTALL_PENDING`
Repository: `MaksimUnimax/blood_sand`
Patch branch: `repair/ozon-multi-ai-file-delivery-2026-09-08`
Base authority: `4f78cc9f84a926cc834256abcb8278b95c9539df`
Authorization: explicit operator command `делай.не забывай про правила патчей`
Patch authority: `OZON_PATCH_DELIVERY_GATE.md`

## 1. Scope

This patch addresses the global Ozon Bridge result-delivery layer, not Performance-specific behavior:

1. ChatGPT generated text above the owner-frozen `1_048_000` Unicode-code-point threshold is materialized as a complete TXT artifact instead of being injected as oversized composer text.
2. Successful `report_file_get` output preserves the original downloaded provider file bytes for automatic attachment without a second provider download.
3. File attachment uses a generic browser `File` / `DataTransfer` primitive while AI-specific DOM/upload readiness remains adapter-owned.
4. Attachment delivery has durable commit/recovery/no-replay semantics and automatic Send with matching user-turn confirmation.
5. The common capability contract accounts for ChatGPT, Alice, DeepSeek, Grok, Claude, Gemini, Qwen and Kimi without inventing unverified thresholds, DOM selectors or host permissions.

Frozen CAP-24 remains `2200 / 9519` and is not resumed by this patch alone.

## 2. Protected behavior

The patch must preserve:

- one explicit Ozon command -> at most one physical business provider request;
- no hidden provider retry, pagination, polling, fan-out or report re-download;
- Manual/Autorun owner and conversation isolation;
- no replay of already executed provider work during delivery recovery;
- existing small-result text delivery;
- existing `service_worker.js`, `content_script.js` and `shared/composer_send.js` behavior unless a proven dependency requires change;
- fixed Ozon provider host policy and credential isolation;
- minimum extension host permissions.

## 3. First-failure-stop / secondary sweep findings

The patch was not stopped after the first root cause. The secondary dependency sweep found and corrected independent issues:

### F1 — universal threshold null-coercion

A pending AI threshold represented as `null` could become numeric zero through `Number(null)`, incorrectly selecting document materialization for an uncalibrated adapter.

Correction: threshold validity requires a non-null/non-undefined finite value. Alice and all other uncalibrated targets remain explicit `PENDING_LIVE_CALIBRATION` and do not inherit ChatGPT's threshold.

### F2 — failed `report_file_get` incorrectly selected file delivery

A completed Bridge batch entry is not proof that a file exists: provider/Bridge errors also become completed logical results.

Correction: original-file attachment selection accepts only successful 2xx `report_file_get` entries. Failed report-file commands remain ordinary textual error delivery.

### F3 — package timestamp nondeterminism

`zip -X` removes extra fields but does not by itself normalize ZIP DOS timestamps.

Correction: final package staging normalizes production-file mtimes to a fixed epoch, builds two independent ZIPs, requires byte-identical `cmp`, then performs fresh-extraction byte-content equivalence.

### F4 — artifact persistence failure after successful provider request

The provider request may already have returned HTTP success before local artifact persistence fails. Treating that as a provider failure could corrupt request accounting or invite a hidden re-download.

Correction: post-provider clone/artifact capture is fail-soft for provider truth. The original provider result remains successful and no second download occurs. If original bytes are unavailable later, delivery terminates honestly with `REPORT_FILE_ARTIFACT_NOT_CAPTURED` rather than re-fetching.

### F5 — legacy catch-all `onMessage` listener collision

The existing `service_worker.js` owns a catch-all `chrome.runtime.onMessage` listener and returns `UNKNOWN_MESSAGE` for unknown message types. A second attachment listener on the same one-shot message channel would create nondeterministic response ownership.

Correction: the complete attachment RPC is isolated on the named Chrome runtime Port `ozon-attachment-delivery-v1` using `chrome.runtime.connect` / `chrome.runtime.onConnect`. The legacy catch-all listener never owns Port traffic.

### F6 — mixed report-file batch completeness

A batch containing a successful provider file plus other logical results must not replace all non-file result text with only a short attachment marker.

Correction policy:

- pure successful `report_file_get` batch -> original provider file(s) + short delivery marker;
- successful report file + any other logical result, any failed file result, or applied report prefix -> original provider file(s) + complete generated TXT companion + short marker;
- oversized text by the target adapter threshold -> complete generated TXT, plus original provider files when present.

This preserves both original provider artifacts and full logical batch content.

## 4. Multi-AI capability authority

Architecture target set:

1. ChatGPT;
2. Alice;
3. DeepSeek;
4. Grok;
5. Claude;
6. Gemini;
7. Qwen;
8. Kimi.

Only ChatGPT has the owner-frozen plain-text threshold in this patch:

`CHATGPT_MAX_SAFE_PLAIN_TEXT_UNICODE_CHARACTERS = 1_048_000`

Alice / DeepSeek / Grok / Claude / Gemini / Qwen / Kimi remain adapter-specific `PENDING_LIVE_CALIBRATION` for the numerical plain-text boundary. Planned adapters do not receive host permissions or DOM selectors merely because they exist in the product roadmap.

## 5. Delivery architecture

Generated text / provider files are represented as durable delivery artifacts with metadata equivalent to:

- source kind;
- deterministic/sanitized filename;
- MIME type and extension;
- complete byte length;
- SHA-256;
- Unicode character count for generated text;
- bounded lifetime.

Raw file bytes are kept in extension-owned IndexedDB and are not placed in chat-visible diagnostics/public state. Content-side transfer is bounded and SHA-verified before creating a browser `File`.

Attachment lifecycle:

`CLAIMED -> ATTACH_COMMITTED -> READY -> SEND_COMMITTED -> CONFIRMED`

Unknown outcome rules:

- after attach commit, automatic blind re-attachment is forbidden;
- after Send commit, automatic blind resend is forbidden;
- Send rollback is allowed only when the browser click event is proven not to have been observed;
- recovery reconciles committed state instead of replaying provider work.

## 6. Current regression surfaces

The final candidate must pass, on the same final commit:

- multi-AI capability/threshold/static architecture regression;
- mixed report-file completeness policy regression;
- post-provider artifact-capture accounting regression;
- durable named-Port worker state-machine regression;
- native Chrome `File` / `DataTransfer` browser primitive regression;
- installed MV3 service-worker + IndexedDB bootstrap smoke;
- all production JavaScript syntax checks;
- protected legacy file byte-diff checks against base;
- deterministic ZIP double-build;
- fresh extraction equivalence;
- Chromium extension pack check.

## 7. Dependency closure status

`Historical closed-set audit: IN_PROGRESS`

`First-failure-stop guard: PASS_TO_DATE`

`Unaccounted dependencies: PENDING_FINAL_SWEEP`

`Stale assumptions: PENDING_FINAL_SWEEP`

`Available-but-unverified dependencies: PENDING_FINAL_GATE35`

`DEPENDENCY VERDICT: IN_PROGRESS`

## 8. Patch Delivery Gate status

`GATE-01 Authorization = PASS`

`GATE-02..34 = IN_PROGRESS / evidence accumulating`

`GATE-35 final run after the last substantive change = NOT YET PASSED`

No intermediate ZIP is a release artifact.

## 9. Live gates

These cannot be promoted by source/CI proof alone:

`LIVE-GATE-01 = PENDING POST-INSTALL`

`LIVE-GATE-02 = PENDING POST-INSTALL`

`LIVE-GATE-03 = PENDING POST-INSTALL`

`LIVE-GATE-04 = PENDING POST-INSTALL`

`LIVE-GATE-05 = PENDING POST-INSTALL`

At minimum the installed candidate must prove:

1. ChatGPT small result -> plain text -> automatic Send -> matching user-turn;
2. ChatGPT result above `1_048_000` -> complete generated TXT -> attachment -> automatic Send -> confirmation;
3. real Ozon report file -> one provider download -> original file attachment -> automatic Send -> confirmation;
4. reload/recovery does not duplicate attachment, Send or provider request;
5. Manual and Autorun terminalize without stale BUSY state.

Alice attachment DOM remains deliberately unguessed until a current live adapter profile is calibrated. Planned adapters remain PENDING rather than false PASS.

## 10. Current verdict

`PRE-HANDOFF VERDICT: BLOCKED__FINAL_GATE35_NOT_COMPLETE`

`LIVE CERTIFICATION: PENDING`

`CAP-24: FROZEN_AT_2200_OF_9519`
