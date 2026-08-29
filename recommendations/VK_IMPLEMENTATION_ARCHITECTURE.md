# VK Hybrid Recommendation Product — Implementation Architecture

Версия: 0.1  
Статус: **PRE-CODE IMPLEMENTATION AUTHORITY**  
Дата: 2026-08-29  
Бренд: «Кровь и Песок»

## 1. Назначение

Этот документ превращает проверенные VK platform contracts и текущую V2 recommendation authority в полную implementation-архитектуру продукта до написания M2/M3/M5/M6 runtime-кода.

Порядок authority:

```text
Business semantics
1. RECOMMENDATION_MATRIX.md
2. PRODUCT_CLASSIFICATION.md
3. CUSTOMER_RECOMMENDATION_COPY_GUIDE.md
4. DATA_API_CONTRACT.md
5. ARCHITECTURE.md

VK platform contracts
6. VK_PLATFORM_ARCHITECTURE.md
7. VK_PLATFORM_OFFICIAL_CONTRACT_LEDGER.md
8. VK_PLATFORM_PRE_M3_CONTRACT.md

Product/channel UX
9. VK_UX_FLOW.md
10. ROADMAP.md

Implementation architecture
11. THIS DOCUMENT
```

Если implementation architecture конфликтует с verified VK contract, побеждает verified VK contract и этот документ должен быть исправлен до кода.

Hard rule:

```text
VK fact       → только из verified official contract/staging fixture
App decision  → явно помечается как наше решение
Unresolved    → не заполняется догадкой
```

---

## 2. Product invariant

Это один продукт:

```text
VK Community Bot
VK Mini App
        │
        └──────────────┐
                       ▼
          Shared Recommendation Backend
                       │
                       ▼
          Recommendation Application Service
                       │
                       ▼
          Deterministic Recommendation Core
```

Bot и Mini App — разные пользовательские поверхности, но не разные recommendation systems.

Forbidden:

- Bot-local matrix;
- Mini-App-local matrix;
- channel-specific product selection;
- LLM selection;
- hidden availability fallback;
- secondary recommendation;
- Telegram redirect for consumer flow.

---

## 3. Technology decisions

Everything in this section is **OUR ARCHITECTURE DECISION**, not a VK requirement.

### Backend

Target backend stack:

```text
Python 3.11+
FastAPI
Uvicorn
Pydantic v2-style typed transport models
standard-library sqlite3 for V1 persistent state
HTTPX or equivalent explicitly configured VK API client
```

Why:

- current Recommendation Core is Python;
- one process can expose Recommendation API + Callback + later Mini App backend endpoints;
- typed HTTP validation reduces hand-written request-shape mistakes;
- ASGI gives clean lifecycle hooks for durable worker loops;
- SQLite is sufficient for expected V1 community traffic when used as a single-product state store with WAL/transactions;
- storage abstraction remains replaceable if scale later requires PostgreSQL.

Exact dependency versions are **not** frozen by this document. They must be checked and pinned with a lockfile/requirements artifact at the implementation milestone.

### Mini App frontend

Platform-aligned stack follows current official VK scaffold:

```text
TypeScript
React
VKUI
VK Bridge
VK Mini Apps Router
Vite
```

Prefer official VK Mini Apps static hosting through `vk-miniapps-deploy` unless a concrete deployment requirement later justifies another HTTPS host.

Exact package versions are revalidated and pinned at M5.

---

## 4. Initial deployable topology

V1 uses one backend deployable service with explicit internal module boundaries:

```text
                    Internet / VK
                         │
                    HTTPS proxy
                         │
             ┌───────────┴───────────┐
             │                       │
             ▼                       ▼
 Shared Recommendation API      VK Callback endpoint
             │                       │
             └───────────┬───────────┘
                         ▼
               Python backend service
                         │
        ┌────────────────┼─────────────────┐
        ▼                ▼                 ▼
 Recommendation     VK inbound worker   VK outbox worker
 app service             │                 │
        │                 │                 ▼
        ▼                 │            VK messages.send
 Recommendation Core     │
                          ▼
                     VK state DB
```

Later Mini App:

```text
VK Mini App static frontend
        │ HTTPS
        ▼
/v1/vk/miniapp/*
        │
        ▼
verified Mini App session/handoff services
        │
        └── same Recommendation Application Service/Core
```

The VK state database is physically/logically separate from Marketplace Question Operator state.

---

## 5. Proposed source layout

Target layout, subject to narrow implementation adjustment without changing boundaries:

```text
recommendations/
  core/
    configuration.py
    recommendation.py

  api/
    app.py
    models.py
    errors.py
    serialization.py

  application/
    recommendation_service.py
    result_ids.py

  vk/
    contracts.py
    config.py
    callback.py
    normalization.py
    bot_state.py
    bot_parser.py
    bot_orchestrator.py
    presenter.py
    keyboards.py
    storage.py
    migrations.py
    inbound_worker.py
    outbox.py
    vk_api.py
    preflight.py
    miniapp_auth.py          # M5
    handoff.py               # M5/M6

  miniapp/                   # frontend project at M5, exact placement may differ

  tests/
    fixtures/vk/
    test_recommendation_api.py
    test_vk_contracts.py
    test_vk_callback.py
    test_vk_bot_state.py
    test_vk_outbox.py
    test_vk_preflight.py
    test_vk_miniapp_auth.py
    test_vk_handoff.py
```

