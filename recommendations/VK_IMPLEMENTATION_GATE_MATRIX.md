# VK Implementation Gate Matrix

Версия: 0.1  
Статус: **MANDATORY PRE-CODE GATE AUTHORITY**  
Дата: 2026-08-29  
Бренд: «Кровь и Песок»

## 1. Назначение

Этот документ отвечает на один практический вопрос:

```text
Что именно уже разрешено реализовывать,
а что ещё нельзя писать без дополнительного VK contract/staging evidence?
```

Он не заменяет подробные документы. Он связывает их с milestone gates.

Hard rule:

```text
milestone gate != PASS
→ Codex/runtime implementation этого milestone не запускается
```

Никакой prompt не имеет права превращать `UNRESOLVED`, `STAGING_REQUIRED` или `REVALIDATE` в guessed implementation.

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

Для M3 дополнительно:

```text
VK_PLATFORM_PRE_M3_CONTRACT.md
```

Для M5/M6 перед кодом должны быть созданы и проверены соответствующие PRE-M5/PRE-M6 contract/ADR artifacts после повторной проверки текущей VK documentation/staging behavior.

---

## 3. Current milestone status

| Milestone | Purpose | Architecture status | Platform/staging status | Code gate |
|---|---|---|---|---|
| M1 | deterministic config/Core | CLOSED | n/a | PASS |
| M2 | shared Recommendation API/backend foundation | documented | no VK credential/runtime primitive required | **ALLOWED AFTER LOCAL WORKTREE SYNC + DEPENDENCY FREEZE** |
| M3 | VK Community Bot | fully architected | real community/token/Callback fixtures still required | **BLOCKED** |
| M4 | destinations/availability overlay | high-level architecture defined | concrete destination registry/availability source gate still required | **BLOCKED UNTIL M3/M4 AUTHORITY PASS** |
| M5 | VK Mini App | fully architected at logical/security level | package versions, launch freshness policy, registered app/open_app staging required | **BLOCKED** |
| M6 | Bot ↔ Mini App continuity | architecture defined | Mini App → community-dialog primitive unresolved; cross-client staging required | **BLOCKED** |
| M7 | hardening/operator/analytics | architecture boundaries defined | depends on preceding runtime evidence | **BLOCKED** |
| M8 | controlled launch | roadmap defined | production gates not yet executed | **BLOCKED** |

---

## 4. M2 gate — shared Recommendation API

### Already satisfied

```text
M1 configuration/Core closed
DATA_API_CONTRACT corrected/aligned
hybrid one-product roadmap fixed
VK platform architecture documented
full implementation architecture documented
M2 does not require a VK token/community/App
```

### Required immediately before M2 code

1. Fast-forward local VK worktree to current remote dev docs HEAD.
2. Verify clean worktree.
3. Re-read current `DATA_API_CONTRACT.md` and `VK_IMPLEMENTATION_ARCHITECTURE.md` from that HEAD.
4. Inspect current Python/runtime conventions in repository.
5. Research current stable versions/support status of selected backend dependencies from their primary documentation/package metadata.
6. Freeze exact dependency versions and supported Python version in an M2 implementation/dependency ADR or lock artifact.
7. Do not add any VK transport behavior to M2.

M2 may implement only:

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
M2_LOCAL_SYNC_GATE = PENDING
M2_DEPENDENCY_FREEZE_GATE = PENDING
M2_CODE_GATE = NOT_YET_OPEN
```

---

## 5. M3 gate — Community Bot

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

Before M5 code, perform a fresh official VK Mini Apps documentation/repository pass and create PRE-M5 authority.

Must verify/freeze:

```text
current official create-vk-mini-app version
current Node requirement
exact VKUI/Bridge/Router/Vite dependency versions
current hosting/deploy mechanism and staging origin
registered VK app id
VKWebAppInit behavior
Bridge capability-check mechanism
complete launch parameter set actually observed
official signature algorithm still current
expected vk_app_id validation
application freshness/replay policy for launch data
Mini App backend session TTL
allowed frontend origins
open_app app_id/owner_id/hash behavior in real staging
web/Android/iOS support matrix relevant to launch
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
M5_OFFICIAL_CURRENT_REVALIDATION = PENDING
M5_REGISTERED_APP_STAGING = PENDING
M5_SECURITY_POLICY_FREEZE = PENDING
M5_CODE_GATE = BLOCKED
```

---

## 8. M6 gate — cross-channel continuity

Bot → Mini App has an official `open_app` action schema, but actual registered app/community values and client behavior require staging.

Mini App → community conversation is still not proven by an official current primitive.

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
4. Is any unresolved value being guessed?
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

Documentation architecture is sufficiently defined to prepare M2, but M2 code must wait for:

```text
CURRENT_REMOTE_DOCS_HEAD independently verified
LOCAL_WORKTREE fast-forwarded safely
M2 backend dependency versions researched/frozen
```

M3 remains blocked until real VK staging/config evidence exists.

Decision marker:

```text
KIP_VK_IMPLEMENTATION_GATE_MATRIX_V1
```
