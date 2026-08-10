# Universal LLM ↔ API Bridge Protocol

Версия архитектурного контракта: 0.1
Дата: 2026-08-10
Статус: **design contract для Yandex/Ozon/WB provider bridges**

## 1. Цель

Один локальный browser-extension pattern должен позволять любому поддержанному LLM-интерфейсу выполнять строго разрешённые API-read operations от имени владельца аккаунта, не раскрывая LLM секреты.

LLM может быть ChatGPT, Alice, DeepSeek или другой UI-поверхностью. Provider может быть Yandex Wordstat, Ozon Seller API, Wildberries API и далее.

## 2. Разделение слоёв

### LLM adapter

Отвечает только за:

- conversation identity;
- capture локального writing/code block;
- manual trigger;
- autorun watcher;
- composer delivery;
- Send confirmation/reconciliation;
- DOM-specific selectors/adapters.

Он **не знает API credentials** и не конструирует Authorization headers.

### Provider adapter

Отвечает только за:

- command parser/schema;
- operation alias → fixed HTTP method + fixed official host/path;
- local credentials;
- provider rate-limit semantics;
- request body/query construction;
- response size/time limits;
- result envelope;
- provider-specific error normalization.

Он **не доверяет URL/path/method из assistant text**.

## 3. Command families

Provider-specific prefixes:

- `WORDSTAT_API_V1`
- `OZON_API_V1`
- `WB_API_V1`

Result prefixes:

- `WORDSTAT_RESULT_V1`
- `OZON_RESULT_V1`
- `WB_RESULT_V1`

Marketplace command shape conceptually:

    OZON_API_V1
    {
      "operation": "analytics_data",
      "params": { ... }
    }

or:

    WB_API_V1
    {
      "operation": "sales_funnel_products",
      "params": { ... }
    }

`operation` is a symbolic alias from hardcoded provider allowlist. Assistant cannot supply `url`, `host`, `Authorization`, raw HTTP method or arbitrary headers.

## 4. One command = one provider HTTP request

Hard invariant for v1 marketplace bridges:

> One accepted `*_API_V1` block executes at most one external provider HTTP request.

No hidden:

- retry;
- page loop;
- fan-out over products;
- fan-out over warehouses;
- multi-endpoint workflow.

If pagination is needed, response exposes the cursor/offset/next token and the LLM emits the next explicit command.

If analysis requires 30 endpoints, autorun may execute 30 sequential assistant-generated commands, but each command/result pair remains independently observable, attributable and recoverable.

This deliberately follows the proven Wordstat exactly-once philosophy and prevents an innocent-looking command from hiding an unbounded API crawl.

## 5. Read-only default

Provider allowlist has explicit effect metadata:

- `READ`
- future `WRITE` / `MUTATION`

Marketplace v1 ships **READ only**.

Even if provider credential itself has administrator permissions, extension rejects all operations not compiled into read allowlist.

Mutation support requires a separate architecture/security decision and cannot be enabled by assistant prose.

## 6. Credentials

Credentials:

- are entered only in extension popup/settings;
- stored in `chrome.storage.local` under provider-specific keys;
- are read only by service worker/provider adapter;
- never sent to content script;
- never rendered back in popup after save;
- never appear in command/result/diagnostics;
- never enter repository/source ZIP.

Popup exposes only safe state such as `has_api_key`, `has_client_id`, `token_category_present`, last safe connection-test status and key expiry date if the user supplies/extension derives it safely.

## 7. Multiple credential slots

Provider credential model may be multi-slot:

### Ozon

Initial Seller API slot:

- Client-Id
- Api-Key

Advertising API gets a separate slot if official current API requires separate auth.

### Wildberries

WB uses token categories and multiple service domains. Store category-scoped token slots, for example:

- Content
- Prices and Discounts
- Marketplace
- Analytics
- Statistics
- Promotion
- Finance
- optional Feedbacks/Questions/etc.

The same token value may be supplied to multiple categories by user if their WB token supports them, but storage/schema still models required category explicitly.

## 8. Result envelope

Marketplace result keeps raw provider payload as evidence while adding safe transport metadata:

    OZON_RESULT_V1
    {
      "bridge": "ozon-llm-api-bridge",
      "version": "...",
      "request_id": "uuid",
      "operation": "analytics_data",
      "command": { ...normalized command... },
      "request_meta": {
        "provider": "ozon",
        "host_alias": "seller_api",
        "http_method": "POST",
        "path_alias": "analytics_data"
      },
      "http_status": 200,
      "elapsed_ms": 123,
      "pagination": { ...safe next-page metadata... },
      "rate_limit": { ...safe response metadata if available... },
      "result": { ...provider response... }
    }

Important:

- never echo secret header values;
- raw provider result remains distinguishable from bridge metadata;
- bridge must not silently “improve” or reinterpret provider payload;
- analytical conclusions happen in LLM/research layer, not inside raw result.

