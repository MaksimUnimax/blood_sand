# Ozon Bridge patch-history re-audit for Wildberries parity

Date: 2026-09-12
Status: **RE-AUDIT AUTHORITY / WB TESTING PAUSED**

## 0. Why this re-audit exists

The first Wildberries parity pass treated the mature Ozon Bridge as a set of provider-neutral ideas that could be reimplemented behind equivalent-looking interfaces. That was not strict enough. Installed WB 0.2.1 immediately exposed two classes of mismatch: popup/Work UI did not match the mature Ozon operator model, and a local admission failure was shown only as a toast instead of being materialized as a durable structured result back into the AI chat.

This re-audit therefore reconstructs the **evolution of the accepted Ozon behavior**, including failed/rolled-back attempts, instead of copying branch names or individual snippets. Final truth is the mature Ozon v0.1.19 package plus later accepted repair chains and their validation/pre-handoff evidence.

Exact local Ozon reference supplied by the operator:

- archive: `OZON_BRIDGE_v0.1.19_MULTI_AI_FILE_DELIVERY_5aa1b4a21a0a.zip`;
- bytes: `245479`;
- SHA-256: `a5765f11148b921baeff5e18b64b428c9d598f9fbb41b8ff91fd9cef7cb8fb83`;
- 30 production files;
- major mature runtime files include `service_worker_entry.js`, `service_worker.js`, `content_script.js`, `attachment_delivery_port_content.js`, `attachment_delivery_wake_content.js`, and the shared guidance/registry/entitlements/file-delivery/provider modules.

The exhaustive Ozon branch inventory is separately frozen in `OZON_BRANCH_INVENTORY_171_2026-09-12.md`: GitHub returned exactly **171 Ozon branches**. Branch names are evidence inputs, not automatically accepted truth.

## 1. Acceptance methodology recovered from Ozon history

The mature Ozon development process repeatedly followed this causal pattern:

1. define or discover a contract;
2. reproduce the actual defect or missing boundary;
3. patch the underlying runtime, not only the visible symptom;
4. run deterministic unit/integration gates;
5. run browser/MV3/live gates where the defect depended on browser/provider behavior;
6. freeze the exact candidate/artifact;
7. preserve failed attempts and evidence;
8. only then declare the behavior accepted.

A branch named `repair/...` is **not** automatically the final accepted behavior. Several repair branches contain a live FAIL followed by another corrective branch; the provider lifecycle repair was explicitly rolled back. This is critical to WB parity.

## 2. Core v0.1.19 Step 1 — contract and capability

Branches:

- `dev/ozon-v0.1.19-step1-contract-capability-2026-08-17`;
- `validation/ozon-step1-contract-capability-*`.

Why it existed: the bridge needed a strict command/operation authority rather than allowing the AI to supply arbitrary request transport details or assuming endpoint capability from HTTP shape alone.

Accepted behavior:

- strict command envelope and allowlisted operation metadata;
- reviewed semantic effect rather than method-only classification;
- capability/entitlement boundaries;
- fail-closed local admission;
- safe structured error envelopes;
- deterministic validation of operation authority.

WB relevance: strict WB envelope validation was ported substantially, but later local-error delivery and entitlement/currentness behavior were not ported with the full Ozon semantics.

## 3. Core Step 2 — query planner and coalescing

Branches:

- `dev/ozon-v0.1.19-step2-query-planner-coalescing-2026-08-17`;
- `validation/ozon-step2-query-planner-coalescing-2026-08-17`.

Why: reduce redundant provider requests without creating hidden fan-out or changing the logical result contract.

Accepted behavior:

- planner owns logical→physical mapping;
- coalescing is allowed only under reviewed provider rules;
- evidence/provenance records physical request counts and fingerprints;
- unsafe or unknown combinations remain separate or fail closed.

WB relevance: WB 0.2.1 contains a generic planner placeholder and intentionally disables coalescing/prefetch until characterization. That conservative default is correct, but it is **framework-only**, not full Ozon planner parity.

## 4. Core Step 3 — quota, verifier, structured errors

Branches:

- `dev/ozon-v0.1.19-step3-quota-verifier-errors-2026-08-17`;
- `validation/ozon-step3-quota-verifier-errors-2026-08-17`;
- `dev/ozon-v0.1.19-live-repair-quota-countdown-2026-08-18`.

Why: rate limits, semantic provider errors, and pre-execution errors had to become durable observable state rather than transient exceptions.

Accepted behavior:

- account/provider-family quota authority;
- Retry-After becomes an eligibility time, never an automatic retry permission;
- quota wait/countdown is visible to the operator;
- verifier separates transport/HTTP/body/schema/semantic errors;
- errors become safe structured Bridge results;
- provider calls are counted precisely.

WB relevance: WB contains a generic quota engine and no-auto-retry invariant, but mature Ozon quota orchestration/countdown/error delivery was not transferred completely.

## 5. Core Step 4 — cache, prefetch, semantic acceptance

Branches:

- `dev/ozon-v0.1.19-step4-cache-prefetch-semantic-acceptance-2026-08-18`;
- `validation/ozon-step4-cache-prefetch-semantic-2026-08-18`.

Why: optimization cannot be enabled merely because two requests look similar; semantic equivalence and current provider authority are required.

Accepted behavior:

- cache is account/request scoped;
- malformed/errors are never cached;
- superset/coalescing/prefetch require reviewed rules;
- every reuse preserves provenance;
- optimizations default fail-closed when their semantic proof is missing.

WB relevance: disabling WB cache/coalescing/prefetch before real WB characterization is correct. The first migration report nevertheless overstated this as a completed transferred subsystem instead of a disabled framework.

## 6. Manual delivery / composer readiness

Branches:

- `dev/ozon-v0.1.19-manual-delivery-composer-wait-2026-08-18`;
- `validation/ozon-manual-delivery-composer-wait-2026-08-20`;
- `fix/ozon-work-composer-control-2026-08-21`.

Why: a provider result can be correct while the AI composer is absent, changing, blocked, or owned by another UI surface. Delivery must not lose or duplicate the provider result.

Important accepted fixes include:

- Work composer completion;
- bounded composer readiness waits;
- manual delivery cancellation only when the manual channel is actually OFF;
- no duplicate send/click;
- delivery ownership survives transient UI state.

WB relevance: WB copied `composer_send.js` exactly and preserved several readiness guards, but its overall manual delivery state machine is materially simpler than Ozon's mature claimed/inserted/committed/confirmed lifecycle.

## 7. Guided command discovery and HELP

Branches:

- `design/ozon-guided-command-discovery-2026-08-21`;
- `feature/ozon-guided-command-discovery-2026-08-21`;
- later `repair/ozon-help-v2-autorun-marker-2026-09-12` / `repair/ozon-autorun-help-v2-marker-2026-09-12`.

Why: the AI needs local operation discovery without external API calls, while invalid/ambiguous command attempts still need structured feedback.

Mature final contract:

- `OZON_HELP_V1` and `OZON_HELP_V2`;
- `OZON_GUIDANCE_RESULT_V1/V2`;
- HELP/guidance is local and registry-derived;
- invalid/discovery attempts become `pre_execution_error`/guidance batch items;
- **HELP and API envelopes in the same assistant response are rejected locally with `MIXED_HELP_AND_API`** rather than executed in source order;
- late HELP-marker fixes were retested through full final gates.

WB relevance: WB has only `WB_HELP_V1` and deliberately implemented mixed HELP/API ordering. That is not mature Ozon parity.

## 8. Work Session design and lifecycle

Branches:

- `design/ozon-session-lifecycle-and-personal-data-policy-2026-08-21`;
- `feature/ozon-work-session-lifecycle-2026-08-21`;
- `repair/ozon-work-session-lifecycle-2026-08-24`;
- `fix/ozon-work-session-finish-no-autorun-2026-08-24`;
- `fix/ozon-work-session-refresh-inprocess-reinit-2026-08-24`;
- `fix/ozon-work-session-refresh-response-boundary-2026-08-24`;
- `fix/ozon-work-session-refresh-wake-2026-08-24`;
- `fix/ozon-work-resume-provider-status-separation-2026-08-24`;
- `test/ozon-work-session-lifecycle-patch-a-browser-candidate-2026-08-24`;
- late `repair/ozon-global-toast-work-restart-2026-09-11`.

