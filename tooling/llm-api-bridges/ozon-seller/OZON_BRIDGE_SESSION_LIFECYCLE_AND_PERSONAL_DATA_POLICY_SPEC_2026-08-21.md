# Ozon Bridge v0.1.19 — Work Session Lifecycle, Explicit Recovery, and Personal-Data READ Policy

Date: 2026-08-21  
Status: implementation specification; design only; production code must be implemented and browser-tested by Codex  
Repository: `MaksimUnimax/blood_sand`  
Specification branch: `design/ozon-session-lifecycle-and-personal-data-policy-2026-08-21`  
Shared implementation baseline: `feature/ozon-guided-command-discovery-2026-08-21` at commit `465183b0074265ea0cfe59b5200b64203ed49264`

## 1. Purpose and authority

This document is the implementation authority for two separate Ozon Bridge patches that must later be integrated and browser-tested together.

The patches solve different problems and must not be mixed into one unreviewable state rewrite:

1. **Patch A — Work-session lifecycle and explicit recovery controls**
   - start work in an existing or brand-new AI conversation;
   - send the Ozon handshake prompt;
   - bind automatically when a stable conversation ID becomes available;
   - show or hide the Ozon buttons without sending the handshake again;
   - explicitly refresh a stuck worker/UI session;
   - explicitly finish and unbind the work session.

2. **Patch B — Configurable personal-data READ policy and total queue completion**
   - fully implement the known read-only `posting_fbs_get` operation;
   - add a global `Показывать личные данные` setting, OFF by default;
   - execute and return personal-data READ results only when that setting is enabled;
   - when disabled, return a precise local explanation to the AI instead of calling Ozon;
   - guarantee that no accepted queue entry can remain forever `pending` and leave Manual `BUSY`.

The implementation must preserve the guided-command-discovery feature, Work composer control fixes, provider request semantics, quota scheduling, no-replay rules, credentials, cache and existing operation validation.

## 2. Exact baseline and repository context

The shared baseline is the guided-command-discovery implementation:

- branch: `feature/ozon-guided-command-discovery-2026-08-21`;
- commit: `465183b0074265ea0cfe59b5200b64203ed49264`;
- artifact: `tooling/llm-api-bridges/ozon-seller/artifacts/OZON_BRIDGE_v0.1.19_GUIDED_COMMAND_DISCOVERY_2026-08-21.zip`;
- artifact SHA-256: `8886a8e4b3170095ea6eadae331bcc0494fce0442591c60bcef06d05de848b44`;
- production inventory: 18 files.

That artifact already contains the accepted Work composer lifecycle fixes from:

- branch: `fix/ozon-work-composer-control-2026-08-21`;
- accepted lifecycle commit: `4d8856175141c00caf638d5b8311d7d4deff1abb`;
- baseline artifact SHA-256: `232389f1bfbe2a78c5ea41d78d0942b0b7d6bb872cdea296f75326c72c0da901`.

Codex must freshly extract and hash the guidance artifact before editing. It must not implement against an older reference directory or reconstruct files from snippets in this document.

Relevant existing authorities remain:

- `tooling/llm-api-bridges/ozon-seller/README.md`;
- `tooling/llm-api-bridges/ozon-seller/OZON_BRIDGE_CURRENT_HANDOFF_2026-08-17.md`;
- `tooling/llm-api-bridges/ozon-seller/OZON_BRIDGE_ROADMAP_2026-08-17.md`;
- `tooling/llm-api-bridges/ozon-seller/OZON_BRIDGE_DEVELOPMENT_WORKFLOW_2026-08-17.md`;
- `tooling/llm-api-bridges/ozon-seller/OZON_GUIDED_COMMAND_DISCOVERY_SPEC_2026-08-21.md`;
- `tooling/llm-api-bridges/ozon-seller/validation/LIVE_TEST_INDEX_2026-08-20.md`.

If this specification conflicts with the old guidance specification only on `posting_fbs_get` or customer-data availability, this specification supersedes the old blocked-PII rule. All other guidance rules remain in force.

## 3. Branch and integration strategy

The work must be reviewable as two independent patches.

Recommended branches:

- Patch A: `feature/ozon-work-session-lifecycle-2026-08-21`;
- Patch B: `feature/ozon-personal-data-read-policy-2026-08-21`;
- final integration: `integration/ozon-session-and-personal-data-2026-08-21`.

Both feature branches start from the exact shared baseline commit `465183b0074265ea0cfe59b5200b64203ed49264`.

After each patch passes its own deterministic and browser acceptance tests, Codex creates the integration branch, combines both reviewed commit sequences, resolves overlaps intentionally, and runs the combined matrix. `popup.js`, `popup.html`, `service_worker.js`, `shared/runtime_names.js`, tests and artifact metadata may be touched by both patches; merge conflicts must be resolved from behavior specified here, not by accepting one side wholesale.