## 9. Binary/report responses

Some provider endpoints return ZIP/CSV/PDF.

V1 policy:

- extension enforces a configured maximum byte size;
- response metadata includes MIME type and byte size;
- for analytical CSV/ZIP, provider adapter may decode only via a separately reviewed deterministic parser;
- original bytes/hash must remain evidence-addressable if data is transformed;
- PDF/labels/documents are not automatically dumped into chat if they are operational rather than analytical.

Generated-report APIs (create → status → download) are three explicit API operations, never one hidden polling loop.

## 10. Pagination contract

Every paginated operation defines:

- page/cursor input fields;
- provider max page size;
- next-page metadata extraction;
- terminal condition.

No automatic page traversal in primitive v1.

Example analytical flow:

`cards_list(cursor=null)` → result has next cursor → LLM emits `cards_list(cursor=...)` → repeat until terminal.

This preserves exact request accounting and prevents infinite loops.

## 11. Rate limits

Each operation definition stores known official limits where stable/documented.

Runtime rules:

- no automatic retry on `429`;
- `Retry-After` or provider-specific timing may be returned in safe result metadata;
- autorun stops/fails closed on rate-limit error unless future explicit scheduling logic is separately designed;
- no busy-loop polling.

## 12. Manual mode

Manual mode follows proven Wordstat semantics:

- conversation-scoped;
- native local Copy remains native Copy;
- provider manual decoration identifies armed local block controls;
- command is parsed only after real local trigger;
- invalid/non-provider block creates no API request;
- duplicate in-flight operation fenced;
- accepted operation has durable worker-visible ownership until delivery completes/fails.

Provider-specific visual accent may differ, but mechanics do not.

## 13. Autorun

Autorun follows proven reference state model:

- `starting`
- `waiting_command`
- `requesting`
- `delivering`
- `paused`
- `stopped`
- `error`

Requirements:

- Start / Pause / Resume / Finish;
- manual ↔ autorun mutual exclusion;
- assistant baseline before watch;
- stable new block capture;
- exactly one operation grant on `WAITING_COMMAND → REQUESTING` transition;
- stable delivery id;
- commit-before-click for result delivery;
- worker restart recovery;
- unknown request outcome is never replayed automatically;
- duplicate tab ownership rules;
- delivery confirmation before sequence increment.

## 14. Cross-LLM adapters

Provider core must not import ChatGPT-specific DOM code.

Target layout:

    shared/
      runtime/
      provider_contract/
      llm_adapters/
        chatgpt/
        alice/        # future
        deepseek/     # future

A provider package declares supported LLM adapters in manifest/config. Adding Alice/DeepSeek means implementing capture/composer/send/conversation identity for that UI; provider API implementation and credentials remain unchanged.

No LLM adapter may get direct credential access.

## 15. Evidence and analytics

Every marketplace API result should be savable into research data flow:

`raw provider result → normalized marketplace observation → Product/SKU/Listing/Stock/Order/Ad/Finance layer → derived diagnostic analysis`

Never mix LLM inference into raw result.

A causal statement such as:

`sales decline was probably driven by FBO stockout`

must link to independent observations such as:

- stock timeline;
- regional/warehouse availability;
- ad delivery timeline;
- funnel/order timeline;
- price/promo state;
- return/cancel changes.

## 16. Full-store analytical run

When user asks “собери всю статистику за неделю и найди причину просадки”, LLM performs an explicit diagnostic plan, for example:

1. identify complete current SKU/listing set;
2. collect comparison-period funnel/orders/sales;
3. detect products contributing most to delta;
4. for those products collect stocks/history/regions;
5. collect price/promotion state;
6. collect advertising campaign + product/query statistics;
7. collect cancellations/returns;
8. reconcile finance;
9. drill into supply/warehouse cause where indicated;
10. produce ranked causal hypotheses with evidence and uncertainty.

The bridge is an evidence transport, not the analyst. The LLM chooses next query based on prior results.

## 17. Safety acceptance gate for each provider

Provider extension is not accepted until all are tested:

- invalid command → zero external requests;
- unsupported operation → zero requests;
- arbitrary URL/path/header injection rejected;
- credentials never reach content script/result/log;
- manual accepted command → exactly one request;
- concurrent duplicate → exactly one request;
- autorun sequential operations → exactly one request each;
- HTTP 4xx/5xx/429 → no hidden retry;
- page 2 executes only after explicit page-2 command;
- delivery failure after request does not replay provider request;
- worker restart during unknown request does not replay;
- reload can recover committed result delivery;
- second tab cannot steal live owner; can rebind only after owner loss according to reference rules;
- popup temporary busy state releases correctly;
- stale last_status cannot overwrite current action result;
- Unicode request/response survives exactly;
- fresh packaged ZIP re-tested in real Chromium.
