# Ozon Bridge — final controlled live acceptance

Date: 2026-08-18
Status: operator-assisted final live gate. No release promotion is authorized by this plan itself.

# FULL STANDALONE CODEX / OPERATOR PROMPT

You are coordinating the final controlled live acceptance of the Ozon Bridge candidate.

Live GitHub is the source of truth.

Repository:

`MaksimUnimax/blood_sand`

Project directory:

`tooling/llm-api-bridges/ozon-seller/`

Exact candidate authority:

`4ce190c8bbdc438dcdf407abbe4dbecd846736df`

Accepted Step-4 synthetic report ref:

`4c41f92`

Step-4 acceptance decision:

`f9199e863cb7bd51ac95c7f2c3c5c839ce30236e`

This is NOT another synthetic Puppeteer gate. The purpose is to establish only facts that require the operator's normal logged-in browser/profile and controlled real Ozon provider behavior.

Do not modify production code. Do not promote a release. Do not merge anything. After publishing the final-live report, STOP for ChatGPT review.

## 1. Roles and hard safety rules

Codex may:

- reconstruct and hash the exact candidate from GitHub;
- prepare a clean unpacked extension directory on Windows;
- tell the operator exactly which manual browser action to perform next;
- read the sanitized diagnostics JSON downloaded by the extension after the run;
- write the final report.

Codex MUST NOT:

- paste/read/store Seller Client-Id or Api-Key in chat, source files, shell history, report or diagnostics;
- automate or remote-debug the operator's normal logged-in Chrome profile;
- click the real Ozon execution buttons itself;
- click `Проверить API` in the popup;
- create extra real Ozon requests for convenience;
- induce 429/rate-limit errors intentionally;
- use Performance API;
- change cache/quota TTLs or internal state to make the test pass;
- repair production code during this gate.

The operator performs all actions in the normal logged-in browser explicitly.

## 2. Real-provider request budget

Primary run hard budget:

`REAL_OZON_BUSINESS_REQUESTS_MAX = 2`

Allowed real business operation only:

`analytics_data`

Expected real Seller capability probes:

`0`

Expected Performance requests/token requests:

`0`

If the first real analytics request fails, STOP immediately and report the failure. Do not spend a second request attempting to hide or retry the first failure.

If any unexpected third real business request is attempted, verdict is `FINAL_LIVE_REJECTED`.

No automatic or manual provider retry is permitted during the gate.

## 3. Reconstruct the exact candidate outside the repository tree

Use the accepted reconstruction lineage from GitHub and raw Git bytes.

Required checkpoints:

- operator baseline ZIP size `100320`, SHA-256 `2b86518bfdc81081e271c7f8346188fc7047999385d1da4428fa2a133dba15bf`;
- Step-1 concat patch SHA-256 `5afe153c15eb4005a836d005bab531f8905dbdcd5b0541d52a6112a3ebb0e3ce`;
- Step-2 concat patch SHA-256 `93e40b59c9128f58b794f2f736377f10777054f51a5de20b25524077c430128b`;
- Step-3 concat patch SHA-256 `9eee85d648a212e96658514dea8f031223d255cf93c7c73a14107c50817919f5`;
- Step-4 concat patch size `29136`, SHA-256 `b05bf7f1d147172fbbb9de91a8388ee0cd400f27d9c4a2aaa0d5550535defed6`.

Final candidate must contain exactly 17 production files.

Step-4 changed hashes must be exactly:

- `service_worker.js` = `7133956f8d66cc0a8767368224f6177dc1e16838d74fdd034d8aedda7e8e0ffd`
- `shared/ozon_contract.js` = `0663df6525f275f29021151efaf83d6a569f8a951c9af9387e820d2a49b59cf5`
- `shared/runtime_names.js` = `9eee534015485eb46f47d5528a577be02707669f543a90014481d94115fbb126`

The other 14 production files must be byte-identical to accepted Step 3.

Manifest must show:

- version `0.1.19`;
- permissions `storage`, `alarms`, `tabs`, `unlimitedStorage`;
- supported AI hosts `chatgpt.com`, `chat.openai.com`, `alice.yandex.ru`;
- fixed Ozon hosts only `api-seller.ozon.ru` and `api-performance.ozon.ru`.

Create a clean fixed unpacked folder such as:

`C:\OzonBridge\final-live-4ce190c8\`

It must contain only the 17 production files/directories required by the extension, not `.git`, validation files or test harness files.

Before involving the operator, report:

`LIVE_CANDIDATE_RECONSTRUCTION = PASS|FAIL`

Any mismatch => STOP with `FINAL_LIVE_REJECTED`.

## 4. Operator normal-profile installation checkpoint

Tell the operator to use the normal Chrome profile in which ChatGPT and Alice are actually logged in.

The operator must manually:

1. Disable any other installed/enabled Ozon Bridge instance so two bridges cannot act at once.
2. Open `chrome://extensions`.
3. Enable Developer mode if necessary.
4. Choose `Load unpacked` and select exactly `C:\OzonBridge\final-live-4ce190c8\`.
5. Confirm the extension card shows version `0.1.19`.
6. Open the extension popup.
7. If Seller credentials are not present for this exact extension instance, enter them locally in the popup and click `Сохранить всё`.

Credentials are operator-only local input. The operator must not paste them into Codex/chat and Codex must not inspect them.

Do NOT click popup `Проверить API` because it would consume an uncontrolled real request outside the acceptance budget.

Performance credentials are not required for this gate.

Required operator confirmation:

`NORMAL_PROFILE_EXACT_CANDIDATE_LOADED = PASS`
`SELLER_CREDENTIALS_PRESENT_LOCAL_ONLY = PASS`

## 5. Prepare three already-logged-in AI conversations BEFORE the first Ozon click

Open and prepare:

- `ChatGPT-A`: one logged-in `chatgpt.com` conversation;
- `ChatGPT-C`: a DIFFERENT logged-in ChatGPT conversation, preferably a separate tab;
- `Alice-B`: one logged-in `alice.yandex.ru` conversation.

For a new Alice chat, send one ordinary harmless message first if needed so Alice obtains a stable `/chat/<id>` identity before binding.

In each conversation, use the extension popup to:

1. click `Привязать диалог` and confirm `Диалог привязан`;
2. enable `Ручной режим Ozon`;
3. keep `В manual-режиме автоматически отправлять полученный результат в текущий AI` enabled.

Do not start Autorun.

Required:

`CHATGPT_A_BOUND_MANUAL = PASS`
`CHATGPT_C_BOUND_MANUAL = PASS`
`ALICE_B_BOUND_MANUAL = PASS`

## 6. Stage exact code blocks before starting the real-request clock

All dates below are intentionally completed historical days for the 2026-08-18 acceptance run.

### ChatGPT-A command A

Have ChatGPT render this exact code block:

```text
OZON_API_V1
{"operation":"analytics_data","params":{"date_from":"2026-08-17","date_to":"2026-08-17","dimension":["day"],"metrics":["revenue"],"limit":1}}
```

Also have ChatGPT-A render one harmless NON-Ozon code block such as:

```text
NOT_OZON_TEST_BLOCK
```

Do not click the non-Ozon block.

### Alice-B command B

Have Alice render this exact code block:

```text
OZON_API_V1
{"operation":"analytics_data","params":{"date_from":"2026-08-17","date_to":"2026-08-17","dimension":["day"],"metrics":["ordered_units"],"limit":1}}
```

This is semantically identical to A except for the logical metric and is expected to be satisfiable from A's reviewed prefetch cache.

### ChatGPT-C command C

Have the second ChatGPT conversation render:

```text
OZON_API_V1
{"operation":"analytics_data","params":{"date_from":"2026-08-16","date_to":"2026-08-16","dimension":["day"],"metrics":["revenue"],"limit":1}}
```

C is deliberately cache-incompatible with A/B because the date differs.

Before any real execution, visually verify in the actual logged-in pages:

- every structurally found code block has exactly one extension-owned `Ozon` button associated with that block;
- native Copy remains present and independent;
- the harmless non-Ozon block also has its own Ozon button, proving button discovery is structural rather than text-based;
- the A/B/C buttons are associated with their own exact blocks and not a neighboring block.

Do not click the harmless non-Ozon block.

Required:

`CHATGPT_LIVE_STRUCTURAL_BINDING = PASS`
`ALICE_LIVE_STRUCTURAL_BINDING = PASS`
`NATIVE_COPY_NOT_REPLACED = PASS`

If the buttons are missing, duplicated, attached to the wrong block, or the wrong conversation cannot bind, STOP before any Ozon request with `FINAL_LIVE_REJECTED`.

## 7. Clear diagnostics immediately before the controlled run

Open the extension popup and use `Диагностика Autorun / Send` -> `Очистить`.

Do not clear credentials/cache/quota using developer tools and do not mutate extension storage manually.

Record the local wall-clock time.

## 8. Controlled execution sequence

The operator, not Codex, performs these clicks.

### T0 — real request #1 from ChatGPT-A

In ChatGPT-A, click the Ozon button belonging to command A.

Immediately after the button is admitted/busy, move to ChatGPT-C. Do NOT wait for A's provider result before performing T0+.

### T0+ — force a cold same-Seller quota wait from ChatGPT-C

Within well under 60 seconds of the A click, click the Ozon button belonging to command C exactly once.

Expected behavior:

- C does NOT execute a second provider call immediately;
- C enters durable `quota_waiting`;
- the first A provider attempt remains the only real business request so far;
- no manual retry/click is performed for C.

If C executes a provider request before the current `next_allowed_at`, verdict is `FINAL_LIVE_REJECTED`.

### Wait for A delivery

Allow A to finish naturally.

Required visible behavior in ChatGPT-A:

- exactly the A conversation receives the bridge result;
- no result is delivered to ChatGPT-C or Alice-B by mistake;
- result is successful;
- `external_request_executed` is true;
- logical result exposes the requested executable metric `revenue`, not an extra logical `ordered_units` metric;
- planning/provenance may show acquisition profile `analytics_basic_metrics_v1` and physical metrics `revenue`,`ordered_units`.

Do not commit raw revenue/business values to GitHub evidence.

If A fails, STOP. Do not continue to B/C provider completion.

### Immediately after A succeeds — live cross-AI cache hit in Alice-B

As soon as A's successful result has been delivered, and within 60 seconds of the cache entry being stored, click the Ozon button belonging to Alice command B exactly once.

Expected behavior:

- Alice-B receives the result in Alice-B only;
- `external_request_executed=false` for B;
- current `physical_request_id` is null/not fabricated;
- cache provenance identifies a hit, age/freshness and source request/fingerprint without exposing account hash/credentials;
- requested logical metric is `ordered_units` only;
- no new Seller quota acquire/provider request is consumed by the cache hit.

If the cache window is missed solely because operator timing exceeded the fixed TTL, classify the gate `FINAL_LIVE_INCONCLUSIVE`, not PASS. Do not compensate by editing TTL/state.

If Alice performs a new provider call despite a fresh compatible cache entry, verdict is `FINAL_LIVE_REJECTED`.

### Let ChatGPT-C resume by the real MV3 quota alarm

Do not click C again.

Keep normal Chrome running and allow the persistent `quota_waiting` owner to resume naturally after the accepted 60000 ms same-Seller analytics interval.

Expected behavior:

- the MV3 alarm/startup wait mechanism resumes C without operator retry;
- exactly one second real `analytics_data` provider request is made after the due time;
- C receives its own result only;
- no duplicate/replayed request occurs.

At the end of the primary run the exact real business request count must be:

`2`

Both are `analytics_data`; no capability probe and no Performance request are expected.

## 9. Export sanitized diagnostics

After A, B and C have completed, open the extension popup.

Under `Диагностика Autorun / Send`:

1. select `Все события`;
2. click `Обновить`;
3. click `Скачать JSON`.

Codex may read this exported diagnostics JSON from the local Downloads folder.

The diagnostics are expected to be sanitized by the extension. If raw credentials, authorization secrets or customer PII appear, verdict is `FINAL_LIVE_REJECTED` and the sensitive material must NOT be committed to GitHub.

Codex must not commit raw business metric values, full conversation URLs/IDs, credentials or account hashes. Use labels `ChatGPT-A`, `ChatGPT-C`, `Alice-B` in the report.

## 10. Required diagnostic assertions

From the sanitized diagnostic export and operator-visible results, establish at minimum:

- `OZON_REQUEST_STARTED` for business analytics: exactly 2;
- `OZON_REQUEST_FINISHED` successful: exactly 2;
- `OZON_REQUEST_FAILED`: 0;
- `CAPABILITY_PROBE_STARTED`: 0;
- `PROVIDER_CACHE_HIT`: at least 1 and attributable to Alice-B with `external_request_executed=false`;
- `PROVIDER_QUOTA_WAITING`: at least 1 and attributable to ChatGPT-C;
- the second real `OZON_REQUEST_STARTED` occurs at or after the `next_allowed_at` recorded by the C quota-wait event;
- there is no third business `OZON_REQUEST_STARTED`;
- no Performance operation/token event occurs;
- no automatic provider retry event/behavior occurs.

If diagnostics cannot distinguish the three owners safely, use the visible operator sequence plus sanitized truncated IDs only locally; do not commit raw conversation IDs.

Required:

`REAL_ANALYTICS_REQUESTS = 2`
`REAL_CAPABILITY_PROBES = 0`
`REAL_PERFORMANCE_REQUESTS = 0`
`LIVE_CACHE_HIT_ZERO_PROVIDER = PASS`
`LIVE_QUOTA_WAIT_AND_ALARM_RESUME = PASS`
`LIVE_NO_RETRY_NO_DUPLICATE = PASS`

## 11. Live delivery/ownership assertions

Required visible operator confirmation:

- result A delivered only to ChatGPT-A;
- result B delivered only to Alice-B;
- result C delivered only to ChatGPT-C;
- no response was inserted into a neighboring/other conversation;
- native Copy remained usable/independent;
- Ozon button busy/ready behavior did not require using native Copy as execution control;
- no persistent `Начало диктовки`/voice UI state was treated as delivery completion;
- no cross-tab global-current-conversation behavior was observed.

Required:

`CHATGPT_LIVE_DELIVERY = PASS`
`ALICE_LIVE_DELIVERY = PASS`
`MULTI_CONVERSATION_OWNERSHIP = PASS`
`COPY_BINDING_LIVE = PASS`

## 12. Security live assertions

During the live run:

- no credentials are pasted into any AI conversation;
- no arbitrary URL/host/method/header/auth is accepted from AI;
- only the three reviewed read-only analytics commands are staged;
- no mutation operation or `posting_fbs_get` is used;
- diagnostics/report contain no raw credentials, Authorization, raw provider error bodies or customer PII.

Required:

`LIVE_SECRET_PRIVACY = PASS`
`LIVE_READ_ONLY_SCOPE = PASS`

## 13. Failure/inconclusive handling

`FINAL_LIVE_REJECTED` for any production-behavior failure, including wrong block binding, cross-conversation delivery, unexpected provider request, quota bypass, cache bypass with a fresh compatible entry, duplicate request/retry, secret exposure or wrong result projection.

`FINAL_LIVE_INCONCLUSIVE` only for an external/operator condition that prevents a valid observation without proving a production defect, such as:

- ChatGPT or Alice service unavailable/login expired;
- operator missed the 60-second cache window before clicking B;
- browser/OS crash unrelated to the extension;
- diagnostics download itself unavailable despite otherwise incomplete evidence.

Do not silently rerun real provider calls. A second live run requires a new explicit operator authorization and a fresh request budget.

## 14. Acceptance criteria

Only all load-bearing PASS with the exact two-request budget permits:

`FINAL_LIVE_ACCEPTED_FOR_RELEASE_PROMOTION`

This verdict only unlocks later ChatGPT review and release-promotion work. Codex must NOT create/promote the canonical release itself.

## 15. Report publication discipline

Create a validation branch exactly from the frozen production target:

`validation/ozon-final-live-acceptance-2026-08-18`

Base SHA:

`4ce190c8bbdc438dcdf407abbe4dbecd846736df`

Create exactly one report file:

`tooling/llm-api-bridges/ozon-seller/validation/reports/OZON_FINAL_CONTROLLED_LIVE_ACCEPTANCE_2026-08-18.md`

The validation branch must contain only that report file.

Commit message:

`test: record Ozon final controlled live acceptance`

Do not include diagnostics JSON, screenshots with private data, credentials, raw business values, reconstructed extension files or harness files in GitHub.

Push the report branch, do not merge, do not modify development/production branches, and STOP.

## 16. Final response format

Return exactly:

```text
CODEX_OZON_FINAL_LIVE_ACCEPTANCE_RESULT

