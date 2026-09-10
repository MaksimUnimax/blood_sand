# Ozon bootstrap prompt editable-new-chat repair — FINAL PRE-HANDOFF

## Exact identity

- repair branch: `repair/ozon-bootstrap-prompt-editable-new-chat-2026-09-10`
- base authority: `da762fec61f55793406dae96d9f8aaae757425f4`
- exact cross-platform tested executable source commit: `b33c91b8d8f83221f63bace3e68b237861ee690c`
- exact tested source tree: `d908cb9332c24093ed3713438ce5239fda280f3c`
- runtime version: `0.1.19`
- artifact: `OZON_BRIDGE_v0.1.19_BOOTSTRAP_PROMPT_EDITABLE_NEW_CHAT_20260910.zip`
- artifact bytes: `248034`
- artifact SHA-256: `654ccae84d714f7c28988fe5697898dcad312b9de0831ea67df6a1b50138c3ba`
- certification workflow run: `34470536925`
- historical pending-start guard: `BASELINE_STALE_SAME_RESULT`; current replacement guard: `PASS_BASE_AND_CANDIDATE`
- historical refresh guard: `BASELINE_STALE_SAME_RESULT`

Built-in startup-prompt wording was deliberately **not changed** by this patch.

## Mandatory GATE-01..35

| Gate | Status | Evidence |
|---|---|---|
| GATE-01 | PASS | direct operator authorization: `Делай патч, следуй правилам` |
| GATE-02 | PASS | failing evidence and root-cause set frozen before production materialization |
| GATE-03 | PASS | scope limited to bootstrap/start-prompt editability before stable conversation identity; exactly four production files |
| GATE-04 | PASS | no hidden branch/ref/config/manifest/provider mutation |
| GATE-05 | PASS | exact operator-observed new-chat/no-ID workflow reconstructed |
| GATE-06 | PASS | secondary sweep covered popup save/reset, storage, pending-start, existing-chat and Autorun prompt consumers |
| GATE-07 | PASS | producer/consumer inventory persisted in `DEPENDENCY_CLOSURE_2026-09-10.md` |
| GATE-08 | PASS | global/per-conversation storage lifetimes, readers, writers and crossings traced to observable behavior |
| GATE-09 | PASS | existing real-identity/per-conversation isolation preserved; missing global bootstrap-template layer added |
| GATE-10 | PASS | no provider/account blocker reclassified or repaired in bridge code |
| GATE-11 | PASS | global prompt deliberately durable in existing local storage; per-conversation custom overrides remain durable |
| GATE-12 | PASS | current work-session model plus current pending-start/show-hide visibility guards passed on exact base/candidate; MV3 worker bootstrap passed |
| GATE-13 | PASS | proof is not same-instance-only: storage VM semantics, lifecycle regressions, Chrome MV3 and cross-platform exact-source checks used |
| GATE-14 | PASS | no fabricated live IDs/refs used; deterministic prompt test keys are explicit synthetic unit-test fixtures only |
| GATE-15 | PASS | no fake conversation key introduced; per-conversation controls still fail closed before stable identity |
| GATE-16 | PASS | production JS, package extraction and real Chrome MV3 service-worker bootstrap checked |
| GATE-17 | PASS | manifest and service-worker entry unchanged; no runtime network destination introduced |
| GATE-18 | PASS | exact tested artifact recorded: SHA-256 `654ccae84d714f7c28988fe5697898dcad312b9de0831ea67df6a1b50138c3ba`, `248034` bytes |
| GATE-19 | PASS | artifact built after executable materialization and retested from fresh extraction; no later executable change |
| GATE-20 | PASS | request-building/exact-request path unchanged; prior command-envelope authority regression passed |
| GATE-21 | PASS | logical/physical request-accounting path unchanged; intersecting accounting regressions passed |
| GATE-22 | PASS | no provider request/retry path changed; prior hidden-request guards remain green |
| GATE-23 | PASS | negative pre-fix control plus positive candidate inheritance/override/reset/migration controls passed |
| GATE-24 | PASS | entitlement/provider-classification code unchanged |
| GATE-25 | PASS | personal-data policy code unchanged |
| GATE-26 | PASS | privacy/provenance path unchanged |
| GATE-27 | PASS | redaction path unchanged; no new result/data exposure introduced |
| GATE-28 | PASS | credential/URL/base64 output paths unchanged; no new transport handling introduced |
| GATE-29 | PASS | no external URL/host handling added; packaged manifest unchanged |
| GATE-30 | PASS | target regression failed on pre-fix specifically at `GLOBAL_BOOTSTRAP_PROMPT_STORAGE_KEY_MISSING` and passed final candidate |
| GATE-31 | PASS | current lifecycle guards passed; historical pending-start guard classified `BASELINE_STALE_SAME_RESULT` and historical refresh guard `BASELINE_STALE_SAME_RESULT` by exact base-vs-candidate execution, with no stale assertion promoted to current PASS |
| GATE-32 | PASS | complete available new-chat configuration path tested from popup/storage source through effective resolver and exact extracted artifact |
| GATE-33 | PASS | no stale/fabricated live dependency used to make acceptance pass |
| GATE-34 | PASS | repair tests perform zero Ozon business mutations; prompt configuration path performs no provider request |
| GATE-35 | PASS | final executable artifact passed Linux, Windows, fresh-extract and Chrome MV3 checks with changed-dependency closure complete |

## Post-install LIVE-GATE

| Gate | Status | Required evidence |
|---|---|---|
| LIVE-GATE-01 | PENDING POST-INSTALL | Brand-new supported ChatGPT/Alice chat with no stable conversation ID: edit the global prompt before any message, save, press Start, and observe that exact configured text sent once. |
| LIVE-GATE-02 | PENDING POST-INSTALL | Repeat through a real MV3 lifecycle boundary; verify durable global prompt plus correct pending-start binding. |
| LIVE-GATE-03 | PENDING POST-INSTALL | Validate UI state, effective prompt source, one submission, stable binding and zero Ozon provider business requests. |
| LIVE-GATE-04 | PENDING POST-INSTALL | Verify an existing custom per-conversation override survives global changes; local reset returns that conversation to global inheritance. |
| LIVE-GATE-05 | PENDING POST-INSTALL | CI/package PASS is not LIVE PASS; installed live evidence is still required. |

**PRE-HANDOFF VERDICT: PASS**

**LIVE CERTIFICATION: PENDING**
