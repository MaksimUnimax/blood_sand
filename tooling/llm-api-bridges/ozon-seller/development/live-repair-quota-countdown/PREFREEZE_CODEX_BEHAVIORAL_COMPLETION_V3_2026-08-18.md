# Ozon Bridge v0.1.19 — V3 pre-freeze behavioral completion engineering gate

Date: 2026-08-18
Status: engineering behavioral completion only; NOT independent acceptance, NOT live-provider testing, NOT release promotion.

# FULL STANDALONE CODEX PROMPT

Live GitHub is the only source of truth.

Repository:

`MaksimUnimax/blood_sand`

Project root:

`tooling/llm-api-bridges/ozon-seller/`

Repair development branch:

`dev/ozon-v0.1.19-live-repair-quota-countdown-2026-08-18`

Exact V3 implementation-candidate checkpoint:

`88a20984c55da1f813ca1184bd90089823f51883`

Exact frozen Step-4 production base:

`4ce190c8bbdc438dcdf407abbe4dbecd846736df`

Exact V3 concat SHA-256:

`aa247ed1b89ac0f708768d6d7057595b99f16b2242a402ca7a7cf1be6e944024`

Exact repaired production hashes already established by exact reconstruction:

- `service_worker.js`: `34a84f66284f5aa5f77b9b7cda23d5ddb2431c7b30114cd5fe927798c31e957a`
- `content_script.js`: `d95d2ca040c37f688d33c2caac8a78d95389b8e7acd41fcf11f8e0b4dc59e001`

Read completely from live GitHub before execution:

- `development/live-repair-quota-countdown/REPAIR_SCOPE_2026-08-18.md`
- `development/live-repair-quota-countdown/PATCH_PARTS_V3.md`
- `development/live-repair-quota-countdown/REPAIR_V3_PACKAGING_CORRECTION_2026-08-18.md`
- `development/live-repair-quota-countdown/REPAIR_V3_EXACT_RECONSTRUCTION_EVIDENCE_2026-08-18.md`
- V3 reconstruction report from `engineering/ozon-live-repair-prefreeze-reconstruction-v3-2026-08-18`, commit `82b8ec53830047902b8bfcc2886519ae6161fcaf`;
- accepted Step-3 and Step-4 validation reports/plans, especially the accepted CFT/Puppeteer extension route and actual cache/quota integration checks.

IMPORTANT: the V3 report contains a human-readable typo in one frozen-base line (`...7ab4be...`). Do not propagate it. The only authoritative frozen base is exactly:

`4ce190c8bbdc438dcdf407abbe4dbecd846736df`

This run does NOT create V4 and does NOT change V3 patch bytes. It exists solely to complete behavioral evidence that the V3 reconstruction report left `UNPROVEN`.

## 1. Reconstruct the exact same repaired V3 candidate

Repeat only enough reconstruction to prove the tested bytes are exactly the previously established V3 candidate:

1. reconstruct frozen Step 4 17/17 from accepted baseline + Step1/2/3/4 patch lineage;
2. require frozen worker SHA `7133956f8d66cc0a8767368224f6177dc1e16838d74fdd034d8aedda7e8e0ffd`;
3. require frozen content SHA `b80fcf1784e083292cc48c0780480651b144a96494083c7df2af3dce97504132`;
4. fetch V3 raw parts from `patch-parts-v3/` and require concat SHA `aa247ed1...`;
5. exact `git apply --check`, no fuzz/reject/manual repair;
6. apply once;
7. require repaired worker SHA exactly `34a84f66284f5aa5f77b9b7cda23d5ddb2431c7b30114cd5fe927798c31e957a`;
8. require repaired content SHA exactly `d95d2ca040c37f688d33c2caac8a78d95389b8e7acd41fcf11f8e0b4dc59e001`;
9. require exactly two changed production files and protected fifteen byte-identical.

Any mismatch => `PREFREEZE_V3_BEHAVIORAL_FAILED`, publish report, STOP.

## 2. Safety harness rules

