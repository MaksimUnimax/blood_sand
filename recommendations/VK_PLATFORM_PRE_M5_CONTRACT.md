# VK Platform PRE-M5 Contract — Mini App official baseline

Версия: 0.1  
Статус: **PRE-M5 OFFICIAL-CONTRACT AUTHORITY**  
Дата проверки: 2026-08-29  
Бренд: «Кровь и Песок»

## 1. Назначение

Этот документ фиксирует официальный VK Mini Apps / VK Bridge baseline до M5 implementation.

Он дополняет:

```text
VK_PLATFORM_ARCHITECTURE.md
VK_PLATFORM_OFFICIAL_CONTRACT_LEDGER.md
VK_IMPLEMENTATION_ARCHITECTURE.md
VK_IMPLEMENTATION_GATE_MATRIX.md
```

Hard rule:

```text
официальный current contract найден
→ можно проектировать точный adapter/UI contract

официальные источники противоречат друг другу
→ не выбирать молча
→ пометить OFFICIAL_CONFLICT
→ разрешить перед кодом по более свежему primary source/release/staging

contract не найден
→ UNRESOLVED
→ не придумывать
```

Business recommendation semantics не меняются.

## Addendum — recovered registered-app repository evidence (2026-08-30)

Commit `703b3f9fae5d5802b4063401d4c5d10e038bce62` explicitly records
`VK_MINIAPP_APP_ID = 54743026` as an owner-registered ID.  Its exact authority
classification is `OWNER_REGISTERED_EVIDENCE`, not a mere implementation
default.  It does **not** prove current VK control-plane registration, protected
key/enabled state, registered dev/prod origins, or a real launch.  Those remain
`STAGING_REQUIRED`; never derive owner/community binding from this app ID.

---

## 2. Current official ecosystem baseline

Official repositories checked:

```text
VKCOM/create-vk-mini-app
VKCOM/vk-bridge
VKCOM/VKUI
VKCOM/vk-mini-apps-router
VKCOM/vk-miniapps-deploy
VKCOM/vk-apps-launch-params
```

### Current generator

Official `create-vk-mini-app` package currently declares:

```text
@vkontakte/create-vk-mini-app = 3.0.0
Node >= 18.0.0
```

Official README recommends:

```text
VKUI + Bridge + Router
```

and supports TypeScript.

Status:

```text
CREATE_VK_MINI_APP_3_0_0 = VERIFIED_CURRENT_REPO_BASELINE
NODE_18_MINIMUM_IN_GENERATOR = VERIFIED
OFFICIAL_RECOMMENDED_TEMPLATE = VKUI+Bridge+Router
```

Exact installed toolchain still must be pinned at M5 start rather than using moving `latest` during reproducible builds.

---

## 3. Current official package baselines

Official current repositories checked at research time expose:

```text
@vkontakte/vk-bridge          3.0.2
@vkontakte/vk-mini-apps-router 1.8.6
@vkontakte/vkui               8.4.0
```

Official generator TypeScript `vkui-bridge-router` template currently references:

```text
@vkontakte/vk-bridge          ^3.0.2
@vkontakte/vk-bridge-react    ^2.0.1
@vkontakte/vk-mini-apps-router ^1.8.6
@vkontakte/vkui               ^8.0.0
react                         ^18.2.0
react-dom                     ^18.2.0
vite                          ^8.0.16
```

Current VKUI repository declares peer compatibility with:

```text
React 18.2.x or React 19.x
```

Current router repository declares peer compatibility with:

```text
VK Bridge ^2.7.2 or ^3.0.0
VKUI ^5 || ^6 || ^7 || ^8
```

Status:

```text
VK_BRIDGE_CURRENT_REPO_VERSION = 3.0.2
VKUI_CURRENT_REPO_VERSION = 8.4.0
VK_ROUTER_CURRENT_REPO_VERSION = 1.8.6
PACKAGE_COMPATIBILITY_BASELINE = VERIFIED
```

