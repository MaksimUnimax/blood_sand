# Wildberries Bridge — superseding provider-neutral parity patch authority

Date: 2026-09-12
Status: **NEXT PATCH AUTHORITY / DO NOT RUN WB PROVIDER CHARACTERIZATION YET**

This authority supersedes the parity semantics in `WB_OZON_PARITY_MIGRATION_AND_TEST_AUTHORITY_2026-09-11.md` wherever the old document conflicts with mature Ozon behavior or the 2026-09-12 re-audit. The old document is preserved as historical evidence.

Inputs:

- exact mature Ozon v0.1.19 operator-supplied archive;
- `OZON_BRANCH_INVENTORY_171_2026-09-12.md`;
- `OZON_PATCH_HISTORY_REAUDIT_2026-09-12.md`;
- `WB021_PARITY_GAPS_2026-09-12.md`;
- `A01_A53_RECONCILIATION_2026-09-12.md`;
- installed WB 0.2.1 evidence including UI-06A and corrected F-02.

## 1. Non-negotiable parity rule

For every provider-neutral subsystem:

1. recover the **last accepted mature Ozon behavior** from source + repair + validation chain;
2. port that behavior under WB names/provider boundaries;
3. do not invent a smaller replacement merely because it passes new self-authored tests;
4. if implementation architecture differs, prove behavioral equivalence with differential tests;
5. preserve failed/rolled-back evidence and never treat an intermediate `repair/*` branch as final authority by name alone.

No Ozon endpoint, alias, Ozon entitlement value, Ozon rate limit, Seller/Performance split or marketplace-specific business semantics may be copied into WB.

## 2. Hard execution boundaries for the corrective patch

- No new real Wildberries provider calls.
- No WB business mutations.
- Preserve the current WB operation registry/provider host/request serialization unless a parity fix requires only provider-neutral orchestration around it.
- Preserve 172 enabled / 16 disabled WB operations until later WB characterization.
- No hidden retry, pagination, polling or fan-out.
- Unknown provider outcome is never replayed automatically.
- All errors that belong to an explicit Bridge command attempt must be returned into the originating AI chat as a structured Bridge result; toast/status UI is supplemental only.
- Cross-chat/cross-generation delivery remains forbidden.
- Autorun is **NON_PROD** by explicit operator decision. Internal code may remain for regression/diagnostic value, but production popup/operator flow must not be designed around it.
- Do not start R1–R8 WB API characterization until this corrective patch passes installed provider-neutral acceptance.

## 3. Patch block P1 — popup and operator model parity

Rebuild WB popup against the mature Ozon popup's **functional structure**, adapted to Wildberries branding.

Required:

- Work Session is the single authority for page/manual WB button visibility/lifecycle.
- Remove the competing production `manualMode` switch.
- Work controls mirror mature Ozon semantics:
  - `Начать работу / Отправить начальный prompt`;
  - `Обновить`;
  - `Показать кнопку` / hide counterpart;
  - `Завершить работу`.
- Show coherent Work meta/state and clear stale errors after successful transitions.
- `active_visible` may never coexist with stale `WORK_NOT_ACTIVE`.
- Keep AI mode/binding presentation coherent with Ozon operator model.
- Personal Data control must explain its exact gate semantics.
- WB-provider-specific metadata/entitlement sections may show `unverified/deferred`; never fabricate live authority.
- Production UI must not make Autorun a primary path.
- The page-injected WB button must use Wildberries visual identity, not Ozon styling.

## 4. Patch block P2 — durable local/pre-execution error delivery

This is mandatory and directly fixes installed F-02.

Before provider dispatch, convert every safely representable command-level failure into a durable batch/result entry **before** returning control to content script.

Must cover at minimum:

- malformed JSON;
- invalid envelope/top-level field;
- unknown operation;
- disabled operation;
- unsupported/non-current operation;
- mixed HELP/API;
- Work Session not eligible;
- manual/page button off;
- competing execution channel;
- Personal Data OFF;
- entitlement/capability hold;
- date/schema/policy/planner failure;
- quota not currently eligible;
- any other pre-execution rejection with provider calls = 0.

