# Ozon Bridge — Multi-AI File Delivery Patch Validation

Date: 2026-09-08
Status: `PRE_HANDOFF_PASS__LIVE_RETEST_PENDING`
Repository: `MaksimUnimax/blood_sand`
Patch branch: `repair/ozon-multi-ai-file-delivery-2026-09-08`
Base authority: `4f78cc9f84a926cc834256abcb8278b95c9539df`
Production implementation commit: `00af53dffe7e02f62a3a218038b70177fed5a17b`
Final tested branch commit: `3a9586a354b4fd86109ce29051bc8d5605d78a5d`
Final tested tree: `e84560b6bebf9a9a03d6cec77a1de2e6c8cf9e6f`
Authorization: explicit operator command `делай.не забывай про правила патчей`
Patch authority: `OZON_PATCH_DELIVERY_GATE.md`

## 1. Scope

This patch corrects the global Ozon Bridge result-delivery layer, not a Performance-specific endpoint:

1. ChatGPT generated text above the owner-frozen `1_048_000` Unicode-code-point threshold is materialized as a complete TXT artifact instead of being injected as oversized composer text.
2. Successful `report_file_get` output preserves the original downloaded provider-file bytes for automatic attachment without a second provider download.
3. Attachment transport uses a generic browser `File` / `DataTransfer` primitive; AI-specific DOM/upload readiness remains adapter-owned.
4. Attachment delivery has durable commit/recovery/no-replay semantics and automatic Send with matching user-turn confirmation.
5. The common capability contract accounts for ChatGPT, Alice, DeepSeek, Grok, Claude, Gemini, Qwen and Kimi without inventing unverified thresholds, DOM selectors or host permissions.
6. Frozen CAP-24 remains `2200 / 9519` and is not resumed by this patch alone.

## 2. Live incident and exact root cause

The predecessor installed candidate completed the large `performance_campaigns` provider request and stored the business result, then stopped immediately after `BATCH_COLLECTION_COMPLETED` with no attachment/delivery events.

The exact broken dependency chain was established from source and live diagnostics:

- oversized ChatGPT result was correctly classified as `attachment_watch_v1`;
- `service_worker_entry.js` did not import `shared/file_delivery_wake_worker.js`;
- `manifest.json` still loaded the superseded one-shot `attachment_delivery_content.js` and did not load the named-Port content runtime plus wake listener;
- the worker side used named Port `ozon-attachment-delivery-v1`, while the loaded old content runtime used one-shot `chrome.runtime.sendMessage`;
- `attachment_delivery_wake_content.js` expected `runtime.recoverCurrent()`, but the Port content runtime had not exported it;
- the Port content fallback poll was still `1500 ms`, inconsistent with the event-driven wake design and the intended rare `60_000 ms` failsafe.

The earlier finalization workflow had already attempted to materialize this architecture, but its prepare stage failed before commit with `workflow inventory anchor missing`; therefore those changes never entered the predecessor ZIP.

## 3. Corrected production architecture

The tested production bootstrap order is now exactly:

1. `shared/ai_delivery_capabilities.js`;
2. historical `service_worker.js`;
3. `shared/file_delivery_model_policy.js`;
4. `shared/file_delivery_port_worker.js`;
5. `shared/file_delivery_wake_worker.js`.

The content-script package loads the named-Port attachment runtime and one-way wake listener. The superseded one-shot files are absent from the production ZIP:

- `attachment_delivery_content.js` — absent;
- `shared/file_delivery_worker.js` — absent.

The attachment RPC channel is the named runtime Port `ozon-attachment-delivery-v1`. Storage state change is the primary wake mechanism. Content recovery exports `runtime.recoverCurrent = recoverCurrent`; the periodic recovery interval is only a `60_000 ms` failsafe.

Attachment lifecycle remains fail-closed:

`CLAIMED -> ATTACH_COMMITTED -> READY -> SEND_COMMITTED -> CONFIRMED`

