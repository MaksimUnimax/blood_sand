# WB 0.2.1 parity gaps after full Ozon history re-audit

Date: 2026-09-12
Status: **CORRECTIVE GAP AUTHORITY / OLD PARITY CLAIMS SUPERSEDED**

## 0. Executive conclusion

WB 0.2.1 is not a faithful mature-Ozon provider-neutral parity build. It contains substantial good code and several correctly transferred primitives, but the first migration made a fundamental methodological error: it often **reimplemented an Ozon concept from a simplified authority and then tested that replacement against the same simplified authority**, instead of recovering the last accepted Ozon behavior from the complete patch history and using that behavior as the oracle.

This explains how the final offline suite could report `466 behavioral + 58 package PASS` while the first installed checks immediately exposed mature-Ozon contract violations.

The original file `WB_OZON_PARITY_MIGRATION_AND_TEST_AUTHORITY_2026-09-11.md` is preserved for history but is **SUPERSEDED for parity decisions** by this re-audit and `SUPERSEDING_PATCH_AUTHORITY_2026-09-12.md`.

## 1. Architecture evidence

Exact supplied mature Ozon v0.1.19 package:

- 30 production files;
- `service_worker.js` ~305,887 bytes / about 193 named functions;
- `content_script.js` ~126,878 bytes / about 133 named functions;
- mature dedicated modules include `service_worker_entry.js`, `attachment_delivery_port_content.js`, `attachment_delivery_wake_content.js`, `ozon_guidance.js`, `ozon_entitlements.js`, `file_delivery_port_worker.js`, `file_delivery_wake_worker.js`, `file_delivery_model_policy.js`, `direct_binary_file_delivery_patch.js`.

WB 0.2.1:

- 29 production files;
- `service_worker.js` ~114,264 bytes / about 98 named functions;
- `content_script.js` ~90,149 bytes / about 105 named functions;
- many mature Ozon subsystems were collapsed into `runtime_policy.js`, `runtime_worker.js`, `file_delivery.js`, `artifact_store.js`, `wb_command_protocol.js`, and `wb_batch_runtime.js`.

Code size does not by itself prove a defect. The defect is that several behavior/state boundaries present in mature Ozon have no equivalent path in WB, as detailed below.

---

# 2. Errors in the first migration authority itself

## GAP-001 — Wrong parity methodology

**Class:** `AUTHORITY_WRONG`

Old authority said the goal was not mechanical copying but transferring provider-neutral runtime concepts. That was reasonable in principle, but execution used this as permission to invent smaller substitute state machines without first deriving the exact mature behavior.

**Effect:** self-consistent WB code could pass WB-authored tests while still violating Ozon's accepted operator/runtime contract.

**Correction:** mature Ozon accepted behavior must be the oracle; a different implementation is allowed only when equivalence is demonstrated by differential tests.

## GAP-002 — A06 directly contradicts mature Ozon mixed HELP/API behavior

**Class:** `AUTHORITY_WRONG / CONFIRMED_CODE_MISMATCH`

Old A06 required mixed `WB_HELP_V1 + WB_API_V1` in one response to execute in source order.

Mature Ozon `discoverBatchEntries()` does the opposite: if HELP and API are both present it creates a local `MIXED_HELP_AND_API` error/guidance item and performs zero provider calls.

WB `wb_command_protocol.js` even documents the invented rule: `mixed HELP/API order`.

**Correction:** mixed HELP/API response must fail closed as a structured local chat result.

## GAP-003 — A06 and A51 were internally contradictory

**Class:** `AUTHORITY_WRONG`

A06 required ordered mixed HELP/API execution; A51 said unsafe mixed materialization must fail closed. The authority never resolved which semantic was canonical.

**Effect:** implementation chose A06 and diverged from mature Ozon.

## GAP-004 — TA-008 encoded the wrong oracle

**Class:** `QA_ORACLE_WRONG`

