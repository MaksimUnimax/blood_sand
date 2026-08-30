# VK Implementation Gate Matrix

Версия: 0.5  
Статус: **MANDATORY PRE-CODE GATE AUTHORITY**  
Дата: 2026-08-29  
Бренд: «Кровь и Песок»

## 1. Назначение

Этот документ отвечает на один практический вопрос:

```text
Что именно уже разрешено реализовывать,
а что ещё нельзя писать без дополнительного contract/staging/setup evidence?
```

Он не заменяет подробные документы. Он связывает их с milestone gates.

Hard rule:

```text
milestone gate != PASS
→ Codex/runtime implementation этого milestone не запускается
```

Никакой prompt не имеет права превращать `UNRESOLVED`, `STAGING_REQUIRED`, `OFFICIAL_CONFLICT` или `REVALIDATE` в guessed implementation.

---

## 2. Mandatory authority set

Перед любым новым VK runtime implementation обязательны:

```text
RECOMMENDATION_MATRIX.md
PRODUCT_CLASSIFICATION.md
CUSTOMER_RECOMMENDATION_COPY_GUIDE.md
DATA_API_CONTRACT.md
ARCHITECTURE.md

VK_PLATFORM_ARCHITECTURE.md
VK_PLATFORM_OFFICIAL_CONTRACT_LEDGER.md
VK_IMPLEMENTATION_ARCHITECTURE.md
VK_IMPLEMENTATION_GATE_MATRIX.md
ROADMAP.md
VK_UX_FLOW.md
```

Для M2 дополнительно:

```text
M2_BACKEND_DEPENDENCY_ADR.md
```

Для M3 дополнительно:

```text
VK_PLATFORM_PRE_M3_CONTRACT.md
```

Для M5 дополнительно:

```text
VK_PLATFORM_PRE_M5_CONTRACT.md
```

Для M6 дополнительно:

```text
VK_PLATFORM_PRE_M6_CONTRACT.md
```

Перед фактическим кодом каждого milestone его current external contracts всё равно revalidate на дату implementation; существование PRE-document не разрешает игнорировать явно отмеченные staging/conflict/revalidation gates.

---

## 3. Current milestone status

| Milestone | Purpose | Architecture status | Platform/setup status | Code gate |
|---|---|---|---|---|
| M1 | deterministic config/Core | CLOSED | n/a | PASS |
| M2 | shared Recommendation API/backend foundation | architecture + exact HTTP contract + dependency policy frozen | locked environment setup committed and independently audited | **CLOSED / PASS** |
| M3 | VK Community Bot | fully architected + final PRE-M3 authority frozen | real text-keyboard send/click round trip is evidenced; calendar authority remains pending | **TEXT KEYBOARD CODE GATE PASS** |
| M4 | destinations/availability overlay | high-level architecture defined | concrete destination registry/availability source gate still required | **BLOCKED UNTIL M3/M4 AUTHORITY PASS** |
| M5 | VK Mini App | authenticated HTTP proposal is ready but owner approval remains required; PRE-M5 contract exists | repository owner-registration evidence identifies app `54743026`; current VK control-plane/origin/key/real-launch evidence and security/product decisions remain | **BLOCKED** |
| M6 | Bot ↔ Mini App continuity | fully architected + PRE-M6 contract exists | Mini App → community-dialog primitive unresolved; cross-client staging required | **BLOCKED** |
| M7 | hardening/operator/analytics | architecture boundaries defined | depends on preceding runtime evidence | **BLOCKED** |
| M8 | controlled launch | roadmap defined | production gates not yet executed | **BLOCKED** |

M3 local runtime record:

```text
M3_CODE_GATE = PASS
M3_CODE_GATE_SCOPE = PLAIN_TEXT_RUNTIME_SLICE
M3_PLAIN_TEXT_RUNTIME_IMPLEMENTATION = PASS
M3_PLAIN_TEXT_RUNTIME_LOCAL_TESTS = PASS
M3_PLAIN_TEXT_RUNTIME_LOCAL_ACCEPTANCE = PASS
M3_DEPLOYABLE_WORKER_LIFECYCLE = PASS
M3_PLAIN_TEXT_RUNTIME_STAGING_DEPLOYMENT = PASS
M3_REAL_E2E_LEG_1_DATE_TO_GENDER_PROMPT = PASS
M3_REAL_E2E_LEG_2_GENDER_TO_RECOMMENDATION = PAUSED_PRODUCT_DIRECTION_CHANGE
M3_PLAIN_TEXT_RUNTIME_REAL_E2E = SUPERSEDED_BY_KEYBOARD_UX_ACCEPTANCE
M3_TEXT_KEYBOARD_UX_DECISION = PASS
M3_TEXT_KEYBOARD_SEND_STAGING_FIXTURE = PASS
M3_TEXT_KEYBOARD_CLICK_STAGING_FIXTURE = PASS
M3_TEXT_KEYBOARD_REAL_ROUND_TRIP = PASS
M3_KEYBOARD_CODE_GATE = PASS_TEXT_KEYBOARD_V1
M3_CALENDAR_UX_DIRECTION = TEXT_OR_MINI_APP_CALENDAR
M3_TEXT_KEYBOARD_RUNTIME_IMPLEMENTATION = PASS
M3_TEXT_KEYBOARD_RUNTIME_STAGING_DEPLOYMENT = PASS
M3_KEYBOARD_CODE_GATE = PASS_TEXT_KEYBOARD_V1
M3_CALENDAR_UX_DIRECTION = TEXT_OR_MINI_APP_CALENDAR
M3_CALENDAR_ARCHITECTURE_GATE = PASS
M3_CALENDAR_LIVE_STAGING_GATE = BLOCKED_PENDING_REGISTERED_MINI_APP_IDENTITY
NEXT_M3_GATE = REGISTERED_MINI_APP_IDENTITY_THEN_CALENDAR_HANDOFF_IMPLEMENTATION
```


The formerly plain-text Leg 2 is not keyboard-compliant acceptance evidence:
the observed manual-text interaction is retained only as compatibility context,
not recorded as a final UX PASS. The real staging text-keyboard send fixture is
`tests/fixtures/vk/staging/messages_send_text_keyboard_success.v5_199.sanitized.json`.

---

## 4. M2 gate — shared Recommendation API

Current authorities:

```text
DATA_API_CONTRACT.md
VK_IMPLEMENTATION_ARCHITECTURE.md
M2_BACKEND_DEPENDENCY_ADR.md
```

### Dependency/setup baseline

```text
M1 configuration/Core closed
hybrid one-product roadmap fixed
VK platform architecture documented
full implementation architecture documented
Python project baseline >=3.11 frozen
FastAPI 0.141.1 frozen
Uvicorn 0.52.4 frozen
Pydantic 2.13.5 frozen
HTTPX stable 0.28.1 frozen
uv 0.12.7 selected as lock/project tool
pyproject.toml + uv.lock chosen as dependency authority
normal sync/run must use --locked
production/CI automatic Python downloads disabled
M2 does not require a VK token/community/App
```

### Completed setup evidence

Setup commit:

```text
7ac8a58710888835532f6c6f060415dc688c6aaa
build(recommendations): freeze M2 locked Python environment
```

Parent/documentation authority HEAD:

```text
09408c0e059eff769b9016f43565f3e69a10e05d
```

Independent GitHub audit verifies the setup commit changes exactly:

```text
.gitignore
pyproject.toml
uv.lock
```

No recommendation Core/data/tests/docs/API/VK/Bot/Mini App runtime source changed in that setup commit.

Committed `pyproject.toml` verifies:

```text
requires-python >=3.11
fastapi==0.141.1
uvicorn==0.52.4
pydantic==2.13.5
httpx==0.28.1
```