MQO files/runtime are not imported as transport/state implementation.

---

## 6. Shared Recommendation Application Service

Do not make the Bot call our own backend over loopback HTTP merely to reuse logic.

Use one in-process application service:

```text
RecommendationApplicationService.resolve(input)
```

It:

1. validates/normalizes application input;
2. delegates semantic selection to current `RecommendationCore`;
3. creates correlation/result metadata outside semantic output;
4. returns a transport-neutral result.

Consumers:

```text
HTTP Recommendation endpoint → application service
Bot orchestrator              → application service
Mini App API                  → HTTP endpoint/application service
```

This preserves one semantic implementation while avoiding fragile self-HTTP.

Differential contract:

```text
Core semantic output
== ApplicationService semantic output
== HTTP API semantic output
== Bot semantic result
== Mini App semantic result
```

---

## 7. HTTP API boundary

M2 implements the current `DATA_API_CONTRACT.md` only.

Public M2 endpoints:

```text
POST /v1/recommendations/resolve
GET  /healthz
GET  /readyz
```

M3 adds:

```text
POST /v1/vk/callback
```

M5 later adds authenticated Mini App backend endpoints under:

```text
/v1/vk/miniapp/*
```

Do not expose internal database/admin mutation routes publicly.

### Correlation

Transport correlation may use headers such as:

```text
X-Request-Id
X-Result-Id
```

provided this remains aligned with `DATA_API_CONTRACT.md` and does not alter semantic response body.

IDs never affect recommendation selection.

---

## 8. Health versus readiness versus platform preflight

Three concepts are separate.

### `/healthz`

Process liveness only.

Must not call VK.

### `/readyz`

Local application readiness for enabled modules.

M2 checks:

- configuration loads/validates;
- Recommendation Core initializes.

When M3 Bot feature is enabled also check:

- state DB reachable/migrated;
- worker subsystem initialized;
- required local VK configuration variables present.

`/readyz` must not perform live VK API calls on every probe.

### VK platform preflight

Explicit deployment/setup operation:

```text
vk preflight
```

It checks the actual community/token/Callback configuration against official methods and staging evidence.

A temporary VK network outage is surfaced as a preflight/transport condition; it does not redefine process liveness.

---

## 9. VK provisioning boundary

Runtime startup is read-only with respect to remote VK configuration.

Separate explicit operator action:

```text
vk provision
```

may create/update:

- Callback server;
- Callback subscriptions/API version;
- bot capability/community settings;

using official VK API methods.

Provisioning must:

- display intended non-secret changes;
- require explicit invocation;
- never print token/secret/confirmation code;
- be idempotent where possible;
- verify resulting settings with readback/staging.

The service must never silently reconfigure the production community merely because it restarted.

---

## 10. Callback request architecture

### 10.1 Confirmation

For a verified VK `confirmation` event:

```text
HTTP request
→ parse bounded JSON
→ validate group_id
→ validate Callback secret
→ return configured current confirmation code
```

No Recommendation Core dependency.

No DB dependency is required for the actual returned code path except optional audit logging.

### 10.2 Ordinary event — critical change from naive design

Do **not** synchronously execute the whole Bot flow before returning `ok`.

Receiver transaction:

```text
VK callback HTTP
→ bounded JSON parse
→ validate group_id + secret
→ validate base envelope
→ normalize enough identity for inbox
→ INSERT inbound event with unique event key
→ COMMIT
→ return `ok`
```

After acknowledgement:

```text
inbound worker
→ claim NEW event
→ full event contract validation/normalization
→ load Bot session
→ transition Bot state
→ resolve recommendation if required
→ build customer response + keyboard
→ create result/outbox rows atomically
→ mark event processed
→ COMMIT
```

Then:

```text
outbox worker
→ claim pending outbound row
→ messages.send
→ record success/failure
```

This architecture isolates Callback acknowledgement from VK outbound latency and from recommendation processing.

### 10.3 If inbox persistence fails

Never return `ok` for an event that was not durably accepted.

Application policy:

```text
DB/persistence failure before commit
→ return non-success HTTP status
→ do not pretend event was accepted
```

Exact VK redelivery behavior under this condition must be verified in staging; nevertheless acknowledging an unpersisted event is forbidden because it guarantees local loss.

---

## 11. Callback security

Callback endpoint has no user login/cookie authentication.

Trust boundary:

```text
expected group_id
AND
configured Callback secret
```

Rules:

- compare secrets without logging them;
- wrong group → reject;
- wrong/missing expected secret → reject;
- confirmation code returned only after trust checks;
- request body size bounded;
- JSON object required;
- content type validated according to observed VK fixture/official behavior;
- stack traces never returned.

