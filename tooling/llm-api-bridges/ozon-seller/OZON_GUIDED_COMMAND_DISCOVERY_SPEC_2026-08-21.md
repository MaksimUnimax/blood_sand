# Ozon Bridge v0.1.19 — Guided Command Discovery and Clustered Command Help

Date: 2026-08-21  
Status: implementation specification; design only; no production code changes are authorized by this document  
Repository: `MaksimUnimax/blood_sand`  
Design branch: `design/ozon-guided-command-discovery-2026-08-21`  
Production baseline branch: `fix/ozon-work-composer-control-2026-08-21`

## 1. Purpose

This document is the implementation authority for a guided command-discovery feature for Ozon Bridge v0.1.19.

The target problem is not ordinary Ozon request execution. The existing bridge already executes valid `OZON_API_V1` commands. The problem is that different web AI products invent different command names and envelopes when they do not remember or understand the bridge contract.

Observed Alice example:

```text
OZON_API_V1
{
  "method": "performance/v2/order",
  "params": {
    "date_from": "2026-08-10",
    "date_to": "2026-08-17"
  }
}
```

After the bridge correctly rejected `method`, Alice guessed another invalid command:

```text
OZON_API_V1
{
  "operation": "get_orders_performance",
  "args": {
    "date_from": "2026-08-10",
    "date_to": "2026-08-17"
  }
}
```

The existing bridge can report that these commands are invalid, but it does not tell the AI which supported bridge commands are relevant. The AI then continues guessing.

The feature specified here must turn an invalid or unknown AI-authored Ozon attempt into a bounded, read-only command-discovery dialogue:

1. inspect only the AI-authored attempted command received through the existing bridge path;
2. never read the user's message for intent classification;
3. never execute, rewrite, substitute or auto-correct an invalid command;
4. when the likely semantic cluster is clear, return only the command options for that cluster;
5. when the cluster is unclear, return a cluster-selection question;
6. let the AI select a cluster using a local, non-provider help marker;
7. return the supported commands for the selected cluster with short descriptions and valid command shapes;
8. let the AI choose and emit the final `OZON_API_V1` command;
9. execute only that later, explicit, valid command through the existing provider path.

The bridge remains a data bridge, not an AI and not an autonomous query generator.

## 2. Baseline that must be preserved

The implementation must start from the exact current production artifact:

`tooling/llm-api-bridges/ozon-seller/artifacts/OZON_BRIDGE_v0.1.19_WORK_COMPOSER_CONTROL_LIFECYCLE_FIX_2026-08-21.zip`

Artifact SHA-256:

`232389f1bfbe2a78c5ea41d78d0942b0b7d6bb872cdea296f75326c72c0da901`

Important production baseline hashes:

- `service_worker.js`: `47dcdd04b8a795e5bda5af77fe3ba62748cbde991395b7f1a2253f872249c8ba`
- `content_script.js`: `193d16562ed89580b2fa34b030390b727828055d0e15beb4dcbef35da052a64e`
- `shared/ozon_contract.js`: `0663df6525f275f29021151efaf83d6a569f8a951c9af9387e820d2a49b59cf5`
- `shared/runtime_names.js`: `9eee534015485eb46f47d5528a577be02707669f543a90014481d94115fbb126`
- `shared/ai_adapters.js`: `5a7307557998d4281d12fb750fb0d05fa787d2a4550281d006ebbc6a2006e4e9`

Codex must re-extract this artifact before implementation and verify the artifact SHA-256 and all 17 production files. The extracted files, not an older reference snapshot, are the production starting point.

Relevant existing repository authorities:

- `tooling/llm-api-bridges/ozon-seller/README.md`
- `tooling/llm-api-bridges/ozon-seller/OZON_BRIDGE_CURRENT_HANDOFF_2026-08-17.md`
- `tooling/llm-api-bridges/ozon-seller/OZON_BRIDGE_ROADMAP_2026-08-17.md`
- `tooling/llm-api-bridges/ozon-seller/OZON_BRIDGE_DEVELOPMENT_WORKFLOW_2026-08-17.md`
- `tooling/llm-api-bridges/ozon-seller/OZON_BRIDGE_PRODUCT_DIRECTION_2026-08-13.md`
- `tooling/llm-api-bridges/ozon-seller/validation/LIVE_TEST_INDEX_2026-08-20.md`

## 3. Current architecture that Codex must understand before editing

### 3.1 AI DOM adapters

`shared/ai_adapters.js` supports ChatGPT and Alice separately.

It identifies assistant messages, user messages, message IDs, code blocks, Copy controls, composer state and completion state. The content script does not use user-message content to determine what Ozon data is required.

### 3.2 Manual mode

In Manual mode, `content_script.js` places an extension-owned `Ozon` button beside structurally detected assistant code blocks. The button is intentionally independent of whether the block contains a valid bridge command.

