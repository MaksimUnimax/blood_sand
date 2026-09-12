# Autorun HELP_V2 dependency closure

Executable `0cc968ee4b76d41e9c0361a905812fe49f313585`, tree `f9aa7ea1b1d00d6d3abdb22f1bb6adba78a84a90`, authoritative CI `34679992710`.

| ID | Producer | Readers / branches / final behavior | State and lifetime | Verification | Status |
|---|---|---|---|---|---|
| D01 | runtime_names API/V1/V2 constants | content helper, worker discovery, guidance, startup prompt | immutable module state | marker-guard; secondary-sweep | PASS |
| D02 | production AI adapter assistant text | latest new assistant selection and baseline exclusion | DOM/content instance | behavioral-green: BASELINE_ASSISTANT_NOT_REPLAYED; ONLY_LATEST_NEW_ASSISTANT_IS_CANDIDATE; browser-fixture-0 | PASS |
| D03 | shared marker predicate | candidateAfterAssistantBaseline and final latestText recheck (2/2) | pure local value; not persisted | marker-guard; behavioral-red independently exercises both old guards | PASS |
| D04 | completion and generation state | autoTick early guard, final completion check | current DOM response | STREAMING_AND_2000MS_STABILITY_GUARD; FINAL_RECHECK_COMPLETENESS_BLOCKED; browser-fixture-0 | PASS |
| D05 | message fingerprint and stability clock | candidate, autoFirstSeen, latestFingerprint | per-watch content memory; invalidated on change | CHANGED_FINGERPRINT_RESTARTS_STABILITY; FINAL_RECHECK_CHANGED_TEXT_BLOCKED | PASS |
| D06 | confirmed identity plus Alice active history | sameConversation, conversation key, beginAutoWatch and tick | live page identity; no stale URL fallback | WRONG_CONVERSATION_BLOCKED; WRONG_ORIGIN_BLOCKED; UNCONFIRMED_ROOT_BLOCKED; SPA_CHANGE_DURING_STABILITY_STOPS_WATCH; browser-fixture-0 | PASS |
| D07 | watch/run/baseline IDs | content admission and worker correlations | content instance plus durable chrome.storage.local auto_runs | CONCURRENT_TICKS_SINGLE_HANDOFF; DISPOSED_CONTENT_CANNOT_ADMIT; WORKER_RECREATION_NO_DUPLICATE_* | PASS |
| D08 | Manual and Autorun selection | beginAutoWatch mutual exclusion; worker mode admission | content/manual state and durable worker state | AUTORUN_DISABLES_MANUAL_MODE; WORKER_MANUAL_MODE_FAIL_CLOSED | PASS |
| D09 | OZ_AUTO_MESSAGE_READY payload | worker sender tab, binding, run, watch, conversation checks | runtime message boundary; existing persistent binding | FULL_CONTENT_WORKER_QUEUE_OUTPUT_*; WORKER_WRONG_TAB_FAIL_CLOSED; WORKER_MISSING_BINDING_FAIL_CLOSED; WORKER_MISSING_RUN_FAIL_CLOSED | PASS |
| D10 | ordered typed discovery records | HELP parser, API parser, sequential execution queue | worker admitted batch state | FULL_CONTENT_WORKER_QUEUE_OUTPUT_TRIPLE; FULL_CONTENT_WORKER_QUEUE_OUTPUT_MIXED; FULL_CONTENT_WORKER_QUEUE_OUTPUT_API_THEN_HELP | PASS |
| D11 | malformed HELP envelope | local guidance error then independent next entry | one admitted queue; no hidden provider calls | FULL_CONTENT_WORKER_QUEUE_OUTPUT_MALFORMED_HELP_THEN_VALID; regression-23; regression-24 | PASS |
| D12 | local HELP result | guidance serialization, combined output, next watch | existing delivery state; no provider request | FULL_CONTENT_WORKER_QUEUE_OUTPUT_SINGLE/TRIPLE; WORKER_RECREATION_NO_DUPLICATE_SINGLE/TRIPLE | PASS |
| D13 | API logical command and physical transport | policy, entitlement, planner, provider, result metadata | existing worker/request boundary; no new network path | FULL_CONTENT_WORKER_QUEUE_OUTPUT_MIXED; regression-24; regression-25; regression-28 | PASS |
| D14 | logical and physical request counts | batch header, per-result external status, transformation provenance | request metadata and output | regression-09; regression-23; regression-25; regression-28 | PASS |
| D15 | durable delivery and report refs | storage, recreation, recovery, expiry, fail-closed paths | IndexedDB and chrome.storage session/local contracts unchanged | regression-10; regression-12; regression-13; regression-15; regression-16; regression-29; regression-30; regression-31; browser-mv3-exact-package | PASS |
| D16 | original provider file versus generated TXT | delivery policy and adapters | existing durable artifact; exact bytes unchanged | regression-01..05; regression-08..14; regression-18..20; browser-fixture-1..4; browser-attachment-primitive | PASS |
| D17 | active versus idle recovery errors and Work restart | notification, pending-start transaction, Send outcome | existing durable Work session; unchanged production bytes | regression-04; regression-05; regression-06 | PASS |
| D18 | personal-data policy and provenance | execution guards, report file policy, redaction | settings and session provenance; unchanged | regression-08; regression-11; regression-14; regression-26; regression-28..31 | PASS |
| D19 | credentials and signed provider URLs | trusted HTTPS transport, SSRF rejection, redacted output | credentials isolated in existing provider transport | regression-14; regression-28; regression-29; regression-30; regression-31 | PASS |
| D20 | manifest and module ordering | content and worker entry, active runtime consumers | packaged MV3 manifest and scripts | secondary-sweep; browser-mv3-exact-package; 31 unchanged Git-blob proofs | PASS |
| D21 | startup and report continuation contract | LLM instruction tail, next command, guidance | existing prompt/output authority; unchanged | regression-21; regression-22; regression-23; regression-25 | PASS |
| D22 | frozen executable and package member bytes | Linux build, fresh extraction, browser and Windows consumers | deterministic 32-file ZIP; canonical Git blobs | all three identity.json and production-members.json; final byte readback | PASS |
| D23 | test fixtures and historical evidence | RED, GREEN, full runtime, real DOM prerequisites | fresh synthetic test flow; no reused live refs | behavioral-red; behavioral-green; pinned browser; failure ledger below; test-only fixtures are not live evidence | PASS |
| D24 | user installation and real AI/provider environment | installed workflow, actual conversation and real output | external live-only boundary | LIVE-GATE-01..05: PENDING POST-INSTALL | PENDING POST-INSTALL |

Active marker inventory is recorded line-by-line in `marker-dependencies.json`: exactly five files, two Autorun consumers, no old static-only ingress guards.

{
  "inventory_paths": 24,
  "pre_handoff_paths": 23,
  "unaccounted_pre_handoff_dependencies": 0,
  "stale_active_assumptions": 0,
  "available_but_unverified_pre_handoff_dependencies": 0,
  "live_gate_count": 5,
  "verdict": "PASS FOR PRE-HANDOFF SCOPE"
}

All browser tests here use exact packaged functions/modules with declared fixtures. No assertion of real installed AI acceptance or Ozon permission is made.