Why: Work Session is not a cosmetic popup toggle. It owns the manual page control and must survive popup/worker/tab lifecycle without replaying provider work.

Mature accepted semantics:

- single Work Session authority for page button visibility;
- states include inactive/active_visible/active_hidden/recovering/error;
- Start, Refresh, Show/Hide, Finish have distinct transitions;
- Refresh is persisted with a recovery record containing recovery ID, revision, old/new runtime generations, worker session ID, tab, origin, AI/conversation identity, previous state, provider/delivery phase and expiry;
- refresh command acceptance closes while recovery is in progress;
- exact conversation identity and a new runtime-generation handshake are required before restoring visibility;
- an in-flight provider request during refresh becomes `REQUEST_OUTCOME_UNKNOWN_NO_RETRY`;
- a prepared delivery is preserved instead of refetching;
- pre-provider/quota-wait work can be cancelled without replay;
- Finish tolerates absent Autorun and does not create a new request;
- Work-resume status is separate from provider-request status;
- stale global/idle plaque state was repaired and then run through a full final gate.

WB relevance: WB 0.2.1 copied the small Work Session model but replaced the mature worker recovery protocol with a much smaller custom `wbWorkAction()` flow. Installed UI already exposed stale `WORK_NOT_ACTIVE` while the Work state was `active_visible`.

## 9. Full Ozon read-surface / operation authority

Branches:

- `feature/ozon-full-read-core-b0-2026-08-25`;
- `feature/ozon-b1...b49-*`;
- `audit/ozon-b1-b49-v2-reconciliation-2026-08-28`;
- exact Swagger authority / 245-read acceptance chains;
- Performance 48-read chains;
- Step 9 full integration 266 reads;
- full 266 live test and Step 10 owner/postrelease/frozen acceptance branches;
- `repair/ozon-current-swagger-refresh-2026-09-01`.

Why: operation count is not enough. Each read needs source authority, exact request/response shape, effect classification, entitlement/currentness and negative verification.

WB relevance: Ozon endpoint names must not be copied to WB. What must be copied is the **methodology**: exact provider authority, negative tests, currentness, owner live acceptance, and refusal to infer entitlement/schema from an old snapshot. WB correctly deferred much of this to later WB characterization, but the Phase-1 report should not have described registry/entitlement/schema parity as complete.

## 10. Disabled alias admission

Branch: `repair/ozon-disabled-alias-admission-2026-09-07`.

Why: a disabled alias could not be allowed into a request lifecycle and then fail like a transport error.

Accepted chain proved:

- disabled alias rejected before provider dispatch;
- batch terminalizes **locally**;
- structured result is materialized;
- provider calls remain zero;
- exact command-envelope authority and live candidate were subsequently certified.

WB relevance: the WB authority itself required a local structured error, but WB 0.2.1 throws before creating the durable manual operation. Installed F-02 therefore produced only `Wildberries: Operation blocked locally.` toast and no chat result. This is a confirmed parity defect.

## 11. Provider lifecycle repair and rollback

Branches:

- `repair/ozon-provider-lifecycle-terminalization-2026-09-07`;
- `rollback/ozon-provider-lifecycle-terminalization-2026-09-07`.

Why: a proposed lifecycle change attempted to solve terminalization but did not survive live acceptance.

Critical lesson: history explicitly records `mark lifecycle repair live failed and rolled back` and restores the exact pre-patch runtime before proving trigger behavior again.

WB relevance: the first migration read feature/repair ideas as design material too eagerly. The re-audit must use only the last accepted behavior after rollback/replacement.

## 12. Multi-AI design

Branches:

- `design/ozon-multi-ai-autodetect-multichannel-2026-09-02`;
- later Multi-AI/file-delivery repair families.

Why: ChatGPT and Alice cannot share DOM assumptions, send controls, attachment strategy, or conversation identity rules.

Mature method:

- provider-neutral adapter interface;
- provider-specific DOM/identity/composer/attachment behavior;
- fail-closed unknown AI;
- browser acceptance for each AI and each delivery mode.

WB relevance: core adapters were copied/adapted substantially, but late Alice-specific accepted repair chains were not re-used as the parity oracle; synthetic WB fixtures were treated as sufficient too early.

## 13. Date contract

Branches:

- `audit/ozon-date-contract-sweep-*`;
- `repair/ozon-date-contract-2026-09-04`.

Why: date/date-time/rolling-window/history limits belong to the reviewed operation contract and cannot be guessed from generic types.

WB relevance: WB has a generic date validator but no live WB date rules enabled. This is correctly deferred provider-specific work, not a completed parity feature.

## 14. Read-effect reclassification

Branch: `repair/ozon-read-effect-reclassification-2026-09-02`.

Why: HTTP method alone is not semantic effect; some POST operations are reads and some nominally readable surfaces can still be unsafe/unresolved.

WB relevance: WB registry retains reviewed `effect=READ` values and preserves the principle. Real WB effect recertification remains provider-specific deferred work.

## 15. XLSX repairs

Branches:

- `repair/ozon-xlsx-implicit-cell-ref-2026-09-07`;
- `repair/ozon-xlsx-worksheet-namespace-parser-2026-09-07`;
- `diag/ozon-xlsx-live-zero-rows-2026-09-07`;
- `repair/ozon-alice-xlsx-live-capability-2026-09-12`.

Why:

- valid XLSX cells can omit explicit `r="A1"`;
- worksheet XML can use namespaces/prefix variants;
- parser correctness is not enough unless a live delivery path actually carries the parsed file/rows to the target AI.

Accepted chain included causal RED→GREEN parser fixes, replacement/removal of a superseded broken workflow, live causal XLSX acceptance, and later Alice XLSX live capability pre-handoff.

WB relevance: WB copied the two parser fixes and tested them locally, which is useful. It did not inherit the same live Alice XLSX acceptance proof.

## 16. Multi-AI file delivery / generic direct binary

Branches:

- `repair/ozon-multi-ai-file-delivery-2026-09-08`;
- `repair/ozon-generic-direct-binary-delivery-2026-09-08`;
- handoff branches for files/logs.

Why: large/provider file results must not become huge transient messages or lose provider truth when browser delivery fails.

Important history point: the Multi-AI file branch first freezes a **direct-binary attachment live failure**; later corrective builds and live matrices close the actual boundary. This is another case where branch name != final truth.

Mature file-delivery architecture contains:

- worker-side IndexedDB artifact authority;
- ownership checks;
- opaque refs;
- named Port;
- chunk transfer and full SHA-256;
- explicit attach commit;
- ready acknowledgement;
- send commit;
- commit/rollback/reconciliation after uncertain UI outcomes;
- pending recovery on normal startup;
- no provider replay;
- provider-success truth preserved if attachment fails.

WB relevance: WB implements IndexedDB artifacts, a named `WB_FILE_V1` Port, chunks and SHA checks. That is a real partial port. But it does not preserve the full mature Ozon commit/rollback/reconciliation protocol; it collapses the architecture into smaller custom modules.

## 17. Bootstrap/new-chat repair

Branch: `repair/ozon-bootstrap-prompt-editable-new-chat-2026-09-10`.

Why: a new chat has no confirmed conversation identity yet, so bootstrap text must be editable/usable before the final ID exists without binding prematurely.

Accepted fix: make bootstrap prompt editable before conversation identity, after exact lifecycle-boundary fixes, then run final gate evidence.

WB relevance: WB added a custom `bootstrapText/newContext` path. It must be rechecked against this exact lifecycle after the popup rewrite; current parity is not proven.

## 18. LLM output/report workflow and mixed-startup compatibility

Branches:

- `repair/ozon-llm-output-report-workflow-2026-09-11`;
- `repair/ozon-mixed-help-api-startup-prompt-2026-09-10`.

Why: report output, guidance and startup text interact with capture/parser boundaries; a wording or marker change can accidentally be interpreted as executable protocol.