On click:

1. `handleCopy(binding)` reads the current raw text of that exact code block;
2. it sends `OZ_EXECUTE_COMMAND` with `command_text`, `conversation_key` and a new `manual_request_id`;
3. `service_worker.js` passes that text to the common discovery/parser/queue path;
4. the final report is delivered back into the same bound AI conversation through the existing delivery state machine.

For Manual mode, the worker normally receives only the selected code-block text, not the surrounding assistant prose. The new classifier must therefore not depend on surrounding prose.

### 3.3 Autorun mode

In Autorun, `content_script.js` watches completed assistant messages after the established baseline. It currently accepts a candidate only when the full assistant message contains `OZON_API_V1`.

The full assistant text is sent through `OZ_AUTO_MESSAGE_READY`. `service_worker.js` uses the same `discoverBatchEntries()` and `OzonContract.discoverCommands()` path as Manual mode.

The new help marker must be supported by Autorun without creating a second independent execution architecture.

### 3.4 Contract and provider boundary

`shared/ozon_contract.js` is the source of truth for:

- the exact `OZON_API_V1` envelope;
- enabled and blocked operation aliases;
- parameter normalization and validation;
- fixed provider, method and path selection;
- transport/auth injection rejection;
- PII redaction;
- Seller subscription/capability planning;
- provider request building;
- response validation and safe error formatting.

The provider transport, credential code, request builders, quota scheduler and result cache must not be used by guidance-only work.

### 3.5 Existing discovery behavior

`OzonContract.discoverCommands()` scans for `OZON_API_V1`, extracts a balanced JSON object, parses it, normalizes it, and returns either a valid command or a pre-execution error.

Current invalid discoveries are converted by `batchErrorEntry()` into `pre_execution_error` entries. `processBatchQueue()` formats those entries as ordinary zero-request bridge errors. This is the correct integration point for enriching selected discovery/validation failures with command guidance.

## 4. Non-goals

The implementation must not:

- read or classify user messages;
- call any LLM or external classification service;
- send raw assistant text to any new server;
- automatically repair and execute an invalid command;
- automatically choose an Ozon command on behalf of the AI;
- execute a provider request during cluster discovery or help selection;
- add write/mutation operations;
- expose blocked `posting_fbs_get` as an available option;
- expose customer PII;
- accept AI-controlled URL, host, HTTP method, headers or credentials;
- change the existing Seller/Performance provider transport;
- reset or recreate the service worker as a feature mechanism;
- clear provider quota, `next_allowed_at`, cache, request history, alarms, Manual ownership or Autorun state;
- replace the existing exact validation errors with vague prose;
- require a complete operation manual in the initial handshake prompt.

## 5. Enabled operation inventory and required clusters

The current registry contains 12 enabled read-only operations and one deliberately blocked read surface.

Every enabled operation must belong to exactly one semantic cluster. A coverage test must fail if a later enabled operation is unclustered or assigned to more than one cluster.

### 5.1 `sales_analytics` — Sales and business analytics

User-facing description:

> Revenue, ordered units, returns, cancellations, delivery counts, product/category breakdowns and period comparisons from Seller analytics.

Operations:

- `analytics_data`

Important command families to describe:

- revenue by day/week/month;
- revenue plus ordered units;
- product/SKU breakdown;
- delivered units, returns or cancellations when the seller subscription permits them;
- period totals and comparisons.

The guide must clearly distinguish universally available metrics (`revenue`, `ordered_units`) from metrics/dimensions that may require a qualifying subscription. It must not promise detailed order/customer records. The observed phrase “sales for a week” should lead here.

### 5.2 `stock_inventory` — Products and current stock

User-facing description:

> Current stock for products selected by product ID or offer ID.

Operations:

- `stocks_current`

The guide must explain that this is current inventory, not historical sales and not a general product-card catalogue.

### 5.3 `search_visibility` — Product search and visibility

User-facing description:

> Buyer search queries and detailed search-performance information for selected product SKUs.

Operations:

- `product_queries`
- `product_queries_details`

The guide must explain the difference:

- `product_queries`: summary/query-level view for selected SKUs;
- `product_queries_details`: more detailed breakdown with `limit_by_sku` and stricter limits.

It must mention that older periods or selected sorts can require an eligible Ozon subscription.

### 5.4 `fulfillment_supply` — FBO postings and supply orders

User-facing description:

> Read-only FBO posting lists and supply-order information.

Operations:

- `posting_fbo_list`
- `supply_order_get`
- `supply_order_details`

Blocked operation that must never appear as selectable:

- `posting_fbs_get` — blocked because the endpoint may expose customer PII.

The guide must distinguish:

- listing/filtering FBO postings;
- getting multiple supply orders by IDs;
- getting details for one supply order.

### 5.5 `advertising_performance` — Advertising campaigns and statistics