Do not overwrite an accepted artifact. Every feature and integrated build receives a new filename and SHA-256.

---

# Part I — Patch A: Work-session lifecycle and explicit recovery

## 4. Current problems

### 4.1 New conversations do not yet have a stable ID

The current popup requires a confirmed conversation identity before binding. In a brand-new ChatGPT/Alice conversation, a stable conversation ID may not exist until the first message is sent and the page navigates or updates to the real conversation route.

The current UI tells the operator to send an ordinary message manually and then bind. This is unnecessary friction and makes the extension appear broken.

### 4.2 Existing controls expose internal implementation concepts

The current UI presents `Manual` and `Autorun`. The desired operator workflow is simpler:

- start work;
- show or hide the Ozon buttons;
- refresh when recovery is explicitly required;
- finish work.

Starting work must not mean starting Autorun. This patch is about a bound manual work session and its Ozon buttons.

### 4.3 UI-only OFF/ON is not a worker recovery mechanism

The existing Work composer fixes correctly keep ordinary Manual OFF/ON UI-local. Hiding and showing buttons must not reset provider state or silently abort a worker operation.

However, the operator also needs a separate explicit recovery action for a genuinely stuck worker. That action must be visibly distinct and must perform a real worker/session recovery, not merely redraw the button.

## 5. Required top-level controls

The first popup section must contain these controls in this order:

1. `Начать работу / Отправить начальный prompt`
2. `Обновить`
3. `Показать кнопку` or `Убрать кнопку`, depending on state
4. `Завершить работу`

These are current-conversation controls. Global credentials and personal-data policy remain global settings.

### 5.1 `Начать работу / Отправить начальный prompt`

The control remains available whenever the active tab is a supported ChatGPT or Alice page and the composer can accept text. It is not disabled merely because a work session is already active.

Behavior when no active work session exists:

1. create one bounded pending-start intent for the current tab and AI origin;
2. if a stable conversation ID already exists, bind that exact conversation immediately;
3. enable the current conversation's button-visible/manual-work state;
4. send the configured initial Ozon prompt once through the real composer and submit control;
5. if the conversation ID did not exist before sending, observe only the same tab and same AI origin until the new stable ID appears;
6. correlate the navigation/identity change with the pending-start intent;
7. wait for the first assistant response to reach the adapter's established complete/stable state;
8. bind the newly created stable conversation automatically;
9. enable and render fresh extension-owned Ozon buttons for that conversation;
10. clear the pending-start intent.

Behavior when a work session is already active:

- send the configured initial prompt again to the same bound conversation;
- do not create another worker;
- do not clear or replace the binding;
- do not reset quota, `next_allowed_at`, cache, history, alarms, Manual operation state or policy settings;
- do not start Autorun;
- do not duplicate the prompt if the same start action is already pending or submitting.

If a stable conversation ID is available immediately, binding must occur before prompt submission. If it is not available, the pending-start record is tab-scoped and temporary; no fake conversation key may be invented.

### 5.2 New-conversation safety rules

The pending-start flow must fail closed:

- only one pending start per tab;
- include a random start-intent ID and a monotonic revision;
- record the expected AI adapter and normalized origin;
- do not bind if the tab navigates to another origin, another existing conversation, an unsupported page or a mismatching adapter;
- do not bind another tab's conversation;
- do not infer identity from message text;
- do not accept a stale content-script callback from before a navigation/reload;
- a second click while the same start is pending must not send a duplicate prompt;
- on submit failure, response timeout, tab closure or identity mismatch, clear the pending intent and show a recoverable error;
- no Ozon provider request is made by this workflow.

The implementation may use the existing adapter identity, composer readiness, message stability and owner-tab mechanisms. It must not create a second DOM-observer architecture.

### 5.3 `Показать кнопку` / `Убрать кнопку`

This control replaces the user-facing `Ручной режим Ozon` label.

`Показать кнопку`:

- requires an active bound work session;
- enables command acceptance for that conversation;
- asks the current content script to discover the current DOM afresh;
- creates fresh extension-owned Ozon button records and handlers;
- does not send the initial prompt;
- does not create or replace the service worker;
- does not reset provider state.

`Убрать кнопку`:

- immediately stops accepting new button clicks for that conversation;
- stops only the content-script button observation for that conversation;
- destroys extension-owned Ozon button records and handlers;
- removes extension-owned Ozon DOM controls;
- leaves the global MV3 service worker available for popup/settings and other conversations;
- does not cancel an already dispatched provider request;
- does not reset quota, `next_allowed_at`, cache, history, alarms or credentials;
- does not clear the conversation binding;
- does not send a prompt.

