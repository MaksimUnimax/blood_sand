# VK Platform Architecture — Bot + Mini App

Версия: 0.1  
Статус: **PRE-IMPLEMENTATION PLATFORM AUTHORITY**  
Бренд: «Кровь и Песок»  
Дата исследования: 2026-08-29

## 1. Назначение

Этот документ фиксирует архитектуру интеграции VK Community Bot + VK Mini App **до написания transport/UI кода**.

Цель — убрать реализацию «по догадке». Код M2/M3/M5/M6 разрешён только там, где интерфейс VK подтверждён официальной документацией/официальными VKCOM-репозиториями либо отдельно помечен как наше архитектурное решение поверх подтверждённого интерфейса.

Hard rule:

```text
нет подтверждения VK contract
→ не придумывать контракт
→ пометить UNRESOLVED
→ проверить документацию VK
→ только потом реализовывать
```

Business recommendation authority остаётся в:

- `RECOMMENDATION_MATRIX.md`;
- `PRODUCT_CLASSIFICATION.md`;
- `CUSTOMER_RECOMMENDATION_COPY_GUIDE.md`;
- `DATA_API_CONTRACT.md`;
- `ARCHITECTURE.md`.

Этот документ не меняет semantic recommendation. Он описывает платформенный transport, identity, state, idempotency и Bot/Mini App boundaries.

---

## 2. Источники VK, использованные для архитектуры

Приоритет источников для platform-интеграции:

1. VK developer documentation (`dev.vk.ru` / `dev.vk.com`);
2. официальные репозитории `VKCOM/*`;
3. официальные материалы VK engineering/DevRel;
4. сторонние материалы — только как указатель на место проверки, но не как authority.

Проверенные официальные источники/артефакты:

- Callback/Bots Long Poll overview, VK DevRel:  
  `https://habr.com/ru/companies/vk/articles/570486/`
- official VK PHP SDK Callback example:  
  `https://github.com/VKCOM/vk-php-sdk/blob/master/README.md`
- official VK PHP SDK `messages.send` method surface:  
  `https://github.com/VKCOM/vk-php-sdk/blob/master/src/VK/Actions/Messages.php`
- official VK API JSON Schema, current repository:  
  `https://github.com/VKCOM/vk-api-schema`
- official VK API message object schema:  
  `https://github.com/VKCOM/vk-api-schema/blob/master/messages/objects.json`
- official VK Bridge:  
  `https://github.com/VKCOM/vk-bridge`
- official VK Bridge core implementation/support list:  
  `https://github.com/VKCOM/vk-bridge/blob/master/packages/core/src/bridge.ts`
- official VK Mini App scaffold:  
  `https://github.com/VKCOM/create-vk-mini-app`
- official VK Mini App launch-params signing example:  
  `https://github.com/VKCOM/vk-apps-launch-params`
- official VK launch signature Python example:  
  `https://github.com/VKCOM/vk-apps-launch-params/blob/master/examples/python3.py`
- official VK Mini Apps platform overview / current stack example:  
  `https://habr.com/ru/companies/vk/articles/961286/`
- official VK Mini Apps integration tutorial:  
  `https://habr.com/ru/companies/vk/articles/771772/`

Current official `vk-api-schema` declares API schema version `5.199`. Before production deployment the selected VK API version must be rechecked against the then-current developer documentation; implementation must pin one explicit version rather than silently use a moving default.

---

## 3. Verified VK platform facts

### 3.1 Incoming community events

VK exposes two normal mechanisms for community events:

- **Callback API** — VK sends event notifications to our HTTP endpoint;
- **Bots Long Poll API** — our process requests events from VK, with the event queue stored on VK side.

This is explicitly described by VK DevRel.

### 3.2 Callback confirmation and acknowledgement

The official VK PHP SDK documents Callback setup as follows:

- VK sends a `confirmation` event;
- server validates expected `group_id` and configured `secret`;
- server returns the confirmation string;
- for ordinary events server returns `ok`.

Therefore these are mandatory receiver responsibilities, not optional convenience logic.

### 3.3 Current message event shape

Current VK callback/message examples and schemas expose the fields needed by this product:

```text
group_id
type
event_id
v
object.message
object.client_info
```

For `message_new`, message data includes at least:

```text
id
conversation_message_id
from_id
peer_id
text
payload
random_id (for outgoing message context)
```

`peer_id` is the canonical destination identifier for message sending.

### 3.4 Sending messages

Official `messages.send` SDK surface includes:

```text
peer_id
random_id
message
keyboard
payload
group_id
```

`random_id` is described by the official SDK as a unique identifier used to avoid resending the message.