Exact HTTP status for rejected fake callbacks is our application policy, not VK semantic contract.

---

## 12. Inbound event persistence

Logical table:

```text
vk_inbound_events
```

Required conceptual fields:

```text
id                     internal integer/uuid
transport              callback | bots_long_poll
vk_group_id            integer
event_id               string
api_version             string
event_type              string
raw_payload_json        text/json
normalized_payload_json text/json nullable
status                  NEW | PROCESSING | PROCESSED | IGNORED | FAILED
attempt_count           integer
next_attempt_at         timestamp nullable
received_at             timestamp
claimed_at              timestamp nullable
processed_at            timestamp nullable
last_error_code         string nullable
last_error_detail       redacted string nullable
```

Hard uniqueness for Callback:

```text
UNIQUE(vk_group_id, transport, event_id)
```

Duplicate insert is a normal idempotency path, not an exception that creates a second workflow.

Raw payload retention must be bounded/configurable and never contain platform secrets after normalization/storage filtering.

---

## 13. Inbound worker claiming

Even if V1 runs one process, design worker claiming so multiple executions cannot process the same event concurrently.

SQLite V1 application policy:

- WAL mode;
- foreign keys ON;
- busy timeout;
- short transactions;
- atomic status claim from `NEW` to `PROCESSING`;
- stale claim recovery based on explicit lease policy configured before production.

Do not keep a database transaction open while calling external VK API.

Bot state transition/result/outbox creation can happen in one local DB transaction because Core resolution is local/deterministic.

---

## 14. Normalized VK event contract

Business/orchestration code consumes a stable internal contract, not arbitrary raw JSON.

```text
VKInboundEvent
  transport
  event_id
  api_version
  group_id
  event_type
  peer_id?
  from_id?
  message_id?
  conversation_message_id?
  text?
  payload?
  client_info?
```

For `message_new`, extractor uses the verified current nesting:

```text
object.message
object.client_info
```

Unsupported/unknown event types from a valid trusted callback are recorded as `IGNORED` and acknowledged without business side effects.

No generic guessed old-format fallback parser in production.

If staging later reveals a second current supported shape, add it deliberately with fixture/version guard.

---

## 15. Client capability policy

Use verified `client_info` instead of assuming UI capabilities.

Internal model normalizes:

```text
keyboard_supported
inline_keyboard_supported
button_actions_supported[]
carousel_supported
language_id
```

Bot semantic flow is never dependent on a keyboard.

Decision table:

```text
keyboard supported + required action supported
→ send keyboard

keyboard unsupported/unknown
→ send plain-text prompt
→ accept same choices as text
```

For Bot → Mini App:

```text
open_app supported
→ may show open_app CTA

open_app not supported / unknown
→ Bot remains fully usable
→ no guessed fallback deep link until officially verified
```

---

## 16. Bot session model

Logical session key for direct user/community conversation:

```text
(vk_group_id, peer_id)
```

Session state:

```text
START
WAITING_DATE
WAITING_GENDER
RESOLVED
HUMAN_HANDOFF
```

Stored active fields:

```text
birth_day
birth_month
birth_year nullable
gender nullable
marketplace nullable
last_result_id nullable
state_version
updated_at
expires_at/configured retention boundary
```

No profile-name/avatar-based gender inference.

Session expiry/retention duration is an application privacy/product policy and must be configured explicitly before deployment; it is not a VK contract.

---

## 17. Bot state transitions

### `START`

Any recognized start intent or first meaningful message:

- if exactly one valid date is present → store date and move to `WAITING_GENDER`;
- otherwise prompt for date and move/stay `WAITING_DATE`.

### `WAITING_DATE`

Accept current UX formats:

```text
DD.MM
DD.MM.YYYY
DD/MM
DD/MM/YYYY
DD-MM
DD-MM-YYYY
```

If more than one date candidate exists → do not guess.

Core/API performs final Gregorian validation.

Valid date → `WAITING_GENDER`.

### `WAITING_GENDER`

Accept only explicit current choices:

```text
male / Мужчине
female / Женщине
```

from a validated button payload or normalized text.

Valid gender:

```text
resolve through shared application service
→ persist result
→ state RESOLVED
→ enqueue exactly one recommendation response
```

### `RESOLVED`

Supported actions:

- `Подобрать снова` → clear active semantic inputs, state `WAITING_DATE`;
- product action → M4 destination behavior;
- optional Mini App CTA → handoff behavior when M5/M6 available;
- human handoff request → `HUMAN_HANDOFF` when implemented.

No implicit second recommendation.

### `HUMAN_HANDOFF`

Automatic recommendation replies are suppressed.

Initial policy: no guessed automatic timeout exit.

Exit requires an explicit user/operator/product action defined by the handoff implementation. `Подобрать снова` may be explicitly allowed as user-driven re-entry only if owner-approved in M3/M7 UX.

---

## 18. Bot button payload contract — application policy

VK text-button payload is convenience data and is forgeable by the user.

Use a small versioned JSON application payload, conceptually:

```text
{"v":1,"action":"set_gender","value":"male"}
{"v":1,"action":"set_gender","value":"female"}
{"v":1,"action":"start_over"}
```

Requirements:

- total VK payload stays under official method limit;
- unknown version/action/value rejected as UI action;
- current state must authorize the action;
- payload never bypasses semantic input validation;
- label text remains usable as fallback;
- payload parser has no dynamic code execution.

The exact JSON examples are OUR APPLICATION CONTRACT and get dedicated tests.

---

## 19. Customer recommendation presenter

Presenter does not choose a product.

Input:

```text
already resolved Core/application result
current reason_copy authority
optional product destination overlay later
```

Output:

```text
customer-facing text
keyboard/action model
```

Required ordering from copy authority:

```text
supplied full date when present
→ Chertog
→ themes
→ selected product
→ why it fits
→ product action
```

Forbidden:

- internal product key in customer text;
- relation/selection enums;
- sales ranking;
- secondary product;
- stock-based semantic replacement;
- AI-written semantic selection.

`bear_paw` customer label is always exactly `Печать Велеса`.

---

## 20. Recommendation result persistence

Logical table:

```text
vk_recommendation_results
```

Conceptual fields:

```text
result_id                opaque UUID/ULID-style application id
vk_group_id nullable
peer_id nullable
verified_vk_user_id nullable
source_surface            bot | mini_app | api
input_snapshot_json
semantic_result_json
calendar_version
product_policy_version
matrix_version
marketplace_override_version
copy_version
created_at
```

Result snapshot is immutable.

A later channel transition references the existing result; it does not recompute and silently change it.

Retention must be explicitly configured with privacy requirements before production.

---

## 21. Outbox model

Logical table:

```text
vk_outbox
```

Conceptual fields:

```text
outbox_id
source_event_id
sequence_no
peer_id
message_text
keyboard_json nullable
random_id
status              PENDING | SENDING | SENT | PERMANENT_FAILURE | UNKNOWN_FAILURE
attempt_count
next_attempt_at nullable
last_vk_error_code nullable
last_error_class nullable
vk_message_id nullable
created_at
claimed_at nullable
sent_at nullable
```

Hard application uniqueness:

```text
UNIQUE(source_event_id, sequence_no)
```

so reprocessing cannot create duplicate logical responses.

For non-event-originated sends, a separate stable logical operation key is required.

---

## 22. `random_id` idempotency

Official VK purpose is to avoid resending.

Application rule:

```text
logical outbox row → one persisted VK random_id
```

Every retry reuses it.

Do not use fresh random id per attempt.

Exact integer generation convention is frozen by adapter tests/staging rather than claimed as VK schema fact.

Collision prevention is required within the application’s active/idempotency horizon.

---

## 23. Outbox worker

Worker loop:

```text
claim eligible PENDING row
→ mark SENDING/lease
→ commit
→ call VK API outside DB transaction
→ classify result
→ short update transaction
```

On success:

```text
status SENT
store returned VK message id when available
```

On retryable failure:

```text
status PENDING
increment attempt_count
set bounded next_attempt_at
reuse random_id
```

On permanent failure:

```text
status PERMANENT_FAILURE
no automatic loop
```

Unknown error:

```text
fail closed
surface observability/operator signal
no infinite retry
```

Exact retry-code allowlist is frozen only after PRE-M3 staging contract gate.

---

## 24. VK API client

One adapter owns outbound VK API behavior.

Responsibilities:

- fixed configured `v` on every method call;
- group token from server secret config;
- method request serialization;
- connect/read timeouts as OUR transport policy;
- JSON response parsing;
- VK `error` envelope normalization;
- no business semantics;
- no automatic retry inside the low-level client unless explicitly coordinated with outbox policy.

Higher outbox layer owns durable retries.

This avoids double retry loops.

No token appears in logs, exception text, metrics labels or stored request payloads.

---

## 25. Retry taxonomy

Before exact code list is frozen, architecture categories are:

```text
TRANSIENT_TRANSPORT
TRANSIENT_RATE_SERVICE
PERMANENT_USER_STATE
AUTH_CONFIGURATION
INVALID_REQUEST_CODE_BUG
UNKNOWN
```

Examples from current verified VK inventory are evidence, not final hardcoded policy until staging.

Rules:

- `AUTH_CONFIGURATION` opens an operator alert/circuit condition, not endless retry;
- `INVALID_REQUEST_CODE_BUG` is never hidden by retries;
- `PERMANENT_USER_STATE` is terminal for that send;
- transient classes have bounded attempts/backoff;
- UNKNOWN is terminal/operator-visible by default.

No unbounded retry.

---

## 26. SQLite V1 storage decision

SQLite is OUR V1 architecture choice, not a VK requirement.

Configuration:

```text
WAL mode
foreign_keys = ON
busy_timeout configured
short transactions
no external HTTP inside DB transaction
versioned schema migrations
```

Database path:

- separate VK-specific path;
- outside repository;
- never the MQO SQLite database.

Backups/migration/restore are part of production hardening.