The phrase “worker is off” in the operator requirement means the current conversation cannot execute new Ozon commands while its buttons are hidden. It must not be implemented by destroying global extension state required by other tabs.

Hiding buttons is not recovery from a stuck operation. The explicit `Обновить` action exists for that purpose.

### 5.4 `Обновить`

This is an explicit operator recovery command. It must visibly differ from show/hide.

Required observable result:

- a stuck current-conversation Manual operation no longer leaves the popup/button permanently BUSY;
- the service-worker runtime is genuinely renewed or reinitialized through a supported extension lifecycle mechanism;
- stale content-script handlers and old Ozon button records cannot execute;
- the active supported AI page receives a fresh functional content-script/button lifecycle without requiring the user to manually reload the page;
- no command is automatically replayed;
- after recovery, a new valid command can be clicked and completed.

Before runtime renewal, persist an explicit recovery intent and terminalize the current operation according to its durable state:

| Existing state | Required recovery treatment |
|---|---|
| accepted/pending, no provider dispatch | Abort locally as `OPERATOR_REFRESH_BEFORE_PROVIDER`; external request false. |
| quota waiting, no provider dispatch | Abort the current logical operation only; preserve quota state and alarm schedule. |
| provider request marked requesting | Mark `REQUEST_OUTCOME_UNKNOWN_NO_RETRY`; never replay. Preserve the recorded provider timing. |
| provider result stored, delivery not confirmed | Do not call Ozon again. Reconcile or explicitly abandon only the delivery according to the existing no-duplicate delivery contract. |
| guidance/local-only pending | Complete or abort locally; zero provider requests. |

Protected state that must survive `Обновить`:

- Seller and Performance credentials;
- the personal-data setting;
- provider quota families and `next_allowed_at`;
- provider result cache;
- provider request history and no-replay evidence;
- alarms/schedules, rehydrated if the runtime lifecycle requires it;
- initial prompt and report-prefix settings;
- other conversations' bindings, Manual state and Autorun state;
- current conversation binding unless the page identity changed.

The refresh action may clear current-conversation ephemeral operation ownership, DOM watcher state, stale delivery watcher state and stale button records. It must not pretend that a started provider request never happened.

Codex must use its browser environment to prove the chosen MV3 recovery mechanism works on an already open ChatGPT Work page and Alice page. A button repaint without a new functional command path is a failure.

### 5.5 `Завершить работу`

This explicitly ends the current conversation's Ozon work session:

- disable command acceptance;
- remove Ozon buttons and watchers;
- clear the current conversation's active work-session state;
- remove/retire the current explicit binding;
- stop current-conversation Autorun if one exists, using existing terminal/no-replay rules;
- do not delete credentials, global policy, quota, cache, provider history or saved initial prompt text;
- do not affect other tabs/conversations.

If an operation is already requesting, mark its outcome unknown and never replay it. If no provider request was dispatched, abort locally.

After `Завершить работу`, `Показать кнопку` is unavailable because no work session is bound. The next `Начать работу` performs the full start flow and sends the initial prompt.

## 6. Work-session state model

Use an explicit, versioned, per-conversation work-session record instead of deriving session existence from unrelated Manual/Autorun fields.

Minimum logical states:

- `inactive` — no active bound work session;
- `pending_identity` — start prompt is being sent in a new conversation without a stable ID;
- `binding` — stable ID appeared and is being verified/bound;
- `active_visible` — bound and Ozon buttons enabled;
- `active_hidden` — bound but command acceptance/buttons disabled;
- `recovering` — explicit refresh in progress;
- `finishing` — explicit finish in progress;
- `error` — recoverable start/recovery failure with no provider replay.

Every asynchronous callback must carry the work-session/start-intent revision it belongs to. Older revisions cannot mutate a newer session.

## 7. Initial prompt contract

The default start prompt must be short enough for ordinary use but sufficient for an AI that has no prior bridge context. It must state:

- this chat is connected to the store owner's Ozon Bridge;
- only the assistant's `OZON_API_V1` and `OZON_HELP_V1` blocks are read;
- the bridge does not read the user's messages to determine intent;
- exact API and help shapes;
- six semantic clusters with short descriptions;
- invalid attempts may return local guidance;
- personal-data operations require the extension setting;
- mutation/write operations remain unavailable;
- no hidden retry, pagination or automatic command replacement.

Required default content, subject to formatting improvements that preserve meaning:

