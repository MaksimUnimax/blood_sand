# VK Platform Official Contract Ledger

Версия: 0.1  
Статус: **PRE-IMPLEMENTATION EVIDENCE LEDGER**  
Дата проверки: 2026-08-29

## 1. Назначение

Этот реестр дополняет `VK_PLATFORM_ARCHITECTURE.md` и отвечает на вопрос:

```text
На основании какого официального VK-контракта мы имеем право писать конкретный код?
```

Правило разработки:

```text
VERIFIED
→ контракт можно закладывать в implementation + contract tests

PARTIALLY_VERIFIED
→ можно реализовать только подтверждённую часть

UNRESOLVED
→ production functionality не писать
→ сначала получить официальный контракт или staging evidence
```

Сторонние статьи/библиотеки не являются authority. Они могут только подсказать, что искать в официальных материалах.

---

## 2. Baseline official artifacts

### VK API schema

Official repository:

`VKCOM/vk-api-schema`

Checked files:

```text
callback/objects.json
messages/objects.json
messages/methods.json
errors.json
```

Repository baseline at research time declares schema version:

```text
5.199
```

Status:

```text
VK_API_SCHEMA_BASELINE = VERIFIED
VK_API_SCHEMA_BASELINE_VERSION = 5.199
PRODUCTION_VERSION_PIN = REVALIDATE_BEFORE_M3/DEPLOY
```

Reason for revalidation: the repository is current machine-readable authority available to us, but an implementation should not silently assume a forever-current VK API version.

### Official Callback example

Official repository:

`VKCOM/vk-php-sdk`

Checked:

```text
README.md
src/VK/CallbackApi/VKCallbackApiServerHandler.php
```

### Official Mini Apps / Bridge

Official repositories:

```text
VKCOM/vk-bridge
VKCOM/create-vk-mini-app
VKCOM/vk-apps-launch-params
VKCOM/vk-mini-apps-api
```

Official VK engineering/DevRel articles were used only where they describe platform behavior and link back to official developer surfaces.

---

## 3. Callback base envelope

Source:

`VKCOM/vk-api-schema/callback/objects.json#/definitions/callback_base`

Verified fields:

```text
type       required
group_id   required
event_id   required
v          required
secret     optional in schema
```

Official schema description for `event_id`:

```text
Unique event id. If it passed twice or more - you should ignore it.
```

Therefore:

```text
CALLBACK_EVENT_ID = VERIFIED
CALLBACK_EVENT_ID_DEDUP_SEMANTICS = VERIFIED
```

Implementation permission:

- persist `event_id`;
- ignore duplicate delivery of the same event;
- establish dedup before Bot state/outbound side effects.

Architecture key remains:

```text
(group_id, transport, event_id)
```

The extra group/transport namespace is our storage design; the event uniqueness/repeat-ignore rule itself is VK authority.

---

## 4. Callback confirmation / acknowledgement

Sources:

- `VKCOM/vk-php-sdk/README.md`
- `VKCOM/vk-php-sdk/src/VK/CallbackApi/VKCallbackApiServerHandler.php`

Verified:

```text
confirmation event exists
confirmation carries group_id / secret in official handler surface
server returns configured confirmation string for accepted confirmation
ordinary handled events return body: ok
```

Architecture requires validation of expected group and configured secret before accepting the Callback source.

Status:

```text
CALLBACK_CONFIRMATION_FLOW = VERIFIED
CALLBACK_OK_ACK = VERIFIED
CALLBACK_EXACT_DELIVERY_TIMEOUT = UNRESOLVED
```

Important:

No implementation may hardcode a remembered/third-party timeout value as a VK fact.

Receiver architecture remains quick-ack / async-outbox so correctness does not depend on guessing the timeout.

---

## 5. `message_new` / message identity fields

Source:

`VKCOM/vk-api-schema/messages/objects.json`

Verified message fields include:

```text
id
conversation_message_id
from_id
peer_id
text
payload
keyboard
random_id   # returned for outgoing messages
```

Schema descriptions confirm:

- `conversation_message_id` is unique auto-incremented number for messages with the peer;
- `from_id` is message author;
- `peer_id` is peer/destination identity;
- `payload` is optional message payload.

Status:

```text
MESSAGE_IDENTITY_FIELDS = VERIFIED
DIRECT_SESSION_KEY_GROUP_PEER = ARCHITECTURE_DECISION
```