Committed `uv.lock` contains the same direct pins and a resolved transitive lock.

The setup run reported locally:

```text
Python 3.12.3
uv 0.12.7
UV_PYTHON_DOWNLOADS disabled
48/48 existing M1 tests PASS
configuration validator exit 0
uv.lock SHA unchanged by tests
MQO HEAD unchanged
```

Repository-side audit cannot independently prove local shell execution in the absence of CI status/checks; those execution facts remain run evidence. The committed setup scope/dependency artifacts themselves are independently verified and satisfy the pre-code setup gate.

### Exact HTTP contract freeze

Exact M2 HTTP transport/error/readiness/correlation contract was frozen before application code in:

```text
5188e3d83e5df7db3e3ad93fe0e19162582652dd
docs(recommendations): freeze exact M2 HTTP API contract
```

That authority now fixes before code:

```text
POST /v1/recommendations/resolve
GET /healthz
GET /readyz
strict request fields/non-coercion
16384-byte body limit
exact success JSON
X-Request-Id / X-Result-Id
health/readiness behavior
400 MALFORMED_JSON
413 PAYLOAD_TOO_LARGE
415 UNSUPPORTED_MEDIA_TYPE
422 INVALID_REQUEST
503 CONFIGURATION_UNAVAILABLE
500 CORE_ERROR
500 INTERNAL_ERROR
404 NOT_FOUND
405 METHOD_NOT_ALLOWED
one project error envelope
application-service/Core parity
structured request-completion logging
locked Uvicorn runtime command
```

No framework default error body/status may silently override this authority.

### M2 closure — final contract audit

M2 scope was limited to:

```text
shared application service
POST /v1/recommendations/resolve
GET /healthz
GET /readyz
typed transport/error handling
correlation
structured M2 request logging
API/Core parity tests
```

M2 must not implement:

```text
Callback
messages.send
VK token use
VK state DB/inbox/outbox
Bot state
Mini App
```

Independent M2 evidence chain:

```text
setup: 7ac8a58710888835532f6c6f060415dc688c6aaa
exact HTTP authority: 5188e3d83e5df7db3e3ad93fe0e19162582652dd
M2 implementation: 89eb375744b09988a5c1143975309d692d13e200
contract completeness: 37fa50f4121e488edff24614bedd21a8ada2e464
final transport evidence: b29c641a4734f0d48c3c4eb23bcb2cb6689f1f6d
```

Current status:

```text
M2_ARCHITECTURE_GATE = PASS
M2_DEPENDENCY_POLICY_GATE = PASS
M2_LOCAL_SYNC_GATE = PASS
M2_LOCK_ARTIFACT_GATE = PASS
M2_LOCKED_ENV_REGRESSION_GATE = PASS_RUN_EVIDENCE
M2_SETUP_INDEPENDENT_GITHUB_AUDIT = PASS
M2_EXACT_HTTP_CONTRACT_GATE = PASS
M2_SETUP_CODE_GATE = CLOSED_COMPLETE
M2_APPLICATION_SERVICE = PASS
M2_HTTP_API = PASS
M2_API_CORE_PARITY = PASS
M2_TRANSPORT_CONTRACT = PASS
M2_FINAL_INDEPENDENT_GITHUB_AUDIT = PASS
M2_CODE_GATE = CLOSED_COMPLETE
M2 = CLOSED / PASS
```

Next milestone:

```text
PRE-M3 REAL VK STAGING CONTRACT
```

---

## 5. M3 gate — Community Bot

Current official-contract authority:

```text
VK_PLATFORM_PRE_M3_CONTRACT.md
```

M3 code was blocked until a dedicated test VK community/staging pass produced a
short final ADR and sanitized fixtures. That authority is now complete for the
plain-text runtime slice only.

Required before the first M3 runtime patch:

```text
VK_API_VERSION = revalidated current explicit value
VK_GROUP_ID = staging community configured outside repo
GROUP_TOKEN_PERMISSION_RESPONSE = captured/sanitized
TOKEN_STAGING_SEND = PASS
CALLBACK_SERVER_ID = verified
CALLBACK_SERVER_STATUS = ok
CALLBACK_API_VERSION = expected explicit version
MESSAGE_NEW_ENABLED = yes
BOT_CAPABILITIES_ENABLED = yes if keyboard used
CALLBACK_CONFIRMATION = real staging PASS
MESSAGE_NEW_FIXTURE = real staging captured/sanitized
TEXT_KEYBOARD_FIXTURE = captured/sanitized if used
MESSAGES_SEND_SUCCESS_FIXTURE = captured/sanitized
PERMANENT_ERROR_FIXTURE = captured/sanitized where safely reproducible
RETRY_POLICY = explicit bounded allowlist/classification
```

No guessed token permission names/bitmasks.
No guessed Callback numeric timeout.
No historic flat `message_new` parser without a current fixture.
No automatic remote provisioning on runtime startup.

Current status:

```text
M1 = CLOSED / PASS
M2 = CLOSED / PASS
M3_ARCHITECTURE_GATE = PASS
M3_OFFICIAL_CONTRACT_BASELINE = PASS
M3_OFFICIAL_API_VERSION_REVALIDATION = PASS (VK_API_VERSION = 5.199)
M3_READ_ONLY_STAGING_DISCOVERY = PASS
M3_READ_ONLY_STAGING_DISCOVERY_EVIDENCE = recommendations/VK_PLATFORM_M3_STAGING_DISCOVERY.md (real staging calls at v=5.199)
GROUP_TOKEN_PERMISSIONS_DISCOVERY = PASS
GROUP_TOKEN_PERMISSIONS = messages, manage
GROUP_TOKEN_GETSETTINGS = NOT_APPLICABLE_BY_OFFICIAL_ACCESS_TOKEN_CONTRACT
PROJECT_CALLBACK_SERVER = VERIFIED (id = 4; status = ok)
LEGACY_CALLBACK_SERVER_PRESENT = yes
LEGACY_CALLBACK_SERVER_MUTATION_ALLOWED = no
M3_WRITE_STAGING = PASS
M3_CALLBACK_CONFIRMATION = PASS
M3_REAL_MESSAGE_NEW_FIXTURE = PASS
M3_REAL_MESSAGES_SEND_FIXTURE = PASS
FINAL_REQUIRED_PERMISSION_NAMES = FROZEN
RETRY_POLICY = FROZEN_BOUNDED_V1
M3_FINAL_GATE_ADR = PASS
M3_INITIAL_RUNTIME_SLICE = PLAIN_TEXT_ONLY
M3_KEYBOARD_CODE_GATE = BLOCKED_PENDING_REAL_TEXT_KEYBOARD_STAGING_FIXTURE
M3_CODE_GATE = PASS
M3_CODE_GATE_SCOPE = PLAIN_TEXT_RUNTIME_SLICE
REMAINING_M3_CODE_GATE_BLOCKERS = none
```

---

## 6. M4 gate — product destination / availability

Before M4 code:

1. freeze one canonical destination registry authority per product/marketplace;
2. verify URLs/IDs from current owner-approved registry/platform source;
3. define availability source, refresh behavior and `AVAILABLE|UNAVAILABLE|UNKNOWN` semantics;
4. prove availability cannot change `product_key`;
5. define Bot and Mini App action behavior for unavailable/unknown destination.

Hard invariant:

```text
availability/destination failure
!= semantic recommendation change
```

Current status:

```text
M4_SEMANTIC_BOUNDARY = PASS
M4_DATA_SOURCE_GATE = PENDING
M4_CODE_GATE = BLOCKED
```

---

## 7. M5 gate — Mini App

