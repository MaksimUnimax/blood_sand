# VK Platform PRE-M3 Contract — официальный transport/configuration baseline

Версия: 0.1  
Статус: **PRE-M3 OFFICIAL-CONTRACT AUTHORITY**  
Дата проверки: 2026-08-29  
Бренд: «Кровь и Песок»

## 1. Назначение

Этот документ уточняет и дополняет:

- `VK_PLATFORM_ARCHITECTURE.md`;
- `VK_PLATFORM_OFFICIAL_CONTRACT_LEDGER.md`.

Он фиксирует только те VK transport/configuration contracts, которые проверены по официальным VK sources перед написанием Community Bot transport code.

Hard rule:

```text
OFFICIAL VK CONTRACT VERIFIED
→ можно проектировать adapter + fixture + contract test

OUR ARCHITECTURE DECISION
→ можно реализовывать, но нельзя выдавать за требование VK

UNRESOLVED / STAGING_REQUIRED
→ не угадывать
→ production code, зависящий от этого поведения, блокируется
```

Business recommendation semantics этот документ не меняет.

---

## 2. Official source baseline

Главный machine-readable source:

```text
VKCOM/vk-api-schema
```

Проверены current `master` files:

```text
groups/methods.json
groups/objects.json
groups/responses.json
callback/objects.json
messages/methods.json
messages/objects.json
messages/responses.json
errors.json
```

Current official schema repository declares:

```text
VK API schema version = 5.199
```

Official `VKCOM/vk-php-sdk` также сообщает, что SDK generated from this schema and uses API version `5.199`.

Status:

```text
VK_API_SCHEMA_VERSION_5_199 = VERIFIED_CURRENT_BASELINE
M3_API_VERSION_PIN = REVALIDATE_IMMEDIATELY_BEFORE_CODE/STAGING
```

Reason: мы не будем считать repository version вечной константой.

---

## 3. Community configuration API

### 3.1 `groups.setSettings`

Official method:

```text
groups.setSettings
```

Access token types:

```text
user
group
```

Relevant verified parameters:

```text
group_id             required
messages             boolean
bots_capabilities    boolean
bots_start_button    boolean
bots_add_to_chat     boolean
```

Official descriptions verify:

```text
bots_capabilities=true
→ community may use customized keyboard and bot capabilities

bots_start_button=true
→ users see a Start button when beginning a community chat for the first time

bots_add_to_chat=true
→ users may add community to a chat
```

Status:

```text
COMMUNITY_MESSAGES_SETTING_EXISTS = VERIFIED
BOT_CAPABILITIES_SETTING_EXISTS = VERIFIED
BOT_START_BUTTON_SETTING_EXISTS = VERIFIED
BOT_ADD_TO_CHAT_SETTING_EXISTS = VERIFIED
```

### Project policy

V1 Bot scope is direct user ↔ community messages.

Therefore:

```text
messages = must be enabled for production Bot
bots_capabilities = must be enabled when keyboards are used
bots_start_button = optional UX enhancement
bots_add_to_chat = not required by this product
```

The runtime must never infer group-chat support merely because `bots_add_to_chat` happens to be enabled in the community.

### Readback caveat

Current `groups.getSettings` response explicitly exposes:

```text
bots_capabilities
bots_start_button
bots_add_to_chat
```

The checked current response schema does **not** expose a clear symmetric `messages` boolean in that response object.

Therefore:

```text
READBACK_BOTS_CAPABILITIES = VERIFIED
READBACK_BOTS_START_BUTTON = VERIFIED
READBACK_BOTS_ADD_TO_CHAT = VERIFIED
READBACK_MESSAGES_ENABLED_VIA_GETSETTINGS = NOT_VERIFIED
```

Do not invent a readback field.

Message functionality itself must additionally be proven by staging `message_new` + `messages.send` fixtures.

---

## 4. Community group token inspection

Official method:

```text
groups.getTokenPermissions
```

Access token type:

```text
group
```

Official response:

```text
response.mask          integer
response.permissions[]
  name                 string
  setting              integer
```

Status:

```text
GROUP_TOKEN_PERMISSION_INSPECTION = VERIFIED
```

Important boundary:

The schema verifies the inspection method and response shape, but it does not in the checked artifact define the exact permission-name allowlist required by this project.

Therefore PRE-M3 provisioning must:

1. call `groups.getTokenPermissions` with the actual test community token;
2. store a sanitized fixture containing permission names/settings but never the token;
3. prove the exact token can call the read-only group/Callback methods we need;
4. prove the exact token can send a test response through `messages.send` in staging;
5. only then freeze the final required-permissions policy.

Status:

```text
GROUP_TOKEN_PERMISSION_RESPONSE = VERIFIED
FINAL_REQUIRED_PERMISSION_NAMES = STAGING_REQUIRED
```

Do not hardcode remembered permission bitmasks.

---

## 5. Callback server provisioning

### 5.1 Add server

Official method:

```text
groups.addCallbackServer
```

Access token types:

```text
user
group
```

Relevant parameters:

```text
group_id      required
url           required
title         required, maxLength 14
secret_key    optional, maxLength 50
```

Status:

```text
CALLBACK_SERVER_CREATE_CONTRACT = VERIFIED
CALLBACK_SECRET_MAX_LENGTH = 50
```

### 5.2 Get confirmation code

Official method:

```text
groups.getCallbackConfirmationCode
```

Required:

```text
group_id
```

Official response:

```text
response.code : string
```

Status:

```text
CALLBACK_CONFIRMATION_CODE_API = VERIFIED
```

Architecture rule:

Provisioning may retrieve the confirmation code through this method. Runtime Callback receiver returns the already provisioned/current confirmation code for a verified `confirmation` event; it must not require a live VK API round-trip merely to acknowledge confirmation.

Do not log the confirmation code.

### 5.3 Inspect callback servers

Official method:

```text
groups.getCallbackServers
```

Official server object includes:

```text
id
url
title
creator_id
secret_key
status
```

Verified status enum:

```text
unconfigured
failed
wait
ok
```

Status:

```text
CALLBACK_SERVER_STATUS = VERIFIED
```

Production preflight requires the selected server to have:

```text
status = ok
```

The diagnostic layer must never print `secret_key` even though the official response object can contain it.

---

## 6. Callback subscriptions and API version

Official methods:

```text
groups.getCallbackSettings
groups.setCallbackSettings
```

`groups.getCallbackSettings` returns:

```text
api_version
events
```

`groups.setCallbackSettings` accepts:

```text
group_id       required
server_id
api_version
message_new
message_reply
message_allow
message_edit
message_deny
message_typing_state
message_read
...
message_event
...
```

Status:

```text
CALLBACK_API_VERSION_SETTING = VERIFIED
CALLBACK_EVENT_SUBSCRIPTION_SETTING = VERIFIED
MESSAGE_NEW_SUBSCRIPTION = VERIFIED
MESSAGE_EVENT_SUBSCRIPTION = VERIFIED
```

### Minimal V1 subscription policy

For M3 first Bot flow:

```text
message_new = REQUIRED
message_event = REQUIRED ONLY IF callback keyboard actions are actually used
```

Current preferred gender/start-over UX uses ordinary text buttons, so M3 must not enable/implement `message_event` merely because the platform supports it.

Optional events may be added later only with a specific product use.

### Single-version rule

One explicit configured VK API version must be used coherently for:

- Callback event version setting;
- outbound VK API method calls;
- staging fixtures/contract tests.

Do not let Callback silently use one version while outbound adapter uses another.

Exact version is frozen immediately before M3 after rechecking official sources.

---

## 7. Callback base envelope and dedup

Official callback base schema verifies required fields:

```text
type
group_id
event_id
v
```

Optional schema field:

```text
secret
```

Official `event_id` description:

```text
Unique event id. If it passed twice or more - you should ignore it.
```

Therefore:

```text
CALLBACK_EVENT_ID_DEDUP = HARD VK CONTRACT
```

Implementation consequences:

- establish persistent uniqueness before business side effects;
- duplicate event → no second state transition;
- duplicate event → no second logical outbound message;
- valid duplicate may be acknowledged normally after dedup detection.

Application storage key:

```text
(group_id, transport, event_id)
```

The namespace shape is our storage decision; repeat-ignore semantics are official VK behavior.

