# Ozon Bridge v0.1.19 — controlled live rerun after independent acceptance

Date: 2026-08-18
Status: `AUTHORIZED_FOR_OPERATOR_ASSISTED_CONTROLLED_LIVE_RERUN`

This is the single controlled live gate unlocked by the independent synthetic acceptance PASS. It is not an engineering stage, not another synthetic acceptance, and not release promotion.

## Authority

Repository: `MaksimUnimax/blood_sand`

Exact frozen repair target:

`66bc4ac712b345d499b10982e7f5124279265b88`

Authoritative frozen Step-4 base:

`4ce190c8bbdc438dcdf407abbe4dbecd846736df`

Exact V3 production candidate represented by the frozen target:

`88a20984c55da1f813ca1184bd90089823f51883`

Expected repaired hashes:

- `service_worker.js`: `34a84f66284f5aa5f77b9b7cda23d5ddb2431c7b30114cd5fe927798c31e957a`
- `content_script.js`: `d95d2ca040c37f688d33c2caac8a78d95389b8e7acd41fcf11f8e0b4dc59e001`

Independent acceptance PASS report commit:

`662efb3737e5f7d702751a2407d9d154a2d83ea9`

The independent acceptance freshly proved integrity, worker/quota behavior, Step-1–4 carry-forward, Step-2 actual path, browser quota UI, ChatGPT/Alice bindings, native Copy independence, owner isolation, restart restore, and tab cleanup with:

- `REAL_OZON_REQUESTS=0`
- `REAL_PERFORMANCE_REQUESTS=0`
- `OPERATOR_BROWSER_ACTIONS=0`
- `INDEPENDENT_ACCEPTANCE_PASS`

The historical rejected live run is report commit `888b12a351d2d9edbf070f516645525ddbaebd3f`. Its relevant facts were: A HTTP200, Alice-B consumed a second real analytics request because the 60-second cache window was missed, then C resumed near the old 60-second boundary and received HTTP429; total real analytics calls became 3 despite a max-2 budget. The Alice cache observation was inconclusive and is not a repair trigger.

## Purpose of this live rerun

Establish only the live facts that required the repair and cannot be proved by mocks:

1. a successful real `analytics_data` request establishes the same-Seller quota clock;
2. a second cold same-Seller request admitted shortly afterward visibly enters the durable Ozon quota wait;
3. its displayed countdown is operator-visible and needs no duplicate click;
4. no second provider call occurs before the repaired guarded boundary;
5. the waiting request resumes automatically;
6. the second real provider request starts at or after the repaired `65000 ms` local not-before boundary;
7. there is no retry/replay/third real request;
8. the second request completes successfully or, if the provider still rejects it at the guarded boundary, the run fails without retry and preserves evidence.

This live rerun does NOT retest the Step-4 cache using another real command. Cache correctness and Alice binding were already independently accepted synthetically, and cache timing was explicitly not a repair trigger. Alice must consume zero real provider requests in this gate.

## Hard real-provider budget

`REAL_OZON_BUSINESS_REQUESTS_MAX = 2`

Allowed real business operation only:

`analytics_data`

Expected Seller capability probes:

`0`

Expected Performance requests/token requests:

`0`

No popup `Проверить API`.

No manual provider retry.

No automatic provider retry.

No third real business request for any reason.

If an unexpected third real business request starts or is attempted, verdict is `CONTROLLED_LIVE_REJECTED` and the operator must perform no further Ozon action.

If real request #1 fails, STOP immediately. Do not spend request #2 trying to compensate.

If real request #2 fails, record the failure once and STOP. Do not retry.

## Roles and credential safety

Codex may:

- verify live GitHub authority and reconstruct/hash the exact frozen candidate outside the repository tree;
- prepare a clean unpacked extension folder;
- instruct the operator one manual browser action at a time;
- read the extension's sanitized diagnostics export after the run;
- write the report-only live decision.

Codex MUST NOT:

- automate, remote-debug, inspect or control the operator's normal logged-in Chrome profile;
- click real Ozon execution buttons;
- read, paste, store or report Seller Client-Id / Api-Key;
- use real Performance credentials;
- inspect raw credential storage;
- alter quota/cache state or timers;
- alter production code;
- promote a release.

The operator alone performs actions in the normal browser profile.

## Exact candidate preparation

Reconstruct/materialize the exact production extension represented by frozen target `66bc4ac712b345d499b10982e7f5124279265b88` into a clean external folder, for example:

`C:\OzonBridge\live-repair-66bc4ac\`

Before involving the operator, verify:

- correct frozen target and authoritative Step-4 base;
- exact repaired worker/content hashes above;
- manifest version `0.1.19`;
- expected production file set only;
- no validation/development/harness files in the unpacked folder;
- no production drift.

Any mismatch => STOP before real requests.

## Operator browser hygiene

This live gate must not create or leave a growing tab pile.

Before starting:

- close stale QA/test ChatGPT/Alice tabs left from previous runs;
- keep only the minimal pages needed for this gate;
- reuse two normal logged-in ChatGPT conversations/tabs instead of opening a new tab for every attempt;
- no repeated browser retries after the live clock starts;
- close any temporary preparation page when no longer needed.

The actual controlled run requires only:

- `ChatGPT-A`
- `ChatGPT-C`
- extension popup when needed

No Alice execution is required.

## Operator installation checkpoint

Using the normal Chrome profile in which ChatGPT is logged in, the operator manually:

1. disables any other Ozon Bridge instance;
2. opens `chrome://extensions`;
3. loads exactly the clean unpacked folder for frozen target `66bc4ac...`;
4. confirms version `0.1.19`;
5. opens the popup;
6. if Seller credentials are missing for this exact extension instance, enters them locally and clicks `Сохранить всё`;
7. does NOT click `Проверить API`.

Credentials remain local/operator-only.

## Prepare two bound ChatGPT owners

Prepare two different logged-in ChatGPT conversations:

- `ChatGPT-A`
- `ChatGPT-C`

For each:

- bind the conversation using the extension;
- enable `Ручной режим Ozon`;
- keep normal automatic result delivery enabled;
- do not use Autorun.

Verify native Copy remains present and independent.

## Exact commands

Use completed historical dates suitable for the current acceptance day.

### Command A — real request #1

```text
OZON_API_V1
{"operation":"analytics_data","params":{"date_from":"2026-08-17","date_to":"2026-08-17","dimension":["day"],"metrics":["revenue"],"limit":1}}
```

### Command C — cold same-Seller waiter / real request #2 after due

Use a different date so it cannot be satisfied from A's analytics cache:

```text
OZON_API_V1
{"operation":"analytics_data","params":{"date_from":"2026-08-16","date_to":"2026-08-16","dimension":["day"],"metrics":["revenue"],"limit":1}}
```

Do not execute any other Ozon command during the live gate.

## Clear diagnostics before T0

Immediately before the first Ozon click:

- open popup diagnostics;
- clear diagnostics using the extension UI only;
- do not clear or edit quota/cache/credentials through developer tools;
- record local wall-clock time.

## Controlled sequence

### T0 — ChatGPT-A

Operator clicks the Ozon button for command A exactly once.

Expected:

- request is admitted;
- exactly one real `analytics_data` attempt occurs;
- no seller capability probe;
- no Performance request.

As soon as A is admitted/busy, move to ChatGPT-C. Do not repeatedly click A.

### T0+ — ChatGPT-C enters repaired durable wait

Within clearly less than 60 seconds of A admission, preferably within 5–10 seconds, operator clicks C exactly once.

Expected BEFORE any second provider call:

- C enters durable quota wait;
- visible title exactly contains `Ожидание лимита Ozon`;
- visible text explains `Ограничение частоты запросов Ozon`;
- visible local countdown `Следующий запрос через MM:SS`;
- visible `Запрос сохранён и выполнится автоматически. Повторно нажимать не нужно.`;
- visible absolute `Следующая попытка: HH:MM:SS`;
- waiting control is busy/disabled;
- operator performs no second click on C;
- real Ozon business request count remains exactly 1 while C waits.