TA-008 expected mixed HELP/API source-order preservation. Therefore a PASS for TA-008 proved divergence from Ozon rather than parity.

**Correction:** replacement test must expect `MIXED_HELP_AND_API`, structured chat delivery and physical provider calls = 0.

## GAP-005 — The old authority under-specified error delivery

**Class:** `AUTHORITY_INCOMPLETE`

A11 correctly said a disabled alias must return a local **structured error**, but the overall test plan reduced TA-009/TA-010 to “local error, zero calls” and did not require that the structured error be delivered into the AI conversation.

**Effect:** toast-only behavior passed offline tests even though it violates Ozon's user-facing contract.

---

# 3. Confirmed runtime defects in WB 0.2.1

## GAP-006 — Local command errors are toast-only instead of durable chat results

**Class:** `CONFIRMED_DEFECT`

Installed F-02:

`WB_API_V1 {"operation":"definitely_unknown_operation","params":{}}`

Observed: only `Wildberries: Operation blocked locally.` toast. No structured `WB_RESULT_V1` was delivered into the chat.

Root cause in WB `executeManualCommand()`:

1. parse command;
2. if the only entry has a local code, `throw Operation blocked locally`;
3. durable manual operation is created **after** this throw;
4. content script catches the exception and shows a toast.

Mature Ozon does the opposite:

- Work/manual/Autorun/parser/discovery failures are first converted to `batchErrorEntry` / `pre_execution_error`;
- a durable manual operation/batch exists;
- `buildPreExecutionErrorResult()` produces a structured Bridge result with `external_request_executed=false`;
- that result is delivered back into the originating AI chat.

**Scope is wider than unknown aliases.** The same WB early-throw class affects manual mode off, Work-not-active, Autorun conflict, malformed/disabled/unsupported admission and other pre-execution exceptions.

## GAP-007 — Personal Data gate can fall into the same toast-only class

**Class:** `CONFIRMED_BY_CODE / NEEDS_INSTALLED_RETEST_AFTER_PATCH`

WB `runtime_policy.admission()` throws `PERSONAL_DATA_DISABLED`. The simplified provider path does not first convert this into an Ozon-style `policy_error` batch entry/result.

Mature Ozon has `buildPersonalDataPolicyErrorResult()` which tells the AI/operator that Personal Data must be enabled and a **new explicit command** submitted, with provider calls = 0.

**Correction:** all local policy/entitlement/date/schema/planning rejections must use the same durable structured chat-result path.

## GAP-008 — Popup has two competing manual/page-button authorities

**Class:** `CONFIRMED_DEFECT`

Mature Ozon popup explicitly states: the Ozon page button is controlled only by the Work Session block; Autorun is separate.

WB 0.2.1 exposes both:

- Work Session `work-toggle` (`Показать/скрыть`), and
- separate `manualMode` switch (`Ручной режим Wildberries`).

These represent the same operator concept and can diverge.

**Correction:** one Work Session authority, matching mature Ozon structure; WB page button styled in Wildberries visual identity.

## GAP-009 — Popup functional structure was not actually ported from Ozon

**Class:** `CONFIRMED_DEFECT / INCOMPLETE_PARITY`

Mature Ozon popup has Work controls and state, AI mode meta, binding, Personal Data explanation, live Seller metadata/currentness sections, credential surfaces, diagnostics and an explicit extension-owned code-block-button section.

WB popup was redesigned independently. It added custom controls such as `composerWait`, `bootstrapText`, `saveRuntime`, `newContext`, `quotaStatus`, `runtimeStatus`, `xlsxInspect`, plus the duplicate manual switch, while omitting/altering mature Ozon operator surfaces.

Some omissions are WB-provider-specific and should remain deferred. The mistake was presenting the redesigned popup as transferred Ozon parity.

## GAP-010 — Stale Work status plaque is visible with active session

**Class:** `CONFIRMED_INSTALLED_DEFECT`

Installed UI-06A showed simultaneously:

- Work state `active_visible`, and
- stale red `WORK_NOT_ACTIVE`.