---

## 8. Callback confirmation and ordinary acknowledgement

Official VK SDK Callback handler verifies the standard flow:

```text
type=confirmation
→ validate group / secret
→ return confirmation code

ordinary supported event
→ return ok
```

Status:

```text
CALLBACK_CONFIRMATION_FLOW = VERIFIED
CALLBACK_OK_ACK = VERIFIED
CALLBACK_NUMERIC_ACK_TIMEOUT = UNRESOLVED
```

Architecture deliberately does not need a remembered numeric timeout.

Receiver must be quick and must not synchronously call `messages.send` before acknowledging.

---

## 9. Exact `message_new` object boundary

Official callback schema:

```text
callback_message_new
→ callback_message_object
```

Current object fields:

```text
object.client_info
object.message
```

`object.message` uses the official message object and includes relevant fields such as:

```text
id
conversation_message_id
from_id
peer_id
text
payload
```

Status:

```text
MESSAGE_NEW_OBJECT_BOUNDARY = VERIFIED
```

Contract tests must use this nested shape. Do not implement historical flat callback payload formats unless an actual current staging fixture proves them.

---

## 10. `client_info` capability contract

Official `callback_info_for_bots` verifies:

```text
button_actions[]
keyboard              boolean
inline_keyboard       boolean
carousel              boolean
lang_id                integer
```

Official descriptions explicitly state keyboard/inline keyboard support.

Status:

```text
MESSAGE_CLIENT_CAPABILITIES = VERIFIED
```

Architecture rule:

```text
client_info.keyboard == true
→ keyboard may be used if required action type is also supported

keyboard unsupported / capability absent
→ plain-text Bot flow remains fully functional
```

A button is never required for semantic correctness.

For optional action-specific UI such as `open_app`, check the current capability/action list where available and provide a safe Bot-only fallback.

---

## 11. Keyboard object

Official `messages_keyboard` schema verifies:

```text
one_time   boolean, required
buttons    array of rows, required
author_id  optional
inline     optional boolean
```

Each button requires:

```text
action
```

Optional color enum:

```text
default
positive
negative
primary
```

Status:

```text
KEYBOARD_OBJECT_SCHEMA = VERIFIED
```

Application rule:

Keyboard JSON is serialized exactly once by the outbound adapter. Business/state code supplies a typed internal keyboard model; it must not manually assemble arbitrary VK JSON in multiple places.

---

## 12. Ordinary text button

Official action:

```text
type = text
```

Verified fields:

```text
label      required
payload    optional string
type       required, text
```

Status:

```text
TEXT_BUTTON_SCHEMA = VERIFIED
```

### Application payload policy

For our buttons, payload is convenience data, not authentication.

Even if a payload says `gender=male`, state/orchestration must verify:

- supported payload version;
- expected action;
- current session state;
- allowed value.

A user may forge a message/payload; payload never bypasses state validation.

If payload is absent/unparseable, current approved button labels/text remain parseable as ordinary user text.

---

## 13. Callback button / `message_event`

Official callback action exists:

```text
action.type = callback
```

Current exact event object verifies:

```text
user_id                  required
peer_id                  required
event_id                 required
payload                   required
conversation_message_id  optional
```

Official answer method:

```text
messages.sendMessageEventAnswer
```

Required:

```text
event_id
user_id
peer_id
```

Optional:

```text
event_data
```

Status:

```text
MESSAGE_EVENT_OBJECT = VERIFIED
MESSAGE_EVENT_ANSWER = VERIFIED
```

M3 does not implement this path unless the UI explicitly chooses callback buttons.

Do not treat `message_event` as `message_new`.

---

## 14. `open_app` button

Official action:

```text
type = open_app
```

Verified exact fields:

```text
app_id     integer, required
owner_id   integer/int64, required
label      string, required
hash       optional string
payload    optional string
type       required, open_app
```

Status:

```text
OPEN_APP_SCHEMA = VERIFIED
```

Architecture permission:

- Bot → Mini App may use this action;
- `hash` carries only opaque application navigation/handoff data;
- no DOB, gender or product result is trusted from `hash`;
- backend resolves trusted handoff data after signed Mini App identity verification.

Still required in staging before M5/M6:

```text
exact owner_id value for the registered app/community context
actual open_app behavior on selected VK clients
hash delivery/navigation behavior
```

Status:

```text
OPEN_APP_OWNER_VALUE = STAGING_REQUIRED
OPEN_APP_CLIENT_BEHAVIOR = STAGING_REQUIRED
```

---

## 15. `messages.send` contract

Official method:

```text
messages.send
```

Access token types:

```text
user
group
```

Relevant current parameters:

```text
random_id
peer_id
message      maxLength 9000
group_id
keyboard
payload      maxLength 1000
```

Official `random_id` description:

```text
Unique identifier to avoid resending the message.
```

Status:

```text
MESSAGES_SEND = VERIFIED
MESSAGES_SEND_RANDOM_ID_PURPOSE = VERIFIED
MESSAGES_SEND_MESSAGE_LIMIT_9000 = VERIFIED
MESSAGES_SEND_PAYLOAD_LIMIT_1000 = VERIFIED
```

Architecture rule:

```text
one logical outbox message
→ one persisted random_id
→ every retry of that logical message reuses it
```

Do not use new `random_id` for each retry.

The exact integer generation/range convention is an application decision and must be tested in staging; do not falsely label a remembered int32 range as VK schema fact.

---

## 16. Send permission checks

Official method:

```text
messages.isMessagesFromGroupAllowed
```

Verified purpose:

```text
returns whether sending messages from community to a user is allowed
```

Required:

```text
group_id
user_id
```

Access token types:

```text
user
group
```

Status:

```text
MESSAGES_FROM_GROUP_ALLOWED_CHECK = VERIFIED
```

Architecture use:

- not required before every reactive reply;
- may be used for diagnostics/handoff/proactive-message UX;
- send failure remains the authoritative transport result.

Official user-token method also exists:

```text
messages.allowMessagesFromGroup
```

Mini App Bridge separately exposes `VKWebAppAllowMessagesFromGroup` for user-facing permission acquisition.

These permissions do **not** prove a primitive that opens a community dialog.

---

## 17. Current `messages.send` error boundary

The official current method schema references message-specific errors including:

```text
900  user blocked
901  sending denied
902  privacy restriction
911  invalid keyboard
914  message too long
917  chat user no access
921  cannot forward
925  chat not admin
936  contact not found
940  too many messages/posts
943  intent cannot be used
944  intent limit overflow
945  chat disabled
946  chat unsupported
950  peer blocked by time reason
985  group for notifications only
987  message request required
988  pending message request
1012 writing disabled for chat
```

Global API errors include transport/config relevant categories such as:

```text
5    authorization failed
6    too many requests per second
7    permission denied
8    invalid request
9    flood control
10   internal server error
15   access denied
36   execution timeout
100  invalid/missing parameter
103  out of limits
```

Status:

```text
SEND_ERROR_INVENTORY = VERIFIED
FINAL_RETRY_ALLOWLIST = STAGING_AND_ARCHITECTURE_DECISION_REQUIRED
```

Do not implement `retry all errors`.

Before M3 implementation freeze a bounded policy with at least:

```text
PERMANENT_USER_STATE
AUTH_CONFIGURATION
INVALID_REQUEST_OR_CODE_BUG
TRANSIENT_RATE_OR_SERVICE
UNKNOWN_FAIL_CLOSED
```

Unknown VK errors do not enter infinite retry.

---

## 18. Bots Long Poll exact official API boundary

Long Poll remains optional diagnostic transport, not production primary transport.

Official methods:

```text
groups.getLongPollServer
groups.getLongPollSettings
groups.setLongPollSettings
```

`groups.getLongPollServer` returns current official object:

```text
key       string, required
server    URI string, required
ts        string, required
```

`groups.getLongPollSettings` returns:

```text
api_version
is_enabled
events
```

Status:

```text
GROUP_LONG_POLL_DISCOVERY = VERIFIED
GROUP_LONG_POLL_SETTINGS = VERIFIED
```

The raw Long Poll HTTP failure/recovery protocol (`failed` values and ts/key refresh semantics) has not been frozen in this project from a current official source.

Therefore:

```text
LONG_POLL_RAW_FAILURE_PROTOCOL = UNRESOLVED_FOR_IMPLEMENTATION
```

Because Long Poll is optional diagnostic functionality, this does not block Callback-first M3.

---

## 19. Mini App official scaffold/hosting baseline

Official current project:

```text
VKCOM/create-vk-mini-app
```

Current package baseline checked:

```text
@vkontakte/create-vk-mini-app 3.0.0
Node >= 18
```

Official README recommends template:

```text
VKUI + Bridge + Router
```

with Vite/React tooling and `vk-miniapps-deploy`.

Official deploy project:

```text
VKCOM/vk-miniapps-deploy
```

Verified:

- VK Mini Apps static hosting is supported;
- deployment config maps app id + mobile/mvk/web entry points;
- `production` and `dev` deployment environments exist;
- deployment accepts dedicated Mini Apps token/service token according to official tooling.

Status:

```text
MINIAPP_OFFICIAL_STACK_BASELINE = VERIFIED
MINIAPP_VK_STATIC_HOSTING = VERIFIED
```

Exact package versions for M5 must be re-read immediately before implementation and pinned in lockfile.

---

## 20. Mini App signed launch authentication

Official project:

```text
VKCOM/vk-apps-launch-params
```

Verified official behavior:

- launch parameters are appended to Mini App URL as query parameters;
- launch fields start with `vk_`;
- `sign` authenticates supplied launch parameters;
- parameters may be used as backend authentication material after signature verification;
- official README recommends explicit transfer to backend instead of trusting/reforwarding Referer;
- official example uses an Authorization header carrying the raw launch query;
- signature uses HMAC-SHA256 with protected Mini App key.

Official Python verifier checks:

```text
sign present
vk_* subset non-empty
sort vk_* keys
URL-encode ordered values
HMAC-SHA256 with protected key
base64 → URL-safe normalization
constant expected-sign comparison semantics
```

Status:

```text
MINIAPP_LAUNCH_AUTHENTICATION = VERIFIED
MINIAPP_SIGNATURE_ALGORITHM = VERIFIED
MINIAPP_EXPLICIT_BACKEND_TRANSFER = VERIFIED
```

Security boundary:

```text
before valid sign + expected app id
→ vk_user_id is untrusted
```

The protected key is server-only and never shipped to the frontend.

### `vk_ts` caveat

The checked official Python example verifies signature only and does not define a freshness TTL.

Therefore:

```text
VK_TS_FIELD_EXISTS = VERIFIED
VK_TS_MANDATED_TTL = UNRESOLVED
```

Any application freshness/replay window must be explicitly documented as **our security policy**, not presented as a VK-mandated number.

---

## 21. Mini App → community conversation

Verified platform capability:

```text
VKWebAppAllowMessagesFromGroup
```

This requests permission for messages from a community.

No checked official contract proves that this method opens a specific community dialog.

No checked official Bridge source exposes a clearly named `OpenCommunityDialog` primitive.

Therefore:

```text
MINIAPP_OPEN_COMMUNITY_DIALOG = UNRESOLVED
```

Do not implement a guessed `vk.me/...` or undocumented deep link and call it official VK behavior.

This blocks only that cross-channel navigation feature, not Bot/Mini App semantic recommendation.

---

## 22. PRE-M3 configuration preflight architecture

Before Bot runtime is considered ready, an operator/preflight command must validate the parts that VK exposes for inspection.

### Read-only checks

```text
1. VK group token authenticates.
2. groups.getTokenPermissions returns a valid permission object.
3. groups.getSettings confirms bots_capabilities when keyboards are enabled.
4. groups.getCallbackServers finds the configured callback URL/server.
5. selected callback server status == ok.
6. groups.getCallbackSettings confirms selected api_version.
7. groups.getCallbackSettings confirms message_new enabled.
8. if callback buttons are enabled, message_event enabled.
9. local configured group_id matches the intended test/production community.
10. local Callback secret and confirmation-code material exist without being logged.
```

### Staging proof checks

Because not every prerequisite has a fully symmetric readback field in the current checked schema, staging must additionally prove:

```text
11. real confirmation event accepted.
12. real message_new fixture captured.
13. direct text reply via messages.send succeeds.
14. keyboard reply succeeds on a keyboard-capable client.
15. text-only fallback succeeds on a client/path without keyboard dependency.
16. duplicate callback event fixture produces one logical reply only.
17. invalid secret/group is rejected.
```

Readiness must distinguish:

```text
APPLICATION_READY
VK_PLATFORM_PREFLIGHT_READY
```

A transient live VK outage must not force the HTTP process liveness check to fail. Platform preflight is run at deploy/setup time and its last known verified result is surfaced diagnostically.

---

## 23. Provisioning policy

Runtime service must not silently mutate VK community configuration on every startup.

Use two explicit modes:

```text
vk preflight   # read-only verification + staging checks
vk provision   # explicit operator action to create/update VK platform configuration
```

`provision` may use official methods such as:

```text
groups.addCallbackServer
groups.setCallbackSettings
groups.setSettings
```

but only after displaying the intended non-secret changes and requiring explicit operator invocation.

No secret value is printed.

This separation prevents startup from unexpectedly changing community production settings.

---

## 24. Mandatory sanitized fixtures before M3 code is closed

Commit sanitized fixtures generated from official current schema and/or the dedicated staging community:

```text
callback_confirmation.json
callback_message_new_text.json
callback_message_new_text_with_payload.json
callback_message_new_no_keyboard_capability.json
callback_duplicate_event.json
callback_invalid_group.json
callback_invalid_secret.json
messages_send_success.json
messages_send_permanent_error.json
messages_send_transient_error.json
groups_callback_servers.json
groups_callback_settings.json
groups_settings_bot_capabilities.json
groups_token_permissions.json
```

If callback buttons are used, additionally:

```text
callback_message_event.json
messages_send_message_event_answer_success.json
```

Fixture rules:

- no real access tokens;
- no Callback secret;
- no confirmation code;
- no unnecessary real user identifiers;
- preserve exact field nesting/types needed by contract tests;
- record source as `official-schema-derived` or `staging-captured-sanitized`.

---

## 25. PRE-M3 unresolved list

```text
U1 exact numeric Callback delivery timeout
   status: UNRESOLVED, non-blocking because architecture quick-acks

U2 exact API version at M3 implementation date
   status: REVALIDATE; current official baseline 5.199

U3 exact required group-token permission names/settings
   status: STAGING_REQUIRED using groups.getTokenPermissions + real send

U4 symmetric readback proving community messages setting itself is enabled
   status: NOT VERIFIED in checked groups.getSettings response; prove by provisioning/staging

U5 exact messages.send retry allowlist
   status: PRE-M3 architecture + staging freeze required

U6 exact open_app owner_id value/client behavior for our registered app
   status: PRE-M5/M6 staging required; does not block Bot-only M3

U7 vk_ts replay/freshness policy
   status: PRE-M5 security decision; does not block M3

U8 Mini App → community conversation primitive
   status: UNRESOLVED; blocks only that M5/M6 transition

U9 raw Long Poll failure/recovery protocol
   status: UNRESOLVED; optional diagnostic adapter only
```

No Codex prompt may silently resolve U1–U9 from memory.

---

## 26. M3 code entry gate

M3 implementation is allowed only after a short staging/config ADR records:

```text
VK_API_VERSION = <revalidated current value>
VK_GROUP_ID = configured outside repo
CALLBACK_SERVER_ID = verified
CALLBACK_SERVER_STATUS = ok
MESSAGE_NEW_ENABLED = yes
BOT_CAPABILITIES_ENABLED = yes if keyboards used
TOKEN_STAGING_SEND = pass
CALLBACK_CONFIRMATION_FIXTURE = captured/sanitized
MESSAGE_NEW_FIXTURE = captured/sanitized
KEYBOARD_FIXTURE = captured/sanitized if used
MESSAGES_SEND_FIXTURE = captured/sanitized
RETRY_POLICY = frozen bounded allowlist/classification
```

Until that gate passes:

```text
M3_VK_TRANSPORT_IMPLEMENTATION = BLOCKED
```

M2 shared Recommendation API remains independent of these VK transport gaps.

Decision marker:

```text
KIP_VK_PLATFORM_PRE_M3_OFFICIAL_CONTRACT_V1
```
