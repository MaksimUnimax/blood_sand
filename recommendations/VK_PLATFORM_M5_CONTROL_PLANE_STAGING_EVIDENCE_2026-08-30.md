# VK Mini App M5 control-plane and staging evidence — 2026-08-30

Status: **PARTIAL — M5 code gate remains BLOCKED**  
Retrieval date: 2026-08-30 (Europe/Amsterdam)  
START_HEAD: `67bb0239b5bea1df1cf48c1e0a5e9e25a3d53f03`

## Evidence boundary

This record contains only current official-source checks and sanitized local
operational observations.  It contains no protected key, handoff secret,
access token, raw launch query, signature, or VK user ID.  A served URL is not
treated as proof that VK has registered that URL.

## Official-source revalidation

Current official VKCOM source was resolved on 2026-08-30:

| repository | commit | path | current contract observed |
|---|---|---|---|
| `VKCOM/vk-bridge` | `ab61077a068e290f0c408e1d372b4266eabae71e` | `packages/core/src/types/data.ts`, `packages/core/src/bridge.ts` | `VKWebAppInit` request `{}` / result `{result:true}`; `VKWebAppGetLaunchParams` request `{}` and response type includes `vk_user_id`, `vk_app_id`, `vk_ts`, and `sign`; both are listed for desktop support. |
| `VKCOM/vk-api-schema` | `333481bd082ad747d4873ef4a77f9247097eeef0` | `apps/methods.json`, `apps/objects.json` | `apps.get` exists, accepts `app_id`, and supports only `user` or `service` tokens.  Its published app fields do not establish registered Mini App development/production URLs.  Testing-group methods shown by this schema require a service token. |

The official Developer launch-parameters, signature, and hosting URLs named in
the M5 revalidation ADR returned HTTP 418 to this non-authenticated retrieval
environment on this date.  Their already-recorded same-day contract is not
contradicted, but this pass cannot independently fetch their rendered content.
Therefore `OFFICIAL_SOURCE_REVALIDATION=BLOCKED` for a fully independent
Developer-document refresh; there is no `OFFICIAL_CONFLICT`.

Source URLs: `https://dev.vk.ru/ru/mini-apps/development/launch-params`,
`https://dev.vk.ru/ru/mini-apps/development/launch-params-sign`, and
`https://dev.vk.ru/ru/mini-apps/development/hosting/overview`; official source
commits above were resolved with `git ls-remote` on the retrieval date.

## Effective protected-server configuration

Source: local systemd service discovery and sanitized read of
`kip-vk-runtime-staging.service` EnvironmentFiles.  The actual serving API was
identified as the active `kip-vk-runtime-staging.service`, whose Uvicorn child
serves `recommendations.api.app:app` on `127.0.0.1:18788`.

```text
KIP_VK_MINIAPP_ENABLED=false
KIP_VK_MINIAPP_APP_ID_PRESENT=yes
KIP_VK_MINIAPP_APP_ID=54743026
KIP_VK_MINIAPP_OWNER_ID_PRESENT=yes
KIP_VK_MINIAPP_OWNER_ID=non-numeric-configured-value
KIP_VK_MINIAPP_PROTECTED_KEY_PRESENT=yes
KIP_VK_MINIAPP_HANDOFF_SECRET_PRESENT=yes
KIP_VK_MINIAPP_HANDOFF_TTL_SECONDS=600
KIP_VK_MINIAPP_SESSION_TTL_SECONDS=900
KIP_VK_MINIAPP_PUBLIC_URL_PRESENT=yes
KIP_VK_MINIAPP_PUBLIC_URL=https://api.autopostmanager.ru/vk-miniapp/
KIP_VK_MINIAPP_ALLOWED_ORIGINS_PRESENT=no
CURRENT_CONFIG_M5_M6_COUPLING=yes
```

The owner-ID value is intentionally not reported: it is configured but does
not satisfy the requested safe-numeric form.  `VKMiniAppConfig.from_environment`
is the source for the coupling classification: when enabled it requires the
owner ID, protected key, handoff secret, both TTLs, and public URL together.
Handoff secret and handoff TTL remain `M6/HISTORICAL_CONFIG`, not standalone
M5 blockers on their own.

No existing authorized user/service VK API token was found in the inspected
operational EnvironmentFiles.  The protected key and group token were not used
as an API token.  Hence:

```text
APPS_GET_CURRENT_PROBE=NOT_AVAILABLE
APPS_GET_APP_ID_MATCH=UNRESOLVED
APPS_GET_OWNER_BINDING=UNRESOLVED
APPS_GET_PROVES_REGISTERED_ORIGINS=no
```

## Static host and control plane

Source: fresh non-mutating HTTPS probes on 2026-08-30.  Both
`https://api.autopostmanager.ru/vk-miniapp/` and
`https://api.autopostmanager.ru/vk-miniapp/index.html` returned HTTP 200,
`Content-Type: text/html`, final URL unchanged, and successful TLS verification.