tested_sha:
  4ce190c8bbdc438dcdf407abbe4dbecd846736df

candidate:
  reconstruction: PASS|FAIL
  exact_17_files: PASS|FAIL
  normal_profile_loaded: PASS|FAIL

binding:
  chatgpt_structural: PASS|FAIL|INCONCLUSIVE
  alice_structural: PASS|FAIL|INCONCLUSIVE
  native_copy_independent: PASS|FAIL|INCONCLUSIVE

delivery:
  chatgpt_a: PASS|FAIL|INCONCLUSIVE
  alice_b: PASS|FAIL|INCONCLUSIVE
  chatgpt_c: PASS|FAIL|INCONCLUSIVE
  multi_conversation_ownership: PASS|FAIL|INCONCLUSIVE

live_provider:
  analytics_business_requests: <number>
  capability_probes: <number>
  performance_requests: <number>
  first_request_success: PASS|FAIL|INCONCLUSIVE
  quota_wait_before_second: PASS|FAIL|INCONCLUSIVE
  second_request_after_next_allowed: PASS|FAIL|INCONCLUSIVE
  zero_retry_zero_duplicate: PASS|FAIL|INCONCLUSIVE

cache:
  alice_cross_ai_hit: PASS|FAIL|INCONCLUSIVE
  alice_external_request_executed_false: PASS|FAIL|INCONCLUSIVE
  alice_no_current_physical_request_id: PASS|FAIL|INCONCLUSIVE
  cache_provenance_safe: PASS|FAIL|INCONCLUSIVE

security:
  credentials_local_only: PASS|FAIL
  diagnostics_sanitized: PASS|FAIL|INCONCLUSIVE
  read_only_scope: PASS|FAIL

report_branch:
  <branch or NONE>

report_commit:
  <sha or NONE>

report_url:
  <url or NONE>

verdict:
  FINAL_LIVE_ACCEPTED_FOR_RELEASE_PROMOTION|FINAL_LIVE_REJECTED|FINAL_LIVE_INCONCLUSIVE
```

After publishing the report: STOP.

Do not promote a release. Wait for ChatGPT to review the full live report from GitHub.