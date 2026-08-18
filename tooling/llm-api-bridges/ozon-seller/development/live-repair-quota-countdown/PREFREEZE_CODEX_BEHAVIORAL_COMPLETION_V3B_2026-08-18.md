# Ozon Bridge v0.1.19 — V3B targeted pre-freeze behavioral completion

Date: 2026-08-18
Status: engineering completion gate only; NOT independent acceptance, NOT live-provider testing, NOT release promotion.

# FULL STANDALONE CODEX PROMPT

Live GitHub is the only source of truth.

Repository:

`MaksimUnimax/blood_sand`

Project root:

`tooling/llm-api-bridges/ozon-seller/`

Exact V3 implementation candidate checkpoint:

`88a20984c55da1f813ca1184bd90089823f51883`

Exact frozen Step-4 base:

`4ce190c8bbdc438dcdf407abbe4dbecd846736df`

Exact V3 concat:

`aa247ed1b89ac0f708768d6d7057595b99f16b2242a402ca7a7cf1be6e944024`

Exact repaired hashes already established:

- `service_worker.js` = `34a84f66284f5aa5f77b9b7cda23d5ddb2431c7b30114cd5fe927798c31e957a`
- `content_script.js` = `d95d2ca040c37f688d33c2caac8a78d95389b8e7acd41fcf11f8e0b4dc59e001`

Read completely before execution:

- `development/live-repair-quota-countdown/REPAIR_SCOPE_2026-08-18.md`
- `development/live-repair-quota-countdown/PATCH_PARTS_V3.md`
- `development/live-repair-quota-countdown/REPAIR_V3_EXACT_RECONSTRUCTION_EVIDENCE_2026-08-18.md`
- prior V3 reconstruction report, commit `82b8ec53830047902b8bfcc2886519ae6161fcaf`
- prior V3 behavioral report, commit `0f29fda21c91230cb651dbc84cca2a5f4bc6f7e1`
- accepted Step-3 report `validation/reports/OZON_STEP3_QUOTA_VERIFIER_ERRORS_VALIDATION_2026-08-17.md`
- accepted Step-4 report `validation/reports/OZON_STEP4_CACHE_PREFETCH_SEMANTIC_VALIDATION_2026-08-18.md`

The prior V3 behavioral report proved the accepted CFT/Puppeteer architecture can install and observe the actual repaired extension and proved cache-hit-before-quota. It failed only because remaining mandatory scenarios were not executed. Do NOT reinterpret missing evidence as a production defect.

## Rules

- Do NOT create V4.
- Do NOT modify the V3 patch or any production file.
- Do NOT use fuzz, `--reject`, manual patch repair, or alternate source bytes.
- Do NOT use real Seller/Performance credentials.
- Do NOT contact Ozon or Performance.
- `REAL_OZON_REQUESTS = 0`.
- `REAL_PERFORMANCE_REQUESTS = 0`.
- Provider/network interception must fail closed if an Ozon/Performance request is attempted.
- All provider responses used below are mocked locally.
- If a mandatory V3B item cannot be executed, mark it `UNPROVEN`; any mandatory `UNPROVEN` => `PREFREEZE_V3B_FAILED`.

## 1. Exact bytes prerequisite

Reconstruct exact V3 bytes using the accepted reconstruction method and verify before behavior testing:

- worker SHA exactly `34a84f...957a`;
- content SHA exactly `d95d2c...e001`;
- protected fifteen files byte-identical to frozen Step 4.

Mismatch => STOP.

## 2. Carry-forward discipline

You MAY carry forward an accepted Step-3 or Step-4 PASS only when BOTH are true:

1. the production file/function responsible for that invariant is byte-identical in V3 to the accepted target, OR a brace-aware comparison proves the relevant protected body unchanged;
2. V3 does not alter the call ordering/input semantics that the invariant depends on.

For every carried item, name the accepted report and exact protected file/function/body used as the basis.

You MUST NOT carry forward the following affected V3 paths; they require fresh execution below:

- `safeQuotaMetadata` / `acquireAnalyticsProviderQuota` / Retry-After interaction with the new guard;
- public manual/autorun `quota_wait` exposure;
- manual content countdown/status UI;
- cache miss reaching the guarded quota path;
- 429/no-replay after a V3 quota reservation;
- binding/owner behavior around the new content countdown state.

## 3. Actual repaired worker public-state/privacy gate

Exercise the ACTUAL repaired worker public state path, not a copied helper.

Use either the installed MV3 service worker via runtime messaging, or the exact worker module in a VM with real worker message handlers and mocked Chrome APIs.

Seed two durable owners:

### Manual owner

- active manual operation;
- batch `request_state = quota_waiting`;
- future `quota_wait.next_allowed_at`;
- queue index and waiting timestamp;
- include secret sentinel strings in internal `account_hash`, `credential_revision`, fake Client-Id and fake Api-Key fields where internal state permits.

Call the same `OZ_GET_MANUAL_STATE` path used by production content script.

Required manual public object:

- `quota_wait` non-null;
- family exactly `seller.analytics_data.v1`;
- `min_interval_ms = 60000`;
- `bridge_launch_safety_ms = 5000`;
- `effective_interval_ms = 65000`;
- exact seeded `next_allowed_at`;
- exact queue index;
- `automatic_retry = false`.

### Autorun owner

Seed an independent autorun batch in `quota_waiting` and exercise the ACTUAL public autorun state path used by content sync.

Require the same safe wait metadata.

### Privacy

Search serialized manual response, autorun response and browser-visible runtime payloads for all secret sentinels.

MUST be absent:

- raw Client-Id;
- Api-Key;
- full account hash;
- full credential revision;
- `credential_scope_id`.

When owner is not in `quota_waiting`, public `quota_wait` MUST be null.

Required result:

`V3B_PUBLIC_STATE_PRIVACY_PASS`

## 4. Incompatible cache miss -> guarded quota gate

Using actual repaired `processBatchQueue` integration and mocked provider:

1. Seed a valid analytics cache entry incompatible with the requested command by one semantic field or missing requested metric.
2. Seed same-account quota state whose guarded `next_allowed_at` is still in the future.
3. Process the command.

Require:

- cache is a miss;
- provider calls = 0 before due;
- durable owner transitions to `quota_waiting`;
- returned/saved due time respects effective 65000 ms guard;
- no quota slot is consumed twice;
- no hidden retry/polling.

Then advance mocked time exactly to due and resume through the actual scheduler path.

Require exactly one mocked provider attempt.

Required result:

`V3B_CACHE_MISS_GUARDED_QUOTA_PASS`

## 5. Mocked 429 one-call / zero replay gate

Use actual repaired worker queue + provider integration.

Scenario:

- same-account analytics command reaches a granted V3 quota slot;
- mocked provider returns one HTTP 429 rate-limit response;
- Retry-After test variants:
  A. no usable Retry-After;
  B. usable Retry-After greater than current guarded due.

For EACH variant require:

- exactly one provider transport call for the command;
- response is stored/delivered as one sanitized error;
- `automatic_retry=false`;
- no immediate retry;
- no delayed retry via quota alarm;
- no startup replay after simulated MV3 worker restart;
- no duplicate provider call after `resumeProviderQuotaWaits`;
- unknown in-flight requests are not replayed;
- raw provider body/credentials/secret sentinels absent from AI-facing report.

For variant A, future account boundary remains based on the real attempted dispatch + fixed V3 guard and is not shortened.

For variant B, Retry-After may only extend the existing guarded boundary.

Required result:

`V3B_429_ZERO_REPLAY_PASS`

## 6. Actual production content countdown browser gate

Use the accepted browser route already proven in the prior behavioral run:

`Node child_process.spawn -> Chrome for Testing 151.0.7922.47 -> dynamic DevToolsActivePort -> Puppeteer 25.4.0 -> browser.installExtension()`

Use the ACTUAL repaired `content_script.js` and installed extension. Provider domains remain intercepted/blocked.

Create local synthetic pages shaped for both ChatGPT and Alice adapters. Do not use real chat accounts.

### Manual waiting sequence

For ChatGPT synthetic owner A:

1. establish structural binding + Manual mode using the real runtime path;
2. expose a structural `OZON_API_V1` code block and extension execution button;
3. click the extension Ozon button once;
4. worker mock transitions the admitted manual batch to durable `quota_waiting` with `next_allowed_at` several seconds in the future;
5. content script must discover the public wait through its real `OZ_GET_MANUAL_STATE` probe/sync path.

Require the extension-owned visible plate to contain all of:

- `Ожидание лимита Ozon`;
- `Ограничение частоты запросов Ozon.`;
- `Следующий запрос через MM:SS.`;
- `Запрос сохранён и выполнится автоматически. Повторно нажимать не нужно.`;
- `Следующая попытка: HH:MM:SS`.

Capture at least THREE displayed countdown values on different seconds and prove strictly decreasing remaining time.

At/after due require exact sending state:

`Лимит Ozon снят — отправляем запрос…`

No Ozon/provider request may be caused by the UI timer itself.

### Duplicate click / busy state

While owner remains active/waiting:

- extension execution control remains busy/disabled;
- attempted second user click cannot create a second manual admission;
- count worker admission messages and require exactly one accepted batch.

### Restart restoration

While still before due:

- reload/restart content runtime (or navigate away/back while preserving same conversation identity) without altering worker durable state;
- content script must re-sync through production state path and reconstruct the same wait plate from persisted `next_allowed_at`;
- countdown resumes from remaining time, not from a new full interval.

### Two-owner isolation

Create independent synthetic owner B with a different due time in a second tab/conversation.

Require simultaneously:

- A shows A due/countdown;
- B shows B due/countdown;
- A state never changes to B values;
- B state never changes to A values;
- no global-current-conversation overwrite.

Required result:

`V3B_COUNTDOWN_BROWSER_PASS`

## 7. ChatGPT / Alice / native Copy regression on actual repaired content

In the same CFT run:

### ChatGPT

- structural command block binds to extension Ozon control;
- extension control admission remains owner-local;
- native page Copy is not treated as Ozon execute/status control.

### Alice

- structural command block binds through the Alice adapter;
- manual state/countdown is Alice-owner local;
- no ChatGPT-only singleton/state assumption;
- native Alice Copy remains independent.

### Cross-owner

- result/status/countdown from one tab/conversation never appears in the other owner;
- no cross-conversation delivery or binding mutation.

Required result:

`V3B_CHATGPT_ALICE_OWNER_REGRESSION_PASS`

## 8. Targeted Step 1–4 regression closure

Freshly execute affected integration paths and carry forward only protected byte-identical invariants per section 2.

Must close all of these as PASS with explicit evidence basis:

### Step 1 security/capability

- fixed host/read-only surface unchanged;
- no arbitrary URL/host/method/header/auth control;
- mutations and restricted customer-PII operation remain blocked;
- capability probe behavior is unchanged for analytics path used here.

### Step 2 planner/coalescing/projection

- exact semantic compatibility/coalescing remains unchanged;
- requested metric projection order remains correct;
- no new pagination/fanout.

### Step 3 quota/verifier/errors

Fresh V3 affected tests MUST cover sections 3–5.
Carry forward protected verifier/sanitization/body invariants only if byte-identical bodies are named.

### Step 4 cache/prefetch

Fresh test MUST include incompatible miss -> V3 guarded quota (section 4).
Prior V3 behavioral cache hit PASS may be re-executed or cited only if exact repaired bytes are reverified in this run.

### Delivery FSM

Use brace-aware body comparison against frozen Step 4 for protected finalize/delivery functions plus at least one synthetic owner-local completion/delivery assertion in browser/worker harness.

Required result:

`V3B_STEP1_4_REGRESSION_PASS`

## 9. Static and network closure

Require:

- exact V3 repaired hashes unchanged;
- all 17 production JS `node --check` PASS;
- manifest JSON parse PASS;
- permissions/host permissions unchanged from frozen Step 4;
- no production drift;
- browser request interception shows 0 Ozon requests;
- provider mock counters match asserted scenarios only;
- `REAL_OZON_REQUESTS = 0`;
- `REAL_PERFORMANCE_REQUESTS = 0`.

## 10. Publication discipline

Create report branch FROM EXACT candidate checkpoint:

`88a20984c55da1f813ca1184bd90089823f51883`

Branch:

`engineering/ozon-live-repair-prefreeze-behavioral-v3b-2026-08-18`

Create exactly one new report file:

`tooling/llm-api-bridges/ozon-seller/development/live-repair-quota-countdown/PREFREEZE_BEHAVIORAL_V3B_REPORT_2026-08-18.md`

The report branch must be exactly one report-only commit ahead of candidate checkpoint. Do not copy the V3B plan into the report branch; read it from the development branch.

Commit message:

`test: complete targeted Ozon V3B prefreeze behavior`

Do not merge. Push report and STOP.

## 11. Verdict

PASS only when every mandatory V3B result is PASS:

- `V3B_PUBLIC_STATE_PRIVACY_PASS`
- `V3B_CACHE_MISS_GUARDED_QUOTA_PASS`
- `V3B_429_ZERO_REPLAY_PASS`
- `V3B_COUNTDOWN_BROWSER_PASS`
- `V3B_CHATGPT_ALICE_OWNER_REGRESSION_PASS`
- `V3B_STEP1_4_REGRESSION_PASS`

Then verdict:

`PREFREEZE_V3B_PASS`

Any FAIL/UNPROVEN =>

`PREFREEZE_V3B_FAILED`

A PASS is still only permission for ChatGPT to independently review the report and decide whether to freeze V3. It is NOT release acceptance and NOT live acceptance.

## 12. Final response format

Return exactly:

CODEX_OZON_LIVE_REPAIR_PREFREEZE_V3B_RESULT

tested_base:
  4ce190c8bbdc438dcdf407abbe4dbecd846736df

candidate_checkpoint:
  88a20984c55da1f813ca1184bd90089823f51883

exact_bytes:
  worker_sha: PASS|FAIL
  content_sha: PASS|FAIL
  protected_15: PASS|FAIL

public_state:
  manual_quota_wait: PASS|FAIL|UNPROVEN
  autorun_quota_wait: PASS|FAIL|UNPROVEN
  privacy: PASS|FAIL|UNPROVEN

cache_quota:
  incompatible_miss_reaches_guarded_wait: PASS|FAIL|UNPROVEN
  resume_at_due_one_provider_call: PASS|FAIL|UNPROVEN

retry:
  one_429_one_provider_call: PASS|FAIL|UNPROVEN
  zero_immediate_retry: PASS|FAIL|UNPROVEN
  zero_alarm_replay: PASS|FAIL|UNPROVEN
  zero_startup_replay: PASS|FAIL|UNPROVEN
  retry_after_extension_only: PASS|FAIL|UNPROVEN

countdown:
  visible_wait_plate: PASS|FAIL|UNPROVEN
  three_decreasing_seconds: PASS|FAIL|UNPROVEN
  absolute_due_clock: PASS|FAIL|UNPROVEN
  due_sending_state: PASS|FAIL|UNPROVEN
  restart_restore: PASS|FAIL|UNPROVEN
  duplicate_click_blocked: PASS|FAIL|UNPROVEN
  two_owner_isolation: PASS|FAIL|UNPROVEN

browser_regression:
  chatgpt_binding: PASS|FAIL|UNPROVEN
  alice_binding: PASS|FAIL|UNPROVEN
  native_copy_independent: PASS|FAIL|UNPROVEN
  no_cross_owner_regression: PASS|FAIL|UNPROVEN

step_regression:
  step1_security: PASS|FAIL|UNPROVEN
  step2_planner_projection: PASS|FAIL|UNPROVEN
  step3_quota_verifier: PASS|FAIL|UNPROVEN
  step4_cache_prefetch: PASS|FAIL|UNPROVEN
  delivery_fsm: PASS|FAIL|UNPROVEN

network:
  real_ozon_requests: 0
  real_performance_requests: 0

report_branch:
  engineering/ozon-live-repair-prefreeze-behavioral-v3b-2026-08-18

report_commit:
  <sha>

verdict:
  PREFREEZE_V3B_PASS|PREFREEZE_V3B_FAILED

After publication: STOP. Wait for ChatGPT live-GitHub review before freeze.