# VK Platform M5 implementation revalidation — 2026-08-30

Status: **BLOCKED — documentation-only entry gate**  
Required start commit: `9beffb147adad03e7782e10de13fcd67a6cc8fee`
Evidence retrieved: 2026-08-30 (UTC+02:00)

## Addendum — current local control-plane/staging inspection

The later same-day sanitized inspection is recorded in
`VK_PLATFORM_M5_CONTROL_PLANE_STAGING_EVIDENCE_2026-08-30.md`.  It recovers
the active staging service and shows configured App ID `54743026`, protected
key presence, configured public URL, and a reachable static host; it also
proves that the feature is currently disabled and that the historical config
couples M5 and M6 handoff requirements.  It does **not** prove a VK-registered
origin or current VK control-plane identity, so all real-launch and `vk_ts`
gates remain `STAGING_REQUIRED` and `M5_CODE_GATE` remains `BLOCKED`.

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

## Recovered Mini App history and owner-registration evidence

The prior M3 decision (`c4b1816dc4249b1d9c0dcfc44bb5e85192a28a0f`) correctly
left identity and security policy pending.  It is superseded only as to the
active date-entry UX by `fc5409280c7517de3ea538c0f40e085e3ec84ef2`; it does
not retire the reusable signed-launch, opaque-token, hashed-persistence, and
single-use infrastructure.

`703b3f9fae5d5802b4063401d4c5d10e038bce62` then added this explicit
repository owner statement: ``VK_MINIAPP_APP_ID = 54743026 (owner-registered
ID)``.  This is not merely a code default.  It is repository owner-registration
evidence, but it is not a current VK control-plane query or launch fixture.

| history/evidence | classification | current effect |
|---|---|---|
| M3 authority, `c4b1816` | owner decision (then pending identity/security) | historical; do not erase |
| `703b3f9` statement | owner-registration evidence | app ID `54743026` |
| `VKMiniAppConfig.app_id=54743026` | implementation default | corroborates; is not control-plane proof |
| handoff `600`, session `900`, enabled fixture | implemented staging policy / synthetic test assumption | implemented, not owner approval |
| `a32bc13` calendar UI; `9d09faf` tests | historical superseded product UX / synthetic acceptance | not standalone M5 |
| `fc540928` retirement | historical superseded product UX | retains reusable security infrastructure |

```text
OWNER_REGISTERED_APP_ID_REPO_EVIDENCE=PASS
OWNER_REGISTERED_APP_ID=54743026
OWNER_REGISTERED_APP_ID_EVIDENCE_COMMIT=703b3f9fae5d5802b4063401d4c5d10e038bce62
REGISTERED_APP_ID_REPO_AUTHORITY=OWNER_REGISTERED_EVIDENCE
CURRENT_VK_CONTROL_PLANE_REGISTRATION=STAGING_REQUIRED
```

## Hosting and staging evidence

Official hosting evidence: Developer hosting overview and deploy source above.
The supported configuration includes `static_path`, `app_id`,
`endpoints.mobile`, `.mvk`, `.web`; `MINI_APPS_ENVIRONMENT` supports
`dev` and `production`. The docs allow another HTTPS host, but do not prove
this project's custom host is registered.

The 2026-08-30 evidence that observed a 404 is superseded by a fresh
non-mutating HTTPS probe: `https://api.autopostmanager.ru/vk-miniapp/` and
`/vk-miniapp/index.html` both return `200`, serving the deployed static
artifact.  Thus no local static repair is authorized or needed.  The prior
nginx alias observation was `/vk-miniapp/ -> /var/www/kip-vk-miniapp/`; its
effective configuration, filesystem ownership/mode, and current artifact
identity cannot be re-inspected without the existing privileged server path.

The service/config inspection was attempted first with `systemctl cat` and
`systemctl show ... -p EnvironmentFiles` over each available project/server
SSH identity.  The server rejected those identities before command execution.
No ordinary-read failure was misclassified as a protected-config conclusion;
the privileged access path is unavailable to this audit.  No secret was read
or printed.

