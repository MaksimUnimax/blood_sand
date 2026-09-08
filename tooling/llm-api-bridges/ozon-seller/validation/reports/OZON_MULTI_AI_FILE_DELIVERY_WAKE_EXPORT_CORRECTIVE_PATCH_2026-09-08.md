# Ozon multi-AI file delivery — normal-start wake export corrective patch

Date: 2026-09-08

Status: `PRE_HANDOFF_PASS__LIVE_GATE_03_RETEST_PENDING_POST_INSTALL`

Repository: `MaksimUnimax/blood_sand`

Branch: `repair/ozon-multi-ai-file-delivery-2026-09-08`

Operator authorization: current patch cycle explicitly authorized by `Делай патч, правила блдяь патч соблюдай!!!`.

Patch authority: `OZON_PATCH_DELIVERY_GATE.md`.

## 1. Live defect authority

The corrective cycle started from an operator-observed LIVE-GATE-03 failure after a real Ozon report-file request had already completed.

Fresh dependent chain used in the live run:

1. `report_placement_by_products_create` -> HTTP 200 -> fresh report code;
2. `report_info` with that code -> HTTP 200 / `status=success` -> fresh `report_file_ref`;
3. `report_file_get` with that fresh ref -> provider HTTP 200 -> result stored -> `BATCH_COLLECTION_COMPLETED` -> no immediate attachment activity visible to the operator.

Frozen failing report-file request evidence:

- request id: `d1bcede0-5c3a-4825-ba60-c16544bdd5ac`;
- delivery id: `manual-delivery-aef80a92-3408-4acd-805d-73463c0967eb`;
- logical command fingerprint: `08ab4d88`;
- physical command fingerprint: `43d0e0ce`;
- `command_transformed=true` for the opaque provider-file transport;
- provider HTTP status: `200`;
- terminal collection event: `BATCH_COLLECTION_COMPLETED`.

The provider request was deliberately not repeated during diagnosis or patching.

Pre-executable frozen evidence commit:

`1ebd0d6fd03fcc08398218055028c43a6f52cec6`

Evidence file:

`validation/reports/OZON_MULTI_AI_FILE_DELIVERY_LIVE_GATE_03_WAKE_FAILURE_2026-09-08.md`

## 2. Exact production root cause

`attachment_delivery_port_content.js` defined local `recoverCurrent()`, but the installed candidate exported it as `runtime.recoverCurrent` only inside `scheduleReconnect()`.

Normal startup with a healthy named Port therefore had this state:

- local `recoverCurrent()` existed;
- `globalThis.__OZON_ATTACHMENT_DELIVERY_PORT_RUNTIME__.recoverCurrent` was still undefined;
- `shared/file_delivery_wake_worker.js` could emit `OZ_ATTACHMENT_DELIVERY_WAKE` after `attachment_watch_v1` was stored;
- `attachment_delivery_wake_content.js` rejected that event because it requires `typeof runtime.recoverCurrent === "function"`;
- the event-driven path stopped before named-Port recovery;
- the independent `RECOVERY_POLL_MS = 60_000` fallback remained available.

The previous regression suite had a false-positive gap:

- one test only searched source text for `runtime.recoverCurrent = recoverCurrent;` without checking execution placement;
- another test manually injected a synthetic runtime that already had a working `recoverCurrent()` method, bypassing the missing production export.

## 3. Corrective production change

Only one production file changed against live-evidence authority `9654f31405d02b309ace42e0644bcd135f07ad55`:

`dist-step7-candidate/attachment_delivery_port_content.js`

Cumulative production diff is exactly 2 additions / 2 deletions.

The correction:

- removes the reconnect-only `runtime.recoverCurrent = recoverCurrent` assignment;
- exports `runtime.recoverCurrent = recoverCurrent` immediately after the production `recoverCurrent()` definition;
- does so before normal-start `ensurePort()`;
- keeps reconnect recovery calling local `recoverCurrent()`;
- keeps the 250 ms startup recovery and 60-second recovery poll as bounded fallbacks;
- changes no manifest, provider transport, API operation, credential, entitlement, state enum, storage key, host permission, request accounting, or business logic.

Final tested production content blob:

`attachment_delivery_port_content.js` -> `8ae0cdf1bde90f7c902be9c8868ec2a8d3f545f3`