User-facing description:

> Read-only Performance API campaign lists, advertising expense, daily statistics and per-product campaign statistics.

Operations:

- `performance_campaigns`
- `performance_expense`
- `performance_daily`
- `performance_campaign_product`

The guide must not offer campaign creation, activation, deactivation, bid changes, product additions/removals or any other mutation. Existing mutation blocking remains authoritative, including mutation-like endpoints that use HTTP GET.

### 5.6 `account_access` — Account roles and access

User-facing description:

> Roles available to the configured Seller API credentials.

Operations:

- `roles`

This is primarily a diagnostic/account-access cluster. It is not sales analytics.

## 6. New local help protocol

Introduce a separate local marker:

```text
OZON_HELP_V1
{"cluster":"sales_analytics"}
```

This marker is not an Ozon operation. It must never enter provider planning, quota scheduling, caching or transport.

Allowed JSON shape:

```json
{
  "cluster": "sales_analytics"
}
```

Rules:

- root must be one JSON object;
- only `cluster` is allowed;
- `cluster` must be one of the six fixed cluster IDs;
- no URL, host, method, headers, auth, credentials or arbitrary nested data;
- multiple `OZON_HELP_V1` selections in one assistant response are rejected locally;
- mixing `OZON_HELP_V1` and `OZON_API_V1` in the same assistant response is rejected locally before any provider request;
- invalid help selections return the cluster-selection question again with an exact local error;
- a help selection must produce `external_request_executed=false` and `physical_business_request_count=0`.

The marker is deliberately simple and stateless. Conversation binding and the existing Manual/Autorun owner checks provide isolation. A persistent dynamic guidance token is not required for v1 and would make weak-model compliance harder.

## 7. Guidance result format

Guidance must use a distinct result marker so the AI cannot confuse local help with Ozon business data:

```text
OZON_GUIDANCE_RESULT_V1
```

The machine-readable header must include at least:

```json
{
  "bridge": "ozon-llm-api-bridge",
  "version": "0.1.19",
  "guidance_version": "1",
  "status": "cluster_required",
  "cluster": null,
  "external_request_executed": false,
  "physical_business_request_count": 0
}
```

Allowed statuses:

- `cluster_identified` — the bridge confidently identified one cluster and returned its command options;
- `cluster_required` — the bridge could not identify one cluster and returned the cluster-selection question;
- `cluster_selected` — the AI selected a valid cluster and the bridge returned its command options;
- `unsupported_or_blocked` — the attempt requests unsupported, PII-sensitive or mutation behavior;
- `guidance_error` — malformed or invalid `OZON_HELP_V1` selection.

The human-readable portion must be short, direct and written for an AI agent. It must tell the AI what to do next. It must not claim that any Ozon data was retrieved.

## 8. Required dialogue flows

### 8.1 Valid command

1. AI emits a valid `OZON_API_V1` command.
2. Existing parser, planner, queue, quota and provider logic run unchanged.
3. No guidance result is produced.

### 8.2 Invalid attempt with confidently identified cluster

1. AI emits an invalid `OZON_API_V1` attempt.
2. Parser preserves the original exact error.
3. Guidance classification identifies one cluster above the confidence threshold.
4. No external request occurs for the invalid entry.
5. The delivered result includes the original validation error plus `OZON_GUIDANCE_RESULT_V1` for the identified cluster.
6. AI selects and emits one later valid `OZON_API_V1` command.
7. Only that later command can reach Ozon.

Required Alice example outcome:

`method: performance/v2/order` with a date range must produce `sales_analytics` guidance and offer `analytics_data`; it must not invent or execute a direct order endpoint.

### 8.3 Invalid attempt with ambiguous cluster

1. AI emits an unknown or malformed attempt.
2. The bridge cannot identify one cluster safely.
3. No external request occurs.
4. The bridge returns `status=cluster_required` and the six cluster choices with short descriptions.
5. It instructs the AI to respond with exactly one `OZON_HELP_V1` selection.

### 8.4 AI selects a cluster

1. AI emits one `OZON_HELP_V1` block.
2. The bridge validates the cluster ID locally.
3. No provider planning or request occurs.
4. The bridge returns only the commands and recipes belonging to that cluster.
5. AI emits a later `OZON_API_V1` command if one option fits.

### 8.5 Requested capability is blocked or unsupported

If the attempt indicates customer PII, `posting_fbs_get`, a Performance mutation, credential extraction or arbitrary transport control:

1. reject it locally;
2. preserve the exact security error;
3. do not soften it into a normal cluster match;
4. optionally list only safe read-only alternatives in the nearest cluster;
5. explicitly state that the requested capability is unavailable;
6. perform zero external business requests.

### 8.6 Mixed valid and invalid `OZON_API_V1` batch

