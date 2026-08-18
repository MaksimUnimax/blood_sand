# Ozon live-repair — FINAL pre-freeze completion same-gate rerun correction

Date: 2026-08-18
Status: SAME FINAL PREFREEZE GATE rerun only. This is not a new V3 stage, not V3G/V3H, not a production repair, not independent acceptance, not live testing, and not release promotion.

## Authority

Repository: `MaksimUnimax/blood_sand`

Exact frozen Step-4 base:
`4ce190c8bbdc438dcdf407abbe4dbecd846736df`

Exact V3 production candidate:
`88a20984c55da1f813ca1184bd90089823f51883`

Expected repaired production SHA-256:
- service worker: `34a84f66284f5aa5f77b9b7cda23d5ddb2431c7b30114cd5fe927798c31e957a`
- content script: `d95d2ca040c37f688d33c2caac8a78d95389b8e7acd41fcf11f8e0b4dc59e001`

Original consolidated runner Git blob:
`bdf242f5cb78e506e67adb7b4d06fd0f585824f3`

Current same-gate rerun wrapper Git blob:
`25fc65b021b1b74f37b995d9609b1ecd5c2bc612`

Source harness blobs remain:
- worker `0da73bdd1bb1608074781bb0c594c7875a4fe3ce`
- browser `841429741d5ff9144a8a40506e657dc4392fe37c`
- regression `57574ef6fdb96a5ed5e0b0a02eec5b5ba99e9be5`

## Previous same-gate evidence

Previous rerun report commit:
`d9bc94e80f44e90fdda70c01f241f19d89c1cd3b`

It proved:
- worker actual-path terminal PASS with every required quota/no-retry marker;
- regression terminal PASS;
- production hashes PASS;
- real Ozon/Performance requests both zero;
- browser assertions still unexecuted.

The only browser failure was test environment code calling `ServiceWorker.enable` through a target-level CDP session where that command is unavailable. This is an `ENVIRONMENT_ERROR`, not a production assertion failure.

Production must not change because of this failure.

## Current exact test-only correction

The same wrapper file is corrected in place. It still verifies the original consolidated runner blob and changes only the temporary browser harness.

After `browser.installExtension(candidateDir)` it must:

1. arm `browser.waitForTarget()` for the exact `chrome-extension://<extensionId>/` MV3 service worker BEFORE trying to wake it;
2. create a temporary Puppeteer page;
3. navigate that page to `chrome-extension://<extensionId>/popup.html`;
4. from that extension-page context call `chrome.runtime.sendMessage({type:'__OZ_PREFREEZE_WAKE__'})`, ignoring the logical response/error because the purpose is only to deliver a native extension runtime event that wakes the MV3 service worker;
5. wait up to 20 seconds for the armed service-worker target promise;
6. close the temporary wake page;
7. if target discovery still fails, print the wake-page error and all current Puppeteer target type+URL values before failing.

Do NOT call `ServiceWorker.enable` or `ServiceWorker.startWorker`.

No production bytes may change. No source harness bytes may be edited directly. Temporary transformed harness files only.

## Required execution

Materialize each Git object separately and verify each with a separate `git hash-object`:

- original consolidated runner `bdf242f5cb78e506e67adb7b4d06fd0f585824f3`
- current rerun wrapper `25fc65b021b1b74f37b995d9609b1ecd5c2bc612`
- worker source `0da73bdd1bb1608074781bb0c594c7875a4fe3ce`
- browser source `841429741d5ff9144a8a40506e657dc4392fe37c`
- regression source `57574ef6fdb96a5ed5e0b0a02eec5b5ba99e9be5`

Run `node --check` on the wrapper and original consolidated runner.

Execute the same final gate command:

`node FINAL_PREFREEZE_COMPLETION_RERUN_WRAPPER.mjs FINAL_PREFREEZE_COMPLETION_RUNNER.mjs worker-source.mjs browser-source.mjs regression-source.mjs <STEP4_EXACT_DIR> <V3_EXACT_DIR> <CFT_EXE> D:\codex\Test\qa-harness\puppeteer-extension-qa`

Existing environment only:
- Node `v24.12.0`
- Puppeteer `25.4.0`
- CFT `151.0.7922.47`

Do not install or update anything.

## Mandatory results

Worker must again PASS all prior markers:
- manual public quota wait;
- autorun public quota wait;
- privacy;
- incompatible miss guarded wait;
- due exactly one mocked provider call;
- mocked 429 exactly one mocked provider call;
- zero immediate retry;
- zero alarm replay;
- zero startup replay;
- Retry-After extension only;
- worker terminal PASS.

Regression must again terminate PASS.

Browser must freshly execute and prove:
- service-worker target obtained after native runtime-message wake;
- visible `Ожидание лимита Ozon` plate;
- three decreasing countdown seconds;
- absolute `Следующая попытка: HH:MM:SS`;
- due sending state;
- restart restore;
- duplicate Ozon click blocked while busy;
- two-owner isolation;
- ChatGPT binding;
- Alice binding;
- native Copy independent;
- no cross-owner regression;
- zero provider network;
- operator browser actions `0`;
- browser terminal PASS.

## Safety

- no V4;
- no new V3 stage;
- no production changes;
- no V3 patch changes;
- no dependency/browser installs or updates;
- no normal operator Chrome profile;
- no real Seller or Performance credentials;
- `REAL_OZON_REQUESTS = 0`;
- `REAL_PERFORMANCE_REQUESTS = 0`.

## Classification

If the native wake fails before browser behavior assertions, classify `ENVIRONMENT_ERROR` and preserve the exact wake-page error, target list, stdout and stderr.

If actual browser behavior assertions execute and one fails, classify `PRODUCTION_BEHAVIOR_FAILURE` with the exact assertion and state evidence.

Full worker PASS + regression PASS + browser PASS => `FINAL_PREFREEZE_PASS`.

## Report discipline

Reuse the EXISTING report branch:

`engineering/ozon-live-repair-final-prefreeze-completion-rerun-2026-08-18`

Do not create another branch or another stage.

Update the existing report file in that branch:

`tooling/llm-api-bridges/ozon-seller/development/live-repair-quota-countdown/FINAL_PREFREEZE_COMPLETION_RERUN_REPORT_2026-08-18.md`

The branch must remain report-only relative to exact candidate `88a20984c55da1f813ca1184bd90089823f51883`; no production or harness files may be committed on the report branch.

After publishing the updated report, STOP.

Return exactly:

`FINAL_OZON_LIVE_REPAIR_PREFREEZE_RERUN_RESULT`