## 4. Targeted regression correction

`run_file_delivery_live_stop_repro.mjs` now uses the real production content runtime rather than a pre-populated fake runtime.

The same executable harness performs both controls:

### Pre-fix negative control

It reads exact pre-fix authority `9654f31405d02b309ace42e0644bcd135f07ad55` through `git show`, starts the production content runtime with a healthy named Port and without executing reconnect/startup/poll timers, and proves `runtime.recoverCurrent` is not exported.

Marker:

`REG_LIVE_STOP_PRE_FIX_NORMAL_START_EXPORT_MISSING_REPRODUCED_PASS`

### Candidate positive control

It starts the corrected production content runtime under the same healthy-Port conditions, proves `runtime.recoverCurrent` is immediately exported, then loads the actual wake content listener and proves one `OZ_ATTACHMENT_DELIVERY_WAKE` immediately causes one named-Port `OZ_ATTACHMENT_RECOVERY_GET` without advancing the 250 ms startup fallback or 60-second poll.

Markers:

- `REG_LIVE_STOP_NORMAL_START_RECOVERY_EXPORT_PASS`;
- `REG_LIVE_STOP_WAKE_REACHES_REAL_PORT_RECOVERY_PASS`;
- `FILE_DELIVERY_LIVE_STOP_REPRO_PASS`.

`run_multi_ai_file_delivery_patch.mjs` additionally proves:

- exactly one runtime export exists;
- it is after the production function definition;
- it is before normal-start `ensurePort()`;
- it is not inside the reconnect-only block.

Marker:

`REG_ATTACHMENT_NORMAL_START_RECOVERY_EXPORT_PLACEMENT=PASS`.

## 5. Secondary sweep finding and repair

The first full post-fix workflow run was:

- Actions run: `34206458537`;
- tested commit: `20dcfbf24ff758433b805f41cc83c93a1b6e6bf2`.

Both Linux and Windows regression jobs passed, and the package job re-ran the regression set successfully. The package job then failed in the unpacked-MV3 smoke before ZIP creation.

Exact failure:

- `run_file_delivery_extension_worker_smoke.mjs` line 168;
- `typeof OzonAIDeliveryCapabilities` was observed as `"undefined"` immediately after attaching to the service-worker target.

This was frozen before harness modification:

- evidence commit: `392450dc608e39e95459c8072ef885cb681b4ad0`;
- evidence file: `validation/reports/OZON_MULTI_AI_FILE_DELIVERY_MV3_SMOKE_READINESS_RACE_2026-09-08.md`.

The smoke-test blob at the failed candidate was identical to the previously successful final-tested build (`587c765f6f841a342952701c2223b9c34e46feae`), and no current production change touched `service_worker_entry.js` or worker bootstrap dependencies. The harness had equated `service_worker target exists` with `top-level importScripts/bootstrap has completed`.

The bounded test-only correction adds service-worker bootstrap readiness polling after attaching to the same actual worker target. It does not reload/restart the worker until success and does not weaken any existing semantic assertion. A never-ready worker still fails with the last observed bootstrap state.

New marker:

`REG_EXTENSION_MV3_SERVICE_WORKER_BOOTSTRAP_READINESS_PASS`.

## 6. Final tested candidate authority

Final tested source commit:

`e62f75d8d0d34fecb1451dba3208f0c4c2ebd407`

Final tested tree:

`cea953c722d426150d0d5bb98f13776526acd940`

Canonical successful GitHub Actions run:

`34206779378`

Workflow:

`Ozon multi-AI file delivery patch`

Conclusion:

`success`

Matrix:

- `regression (ubuntu-latest)` = PASS;
- `regression (windows-latest)` = PASS;
- `package` = PASS.

The package job again ran the entire file-delivery regression set on the exact package source before building the archive.

## 7. Final regression / boundary evidence

Exact-package-source markers include:

- `REG_FILE_DELIVERY_MANIFEST_NAMED_PORT_WIRING=PASS`;
- `REG_FILE_DELIVERY_BOOTSTRAP_COMPLETE_ORDER=PASS`;
- `REG_STALE_ONE_SHOT_RUNTIME_REMOVED=PASS`;
- `REG_CHATGPT_THRESHOLD_BELOW_EQUAL_ABOVE=PASS`;
- `REG_LARGE_TEXT_ATTACHMENT_MODE=PASS`;
- `REG_ORIGINAL_REPORT_FILE_ATTACHMENT_MODE=PASS`;
- `REG_MIXED_BATCH_COMPLETE_TEXT_COMPANION=PASS`;
- `REG_FAILED_REPORT_FILE_STAYS_TEXT_ERROR=PASS`;
- `REG_OTHER_AI_THRESHOLD_NOT_INHERITED=PASS`;
- `REG_ATTACHMENT_RPC_NAMED_PORT_ONLY=PASS`;
- `REG_PROVIDER_FILE_SINGLE_FETCH_CAPTURE_PRESENT=PASS`;
- `REG_ATTACHMENT_NORMAL_START_RECOVERY_EXPORT_PLACEMENT=PASS`;
- `REG_ATTACHMENT_WAKE_TO_PORT_RECOVERY_WIRING=PASS`;
- `REG_ATTACHMENT_RARE_FAILSAFE_POLL=PASS`;
- `REG_GENERIC_WEB_FILE_PRIMITIVE_NO_AI_SELECTOR=PASS`;
- `REG_CHATGPT_SELECTOR_ADAPTER_OWNED=PASS`;
- `REG_ALL_PRODUCTION_JS_NODE_CHECK=PASS`;
- `REG_PROVEN_LEGACY_DELIVERY_FILES_UNMODIFIED=PASS`;
- `REG_REPORT_ARTIFACT_STORE_FAILURE_PRESERVES_PROVIDER_SUCCESS_PASS`;
- `REG_REPORT_ARTIFACT_STORE_FAILURE_NO_HIDDEN_REFETCH_PASS`;
- `REG_ATTACHMENT_PORT_RECOVERY_GET_PASS`;
- `REG_ATTACHMENT_PORT_SEND_COMMIT_SINGLE_FLIGHT_PASS`;
- `REG_ATTACHMENT_PORT_SAFE_ROLLBACK_PASS`;
- `REG_PURE_REPORT_BATCH_ORIGINAL_FILES_ONLY_PASS`;
- `REG_MIXED_REPORT_BATCH_COMPLETE_TEXT_COMPANION_PASS`;
- `REG_REPORT_SUCCESS_PLUS_FILE_ERROR_COMPANION_PASS`;
- `REG_REPORT_PREFIX_PRESERVED_IN_COMPLETE_TEXT_COMPANION_PASS`;
- `REG_OVERSIZED_REPORT_BATCH_THRESHOLD_DOCUMENT_PRESERVED_PASS`;
- `REG_FAILED_ONLY_REPORT_BATCH_REMAINS_TEXT_PASS`;
- `REG_ALICE_REPORT_FILE_TEXT_PATH_PRESERVED_UNTIL_ATTACHMENT_PROFILE_PASS`;
- `REG_CHATGPT_REPORT_FILE_ATTACHMENT_PATH_ENABLED_PASS`;
- `REG_ALICE_DOES_NOT_INHERIT_CHATGPT_LARGE_TEXT_RULE_PASS`;
- `REG_ATTACHMENT_WAKE_WORKER_ONE_WAY_ONLY_PASS`;
- `REG_ATTACHMENT_WAKE_CONTENT_NO_RPC_COLLISION_PASS`;
- `REG_ATTACHMENT_WAKE_INVOCATION_EXACTLY_ONCE_PASS`;
- `REG_LIVE_STOP_LARGE_RESULT_CLASSIFIES_ATTACHMENT_PASS`;
- `REG_LIVE_STOP_STORAGE_WAKE_EMITTED_PASS`;
- `REG_LIVE_STOP_PRE_FIX_NORMAL_START_EXPORT_MISSING_REPRODUCED_PASS`;
- `REG_LIVE_STOP_NORMAL_START_RECOVERY_EXPORT_PASS`;
- `REG_LIVE_STOP_WAKE_REACHES_REAL_PORT_RECOVERY_PASS`;
- `FILE_DELIVERY_LIVE_STOP_REPRO_PASS`.

Browser/MV3 evidence on pinned Chrome for Testing `152.0.7977.82`:

- archive SHA-256 `0704631fb3e4f741092e08f55272f90abc3e307f991f05f332924364415b02e0`;
- `REG_CHROME_NATIVE_FILE_DATATRANSFER_PASS`;
- `REG_CHROME_CHATGPT_ADAPTER_ATTACHMENT_SURFACE_PASS`;
- `REG_CHROME_ATTACHMENT_PREVIEW_READY_PASS`;
- `REG_CHROME_ATTACHMENT_MARKER_SEND_PREFLIGHT_PASS`;
- `FILE_ATTACHMENT_BROWSER_PRIMITIVE_PASS`;
- `REG_EXTENSION_DEVTOOLS_PIPE_TRANSPORT_PASS`;
- `REG_EXTENSION_MV3_EVENT_ACTIVATION_PASS`;
- `REG_EXTENSION_MV3_SERVICE_WORKER_BOOTSTRAP_READINESS_PASS`;
- `REG_EXTENSION_MV3_SERVICE_WORKER_BOOTSTRAP_PASS`;
- `REG_EXTENSION_MV3_INDEXEDDB_ARTIFACT_STORE_PASS`;
- `REG_EXTENSION_PROVIDER_REPORT_CAPTURE_WRAPPER_ACTIVE_PASS`;
- `FILE_DELIVERY_EXTENSION_WORKER_SMOKE_PASS`.

## 8. Exact installable package

Installable inner ZIP:

`OZON_BRIDGE_v0.1.19_MULTI_AI_FILE_DELIVERY_e62f75d8d0d3.zip`

Bytes:

`241807`

SHA-256:

`464f082b79a887391133d3d19c32d02f3b9864637b19fc7a201ce31f16dbeac3`

Package proof:

- `DETERMINISTIC_ZIP_REBUILD=PASS`;
- `FRESH_EXTRACT_BYTE_CONTENT_EQUIVALENCE=PASS`;
- production file count: `29`;
- stale `attachment_delivery_content.js`: absent;
- stale `shared/file_delivery_worker.js`: absent;
- all packaged JavaScript syntax checked;
- package CRC verified independently after Actions download.

GitHub Actions artifact:

- artifact id: `10048105650`;
- artifact name: `ozon-multi-ai-file-delivery-e62f75d8d0d34fecb1451dba3208f0c4c2ebd407`;
- artifact wrapper bytes: `240618`;
- artifact wrapper digest: `sha256:54999138e1792dfc8001dcfa2491fa1ba733c7297fefb7791e105459e1e07072`;
- created: `2026-09-08T08:52:31Z`;
- expires: `2026-10-08T08:52:30Z`.

Independent post-download readback of the Actions artifact proved:

- outer artifact SHA-256 exactly matches the Actions digest;
- outer artifact contains exactly the expected installable inner ZIP;
- inner ZIP is exactly `241807` bytes;
- inner ZIP SHA-256 is exactly `464f082b79a887391133d3d19c32d02f3b9864637b19fc7a201ce31f16dbeac3`;
- inner ZIP CRC test passes;
- inner ZIP contains 29 production files;
- required delivery files are present;
- superseded one-shot files are absent;
- packaged `attachment_delivery_port_content.js` contains `runtime.recoverCurrent = recoverCurrent;` immediately before normal-start `ensurePort()`.

## 9. Dependency closure

Affected dependency path is closed as follows:

1. batch finalization stores delivery owner state;
2. `file_delivery_model_policy` classifies applicable ChatGPT output as `attachment_watch_v1`;
3. durable owner state changes in `chrome.storage.local`;
4. `file_delivery_wake_worker.js` observes that state and emits one-way `OZ_ATTACHMENT_DELIVERY_WAKE` to the owner tab;
5. `attachment_delivery_wake_content.js` reads the global Port runtime and calls exported `runtime.recoverCurrent()`;
6. the export is now present on normal initialization before `ensurePort()` and does not depend on reconnect;
7. `recoverCurrent()` requests `OZ_ATTACHMENT_RECOVERY_GET` over the named Port;
8. `file_delivery_port_worker.js` resolves the owner and returns attachment recovery state;
9. file artifacts remain extension-owned; original provider-file bytes use the existing one-download capture/IndexedDB path;
10. content obtains only owned artifact metadata/chunks through the named Port;
11. target-specific adapter validates ChatGPT file-input support;
12. attachment commit/ready/send/confirm phases retain fail-closed no-blind-replay behavior;
13. 250 ms startup recovery and 60-second poll remain fallback recovery mechanisms, not the primary storage-wake path;
14. no provider request is introduced anywhere in wake/recovery delivery;
15. failed artifact persistence does not rewrite provider success and does not trigger a hidden refetch.