All provider behavior is mocked.

`REAL_OZON_REQUESTS = 0`

Hard network rule:

- deny/abort any request to `api-seller.ozon.ru` or `api-performance.ozon.ru` at the browser/network layer;
- no real Seller credentials;
- no real Performance credentials;
- no external provider fallback;
- no normal logged-in operator profile;
- no remote debugging of the operator profile.

Use the previously accepted synthetic extension route where browser evidence is required:

`fixed unpacked repaired source -> Node child_process.spawn -> Chrome for Testing -> dynamic DevToolsActivePort -> Puppeteer -> browser.installExtension -> assertions/report`

If current exact CFT build differs, record it, but use the same architecture and do not weaken assertions.

## 3. Actual worker public-state privacy path

Exercise the repaired production `service_worker.js`, not a copied helper implementation.

Use mocked `chrome.storage.local/session`, runtime sender/tab identity and the actual runtime message listener/public-state functions.

Create durable manual and autorun owners whose batch state is `request_state = "quota_waiting"` with a future `next_allowed_at` and internal quota fields that also contain deliberately recognizable secret sentinel values for:

- account hash;
- credential revision/scope;
- raw-looking Client-Id sentinel;
- raw-looking Api-Key sentinel.

Then exercise the actual public state path used by content runtime, including `OZ_GET_MANUAL_STATE` and the content-ready/current-state response path used for restart restoration.

Require public `quota_wait` to expose only safe fields:

- family;
- `min_interval_ms = 60000`;
- `bridge_launch_safety_ms = 5000`;
- `effective_interval_ms = 65000`;
- `next_allowed_at`;
- queue index;
- waiting timestamp;
- `automatic_retry=false`.

Require serialized public responses to contain NONE of the secret sentinels and no:

- raw Client-Id;
- Api-Key;
- account hash;
- credential revision;
- credential scope id.

When owner state is not `quota_waiting`, public `quota_wait` must be null.

Do this for both manual owner and autorun owner.

## 4. Actual cache-hit-before-quota integration

Reuse/extend the accepted Step-4 actual-worker synthetic integration against the repaired V3 worker.

Set one same-Seller analytics quota boundary deliberately in the future so a provider miss would enter `quota_waiting`.

Seed a valid, unexpired, verified analytics cache entry compatible with the logical request.

Execute an actual admitted analytics batch through the repaired worker queue.

Require:

- cache hit occurs before quota acquisition;
- logical result completes successfully;
- `external_request_executed=false`;
- no current physical request id for this cache hit;
- provider call count = 0;
- capability probe count = 0 for the universal analytics command;
- quota state is not newly consumed/reserved/moved by the cache hit;
- no `PROVIDER_QUOTA_WAITING` is created for the cache-hit batch;
- safe cache provenance remains present;
- metric projection/order remains exact.

Also run a deliberate incompatible cache miss with mocked provider transport and prove it reaches the quota scheduler rather than bypassing it.

## 5. Actual zero-auto-retry / 429 integration

Against the repaired worker with mocked provider transport:

- arrange a permitted analytics launch;
- mocked provider returns one HTTP 429 provider result/error;
- usable Retry-After may be absent in one case and present in a separate case;
- count actual provider invocation calls.

Require:

- exactly one provider invocation for the failed command;
- returned result is the sanitized 429/rate-limit error;
- `automatic_retry=false`;
- no immediate retry;
- no hidden retry through alarm/startup resume;
- no replay after advancing mocked clock beyond the next quota boundary;
- the failed batch entry is terminal/complete according to existing semantics, not left as a retryable `quota_waiting` owner;
- a usable Retry-After can extend future quota state but never causes retry of the failed command;
- absent Retry-After does not create a retry.

This gate is about retry semantics only. Do not assert that 65000 ms is an Ozon-documented limit.

## 6. Synthetic browser countdown — manual ChatGPT owner

Use the actual repaired extension and production `content_script.js` in CFT/Puppeteer.

Use the same structural/mock page method accepted by prior browser validations. Do not modify production code for the test.