Current official-contract authority:

```text
VK_PLATFORM_PRE_M5_CONTRACT.md
```

Research-time verified baseline includes:

```text
create-vk-mini-app 3.0.0
Node >= 18 in generator
VK Bridge repo 3.0.2
VKUI repo 8.4.0
VK Mini Apps Router repo 1.8.6
VKWebAppInit contract
VKWebAppGetLaunchParams typed result
supportsAsync capability API
signed launch authentication algorithm
VKWebAppAllowMessagesFromGroup boundary
VKWebAppOpenApp boundary
```

A current official-source conflict is explicitly recorded:

```text
generator template: @vkontakte/vk-miniapps-deploy ^0.1.6
official deploy repo: all versions <1.0.0 deprecated/unsupported
```

Therefore no M5 scaffold may blindly copy that stale generated dependency.

Before M5 code freeze:

```text
current official package versions revalidated at implementation date
supported deploy-tool version conflict resolved
exact package versions pinned + lockfile committed
current hosting/deploy mechanism and staging origin verified
registered VK app id configured
VKWebAppInit staging behavior captured
Bridge capability behavior captured
actual launch parameter fixture captured
official signature algorithm revalidated
expected vk_app_id validation defined
application freshness/replay policy frozen
Mini App backend session TTL frozen
allowed frontend origins frozen
open_app app_id/owner_id/hash behavior verified in staging before CTA production
web/Android/iOS support matrix captured for selected rollout
```

Important:

```text
VK_TS_MANDATED_TTL = currently UNRESOLVED
```

If current VK documentation still defines no mandated TTL, the project may adopt an owner-approved application freshness policy, but it must be labelled `OUR SECURITY POLICY`, never “VK requires N seconds”.

Mini App code may not trust `vk_user_id` before signature + expected-app validation.

Current status:

```text
M5_LOGICAL_ARCHITECTURE = PASS
M5_OFFICIAL_CONTRACT_BASELINE = PASS
M5_DEPLOY_TOOL_OFFICIAL_CONFLICT = PENDING_RESOLUTION
M5_CURRENT_VERSION_REVALIDATION = PENDING_AT_IMPLEMENTATION
M5_REGISTERED_APP_STAGING = PENDING
M5_SECURITY_POLICY_FREEZE = PENDING
M5_CODE_GATE = BLOCKED
```

---

## 8. M6 gate — cross-channel continuity

Current authority:

```text
VK_PLATFORM_PRE_M6_CONTRACT.md
```

Bot → Mini App has a verified official keyboard `open_app` field schema, but actual registered app/community values and client behavior require staging.

Mini App → community conversation is still not proven by an official current primitive.

Verified non-solutions:

```text
VKWebAppAllowMessagesFromGroup = permission, not dialog navigation
VKWebAppOpenApp = Mini App → another app, not community dialog
VKWebAppClose = exists, but target return destination is not a verified community-dialog contract
```

Therefore before M6 code:

```text
BOT_TO_APP_OPEN_APP_STAGING = PASS
HANDOFF_IDENTITY_MATCH_TEST = PASS
HANDOFF_TTL_POLICY = frozen as application policy
HANDOFF_ONE_TIME_REDEMPTION = contract frozen
MINIAPP_TO_COMMUNITY_DIALOG_PRIMITIVE = VERIFIED or feature explicitly excluded
CROSS_CLIENT_MATRIX = PASS for supported clients
DUPLICATE_TRANSITION_POLICY = frozen/tested
```

No guessed `vk.me/...` link may be introduced as an official platform mechanism.

Current status:

```text
M6_OFFICIAL_CONTRACT_BOUNDARY = PASS
M6_BOT_TO_APP_SCHEMA = PASS
M6_BOT_TO_APP_STAGING = PENDING
M6_APP_TO_MESSAGES_PRIMITIVE = UNRESOLVED
M6_CODE_GATE = BLOCKED
```

