# VK Platform PRE-M6 Contract — Bot ↔ Mini App continuity

Версия: 0.1  
Статус: **PRE-M6 CROSS-CHANNEL CONTRACT AUTHORITY**  
Дата проверки: 2026-08-29  
Бренд: «Кровь и Песок»

## 1. Назначение

Этот документ фиксирует, какие cross-channel переходы Bot ↔ Mini App подтверждены текущими официальными VK contracts, а какие остаются неразрешёнными.

Главная цель:

```text
не подменять отсутствие официального navigation contract
похожим Bridge методом или guessed deep link
```

Он дополняет:

```text
VK_PLATFORM_ARCHITECTURE.md
VK_PLATFORM_OFFICIAL_CONTRACT_LEDGER.md
VK_PLATFORM_PRE_M3_CONTRACT.md
VK_PLATFORM_PRE_M5_CONTRACT.md
VK_IMPLEMENTATION_ARCHITECTURE.md
VK_IMPLEMENTATION_GATE_MATRIX.md
```

---

## 2. Semantic invariant

Cross-channel continuity never owns recommendation semantics.

For identical trusted semantic input:

```text
Bot result == Mini App result
```

Switching surface must not:

- change Chertog;
- change product;
- reapply a different marketplace context silently;
- drop a supplied year;
- introduce a secondary recommendation;
- infer gender from profile fields.

Prefer carrying an immutable existing `result_id` through handoff rather than recomputing a result merely because UI surface changed.

---

## 3. Bot → Mini App official platform surface

Current official VK API keyboard schema verifies action:

```text
type = open_app
```

Required fields:

```text
app_id
owner_id
label
type
```

Optional:

```text
hash
payload
```

Status:

```text
BOT_TO_MINIAPP_OPEN_APP_SCHEMA = VERIFIED
```

This establishes that a Community Bot message keyboard can carry an app-opening action.

It does not by itself prove our registered `app_id/owner_id` combination or every client's behavior.

Therefore:

```text
BOT_TO_MINIAPP_REGISTERED_VALUES = STAGING_REQUIRED
BOT_TO_MINIAPP_CLIENT_BEHAVIOR = STAGING_REQUIRED
```

---

## 4. Bot → Mini App application handoff

`hash` is a navigation field, not authenticated semantic state.

OUR security architecture:

```text
Bot creates server-side handoff
→ cryptographically strong opaque token generated
→ only token is exposed in open_app hash/navigation
→ server stores hash of token + expected VK user + result/session reference
→ Mini App authenticates via signed launch params
→ verified VK user must match expected user
→ handoff is redeemed once
→ Mini App gets server-side existing result/flow context
```

Never put trusted:

```text
birth date
gender
product key
reason code
marketplace override result
```

into hash and accept it as authority.

Status:

```text
BOT_TO_APP_HANDOFF_MODEL = ARCHITECTURE_APPROVED
```

Exact TTL is OUR security policy and must be frozen before M5/M6 implementation.

---

## 5. Mini App identity prerequisite for handoff

A Bot→App handoff cannot be redeemed merely because the URL contains a valid token.

Required trust chain:

```text
signed VK launch params
→ valid signature
→ expected vk_app_id
→ verified vk_user_id
→ handoff expected user match
```

Status:

```text
HANDOFF_REQUIRES_VERIFIED_VK_IDENTITY = HARD APPLICATION SECURITY RULE
```

Unsigned or wrong-user handoff attempts fail closed.

---

## 6. Bridge `VKWebAppOpenApp` is not Bot `open_app`

Official current Bridge type:

```text
VKWebAppOpenApp
  app_id
  location?
  group_id?       # source comments: Android/iOS community context
  close_parent?   # source comments: Android/iOS
```

This opens another Mini App from a Mini App.

It is a separate contract from Community keyboard `open_app`.

Status:

```text
BRIDGE_OPEN_APP = VERIFIED
BRIDGE_OPEN_APP_IS_BOT_KEYBOARD_OPEN_APP = false
```

Do not mix their parameters.

This method is not our Mini App → community conversation solution.

---

## 7. Bridge `VKWebAppClose` boundary

Official current Bridge type verifies:

```text
VKWebAppClose request:
  status: success | failed
  payload?: any

result:
  payload: any
```

Status:

```text
VKWEBAPP_CLOSE_EXISTS = VERIFIED
```

The checked current type contract does not guarantee that calling `VKWebAppClose` opens or returns to a specific community messages dialog.

Therefore:

```text
VKWEBAPP_CLOSE_RETURNS_TO_COMMUNITY_DIALOG = NOT_VERIFIED
```

Do not implement human handoff as:

```text
Close app → assume user is now in community messages
```

unless staging/product launch context explicitly proves and documents such UX for supported clients.

---

## 8. `VKWebAppAllowMessagesFromGroup` boundary

Official current Bridge request:

```text
group_id
key?
```

Official result:

```text
{ result: true }
```

This is permission acquisition.

Status:

```text
ALLOW_MESSAGES_FROM_GROUP = VERIFIED
ALLOW_MESSAGES_FROM_GROUP_OPENS_DIALOG = false / NOT PART OF VERIFIED CONTRACT
```

Permission can be useful later for communication, but it is not navigation.

---

## 9. Mini App → community conversation