Storage interface must allow future PostgreSQL migration without changing Bot/Core contracts.

---

## 27. Database migrations

Use explicit monotonic migrations, for example:

```text
001_initial_vk_state.sql
002_...
```

Migration table records applied version/hash/time.

Startup behavior:

```text
schema older + known safe migration pending
→ controlled migration command/deploy step

schema newer/unknown/incompatible
→ readiness FAIL
→ no destructive auto-reset
```

Never delete/recreate state automatically to “fix” schema mismatch.

---

## 28. Bot preflight integration

`vk preflight` produces a structured report without secrets.

Conceptual checks:

```text
local_config                 PASS/FAIL
core_config                  PASS/FAIL
group_token_api_access       PASS/FAIL
group_token_permissions      OBSERVED
bots_capabilities            PASS/FAIL when needed
callback_server_present      PASS/FAIL
callback_server_status       expected ok
callback_api_version         expected pinned value
message_new_subscription     expected enabled
message_event_subscription   conditional
staging_send_contract        PASS/FAIL
staging_inbound_contract     PASS/FAIL
```

Preflight report is deployment evidence, not a recommendation input.

No live preflight call on every customer message.

---

## 29. Logging and privacy

Structured logs include identifiers needed for correlation but avoid unnecessary DOB/user content.

Allowed normal operational fields:

```text
event
request_id
event_id
result_id
outbox_id
status
vk_error_code
latency_ms
state_before/state_after
```

User/peer IDs should support configurable hashing/pseudonymization in production logs.

Do not log:

- VK token;
- Callback secret;
- confirmation code;
- Mini App protected key;
- raw signed launch query;
- full raw Callback body by default;
- full birth date unless a protected diagnostic mode is explicitly enabled.

Raw inbound payload storage is bounded/audited, not routine log spam.

---

## 30. Metrics

Minimum backend metrics:

```text
recommendation_resolve_total{status}
vk_callback_total{type,status}
vk_callback_duplicate_total
vk_inbound_queue_depth
vk_inbound_processing_seconds
vk_bot_transition_total{from,to}
vk_outbox_pending
vk_send_total{status,error_class}
vk_send_attempts
vk_preflight_status
miniapp_auth_total{status}       # M5
handoff_total{status}            # M5/M6
```

Do not put raw user IDs, DOB, handoff tokens or free-form text into metric labels.

---

## 31. Mini App frontend architecture

At M5:

```text
VK client
→ static React/VKUI app
→ VKWebAppInit
→ obtain current launch params
→ backend authentication/bootstrap
→ shared Recommendation API
```

Frontend owns only:

- local form state;
- day/month/year input UI;
- gender choice UI;
- loading/error state;
- rendering one server result;
- supported Bridge UI interactions;
- opaque handoff reference from navigation.

Frontend never owns:

- Chertog calendar logic;
- product matrix;
- marketplace override;
- reason-code-to-product logic;
- Mini App protected key;
- trusted VK identity derived only from raw user id.

---

## 32. Mini App authentication transport

Official VK example permits explicit transfer of the original signed launch query to backend in an Authorization header.

Architecture choice for M5:

### Bootstrap

```text
POST /v1/vk/miniapp/session
Authorization: <explicit signed launch material contract>
```

Backend:

1. parses launch parameters without logging them;
2. validates official signature algorithm;
3. checks expected `vk_app_id`;
4. applies explicit application freshness/replay policy once approved;
5. derives verified `vk_user_id`;
6. issues an opaque application session token.

### Subsequent requests

Use server-issued opaque bearer session token rather than depending on third-party cookies across embedded VK clients.

This is OUR architecture decision for cross-client predictability.

Store only a cryptographic hash of the issued session token where practical.

No cookie-based authentication is required for V1 Mini App.

Exact session TTL and launch `vk_ts` acceptance window are application security policies that must be owner-approved/frozen before M5; they are not currently labelled VK-mandated values.

---

## 33. Mini App session persistence

Logical table:

```text
vk_miniapp_sessions
```

Conceptual fields:

```text
session_id
token_hash
vk_app_id
verified_vk_user_id
created_at
expires_at
revoked_at nullable
last_used_at nullable
```

Do not store Mini App protected key or raw launch signature material in this table.

Requests with expired/revoked session fail closed.

---

## 34. Bot → Mini App handoff

Bot already knows the VK user identity from trusted Callback event fields for direct message flow.

Architecture:

```text
Bot state/result
→ generate cryptographically strong opaque handoff token
→ persist only token hash + expected VK user + result/session reference
→ put opaque token only in open_app hash/navigation
→ Mini App launches
→ Mini App backend verifies signed VK identity
→ redeem handoff
→ expected_vk_user_id MUST equal verified_vk_user_id
→ attach result/flow to Mini App session
```

No DOB/gender/product is trusted from the URL/hash.

---

## 35. Handoff persistence/security

Logical table:

```text
vk_handoffs
```

Conceptual fields:

```text
handoff_id
token_hash
expected_vk_user_id
source_surface
target_surface
bot_session_reference nullable
result_id nullable
created_at
expires_at
redeemed_at nullable
redeemed_session_id nullable
status
```

Raw handoff token is never logged and preferably never stored after creation.

Redemption rules:

- token hash match;
- not expired;
- not revoked;
- expected verified user match;
- one-time redemption for binding;
- subsequent app work uses the authenticated app session, not repeated handoff token reuse.

Exact handoff lifetime is OUR security/product policy and must be frozen before M5/M6.

---

## 36. `open_app` capability boundary

The field contract is verified, but current app/community values and client behavior require staging.

Before exposing CTA:

- registered app id verified;
- owner id value verified with actual app/community;
- hash delivered as expected;
- web/Android/iOS client matrix tested where product will be supported.

If `open_app` is unavailable:

```text
Bot recommendation remains complete
```

Do not invent a deep-link fallback.

---

## 37. Mini App → community messages

Current status remains:

```text
UNRESOLVED
```

`VKWebAppAllowMessagesFromGroup` proves permission request, not navigation to a specific dialog.

Until an official/staging-supported navigation primitive is verified:

- no guessed `vk.me` implementation in product code;
- no fake Bridge method;
- M5 Mini App can still perform recommendation/product action independently;
- corresponding Mini App→messages/human handoff remains blocked.

---

## 38. CORS and web security

M5 backend accepts requests only from configured Mini App origins as validated during deployment/staging.

Policy:

- no wildcard CORS with credentials;
- Authorization header explicitly allowed for Mini App API;
- no protected key in JS;
- HTTPS only outside local development;
- CSP/frontend headers configured at actual hosting layer where supported;
- frontend launch params never leaked via third-party Referer/resources;
- avoid unnecessary third-party scripts on authenticated Mini App pages.

Exact official hosting origin list is validated when the app is registered/deployed.

---

## 39. Availability/product destination boundary

M4 enriches already selected recommendation:

```text
semantic result
→ destination lookup
→ availability overlay
→ UI action
```

It never feeds back into Core selection.

If product unavailable/unknown:

- semantic result stays unchanged;
- product action may be disabled/changed according to UX;
- no automatic different product.

Bot and Mini App consume the same destination mapping service.

---

## 40. Failure isolation

### Recommendation Core unavailable/config invalid

- `/readyz` fails;
- no semantic recommendation served;
- Callback events may remain durable pending/failed rather than generate guessed output.

### VK outbound API unavailable

- Callback receiver still durably accepts events if local storage works;
- outbox queues response;
- bounded retry policy handles verified transient classes.

### State DB unavailable

- Bot readiness fails;
- Callback ordinary event is not falsely acknowledged as durably accepted;
- Recommendation API may remain available if it is stateless and Core-ready, depending on deployment feature mode.

### Mini App backend auth failure

- no trusted user/session;
- no handoff redemption;
- frontend shows safe auth/start error, not a guessed identity.

---

## 41. Feature readiness model

One service may expose multiple feature readiness states:

```text
recommendation_api_ready
vk_bot_local_ready
vk_platform_preflight_verified
miniapp_backend_ready
```

Overall deployment policy decides which are mandatory for a given rollout stage.

Example M3 Bot rollout requires:

```text
recommendation_api_ready = true
vk_bot_local_ready = true
vk_platform_preflight_verified = true
```

M2 API-only rollout does not require VK community configuration.

---

## 42. Configuration/secrets

Proposed server configuration keys (names may be mechanically adjusted during implementation):

```text
KIP_VK_ENABLED
KIP_VK_API_VERSION
KIP_VK_GROUP_ID
KIP_VK_GROUP_TOKEN
KIP_VK_CALLBACK_SERVER_ID
KIP_VK_CALLBACK_SECRET
KIP_VK_CALLBACK_CONFIRMATION_CODE
KIP_VK_STATE_DB_PATH

KIP_VK_MINIAPP_ENABLED
KIP_VK_MINIAPP_APP_ID
KIP_VK_MINIAPP_PROTECTED_KEY
KIP_VK_MINIAPP_ALLOWED_ORIGINS
KIP_VK_MINIAPP_SESSION_TTL
KIP_VK_HANDOFF_TTL
```

Secrets outside repo.

Runtime validates required combinations and fails readiness on partial/misconfigured feature enablement.

No secret defaults.

Security TTL values must be explicit configuration, not silently invented framework defaults.

---

## 43. Environment separation

At minimum:

```text
local
staging VK community + staging/test Mini App
production VK community + production Mini App
```

Never use production user traffic as the first protocol discovery environment.

Environment-specific:

- group id;
- group token;
- callback server id/url/secret/code;
- Mini App id/key;
- DB path;
- allowed origins.

Business recommendation matrix remains versioned shared authority unless an explicit environment test fixture overrides it only inside tests.

---

## 44. Staging contract capture

Before M3 closes, capture sanitized real VK fixtures for:

- confirmation;
- `message_new` plain text;
- text button click with payload;
- client without keyboard dependence;
- duplicate callback delivery simulation;
- `messages.send` success;
- representative permanent error where safe;
- callback server/settings/token permission readback.