```text
ЭТО НАЧАЛО РАБОТЫ С OZON BRIDGE.
Этот AI-диалог используется как канал между владельцем магазина и Ozon Seller/Performance API.

Bridge обрабатывает только специальные блоки в ответах ассистента. Он не читает сообщения пользователя для определения нужной операции и не исправляет ошибочную команду автоматически.

Для запроса данных напиши:
OZON_API_V1
{"operation":"разрешённый_alias","params":{}}

Если Bridge попросил выбрать смысловой раздел, ответь ровно одним блоком:
OZON_HELP_V1
{"cluster":"cluster_id"}

Доступные разделы:
- sales_analytics — продажи, выручка и аналитика;
- stock_inventory — текущие остатки;
- search_visibility — поисковые запросы и видимость товаров;
- fulfillment_supply — отправления FBO/FBS и поставки;
- advertising_performance — рекламные кампании и статистика;
- account_access — роли и доступ API-ключа.

Одна OZON_API_V1 команда создаёт не более одного business request. Не передавай URL, host, method, headers или credentials. Не используй mutation/write операции. Не повторяй запрос автоматически после ошибки. Если операция может вернуть личные данные покупателя, она выполнится только когда в расширении включено «Показывать личные данные».
```

The saved per-conversation custom prompt behavior remains supported. Reset-to-default must use the new default text.

## 8. Patch A non-goals

Patch A must not:

- redesign provider operations or guidance classification;
- implement `posting_fbs_get`;
- change personal-data result policy;
- make show/hide reset provider state;
- use refresh as an automatic response to ordinary errors;
- create a new worker per conversation;
- start Autorun when `Начать работу` is clicked;
- bind a conversation without a verified stable identity;
- replay an operation after worker refresh.

---

# Part II — Patch B: configurable personal-data READ policy and queue totality

## 9. Observed live failure and exact root cause

The guidance artifact currently registers:

```js
posting_fbs_get: {
  method: "POST",
  path: "/v3/posting/fbs/get",
  effect: "READ",
  request_style: "json_body",
  execution_enabled: false,
  contract_state: "blocked_customer_pii_surface"
}
```

The failure chain is:

1. `resolveOperation()` accepts the operation because it exists and has `effect: "READ"`.
2. `normalizeCommand()` skips parameter normalization when `execution_enabled !== true` and returns the command as valid.
3. `discoverCommands()` reports `ok:true`.
4. `batchEntryFromDiscovery()` creates a normal pending command entry.
5. capability planning treats it as an ordinary non-subscription-sensitive operation;
6. query planning completes;
7. `prepareProviderQuotaForCommand()` calls `preflightExecution()`;
8. `preflightExecution()` throws `OPERATION_BLOCKED`;
9. that throw occurs outside the result-conversion boundary;
10. the durable queue entry remains pending, no provider request is created, and Manual remains `BUSY`.

Manual show/hide cannot repair this worker-owned state and must not be changed to do so.

## 10. Correct product policy

`posting_fbs_get` is a legitimate Seller READ operation requested with the store owner's credentials. It must not remain permanently unavailable.

Add one global setting:

> **Показывать личные данные**

Default: **OFF**.

When ON:

- configured personal-data READ operations are accepted as ordinary valid READ operations;
- `posting_fbs_get` may call the fixed official endpoint;
- its authorized result may contain recipient/customer fields and is delivered to the bound AI chat;
- diagnostics remain payload-free.

When OFF:

- a personal-data READ command is not sent to Ozon;
- it is completed locally in the batch;
- the AI receives a precise instruction to enable the setting;
- Manual returns to ready after delivery;
- no quota/timing/cache state changes.

Mutation/write operations remain unconditionally blocked. The setting must never enable mutations, arbitrary URLs/methods/headers, credential extraction or operations that are not technically implemented.

## 11. Separate technical readiness from runtime permission

Do not use one boolean for both concepts.

Static contract metadata should distinguish:

- `effect` — READ versus mutation;
- `execution_enabled` or equivalent — the operation is fully implemented and safe to route through fixed transport;
- `policy_group` — for example `standard_read` or `personal_data_read`;
- `default_allowed` — runtime default for that policy group/operation.

After implementation, `posting_fbs_get` is technically enabled but belongs to `personal_data_read`, whose global default is false.

Recommended shape:

```js
posting_fbs_get: {
  provider: "seller_api",
  method: "POST",
  path: "/v3/posting/fbs/get",
  effect: "READ",
  request_style: "json_body",
  execution_enabled: true,
  policy_group: "personal_data_read",
  default_allowed: false,
  contract_state: "official_contract_personal_data_read_v1",
  normalizeParams: normalizePostingFbsGetParams,
  sanitizeResult: authorizedPostingFbsGetResult
}
```

No provider URL, method or credentials come from the AI.

## 12. Storage and settings contract