Accepted chain includes corrected executable reruns, final pre-handoff gate, and compatibility wording fixes.

WB relevance: WB built a different HELP/batch protocol and did not preserve the mature Ozon V2 guidance/marker contract.

## 19. IndexedDB transaction durability

Branch: `repair/ozon-indexeddb-transaction-durability-2026-09-11`.

Why: a successful individual request callback is not equivalent to transaction durability; data must only be considered stored after transaction completion.

Accepted chain includes a secondary dependency sweep, pre-handoff finalizer, CI and final documentation.

WB relevance: `artifact_store.js` correctly resolves writes on `tx.oncomplete`, so an important primitive was ported. Full artifact-delivery transaction parity is nevertheless not established because owner/send/reconciliation layers differ.

## 20. Alice large-result delivery

Branch: `repair/ozon-alice-large-result-document-delivery-2026-09-10`.

Why: oversized Alice results must remain complete and must not be truncated or silently downgraded.

Accepted fix: deliver oversized Alice results as complete TXT, followed by scoped attachment hardening and final pre-handoff gate.

WB relevance: WB has large-result→TXT behavior and local synthetic tests, but did not inherit the same exact live-proven chain.

## 21. Alice drag/drop / blocked input / auto-send

Branches:

- `repair/ozon-alice-drag-drop-transport-2026-09-11`;
- `repair/ozon-alice-auto-send-2026-09-11`.

Why: Alice's first-party UI can have an attachment present while the send/input control is blocked or transitions through states where a click is a no-op.

Accepted behavior:

- extract first-party DOM/control contract;
- do not treat no-op click as success;
- wait out blocked send state within bounded policy;
- exactly one send after it becomes valid;
- timeout locally without duplicate send/provider request.

WB relevance: WB has a copied/generalized send helper and synthetic blocked-send tests. Real parity with the late Alice repair contract was not established before handoff.

## 22. Alice SPA attachment owner

Branch: `repair/ozon-alice-spa-attachment-owner-2026-09-11`.

Why: SPA navigation can leave stale DOM/file surfaces connected to the page but owned by the wrong conversation/generation.

Accepted behavior: attachment ownership is revalidated against the current SPA conversation and exact package-root gates before delivery/confirmation.

WB relevance: WB 0.2.1 added several good composer/conversation revalidation fixes in its final 0.2.1 repair, but it did not prove equivalence to the full Ozon SPA owner transaction.

## 23. Alice provider-file runtime capability

Branch: `repair/ozon-alice-provider-file-runtime-capability-2026-09-11`.

Why: a provider file being available is not enough; the target AI/runtime must be capable of delivering that exact file type and lifecycle.

Accepted chain repeatedly cleaned verifier/finalizer boundaries, used exact-package gates, then froze pre-handoff evidence.

WB relevance: WB has `ai_delivery_capabilities.js` and file-type checks, but the mature live provider-file capability chain was not reproduced.

## 24. Global idle plaque / Work restart / HELP marker final repairs

Branches:

- `repair/ozon-global-toast-work-restart-2026-09-11`;
- `repair/ozon-help-v2-autorun-marker-2026-09-12`;
- `repair/ozon-autorun-help-v2-marker-2026-09-12`.

Why: late UI/marker state can be wrong even when internal state is correct. Ozon explicitly repaired idle-vs-active visibility and then reran a full final gate.

WB relevance: installed WB UI-06A reproduced exactly this class of defect: internal Work state `active_visible` while stale red `WORK_NOT_ACTIVE` remained visible. This should have been prevented by using the mature Ozon final UI/state contract as the oracle.

## 25. What the re-audit changes

The old rule "transfer the provider-neutral idea, then test the new implementation" is insufficient. New parity rule:

> For every provider-neutral Ozon subsystem, first recover its last accepted behavioral contract from the full patch/validation chain; then either port that contract faithfully or document an explicit WB-specific deviation. A self-consistent replacement is not parity merely because its own tests pass.

The complete WB gap list and superseding patch requirements are recorded separately. WB post-install testing remains paused until this parity re-audit is complete and the corrective parity patch is built.