Required result behavior:

- durable owner/batch exists;
- structured `WB_RESULT_V1` (or versioned WB guidance result where appropriate) is generated;
- `bridge_error=true` / `pre_execution_error=true` when applicable;
- `http_status=0` for local rejection;
- `external_request_executed=false`;
- `physical_request_count=0`;
- safe error code/message/stage;
- report is delivered back into the originating AI chat;
- toast may also appear but is never the only result;
- delivery recovery itself must never replay the provider.

## 5. Patch block P3 — HELP/guidance parity

Replace the old mixed-order invention with mature Ozon semantics under WB prefixes.

Required:

- retain registry-derived local discovery;
- introduce/port versioned guidance semantics (`WB_HELP_V1/V2` and versioned WB guidance result as appropriate);
- HELP/guidance performs zero WB calls;
- HELP and `WB_API_V1` mixed in one assistant response => one local structured `MIXED_HELP_AND_API` result, zero provider calls;
- invalid HELP attempts are themselves structured guidance/error results;
- command/help markers must not be accidentally re-captured from startup prompt/report text.

## 6. Patch block P4 — mature Work Session recovery protocol

Port mature Ozon Work recovery semantics rather than only the small shared state enum.

Required persisted recovery authority includes equivalent fields for:

- recovery ID;
- recovery revision;
- previous state;
- old runtime generation;
- new runtime generation;
- worker session ID;
- tab ID;
- origin;
- AI ID;
- conversation ID/key;
- provider/manual operation phase;
- whether delivery is already preserved/prepared;
- created/expiry time.

Required behavior:

- Refresh single-flight;
- command acceptance closed while recovering;
- page button hidden/disabled during recovery;
- exact conversation identity plus new-generation handshake before resume;
- old assistant output boundary preserved;
- in-flight provider request => `REQUEST_OUTCOME_UNKNOWN_NO_RETRY`;
- already prepared provider result/delivery => preserve it, do not refetch;
- pre-provider/quota-wait work may be cancelled without provider replay;
- Finish never starts Autorun/provider work;
- resume UI state is independent of provider request state;
- popup close/tab reload/MV3 sleep/restart recovery is deterministic.

## 7. Patch block P5 — mature attachment transaction parity

Preserve useful WB primitives already present:

- IndexedDB opaque refs;
- owner metadata;
- `WB_FILE_V1` named Port;
- bounded chunks;
- chunk/full SHA-256;
- File/DataTransfer attachment.

Add the missing mature transaction semantics equivalent to Ozon:

- explicit owner assertion at every worker/content boundary;
- attach claim/commit;
- attachment-ready acknowledgement;
- send commit;
- send rollback when click/send does not actually complete;
- delivery confirmation;
- reconciliation after uncertain committed UI outcome;
- `ATTACH_OUTCOME_UNKNOWN_NO_RETRY` equivalent;
- startup pending-delivery recovery;
- wake/reconnect without provider replay;
- artifact cleanup after terminal delivery;
- provider-success truth remains provider-success when artifact/UI delivery fails.

Architecture may use WB module names, but the state transitions/outcomes must be differentially equivalent to mature Ozon.

## 8. Patch block P6 — Multi-AI / Alice accepted-behavior parity

Reconcile WB against the final accepted Ozon chains for:

- ChatGPT and Alice conversation identity;
- composer ownership;
- SPA navigation ownership;
- attachment surface ownership;
- provider-file runtime capability;
- oversized complete TXT delivery;
- blocked send wait;
- no-op click detection;
- one successful send only;
- timeout without duplicate send/provider request;
- Alice XLSX live-capability path;
- current composer/context revalidation after every relevant await.

Do not assume synthetic DOM equivalence is enough. Offline tests come first, but installed current-AI acceptance is required after build.

## 9. Patch block P7 — bootstrap/new-chat exact lifecycle

Port mature accepted behavior:

- bootstrap prompt is editable/usable before a real conversation ID exists;
- do not prematurely bind an unknown/new-chat identity;
- wait for confirmed real identity;
- bind only after resolution;
- stale bootstrap/runtime callbacks cannot bind or send into another chat.

Integrate this into the rewritten popup/Work flow rather than a separate competing lifecycle.

## 10. Patch block P8 — quota/cache/planner/metadata framework reconciliation

Provider-specific WB values remain disabled until R1–R8, but provider-neutral orchestration must match mature Ozon where it is applicable.

Required:

- account-scoped quota state;
- family coordination framework;
- Retry-After persistence as eligibility only;
- quota wait state/result delivered to chat, no automatic replay;
- cache errors/malformed impossible;
- cache/coalescing/prefetch disabled without reviewed WB rules;
- trusted metadata/LKG framework can reject malformed fresh authority while preserving previous accepted authority;
- operator UI must label unavailable/unverified WB authority honestly.

## 11. Patch block P9 — report/file parsing classification

Separate three things explicitly:

1. generic bounded file/ZIP/XML/XLSX/CSV/PDF parsing utilities that can be provider-neutral;
2. provider-specific WB report endpoints/task lifecycle, deferred until R1–R8;
3. AI attachment delivery, provider-neutral and included in this corrective patch.

Do not claim Ozon report/document parity merely because generic binary transport exists.

## 12. Production-scope decision: Autorun

Operator decision: Autorun will not be a production feature.

Therefore:

- remove/de-emphasize Autorun from production popup and acceptance path;
- do not spend operator live-test time on Autorun-only UI;
- internal legacy code may remain temporarily if removing it would risk unrelated regressions;
- mature Ozon Autorun code remains useful as evidence for delivery/exactly-once patterns, not as a WB product requirement.

## 13. Differential QA — required before handoff

The next patch cannot be accepted by re-running the old self-referential TA matrix unchanged.

New mandatory tests must include:

### Error/result contract

- unknown alias => structured chat error, zero provider calls;
- disabled alias => structured chat error, zero provider calls;
- malformed envelope => structured chat error, zero provider calls;
- Personal Data OFF => structured chat error, zero provider calls;
- Work/manual gate failure => structured chat error, zero provider calls;
- mixed HELP/API => `MIXED_HELP_AND_API` structured result, zero provider calls;
- toast-only outcome is an explicit FAIL.

### Popup/Work

- no separate production manual-mode switch;
- Work is sole page-button owner;
- active state clears stale inactive/error plaque;
- popup close/reopen preserves Work state;
- Refresh recovery is single-flight and generation-bound;
- in-flight request during Refresh is terminalized unknown/no-retry;
- prepared delivery survives Refresh without provider replay;
- Finish creates zero new provider calls.

### File transaction

- owner mismatch rejected;
- chunk/full integrity;
- attach commit survives worker/content recreation;
- uncertain attach/send outcome is reconciled, not automatically repeated;
- send rollback works;
- confirmation terminalizes exactly once;
- startup resumes pending delivery;
- provider request count remains unchanged through every delivery recovery.

### Multi-AI

- ChatGPT/Alice separate current conversation identity;
- SPA switch invalidates stale owner;
- composer replacement during awaits aborts safely;
- Alice blocked-send waits then sends once;
- Alice timeout/no-op does not count as success;
- large TXT and XLSX delivery preserve full content.

### Regression

Preserve and rerun the correctly scoped old tests for:

- strict WB envelope;
- original 172 request serialization;
- no hidden retry;
- cross-chat isolation;
- artifact/IndexedDB transaction completion;
- XLSX implicit refs/namespaces;
- existing provider error handling.

## 14. Gate before R1–R8

Only after:

1. corrective patch built;
2. offline differential suite PASS;
3. exact final ZIP rebuilt and retested;
4. installed popup/Work/error/file/Multi-AI acceptance PASS;
5. all failures preserved;

may the project move to real read-only WB API characterization R1–R8.

Until then:

`WB_PROVIDER_CHARACTERIZATION = BLOCKED_BY_PROVIDER_NEUTRAL_PARITY_REWORK`.