Preserve current sequential batch semantics. A pre-execution error entry may coexist with valid read-only entries, and valid entries continue through the existing queue in their original order.

Guidance for an invalid API entry becomes that entry's local result. It must not rewrite, reorder, duplicate or suppress other valid batch entries.

This rule does not apply to mixed help/API messages. `OZON_HELP_V1` mixed with `OZON_API_V1` must reject the entire assistant response locally because help selection and business execution are different user intentions.

## 9. Manual and Autorun behavior

### 9.1 Manual mode

The existing Ozon button remains structurally attached to assistant code blocks independent of their contents.

Manual behavior:

- user clicks the Ozon button on an invalid attempt;
- the bridge returns guidance through the existing delivery state machine;
- AI answers with `OZON_HELP_V1` when cluster selection is required;
- the Ozon button appears on that help block through the same existing structural binding;
- user clicks it;
- the bridge returns the selected cluster's commands;
- AI emits the final API command;
- user explicitly clicks the final command's Ozon button.

Local guidance clicks do not contact Ozon and do not consume provider quota. Manual mode must not gain a second passive assistant-message watcher in v1.

### 9.2 Autorun mode

Autorun must recognize either `OZON_API_V1` or `OZON_HELP_V1` in a completed assistant message.

Required content-script change:

- `candidateAfterAssistantBaseline()` and the stability check must recognize both prefixes;
- the full assistant message must still be stable and complete before handoff;
- the same assistant-turn deduplication remains in force;
- a help-only response is routed locally and never enters provider planning;
- after guidance delivery is confirmed, the same Autorun run returns to `WAITING_COMMAND` with a fresh assistant baseline/watch ID;
- no new Autorun run or service worker is created.

### 9.3 Guidance loop guard

Weak models can repeatedly emit invalid attempts or repeat cluster selections. Autorun therefore requires a conversation/run-scoped guidance-round counter.

Rules:

- increment after each delivered guidance response;
- reset to zero after a valid business batch is accepted;
- maximum: 4 consecutive guidance responses without a valid business command;
- on the fifth attempt, pause the Autorun run with `GUIDANCE_ROUND_LIMIT`;
- deliver a final local explanation asking the operator to use Manual mode or restart the task with a clearer prompt;
- do not mark provider work as failed because no provider work occurred;
- Manual mode does not auto-loop and therefore does not need the same automatic round cap, but repeated exact help-block clicks must remain deduplicated while delivery is active.

## 10. Intent classification without an unbounded synonym dictionary

The classifier is only a UX shortcut. Correctness must not depend on recognizing every AI formulation. Failure to classify produces the cluster-selection question.

### 10.1 Inputs

Use only a bounded descriptor derived from the attempted command block:

- top-level key names;
- bounded string from likely intent fields such as `operation`, `method`, `path`, `endpoint` or `action`;
- nested parameter key names, not unrestricted values;
- fixed bridge error code;
- whether the attempted name/path matches an enabled alias, known official read path, blocked operation or mutation blocklist.

Do not use:

- user messages;
- full surrounding assistant prose;
- credentials or auth values;
- arbitrary raw parameter values;
- network calls;
- model inference.

Manual and Autorun must classify the same attempted code block identically.

### 10.2 Tolerant descriptor extraction

Current `discoverCommands()` discards the parsed raw object after normalization fails. Extend discovery so a failure can carry a sanitized `attempt_descriptor`.

The descriptor must:

- be created only after balanced JSON extraction and successful `JSON.parse`;
- keep only allowlisted key names and short intent strings;
- cap every string at 240 characters;
- cap key count and nesting depth;
- never keep a value under a sensitive/transport/auth key;
- never be included verbatim in ordinary user-facing output;
- never be sent to provider planning;
- never be stored in diagnostics as raw JSON.

If JSON parsing fails, do not attempt clever recovery. Return the cluster-selection question.

### 10.3 Evidence hierarchy

Use weighted, deterministic evidence:

1. Exact enabled operation alias — strongest evidence.
2. Exact known fixed provider path — strongest evidence.
3. Exact blocked operation or mutation path — security decision, not a normal cluster match.
4. Characteristic parameter-key combination — medium evidence.
5. Short curated semantic roots — weak evidence.

One weak word must never be enough to select a cluster. For example, `order` can refer to sales, FBO postings or supply orders.

A cluster is identified only when:

- its score reaches a reviewed threshold; and
- it leads the second-best score by a reviewed margin; and
- no blocked/mutation/security rule applies.

Otherwise return `cluster_required`.

### 10.4 Curated clue storage

Do not store whole phrases for ChatGPT, Alice, Claude, Gemini, Grok and other AIs. Store small, reviewed clue groups per cluster.

Initial examples:

- `sales_analytics`: `analytics/data`, `sales`, `sale`, `revenue`, `turnover`, `ordered_units`, `продаж`, `выруч`, `оборот`;
- `stock_inventory`: `product/info/stocks`, `stock`, `stocks`, `inventory`, `остат`, `налич`;
- `search_visibility`: `product-queries`, `search`, `query`, `queries`, `visibility`, `поиск`, `запрос`, `видим`;
- `fulfillment_supply`: `posting/fbo`, `supply-order`, `posting`, `shipment`, `supply`, `постав`, `отправ`, `фбо`, `fbo`;
- `advertising_performance`: `api/client/campaign`, `statistics/expense`, `statistics/daily`, `campaign/product`, `advert`, `campaign`, `expense`, `spend`, `реклам`, `кампан`, `расход`;
- `account_access`: `/v1/roles`, `roles`, `permissions`, `access`, `роль`, `прав`, `доступ`.

The observed non-contract clue `performance/v2/order` may be included as a reviewed migration clue for `sales_analytics`, but it must never become an executable path.

Russian roots may be matched as reviewed normalized stems so that `продажа`, `продажи` and `продажам` do not require separate entries. Do not implement unrestricted fuzzy matching or edit-distance guessing.

### 10.5 Characteristic parameter keys

Examples of medium evidence:

- `date_from`, `date_to`, `metrics`, `dimension` together → `sales_analytics`;
- `product_id`, `offer_id`, `warehouse_ids` → `stock_inventory`;
- `skus`, `sort_by`, `sort_dir`, `limit_by_sku` → `search_visibility`;
- `order_ids`, `order_id`, `posting_numbers`, `since`, `to` → `fulfillment_supply`;
- `campaignIds`, `advObjectType`, `dateFrom`, `dateTo` → `advertising_performance`.

Ambiguous date fields alone must not select a cluster.

### 10.6 Collection and maintenance of new clues

The extension must not automatically learn from AI output. Automatic learning would accumulate hallucinations and could be poisoned.

New clues are added through reviewed releases:

1. an unknown attempt is observed in a real or synthetic test;
2. safe diagnostics record only the error code, command-text fingerprint, top-level key names, sanitized attempted operation/path token and cluster score/rule IDs;
3. no conversation text, credentials or business parameter values are recorded;
4. a maintainer assigns the clue to a cluster and adds a regression fixture;
5. the clue and fixture ship together in a later release.

The fallback cluster-selection flow means missing clues cost one extra dialogue step but do not break the product.

## 11. Command guide contents

Each cluster guide must contain one card per enabled operation in that cluster.

Each card contains:

- exact operation alias;
- one-sentence purpose;
- when to choose it;
- what it does not provide when confusion is likely;
- required parameters;
- important optional parameters and limits;
- subscription note when applicable;
- one or more valid `OZON_API_V1` templates;
- instruction to replace example dates/IDs with values from the current conversation;
- continuation/pagination note where applicable.

Do not dump all enum values into every result. Give the common safe recipe first and add only the choices needed to select the operation. Operation-specific validation errors can return more precise allowed values later.

### 11.1 Minimal recipe expectations

`roles`

```text
OZON_API_V1
{"operation":"roles","params":{}}
```

`stocks_current`

Provide separate product-ID and offer-ID recipes. `filter` and `limit` are required. `limit` is 1..1000.

`analytics_data`

Provide at least:

- revenue by day;
- revenue plus ordered units by day;
- a clear subscription warning for restricted metrics/dimensions.

Required fields are `date_from`, `date_to`, `dimension`, `metrics`, `limit`; `offset` is optional and must be non-negative.

`product_queries`

Show RFC3339 `date_from`, optional `date_to`, required `page_size` and `skus`, and optional sort/page. Mention page-size/SKU limits and subscription-sensitive older periods.

`product_queries_details`

Show the same core fields plus required `limit_by_sku`. Explain its stricter page-size and per-SKU limits.

`posting_fbo_list`

Show a bounded list/filter recipe with `limit` and optional time range/order/posting filters. State that detailed FBS customer data is not available.

`supply_order_get`

Show required `order_ids` array, maximum 50.

`supply_order_details`

Show required integer `order_id`.

`performance_campaigns`

Show an empty-params list recipe and optional campaign/state/page filters.

`performance_expense` and `performance_daily`

Show optional `campaignIds`, `dateFrom`, `dateTo` using `YYYY-MM-DD` and explain the difference between expense and daily statistics.

`performance_campaign_product`

Show campaign/product statistics with optional campaign IDs and the supported date-range forms.

## 12. Single source of truth and new module boundary

Recommended production module:

`shared/ozon_guidance.js`

Recommended global export:

`globalThis.OzonGuidance`

Responsibilities:

- fixed cluster registry;
- enabled-operation-to-cluster mapping;
- command card metadata and recipes;
- deterministic attempt-descriptor classification;
- strict `OZON_HELP_V1` parsing;
- cluster-menu and cluster-guide formatting;
- coverage/self-validation against `OzonContract.OPERATIONS`;
- safe diagnostic summaries.