Mature Ozon had late dedicated repairs for global idle plaque / Work restart and then reran a full final gate.

**Correction:** active Work state and stale inactive/error plaque must never coexist.

---

# 4. Work Session parity gaps

## GAP-011 — Only the small Work model was copied; mature recovery protocol was replaced

**Class:** `INCOMPLETE_PARITY`

`work_session_model.js` is nearly identical, but Ozon's actual durability lives in worker orchestration, not the small model.

Mature Ozon persists a recovery record containing recovery ID, revision, old/new runtime generation, worker session ID, tab/origin/AI/conversation identity, previous state, provider/delivery phase and expiry.

WB `wbWorkAction()` uses a smaller per-conversation work record and a direct `recovering -> tab reinit -> restore state` flow.

## GAP-012 — Refresh provider-phase terminalization is incomplete

**Class:** `INCOMPLETE_PARITY / EXACTLY_ONCE_RISK`

Mature Ozon Refresh explicitly distinguishes:

- provider request already in flight → `REQUEST_OUTCOME_UNKNOWN_NO_RETRY`;
- delivery already prepared → preserve result/delivery;
- quota/pre-provider state → cancel without replay.

WB does not carry the same provider/delivery-phase recovery object through Work Refresh.

## GAP-013 — Mature runtime-generation recovery handshake is missing

**Class:** `INCOMPLETE_PARITY`

Ozon waits for exact conversation identity plus the new runtime generation before restoring visibility/command acceptance. WB has general stale-runtime protections, but not the same persisted Work recovery generation protocol.

## GAP-014 — Work durable storage authority was collapsed

**Class:** `INCOMPLETE_PARITY`

Ozon runtime names include dedicated `WORK_SESSIONS`, `PENDING_WORK_STARTS` and `WORK_SESSION_RECOVERIES`. WB final `runtime_names.js` does not. WB uses custom keys in `runtime_worker.js` instead.

Different keys are not themselves a bug; missing equivalent persisted state/semantics is the parity gap.

## GAP-015 — Work resume vs provider status separation not faithfully inherited

**Class:** `INCOMPLETE_PARITY`

Ozon had a dedicated fix branch because successful Work UI recovery must not imply that an interrupted provider operation is safe or retryable. WB's simplified state path does not reproduce that mature separation in full.

---

# 5. HELP/guidance and command-discovery gaps

## GAP-016 — HELP V2 / Guidance V1/V2 were not ported

**Class:** `INCOMPLETE_PARITY`

Mature Ozon contains `OZON_HELP_V1`, `OZON_HELP_V2`, `OZON_GUIDANCE_RESULT_V1` and `OZON_GUIDANCE_RESULT_V2`, plus late marker repairs.

WB has only `WB_HELP_V1` catalog/describe.

The current WB HELP is useful and its installed local checks passed, but it is a smaller custom subsystem, not mature Ozon guidance parity.

## GAP-017 — Command discovery lacks Ozon-style local guidance classification

**Class:** `INCOMPLETE_PARITY`

Ozon classifies invalid/discovery attempts into guidance/pre-execution entries with sanitized descriptors and produces a structured local result. WB parser returns entry codes and throws early in Manual.

---

# 6. Operation authority / entitlement / metadata gaps

## GAP-018 — Entitlement “framework” is a placeholder, not mature parity

**Class:** `PROVIDER_SPECIFIC_DEFERRED / REPORT_OVERCLAIM`

WB `operationAuthority()` hardcodes `entitlement_status='entitlement_unknown'` and `entitlement_required=false` for the packaged baseline. This is deliberately conservative and appropriate before WB characterization.

The error was describing the entitlement subsystem as transferred/completed parity. Mature Ozon has dedicated entitlement authority and capability resolution.

## GAP-019 — Dynamic provider metadata/currentness refresh is not equivalent

**Class:** `PROVIDER_SPECIFIC_DEFERRED / INCOMPLETE_PARITY`