Direct user ↔ community flow is V1 product scope; group-chat semantics remain excluded until separately specified.

---

## 6. `messages.send`

Source:

`VKCOM/vk-api-schema/messages/methods.json`

Method:

```text
messages.send
```

Verified access-token types:

```text
user
group
```

Relevant verified parameters:

```text
random_id
peer_id
message
group_id
keyboard
payload
```

Additional method parameters exist but are not needed for current V1 Bot flow.

Official schema description:

```text
random_id = Unique identifier to avoid resending the message.
```

Therefore:

```text
MESSAGES_SEND = VERIFIED
MESSAGES_SEND_PEER_ID = VERIFIED
MESSAGES_SEND_KEYBOARD = VERIFIED
MESSAGES_SEND_RANDOM_ID_IDEMPOTENCY_PURPOSE = VERIFIED
```

Architecture decision:

- assign one persisted `random_id` per logical outbox send;
- retries of the same logical send reuse the same `random_id`;
- do not generate a fresh `random_id` on each retry.

This architecture derives directly from VK's documented purpose of `random_id`.

---

## 7. Keyboard structure

Source:

`VKCOM/vk-api-schema/messages/objects.json`

Verified generic keyboard/button structure:

```text
keyboard.buttons[]
  -> rows
     -> messages_keyboard_button
        action = required
        color  = optional enum
```

Verified action discriminator includes:

```text
location
open_app
open_link
open_photo
text
callback
vkpay
```

Therefore current architecture may safely distinguish normal text buttons from callback buttons and `open_app` buttons.

Status:

```text
KEYBOARD_BASE_SCHEMA = VERIFIED
TEXT_ACTION_EXISTS = VERIFIED
CALLBACK_ACTION_EXISTS = VERIFIED
OPEN_APP_ACTION_EXISTS = VERIFIED
```

---

## 8. `open_app` button exact action schema

Source:

`VKCOM/vk-api-schema/messages/objects.json#/definitions/messages_keyboard_button_action_open_app`

Verified fields:

```text
app_id     integer, required
hash       string, optional
label      string, required
owner_id   integer/int64 owner, required
payload    string, optional
type       string, required, enum = open_app
```

Official schema descriptions identify `app_id`, `owner_id`, and `hash` as parts of an app link.

Status:

```text
OPEN_APP_ACTION_SCHEMA = VERIFIED
```

Architecture permission:

- Bot → Mini App may use a VK keyboard `open_app` action;
- `hash` may carry only an opaque handoff/navigation value, never trusted DOB/gender/product data;
- application data retrieved after launch remains server-authoritative.

Still to verify in staging before production:

```text
OPEN_APP_CLIENT_MATRIX = STAGING_REQUIRED
```

The schema proves the action contract, not every client's UX behavior.

---

## 9. Callback keyboard action

Source:

`VKCOM/vk-api-schema/messages/objects.json`

Verified:

```text
action.type = callback
```

Source:

`VKCOM/vk-api-schema/messages/methods.json`

Method:

```text
messages.sendMessageEventAnswer
```

Verified required parameters:

```text
event_id
user_id
peer_id
```

Optional:

```text
event_data
```

Therefore:

```text
MESSAGE_EVENT_ANSWER_CONTRACT = VERIFIED
```

Architecture decision remains:

Use ordinary text buttons for the simple gender/start-over choices unless callback-button UX is specifically useful. This keeps the first Bot flow smaller. If callback buttons are used, they get a dedicated documented `message_event` path rather than being treated like `message_new` by guesswork.

---

## 10. Current `messages.send` error inventory

Sources:

- `VKCOM/vk-api-schema/messages/methods.json`
- `VKCOM/vk-api-schema/errors.json`

`messages.send` explicitly references current message errors including:

```text
900  messages_user_blocked
901  messages_deny_send
902  messages_privacy
911  messages_keyboard_invalid
914  messages_too_long_message
917  messages_chat_user_no_access
921  messages_cant_fwd
925  messages_chat_not_admin
936  messages_contact_not_found
940  messages_too_many_posts
943  messages_intent_cant_use
944  messages_intent_limit_overflow
945  messages_chat_disabled
946  messages_chat_unsupported
950  messages_peer_blocked_reason_by_time
985  messages_group_for_notifications_only
987  messages_need_message_request
988  messages_pending_message_request
1012 messages_writing_disabled_for_chat
```