Historical/secondary assumptions checked:

- old one-shot attachment runtime absent from package;
- worker/content named-Port mismatch absent;
- wake listener does not share the RPC response channel;
- `recoverCurrent` is not reconnect-only;
- live-stop regression no longer injects a fake ready runtime;
- MV3 smoke no longer assumes target discovery equals completed top-level bootstrap;
- protected legacy `service_worker.js`, `content_script.js`, and `shared/composer_send.js` remain unchanged against the patch base;
- manifest/host permissions are unchanged;
- provider/report-file transport is unchanged by this corrective production edit.

Unaccounted affected dependencies: `0`.

Available-but-unverified pre-handoff dependencies: `0`.

Live-only terminal UI proof remains explicitly separated below.

## 10. Patch Delivery Gate — complete status

`GATE-01 PASS` — direct operator authorization exists for this patch cycle.

`GATE-02 PASS` — exact LIVE-GATE-03 defect and no-replay boundary were frozen before executable correction; secondary MV3 smoke defect was separately frozen before its harness correction.

`GATE-03 PASS` — exact scope is bounded to one production content-runtime file plus affected regressions/evidence; the separately discovered smoke readiness issue changed validation harness only.

`GATE-04 PASS` — no hidden mutation, reset, credentials, API, manifest, provider, entitlement, package-source or business-feature changes were introduced.

`GATE-05 PASS` — exact failing workflow was reconstructed through real provider HTTP 200 -> stored result -> batch collection -> missing immediate storage-wake recovery.

`GATE-06 PASS` — secondary sweep continued beyond the first root cause and found the independent MV3 smoke synchronization defect rather than stopping at the first green regression.

`GATE-07 PASS` — producer/consumer/storage/runtime/Port/artifact/adapter/send/test/package dependency inventory is closed; no affected consumer remains `UNKNOWN` or `NOT_CHECKED`.

`GATE-08 PASS` — affected dependency lifetime is traced from durable delivery-state creation through wake, named-Port recovery, artifact ownership, attach/send state machine, deterministic browser boundaries and exact packaged bytes. The actual logged-in ChatGPT post-install terminal effect is classified as live-only, not omitted.

`GATE-09 PASS` — architecture invariants retained: named-Port RPC, one-way storage wake, fail-closed attachment state machine, no one-shot RPC collision, rare 60-second fallback, no protected legacy delivery mutation.

`GATE-10 PASS` — provider/account behavior is separated from the Bridge defect; the live Ozon report-file request completed HTTP 200 before the delivery wake failure.

`GATE-11 PASS` — durability requirements are unchanged: owner state remains durable in extension storage and file artifacts remain extension-owned IndexedDB records; no new transient cross-command authority was introduced.

`GATE-12 PASS` — dependent live commands used fresh report code/ref values; the corrective test uses fresh runtime contexts and does not rely on stale live refs or reusing the failed provider request.

`GATE-13 PASS` — same-instance behavior is not used as sole proof; the final suite includes fresh VM contexts and a real unpacked MV3 service worker.

`GATE-14 PASS` — no stale provider ref is replayed to manufacture PASS; test-only identities are explicit deterministic fixtures and the live provider request is not repeated.

`GATE-15 PASS` — restart/recovery-sensitive guards remain fail-closed; committed attach/send states do not blind-replay and disposed runtimes do not process wakes.

`GATE-16 PASS` — available browser boundaries executed on pinned Chrome for Testing, including native File/DataTransfer and unpacked MV3 worker/IndexedDB/provider-capture-wrapper proof. Logged-in ChatGPT UI remains a separate live gate.

`GATE-17 PASS` — manifest/runtime parity remains valid and unchanged; named-Port content/wake ordering, worker bootstrap ordering and stale-runtime absence all pass.

`GATE-18 PASS` — exact installable ZIP was built from tested commit `e62f75d8...`, identified by tree/name/bytes/SHA, downloaded, reopened, CRC-checked and byte-identity read back.

`GATE-19 PASS` — the deterministic package was rebuilt after the final executable/test-harness candidate change. Any later validation commit is documentation-only and does not alter candidate/package bytes.

