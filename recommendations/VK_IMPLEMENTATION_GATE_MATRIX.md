# VK Implementation Gate Matrix

Версия: 0.3  
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
| M2 | shared Recommendation API/backend foundation | documented + dependency policy frozen | local worktree sync + actual `pyproject.toml`/`uv.lock` setup/regression still required | **SETUP SLICE ALLOWED; APPLICATION CODE AFTER SETUP PASS** |
| M3 | VK Community Bot | fully architected + PRE-M3 contract exists | real community/token/Callback fixtures still required | **BLOCKED** |
| M4 | destinations/availability overlay | high-level architecture defined | concrete destination registry/availability source gate still required | **BLOCKED UNTIL M3/M4 AUTHORITY PASS** |
| M5 | VK Mini App | fully architected + PRE-M5 contract exists | official deploy-tool conflict + app/security/client staging remain | **BLOCKED** |
| M6 | Bot ↔ Mini App continuity | fully architected + PRE-M6 contract exists | Mini App → community-dialog primitive unresolved; cross-client staging required | **BLOCKED** |
| M7 | hardening/operator/analytics | architecture boundaries defined | depends on preceding runtime evidence | **BLOCKED** |
| M8 | controlled launch | roadmap defined | production gates not yet executed | **BLOCKED** |

---

## 4. M2 gate — shared Recommendation API

Current dependency authority:

```text
M2_BACKEND_DEPENDENCY_ADR.md
```

### Already satisfied

```text
M1 configuration/Core closed
DATA_API_CONTRACT corrected/aligned
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

### Required setup slice before application code

1. Fast-forward local VK worktree to exact independently verified remote docs HEAD.
2. Verify clean worktree; never reset unknown local work.
3. Record `python3 --version`; require >=3.11.
4. Install/verify exact `uv 0.12.7`; do not use moving `latest` without version check.
5. Create `pyproject.toml` with `requires-python >=3.11` and exact direct pins from ADR.
6. Generate and commit `uv.lock` with uv 0.12.7.
7. Recreate clean environment using `UV_PYTHON_DOWNLOADS=never uv sync --locked` or equivalent exact current setting.
8. Run all existing M1 tests through `uv run --locked`.
9. Verify normal sync/test did not modify `uv.lock`.
10. Independently audit the setup diff before any M2 application source is written.

Only after setup PASS may M2 application code implement:

```text
shared application service
POST /v1/recommendations/resolve
GET /healthz
GET /readyz
typed transport/error handling
correlation
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

Current status:

```text
M2_ARCHITECTURE_GATE = PASS
M2_DEPENDENCY_POLICY_GATE = PASS
M2_LOCAL_SYNC_GATE = PENDING
M2_LOCK_ARTIFACT_GATE = PENDING_SETUP
M2_LOCKED_ENV_REGRESSION_GATE = PENDING_SETUP
M2_SETUP_CODE_GATE = OPEN_FOR_SETUP_ONLY
M2_APPLICATION_CODE_GATE = BLOCKED_UNTIL_SETUP_PASS
```

---

## 5. M3 gate — Community Bot

Current official-contract authority:

```text
VK_PLATFORM_PRE_M3_CONTRACT.md
```

M3 code remains blocked until a dedicated test VK community/staging pass produces a short final ADR and sanitized fixtures.

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
M3_ARCHITECTURE_GATE = PASS
M3_OFFICIAL_CONTRACT_BASELINE = PASS
M3_STAGING_CONTRACT_GATE = PENDING
M3_CODE_GATE = BLOCKED
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

Documentation commits in this phase were made directly to the remote dev branch.

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

Documentation architecture for M2/M3/M5/M6 is present and M2 dependency policy is frozen.

The only code currently allowed is an **M2 setup-only slice** to synchronize the local worktree and create the reviewed dependency metadata/lock environment. No application endpoint code is allowed in that setup slice.

After independent audit of that setup slice:

```text
M2_APPLICATION_CODE_GATE may open
```

M3 waits for real VK community staging/config evidence.

M5 waits for current-version/deploy-conflict resolution, registered app staging and explicit security policy.

M6 waits for Bot→App staging and resolution/exclusion of the Mini App→community-dialog feature.

Decision marker:

```text
KIP_VK_IMPLEMENTATION_GATE_MATRIX_V3
```