```text
KIP_VK_MINIAPP_ENABLED=BLOCKED (protected EnvironmentFiles not reachable)
KIP_VK_MINIAPP_APP_ID_PRESENT=BLOCKED
KIP_VK_MINIAPP_APP_ID_VALUE=BLOCKED
KIP_VK_MINIAPP_OWNER_ID_PRESENT=BLOCKED
KIP_VK_MINIAPP_OWNER_ID_VALUE=BLOCKED
KIP_VK_MINIAPP_PROTECTED_KEY_PRESENT=BLOCKED
KIP_VK_MINIAPP_HANDOFF_SECRET_PRESENT=BLOCKED
KIP_VK_MINIAPP_HANDOFF_TTL_SECONDS=BLOCKED
KIP_VK_MINIAPP_SESSION_TTL_SECONDS=BLOCKED
KIP_VK_MINIAPP_PUBLIC_URL_PRESENT=BLOCKED
KIP_VK_MINIAPP_PUBLIC_URL=BLOCKED
MINIAPP_STATIC_PUBLIC_ORIGIN=https://api.autopostmanager.ru
MINIAPP_PUBLIC_ROUTE_HTTP_STATUS=200
STATIC_CONTENT_REACHABLE=yes
STATIC_404_ROOT_CAUSE=SUPERSEDED_STALE_OBSERVATION; current route is 200; historical local cause cannot be proven without nginx access
MINIAPP_NGINX_LOCATION_PRESENT=yes (historical nginx evidence)
MINIAPP_STATIC_DIRECTORY_PRESENT=yes (historical evidence)
MINIAPP_INDEX_PRESENT=yes (fresh HTTPS index probe)
MINIAPP_INDEX_READABLE_BY_NGINX=yes (inferred only from fresh 200; filesystem mode not independently inspected)
STATIC_REPAIR_AUTHORIZED=no (explicit configured PUBLIC_URL and registered-origin proof unavailable)
STATIC_REPAIR_PERFORMED=no
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

## Current official identity, launch, and hosting contract

Current VK Developer pages were fetched directly on 2026-08-30:
[`launch parameters`](https://dev.vk.ru/ru/mini-apps/development/launch-params),
[`signature`](https://dev.vk.ru/ru/mini-apps/development/launch-params-sign),
and [`static hosting`](https://dev.vk.ru/ru/mini-apps/development/hosting/overview).
They state that VK supplies launch parameters at the configured application
URL; `vk_app_id`, `vk_user_id`, `vk_ts`, and `sign` are defined; `sign` protects
against substitution; and `vk_user_id` must be verified by calculating and
comparing the signature.  The signature algorithm is sorted `vk_*`, URL-encoded
values joined by `&`, HMAC-SHA256 with the protected key, unpadded base64url,
then comparison.  `vk_ts` is described as signature-generation time, with no
unit stated and no VK freshness TTL mandated.

The current official `apps.get` schema provides an app metadata method: it
accepts `app_id`, requires a user or service token, and can return app fields
including `author_owner_id` (official source:
[`VKCOM/vk-api-schema`, master `333481bd082ad747d4873ef4a77f9247097eeef0`, `apps/methods.json`](https://github.com/VKCOM/vk-api-schema/blob/333481bd082ad747d4873ef4a77f9247097eeef0/apps/methods.json)).
It does not establish configured Mini App dev/prod URLs in the published schema.
No protected credential was available to run it, so it cannot replace an owner
application-management UI check for registered origins.

```text
OFFICIAL_APP_METADATA_METHOD=apps.get
OFFICIAL_APP_METADATA_METHOD_SOURCE=https://github.com/VKCOM/vk-api-schema/blob/333481bd082ad747d4873ef4a77f9247097eeef0/apps/methods.json
VK_LAUNCH_PARAMS_CURRENT_DOC=PASS
VK_SIGNATURE_CURRENT_DOC=PASS
VK_TS_UNIT=UNRESOLVED
VK_MANDATED_FRESHNESS_TTL=UNRESOLVED
PROJECT_CONFIGURED_PUBLIC_URL=BLOCKED (protected config unavailable)
CURRENT_SERVED_ORIGIN=https://api.autopostmanager.ru
VK_REGISTERED_DEV_ORIGIN=STAGING_REQUIRED
VK_REGISTERED_PRODUCTION_ORIGIN=STAGING_REQUIRED
```

VK’s hosting instructions define `vk-miniapps-deploy` uploading static files
and offering to update the app's production, development, and test-group URL
settings.  This is the current supported launch/test procedure: an authorized
owner deploys/selects the registered Mini App in VK's application-management
UI (or permits the official deploy tool to update those URL fields), then
launches it from that registered/test-group context.  The documentation does
not define `vk.ru/app54743026` as this project's staging procedure.

```text
OFFICIAL_MINIAPP_LAUNCH_PROCEDURE=owner uses registered Mini App management/test-group launch after registered dev URL is set (or official deploy tool updates it)
OFFICIAL_MINIAPP_LAUNCH_SOURCE=https://dev.vk.ru/ru/mini-apps/development/hosting/overview
OWNER_UI_ACTION_REQUIRED=yes
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