`GATE-20 PASS` — request-truthfulness paths are untouched by this production correction; logical/physical command transformation metadata remain provider-owned and no delivery code rewrites request truth.

`GATE-21 PASS` — logical/physical provider accounting remains intact; capture-accounting regression proves provider success survives artifact-store failure without fabricating another business request.

`GATE-22 PASS` — no hidden provider retry/refetch/pagination/polling/fan-out or blind attachment resend was introduced; explicit no-hidden-refetch and send single-flight controls pass.

`GATE-23 PASS` — positive and negative controls both exist: exact pre-fix missing-export condition is reproduced, while the corrected candidate proves normal-start export and immediate wake recovery.

`GATE-24 PASS` — entitlement behavior is untouched by the bounded content-runtime change; no provider/account condition is relabeled as delivery success.

`GATE-25 PASS` — personal-data policy gates are untouched; the patch adds no path around existing provider-file policy classification.

`GATE-26 PASS` — provenance boundaries remain unchanged: original provider bytes stay extension-owned artifacts and generated Bridge text remains separately classified.

`GATE-27 PASS` — semantic redaction/result formatting is unchanged; no raw provider secret/URL field is newly surfaced by the content-runtime export.

`GATE-28 PASS` — signed provider URLs, raw credentials and raw file bytes are not added to chat-visible diagnostics; content receives only owned descriptors/chunks through the existing Port contract.

`GATE-29 PASS` — trusted-host/SSRF and credential-boundary logic is unchanged in provider transport; the wake fix introduces no network destination or fetch path.

`GATE-30 PASS` — targeted deterministic regression explicitly reproduces the pre-fix normal-start export failure from commit `9654f314...` and proves the corrected candidate passes under the same healthy-Port/no-reconnect conditions.

`GATE-31 PASS` — all affected and intersecting file-delivery regressions pass on Linux, Windows and exact package source, including wake lifecycle, Port state machine, provider capture accounting, mixed-batch policy and adapter policy.

`GATE-32 PASS` — the fullest available pre-handoff workflow ran: static/deterministic regressions, Linux/Windows, real Chrome primitive, real unpacked MV3 worker/IndexedDB, deterministic ZIP and fresh extraction. Logged-in ChatGPT attachment confirmation is explicitly transferred to LIVE-GATE-03.

`GATE-33 PASS` — no stale/fabricated provider dependency is used; pre-fix SHA, final SHA/tree, deterministic test fixtures and live request identities are explicitly separated.

`GATE-34 PASS` — repair and validation perform no provider-side mutation; no new provider business request was executed to certify the patch.

`GATE-35 PASS` — after the final executable/test-harness candidate change, Actions run `34206779378` completed Ubuntu regression, Windows regression and package jobs successfully; exact-source regressions, Chrome/MV3 boundaries, deterministic ZIP rebuild, fresh extraction and artifact upload all passed. GATE-07/GATE-08 closure contains zero unknown affected dependencies.

`PRE-HANDOFF VERDICT: PASS`

## 11. Live gate status after this corrective package

Historical evidence retained:

- `LIVE-GATE-01 = PASS` for the small-result legacy text path on the previously installed candidate;
- `LIVE-GATE-02 = PASS` for complete oversized generated-TXT attachment on the previously installed candidate, but that prior run did not prove the corrected normal-start storage-wake timing contract.

Current package still requires post-install live proof:

- `LIVE-GATE-03 = PENDING POST-INSTALL` — fresh real Ozon provider file -> exactly one provider download -> captured original bytes -> immediate storage wake -> original file attachment -> one Send -> matching user-turn confirmation;
- `LIVE-GATE-04 = PENDING POST-INSTALL` — reload/recovery -> no duplicate provider request, attachment or Send;
- `LIVE-GATE-05 = PENDING POST-INSTALL` — Manual + Autorun terminalization with no stale BUSY.

`LIVE CERTIFICATION: PENDING`

No claim is made that the already failed LIVE-GATE-03 run has become PASS merely because the code was repaired.

## 12. Work ordering

`CAP-24 = FROZEN_AT_2200_OF_9519`.

Do not resume CAP-24 until the corrected installable ZIP is installed and the required live file-delivery completion gate is actually proven.