---

## 9. Application-policy gate

Not every value comes from VK. The following are explicitly product/security/operations decisions and must be frozen before the milestone that uses them:

```text
Bot session active TTL/retention
recommendation result retention
raw inbound event retention
worker lease/stale-claim interval
outbound retry attempts/backoff
random_id generation convention
Mini App launch freshness/replay window
Mini App application-session TTL
handoff TTL
production allowed origins
human-handoff exit mechanism
```

Rule:

```text
framework/library default
!= automatically approved product policy
```

Each value must be visible in configuration/ADR/tests rather than hidden in framework defaults.

---

## 10. Local worktree synchronization gate

Before any Codex/local implementation:

```text
git fetch origin
verify local branch is dev/vk-recommendations-m1-2026-08-29
verify no local uncommitted work
fast-forward only to the exact independently verified remote HEAD
verify status clean
```

Never reset/force over unknown local work.
The implementation prompt must name the exact expected starting HEAD.

---

## 11. Review gate for every implementation diff

Reviewer must be able to answer:

```text
1. Which authority defines this business behavior?
2. Which official VK contract/staging fixture defines this platform behavior?
3. Which part is explicitly our architecture/policy?
4. Is any unresolved/conflicting value being guessed?
5. Are historical VK payload shapes being supported without evidence?
6. Can a duplicate event cause duplicate state/send?
7. Can a crash lose an acknowledged event or planned reply?
8. Can a channel/UI alter recommendation semantics?
9. Can unsigned/untrusted data become identity or recommendation authority?
10. Did this diff stay inside its milestone scope?
```

Any unexplained failure blocks milestone closure.

---

## 12. Current next action

M2 setup is complete and independently audited at repository level.
M2 exact HTTP contract is frozen before code.

The next code allowed is **M2 shared Recommendation API/application-service implementation only**, using the exact locked environment and current `DATA_API_CONTRACT.md` / `VK_IMPLEMENTATION_ARCHITECTURE.md`.

M3 still waits for real VK community staging/config evidence.
M5 waits for current-version/deploy-conflict resolution, registered app staging and explicit security policy.
M6 waits for Bot→App staging and resolution/exclusion of the Mini App→community-dialog feature.

Decision marker:

```text
KIP_VK_IMPLEMENTATION_GATE_MATRIX_V5
```
## M3 calendar handoff (2026-08-29)

| Gate | State |
|---|---|
| M3 calendar architecture | PASS |
| backend code | PASS (local implementation) |
| frontend code | PASS (build/test) |
| static staging deployment | BLOCKED pending controlled nginx deployment |
| live open_app | BLOCKED_PENDING_PROTECTED_KEY_AND_OPEN_APP_OWNER_ID |
# Root menu / human-chat gate policy (2026-08-29)

Deterministic code acceptance covers the strict versioned menu payloads,
non-inline `one_time=false` root menu, inline gender keyboard, legacy restart
input compatibility, atomic transition/outbox rollback, and human autoreply
suppression. `VK_ROOT_MENU_LIVE_GATE` and
`VK_HUMAN_CHAT_SUPPRESSION_LIVE_GATE` remain staging acceptance gates.

`M3_CALENDAR_LIVE_OPEN_APP_GATE` remains paused until the owner completes the
real Mini App flow under this persistent-menu architecture.

## Textual birth-date product decision (2026-08-30)