It must not contain provider URLs, credential logic, request execution or mutable runtime state.

`service_worker.js` must import it after `shared/ozon_contract.js`.

`shared/runtime_names.js` should define the stable help and guidance prefixes so content and worker do not duplicate string literals.

Do not duplicate the operation allowlist. The guidance module may contain descriptions and recipes, but startup/tests must verify them against the live `OzonContract.OPERATIONS` registry:

- every guidance operation exists;
- every guidance operation is enabled and read-only;
- every enabled read-only operation is covered exactly once;
- blocked operations are absent from selectable cards;
- every concrete example command passes `OzonContract.normalizeCommand()` after documented placeholder substitution;
- no recipe contains transport/auth keys.

If these checks fail, guidance must fail closed while normal valid `OZON_API_V1` execution remains available.

## 13. Integration points

### 13.1 `shared/runtime_names.js`

Add stable names for:

- `helpPrefix = "OZON_HELP_V1"`;
- `guidanceResultPrefix = "OZON_GUIDANCE_RESULT_V1"`.

Update the default Autorun handshake only enough to explain:

- the bridge may return a cluster-selection request after an invalid attempt;
- the AI must answer that request with exactly one `OZON_HELP_V1` block;
- help selection never calls Ozon.

Do not insert the full command catalogue into the handshake.

### 13.2 `shared/ozon_contract.js`

Preserve all existing provider contract behavior.

Extend discovery error records only as necessary to carry a sanitized attempt descriptor. Do not make `normalizeCommand()` tolerant and do not allow unknown aliases to enter `preflightExecution()`.

### 13.3 `shared/ozon_guidance.js`

Implement the isolated logic described above. Prefer pure functions and frozen registries so Node/VM regression tests can load it without Chrome.

### 13.4 `service_worker.js`

Add a local discovery router before provider planning:

- distinguish API entries, help selections and local guidance errors;
- convert eligible API pre-execution errors to enriched guidance results;
- format `OZON_GUIDANCE_RESULT_V1`;
- preserve batch ordering;
- ensure help-only work never calls capability probes, planner, quota scheduler, cache or provider;
- maintain Manual and Autorun ownership/delivery through existing state machines;
- maintain Autorun guidance-round counter and reset rules;
- emit safe diagnostics.

Do not add a second delivery mechanism.

### 13.5 `content_script.js`

Manual code-block capture and Ozon button behavior remain structurally unchanged.

Autorun candidate detection must recognize both prefixes. All existing stability, message completion, assistant-turn identity, owner-tab and conversation checks remain mandatory.

Do not begin reading user-message text.

### 13.6 `manifest.json`

Add `shared/ozon_guidance.js` only where required by the chosen module loading path. Do not add host permissions or extension permissions.

### 13.7 Popup

No new user setting is required for v1. Cluster guidance is part of command discovery, not an optional provider feature.

## 14. Error policy

The original error code and precise validation message remain present.

Guidance is additive for selected errors, not a replacement for validation.

Suggested behavior:

| Error family | Guidance behavior |
|---|---|
| `NO_OZON_COMMANDS` after an explicit Manual block click | Return cluster selection; zero provider calls |
| `MISSING_JSON`, `INVALID_JSON` | Preserve error; return cluster selection unless a safe descriptor exists |
| `UNKNOWN_TOP_LEVEL_FIELD` | Preserve error; classify sanitized attempted fields |
| `INVALID_OPERATION`, `UNSUPPORTED_OPERATION` | Preserve error; classify attempted operation token |
| known operation with `INVALID_OPERATION_PARAMS` | Preserve exact field error; return that operation's cluster card or precise recipe |
| `TRANSPORT_INJECTION_REJECTED` | Preserve security error; never echo values; no automatic normal guidance if sensitive keys are present |
| `OPERATION_BLOCKED`, PII surface | Return `unsupported_or_blocked`; safe alternatives only |
| mutation path/intent | Return `unsupported_or_blocked`; advertising read-only alternatives may be described |
| provider HTTP error after a valid request | No discovery guidance; preserve existing provider error behavior |
| quota wait/429 after a valid request | No discovery guidance; preserve existing scheduler behavior |

## 15. State and dependency isolation

Guidance-only processing must be provably separate from protected provider state.

For every guidance path, the following must remain byte-equal before and after, except for explicitly guidance-owned diagnostics/counters:

- Seller/Performance credentials;
- provider quota state;
- `next_allowed_at`;
- provider result cache;
- provider request history/diagnostics unrelated to guidance;
- provider alarms;
- another Manual owner;
- another Autorun owner;
- conversation bindings;
- report prefix state;
- send/copy/microphone profiles.

