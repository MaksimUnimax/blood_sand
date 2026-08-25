# Ozon Bridge — current engineering roadmap

Date: 2026-08-25
Status: active roadmap; Step 0 through Step 4, V3 quota/countdown repair, Manual delivery composer-wait repair, Patch A/A.5, and B0 Full Read Core are independently accepted. B1 Assortment Master is the current development line.

## Mandatory evidence-first / no-guessing rule

This rule applies to every current and future Ozon Bridge development stage, including research, implementation, debugging, validation and live testing.

**Never invent, infer from habit, or silently guess missing Ozon API facts.** This includes HTTP methods, paths/versions, request fields, required/optional status, enums, limits, pagination/cursors, response fields, identifiers, joins, quotas/rate behavior, access/subscription rules, deprecation/replacement status, side effects, provider behavior and metadata semantics.

Required evidence order:

1. use already accepted repository authority, exact materialized candidates, bundled last-known-good metadata/snapshots and previously captured Ozon-owned evidence first;
2. if the required fact is not present there, obtain current Ozon-owned documentation/metadata without substituting third-party descriptions as implementation authority;
3. when a safe read-only fact can be established through the installed bridge/Ozon API, use an exact minimally scoped real request; the assistant must provide the operator with the exact `OZON_API_V1` command needed to obtain the evidence;
4. when browser/network/operator evidence is required, give the operator exact extraction instructions describing what screen/request/response/header/body fragment to capture;
5. if evidence still cannot be obtained, record the fact as `UNKNOWN`, `NOT_DETERMINABLE`, or `NOT_EXECUTED_ENVIRONMENT_ONLY` as appropriate and stop implementation of the affected behavior until evidence exists.

Absence of evidence is not permission to complete a contract from model memory, common API patterns, third-party SDKs/mirrors, historical versions, or assumptions about Ozon behavior.

Real Ozon evidence requests must be narrowly scoped to the missing fact, read-only unless a separately reviewed feature explicitly requires otherwise, and must not be multiplied merely for convenience. Existing provider quota/timer/cache/history/no-replay and ownership invariants remain in force during evidence collection.

Codex remains independent tester/researcher only. Codex must not fill unknown contract fields or author production fixes from assumptions. Production implementation is authored only after the required evidence is available.

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

## B-series continuation

### Patch B0 — Full Read Core — ACCEPTED

Official B0 acceptance commit:

`3795359959c965fc5cd1837b9a1c978493ae2ac5`

Accepted tester result:

`cc6413d25dd794a12fd61b71728aaac9702bc6de`

Accepted exact production tree SHA-256:

`d313bcfdb7597e8ffc9593120f807c64ed9bd4952f6c07a69368361c3435ccfe`

B0 is the authority for the registry/guidance/entitlement/Swagger-metadata architecture, Personal Data policy and protected A.5 behavior.

### Patch B1 — Assortment Master — ACTIVE

B1 starts from accepted B0 and closes/implements the Product Master read contour incrementally. Existing Ozon-owned Product Master research must be reused before seeking new evidence. New evidence collection must target only facts that are actually absent under the mandatory evidence-first rule above.

Current core targets:

- `/v3/product/list`
- `/v3/product/info/list`
- `/v4/product/info/attributes`

Do not restart broad Ozon API discovery merely because a full public Swagger fetch is unavailable. First inspect accepted B0 bundled metadata/snapshot and prior Product Master authority. If a remaining fact still cannot be established, obtain only that fact through an exact safe real Ozon request or exact operator evidence workflow.

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
- persistent `Начало диктовки` is not delivery completion;
- no missing Ozon contract fact may be guessed or silently inferred; unknowns remain explicit until evidence is obtained.

## Working-method authority

`OZON_BRIDGE_DEVELOPMENT_WORKFLOW_2026-08-17.md`

Development continues incrementally:

`development stage -> targeted engineering checks -> independent Codex validation of that stage -> fix/revalidate if needed -> next stage`

Evidence acquisition precedes implementation whenever a required contract fact is missing. The assistant must request or generate the exact evidence needed rather than completing gaps from assumptions.

There is no retired one-shot final B01-B15/full-gate requirement.

## Current state

`STEP0 = ACCEPTED`

`STEP1 = ACCEPTED`

`STEP2 = ACCEPTED`

`STEP3 = ACCEPTED`

`STEP4 = ACCEPTED`

`V3_QUOTA_COUNTDOWN = INDEPENDENT_ACCEPTANCE_PASS`

`COMPOSER_WAIT = COMPOSER_WAIT_STAGE_ACCEPTED`

`PATCH_B0_FULL_READ_CORE = ACCEPTED`

`PATCH_B1_ASSORTMENT_MASTER = ACTIVE`