Before M5 closes:

- signed launch params web/Android/iOS as supported;
- `VKWebAppInit` behavior;
- Mini App static hosting URL/origin;
- open_app launch/handoff behavior;
- Bridge capability checks.

Fixture source metadata accompanies every fixture.

---

## 45. Test pyramid

### Unit

- date text parsing;
- payload parsing;
- state transitions;
- presenter;
- retry classifier;
- token/handoff hashing;
- signature verifier;
- serializers.

### Official contract tests

Official-schema/staging fixtures against:

- Callback parser;
- normalizer;
- keyboard serializer;
- VK API response parser;
- preflight response parser;
- Mini App launch verifier.

### Local integration

```text
HTTP callback
→ SQLite inbox
→ worker
→ session/result/outbox
→ fake VK API
→ SENT
```

Test crash points:

- duplicate Callback;
- crash after inbox commit;
- crash after state/outbox commit;
- outbound transient failure;
- restart with pending outbox.

### Staging VK

Real dedicated community/App.

### Cross-layer parity

All canonical business cases produce same result across Core/API/Bot/Mini App.

---

## 46. Mandatory reliability tests

Before M3 PASS:

```text
same event_id twice → one state transition
same event_id twice → one logical outbox response
outbox retry → same random_id
process restart with pending event → event processed once
process restart with pending outbox → send resumes
invalid Callback secret → zero side effects
wrong group id → zero side effects
unknown event → zero recommendation side effects
keyboard unsupported → text flow still completes
malformed button payload → cannot set invalid semantic state
VK permanent send error → no infinite retry
VK unknown error → operator-visible fail closed
```

---

## 47. Mandatory Mini App security tests

Before M5 PASS:

```text
missing sign → reject
bad sign → reject
wrong app id → reject
unsigned vk_user_id substitution → reject
valid signed launch → trusted user established
raw launch query absent from logs
protected key absent from frontend bundle
expired/replayed launch according to approved app policy → reject
session token hash mismatch → reject
expired session → reject
handoff token wrong user → reject
handoff replay after redemption → reject
Bot and Mini App same input → same semantic result
```

---

## 48. No background magic

All asynchronous behavior has durable state.

Forbidden architecture:

```text
fire-and-forget in-memory task
→ process crash loses customer reply
```

Required:

```text
persist intent first
→ worker may retry/recover after restart
```

FastAPI background tasks alone are not the durable queue.

SQLite outbox/inbox are the V1 durability mechanism.

---

## 49. Process lifecycle

On start:

1. load non-secret + secret config;
2. validate business configuration;
3. initialize Core;
4. if VK Bot enabled, validate local VK config;
5. open/migrate-check state DB;
6. start inbound worker;
7. start outbox worker;
8. expose readiness only after local dependencies ready.

On graceful shutdown:

- stop claiming new work;
- allow bounded in-flight local transaction completion;
- cancel/close outbound HTTP client;
- release claims/leases safely;
- close DB connections.

Pending durable rows remain for next start.

---

## 50. Production HTTPS boundary

Backend application itself need not terminate public TLS.

Deploy behind a maintained HTTPS reverse proxy/load balancer.

Required externally:

- valid HTTPS Callback URL;
- request body limits;
- sane proxy timeouts;
- preserve actual method/path;
- no caching of Callback/API responses;
- restricted internal diagnostic endpoints.

Exact reverse-proxy product is deployment-specific and does not alter application contracts.

---

## 51. Admin/diagnostic surface

Prefer CLI/admin-local diagnostics instead of public mutation endpoints.

Examples:

```text
vk preflight
vk provision
vk status
vk replay-inbound <internal-id>    # later guarded operator tool, if needed
vk retry-outbox <internal-id>      # later guarded operator tool, if needed
```

No generic arbitrary VK API proxy.

No endpoint that accepts a token from browser and calls arbitrary methods.

---

## 52. Human handoff architecture

Human handoff is an orchestration state, not a second semantic engine.

When active:

- automated recommendation conversation suppressed;
- inbound messages continue to be durably recorded;
- no automatic product changes;
- manager/customer communication remains in VK community messages.

Exact operator UI/exit control is M7 and must be documented before implementation.

Initial product must not guess a timeout that silently reactivates automation during a human conversation.

---

## 53. Analytics boundary

Analytics receives events after successful local state transitions.

It may measure:

```text
flow_started
date_submitted
gender_selected
result_shown
product_action_clicked
start_over_clicked
human_handoff_requested
validation_error
```

Analytics never writes the recommendation matrix or changes a current result.

If analytics transport fails, recommendation/outbox correctness remains unaffected.

---

## 54. M2 implementation boundary after architecture freeze

M2 may implement:

- backend project/runtime skeleton;
- shared Recommendation HTTP API;
- typed error contract;
- request/result correlation;
- local health/readiness;
- application service around current Core;
- tests.

M2 must NOT implement:

- Callback receiver;
- VK token API client;
- VK DB/state/outbox;
- Bot state;
- Mini App.