Create/bind a synthetic ChatGPT conversation in Manual mode with:

- one structural Ozon command code block;
- native Copy control;
- extension-owned Ozon execution button.

Runtime/worker state must transition after admission to an actual public durable `quota_waiting` response with a future `next_allowed_at` about 65 seconds away. Accelerated/mock clock is allowed only if the renderer still uses production `Date.now()` semantics and the report explains the clock harness.

Require visible extension-owned plate containing:

`Ожидание лимита Ozon`

`Ограничение частоты запросов Ozon.`

`Следующий запрос через MM:SS.`

`Запрос сохранён и выполнится автоматически. Повторно нажимать не нужно.`

`Следующая попытка: HH:MM:SS`

Prove:

- initial MM:SS is consistent with `next_allowed_at - Date.now()`;
- displayed countdown decreases at least across three distinct seconds;
- no browser/provider network request is caused by countdown ticks;
- only local extension/runtime-state messages occur;
- execution button remains disabled/busy while owner operation is active;
- attempting another click does not admit a second batch;
- native Copy remains separately operable and independent.

At/after due boundary require visible transition to exactly:

`Лимит Ozon снят — отправляем запрос…`

before mocked completion is delivered.

## 7. Restart restoration

While durable owner remains `quota_waiting`:

- restart/reload the content runtime or reload the synthetic page in the accepted harness;
- do NOT recreate wait only in page-local memory;
- obtain state again from the repaired worker/public runtime path.

Require the wait plate to reappear from durable `next_allowed_at` with the correct remaining countdown.

Also simulate/restart the MV3 worker if the accepted harness supports that directly; otherwise explicitly exercise a fresh worker context initialized from the same durable storage and prove the public state still yields the same wait. No provider call is allowed during restoration.

## 8. Two-owner / two-tab isolation

Create two independent synthetic bound conversations/tabs with two different durable future `next_allowed_at` values.

Require simultaneously:

- tab/conversation A shows its own remaining countdown;
- tab/conversation B shows its own different remaining countdown;
- one tab's state updates do not overwrite the other's visible plate;
- clearing/completing A does not clear B;
- no global-current-conversation singleton is used for countdown ownership.

At least one must use the ChatGPT adapter and one must exercise the Alice adapter/lifecycle path.

## 9. ChatGPT/Alice binding regression

Reuse the accepted synthetic browser checks from Step 0/Step 4 as applicable.

Require for BOTH ChatGPT and Alice:

- structural code-block discovery still produces exactly one extension Ozon button per eligible structural block;
- harmless/non-Ozon structural block behavior remains whatever the accepted current production contract specifies; do not invent a new rule;
- native Copy remains independent;
- own exact block binding remains correct;
- no cross-tab/cross-conversation delivery ownership regression;
- countdown UI does not rewrite page-owned code block or native Copy DOM;
- countdown status is extension-owned UI.

Do not require real AI login or real conversation network traffic.

## 10. Accepted Step-1–4 regression matrix

Run or reuse executable tests against the exact repaired V3 bytes, not merely cite old reports.

At minimum prove:

Step 1/security:
- strict command validation remains fail-closed;
- fixed host/method/read-only allowlist unchanged;
- seller_info internal privacy unchanged;
- `posting_fbs_get` remains blocked;
- malformed/pre-exec produces zero provider calls.

Step 2:
- semantic coalescing/projection unchanged;
- logical metric ordering/projection exact;
- one physical call per coalesced group;
- no hidden pagination/fanout.

Step 3:
- same-account quota global across tabs/conversations;
- different-account independence;
- durable quota wait and alarm/startup resume still work;
- unknown in-flight is not replayed;
- Retry-After extension-only;
- verifier/safe error behavior unchanged;
- zero automatic retry.

Step 4:
- cache only analytics_data;
- fixed TTL remains 60000 ms;
- account scope remains Client-Id based as accepted;
- verified successful analytics only admitted;
- corrupt/optimization errors fall back to miss;
- fixed `analytics_basic_metrics_v1` prefetch semantics unchanged;
- cache hit precedes quota and consumes zero provider call;
- result projection exact;
- no provider/allowlist/transport expansion.

