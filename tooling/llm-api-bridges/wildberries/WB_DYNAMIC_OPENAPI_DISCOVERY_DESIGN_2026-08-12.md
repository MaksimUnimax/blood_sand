# Wildberries Bridge — Dynamic OpenAPI Documentation Discovery

Date: 2026-08-12  
Status: DESIGN / RESEARCH DECISION  
Scope: `tooling/llm-api-bridges/wildberries/**`

## Goal

Allow the Wildberries Bridge to obtain the current official WB API documentation during normal work without hardcoding a per-category list of Swagger/OpenAPI URLs.

The documentation surface changes over time: new API categories and endpoints appear, old endpoints are removed or replaced, and schemas/auth rules can change. The bridge therefore needs a machine-readable documentation refresh mechanism that is independent from the executable seller-API registry.

## Official basis

Wildberries states that its API documentation is published in Swagger/OpenAPI format. Each API category has its own Swagger page, and the Swagger page exposes a downloadable `swagger.yaml` specification that can be imported into Postman/OpenAPI Generator.

Relevant official WB documentation:

- https://dev.wildberries.ru/knowledge-base/articles/019d49a0-f21e-7709-bf7c-35f9d46f6ae9/swagger-interaktivnaia-dokumentatsiia-wb-api
- https://dev.wildberries.ru/docs/openapi/api-information
- https://dev.wildberries.ru/knowledge-base/articles/019d49a0-ea5d-74b7-a147-be50f8dda5e9/kak-pol-zovat-sia-dokumentatsiei-wb-api

## Decision

Do NOT hardcode one Swagger/OpenAPI URL per WB category into the production registry.

Instead use dynamic documentation discovery with a strict separation between:

1. **documentation discovery/read**, and
2. **seller API execution**.

Discovered documentation never automatically becomes an executable seller-API operation.

## Bootstrap / origin model

The documentation origin is local operator configuration, not LLM-controlled transport input.

Recommended MV3 model:

- manifest declares broad `optional_host_permissions` for HTTPS;
- user enables "WB API documentation access" from the popup/UI;
- the extension requests permission for the concrete documentation origin with `chrome.permissions.request({origins:[...]})`;
- the granted origin is stored locally;
- LLM commands cannot override origin, host, URL or permission state.

Chrome MV3 supports runtime-discovered hosts through `optional_host_permissions` and `chrome.permissions.request()`.

This means the extension does not need permanent install-time access to a fixed WB developer-portal host and does not need hardcoded category URLs.

## Dynamic discovery flow

### Stage 1 — discover Swagger category pages

Fetch the configured/granted documentation root.

Parse only same-origin links and collect links that the official portal exposes as Swagger navigation/category pages.

Do not infer or synthesize category URL slugs.

### Stage 2 — discover machine-readable specifications

For each discovered Swagger category page:

- fetch the category page;
- locate the official downloadable OpenAPI link, currently presented by WB as `swagger.yaml`;
- resolve relative URL against the already-approved same-origin page URL;
- reject cross-origin redirects/links unless the operator separately grants that origin.

Do not construct `.../swagger.yaml` by string convention.

### Stage 3 — fetch OpenAPI

Fetch the discovered OpenAPI YAML/JSON resource.

Validate:

- HTTP success;
- bounded response size;
- OpenAPI/Swagger document shape;
- `paths` is an object;
- schemas/components are bounded;
- no script/HTML execution;
- no credentials attached to documentation requests.

### Stage 4 — derive documentation inventory

Parse the current specification into a normalized inventory:

- category/title/version;
- servers/hosts;
- path;
- HTTP method;
- operationId where present;
- summary/description;
- parameters;
- request body schema;
- response schemas/statuses;
- security declarations;
- deprecation flags.

Store a deterministic fingerprint for the source specification and per-operation normalized contract.

## Refresh / drift detection

On a documentation refresh compare the new normalized inventory with the previous snapshot and emit explicit deltas:

- `CATEGORY_ADDED`
- `CATEGORY_REMOVED`
- `OPERATION_ADDED`
- `OPERATION_REMOVED`
- `METHOD_CHANGED`
- `PATH_CHANGED`
- `SERVER_CHANGED`
- `PARAMETERS_CHANGED`
- `REQUEST_SCHEMA_CHANGED`
- `RESPONSE_SCHEMA_CHANGED`
- `SECURITY_CHANGED`
- `DEPRECATED_CHANGED`

A removed or materially changed endpoint that is currently executable in the bridge must be flagged `DOCS_DRIFT_REVIEW_REQUIRED`.

## Security / fail-closed rule

Dynamic OpenAPI discovery MUST NOT dynamically expand the executable allowlist.

Newly discovered operations start as:

`DISCOVERED / UNKNOWN_EFFECT / EXECUTION_DISABLED`

They may become executable only after classification and an explicit bridge patch/review confirms:

- operation is semantically read-only/read-derived;
- no mutation side effect;
- acceptable PII/privacy handling;
- current auth/token requirements;
- fixed provider host/path/method contract;
- request and response bounds;
- tests and release gate.

This is essential because WB uses POST for many read operations; HTTP verb alone cannot classify effect.

If a previously approved operation disappears from the current official specification or its contract materially changes, strict mode must block execution until reviewed rather than silently continuing with a stale contract.

## Request invariant

Keep seller API and docs traffic as separate command families.

`WB_API_V1` retains the existing invariant: one accepted seller command performs at most one external WB seller-API request.

Documentation discovery should use a separate `WB_DOCS_V1` family with explicit stages, each command performing at most one external documentation request, for example:

- `docs_discover_root`
- `docs_fetch_swagger_page`
- `docs_fetch_openapi`
- local-only `docs_parse_openapi`
- local-only `docs_diff_snapshot`

No hidden retry, pagination, polling or fan-out.

A UI "Refresh documentation" workflow may enqueue these explicit stages, but request ownership and counts must remain visible and recoverable.

## Credentials

Documentation requests are public documentation reads and must not receive seller credentials.

Never attach:

- `Authorization`
- WB seller token
- `X-Client-Secret`
- API keys
- cookies copied from seller APIs

unless a future official WB documentation contract explicitly requires authentication and that change is separately reviewed.

## Storage

Keep documentation snapshots separate from seller response data.

Suggested local records:

- discovered docs origin;
- granted permission state;
- category discovery snapshot;
- raw OpenAPI source fingerprint;
- normalized endpoint inventory;
- previous/current diff;
- refresh timestamp;
- review state for discovered changes.

Do not store seller credentials in documentation snapshots.

## Current conclusion

The correct long-term mechanism is dynamic discovery of WB's official machine-readable OpenAPI specifications through the portal navigation and the Swagger pages' own exported specification links.

The bridge should not hardcode category Swagger URLs and should not guess URL patterns. The only network authority is an operator-approved documentation origin plus same-origin links actually discovered from the official portal. Runtime host permission can be granted for the concrete origin through Chrome MV3 optional host permissions.

Dynamic documentation updates improve currentness, but they do not bypass the fixed read-only execution security boundary: new or changed operations are discovered automatically and executed only after explicit classification/review.
