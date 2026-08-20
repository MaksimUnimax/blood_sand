# Ozon Bridge — current handoff / continuation state

Date: 2026-08-20
Status: Step 0 through Step 4, V3 quota/countdown repair, and Manual delivery composer-wait repair are accepted. Controlled logged-in/live acceptance is the next active milestone.

## Repository identity

Repository:

`MaksimUnimax/blood_sand`

Current development branch:

`dev/ozon-v0.1.19-manual-delivery-composer-wait-2026-08-18`

Active working-method authority:

`OZON_BRIDGE_DEVELOPMENT_WORKFLOW_2026-08-17.md`

Always fetch live refs before continuing. Validation evidence must remain tied to the exact candidate it exercised. Later documentation-only commits do not invalidate unchanged production bytes.

## Closed accepted milestones

### Step 0 — QA harness — ACCEPTED

Accepted launcher evidence commit:

`a5539c8663bb6b48dce197f59e0abfe2d388af93`

Accepted Windows route:

`D:\codex\Test\qa-harness\puppeteer-extension-qa\launch-cft.mjs`

with Node 24.12.0, Puppeteer 25.4.0, CFT 151.0.7922.47, dynamic DevTools endpoint, runtime `browser.installExtension()`, working page targets and MV3 extension behavior.

### Step 1 — Contract + Capability — ACCEPTED

Accepted production logic SHA:

`370e45a1803976f43d27d5a9d4b5613e09a91623`

Accepted reconstruction-v2 target:

`298a4d618c69e8ffd33735ff96a153d42d160143`

Accepted report commit:

`249669986d61c5df708dd5b635fe30662120336f`

Verdict:

`STEP1_ACCEPTED_FOR_STEP2`

### Step 2 — Query planner + safe coalescing — ACCEPTED

Frozen implementation target:

`93c1eae13f518d92d53bbf1af4793b35d26bc5d3`

Independent report ref:

`be7be62`

Acceptance decision:

`51a0b16c51a60b2dc8e656b7fd41eb6d60c446ad`

Verdict:

`STEP2_ACCEPTED_FOR_STEP3`

### Step 3 — Global analytics quota + verifier + safe errors — ACCEPTED

Frozen target:

`eae8988f5baf8c7ead5a82371c9b1057295c906d`

Independent report ref:

`21b004b`

Acceptance decision:

`6a644e57ee36ac4aa48c0a93464438c6595adc0e`

Verdict:

`STEP3_ACCEPTED_FOR_STEP4`

Do not reopen Step 3 merely because later delivery-layer work occurred.

### Step 4 — Cache/prefetch + semantic acquisition + integrated acceptance — ACCEPTED

Independently validated target:

`4ce190c8bbdc438dcdf407abbe4dbecd846736df`

Step 4 is closed.

## V3 quota/countdown live repair — ACCEPTED

Frozen target:

`66bc4ac712b345d499b10982e7f5124279265b88`

Exact V3 candidate:

`88a20984c55da1f813ca1184bd90089823f51883`

Verdict:

`INDEPENDENT_ACCEPTANCE_PASS`

Independent browser validation proved visible countdown/quota state, decreasing seconds, absolute due clock, duplicate-click protection, restart restore, sending transition, owner isolation, ChatGPT/Alice binding isolation, native Copy independence, and zero real provider requests in synthetic QA.

A later controlled logged-in run proved the actual quota scheduler resumed: the second Seller analytics request started automatically and completed HTTP 200.

## Manual delivery composer-wait repair — ACCEPTED

### Exact accepted target

`14829f418068e40d76c5d992ff9158c4faebbbd0`

### Starting artifact

`artifacts/OZON_BRIDGE_v0.1.19_TESTED_FROZEN_REPAIR_66bc4ac.zip`

ZIP SHA-256:

`d794e9fe8550dcf20d76d63abf7832d9b28853ad6d7c8e94faa22a3c08a46a2c`

Composer-wait patch:

- bytes: `13648`
- SHA-256: `bd0119212a21c63fbbc2a6d0067c0c19abcf31896007e8f8d3e19efa8255019d`

Expected repaired production hashes:

- `service_worker.js`: `dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac`
- `content_script.js`: `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`

Validation branch:

`validation/ozon-manual-delivery-composer-wait-2026-08-20`

Final accepted report commit:

`3c779f20520a8c2e1dca4a7af5cb65b031d85324`

Report path:

`tooling/llm-api-bridges/ozon-seller/validation/reports/OZON_MANUAL_DELIVERY_COMPOSER_WAIT_VALIDATION_2026-08-20.md`

Verdict:

`COMPOSER_WAIT_STAGE_ACCEPTED`