If C performs a real provider call before its recorded guarded `next_allowed_at`, verdict is `CONTROLLED_LIVE_REJECTED`.

### A completion

A must complete naturally.

If A fails: STOP immediately; no request #2 compensation.

Do not commit raw business metric values.

### C guarded resume

Leave C untouched. Do not click again.

Expected:

- countdown decreases locally;
- at/after due UI changes to `Лимит Ozon снят — отправляем запрос…`;
- C resumes automatically through normal MV3 quota scheduling;
- exactly one second real `analytics_data` provider request starts;
- its start timestamp is at or after C's durable `next_allowed_at`;
- measured gap from the preceding real analytics attempt start is at least `65000 ms` according to bridge diagnostics/local quota state;
- no retry/replay occurs;
- no third business request occurs.

If request #2 receives a provider 429 or another provider failure at/after the guarded boundary, record that one failure and STOP. Do not retry. Verdict cannot be PASS.

If request #2 succeeds, C receives its own result only.

## Required final request counts

For PASS:

- real `analytics_data` request starts: exactly `2`;
- real successful `analytics_data` finishes: exactly `2`;
- failed real Ozon requests: `0`;
- capability probes: `0`;
- Performance requests/token requests: `0`;
- third business request: `0`.

## Diagnostics export and privacy

After the controlled sequence has completed or stopped:

- export `Все события` using the extension diagnostics UI;
- Codex may inspect only the sanitized exported diagnostics;
- never commit raw credentials, account hashes, full conversation IDs/URLs, raw business values or customer PII;
- use labels `ChatGPT-A` and `ChatGPT-C` in the report.

If diagnostics expose raw credentials/customer PII, reject the live gate and do not commit sensitive contents.

## Required live assertions

The sanitized evidence must establish:

- exact frozen repair target/hashes;
- A request start and finish;
- C quota-wait event with durable `next_allowed_at`;
- C visible wait/countdown/absolute due and due-sending transition as observed by operator;
- no second real request before C due;
- exactly one automatic C provider attempt after due;
- second real request start `>= next_allowed_at`;
- same-Seller real request start gap `>= 65000 ms`;
- no immediate retry;
- no alarm/startup duplicate replay;
- exactly two real business requests total;
- zero seller capability probes;
- zero Performance requests;
- correct owner-specific delivery;
- native Copy unaffected;
- no raw secrets/private account hash in committed evidence.

## Report-only branch

Create report branch FROM EXACT frozen target:

`66bc4ac712b345d499b10982e7f5124279265b88`

Required branch:

`validation/ozon-live-repair-controlled-live-rerun-2026-08-18`

Require:

- merge-base exact frozen target;
- `behind_by=0`;
- no production changes;
- exactly one report commit/file.

Required report path:

`tooling/llm-api-bridges/ozon-seller/validation/reports/OZON_LIVE_REPAIR_CONTROLLED_LIVE_RERUN_2026-08-18.md`

The report must be sanitized and contain no raw business metric values, credentials, account hashes, full conversation IDs, or customer PII.

## Verdicts

`CONTROLLED_LIVE_PASS` only if all required assertions pass and exactly two successful real analytics requests occurred with the second starting at/after the repaired guarded boundary and no third request.

`CONTROLLED_LIVE_REJECTED` for any actual behavioral/safety failure, including early second request, second request 429/failure, duplicate/retry/replay, third request, privacy leak, wrong-owner delivery, unexpected capability probe, or Performance request.

`CONTROLLED_LIVE_INCONCLUSIVE` only for an operator/environment interruption that prevents the required facts from being observed without establishing a production failure. Do not spend extra real requests to compensate for an inconclusive run.

No release promotion is authorized in this task. After publishing the one report commit, STOP for ChatGPT review.