Add a versioned global policy record in `chrome.storage.local`, for example:

```json
{
  "version": 1,
  "show_personal_data": false,
  "updated_at": "..."
}
```

Requirements:

- missing/invalid legacy storage resolves to false;
- save operations are atomic through the worker;
- content scripts never receive credentials;
- public settings state exposes only the boolean and effective operation availability;
- toggling it does not clear credentials, quota, `next_allowed_at`, cache, history, alarms, bindings or worker state;
- the setting survives normal worker suspension, explicit refresh and extension restart;
- diagnostics may record only the boolean transition, not any personal data;
- credential backup behavior need not change unless Codex deliberately versions the backup schema and keeps v1/v2 imports compatible.

The popup setting must appear near the top-level controls/provider gate, not hidden in diagnostics.

Required explanatory text:

> Если включено, разрешённые READ-запросы могут отправлять данные получателя из Ozon в текущий чат ChatGPT или Алисы. Настройка не разрешает изменение данных или другие write-операции.

## 13. `posting_fbs_get` parameter contract

Implement a strict normalizer from the current official Ozon contract.

Minimum valid command:

```text
OZON_API_V1
{"operation":"posting_fbs_get","params":{"posting_number":"12345678-0001-1"}}
```

Rules:

- `params` must be a JSON object;
- `posting_number` is required, string, trimmed and non-empty;
- reject unknown top-level parameter fields;
- if optional `with` is supported, it must be a JSON object;
- allow only officially documented boolean fields in `with` for the current contract;
- reject non-boolean values;
- preserve existing transport/auth injection rejection;
- do not add pagination, retries, fan-out or lookup by another endpoint;
- one command equals at most one `/v3/posting/fbs/get` business request.

Codex must obtain and retain the official request schema evidence used for the normalizer. It must not ship `normalizePassthroughParams` for this operation.

## 14. Result handling and personal-data boundary

The existing generic `safeReadResult` redacts keys such as `customer`, `addressee`, phone and address. Reusing it unchanged would make the new operation technically execute while still withholding the data the owner explicitly enabled.

Add an operation-specific result policy that:

- validates/sanitizes JSON structure;
- preserves the operational `posting_fbs_get` result, including recipient fields, only for an operation admitted under an ON personal-data policy snapshot;
- continues to strip credentials, Authorization, tokens and transport-control data if ever present;
- never writes full provider payload, full report text, phone, address, name or PIN to diagnostics;
- does not place this result in the analytics result cache;
- stores the minimum durable report required by the existing delivery reconciliation;
- scrubs personal-data report payload from completed operation/batch storage after confirmed delivery while retaining non-sensitive completion metadata and fingerprints.

The data is intentionally delivered to the current bound ChatGPT/Alice conversation when the owner enabled the setting. The popup must disclose that consequence.

## 15. Runtime policy admission

Because `chrome.storage.local` policy is runtime state, do not bury it in static pure command parsing in a way that makes tests or internal normalization nondeterministic.

Use one shared policy resolver in the worker/provider admission boundary. It takes:

- the normalized registered operation;
- immutable operation metadata;
- a normalized policy snapshot.

It returns an explicit decision:

- `allowed`;
- `OPERATION_DISABLED_BY_USER`;
- `NON_READ_OPERATION_REJECTED`;
- `OPERATION_NOT_IMPLEMENTATION_READY`.

Check the policy:

1. when converting discovered commands into durable batch entries;
2. again immediately before provider dispatch.

The second check protects against policy changes while an entry waits behind other commands or quota.

Once a provider request has been atomically marked `requesting` under an allowed policy snapshot, toggling the setting OFF does not cancel or replay that request. The existing request completes under the recorded admission snapshot. The popup must not claim that the toggle cancels an in-flight request.

A locally blocked entry must contain the policy revision/snapshot identifier but no personal data.

## 16. Disabled-result contract

When `Показывать личные данные` is OFF and an AI emits `posting_fbs_get`, return a local guidance/bridge result containing at least:

```json
{
  "status": "personal_data_setting_required",
  "operation": "posting_fbs_get",
  "error": "OPERATION_DISABLED_BY_USER",
  "message": "Операция может вернуть личные данные покупателя. Чтобы выполнить запрос, включите «Показывать личные данные» в настройках Ozon Bridge.",
  "external_request_executed": false,
  "physical_business_request_count": 0
}
```

Requirements:

- no capability probe;
- no quota acquisition/update;
- no cache lookup/write;
- no provider/token request;
- queue entry becomes complete;
- `next_index` advances;
- final delivery uses the existing delivery state machine;
- Manual returns to ready after confirmed delivery;
- Autorun continues according to its existing guidance-round rules;
- enabling the setting later does not automatically replay the blocked command; the AI/operator must submit it again.