Blind re-attach after attach commit and blind resend after Send commit remain forbidden. A safe Send rollback is permitted only when the browser click event is proven not to have been observed.

## 4. Secondary sweep findings closed

The required first-failure-stop secondary sweep found and corrected independent issues beyond the original live stop:

- pending per-AI threshold `null` could not be allowed to coerce into numeric zero;
- failed `report_file_get` results must remain textual errors, not fake file deliveries;
- package timestamps required normalization for deterministic ZIP equality;
- local artifact-persistence failure after provider HTTP success must preserve provider/request accounting and must not cause refetch;
- attachment RPC could not share the legacy catch-all one-shot `onMessage` response channel;
- mixed file+ordinary-result batches require a complete generated TXT companion so non-file logical results are not lost;
- Alice and all other uncalibrated AI targets must not inherit the ChatGPT text threshold;
- the predecessor candidate's worker/content attachment runtimes were not actually connected end-to-end;
- the real MV3 validation harness required a documented CDP pipe transport rather than the environment-dependent TCP debugging endpoint.

## 5. Multi-AI capability authority

Target set:

1. ChatGPT;
2. Alice;
3. DeepSeek;
4. Grok;
5. Claude;
6. Gemini;
7. Qwen;
8. Kimi.

Only ChatGPT has an owner-frozen plain-text threshold in this patch:

`CHATGPT_MAX_SAFE_PLAIN_TEXT_UNICODE_CHARACTERS = 1_048_000`

Alice / DeepSeek / Grok / Claude / Gemini / Qwen / Kimi remain adapter-specific `PENDING_LIVE_CALIBRATION` for numerical plain-text boundaries. No planned adapter receives invented host permissions or DOM selectors.

## 6. Final deterministic regression evidence

Canonical successful full run:

- GitHub Actions run: `34196266412`;
- workflow: `Ozon multi-AI file delivery patch`;
- tested branch commit: `3a9586a354b4fd86109ce29051bc8d5605d78a5d`;
- conclusion: `success`;
- Linux regression: PASS;
- Windows regression: PASS;
- package job: PASS.

The run proves, on the same final tested commit:

- manifest named-Port wiring;
- exact worker bootstrap order;
- stale one-shot runtime absence;
- ChatGPT `<`, `=` and `>` `1_048_000` representation selection;
- oversized generated TXT materialization;
- original report-file attachment selection;
- mixed-batch full-text companion preservation;
- failed file-result textual fallback;
- non-ChatGPT threshold non-inheritance;
- named-Port-only attachment RPC;
- one-download provider-file capture semantics;
- event-driven storage wake -> Port recovery;
- rare 60-second failsafe poll;
- generic browser file primitive free of AI-specific selector ownership;
- ChatGPT selector retained in the ChatGPT adapter;
- all production JavaScript syntax checks;
- historical `service_worker.js`, `content_script.js` and `shared/composer_send.js` unchanged against patch base;
- artifact-store failure preserves provider success and causes no hidden refetch;
- Port recovery/Send commit single-flight/safe rollback;
- pure-report, mixed-report, report+error, report-prefix and oversized-report policies;
- Alice report/text path remains fail-honest until its attachment profile is live-calibrated;
- exact live-stop regression: large classification -> storage wake -> content Port recovery.

## 7. Real browser / MV3 proof

Pinned official Chrome for Testing:

- version: `152.0.7977.82`;
- source: `https://storage.googleapis.com/chrome-for-testing-public/152.0.7977.82/linux64/chrome-linux64.zip`;
- downloaded archive SHA-256: `0704631fb3e4f741092e08f55272f90abc3e307f991f05f332924364415b02e0`.

Browser primitive PASS markers:

- `REG_CHROME_NATIVE_FILE_DATATRANSFER_PASS`;
- `REG_CHROME_CHATGPT_ADAPTER_ATTACHMENT_SURFACE_PASS`;
- `REG_CHROME_ATTACHMENT_PREVIEW_READY_PASS`;
- `REG_CHROME_ATTACHMENT_MARKER_SEND_PREFLIGHT_PASS`;
- `FILE_ATTACHMENT_BROWSER_PRIMITIVE_PASS`.