Mature Ozon refreshes trusted official metadata, validates source/redirect/snapshot, computes diff and preserves last-known-good on failure, with operator-visible metadata state.

WB has generic LKG/schema utilities but no equivalent live WB metadata authority enabled yet.

Correct status: deferred until WB characterization, not parity complete.

## GAP-020 — Capability/query planning error paths were collapsed

**Class:** `INCOMPLETE_PARITY`

Mature Ozon has separate `buildCapabilityPlanningErrorResult`, `ensureBatchCapabilityAndPlanning`, `ensureBatchQueryPlanning`, query-group/coalescing result functions, and safe planning summaries.

WB has a smaller generic policy `plan()` and one provider execution path.

---

# 7. Quota/cache/planner gaps

## GAP-021 — Quota scheduler is only a generic skeleton

**Class:** `INCOMPLETE_PARITY / PROVIDER_SPECIFIC_DEFERRED`

WB correctly hashes account scope, stores next eligibility, observes Retry-After and never auto-retries. However mature Ozon includes worker-wide provider-family scheduling, quota wait persistence/resume, countdown/probe UI and dedicated accepted live-repair history.

**Correction:** keep WB values disabled until characterization, but port mature orchestration semantics before claiming parity.

## GAP-022 — Cache/coalescing/prefetch “PASS” meant disabled framework, not transferred Ozon subsystem

**Class:** `REPORT_OVERCLAIM`

WB deliberately rejects coalescing/prefetch without reviewed rules and disables cache by default. That is safe and should remain so.

The mistake was using framework unit tests as evidence that the mature Ozon optimization subsystem itself had been ported.

---

# 8. Manual batch / delivery gaps

## GAP-023 — Durable batch is created after local admission, not before it

**Class:** `CONFIRMED_DEFECT`

This is the architectural root of F-02. Mature Ozon first materializes command/guidance/error entries and then creates a durable operation. WB parses/throws first.

**Correction:** every explicit attempt must be representable in the durable batch, including zero-provider local failure.

## GAP-024 — Mature manual delivery phases were simplified

**Class:** `INCOMPLETE_PARITY`

Ozon tracks delivery ownership and phases such as claimed/inserted/insert-committed/confirmed, detects unknown insertion outcome, and recovers without duplicate send/provider replay.

WB has delivery metadata and good no-retry guards, but its state machine is materially smaller.

---

# 9. File/artifact delivery gaps

## GAP-025 — Named Port/chunk/SHA primitive was ported, but not the full mature transaction

**Class:** `PARTIAL_PORT / INCOMPLETE_PARITY`

WB does have a real named `WB_FILE_V1` Port, bounded chunks, per-chunk SHA and whole-file SHA, conversation scoping and an IndexedDB artifact store. This part of the earlier report was not fabricated.

But mature Ozon additionally has explicit worker/content protocols for attach commit, attachment-ready ACK, send commit, send rollback, confirmation, reconciliation and uncertain-outcome refusal.

## GAP-026 — Attachment ownership/reconciliation is incomplete relative to Ozon

**Class:** `INCOMPLETE_PARITY`

Ozon has `assertSenderOwner`, artifact ownership, commit actor, recovery payloads, `ATTACH_OUTCOME_UNKNOWN_NO_RETRY`, existing-attachment reconciliation and send transaction rollback.

WB validates conversation/composer and file refs, but does not implement the same complete transaction protocol.

## GAP-027 — Dedicated attachment content/wake runtime was collapsed

**Class:** `INCOMPLETE_PARITY`

Mature Ozon manifest loads dedicated `attachment_delivery_port_content.js` and `attachment_delivery_wake_content.js`; worker uses dedicated file-delivery modules and entry bootstrap.

WB folds this into `content_script.js`, `file_delivery.js`, `runtime_worker.js` and direct worker imports. A different architecture is allowed only if behavioral equivalence is proven; it was not.