This is not `UNSUPPORTED_OPERATION`: the operation exists but is disabled by the owner's current setting.

## 17. Queue totality invariant

The primary fix is correct admission, but the worker must also enforce a general terminal-state invariant:

> Every accepted batch entry must either produce a stored local result, dispatch at most one provider request and store its result, or transition the owner to an explicit terminal error. No thrown exception may leave a pending entry with Manual/Autorun permanently BUSY.

Required defenses:

- convert deterministic policy failures into local completed entries before planning;
- revalidate persisted/legacy pending commands before provider dispatch;
- catch pre-provider exceptions from cache/acquisition/quota/preflight boundaries;
- policy/validation exceptions become local results with zero requests;
- unexpected internal exceptions terminalize the owner with a safe bridge error and no automatic replay;
- never silently swallow errors;
- never advance past a request whose outcome is unknown;
- preserve original batch order in mixed valid/blocked batches.

This defense must recover a persisted old `posting_fbs_get` entry from the broken artifact after upgrade: it becomes a local setting-required result or an allowed execution according to the current setting, rather than remaining pending forever.

## 18. Guidance catalogue changes

Update `fulfillment_supply` to include `posting_fbs_get` as a known personal-data READ operation.

When the setting is ON:

- offer a normal `posting_fbs_get` card and valid template.

When the setting is OFF:

- do not present it as immediately executable;
- guidance may show it as `requires_setting` with the exact setting instruction, but must not provide a misleading claim that it already ran;
- safe ordinary cluster operations remain selectable.

Remove `posting_fbs_get` from the unconditional string `BLOCKED` list. Security classification must use policy/error codes rather than a hard-coded operation-name substring.

Catalogue validation must distinguish:

- technically implemented READ operations;
- currently allowed operations;
- conditionally available personal-data READ operations;
- permanently blocked mutations.

The old test asserting that `posting_fbs_get` is never offered must be replaced with policy-aware ON/OFF tests.

Update the default handshake:

- include `posting_fbs_get` as a conditional Seller READ alias or describe it through the fulfillment cluster;
- remove the statement that it is permanently blocked;
- state that personal-data READ execution requires the extension setting;
- keep mutation/write operations permanently blocked.

## 19. Patch B non-goals

Patch B must not:

- enable any mutation/write endpoint;
- allow arbitrary provider paths or methods;
- infer owner authorization from the AI message;
- store credentials or personal data in diagnostics;
- auto-enable the setting when an AI asks for personal data;
- auto-replay a command after the setting is enabled;
- reset the worker, buttons, quota, timers or cache as error handling;
- modify Work composer control selection;
- conflate personal-data policy with conversation binding.

---

# Part III — Combined behavior, implementation order, and acceptance

## 20. Combined operator flows

### 20.1 New conversation

1. Operator opens a new AI conversation with no stable ID.
2. Operator clicks `Начать работу / Отправить начальный prompt`.
3. Extension sends the prompt once.
4. Stable conversation ID appears.
5. Extension verifies and binds it automatically.
6. First assistant response completes.
7. Ozon buttons become visible and functional.
8. No Ozon request has occurred merely from starting/binding.

### 20.2 Existing conversation

1. Stable ID already exists.
2. Start binds immediately, enables buttons and sends the prompt.
3. Clicking Start again only resends the prompt.
4. Same binding and protected provider state remain.

### 20.3 Hide and show

1. Hide removes buttons and prevents new current-conversation commands.
2. Existing provider state and worker scheduling remain intact.
3. Show performs fresh DOM discovery and creates functional new buttons.
4. No initial prompt is sent.

### 20.4 Personal-data request while OFF

1. AI emits valid `posting_fbs_get`.
2. Operator clicks Ozon.
3. Bridge performs zero external requests.
4. AI receives the setting-required explanation.
5. Button becomes ready again.
6. Operator may enable the setting and explicitly click/submit a new command.

### 20.5 Personal-data request while ON

1. Operator enables `Показывать личные данные`.
2. AI emits valid `posting_fbs_get` with a posting number.
3. Bridge executes exactly one fixed Seller READ request.
4. Authorized result is delivered only to the bound conversation.
5. Diagnostics contain no result payload or personal fields.
6. Durable personal payload is scrubbed after confirmed delivery.

### 20.6 Explicit refresh after a stuck state

1. Operator clicks `Обновить`.
2. Current operation is terminalized according to whether provider dispatch occurred.
3. Runtime/UI lifecycle is genuinely renewed.
4. Protected provider state remains.
5. No operation is replayed.
6. A fresh button executes the next explicit command successfully.

