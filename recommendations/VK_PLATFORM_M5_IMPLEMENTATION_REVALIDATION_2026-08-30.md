# VK Platform M5 implementation revalidation — 2026-08-30

Status: **BLOCKED — documentation-only entry gate**  
Required start commit: `1a9e44376ce1f31a58b2bc048550bf66d88f2b78`  
Evidence retrieved: 2026-08-30 (UTC+02:00)

## Decision and source hierarchy

This ADR applies the repository rule: current VK Developer documentation is
primary for platform behaviour; current official VKCOM source is primary for
implementation/package declarations; sanitized registered-app staging evidence
is required for app-specific/client-specific claims. Repository business
authorities remain authoritative for recommendation semantics. A missing fact
is `UNRESOLVED`, not an implementation assumption.

`VKCOM/vk-apps-launch-params` is archived (GitHub API, retrieved 2026-08-30;
default branch `master`, commit `32ca3b7088b0ca9038ff252f72faeea514d31856`).
Current VK Developer [launch parameters](https://dev.vk.ru/ru/mini-apps/development/launch-params)
and [launch-parameter signature](https://dev.vk.ru/ru/mini-apps/development/launch-params-sign)
pages supersede it for the launch/signature contract. Its examples are only
corroborating implementation evidence.

## Official-source snapshot

| Repository | branch | exact commit | evidence | observation |
|---|---|---|---|---|
| `VKCOM/create-vk-mini-app` | `master` | `05e24bcee8465b09e574a909452f41f025661e3b` | `package.json`; TypeScript template package | generator 3.0.0; Node >=18 |
| `VKCOM/vk-bridge` | `master` | `ab61077a068e290f0c408e1d372b4266eabae71e` | core package; `src/types/data.ts`, `src/bridge.ts` | Bridge 3.0.2; type/runtime contracts |
| `VKCOM/VKUI` | `master` | `6d1f17087284d046985b4f1beacd80a0571cd5d7` | `packages/vkui/package.json` | VKUI 8.4.0; React/DOM peers ^18.2.0 || ^19 |
| `VKCOM/vk-mini-apps-router` | `master` | `f9633344b4a99460a25e003f065febbac1779957` | `package.json` | router 1.8.6; Bridge ^2.7.2 || ^3, VKUI ^5–^8 peers |
| `VKCOM/vk-miniapps-deploy` | `master` | `1ff4ad16bea39bdd7e1290b9ee28628449943567` | package, README, config example, `index.js` | deploy 1.0.2; static-host config |
| `VKCOM/vk-apps-launch-params` (archived) | `master` | `32ca3b7088b0ca9038ff252f72faeea514d31856` | README; Python example | historical official example |

```text
CREATE_VK_MINI_APP_VERSION=3.0.0
CREATE_VK_MINI_APP_SOURCE_COMMIT=05e24bcee8465b09e574a909452f41f025661e3b
NODE_MINIMUM=>=18.0.0
VK_BRIDGE_VERSION=3.0.2
VK_BRIDGE_SOURCE_COMMIT=ab61077a068e290f0c408e1d372b4266eabae71e
VKUI_VERSION=8.4.0
VKUI_SOURCE_COMMIT=6d1f17087284d046985b4f1beacd80a0571cd5d7
VKUI_REACT_PEER=^18.2.0 || ^19.0.0
VK_ROUTER_VERSION=1.8.6
VK_ROUTER_SOURCE_COMMIT=f9633344b4a99460a25e003f065febbac1779957
VK_DEPLOY_VERSION=1.0.2
VK_DEPLOY_SOURCE_COMMIT=1ff4ad16bea39bdd7e1290b9ee28628449943567
```

## Generator/deploy conflict

The generator template declares `@vkontakte/vk-miniapps-deploy: ^0.1.6`.
The current official deploy package declares 1.0.2 and its README says every
version below 1.0.0 is deprecated and unsupported. The current Developer
[hosting overview](https://dev.vk.ru/ru/mini-apps/development/hosting/overview)
also directs deployments through `vk-miniapps-deploy`.

```text
GENERATOR_DEPLOY_DECLARATION=^0.1.6
DEPLOY_REPO_CURRENT_VERSION=1.0.2
DEPLOY_REPO_SUPPORT_RULE=versions below 1.0.0 deprecated and unsupported
OFFICIAL_DEPLOY_CONFLICT_CONFIRMED=yes
OFFICIAL_DEPLOY_CONFLICT_RESOLUTION=pin the current supported deploy-package source (1.0.2) when dependency policy is frozen
```

This resolves precedence for a future controlled migration only; no dependency
file changes in this pass.

## Existing local stack

Evidence: `recommendations/miniapp/package.json` and lockfile at START_HEAD.

| item | pin | classification |
|---|---:|---|
| Bridge | 3.0.2 | CURRENT |
| VKUI | 8.3.0 | COMPATIBLE_BUT_NOT_CURRENT |
| Router | absent | MISSING |
| deploy | absent | MISSING |
| React / React DOM | 19.2.0 / 19.2.0 | COMPATIBLE_BUT_NOT_CURRENT |
| Vite / TypeScript | 6.2.4 / 5.8.3 | UNRESOLVED (no VK requirement verified) |

The existing UI is the retired Bot-calendar handoff, not approved standalone
M5. Controlled migration is possible in principle, but unauthorized until the
boundaries and policies below are frozen.

## Bridge and launch-auth contracts

Evidence: Bridge types/runtime at the recorded commit and current Developer
pages above.

| contract | verified fact | architecture applicability |
|---|---|---|
| `VKWebAppInit` | request `{}`; result `{result: true}` | mandatory app startup initialization |
| `VKWebAppGetLaunchParams` | request `{}`; result includes `vk_user_id`, `vk_app_id`, `vk_ts`, `sign` | embedded launch-material source; backend verification still required |
| `supportsAsync(method)` | `Promise<boolean>`; conservative web fallback | optional features only |
| `supports(method)` | source marks deprecated | not for new M5 code |

```text
VKWEBAPP_INIT_CONTRACT=PASS
VKWEBAPP_GET_LAUNCH_PARAMS_CONTRACT=PASS
BRIDGE_SUPPORTS_ASYNC_CONTRACT=PASS
```

Current Developer docs state launch values are URL parameters and may be
obtained through `window.location.href` or `VKWebAppGetLaunchParams`. They
define `sign` as tamper detection, `vk_ts` as signature-generation time, and
require signature verification before using `vk_user_id` for authorization.
The signature page specifies: select/sort `vk_*` keys, URL-encode values and
join with `&`, HMAC-SHA256 with protected key, base64url without trailing
`=`, compare with `sign`. Expected `vk_app_id` equality is an
`OUR_SECURITY_POLICY` additional binding.

```text
SIGNED_LAUNCH_BACKEND_AUTH=PASS
SIGNATURE_ALGORITHM=PASS (HMAC-SHA256; sorted vk_*; URL encoding; unpadded base64url)
EXPECTED_APP_ID_CHECK=OUR_SECURITY_POLICY_REQUIRED
VK_TS_PRESENT=yes
VK_TS_UNIT=UNRESOLVED
VK_MANDATED_FRESHNESS_TTL=UNRESOLVED
```

## Hosting and staging evidence

Official hosting evidence: Developer hosting overview and deploy source above.
The supported configuration includes `static_path`, `app_id`,
`endpoints.mobile`, `.mvk`, `.web`; `MINI_APPS_ENVIRONMENT` supports
`dev` and `production`. The docs allow another HTTPS host, but do not prove
this project's custom host is registered.

Sanitized operational checks found an nginx alias
`/vk-miniapp/ -> /var/www/kip-vk-miniapp/` and static files, but HTTPS to the
route returns 404. Protected staging EnvironmentFiles cannot be read by this
audit; a safe runtime bootstrap probe returns `503 MINIAPP_DISABLED`.
The code default `54743026` is not registered-app control-plane evidence.

```text
REGISTERED_APP_ID=UNRESOLVED (code default 54743026 only)
APP_ID_MATCHES_REPO_EXPECTATION=UNRESOLVED
MINIAPP_ENABLED_NOW=no
PROTECTED_KEY_PRESENT=UNRESOLVED
PUBLIC_URL_CONFIGURED=UNRESOLVED
PUBLIC_URL_HOST=UNRESOLVED
STATIC_CONTENT_REACHABLE=no
OFFICIAL_STATIC_HOSTING_CONTRACT=PASS
CURRENT_PROJECT_HOSTING_MODE=custom nginx static alias plus API; not proven registered/equivalent
CURRENT_PROJECT_HOSTING_SUPPORTED_BY_REGISTERED_APP=UNRESOLVED/STAGING_REQUIRED
REGISTERED_DEV_ORIGIN=UNRESOLVED/STAGING_REQUIRED
REGISTERED_PRODUCTION_ORIGIN=UNRESOLVED/STAGING_REQUIRED
```

No sanitized registered-app launch fixture exists; existing fixtures are
Callback/Bot evidence. Unit tests are synthetic, not live proof.

```text
REAL_VKWEBAPP_INIT_FIXTURE=STAGING_REQUIRED
REAL_LAUNCH_PARAMS_FIXTURE=STAGING_REQUIRED
REAL_SIGNATURE_VERIFICATION=STAGING_REQUIRED
WRONG_APP_ID_REJECTION=PASS (synthetic unit evidence; live staging still required)
INVALID_SIGNATURE_REJECTION=PASS (synthetic unit evidence; live staging still required)
```

## Security-policy matrix

PRE-M5/implementation architecture classify these as project policies; defaults
and calendar-handoff tests are not owner approval. No owner-approved M5 decision
was found in the current authority/history inspected.

| policy | value | authority | status / required owner decision |
|---|---|---|---|
| S1 launch freshness/replay | none; ts unit/TTL unresolved | VK docs + PRE-M5 | MISSING — window, replay strategy, tests |
| S2 app-session TTL | default 900s | default only | DEFAULT_ONLY — TTL and expiry/revocation |
| S3 handoff TTL | default 600s | default only | DEFAULT_ONLY; NOT_REQUIRED_FOR_INITIAL_STANDALONE_M5 |
| S4 token entropy/format/hash | hash storage in retired code; format unfrozen | proposal/code | MISSING — entropy, format, storage, rotation |
| S5 frontend origins | no readable/proven config | architecture | MISSING — exact allowlist |
| S6 revocation/rotation | conceptual only | proposal | MISSING — lifecycle rule |
| S7 raw launch retention | do-not-store/log direction; no value | architecture | MISSING — retention/logging rule |

## M5 HTTP, product action, and assets

`DATA_API_CONTRACT.md` freezes only `POST /v1/recommendations/resolve`.
`VK_IMPLEMENTATION_ARCHITECTURE.md` proposes authenticated
`/v1/vk/miniapp/*`; the current old runtime exposes incompatible retired
`/vk-miniapp-api/v1/*`. The standalone M5 contract is not frozen.

```text
M5_HTTP_CONTRACT=UNRESOLVED
OUR_APPLICATION_ARCHITECTURE_PROPOSAL=new authenticated /v1/vk/miniapp/* transport invokes RecommendationApplicationService and leaves M2 public contract unchanged
```

Product authority approves one card and `Посмотреть оберег`, but does not
freeze the Mini App destination/layout; do not copy Bot marketplace buttons.

```text
MINIAPP_PRODUCT_ACTION_CONTRACT=PARTIAL
FINAL_ILLUSTRATIONS_REQUIRED_FOR_M5_CODE_ENTRY=no
FINAL_ILLUSTRATIONS_REQUIRED_FOR_FINAL_UI_ACCEPTANCE=yes
```

`ROADMAP.md` separates standalone M5 from M6 continuity. Thus `open_app`
staging is M6, not standalone-M5, gating; the retired calendar handoff remains
inactive.

## Code-entry decision

```text
M5_CODE_GATE=BLOCKED
```

Blockers: (1) registered App ID/key/enabled state/origins/static serving are
unproven; (2) no real Bridge/launch/signature fixture; (3) owner must freeze
S1, S2 and S4–S7 (S3 only for M6); (4) standalone authenticated HTTP contract
is unfrozen; (5) product-action presentation is partial.

No runtime/UI/package/hosting/Bot/Telegram/database change was made.
