# LLM API Bridges — protocol and security contract v1

Дата: 2026-08-10
Статус: **canonical design contract before Ozon/WB implementation**

## 1. Цель

Один локальный browser-extension toolkit должен позволять любому поддержанному LLM управляемо вызывать allowlisted read-only API провайдеров и возвращать структурированный result в тот же диалог.

LLM может быть ChatGPT, Alice, DeepSeek или другая поверхность. Provider adapter не должен зависеть от DOM конкретной LLM.

## 2. Слои

### LLM adapter

Отвечает только за:

- conversation identity / explicit binding;
- обнаружение exact command block;
- manual trigger / autorun watcher;
- безопасную доставку result;
- ownership/recovery around browser state.

### Provider adapter

Отвечает только за:

- command schema;
- credential storage/read inside worker;
- endpoint/method allowlist;
- request serialization;
- rate/history/pagination constraints;
- response size and normalization envelope.

Никакой provider credential не передаётся LLM adapter/content script.

## 3. Protocol families

- `WORDSTAT_API_V1` → `WORDSTAT_RESULT_V1`
- `OZON_API_V1` → `OZON_RESULT_V1`
- `WB_API_V1` → `WB_RESULT_V1`

Command block состоит из protocol marker + one JSON object.

Result marker соответствует provider family и содержит evidence envelope.

## 4. Operation vs HTTP request

Базовый invariant:

> Один accepted command создаёт ровно одну logical operation.

Logical operation бывает двух типов.

### `single_request`

Ровно один provider HTTP call.

### `collector`

Явно объявленная high-level read-only операция, которой для полноты нужны pagination/report calls.

Collector разрешён только если:

- operation name hardcoded;
- maximum scope bounded;
- каждый underlying HTTP call перечислен в result evidence;
- page/report continuation детерминирован;
- partial failure явно возвращается;
- collector не маскирует стоимость/лимиты/число вызовов;
- никакой write side effect отсутствует.

Нельзя выдавать batch arbitrary requests от LLM.

## 5. Exactly-once semantics

Exactly-once относится к **accepted logical operation claim**.

Worker должен атомарно переводить operation из `waiting/ready` в `requesting` до network side effect. Повторный тот же operation/request identity не получает второй grant.

Для collector внутри одного operation каждый page step имеет стабильный `step_id` и durable progress.

Если service worker умер после отправки HTTP request и до фиксации результата, неизвестный outcome **не повторяется автоматически**. Operation становится `outcome_unknown`/fail-closed, если provider request не является доказуемо idempotent/read-safe для восстановления. Даже для read request скрытый replay не допускается в v1: модель должна видеть, что нужна новая явная операция.

## 6. Manual / Autorun

Сохраняем proven Wordstat lifecycle:

- explicit conversation binding;
- Manual and Autorun active ownership mutually exclusive;
- durable manual operation ownership persists even if toggle switched off mid-delivery;
- Autorun Start/Resume fails while manual operation is active;
- Pause/Finish never duplicate already-started provider operation;
- duplicate tabs cannot steal active ownership while current owner is alive;
- dead owner may rebound only for exact bound conversation.

## 7. Credentials

Credentials:

- вводятся пользователем в popup;
- сохраняются в `chrome.storage.local` provider-specific keys;
- never returned in popup after save except `has_credentials`/safe fingerprint;
- never sent to content script;
- never accepted from LLM command;
- never included in result, diagnostics, logs, ZIP test fixtures or GitHub;
- only service worker builds auth header immediately before allowlisted request.

Provider examples:

- Yandex: API key + folderId local settings;
- Ozon: `Client-Id` + `Api-Key` local settings;
- WB: WB API token local settings.

## 8. Read-only v1

Ozon/WB v1 production allowlist contains only GET/read/report retrieval operations.

Even if official API exposes:

- price change;
- stock change;
- campaign start/stop;
- bid change;
- answer to review/question;
- order mutation;

such methods are out of scope until a separate decision, threat model and confirmation UX are approved.

## 9. Network allowlist

No arbitrary URL transport.

Each provider has hardcoded official hosts. Command contains an operation name, never a URL or free-form HTTP method.

Provider adapter maps:

`operation → HTTP method + exact path + request validator`.

Redirect to a non-allowlisted host fails closed.

## 10. Request validation