### 20.7 Finish

1. Operator clicks `Завершить работу`.
2. Buttons disappear, command acceptance stops and binding is retired.
3. Global credentials/settings/provider timing survive.
4. A later Start creates/binds a new work session and sends the prompt.

## 21. Required implementation sequence

### Patch A

1. Baseline extraction and regression.
2. Versioned work-session/pending-start state model.
3. Start flow for an existing ID.
4. Start flow for a missing ID with strict tab/origin correlation.
5. Show/hide control replacement and fresh button lifecycle.
6. Explicit refresh state transition and real browser recovery.
7. Finish/unbind flow.
8. Default prompt update.
9. ChatGPT, Work and Alice browser matrix.
10. Package a Patch A artifact with fresh-extract verification.

### Patch B

1. Baseline extraction and reproduction of stuck `posting_fbs_get`.
2. Static operation-readiness versus runtime-policy model.
3. Global setting/storage/public state/UI.
4. Strict `posting_fbs_get` request normalizer.
5. Authorized result policy and post-delivery scrubbing.
6. Admission checks and disabled local result.
7. General queue-totality defense and legacy pending-entry recovery.
8. Policy-aware guidance catalogue and prompt text.
9. OFF/ON/mixed-batch/browser tests.
10. Package a Patch B artifact with fresh-extract verification.

### Integration

1. Create integration branch from the shared baseline.
2. Apply reviewed Patch A and Patch B commits.
3. Resolve popup/worker/runtime overlaps according to this specification.
4. Run every patch-specific test.
5. Run combined sequential scenarios.
6. Produce a new integrated artifact, SHA-256 and exact file inventory.

## 22. Patch A acceptance matrix

Required deterministic/browser gates include:

```text
WORK_SESSION_EXISTING_ID_BIND_BEFORE_PROMPT_PASS
WORK_SESSION_NEW_CHAT_PROMPT_THEN_AUTO_BIND_PASS
WORK_SESSION_PENDING_START_SINGLE_FLIGHT_PASS
WORK_SESSION_WRONG_NAVIGATION_FAIL_CLOSED_PASS
WORK_SESSION_START_DURING_ACTIVE_ONLY_RESENDS_PROMPT_PASS
WORK_SESSION_START_DOES_NOT_ENABLE_AUTORUN_PASS
WORK_SESSION_HIDE_STOPS_NEW_COMMANDS_PASS
WORK_SESSION_SHOW_BINDS_FRESH_FUNCTIONAL_BUTTON_PASS
WORK_SESSION_HIDE_SHOW_PRESERVES_PROVIDER_STATE_PASS
WORK_SESSION_REFRESH_RENEWS_RUNTIME_AND_UI_PASS
WORK_SESSION_REFRESH_PENDING_ABORT_ZERO_REQUEST_PASS
WORK_SESSION_REFRESH_REQUESTING_NO_REPLAY_PASS
WORK_SESSION_REFRESH_PRESERVES_QUOTA_TIMERS_PASS
WORK_SESSION_FINISH_UNBINDS_AND_DISPOSES_UI_PASS
WORK_SESSION_OTHER_CONVERSATIONS_UNCHANGED_PASS
WORK_SESSION_CHATGPT_BROWSER_PASS
WORK_SESSION_CHATGPT_WORK_BROWSER_PASS
WORK_SESSION_ALICE_BROWSER_PASS
WORK_COMPOSER_SUBMIT_AND_DICTATION_REGRESSION_PASS
```

## 23. Patch B acceptance matrix

Required gates include:

```text
PERSONAL_DATA_SETTING_DEFAULT_OFF_PASS
PERSONAL_DATA_SETTING_PERSISTS_WORKER_RESTART_PASS
POSTING_FBS_GET_STRICT_PARAMS_PASS
POSTING_FBS_GET_OFF_LOCAL_SETTING_REQUIRED_PASS
POSTING_FBS_GET_OFF_ZERO_PROVIDER_CALLS_PASS
POSTING_FBS_GET_OFF_MANUAL_READY_AFTER_DELIVERY_PASS
POSTING_FBS_GET_ON_SINGLE_FIXED_READ_REQUEST_PASS
POSTING_FBS_GET_ON_AUTHORIZED_RESULT_PASS
POSTING_FBS_GET_DIAGNOSTICS_NO_PAYLOAD_PASS
POSTING_FBS_GET_DURABLE_PAYLOAD_SCRUBBED_PASS
POSTING_FBS_GET_NO_ANALYTICS_CACHE_PASS
PERSONAL_DATA_POLICY_RECHECK_BEFORE_DISPATCH_PASS
PERSONAL_DATA_IN_FLIGHT_SNAPSHOT_NO_CANCEL_NO_REPLAY_PASS
LEGACY_PENDING_BLOCKED_ENTRY_RECOVERY_PASS
BATCH_TOTALITY_PREPROVIDER_THROW_TERMINAL_PASS
MIXED_VALID_AND_PERSONAL_DATA_BLOCKED_ORDER_PASS
GUIDANCE_PERSONAL_DATA_POLICY_OFF_PASS
GUIDANCE_PERSONAL_DATA_POLICY_ON_PASS
MUTATIONS_REMAIN_HARD_BLOCKED_PASS
PERSONAL_DATA_TOGGLE_PROTECTED_STATE_BYTE_EQUAL_PASS
```