A real unpacked MV3 extension was then loaded in Chrome for Testing and inspected through Chromium CDP pipe transport. PASS markers:

- `REG_EXTENSION_DEVTOOLS_PIPE_TRANSPORT_PASS`;
- `REG_EXTENSION_MV3_EVENT_ACTIVATION_PASS`;
- `REG_EXTENSION_MV3_SERVICE_WORKER_BOOTSTRAP_PASS`;
- `REG_EXTENSION_MV3_INDEXEDDB_ARTIFACT_STORE_PASS`;
- `REG_EXTENSION_PROVIDER_REPORT_CAPTURE_WRAPPER_ACTIVE_PASS`;
- `FILE_DELIVERY_EXTENSION_WORKER_SMOKE_PASS`.

This proves the packaged MV3 bootstrap actually activates, the eight-AI capability object is present, the ChatGPT threshold is present, the named-Port file-delivery worker is active, IndexedDB artifact storage is available, and the provider report capture wrapper is installed.

## 8. Exact installable artifact

Inner production ZIP produced and tested by run `34196266412`:

- file: `OZON_BRIDGE_v0.1.19_MULTI_AI_FILE_DELIVERY_3a9586a354b4.zip`;
- bytes: `241807`;
- SHA-256: `21b0b4b10baaff0dd9fa7b0c1dc829c7856dab585420797e51473f665aebfbdf`.

Package proof:

- `DETERMINISTIC_ZIP_REBUILD=PASS`;
- `FRESH_EXTRACT_BYTE_CONTENT_EQUIVALENCE=PASS`;
- production file count: `29`;
- required new delivery files present;
- superseded one-shot files absent;
- all extracted production JavaScript parses.

GitHub Actions artifact wrapper:

- artifact ID: `10044022461`;
- artifact name: `ozon-multi-ai-file-delivery-3a9586a354b4fd86109ce29051bc8d5605d78a5d`;
- outer artifact bytes: `240617`;
- outer artifact digest: `sha256:a0fae9cbb06b5bcd5e5da5ae2d6c9910091942be81fc9fd304a764b0f17f5cc1`.

The downloaded handoff copy was independently re-opened after Actions download. The inner ZIP matched the expected `241807` bytes and SHA-256 exactly; its ZIP CRC test, required-file inventory, stale-file absence, manifest bootstrap, import order and ChatGPT threshold checks all passed.

## 9. Dependency closure

`Historical closed-set audit: PASS`

`First-failure-stop guard: PASS`

`Unaccounted dependencies: 0`

`Stale assumptions: 0`

`Available-but-unverified dependencies: 0`

`DEPENDENCY VERDICT: PASS`

No provider/account condition was relabeled as a Bridge defect. No hidden provider refetch/retry/pagination/polling/fan-out or attachment resend was introduced.

## 10. Patch Delivery Gate

`GATE-01 PASS` — explicit operator authorization recorded.

`GATE-02 PASS` — live defect evidence frozen before corrective implementation.

`GATE-03 PASS` — scope limited to global generated-text/original-file delivery, dependencies, regressions and package evidence.

`GATE-04 PASS` — no unrelated provider/business feature scope added.

`GATE-05 PASS` — exact failing workflow reconstructed through provider completion -> batch collection -> missing attachment start.

`GATE-06 PASS` — secondary sweep continued beyond the first wiring defect and found independent lifecycle/accounting/package issues.

`GATE-07 PASS` — producer/consumer/storage/worker/content/adapter/send/test/package dependency inventory closed.

`GATE-08 PASS` — affected paths traced through terminal output/effect and executable evidence.

`GATE-09 PASS` — existing delivery/request/security invariants preserved; new attachment mode isolated additively.

`GATE-10 PASS` — provider/account conditions remain distinct from Bridge delivery behavior.