The same service-worker session must remain active during ordinary guidance dialogue. Guidance must not restart it or use worker replacement as cleanup.

Manual OFF/ON behavior remains UI-only as already repaired. This feature must not reopen or redesign that lifecycle.

## 16. Diagnostics

Add bounded diagnostic events such as:

- `GUIDANCE_ATTEMPT_CLASSIFIED`;
- `GUIDANCE_CLUSTER_IDENTIFIED`;
- `GUIDANCE_CLUSTER_REQUIRED`;
- `GUIDANCE_CLUSTER_SELECTED`;
- `GUIDANCE_OPTIONS_DELIVERED`;
- `GUIDANCE_BLOCKED_INTENT`;
- `GUIDANCE_ROUND_LIMIT`;
- `GUIDANCE_CATALOG_INVALID`.

Allowed diagnostic fields:

- conversation/run/manual operation IDs already used by the bridge;
- command fingerprint;
- original error code;
- sanitized top-level key names;
- bounded sanitized operation/path token;
- matched rule IDs;
- per-cluster numeric scores;
- selected cluster ID;
- external request flag fixed to false.

Forbidden diagnostic fields:

- full assistant message;
- full raw command JSON;
- user message text;
- credentials or tokens;
- unrestricted parameter values;
- provider result payload.

## 17. Acceptance test plan

Codex must add deterministic unit/VM tests and browser tests. Synthetic tests must use zero real Ozon and Performance requests.

### 17.1 Registry and catalogue coverage

- all 12 enabled operations are covered exactly once;
- the six cluster IDs are stable and unique;
- `posting_fbs_get` is not selectable;
- mutation blocklist entries are never presented as executable;
- all cluster recipes pass contract validation after fixture substitution;
- adding a fake enabled operation makes coverage validation fail.

### 17.2 Classification fixtures

At minimum:

- `method: performance/v2/order` + date keys → `sales_analytics`;
- `operation: get_orders_performance`, `args` + dates → `sales_analytics` or cluster question if confidence rules intentionally reject it; it must never execute;
- `/v1/analytics/data` → `sales_analytics`;
- `/v4/product/info/stocks` → `stock_inventory`;
- `/v1/analytics/product-queries/details` → `search_visibility`;
- `/v3/posting/fbo/list` → `fulfillment_supply`;
- `/v3/supply-order/get` → `fulfillment_supply`;
- `/api/client/statistics/expense/json` → `advertising_performance`;
- `/v1/roles` → `account_access`;
- ambiguous `get_data` → `cluster_required`;
- ambiguous `order` alone → `cluster_required`;
- invalid JSON → `cluster_required` plus original error;
- credentials/authorization keys → security rejection, no value retention;
- mutation path → `unsupported_or_blocked`.

### 17.3 Cluster selection

For each cluster ID:

- `OZON_HELP_V1` returns only that cluster's enabled operations;
- result is `OZON_GUIDANCE_RESULT_V1`;
- `external_request_executed=false`;
- physical business request count is zero;
- no capability probe runs;
- invalid cluster returns the six-cluster question;
- extra top-level help fields are rejected;
- multiple help markers are rejected;
- mixed help/API response is rejected before all provider work.

### 17.4 Existing API regression

- one valid Seller command remains byte-equivalent at normalization/request boundary;
- one valid Performance command remains byte-equivalent at normalization/request boundary;
- multi-command batch ordering remains unchanged;
- mixed valid API plus invalid API preserves valid execution and guidance result ordering;
- existing exact analytics validation messages remain exact;
- provider HTTP 400/429 handling does not trigger command guidance;
- no hidden retry, pagination or fan-out is introduced.

### 17.5 Manual browser flow

Run in both ChatGPT and Alice fixtures:

1. assistant code block contains observed invalid sales attempt;
2. Ozon button is bound normally;
3. one click yields sales-cluster guidance;
4. no provider call occurs;
5. button becomes usable again after delivery;
6. assistant emits `OZON_HELP_V1` for an ambiguous case;
7. one click yields only selected-cluster command cards;
8. final valid command can be clicked and routed normally;
9. Work composer uses the actual submit control and ignores persistent dictation;
10. three consecutive guidance/business deliveries do not leave the button stuck.

### 17.6 Autorun browser flow

Run in both ChatGPT and Alice fixtures:

- Autorun recognizes invalid `OZON_API_V1` and delivers guidance;
- Autorun recognizes `OZON_HELP_V1` after the AI selects a cluster;
- help selection performs zero provider calls;
- after confirmed guidance delivery the same run returns to `WAITING_COMMAND`;
- final valid command uses the existing batch/provider path;
- assistant-turn deduplication prevents repeat processing;
- four consecutive guidance rounds are allowed;
- the fifth triggers `GUIDANCE_ROUND_LIMIT` and pauses safely;
- restart during guidance delivery uses existing delivery reconciliation without provider replay.