No live personal data may be committed to repository fixtures. Browser/provider validation must use the owner's authorized environment and publish only sanitized evidence.

## 24. Integration acceptance matrix

At minimum:

1. Start in a new ChatGPT Work conversation with no ID, auto-bind and show buttons.
2. Execute three ordinary local guidance/valid command deliveries consecutively.
3. Hide and show; execute through the fresh button.
4. With personal data OFF, submit `posting_fbs_get`; receive local explanation and return to ready.
5. Enable the setting; submit a new authorized request; get exactly one provider request.
6. Confirm diagnostics and exported evidence contain no personal payload.
7. Trigger a synthetic pending stuck operation, press Refresh, and prove fresh execution works without timing reset.
8. Finish work, prove unbound/no buttons, then Start again and prove prompt/binding lifecycle.
9. Repeat the non-live parts in Alice.
10. Prove other conversations and protected global state are unchanged.

Expected final gates:

```text
INTEGRATED_SESSION_AND_PERSONAL_DATA_CHATGPT_WORK_PASS
INTEGRATED_SESSION_AND_PERSONAL_DATA_ALICE_PASS
INTEGRATED_THREE_CONSECUTIVE_DELIVERIES_PASS
INTEGRATED_REFRESH_THEN_FRESH_COMMAND_PASS
INTEGRATED_NO_PROVIDER_REPLAY_PASS
INTEGRATED_PROTECTED_STATE_BYTE_EQUAL_PASS
FRESH_EXTRACT_INTEGRATED_ARTIFACT_VERIFY_PASS
```

## 25. Files expected to change

Patch A likely changes:

- `popup.html`;
- `popup.js`;
- `popup.css` only for required layout/state presentation;
- `content_script.js`;
- `service_worker.js`;
- `shared/runtime_names.js`;
- existing state-model/shared modules if they are the correct ownership boundary;
- targeted tests and build metadata.

Patch B likely changes:

- `popup.html`;
- `popup.js`;
- `service_worker.js`;
- `shared/runtime_names.js`;
- `shared/ozon_contract.js`;
- `shared/ozon_guidance.js`;
- provider/result validation only if required by the existing module boundary;
- targeted tests and build metadata.

Do not change unrelated Telegram bots, Avito tooling, other bridges or repository applications.

## 26. Required final reports from Codex

For each patch and the integration artifact, report:

- exact base branch and commit;
- branch and final commit sequence;
- root cause addressed;
- files changed and why;
- state transitions added;
- exact persistence keys/schema and migration defaults;
- exact behavior for pending/requesting/delivering recovery;
- exact policy behavior with personal data OFF and ON;
- proof that mutations remain blocked;
- deterministic test output;
- browser evidence for ChatGPT Work and Alice;
- protected-state before/after hashes or byte comparisons;
- confirmation of zero replay;
- artifact path, SHA-256 and fresh-extract file inventory;
- explicit list of any required live test that was not run.

Codex must not claim acceptance if the mandatory browser matrix or live authorized `posting_fbs_get` proof has not been completed.

## 27. Definition of done

The combined feature is done only when:

- a new conversation can be started and bound without the operator manually creating an ID first;
- Start always sends the handshake but never silently starts Autorun or resets worker/provider state;
- show/hide controls only current-conversation command availability and fresh UI buttons;
- explicit Refresh genuinely recovers a stuck worker/UI lifecycle without replay or timing loss;
- Finish completely retires the current work session and binding;
- `posting_fbs_get` is a fully implemented fixed-path READ operation;
- personal-data execution is OFF by default and enabled only by the explicit global setting;
- OFF returns a local setting instruction and never contacts Ozon;
- ON allows the authorized result in the bound AI chat while keeping diagnostics clean;
- no queue entry can remain pending forever after a deterministic local/pre-provider failure;
- mutation/write security boundaries remain unchanged;
- all prior Work composer, guidance, valid-command, quota/cache and no-replay regressions pass;
- the final integrated artifact is freshly extracted and verified byte-for-byte.