These are research-time baselines, not forever-pinned values. Revalidate immediately before M5 code and commit exact lockfile versions.

---

## 4. Official deploy-tool conflict

Official generator template currently contains:

```text
@vkontakte/vk-miniapps-deploy = ^0.1.6
```

But official `VKCOM/vk-miniapps-deploy` README explicitly states:

```text
all package versions below v1.0.0 are deprecated and no longer supported
```

Therefore:

```text
MINIAPP_DEPLOY_VERSION_SOURCE = OFFICIAL_CONFLICT
```

Hard implementation rule:

- do NOT copy generator's `^0.1.6` blindly;
- before M5 scaffold, resolve the current supported deploy version using current official package/release/developer documentation;
- pin the resolved supported version;
- record why it supersedes the stale generator template entry.

M5 cannot close while using an officially declared unsupported deploy package version.

---

## 5. Official VK Bridge baseline

Official package:

```text
@vkontakte/vk-bridge 3.0.2
```

Official bridge source distinguishes environments including:

```text
Android WebView
iOS WebView
React Native WebView
web / mobile web / desktop web
```

Status:

```text
BRIDGE_RUNTIME_ENVIRONMENT_DETECTION = VERIFIED
```

Frontend must not assume one runtime/client behavior.

---

## 6. Bridge initialization

Official current request/response type map verifies:

```text
VKWebAppInit request = {}
VKWebAppInit result = { result: true }
```

`VKWebAppInit` is part of the supported desktop method list and is the standard platform initialization method.

Architecture rule:

```text
Mini App startup
→ initialize Bridge
→ only then use optional Bridge features
```

Init failure produces an explicit platform initialization error state; frontend must not silently continue as if embedded trust/capabilities exist.

Status:

```text
VKWEBAPP_INIT_CONTRACT = VERIFIED
```

---

## 7. Bridge capability checking

Current bridge implementation exposes:

```text
supportsAsync(method)
```

Current source explicitly marks synchronous:

```text
supports(method)
```

as deprecated and prints:

```text
Use supportsAsync instead
```

On web, `supportsAsync` obtains supported handlers where possible and otherwise falls back conservatively.

Therefore:

```text
BRIDGE_SUPPORTS_ASYNC = VERIFIED
BRIDGE_SUPPORTS_SYNC = DEPRECATED
```

Hard UI rule:

```text
optional Bridge action
→ await supportsAsync(action)
→ supported path
→ safe fallback if false/error
```

Do not build new M5 code around deprecated `bridge.supports()`.

---

## 8. GetLaunchParams contract

Official current VK Bridge types verify:

```text
VKWebAppGetLaunchParams request = {}
```

Current result type:

```text
vk_user_id                    number
vk_app_id                     number
vk_is_app_user                0 | 1
vk_are_notifications_enabled  0 | 1
vk_language                   enum
vk_ref                        string
vk_access_token_settings      string
vk_group_id?                  number
vk_viewer_group_role?         enum
vk_platform                   enum
vk_is_favorite                0 | 1
vk_ts                         number
sign                          string
```

Status:

```text
VKWEBAPP_GET_LAUNCH_PARAMS = VERIFIED
CURRENT_LAUNCH_PARAM_TYPE_SET = VERIFIED
VK_TS_TYPE = number
```

Important:

This verifies existence/type, not an official freshness TTL or unit/age policy sufficient for our backend security decision.

---

## 9. Launch params as backend authentication material

Official `VKCOM/vk-apps-launch-params` explains:

- VK appends launch params to application URL;
- platform params use `vk_` prefix;
- separate `sign` authenticates launch params;
- launch params can be used as backend authentication data after signature verification;
- explicit transfer to backend is preferred over accidental Referer-based transmission.

Official example shows explicit Authorization-header transport of the raw signed launch query.

Status:

```text
SIGNED_LAUNCH_BACKEND_AUTH = VERIFIED
EXPLICIT_LAUNCH_TRANSFER = VERIFIED
REFERER_AUTH_PATTERN = DISCOURAGED_BY_OFFICIAL_SOURCE
```