### 17.7 Protected-state regression

Take before/after snapshots and prove byte equality for:

- quota and `next_allowed_at`;
- result cache;
- credentials;
- alarms;
- other conversation Manual/Autorun state;
- owner tab and conversation binding;
- service-worker identity during the uninterrupted scenario.

Expected named gates should include at least:

```text
GUIDANCE_CATALOG_COVERS_ENABLED_OPERATIONS_PASS
GUIDANCE_BLOCKED_OPERATIONS_NEVER_OFFERED_PASS
GUIDANCE_ALICE_SALES_ATTEMPT_CLASSIFIED_PASS
GUIDANCE_AMBIGUOUS_ATTEMPT_RETURNS_CLUSTERS_PASS
GUIDANCE_CLUSTER_SELECTION_RETURNS_ONLY_CLUSTER_COMMANDS_PASS
GUIDANCE_ZERO_PROVIDER_CALLS_PASS
GUIDANCE_VALID_COMMAND_REGRESSION_PASS
GUIDANCE_MANUAL_CHATGPT_FLOW_PASS
GUIDANCE_MANUAL_ALICE_FLOW_PASS
GUIDANCE_AUTORUN_CHATGPT_FLOW_PASS
GUIDANCE_AUTORUN_ALICE_FLOW_PASS
GUIDANCE_LOOP_GUARD_PASS
GUIDANCE_PROTECTED_STATE_BYTE_EQUAL_PASS
GUIDANCE_WORK_COMPOSER_REGRESSION_PASS
FRESH_EXTRACT_GUIDANCE_ARTIFACT_VERIFY_PASS
```

## 18. Implementation sequence for Codex

Codex must work incrementally and commit each coherent stage separately.

### Stage 0 — Baseline reconstruction

- fetch current refs;
- extract and hash the exact baseline artifact;
- run existing targeted Manual/Autorun/parser/contract tests;
- record baseline hashes and commands;
- make no production changes.

### Stage 1 — Catalogue and pure guidance module

- add `shared/ozon_guidance.js`;
- define clusters, cards, clue rules and pure formatting/classification functions;
- add registry coverage and recipe-validation tests;
- do not integrate delivery yet.

### Stage 2 — Tolerant sanitized attempt descriptor

- extend discovery failure records without weakening strict command parsing;
- prove sensitive values are never retained;
- add classification fixtures;
- preserve all old parser errors.

### Stage 3 — Manual local guidance flow

- add help parsing and guidance result entries;
- route Manual clicks through existing manual operation/delivery state;
- prove zero provider calls and fresh button readiness;
- preserve mixed valid/invalid API batch behavior.

### Stage 4 — Autorun local guidance flow

- recognize the help prefix in assistant watcher;
- route guidance through the existing run/delivery state;
- implement/reset guidance-round counter;
- prove same-run continuation and loop guard.

### Stage 5 — Full browser and protected-state regression

- test ChatGPT, ChatGPT Work and Alice fixtures;
- re-run current Work submit/dictation and Manual OFF/ON regressions;
- prove protected state byte equality;
- prove zero real Ozon/Performance requests in synthetic guidance tests.

### Stage 6 — Packaging

- package only the 17 production files plus any intentionally added production module reflected in manifest/import inventory;
- verify fresh extraction byte-for-byte;
- publish artifact, SHA-256, file inventory and exact accepted commit;
- do not overwrite the existing accepted artifact.

## 19. Required implementation report

Codex's final report must include:

- exact base branch and base commit;
- implementation branch and commit sequence;
- files changed and why;
- final cluster/operation coverage table;
- exact classification rules and confidence thresholds;
- examples of `cluster_identified`, `cluster_required`, `cluster_selected` and `unsupported_or_blocked` results;
- proof that Alice's observed sales attempt produces the intended guidance;
- proof of zero provider calls for every guidance-only scenario;
- protected-state before/after evidence;
- Manual and Autorun browser evidence for ChatGPT and Alice;
- Work composer/dictation regression evidence;
- artifact path, SHA-256 and fresh-extract inventory;
- explicit statement that service-worker provider scheduling, quota/cache and credentials were not reset.

## 20. Acceptance definition

The feature is accepted only when a weak or misinformed AI can recover from an invented Ozon command without the extension executing a guessed replacement:

- clear attempt → relevant cluster commands;
- unclear attempt → cluster question;
- AI cluster choice → commands only from that cluster;
- AI final choice → ordinary explicit `OZON_API_V1` execution;
- every guidance step is local and read-only;
- every valid existing bridge operation continues to behave as before;
- all security, ownership, delivery, quota, cache and no-replay invariants remain intact.

The fallback cluster dialogue is the correctness mechanism. Synonym classification is only an optimization that removes one dialogue step when evidence is strong.