The method also receives global VK API errors. Verified global examples relevant to transport/control flow include:

```text
5   authorization failed
6   too many requests per second
7   permission denied
8   invalid request
9   flood control
10  internal server error
15  access denied
36  method execution timeout
100 missing/invalid parameter
103 out of limits
```

Status:

```text
MESSAGES_SEND_ERROR_CODE_INVENTORY = VERIFIED
```

### Retry classification boundary

VK's machine-readable schema defines codes/descriptions, but it does not itself specify our complete retry algorithm.

Therefore the following distinction is deliberate:

```text
VK error code/meaning = VK CONTRACT
retry/backoff policy  = OUR ARCHITECTURE
```

Safe architecture rules:

1. never retry permanent permission/privacy/user-state failures indefinitely;
2. never retry malformed keyboard/invalid request until the request is corrected;
3. transient network failure must retain the same logical send / `random_id`;
4. rate/service failures may use bounded backoff only under an explicit retry policy;
5. unknown error is surfaced, not silently retried forever.

Before M3 code, freeze an explicit allowlist of auto-retry codes using this official inventory plus staging behavior. Do not implement `retry every VK error`.

Status:

```text
MESSAGES_SEND_ERROR_INVENTORY = VERIFIED
MESSAGES_SEND_FINAL_RETRY_ALLOWLIST = PRE_M3_DECISION_REQUIRED
```

---

## 11. Callback API versus Bots Long Poll

Official VK DevRel platform material describes two event-receive approaches:

```text
Callback API
Bots Long Poll API
```

Verified conceptual distinction:

- Callback: VK sends notifications to the connected server;
- Bots Long Poll: event queue remains on VK side and bot requests updates.

Architecture decision:

```text
PRODUCTION = Callback-first
DEV/DIAGNOSTIC OPTIONAL = Bots Long Poll adapter
```

Both adapters must normalize to the same internal event model and contain no recommendation semantics.

Status:

```text
INBOUND_TRANSPORT_OPTIONS = VERIFIED
PRODUCTION_CALLBACK_FIRST = ARCHITECTURE_DECISION
```

---

## 12. Mini App launch parameters and signature

Sources:

- `VKCOM/vk-apps-launch-params`
- official Python example in the same repository

Verified:

- VK adds launch query parameters to Mini App URL;
- launch parameters use `vk_` prefix;
- separate `sign` authenticates launch data;
- backend may use signed launch params as authentication data;
- signature uses HMAC SHA-256 with application protected/secret key.

Official Python example verifies by:

```text
require sign
select keys starting with vk_
sort those keys
URL-encode ordered parameters
HMAC-SHA256 using protected key
base64 encode
strip padding
replace +/ with -_
compare against sign
```

Status:

```text
MINIAPP_SIGNED_LAUNCH_PARAMS = VERIFIED
MINIAPP_SERVER_SIGNATURE_ALGORITHM = VERIFIED
```

Hard implementation rule:

```text
vk_user_id before signature verification = UNTRUSTED
vk_user_id after valid signature + expected app_id = TRUSTED LAUNCH IDENTITY
```

The protected key is server-only.

---

## 13. Mini App launch fields

Official VK Bridge typings / launch-param artifacts expose fields such as:

```text
vk_user_id
vk_app_id
vk_is_app_user
vk_are_notifications_enabled
vk_language
vk_ref
vk_access_token_settings
vk_group_id?
vk_viewer_group_role?
vk_platform
vk_is_favorite
vk_ts
sign
```

Status:

```text
MINIAPP_VK_TS_FIELD_EXISTS = VERIFIED
MINIAPP_VK_TS_OFFICIAL_REPLAY_TTL = UNRESOLVED
```

Important:

The official signature example validates authenticity but does not by itself define the replay TTL we should enforce for `vk_ts`.

Third-party libraries that choose their own TTL are not authority for this project.

No Codex prompt may invent a `vk_ts` TTL and call it a VK requirement.

---

## 14. VK Bridge baseline

Official repository:

`VKCOM/vk-bridge`

Verified supported-method surface includes current methods such as:

```text
VKWebAppInit
VKWebAppGetLaunchParams
VKWebAppAllowMessagesFromGroup
VKWebAppOpenApp
VKWebAppCallAPIMethod
VKWebAppGetUserInfo
```

Bridge exposes support/capability checking.

Architecture consequence:

```text
optional bridge feature
→ capability check
→ supported path or safe fallback
```

Status:

```text
VK_BRIDGE_BASELINE = VERIFIED
BRIDGE_CAPABILITY_DEGRADATION = ARCHITECTURE_DECISION
```

---

## 15. Mini App permission to receive community messages

Official VK Mini Apps API/Bridge surface exposes:

```text
VKWebAppAllowMessagesFromGroup
```

Purpose in official wrapper documentation:

```text
asks user for permission to send messages from a community
```

This proves permission acquisition only.

It does NOT prove a command that opens a specific community conversation.

Status:

```text
ALLOW_MESSAGES_FROM_GROUP = VERIFIED
OPEN_COMMUNITY_DIALOG_FROM_MINIAPP = UNRESOLVED
```

Do not substitute an undocumented deep link and present it as a VK platform contract.

---

## 16. Mini App framework baseline

Official current VK Mini Apps scaffold/materials use the platform stack around:

```text
React
TypeScript
VKUI
VK Bridge
VK Mini Apps Router
```

Architecture preference follows the official ecosystem unless a concrete repository/platform reason later requires deviation.

Status:

```text
MINIAPP_PLATFORM_STACK_BASELINE = VERIFIED
```

No semantic recommendation logic is allowed in frontend regardless of framework.

---

## 17. Current unresolved matrix

| ID | Question | Status | Blocks |
|---|---|---|---|
| U1 | exact current Callback delivery/ack timeout | UNRESOLVED | no functional block because receiver is quick-ack; blocks claiming a numeric VK timeout |
| U2 | exact API version to pin for implementation | PARTIALLY_VERIFIED: official schema baseline 5.199 | must be revalidated immediately before M3/staging |
| U3 | exact `open_app` keyboard schema | RESOLVED: official schema verified | client/platform behavior still requires staging matrix |
| U4 | official `vk_ts` replay/TTL rule | UNRESOLVED | M5 authenticated bootstrap policy |
| U5 | official Mini App → community dialog navigation primitive | UNRESOLVED | that specific M5/M6 transition |
| U6 | `messages.send` error inventory | RESOLVED | final bounded retry allowlist remains PRE-M3 architecture decision |

---

## 18. What is allowed to be implemented now

### M2 shared Recommendation API

May be implemented from:

- `DATA_API_CONTRACT.md`;
- M1 Core;
- hybrid roadmap;
- platform architecture boundaries.

M2 does not need to implement any unresolved VK transport primitive.

### M3 Bot

Do NOT start M3 implementation until these PRE-M3 items are frozen in a short implementation ADR:

```text
selected VK API version
real staging Callback confirmation fixture
real staging message_new fixture
community token/permission configuration
exact gender/start-over keyboard JSON fixtures
exact messages.send request fixtures
explicit retry allowlist / permanent-error classification
```

The fixtures must come from official schema and/or a real test VK community.

### M5 Mini App

Do NOT start authenticated Mini App backend until:

```text
vk_ts freshness/replay policy is resolved from current official documentation or an explicitly owner-approved application security policy
```

Do not mislabel our own freshness policy as a VK-mandated TTL.

### M6 Mini App → community conversation

Do NOT implement this transition until U5 is resolved by current official VK documentation or a verified staging-supported platform mechanism.

---

## 19. Staging is part of the contract process

Official schemas define protocol structure, but client/runtime behavior must be verified on VK itself.

Before production, capture sanitized fixtures from a dedicated test community/Mini App for:

```text
confirmation
message_new
text keyboard click
open_app click/launch
callback button event if used
messages.send success
representative permanent send failure where safely reproducible
Mini App launch params on supported platforms
```

Test matrix for hybrid features should include supported VK clients used by the project, at minimum web and relevant mobile clients.

Do not use production user traffic as the first contract discovery environment.

---

## 20. Final anti-guessing gate

Before accepting any implementation diff, reviewer asks:

```text
1. What VK platform contract does this code implement?
2. Which official source or captured staging fixture defines it?
3. Is any field/status/error/timeout/deep-link invented from memory?
4. If VK did not define the behavior, is it clearly labeled as our application policy?
5. Is an UNRESOLVED item being silently treated as resolved?
```

Any `yes` to question 3 or 5 blocks the milestone.

Decision marker:

```text
KIP_VK_PLATFORM_OFFICIAL_CONTRACT_LEDGER_V1
```