```text
S1 launch freshness/replay:
VALUE=no TTL chosen; vk_ts unit and VK TTL UNRESOLVED
SOURCE=current VK launch docs + PRE-M5
CLASSIFICATION=UNRESOLVED; owner policy required
OWNER_APPROVAL_PROVEN=no

S2 application session TTL:
VALUE=900 seconds
SOURCE=703b3f9 implementation statement; config default; synthetic test fixture
CLASSIFICATION=IMPLEMENTED_STAGING_POLICY / OUR_SECURITY_POLICY_NOT_APPROVED
OWNER_APPROVAL_PROVEN=no

S3 handoff TTL:
VALUE=600 seconds, single use
SOURCE=703b3f9 implementation statement; config default; synthetic test fixture
CLASSIFICATION=IMPLEMENTED_STAGING_POLICY / OUR_SECURITY_POLICY_NOT_APPROVED
OWNER_APPROVAL_PROVEN=no
M5_STANDALONE_REQUIRED=no (M6 handoff boundary)

S4 token entropy/format:
VALUE=secrets.token_urlsafe(32) bearer/handoff token
SOURCE=recommendations/vk/storage.py
CLASSIFICATION=IMPLEMENTATION; OUR_SECURITY_POLICY_NOT_APPROVED
OWNER_APPROVAL_PROVEN=no

S4 token storage/hash:
VALUE=SHA-256 lookup hash; server-side bearer/session persistence
SOURCE=703b3f9 and recommendations/vk/storage.py
CLASSIFICATION=IMPLEMENTATION; OUR_SECURITY_POLICY_NOT_APPROVED
OWNER_APPROVAL_PROVEN=no

S5 allowed origins:
VALUE=UNRESOLVED (architecture names KIP_VK_MINIAPP_ALLOWED_ORIGINS, current config does not implement/read it)
SOURCE=VK_IMPLEMENTATION_ARCHITECTURE.md and config inspection
CLASSIFICATION=UNRESOLVED; owner policy required
OWNER_APPROVAL_PROVEN=no

S6 session revocation/rotation:
VALUE=expired/completed rejection implemented; no frozen revoke/rotate lifecycle
SOURCE=storage.py + VK_IMPLEMENTATION_ARCHITECTURE.md
CLASSIFICATION=PARTIAL_IMPLEMENTATION; OUR_SECURITY_POLICY_NOT_APPROVED
OWNER_APPROVAL_PROVEN=no

S7 raw launch material retention/logging:
VALUE=verification receives raw material; architecture says do not store/log; no audited retention control
SOURCE=miniapp.py + VK_IMPLEMENTATION_ARCHITECTURE.md
CLASSIFICATION=PARTIAL_IMPLEMENTATION; OUR_SECURITY_POLICY_NOT_APPROVED
OWNER_APPROVAL_PROVEN=no
```

## M5 HTTP, product action, and assets

`DATA_API_CONTRACT.md` freezes only `POST /v1/recommendations/resolve`.
`VK_IMPLEMENTATION_ARCHITECTURE.md` proposes authenticated
`/v1/vk/miniapp/*`; the current old runtime exposes incompatible retired
`/vk-miniapp-api/v1/*`. The standalone M5 contract is not frozen.

```text
M5_HTTP_CONTRACT=PROPOSAL_READY
OUR_APPLICATION_ARCHITECTURE_PROPOSAL=OWNER_APPROVAL_REQUIRED: POST /v1/vk/miniapp/session accepts verified signed VK launch material, checks expected app_id and approved freshness/replay policy, and returns an opaque bearer session; authenticated Mini-App resolve flow invokes the same RecommendationApplicationService as POST /v1/recommendations/resolve without altering that M2 route, its success shape, or its errors; no Bot handoff is required for standalone M5; no second matrix/Core is created.
```