```text
CURRENT_SERVED_ORIGIN=https://api.autopostmanager.ru
STATIC_CONTENT_REACHABLE=yes
CONTROL_PLANE_APP_ID=STAGING_REQUIRED
CONTROL_PLANE_APP_ID_MATCH=STAGING_REQUIRED
VK_REGISTERED_DEV_URL=OWNER_UI_EVIDENCE_REQUIRED
VK_REGISTERED_PRODUCTION_URL=OWNER_UI_EVIDENCE_REQUIRED
VK_REGISTERED_TEST_GROUP_URL=OWNER_UI_EVIDENCE_REQUIRED
REGISTERED_M5_ORIGIN_PROVEN=no
S5_ALLOWED_ORIGIN_VALUES=STAGING_REQUIRED
```

Search of the active deployment worktree and staging state found no official
deploy-tool metadata, sanitized owner-UI capture, or existing staging evidence
harness.  No authenticated authorized VK management-browser session was
available.  Consequently the local configured public URL and the 200 host are
not elevated to control-plane evidence.

## Retired frontend audit

Source: `recommendations/miniapp/src/main.tsx` at START_HEAD.  It reads
`window.location.search`, requires a hash handoff token, calls
`VKWebAppInit` (with errors ignored), and posts launch data plus handoff token
to `/vk-miniapp-api/v1/bootstrap`.  It does not call
`VKWebAppGetLaunchParams`.

```text
RETIRED_FRONTEND_CALLS_VKWEBAPP_INIT=yes
RETIRED_FRONTEND_CALLS_VKWEBAPP_GET_LAUNCH_PARAMS=no
RETIRED_FRONTEND_REQUIRES_HANDOFF=yes
RETIRED_FRONTEND_REQUIRES_RETIRED_BOOTSTRAP_ENDPOINT=yes
RETIRED_FRONTEND_SAFE_FOR_STANDALONE_EVIDENCE=no
```

It was not reactivated or changed.

## Launch and harness decision

The mandatory real-launch preconditions fail because current control-plane app
identity and a registered development/test URL are not proven, although the
protected key is present.  No safe existing harness exists.  Therefore no
launch was attempted and no temporary files, proxy rules, or processes were
created.

```text
EVIDENCE_HARNESS_PRECONDITIONS=BLOCKED
EPHEMERAL_HARNESS_CREATED=no
EPHEMERAL_HARNESS_REMOVED=not-applicable
TEMP_INFRA_CHANGE_REVERTED=not-applicable
REAL_REGISTERED_APP_LAUNCH=STAGING_REQUIRED
REAL_VKWEBAPP_INIT=STAGING_REQUIRED
REAL_VKWEBAPP_GET_LAUNCH_PARAMS=STAGING_REQUIRED
REAL_LAUNCH_APP_ID_MATCH=STAGING_REQUIRED
REAL_LAUNCH_SIGN_PRESENT=STAGING_REQUIRED
REAL_SIGNATURE_VERIFICATION=STAGING_REQUIRED
REAL_LAUNCH_VK_TS_PRESENT=STAGING_REQUIRED
VK_TS_UNIT=STAGING_REQUIRED
VK_MANDATED_FRESHNESS_TTL=UNRESOLVED
S1_RUNTIME_ENABLEMENT=STAGING_REQUIRED
SANITIZED_REAL_LAUNCH_FIXTURE=NONE
```

## Exact residual blocker and owner action

`OWNER_UI_ACTION_REQUIRED=yes`.

Using an already-authorized VK owner account, open App **54743026** in the
current VK Mini App application-management interface and capture the settings
screen/section which visibly contains the app URL configuration.  Supply only
a cropped/sanitized screenshot or transcription showing: App ID, app title and
visible type/status; current development URL; current production URL; and the
test-group URL/state, if that interface shows it.  Preserve the field labels
as the current UI displays them; do not infer labels from historical UI.

Do **not** include the protected key, service/access token, secure key,
password, or any launch query.  Once this evidence establishes a registered
development or test URL, a separately isolated harness may be considered; a
manual request to the static host is still insufficient.

## Gate decision

```text
OWNER_POLICY_FREEZE=PASS
M5_HTTP_CONTRACT=FROZEN
MINIAPP_PRODUCT_ACTION_CONTRACT=FROZEN
REGISTERED_APP_ID=54743026 (repository owner-registration evidence)
M5_CODE_GATE=BLOCKED
```

Mandatory missing evidence is current VK control-plane App-ID corroboration,
registered M5 origin, real registered launch, Bridge Init/GetLaunchParams,
signature verification, and real `vk_ts` unit semantics.  No product runtime,
M2, Bot, Telegram, schema, or package-lock code changed in this pass.
