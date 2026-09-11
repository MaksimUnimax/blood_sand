# Phase 1, block004 — ordered protocol and local guidance

Date: 2026-09-11. Authorization: operator «Продолжай так же сохраняя промежуточный прогресс»; earlier explicit patch authorization remains in scope.

## Exact baseline verified

Remote HEAD: 6163ec8a6c5eaa04828ff358ab7d70e12f4472cc.
WB 0.1.3 ZIP: b6628d00fba1b98f1a0dfe37f0d658b6cd00842b071e4bc927a2ae58f2859ceb, 86048 bytes, 17 production files.
Work/test archive: ef835c9078555d2f50b36784bc168e892672bb59c1a63c0f544c65fa0212cb74.
All source and test archives actually extracted in this run. Do not restart recovery or rely on the lost earlier 55-PASS claims.

## Bounded implementation sequence

1. block004: shared ordered API/HELP envelope scanner and registry-derived local HELP; deterministic parser/guidance tests; publish actual module and tests before further work.
2. block005: wire same plan into Manual and Autorun; sequential explicit batch; durable per-item progress, cancellation and no-replay recovery; real worker-handler tests; publish.
3. block006: completed-assistant-message capture for Autorun, selected-block capture for Manual, full regression on exact next WIP ZIP, reproducible packaging, source/diff/test/evidence/cursor checkpoint.

These are checkpoints inside the already authorized Phase 1 package, not a new roadmap and not claims that all A01–A53 are complete.

Target feature subset: A03–A11, A20, A51; relevant A07/A08/A52/A53 paths. Other features are not silently marked implemented. Primary test mapping: TA-001..TA-017, TA-019/021/024 regressions, TA-029/030/034. Full TA acceptance remains separate.

## Preserved boundaries

No real WB calls, no credentials, no new WB endpoints or entitlement/rate values. Existing 188/172/16 registry and provider request serialization remain unchanged. No Ozon production changes or reference rewrites. No force push.

One source may contain multiple envelopes. Malformed/unsafe envelope structure fails the whole admission before network. Disabled/unknown operations are explicit local outcomes, never network calls. HELP reads only the packaged registry, not account capabilities. Known independent commands run sequentially; unresolved dependencies are not interpolated. Stop on a real provider failure; cancel not-started items and report them rather than replaying. Pause/Finish and identity changes stop the remaining items at the next safe boundary. A restart cannot replay a dispatched/uncertain request.

## Dependency inventory to close

Source marker -> balanced JSON -> strict validation -> plan/fingerprint -> Manual/Autorun admission -> durable owner -> ordered item dispatch -> existing contract/provider/transport -> per-item result/accounting -> durable batch record -> report/prefix -> same-conversation delivery -> recovery/duplicate handling. Check package imports, startup guidance, result matching, error paths and all old single-command regressions.

Donor: uploaded Ozon ZIP a5765f11148b921baeff5e18b64b428c9d598f9fbb41b8ff91fd9cef7cb8fb83, shared/ozon_contract.js balanced JSON scanner and shared/ozon_guidance.js registry-driven guidance pattern. Ozon-specific registry is not copied. Ozon command-envelope document at 236ba01fff7fb6af1202a8b9d969b6699a869436 still forbids HELP mixing in section 6; the explicitly approved WB migration A06/A51 requires mixed support, so this is an intentional WB adaptation, not a claim of byte-identical donor behavior.

Browser sources checked: https://developer.chrome.com/docs/extensions/develop/concepts/messaging and https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/lifecycle . Keep synchronous listener + return true; durable progress in extension storage, not worker globals. Separate mock/package proof from installed-browser/live-account proof.

Every following checkpoint must contain executable implementation/tests and result logs, not only prose. All assertions flush to disk. Current status: PLAN_FROZEN; IMPLEMENTATION/TESTS_NOT_YET_RUN_FOR_THIS_BLOCK.