Delivery regression:
- existing ChatGPT delivery FSM protected behavior PASS;
- Alice lifecycle remains separate;
- no global current conversation regression.

## 11. Static and network audit

Require:

- all production JS `node --check` PASS;
- manifest parse PASS;
- `git diff --check` PASS;
- repaired worker/content hashes exactly match authority;
- protected fifteen hashes remain exact;
- manifest permissions and host permissions unchanged;
- no direct code change after V3 concat;
- total mocked provider invocation counts recorded;
- actual external Ozon/Performance request count exactly 0.

## 12. Publication discipline

Create report branch FROM EXACT V3 candidate checkpoint:

`88a20984c55da1f813ca1184bd90089823f51883`

Branch:

`engineering/ozon-live-repair-prefreeze-behavioral-v3-2026-08-18`

Create exactly one report file:

`tooling/llm-api-bridges/ozon-seller/development/live-repair-quota-countdown/PREFREEZE_BEHAVIORAL_V3_REPORT_2026-08-18.md`

No production files. No patch files. No fixes.

Commit message:

`test: complete Ozon live repair V3 prefreeze behavior`

The branch must be exactly one report-only commit ahead of `88a20984...`, behind=0, merge base exact `88a20984...`.

Push report and STOP.

## 13. Verdict rule

Only all required gates PASS:

`PREFREEZE_V3_BEHAVIORAL_PASS`

Any FAIL, harness inability, incomplete route, or UNPROVEN required gate:

`PREFREEZE_V3_BEHAVIORAL_FAILED`

Do not reinterpret UNPROVEN as PASS.

No live rerun is authorized by this gate.

## 14. Final response format

Return exactly:

CODEX_OZON_LIVE_REPAIR_PREFREEZE_V3_BEHAVIORAL_RESULT

tested_base:
  4ce190c8bbdc438dcdf407abbe4dbecd846736df

candidate_checkpoint:
  88a20984c55da1f813ca1184bd90089823f51883

reconstruction:
  exact_v3_bytes: PASS|FAIL
  worker_sha: PASS|FAIL
  content_sha: PASS|FAIL
  protected_15: PASS|FAIL

public_state:
  manual_quota_wait: PASS|FAIL|UNPROVEN
  autorun_quota_wait: PASS|FAIL|UNPROVEN
  privacy: PASS|FAIL|UNPROVEN

cache_quota:
  cache_hit_before_quota: PASS|FAIL|UNPROVEN
  cache_hit_zero_provider: PASS|FAIL|UNPROVEN
  cache_hit_no_quota_consumption: PASS|FAIL|UNPROVEN
  incompatible_miss_reaches_quota: PASS|FAIL|UNPROVEN

retry:
  one_429_one_provider_call: PASS|FAIL|UNPROVEN
  zero_immediate_retry: PASS|FAIL|UNPROVEN
  zero_alarm_startup_replay: PASS|FAIL|UNPROVEN
  retry_after_extension_only: PASS|FAIL|UNPROVEN

countdown:
  visible_wait_plate: PASS|FAIL|UNPROVEN
  live_mm_ss_decrement: PASS|FAIL|UNPROVEN
  absolute_due_clock: PASS|FAIL|UNPROVEN
  due_sending_state: PASS|FAIL|UNPROVEN
  restart_restore: PASS|FAIL|UNPROVEN
  duplicate_click_blocked: PASS|FAIL|UNPROVEN
  multi_tab_owner_scoped: PASS|FAIL|UNPROVEN

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
  engineering/ozon-live-repair-prefreeze-behavioral-v3-2026-08-18

report_commit:
  <sha>

verdict:
  PREFREEZE_V3_BEHAVIORAL_PASS|PREFREEZE_V3_BEHAVIORAL_FAILED

After publication: STOP. Wait for ChatGPT live-GitHub review before any freeze.