## GAP-028 — Startup pending-delivery recovery was not proven against Ozon semantics

**Class:** `INCOMPLETE_PARITY`

Mature Ozon has a dedicated pending attachment recovery path on normal startup plus committed-attachment reconciliation. WB has a wake/startup path, but final tests did not differentially prove the same transaction outcomes.

## GAP-029 — Provider-truth preservation tests were narrower than mature Ozon file workflow

**Class:** `INCOMPLETE_PARITY`

WB tests checked that an attachment failure does not cause a second provider call and preserves result truth. Good. They did not prove the full mature Ozon artifact lifecycle under all commit/recovery boundaries.

---

# 10. Provider transport/report workflow gaps

## GAP-030 — Mature Ozon report parsers were not transferred

**Class:** `PARTLY_PROVIDER_SPECIFIC_DEFERRED / PARTLY_GENERIC_GAP`

Ozon provider transport includes bounded trusted report-file retrieval plus ZIP/XML relationship parsing, XLSX shared strings/sheets, delimited text and PDF text extraction.

WB transport only provides bounded JSON/binary reads; XLSX parsing was moved to a separate browser-side reader.

Ozon-specific report URLs/tasks must not be copied, but reusable bounded report parsing/file policy should have been explicitly classified rather than silently omitted while A32/A35 were called transferred.

---

# 11. Multi-AI / Alice gaps

## GAP-031 — Multi-AI core exists, but mature late Alice repair chains were not used as acceptance oracle

**Class:** `INCOMPLETE_PARITY`

WB adapted `ai_adapters.js`, `ai_delivery_capabilities.js`, `web_file_attachment.js` and copied `composer_send.js`/conversation identity closely. This is real work.

But mature Ozon separately repaired and accepted:

- Alice oversized complete TXT;
- blocked send wait/no-op behavior;
- drag/drop/first-party input contract;
- SPA attachment ownership;
- provider-file runtime capability;
- Alice XLSX live capability.

WB synthetic fixtures were treated as parity proof before those exact behavior chains were reconciled.

## GAP-032 — Alice live capability evidence was replaced by synthetic-equivalent tests

**Class:** `QA_SCOPE_OVERCLAIM`

Local Chromium fixtures prove many browser primitives but are not equivalent to the exact live-repair evidence that caused the late Ozon patches.

**Correction:** after the parity patch, repeat the same behavior classes on installed current ChatGPT/Alice, not only fixtures.

---

# 12. Bootstrap / new-chat gap

## GAP-033 — WB bootstrap was independently designed instead of porting the accepted Ozon lifecycle

**Class:** `INCOMPLETE_PARITY`

Ozon had an explicit repair making bootstrap prompt editable before conversation identity, with boundary corrections and a final gate.

WB added `bootstrapText/newContext` but its lifecycle/popup integration was custom. It must be reimplemented/retested against the accepted Ozon new-chat contract as part of the popup/Work rewrite.

---

# 13. XLSX status

## GAP-034 — Parser fixes were ported correctly, but parity report overreached to end-to-end capability

**Class:** `CORRECT_PRIMITIVE / LIVE_PARITY_UNPROVEN`

WB contains fixes for implicit cell references and worksheet namespace tolerance. Those are valid transfers.

What was not inherited was the later live Alice XLSX capability acceptance chain. Therefore “XLSX parser fixed” is justified; “mature Ozon XLSX delivery parity” is not.

---

# 14. Autorun product-scope mistake

## GAP-035 — First authority spent parity scope on Autorun that the operator does not plan to ship

**Class:** `PRODUCT_SCOPE_WRONG / NON_PROD`

The first authority and popup exposed substantial Autorun controls/tests. The operator has now explicitly stated Autorun will not be in production.

**Correction:** keep any internal Autorun code only where useful for diagnostics/regression, but do not let it drive popup design or block production parity. Production operator path is Work Session/manual behavior.

---

# 15. QA / acceptance mistakes