`GATE-11 PASS` — MV3 lifecycle exercised with real unpacked extension worker.

`GATE-12 PASS` — durable attachment state and recovery semantics exercised.

`GATE-13 PASS` — fresh worker/browser activation proof present.

`GATE-14 PASS` — delivery IDs/state are not fabricated for provider work; deterministic test identities are test-only.

`GATE-15 PASS` — stale/unknown committed states fail closed without blind replay.

`GATE-16 PASS` — browser/MV3 APIs, manifest and content/worker wiring exercised in Chrome for Testing.

`GATE-17 PASS` — permissions/host surface did not expand to unimplemented AI targets.

`GATE-18 PASS` — exact final ZIP produced from tested source with normalized timestamps and deterministic rebuild.

`GATE-19 PASS` — fresh extraction is byte-content equivalent and rechecked.

`GATE-20 PASS` — request-truthfulness invariants retained; protected provider execution path unchanged.

`GATE-21 PASS` — provider accounting regression proves successful request remains successful across artifact-store failure.

`GATE-22 PASS` — no hidden refetch/retry/resend; Send commit single-flight regression passes.

`GATE-23 PASS` — positive and negative controls cover enabled/unsupported/failed file-delivery paths.

`GATE-24 PASS` — unknown AI capability/threshold remains unknown/PENDING rather than fabricated support.

`GATE-25 PASS` — raw file bytes remain extension-owned artifacts rather than chat-visible diagnostics.

`GATE-26 PASS` — signed/provider file source does not become a second hidden download path.

`GATE-27 PASS` — fixed provider host/credential boundaries retained.

`GATE-28 PASS` — generic attachment helper owns no AI-site selector.

`GATE-29 PASS` — target-specific attachment capability remains adapter-owned.

`GATE-30 PASS` — deterministic regression reproduces the exact prior live-stop dependency chain and passes only after corrected wiring.

`GATE-31 PASS` — intersecting legacy delivery/accounting/adapter/lifecycle regressions pass on Linux and Windows.

`GATE-32 PASS` — actual unpacked MV3 extension path reaches worker bootstrap, artifact store and provider capture wrapper in Chrome for Testing.

`GATE-33 PASS` — package/test evidence uses exact checked-out commit and deterministic test fixtures; no stale provider IDs are used to fake PASS.

`GATE-34 PASS` — repair performs no provider-side mutation.

`GATE-35 PASS` — after the last applicable production/test-harness change, run `34196266412` completed all Linux/Windows/package/browser/MV3/deterministic-ZIP gates successfully on final tested commit `3a9586a354b4fd86109ce29051bc8d5605d78a5d`.

`PRE-HANDOFF VERDICT: PASS`

## 11. Live gates

`LIVE-GATE-01 = PASS` — installed predecessor candidate proved the protected small-result text path: one logical result, one physical provider request, HTTP 200, automatic text insertion, one Send click, delivery confirmation and return to READY. The corrective patch leaves the protected legacy text-delivery files byte-unchanged; final live certification nevertheless remains open until the new ZIP completes the remaining live gates.

`LIVE-GATE-02 = PENDING RETEST ON NEW ZIP` — predecessor candidate failed after `BATCH_COLLECTION_COMPLETED`; that exact failure is now a deterministic regression PASS, but the corrected ZIP has not yet been installed and exercised in the logged-in ChatGPT UI.

`LIVE-GATE-03 = PENDING POST-INSTALL` — real Ozon report file -> one download -> original attachment -> auto Send -> confirmation.

`LIVE-GATE-04 = PENDING POST-INSTALL` — reload/recovery -> no duplicate attachment, Send or provider request.

`LIVE-GATE-05 = PENDING POST-INSTALL` — Manual + Autorun terminalization with no stale BUSY.

`LIVE CERTIFICATION: PENDING`

## 12. Work ordering

`CAP-24 = FROZEN_AT_2200_OF_9519`

Do not resume CAP-24 until the global file-delivery completion gate passes after the corrected installable ZIP is live-tested.