Our backend may therefore define a typed explicit launch-auth header/body contract, but it must preserve exact signed material required by the verifier.

---

## 10. Official signature algorithm

Official Python example verifies:

```text
1. `sign` must exist.
2. Keep keys beginning with `vk_`.
3. Sort those keys.
4. URL-encode ordered values.
5. HMAC-SHA256 with protected Mini App key.
6. Base64 encode.
7. remove trailing padding used by example.
8. replace + / with - _.
9. compare result to `sign`.
```

Status:

```text
MINIAPP_SIGNATURE_ALGORITHM = VERIFIED
```

Security rules:

- protected key server-side only;
- invalid signature → no trusted identity/session/handoff;
- `vk_user_id` alone is never trusted;
- expected app id must additionally match application configuration.

Implementation should use constant-time signature comparison where language/platform API permits; that is OUR security-hardening decision.

---

## 11. `vk_ts` freshness boundary

Current Bridge result verifies:

```text
vk_ts: number
```

The checked official signature example validates authenticity but does not define a required replay/freshness TTL.

Therefore:

```text
VK_TS_EXISTS = VERIFIED
VK_TS_OFFICIAL_REQUIRED_TTL = UNRESOLVED
```

M5 backend must not claim a made-up timeout is imposed by VK.

Before authenticated production bootstrap, one of two things must happen:

1. current official VK security documentation supplies a freshness/replay rule; or
2. owner explicitly approves an application security freshness policy after staging confirms `vk_ts` semantics/units.

That value becomes OUR SECURITY POLICY with tests/config.

---

## 12. Mini App application session boundary

VK official contracts authenticate signed launch data; they do not require this project to resend the full launch query on every backend request.

OUR architecture decision:

```text
verified signed launch bootstrap
→ issue opaque backend application session token
→ subsequent API calls use that session token
```

Rationale:

- avoids repeatedly exposing raw signed launch material;
- avoids relying on embedded-client third-party cookie behavior;
- gives explicit expiry/revocation/handoff binding.

Session token/TTL format is NOT a VK contract and must be frozen as application security policy before M5 code.

---

## 13. AllowMessagesFromGroup contract

Current official VK Bridge request type:

```text
VKWebAppAllowMessagesFromGroup:
  group_id: number
  key?: string
```

Current result:

```text
{ result: true }
```

Status:

```text
VKWEBAPP_ALLOW_MESSAGES_FROM_GROUP = VERIFIED
```

This method is a permission acquisition surface.

It does NOT in the checked current contract open a community dialog.

Do not conflate:

```text
permission to receive/send community messages
```

with:

```text
navigation to community conversation UI
```

---

## 14. Mini App → community-dialog navigation

Search/check of current Bridge method surface found no clearly defined:

```text
OpenCommunityDialog
OpenCommunityMessages
```

contract.

`VKWebAppAllowMessagesFromGroup` is not such a primitive.

Therefore:

```text
MINIAPP_TO_COMMUNITY_DIALOG = UNRESOLVED
```

Hard rule:

- no guessed `vk.me/...` deep link called an official contract;
- no invented Bridge method;
- feature remains excluded until official documentation or verified supported staging mechanism resolves it.

This does not block Mini App recommendation flow itself.

---

## 15. VKWebAppOpenApp contract

Current Bridge request type:

```text
VKWebAppOpenApp:
  app_id: number
  location?: string
  group_id?: number    # community context, Android/iOS only per source comment
  close_parent?: boolean  # Android/iOS only per source comment
```

Current result:

```text
{ result: true }
```

Status:

```text
VKWEBAPP_OPEN_APP = VERIFIED
```

This is a Mini App → another Mini App capability, not proof of Mini App → community-message-dialog navigation.

Do not misuse it for human handoff unless a specific official target application contract exists.

---

## 16. Bot keyboard `open_app` versus Bridge `VKWebAppOpenApp`

These are separate platform surfaces:

### Community Bot keyboard action

Official API schema verifies:

```text
type=open_app
app_id
owner_id
label
hash?
payload?
```

This is the intended Bot → Mini App surface.

### VK Bridge method

```text
VKWebAppOpenApp
```

opens an app from an already running Mini App.

Hard rule:

Do not merge these two contracts or reuse fields by guesswork.

Bot → Mini App handoff uses the keyboard `open_app` contract, with real registered app/community values verified in staging.

---

## 17. Bot → Mini App handoff security

Official `open_app` supports `hash`; it does not make hash trusted application data.

OUR architecture:

```text
Bot creates opaque unpredictable handoff token
→ backend stores token hash + expected VK user + result/session reference
→ only opaque token goes into open_app hash/location
→ Mini App authenticates with signed VK launch params
→ backend verifies same expected VK user
→ one-time redeem
```

No DOB/gender/product authority in URL/hash.

Handoff TTL is OUR security policy, not VK requirement.

Exact keyboard `owner_id` value, hash delivery and selected client behavior remain staging-required.

---

## 18. Frontend semantic boundary

Mini App frontend receives result from shared backend.

Forbidden frontend business logic:

```text
resolve Chertog locally
copy matrix JSON into frontend
choose product by gender locally
apply marketplace override locally
change product because destination unavailable
infer gender from VK profile `sex`
```

Important: current VK Bridge `GetUserInfo` exposes profile sex, but current product policy explicitly requires user-selected gender and forbids guessing. Platform availability of a profile field does not override business authority.

---

## 19. Official static hosting baseline

Official `VKCOM/vk-miniapps-deploy` supports deploying static frontend to VK Mini Apps hosting.

Verified config concepts:

```text
static_path
app_id
endpoints.mobile
endpoints.mvk
endpoints.web
```

Verified deployment environments:

```text
production
dev
```

Status:

```text
VK_MINIAPPS_STATIC_HOSTING = VERIFIED
VK_MINIAPPS_DEV_PROD_ENVIRONMENTS = VERIFIED
```

Official hosting is preferred by architecture because it reduces custom embedding/origin variables, but exact registered app URLs/origins must be captured during M5 staging.

---

## 20. Dependency pinning policy

Do not run generator with moving `latest` and accept every generated range as final authority.

M5 scaffold procedure must:

1. recheck current official repositories/releases/package registry;
2. record exact current compatible versions;
3. resolve the deploy-tool conflict;
4. create project once;
5. replace floating/caret versions with intentionally reviewed constraints where appropriate;
6. commit lockfile;
7. run build/tests;
8. document any deviation from official generator template.

This is OUR reproducibility policy.

---

## 21. Bridge capability policy

For optional Bridge methods:

```text
await bridge.supportsAsync(method)
```

before relying on them where current platform support can vary.

Do not use deprecated synchronous `supports()` in new code.

Fallback requirements:

- no optional Bridge method may be required to compute recommendation;
- inability to request message permission does not break recommendation;
- inability to open another app does not corrupt flow;
- unsupported capability gets visible/safe UI fallback.

---

## 22. M5 staging matrix

Before M5 closes, test supported product clients at minimum according to actual launch targets:

```text
desktop web
mobile web if supported by product rollout
Android VK client
iOS VK client
```

Capture sanitized evidence for:

```text
VKWebAppInit success/failure behavior
VKWebAppGetLaunchParams current result
supportsAsync for methods we use
static hosting launch/origin
signed backend bootstrap
invalid signature rejection
wrong app id rejection
application freshness policy behavior
backend session creation/expiry
Bot open_app → Mini App launch
handoff hash/location delivery
verified-user handoff redemption
keyboard/open_app unsupported fallback
```

Do not declare platform parity from a desktop-browser-only test.

---

## 23. PRE-M5 security policy decisions still required

These are OUR policies and intentionally do not pretend to come from VK:

```text
S1 launch freshness/replay acceptance window
S2 backend Mini App session TTL
S3 handoff TTL
S4 session-token entropy/format/hash storage
S5 allowed frontend origins after staging registration
S6 session revocation/rotation policy
S7 raw launch-material retention = preferably none beyond request processing
```