## GAP-036 — Offline TA matrix tested the replacement implementation, not mature Ozon parity

**Class:** `QA_ORACLE_WRONG`

Example: TA-008 passed precisely because WB accepted mixed HELP/API in order — the opposite of mature Ozon.

## GAP-037 — TA-009/TA-010 missed the user-visible structured-result requirement

**Class:** `QA_COVERAGE_GAP`

The matrix treated “local error, zero calls” as sufficient. Installed F-02 showed why that is insufficient: the operator/AI never receives the actual Bridge error in the conversation.

## GAP-038 — Work tests validated a simplified state machine

**Class:** `QA_ORACLE_INCOMPLETE`

The tests checked Start/Refresh/Finish/recreation behavior of WB's custom Work implementation but did not assert Ozon's persisted recovery record, generation handshake, provider-phase terminalization and UI/status coherence.

## GAP-039 — File tests validated primitives, not full delivery transaction parity

**Class:** `QA_ORACLE_INCOMPLETE`

The final suite proved native File/DataTransfer, chunks, hashes, owner checks and several composer boundaries. It did not prove Ozon's complete attach/send commit/rollback/reconcile state machine.

## GAP-040 — “466 + 58 PASS” was presented too close to a parity acceptance claim

**Class:** `REPORT_OVERCLAIM`

The report did contain caveats about installed/live checks, but it still called the build “первый пакет переноса из Ozon” and marked every available gate PASS while core parity oracles were wrong or incomplete.

**Correction:** those counts remain valid only as tests of WB 0.2.1's own implementation. They are **not evidence of mature Ozon parity**.

---

# 16. Correctly transferred or useful parts that should not be discarded

The re-audit is not a reason to rewrite everything. These parts are confirmed useful/correct within their proven scope:

1. strict canonical WB command envelope validation;
2. rejection of AI-supplied URL/method/headers/auth;
3. preservation of original 172 enabled / 16 disabled WB registry rows without inventing new aliases;
4. source-order API batch execution and no hidden provider fan-out;
5. no-blind-retry handling for unknown provider outcomes in tested worker paths;
6. conversation identity implementation is effectively the mature shared Ozon implementation;
7. `composer_send.js` is the mature shared implementation;
8. stale-runtime/cross-chat guards are materially useful; installed F-01 cross-chat isolation passed;
9. `work_session_model.js` state definitions are essentially the same shared model, even though worker recovery orchestration is incomplete;
10. IndexedDB artifact writes wait for transaction completion;
11. opaque artifact refs, owner metadata, bounded chunks and SHA-256 integrity exist;
12. real named `WB_FILE_V1` Port exists;
13. two XLSX parser bug fixes (implicit cell ref + namespace tolerance) are present;
14. local registry HELP works with zero WB provider calls; installed UI-04 passed;
15. real WB rate/cache/coalescing/prefetch values were conservatively left disabled rather than invented.

These should be preserved and reconciled, not thrown away.

---

# 17. Installed evidence status after correction

- UI-04 local HELP catalog/describe suite: **PASS within its local-HELP scope**.
- UI-05A ordered Manual HELP batch: **PASS for current WB custom batch behavior**, but mixed HELP/API has not been accepted and will change.
- UI-06A Work Session Start: **FAIL_UI_STATE_SYNC** (`active_visible` + stale `WORK_NOT_ACTIVE`).
- F-01 cross-chat isolation: **PASS**.
- F-02 unknown operation: **FAIL_LOCAL_ERROR_NOT_DELIVERED_TO_CHAT**; earlier PASS classification is explicitly corrected and preserved as historical mistake.

No further WB post-install tests should run until the corrective parity patch is built.

---

# 18. Required next step

Use `SUPERSEDING_PATCH_AUTHORITY_2026-09-12.md` as the implementation authority for the next provider-neutral corrective patch. Do not start WB API characterization yet. After the patch is built, run installed parity acceptance against the mature Ozon behavioral oracle; only then proceed to real WB R1–R8 characterization.