Product authority approves one card and `Посмотреть оберег`, but does not
freeze the Mini App destination/layout; do not copy Bot marketplace buttons.

```text
OWNER_PRODUCT_DECISION_REQUIRED=which destinations appear; whether VK/Ozon/Wildberries are simultaneous; button order/layout; presentation of the Kolyadnik/Wildberries override; and hide versus disable when a destination is missing. One semantic recommendation remains mandatory.
```

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

Blockers: (1) current control-plane registration, protected enabled/key/config
state, and registered origins are unproven; (2) no real Bridge/launch/signature
fixture; (3) owner must freeze S1, S2 and S4–S7 (S3 only for M6); (4) the HTTP
proposal needs owner approval; (5) product-action presentation is partial.

Safe real-launch capture is not implementable in the retired calendar frontend
without changing runtime code.  The minimal future harness is an ephemeral
registered-origin page that calls `VKWebAppInit` and `VKWebAppGetLaunchParams`,
sends launch material only to the verifier over HTTPS, and retains/logs only
the six boolean outcomes specified by this ADR.  It must not persist raw query,
signature, user ID, or protected key.

No runtime/UI/package/hosting/Bot/Telegram/database change was made.

## Owner-policy freeze follow-up (2026-08-30)

`VK_PLATFORM_M5_OWNER_POLICY_FREEZE_2026-08-30.md` now supplies the missing
owner decisions: S1, S2, S4–S7 are `OWNER_APPROVED`; S3 is `DEFER_TO_M6`; the
standalone authenticated routes and product-action contract are `FROZEN`.
The 300-second, 60-second, and 900-second values are `OUR_SECURITY_POLICY`,
not VK requirements. `VK_TS_UNIT`, registered-origin/control-plane/config
proof, and real registered-app launch/signature/client evidence remain
`STAGING_REQUIRED`; `M5_CODE_GATE=BLOCKED`.

## Current owner-UI registration supersession (2026-08-30)

The later current control-plane ADR now contains
`OWNER_UI_CURRENT_CONTROL_PLANE_EVIDENCE`. It proves current control-plane
App-ID `54743026` (`CONTROL_PLANE_APP_ID_MATCH=yes`) and the exact registered
origin `https://api.autopostmanager.ru` for mobile-app, desktop, and mobile-web
URLs, each `https://api.autopostmanager.ru/vk-miniapp/`.
`S5_ALLOWED_ORIGIN_VALUES=https://api.autopostmanager.ru` is an
`OUR_SECURITY_POLICY_VALUE_DERIVED_FROM_CURRENT_OWNER_CONTROL_PLANE_EVIDENCE`.
Development mode is off on every visible surface and no Development URL is
active. This supersedes only the prior unproven registration/origin statuses;
real registered launch, Init/GetLaunchParams, signature verification, `vk_ts`
unit, and S1 runtime enablement remain `STAGING_REQUIRED`; `M5_CODE_GATE=BLOCKED`.

## Real registered desktop launch supersession (2026-08-30)

The later sanitized registered-launch fixture,
`tests/fixtures/vk/staging/miniapp_registered_launch_54743026_2026-08-30.sanitized.json`,
now proves a real desktop-web launch for App `54743026`. `VKWebAppInit` and
`VKWebAppGetLaunchParams` both passed; Bridge app ID, `sign` presence, and
`vk_ts` presence matched; server-side signature verification passed. Derived,
non-secret timestamp evidence proves `VK_TS_UNIT=SECONDS`. The fixture retains
no raw launch material, signature, user ID, or secret.

`S1_RUNTIME_ENABLEMENT=PASS_FOR_IMPLEMENTATION`. The 300-second maximum age
and 60-second future skew remain our policy, and
`VK_MANDATED_FRESHNESS_TTL=UNRESOLVED`. With the owner-policy and contract
freezes plus the previously recorded control-plane/origin/key evidence, the
pre-code M5 entry gate is now `M5_CODE_GATE=PASS`.