Before fetch validate:

- operation allowlist;
- scalar/string bounds;
- enum values;
- identifier count limits;
- period bounds;
- pagination size bounds;
- date/time format;
- response projection/field list where applicable;
- no header/body key can override credentials/base host.

## 11. Result evidence envelope

Minimum result fields:

- bridge/provider name;
- runtime version;
- `operation_id` / `request_id`;
- exact sanitized command;
- operation name/type;
- safe account fingerprint;
- started/completed timestamps;
- elapsed time;
- final status;
- provider request trace array;
- pagination/report state;
- raw provider result or bounded normalized result;
- truncation/partial flags;
- errors.

Each provider request trace records minimum:

- stable `step_id`;
- official host/path/method;
- sanitized parameters/body summary;
- HTTP status;
- elapsed ms;
- provider request-id header/body if exposed;
- page/cursor/report id;
- result byte/count metadata.

No auth headers.

## 12. Pagination

Never silently return first page as if complete.

Operation declares one of:

- `page_mode: single`;
- `page_mode: auto_collect` with verified official bounds;
- `page_mode: continuation` returning a stable continuation command token.

For a ~70 SKU store, safe collectors may normally collect all catalog pages, but very large analytics/finance responses need bounded periods and/or continuation.

## 13. Rate limits

Rate limiter is provider + endpoint-group aware.

Official rate limits are stored as metadata in provider operation registry. The worker may delay **before a not-yet-sent read request** to respect a known minimum interval, but it must not silently retry a failed request.

HTTP 429:

- operation/step records the 429;
- no automatic retry-loop;
- `Retry-After` may be reported if provided;
- caller/LLM decides next explicit action.

## 14. Async report jobs

Some APIs expose create → status → download workflows.

A collector may encapsulate this only when protocol explicitly declares it as an async report operation. Evidence must show:

- create request;
- report/job ID;
- every status poll;
- poll intervals;
- terminal status;
- download request.

Polling is bounded by max polls + max wall time. Timeout returns incomplete operation; it does not spin forever.

## 15. Response size

Each provider defines:

- max single HTTP response bytes;
- max total collector bytes;
- max rows/items;
- max pages.

If complete result exceeds safe delivery size:

- persist full raw result locally/evidence layer where implemented;
- deliver summary + continuation/reference metadata;
- never silently truncate JSON while marking success complete.

## 16. Composer delivery

Use proven worker-owned single-flight delivery:

- outgoing result committed before browser click;
- one delivery owner;
- user composer text is not overwritten;
- one Send grant/click;
- no click retry-loop;
- confirmed user turn completes delivery idempotently;
- reload recovery re-delivers committed report only; it never replays provider API.

## 17. Diagnostics

Diagnostics must make causal failures visible:

- command rejected before fetch;
- credentials missing/invalid;
- entitlement/subscription unavailable;
- rate limited;
- network/timeout;
- provider HTTP error;
- partial pagination;
- report generation pending/failed;
- result delivery blocked;
- operation outcome unknown.

Secrets and full sensitive response bodies are never diagnostic strings.

## 18. Analytics collector principle

LLM requests such as «собери всю статистику за неделю и найди причину падения продаж» do not map to one arbitrary mega-request.

The LLM issues a governed sequence of allowlisted collectors. For example:

`identity → catalog/status → prices → stocks → funnel/search → orders/sales → returns → ads → finance → customer evidence`

Every collector result is evidence. Final analysis joins by canonical marketplace/product/SKU/warehouse/campaign IDs and compares periods.

## 19. Acceptance gate for each new provider

Provider bridge is not accepted until:

1. official operation registry documented;
2. credential isolation source guards pass;
3. arbitrary URL/method rejection pass;
4. every allowlisted operation parser/transport branch tested;
5. pagination/report continuation tested;
6. concurrency/exactly-once matrix passes;
7. worker restart/recovery tests pass;
8. duplicate-tab/conversation binding tests pass;
9. popup lifecycle tests pass;
10. fresh ZIP source identity/syntax checks pass;
11. real Chromium MV3 E2E with provider mock passes;
12. real owner-account smoke proves credentials and representative read operations without writes.

Wordstat v1.1.5 is the lifecycle oracle for common browser-side behavior; provider-specific API semantics come only from each provider's official docs/live API.