Reason: we deliberately keep M2 independent from platform credentials/staging while preserving the architecture it will live inside.

---

## 55. M3 implementation slices

M3 should not be one giant patch.

Recommended slices after PRE-M3 staging/config gate:

```text
M3.1 VK config + official contract fixtures + preflight parser
M3.2 state DB migrations/storage + inbox/outbox durability
M3.3 Callback receiver + dedup + inbound worker
M3.4 Bot date/gender state machine + text fallback
M3.5 customer presenter + keyboard serializer
M3.6 VK messages.send adapter + bounded retry classifier
M3.7 real staging end-to-end + restart/dedup tests
```

Each slice independently audited before next.

---

## 56. M4 implementation slices

```text
M4.1 destination registry normalization
M4.2 availability overlay contract
M4.3 Bot product action
M4.4 shared destination parity tests
```

No semantic reranking.

---

## 57. M5 implementation slices

After PRE-M5 official/staging gate:

```text
M5.1 scaffold official stack + static hosting/dev setup
M5.2 Bridge init/capability layer
M5.3 signed launch backend verification
M5.4 app session security
M5.5 date/gender/result UI using shared API
M5.6 Bot open_app handoff redeem path
M5.7 platform/client staging matrix
```

Mini App→community dialog remains excluded until its platform primitive is verified.

---

## 58. M6 implementation slices

Only after the missing cross-channel navigation primitive is resolved:

```text
M6.1 cross-channel handoff continuity
M6.2 Mini App → community messages/human path
M6.3 shared correlation/analytics
M6.4 duplicate-transition protection
M6.5 web/mobile parity staging
```

M6 never changes semantic recommendation.

---

## 59. Code review anti-guessing checklist

Every VK-related diff must answer:

```text
1. Which official VK contract/fixture is implemented?
2. Where is its source recorded?
3. Which behavior is our application policy instead?
4. Are any field names/types/statuses/timeouts invented from memory?
5. Does code support a historical payload shape without a fixture/version reason?
6. Does retry logic use verified error inventory?
7. Does any UI capability assume support despite client_info/Bridge capability data?
8. Does frontend compute semantic recommendation?
9. Does any unsigned value become trusted identity/product data?
10. Does a crash between receive/state/send lose or duplicate an action?
```

Any unexplained guessed platform behavior blocks merge/milestone closure.

---

## 60. Current unresolved application decisions

These are intentionally explicit rather than silently defaulted:

```text
A1 exact session active/retention TTL for Bot
A2 result audit retention
A3 inbound raw payload retention
A4 exact SQLite worker lease duration
A5 exact outbound retry attempts/backoff schedule
A6 exact generated random_id numeric convention
A7 Mini App launch freshness/replay window
A8 Mini App app-session TTL
A9 handoff TTL
A10 production Mini App allowed origins
A11 exact human-handoff operator exit mechanism
```

They are **OUR POLICY decisions**, not VK contracts.

Values must be frozen before the milestone that uses them, with tests/config; no library/framework default becomes accidental product policy.

---

## 61. Current platform unresolved items

From official-contract research:

```text
P1 exact numeric Callback ack timeout
P2 current API version must be revalidated at M3 start
P3 final required token-permission names verified with real token
P4 final messages.send retry allowlist requires staging
P5 open_app owner_id/client behavior requires actual app staging
P6 official vk_ts mandated TTL not found
P7 official Mini App → community-dialog primitive not found
P8 raw Bots Long Poll failure protocol not frozen
```

No code may convert P1–P8 into assumed VK facts.

---

## 62. Architecture gate

Before any new runtime implementation prompt is issued, verify:

```text
BUSINESS_AUTHORITY = current V2
VK_PLATFORM_ARCHITECTURE = present
VK_OFFICIAL_CONTRACT_LEDGER = present
VK_PRE_M3_CONTRACT = present
VK_IMPLEMENTATION_ARCHITECTURE = present
NO_RELEVANT_UNRESOLVED_ITEM_IS_BEING_GUESSED = yes
```

For M3/M5/M6, relevant staging gate must additionally pass.

Decision marker:

```text
KIP_VK_HYBRID_IMPLEMENTATION_ARCHITECTURE_PRE_CODE_V1
```
# Root menu and human chat mode (2026-08-29)

`BOT_MODE_ENTRY = explicit menu action`. `START` does not parse arbitrary text:
it responds with a concise route prompt and the root menu. Global menu actions
are evaluated before date/gender parsing in every state.

`HUMAN_CHAT_STATE = HUMAN_HANDOFF`. Entering it clears transient recommendation
fields and atomically enqueues one acknowledgement with the root menu.
`HUMAN_CHAT_AUTOREPLY = disabled`: ordinary messages are persisted and remain
available in the VK community conversation, but create no Bot outbox row and do
not call recommendation parsing or resolution. A repeated human menu action is
idempotent. `Подобрать оберег` exits the mode and atomically begins a fresh
`WAITING_DATE` flow (including normal Mini App handoff when enabled).