Therefore outgoing retries must reuse the same logical `random_id`; generating a new value on every retry defeats VK-side idempotency.

### 3.5 Mini App runtime

VK Mini Apps are web applications embedded in VK clients/web. Official VK material recommends the standard VK Mini Apps stack and current scaffold includes VKUI, VK Bridge and router support.

A Mini App must initialize the platform through VK Bridge (`VKWebAppInit`) before using platform capabilities.

### 3.6 Mini App launch identity

VK supplies launch parameters through the app URL/query, including fields such as:

```text
vk_user_id
vk_app_id
vk_group_id? 
vk_platform
vk_ref
vk_ts
sign
```

The official launch-params example states that backend authentication may be based on these parameters **only after signature validation**.

Official signing algorithm:

1. keep parameters whose keys start with `vk_`;
2. sort by key;
3. URL-encode the ordered key/value sequence;
4. calculate HMAC-SHA256 using the Mini App protected/secret key;
5. base64url encode without padding;
6. compare with `sign`.

The Mini App secret is server-only and must never be shipped to frontend code.

### 3.7 VK Bridge platform capabilities

Current official VK Bridge source contains support for methods including:

```text
VKWebAppInit
VKWebAppGetLaunchParams
VKWebAppAllowMessagesFromGroup
VKWebAppOpenApp
VKWebAppCallAPIMethod
VKWebAppGetUserInfo
```

Platform support can differ by runtime; the Bridge exposes capability checks. UI must therefore degrade safely instead of assuming every method exists on every client.

---

## 4. Architecture decisions

Everything in this section is our architecture **built on the verified VK contracts above**.

### ADR-VK-001 — Production inbound transport = Callback API

Production inbound transport:

```text
VK Callback API
```

Reason:

- the product already requires a public backend for Recommendation API and Mini App support;
- Callback naturally fits that server topology;
- it avoids a permanent polling loop as the primary production transport.

Bots Long Poll remains an optional development/diagnostic adapter only.

Hard rule:

```text
Callback adapter and Long Poll adapter
→ normalize to the same internal event
→ contain zero recommendation/business semantics
```

We do **not** maintain two Bot implementations.

### ADR-VK-002 — One platform gateway, one semantic Core

Logical components:

```text
VK Callback / Mini App identity
            │
            ▼
      VK Platform Gateway
            │
            ├── Bot state/orchestration
            ├── Mini App bootstrap/handoff
            │
            ▼
   Shared Recommendation API
            │
            ▼
   Deterministic Recommendation Core
```

Neither Callback adapter nor Mini App frontend may select a product independently.

### ADR-VK-003 — Direct community messages are V1 Bot scope

V1 consumer Bot scope is direct user ↔ community messaging.

Group-chat behavior is out of scope until separately specified and tested against VK documentation.

Do not infer a private-user session model from arbitrary multi-user chat events.

### ADR-VK-004 — Callback receiver is a thin transport boundary

Planned endpoint:

```text
POST /v1/vk/callback
```

Receiver duties, in order:

1. parse request;
2. validate expected group;
3. validate configured Callback secret;
4. handle `confirmation` exactly;
5. recognize supported event type;
6. register dedup identity;
7. persist/dispatch internal event;
8. return VK acknowledgement.

Recommendation calculation and outbound VK calls must not be buried inside raw request parsing code.

No exact Callback timeout is invented in this document. The implementation is intentionally structured for quick acknowledgement so it is not dependent on an assumed timeout value.

### ADR-VK-005 — Normalize inbound events

Internal event contract:

```text
VKInboundEvent
  transport                 callback | bots_long_poll
  event_id                  string | null
  api_version               string | null
  group_id                  int
  event_type                string
  peer_id                   int | null
  from_id                   int | null
  message_id                int | null
  conversation_message_id   int | null
  text                      string | null
  payload                   string | null
  client_capabilities       optional normalized metadata
```

Raw VK payload may be retained for bounded diagnostic/audit storage, but business modules consume the normalized contract.

### ADR-VK-006 — Event dedup before side effects

For Callback events, `event_id` is the primary dedup key when supplied.

Persistent uniqueness:

```text
(group_id, transport, event_id)
```

must be established before state transition/outbound side effects.

If an event type does not provide a documented stable event identifier, its fallback dedup strategy must be documented for that event specifically. No generic guessed fingerprint is allowed.

### ADR-VK-007 — Persistent Bot session state

Bot state must survive process restart.

Logical session key for direct community messages:

```text
(group_id, peer_id)
```

State:

```text
START
WAITING_DATE
WAITING_GENDER
RESOLVED
HUMAN_HANDOFF
```

Stored semantic inputs:

```text
birth_day
birth_month
birth_year?
gender?
marketplace?
last_result_id?
updated_at
```

`Подобрать снова` resets active flow fields but does not erase historical audit/result records.

### ADR-VK-008 — Transactional inbox/state/outbox

To avoid the Telegram-class failure mode «event processed twice / response lost / duplicated send», use explicit persistence boundaries:

```text
incoming VK event
    ↓
inbox dedup record
    ↓
session transition + recommendation/result record
    ↓
outbox record(s)
    ↓
commit
    ↓
outbox sender → messages.send
```

A process crash after commit must not lose the planned reply.

A retry must not create a second logical reply.

Initial implementation may use a dedicated SQLite database for this VK product, but it must be isolated from MQO state/database. Storage API must remain replaceable.

### ADR-VK-009 — Stable `random_id` per logical outbound message

Every logical VK send gets one stable int32-compatible `random_id` stored with the outbox row.

Retries reuse that same value.

Do not use `random_id=0` as a blanket convention.

Do not generate a fresh random id for a retry of the same logical message.

### ADR-VK-010 — Button policy

For V1 state choices such as:

```text
Мужчине
Женщине
Подобрать снова
```

prefer ordinary text/message buttons where this produces a normal message event and keeps the state machine on one `message_new` path.

Callback buttons (`message_event`) are introduced only when their specific UI behavior is needed. If used, they require their own documented handler and `messages.sendMessageEventAnswer` contract.

Bot → Mini App CTA uses the documented VK app-opening keyboard capability (`open_app`) only after the concrete current keyboard schema is revalidated immediately before M3/M5 implementation.

### ADR-VK-011 — No semantic data in Mini App launch hash

Bot → Mini App handoff must pass an **opaque handoff identifier**, not DOB/gender/product data.

Concept:

```text
Bot creates handoff_id
→ server stores handoff state
→ open_app carries only opaque handoff reference in navigation hash
→ Mini App starts
→ Mini App verifies VK launch identity with backend
→ backend binds handoff to verified VK user
→ app loads state from server
```

Do not put birth date, gender or product selection into an unsigned/deep-link field and trust it on arrival.

### ADR-VK-012 — Mini App backend authentication

Frontend sends original launch parameters/signature to backend bootstrap.

Backend must:

1. validate signature using server-only Mini App secret;
2. verify expected `vk_app_id`;
3. derive trusted `vk_user_id` only after signature validation;
4. reject malformed/unsigned launch identity;
5. establish a short-lived application session or equivalent authenticated context.

Frontend-supplied `vk_user_id` alone is never authentication.

Replay/age policy for `vk_ts` must be explicitly defined after checking the current VK security documentation immediately before M5. This document does not invent a TTL.

### ADR-VK-013 — Mini App frontend stack

Preferred platform-aligned stack:

```text
TypeScript
React
VKUI
VK Bridge
VK Mini Apps Router
```

Reason: this matches the current official VK scaffold/recommended ecosystem and platform components.

The frontend contains presentation/state only; recommendation selection remains server-side.

### ADR-VK-014 — Mini App capability degradation

Every Bridge feature used beyond mandatory initialization must have:

```text
supports/check
→ supported path
→ safe fallback
```

Do not assume desktop/mobile clients expose identical methods.

### ADR-VK-015 — Mini App → community messages is currently UNRESOLVED

The product requires a path from Mini App back to community conversation/human handoff.

Current verified Bridge source confirms `VKWebAppAllowMessagesFromGroup`, which requests permission to receive community messages, but this is **not the same thing as a verified command to open a specific community dialog**.

Therefore:

```text
Mini App → open community conversation
STATUS = UNRESOLVED
```

Before implementing that navigation, inspect current VK developer documentation for the supported mechanism. Do not hardcode guessed `vk.me/...`, undocumented deep links, or an unrelated Bridge method.

This unresolved navigation does not block M2 shared Recommendation API or M3 Bot-only flow. It blocks only the corresponding M5/M6 transition.

---

## 5. Bot runtime architecture

### 5.1 Input flow

```text
message_new
→ validate/normalize VK event
→ dedup
→ load session
→ parse command/date/payload for current state
→ transition state
→ call shared Recommendation API only when semantic inputs complete
→ render current approved customer copy
→ create outbox send(s)
→ persist atomically
→ acknowledge transport
→ outbox delivery
```

### 5.2 Date parsing

Bot adapter may parse the already-approved UX formats:

```text
DD.MM
DD.MM.YYYY
DD/MM
DD/MM/YYYY
DD-MM
DD-MM-YYYY
```

Parsing produces domain values only. Validity is rechecked by shared Core/API.

If more than one unambiguous date candidate exists, do not guess.

### 5.3 Gender

Gender is accepted only from explicit Bot action/text defined by current UX.

Never infer from VK profile/name/avatar.

### 5.4 Result

Bot renders one recommendation only.

Customer copy consumes the already-selected Core result and current reason-copy authority.

No internal keys, sales weighting, relation enum or fallback terminology are shown.

---

## 6. Outbound VK adapter

Single adapter owns VK API calls.

Interface concept:

```text
send_message(peer_id, message, keyboard?, logical_send_id)
```

Adapter maps `logical_send_id` to persisted `random_id` and calls `messages.send` with explicit VK API version and server-side community token.

The adapter classifies VK API failures into:

```text
retryable transport/service failure
permanent/user-permission failure
auth/configuration failure
unknown failure
```

Exact VK error-code classification must be generated from current official VK API error/method documentation during M3 implementation. Unknown codes are not silently treated as retryable.

---

## 7. Mini App architecture

```text
VK client
   ↓
Mini App SPA
   ↓ VKWebAppInit
launch params + sign
   ↓
Mini App bootstrap endpoint
   ↓ verify signature/app/user
trusted app session
   ↓
shared Recommendation API
   ↓
Recommendation Core
```

Frontend responsibilities:

- collect day/month/year optional;
- collect explicit gender;
- show loading/error states;
- display one returned recommendation;
- invoke supported VK Bridge UX functions;
- carry opaque handoff references only.

Frontend forbidden responsibilities:

- Chertog calculation;
- matrix lookup;
- marketplace override selection;
- fallback selection;
- trusting unsigned launch identity;
- storing VK protected key.

---

## 8. Hybrid Bot ↔ Mini App contract

### Bot → Mini App

Target flow:

```text
Bot session/result
→ create opaque handoff_id
→ open_app CTA
→ Mini App launch
→ signed VK identity verification
→ handoff ownership check
→ continue/open result
```

Handoff record must be:

- opaque/unpredictable;
- server-stored;
- tied to one flow/result;
- bounded in lifetime;
- consumed only by the matching verified VK identity.

Exact lifetime is an application policy to be set before M6, not guessed from VK docs.

### Mini App → Bot/messages

Product direction is required, but transport mechanism is `UNRESOLVED` until current VK docs confirm the supported navigation primitive.

### Semantic invariant

Channel switch never recomputes a different product unless semantic input itself changes.

---

## 9. Persistence model

Logical tables/collections:

```text
vk_inbound_events
  transport
  group_id
  event_id
  event_type
  received_at
  processed_at
  status

vk_bot_sessions
  group_id
  peer_id
  state
  birth_day/month/year
  gender
  marketplace
  last_result_id
  updated_at

vk_recommendation_results
  result_id
  peer/user binding where applicable
  semantic input snapshot
  semantic output snapshot
  config versions
  created_at

vk_outbox
  outbox_id
  peer_id
  random_id
  message/keyboard payload
  status
  attempt_count
  last_error
  created_at/sent_at

vk_handoffs
  handoff_id
  source_surface
  target_surface
  vk_user_id binding after verification
  result/session reference
  state
  created_at/expires_at
```

No table above is shared with Marketplace Question Operator.

---

## 10. Secrets and trust boundaries

Server-side only:

```text
VK community access token
VK Callback secret
VK Callback confirmation string
VK Mini App protected/secret key
```

Never:

- commit secrets to repository;
- return them through health endpoints;
- log them;
- send Mini App secret to frontend;
- trust a Mini App user id before signature verification.

Callback trust requires expected group + secret validation.

Mini App trust requires launch-signature validation.

Recommendation request fields themselves are not authentication.

---

## 11. Logical process/deployment topology

Architecture is logical first. V1 may run several modules in one deployable service if operationally simpler, but boundaries remain explicit:

```text
[ public HTTPS ]
      │
      ├── /v1/recommendations/*     shared semantic API
      ├── /v1/vk/callback           VK inbound transport
      └── /v1/vk/miniapp/*          signed Mini App bootstrap/handoff (later)
                │
                ▼
        application services
          │      │      │
          │      │      └── persistent VK state/outbox
          │      └── Recommendation Core
          └── VK outbound adapter

Mini App static frontend
→ separate static/web hosting under HTTPS
```

Do not expose the SQLite/state path publicly.

Do not merge this runtime with MQO process/database.

---

## 12. Reliability rules