```text
BIRTH_DATE_INPUT_MODE = DATEPARSER_TEXT
BIRTH_DATE_ORDER = DAY_MONTH_YEAR
DATEPARSER_LANGUAGES = ru,en
CUSTOM_DATE_NLP = no
CUSTOM_COMPACT_DATE_HEURISTICS = no
CHAT_DATE_PICKER = RETIRED_FROM_ACTIVE_UX
MINIAPP_DATE_PICKER = RETIRED_FROM_ACTIVE_UX
BIRTH_DATE_PRIMARY_TEXT_INPUT = ACTIVE
BIRTH_DATE_CHAT_BUTTON_PICKER = RETIRED_FROM_ACTIVE_UX
BIRTH_DATE_MINIAPP_PICKER = RETIRED_FROM_ACTIVE_UX
MINIAPP_INFRASTRUCTURE = RETAINED_FOR_FUTURE_PRODUCT_USE
ACTIVE_DATE_OPEN_APP = no
ACTIVE_DATE_HANDOFF = no
CHAT_DATE_PICKER_TRANSPORT = RETIRED_FROM_ACTIVE_UX
CHAT_DATE_PICKER_INLINE = no
ROOT_MENU_PERSISTENT = yes
RECOMMENDATION_RUNTIME_LLM = no
DATE_PARSER_RUNTIME_LLM = no
VK_CHAT_DATE_PICKER_LIVE_GATE = NOT_APPLICABLE_PRODUCT_DECISION
VK_TEXUAL_BIRTH_DATE_CODE_GATE = PASS
VK_TEXTUAL_BIRTH_DATE_LIVE_GATE = NOT_YET_EXERCISED
M3_CALENDAR_LIVE_OPEN_APP_GATE = NOT_APPLICABLE_PRODUCT_DECISION
```

The historical Mini App investigation and its security regression coverage
remain valid, but are no longer a release gate for the birth-date UX.

---

## M5 implementation revalidation — 2026-08-30

Evidence ADR: `VK_PLATFORM_M5_IMPLEMENTATION_REVALIDATION_2026-08-30.md`.

| Gate | Status | Revalidated evidence |
|---|---|---|
| official package baseline | PASS | exact current official commits/versions in ADR |
| generator/deploy conflict | PASS | generator ^0.1.6; official deploy 1.0.2; <1.0.0 unsupported |
| Bridge init/launch/capability | PASS | current Bridge source and current Developer documentation |
| registered app/static origin | STAGING_REQUIRED | Mini App disabled; static route 404; no registration proof |
| real signed launch | STAGING_REQUIRED | no sanitized registered-app fixture |
| security policies | OWNER_POLICY_REQUIRED | freshness, session, token, origins, retention unfrozen |
| standalone M5 HTTP contract | UNRESOLVED | public M2 is frozen; M5 transport is proposal only |
| product action | PARTIAL | one action approved; destination/presentation unfrozen |

```text
M5_CODE_GATE=BLOCKED
```

The retired Bot calendar handoff remains inactive. Its `open_app` staging
evidence belongs to M6 and is not a standalone-M5 prerequisite.

## M5 owner-policy/HTTP/product freeze — 2026-08-30

Authority: `VK_PLATFORM_M5_OWNER_POLICY_FREEZE_2026-08-30.md`.

```text
S1_LAUNCH_POLICY=OWNER_APPROVED
S1_RUNTIME_ENABLEMENT=STAGING_REQUIRED
S2_SESSION_TTL_POLICY=OWNER_APPROVED
S3_HANDOFF_POLICY=DEFER_TO_M6
S4_TOKEN_POLICY=OWNER_APPROVED
S5_ALLOWED_ORIGIN_RULE=OWNER_APPROVED
S5_ALLOWED_ORIGIN_VALUES=STAGING_REQUIRED
S6_SESSION_LIFECYCLE_POLICY=OWNER_APPROVED
S7_RAW_LAUNCH_RETENTION_POLICY=OWNER_APPROVED
M5_HTTP_CONTRACT=FROZEN
MINIAPP_PRODUCT_ACTION_CONTRACT=FROZEN
M5_CODE_GATE=BLOCKED
```

Only current external staging evidence remains: control-plane registration,
enabled/protected-key config, registered origins, real Bridge/launch/signature
fixtures, proven `vk_ts` unit, and selected-client launches. Owner 300/60/900
second values are not VK requirements.