They must be frozen in a short PRE-M5 security ADR before authentication code.

---

## 24. Current PRE-M5 unresolved/conflict matrix

| ID | Question | Status | Effect |
|---|---|---|---|
| M5-U1 | current supported `vk-miniapps-deploy` version | **OFFICIAL_CONFLICT**: generator says `^0.1.6`, deploy repo says `<1.0.0` unsupported | blocks dependency lock/scaffold close |
| M5-U2 | VK-mandated `vk_ts` TTL | UNRESOLVED | application security policy/staging needed before auth production |
| M5-U3 | Bot `open_app.owner_id` exact registered value | STAGING_REQUIRED | blocks Bot→App CTA production |
| M5-U4 | `open_app` hash/location behavior across selected clients | STAGING_REQUIRED | blocks cross-client handoff production |
| M5-U5 | Mini App → community dialog primitive | UNRESOLVED | blocks that specific M5/M6 handoff only |
| M5-U6 | production static hosting origins | REGISTERED_APP_STAGING_REQUIRED | blocks final CORS allowlist |

---

## 25. M5 code entry gate

Mini App runtime implementation is allowed only after a PRE-M5 staging/security ADR records:

```text
CREATE_VK_MINI_APP_VERSION = revalidated
VK_BRIDGE_VERSION = pinned
VKUI_VERSION = pinned
VK_ROUTER_VERSION = pinned
DEPLOY_TOOL_VERSION = conflict resolved + pinned
NODE_VERSION = pinned
LOCKFILE = committed
VK_APP_ID = staging/production identity configured outside frontend source where appropriate
VK_APP_STATIC_HOST = verified
VKWEBAPP_INIT_FIXTURE = captured
LAUNCH_PARAMS_FIXTURE = captured/sanitized
SIGNATURE_VERIFICATION_FIXTURE = PASS
WRONG_APP_ID_TEST = PASS
LAUNCH_FRESHNESS_POLICY = explicit OUR SECURITY POLICY
APP_SESSION_TTL = explicit OUR SECURITY POLICY
ALLOWED_ORIGINS = captured/frozen
OPEN_APP_STAGING = PASS before Bot→App CTA is production-enabled
```

Until then:

```text
M5_MINIAPP_IMPLEMENTATION = BLOCKED
```

The shared M2/M3 backend architecture remains unaffected by these Mini App-specific gates.

Decision marker:

```text
KIP_VK_PLATFORM_PRE_M5_OFFICIAL_CONTRACT_V1
```
## Current package reconciliation (2026-08-29)

Frozen frontend versions: `@vkontakte/vk-bridge 3.0.2`, `@vkontakte/vkui
8.3.0`, React 19.2.0, and Vite 6.2.4. No router or vk-miniapps-deploy package
is installed for the single-screen calendar slice.

---

## 2026-08-30 M5 implementation revalidation

The dated evidence and exact source commits are recorded in
`VK_PLATFORM_M5_IMPLEMENTATION_REVALIDATION_2026-08-30.md`. Revalidated
official values are: create-vk-mini-app 3.0.0 (Node >=18), Bridge 3.0.2, VKUI
8.4.0, router 1.8.6, and deploy 1.0.2. The generator template still declares
deploy ^0.1.6 while the current official deploy repository calls every <1.0.0
version unsupported; future dependency freezing must follow the current deploy
package source, not the stale template declaration.

Current Developer launch/signature documentation now takes precedence over the
archived `vk-apps-launch-params` repository. It verifies signed launch
parameters and HMAC-SHA256 construction, but supplies no mandated freshness
TTL or proven `vk_ts` unit. Those are not silently converted into a VK
requirement.

```text
M5_CODE_GATE=BLOCKED
```

Blockers are registered-app/origin/static-host staging proof, real signed-launch
evidence, owner-approved M5 security policies, frozen standalone authenticated
M5 HTTP transport, and frozen product-action presentation.