1. Incoming Callback duplicate must not create duplicate state transition.
2. Incoming duplicate must not create duplicate logical outgoing message.
3. Outgoing retry reuses persisted `random_id`.
4. Process restart must preserve Bot session and pending outbox.
5. Callback confirmation path has no recommendation dependency.
6. Callback event acknowledgement does not depend on a successful outbound VK API call.
7. Permanent VK send denial does not spin in infinite retry.
8. Unknown VK error is surfaced for operator review.
9. Availability/product destination failure later never changes recommendation.
10. Bot and Mini App semantic result remain parity-tested against Core.

---

## 13. Observability

Structured events, without secrets and without unnecessary raw DOB logging:

```text
vk_callback_received
vk_callback_rejected
vk_event_duplicate
vk_event_processed
vk_session_transition
vk_recommendation_resolved
vk_outbox_created
vk_send_success
vk_send_retry
vk_send_permanent_failure
vk_miniapp_signature_valid
vk_miniapp_signature_invalid
vk_handoff_created
vk_handoff_consumed
```

Correlation dimensions:

```text
request_id
event_id
result_id
outbox_id
handoff_id
peer_id (careful in logs / configurable hashing later)
```

---

## 14. Test architecture

### Platform contract fixtures

Store sanitized fixtures for:

- Callback `confirmation`;
- Callback `message_new`;
- duplicate `event_id`;
- invalid group;
- invalid secret;
- `messages.send` success/error envelopes;
- Mini App valid/invalid signed launch params;
- Bridge capability absent/present behavior in frontend tests.

Fixtures must be based on official/current VK contracts or captured staging traffic, never invented field layouts presented as VK truth.

### Mandatory layers

```text
unit
→ normalization/state/parser/serializer

contract
→ official VK payload fixtures ↔ adapters

integration local
→ Callback HTTP → inbox/state/outbox with fake VK API

staging VK
→ real test community + test Mini App

cross-layer parity
→ Bot/App input → same Recommendation Core result
```

No production deployment until staging has verified the real current payloads generated by VK.

---

## 15. Milestone gates after this document

### PRE-M2 gate

M2 may implement only shared Recommendation API and generic correlation/health behavior.

M2 must not invent VK Callback/Mini App contracts.

### PRE-M3 gate

Before Bot code:

- re-open current official Callback docs;
- confirm selected API version;
- confirm `message_new` payload;
- confirm community token rights/settings;
- confirm `messages.send` request/response;
- confirm keyboard schema used by our exact buttons;
- confirm Callback configuration/secret/confirmation flow;
- capture sanitized real staging fixtures.

Then freeze an implementation ADR/contract test set.

### PRE-M5 gate

Before Mini App code:

- confirm current `create-vk-mini-app` recommended versions;
- confirm `VKWebAppInit` and required Bridge behavior;
- confirm complete current launch params and signature documentation;
- confirm `vk_ts` security/replay recommendations;
- confirm allowed hosting/HTTPS/deployment requirements;
- confirm exact Bot `open_app` CTA schema;
- confirm backend auth pattern.

### PRE-M6 gate

Before cross-channel continuity:

- verify current documented Mini App → community messages navigation mechanism;
- verify handoff/deep-link limits and supported hash/navigation fields;
- test on desktop web + mobile web + Android + iOS where supported.

---

## 16. Explicit unresolved items — NO GUESSING

```text
U1. Exact current Callback delivery/ack timeout value
    → do not hardcode an assumed value.

U2. Exact production VK API version to pin
    → official schema currently exposes 5.199; revalidate at implementation start.

U3. Complete exact keyboard/open_app schema and client compatibility for our planned CTA
    → revalidate before M3/M5.

U4. Mini App vk_ts replay/TTL policy required/recommended by current VK docs
    → verify before M5 backend auth.

U5. Exact supported Mini App → community dialog navigation mechanism
    → currently UNRESOLVED; blocks that M5/M6 feature only.

U6. Current VK API rate/error classification relevant to messages.send
    → generate retry policy from official current docs/schema before M3.
```

Any implementation prompt that fills U1–U6 from memory or guesswork is invalid.

---

## 17. Final architecture invariant

```text
VK platform transports are adapters.
Bot state is orchestration.
Mini App is presentation.
Recommendation API/Core own semantic recommendation.
Persistent inbox/outbox own idempotency/recovery.
Signed VK identity owns Mini App trust.
No channel may invent or override selection.
```

Decision marker:

```text
KIP_VK_PLATFORM_ARCHITECTURE_OFFICIAL_DOCS_BASELINE_V1
```