The validation branch is report-only relative to the exact target; production modifications during validation were zero.

### Accepted behavior

Cumulative exact-target evidence proves:

- unrelated operator text in an occupied ChatGPT composer is preserved;
- exact persistent plate is `Очистите поле ввода, чтобы получить отчёт.`;
- report remains worker-owned and recoverable while composer is occupied or temporarily absent;
- no insert occurs until the correct composer is available and empty;
- clear correct composer -> exactly one insertion/send;
- worker insert-commit authority is respected;
- page/content-runtime reload restores pending wait without provider replay or duplicate insertion;
- Manual OFF cancels only the current pre-insert claimed Manual delivery;
- quota, `next_allowed_at`, result cache, another Manual owner and unrelated Autorun state are preserved;
- OFF -> ON restores ready state without resurrecting the cancelled report;
- stale insert after OFF is rejected with `MANUAL_MODE_DISABLED`;
- `insert_committed` and `inserted` deliveries are not incorrectly cancelled;
- wrong-owner/two-owner browser isolation passes;
- native Copy remains independent;
- synthetic validation counters remained `REAL_OZON_REQUESTS=0`, `REAL_PERFORMANCE_REQUESTS=0`, `OPERATOR_BROWSER_ACTIONS=0`, `production_modifications=0`.

## Where the controlled live sequence actually stopped

The previous logged-in/live run was not blocked by provider scheduling anymore.

Observed sequence:

1. quota wait elapsed;
2. second Seller analytics provider request automatically started;
3. provider request completed HTTP 200;
4. report delivery then encountered unrelated text already present in the ChatGPT composer;
5. old delivery preserved the report but returned `COMPOSER_CONTAINS_OTHER_TEXT` instead of maintaining a durable composer-clear wait.

The accepted composer-wait repair addresses exactly step 5. Therefore do not restart Step 1 through Step 4 and do not discard the already-observed provider HTTP 200 evidence.

## Immediate next action

1. reconstruct/build the exact installable v0.1.19 candidate containing the accepted repaired `service_worker.js` and `content_script.js` bytes;
2. verify production inventory and hashes before operator installation;
3. run controlled logged-in/live acceptance from the previously reached provider-success point;
4. prove the repaired downstream delivery sequence on the real profile: occupied composer -> durable wait plate -> operator clears composer -> report inserts/sends once;
5. complete remaining real-profile/login/provider acceptance checks that synthetic QA cannot prove;
6. only then finalize release/package evidence.

Do not create a new synthetic umbrella gate. Use the active incremental workflow.

## Codex validation preparation rules

Before any later Codex milestone prompt:

- find and verify the already-working PASS route, exact commands, launcher/harness, dependencies and previous evidence before writing the prompt;
- do not make Codex redesign proven infrastructure;
- after `BLOCKED/HARNESS_ERROR`, diagnose the exact blocker and find the known working route before issuing a rerun;
- pre-authorize foreseeable validation-owned cleanup narrowly, including only the owned CFT root process tree and descendants when cleanup is required;
- never kill by common executable path;
- temporary validation harness/fixture repair is allowed; production repair is not silently allowed during independent validation;
- preserve exact-target PASS evidence and rerun only still-missing evidence when safe;
- a later harness timeout must not erase earlier independent PASS assertions already reached in the same exact-target run.

Full authority is in:

`OZON_BRIDGE_DEVELOPMENT_WORKFLOW_2026-08-17.md`

## Standing protected invariants

- Native Copy structurally anchors the exact code block/conversation surface.
- Ozon button exists independent of command contents; parser alone decides API validity.
- No block identity from command text/fingerprint.
- One extension-owned top-level Shadow DOM overlay.
- Multi-tab/conversation ownership remains independent; no global current conversation.
- ChatGPT and Alice ownership/lifecycle remain isolated.
- AI cannot inject arbitrary provider URL/host/method/headers/auth/credentials.
- Credentials stay isolated from page/content output.
- Read-only provider surface and PII protections remain in force.
- No hidden provider retry/pagination/fan-out/report polling.
- Provider quota/cache state is not reset by unrelated UI/delivery cleanup.
- Delivery recovery does not replay provider work.
- Persistent `Начало диктовки` is not delivery completion.

## Current state

`STEP0 = ACCEPTED`

`STEP1 = ACCEPTED`

`STEP2 = ACCEPTED`

`STEP3 = ACCEPTED`

`STEP4 = ACCEPTED`

`V3_QUOTA_COUNTDOWN = INDEPENDENT_ACCEPTANCE_PASS`

`COMPOSER_WAIT = COMPOSER_WAIT_STAGE_ACCEPTED`

`CONTROLLED_LIVE_ACCEPTANCE = NEXT`