No checked current official Bridge method/type has established a dedicated primitive equivalent to:

```text
open this community's messages dialog
```

Therefore:

```text
MINIAPP_TO_COMMUNITY_DIALOG = UNRESOLVED
```

Forbidden until resolved:

- guessed `vk.me/...` deep link claimed as official contract;
- made-up Bridge method;
- abusing `VKWebAppClose` and assuming destination;
- abusing `VKWebAppAllowMessagesFromGroup` as navigation;
- opening an unrelated app via `VKWebAppOpenApp` and calling it handoff.

M6 may ship without this feature only if product scope explicitly accepts its exclusion; it cannot silently claim full two-way continuity.

---

## 10. Mini App standalone requirement

Mini App must remain usable without an existing Bot session.

Standalone flow:

```text
signed Mini App launch
→ authenticated app session
→ date
→ gender
→ shared Recommendation API
→ result
```

Bot handoff is optional enhancement, not a prerequisite.

Status:

```text
MINIAPP_STANDALONE_FLOW = REQUIRED
```

---

## 11. Bot standalone requirement

Bot must remain fully usable without Mini App/open_app support.

Flow:

```text
community messages
→ date
→ gender
→ result
→ start over / product action
```

If `open_app` unsupported on client:

```text
recommendation still completes
```

Status:

```text
BOT_STANDALONE_FLOW = REQUIRED
```

---

## 12. Shared correlation

Cross-channel references are server application data:

```text
result_id
bot_session reference
miniapp_session reference
handoff internal id
```

No channel may mutate semantic result snapshot.

Recommended invariant:

```text
result row immutable
handoff references result
Mini App displays referenced result
```

If user intentionally changes semantic input in the new surface, create a new result_id; do not overwrite history.

---

## 13. Duplicate-transition protection

Cross-channel actions can be retried/double-clicked.

Handoff redemption must be idempotent/fail closed:

```text
valid first redemption by expected user → bind
same already-redeemed token by same authenticated session → deterministic safe result
wrong user → reject
expired/revoked token → reject
```

Exact same-session replay behavior is OUR application contract and must be frozen/tested before implementation.

No double redemption may create duplicate recommendation/history/customer messages.

---

## 14. Handoff token handling

OUR security policy baseline:

- cryptographically random opaque token;
- raw token only presented to intended client;
- database stores token hash rather than raw token where practical;
- logs/metrics never contain raw token;
- finite TTL;
- one intended VK user;
- explicit redeemed/revoked state.

Token format/entropy/TTL are application-security decisions to freeze in PRE-M5 security ADR.

They are not VK-mandated values.

---

## 15. Cross-client staging matrix

Before production Bot→Mini App handoff, test actual registered app on supported clients:

```text
desktop web
Android VK client
iOS VK client
mobile web if included in rollout
```

Verify:

```text
keyboard open_app rendered where supported
app opens expected registered Mini App
hash/location arrives as designed
signed launch params still validate
verified user matches Bot event user
handoff redeems once
existing result displayed without semantic change
unsupported client has safe Bot-only behavior
back/close behavior recorded but not assumed to open messages
```

---

## 16. Human handoff boundary

Human handoff target is community messages, but exact Mini App navigation to that target remains unresolved.

Bot-side human handoff can be implemented independently inside community messages.

Mini App-side human handoff currently has these allowed product states:

1. feature withheld until official navigation is verified; or
2. present only as a clearly documented staging-verified mechanism after PRE-M6 update.

Do not invent transport to satisfy roadmap wording.

---

## 17. Current PRE-M6 unresolved matrix

| ID | Question | Status | Blocks |
|---|---|---|---|
| M6-U1 | registered Bot `open_app.app_id/owner_id` values | STAGING_REQUIRED | Bot→App production CTA |
| M6-U2 | open_app hash delivery across supported clients | STAGING_REQUIRED | Bot→App handoff |
| M6-U3 | Mini App → community-dialog primitive | UNRESOLVED | direct App→messages/human navigation |
| M6-U4 | `VKWebAppClose` destination semantics for our launch contexts | STAGING_ONLY, not reliable as dialog contract | cannot be used as guessed handoff |
| M6-U5 | handoff TTL/token format | OUR SECURITY POLICY PENDING | handoff backend |
| M6-U6 | repeat redemption semantics | OUR APPLICATION POLICY PENDING | idempotency contract |

---

## 18. M6 code entry gate

M6 continuity code is allowed only after:

```text
M5 authenticated Mini App = PASS
BOT_TO_APP_OPEN_APP_STAGING = PASS
OPEN_APP_REGISTERED_VALUES = frozen
OPEN_APP_CLIENT_MATRIX = captured
HANDOFF_SECURITY_POLICY = frozen
HANDOFF_IDENTITY_MATCH = tested
HANDOFF_REPLAY_POLICY = frozen/tested
```

For Mini App → community messages specifically:

```text
MINIAPP_TO_COMMUNITY_DIALOG_PRIMITIVE = VERIFIED
```

or the feature must be explicitly excluded from the release scope.

Until then:

```text
M6_FULL_TWO_WAY_CONTINUITY = BLOCKED
```

Decision marker:

```text
KIP_VK_PLATFORM_PRE_M6_CROSS_CHANNEL_CONTRACT_V1
```
