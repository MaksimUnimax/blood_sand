# Ozon Bridge — current engineering roadmap

Date: 2026-08-20
Status: active roadmap; Step 0 through Step 4, V3 quota/countdown repair, and Manual delivery composer-wait repair are independently accepted. Controlled logged-in/live acceptance is the current next milestone.

## Target architecture

`marketplace adapters -> common bridge protocol -> AI adapters`

Current AI adapters are ChatGPT and Alice. Tabs/conversations/models remain independent; there is no global current conversation.

Provider pipeline:

`clicked code-block batch -> parse whole batch -> strict operation validation -> resolve Seller capability once if needed -> entitlement-plan logical commands -> query planner/optimizer -> safe coalescer -> cache/prefetch -> provider quota scheduler -> Ozon -> response verifier -> safe error normalizer -> logical result projector -> existing batch/delivery engine`

Logical commands are data requirements. Physical provider requests are transport actions. Optimization/scheduling must preserve query semantics, logical identity, provenance and delivery ownership.

## Milestone status

### Step 0 — Windows/Puppeteer QA harness — ACCEPTED

Accepted launcher evidence commit:

`a5539c8663bb6b48dce197f59e0abfe2d388af93`

Accepted route:

`Node child_process.spawn -> CFT 151.0.7922.47 -> --remote-debugging-port=0 -> DevToolsActivePort -> Puppeteer 25.4.0 connect -> browser.installExtension() -> assertions`

The accepted launcher remains:

`D:\codex\Test\qa-harness\puppeteer-extension-qa\launch-cft.mjs`

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

### Step 3 — Global analytics quota scheduler + response verifier + safe errors — ACCEPTED

Frozen implementation target:

`eae8988f5baf8c7ead5a82371c9b1057295c906d`

Independent report ref:

`21b004b`

Acceptance decision:

`6a644e57ee36ac4aa48c0a93464438c6595adc0e`

Verdict:

`STEP3_ACCEPTED_FOR_STEP4`

Accepted behavior includes the account-scoped `seller.analytics_data.v1` quota family, persistent `next_allowed_at`, MV3 alarm/startup recovery, no automatic provider retry, analytics response-cardinality verification, safe error normalization, and preservation of Step-1/Step-2 security and planner invariants.

### Step 4 — Cache/prefetch + semantic acquisition + integrated acceptance — ACCEPTED

Independently validated target:

`4ce190c8bbdc438dcdf407abbe4dbecd846736df`

Step 4 is closed. Do not restart Step 1 through Step 4 merely because later delivery-layer repair work occurred.

### V3 live-repair quota/countdown — INDEPENDENTLY ACCEPTED

Frozen target:

`66bc4ac712b345d499b10982e7f5124279265b88`

Exact V3 candidate:

`88a20984c55da1f813ca1184bd90089823f51883`

Latest independent acceptance verdict:

`INDEPENDENT_ACCEPTANCE_PASS`

Accepted browser evidence includes visible quota/countdown state, decreasing seconds, absolute due clock, duplicate-click blocking, restart restoration, due/sending transition, owner isolation, ChatGPT/Alice binding isolation, native Copy independence, and zero real provider requests in synthetic QA.

A later controlled logged-in run then proved the quota scheduler resumed correctly: the second Seller analytics provider request started automatically and completed HTTP 200.

### Manual delivery composer-wait repair — INDEPENDENTLY ACCEPTED

Exact production target under validation:

`14829f418068e40d76c5d992ff9158c4faebbbd0`

Frozen starting ZIP:

`artifacts/OZON_BRIDGE_v0.1.19_TESTED_FROZEN_REPAIR_66bc4ac.zip`

ZIP SHA-256:

`d794e9fe8550dcf20d76d63abf7832d9b28853ad6d7c8e94faa22a3c08a46a2c`

Composer-wait patch SHA-256:

`bd0119212a21c63fbbc2a6d0067c0c19abcf31896007e8f8d3e19efa8255019d`

Expected repaired production hashes:

- `service_worker.js` — `dfc101f6d1840af89b7dc48b6082f43b26c8143ed96086bc19ab0dfd36c21fac`
- `content_script.js` — `ab3408a2637153fa324f0b679ac5452b9b7ae0182f5ccf4f0397ccd960857dda`

Validation branch:

`validation/ozon-manual-delivery-composer-wait-2026-08-20`

Accepted report commit:

`3c779f20520a8c2e1dca4a7af5cb65b031d85324`

Report:

`validation/reports/OZON_MANUAL_DELIVERY_COMPOSER_WAIT_VALIDATION_2026-08-20.md`

Verdict:

`COMPOSER_WAIT_STAGE_ACCEPTED`

Accepted cumulative exact-target evidence proves:

- occupied composer preserves unrelated operator text;
- exact persistent wait plate: `Очистите поле ввода, чтобы получить отчёт.`;
- no insertion while occupied;
- clearing the correct composer inserts/sends exactly once;
- missing composer remains recoverable;
- content-runtime reload restores worker-owned pending wait without provider replay or duplicate insertion;
- Manual OFF cancels only the pending pre-insert Manual delivery, preserves quota/cache/other owners, blocks stale insert with `MANUAL_MODE_DISABLED`, and OFF -> ON does not resurrect the cancelled report;
- insert-committed/inserted deliveries are not incorrectly cancelled;
- wrong-owner/two-owner browser isolation passes;
- native Copy remains independent;
- `REAL_OZON_REQUESTS = 0`, `REAL_PERFORMANCE_REQUESTS = 0`, `OPERATOR_BROWSER_ACTIONS = 0`, `production_modifications = 0` during independent validation.

## Why the composer-wait repair existed

The controlled logged-in run had already reached a successful Seller provider response (HTTP 200). The failure occurred afterwards in report delivery because the ChatGPT composer contained unrelated operator text. The old delivery path returned `COMPOSER_CONTAINS_OTHER_TEXT` and preserved the report but did not maintain a durable composer-clear wait.

The independently accepted composer-wait repair closes that delivery-layer defect. It does not invalidate or reopen the already accepted provider/planner/quota/cache milestones.

## Current next milestone — controlled logged-in/live acceptance

Do not rerun the historical synthetic roadmap from Step 1.

Next engineering/release sequence:

1. reconstruct/build the exact installable v0.1.19 candidate using the accepted composer-wait repair and verify package inventory/hashes;
2. install that exact candidate for the controlled operator/live run;
3. resume the live sequence from the point already reached after the real provider HTTP 200;
4. validate repaired report delivery when the composer is occupied, including durable wait and insertion after operator clear;
5. complete the remaining profile/login-dependent ChatGPT/Alice/live-provider checks that synthetic QA cannot prove;
6. only after that live acceptance, finalize release/package evidence.

The already observed provider HTTP 200 does not need to be erased from history or treated as unproven merely because the subsequent delivery layer was repaired. The live rerun should prove the repaired downstream sequence on the accepted candidate.

## Standing protected invariants

- native Copy structurally anchors the exact code block/conversation surface;
- Ozon button exists independent of command contents; parser alone decides API validity;
- no content fingerprint is block identity;
- one extension-owned top-level Shadow DOM overlay;
- no global current conversation;
- ChatGPT/Alice and tab/conversation ownership remain isolated;
- AI cannot inject arbitrary provider URL/host/method/headers/auth/credentials;
- credentials remain isolated from page/content output;
- read-only Ozon operation surface remains enforced unless a later reviewed feature explicitly changes it;
- no hidden provider retry/pagination/fan-out/report polling;
- provider quota/cache state is not reset by unrelated UI/delivery cleanup;
- delivery recovery does not replay provider work;
- persistent `Начало диктовки` is not delivery completion.

## Working-method authority

`OZON_BRIDGE_DEVELOPMENT_WORKFLOW_2026-08-17.md`

Development continues incrementally:

`development stage -> targeted engineering checks -> independent Codex validation of that stage -> fix/revalidate if needed -> next stage`

There is no retired one-shot final B01-B15/full-gate requirement.

## Current state

`STEP0 = ACCEPTED`

`STEP1 = ACCEPTED`

`STEP2 = ACCEPTED`

`STEP3 = ACCEPTED`

`STEP4 = ACCEPTED`

`V3_QUOTA_COUNTDOWN = INDEPENDENT_ACCEPTANCE_PASS`

`COMPOSER_WAIT = COMPOSER_WAIT_STAGE_ACCEPTED`

`CONTROLLED_LIVE_ACCEPTANCE = NEXT`
