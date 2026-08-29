# VK M3 calendar handoff authority

Decision: `KIP_VK_M3_CALENDAR_HANDOFF_V1`
Date: 2026-08-29

## Frozen contract

```text
DATE_INPUT_DUAL_MODE = TEXT_OR_MINI_APP_CALENDAR
BOT_TO_MINIAPP = OPEN_APP
CALENDAR_COMPONENT = VKUI_CALENDAR
CALENDAR_MOBILE_SIZE = s
DATE_FORMAT_FROM_MINIAPP = YYYY-MM-DD
SIGNED_LAUNCH_REQUIRED = yes
VK_USER_ID_ALONE_TRUSTED = no
HANDOFF_OPAQUE = yes
HANDOFF_SINGLE_USE = yes
HANDOFF_STATE_VERSION_BOUND = yes
CROSS_USER_PROTECTION = yes
MINIAPP_FRONTEND_BUSINESS_LOGIC = none
```

The Bot keyboard uses `open_app`, not Bridge `VKWebAppOpenApp`. The verified VK
API schema permits `type=open_app` with required `app_id`, `owner_id`, and
`label`; `hash` and `payload` are only used where the current schema permits.
The real staging `message_new` fixture advertises `open_app` in
`client_info.button_actions`:

```text
REAL_STAGING_CLIENT_OPEN_APP_CAPABILITY_ADVERTISED = yes
```

This is capability evidence only, not proof that this product's future button
will launch on every client.

## Identity audit and gate

Repository configuration, server unit configuration, documented secret-key
names, and project documents contain no registered product Mini App `app_id`,
owner/community binding, protected-key entry, or approved Mini App URL.

```text
MINI_APP_IDENTITY = MISSING_REQUIRES_OWNER_REGISTRATION
MINIAPP_BACKEND_SESSION_TTL = PENDING_OWNER_SECURITY_POLICY
HANDOFF_TTL = PENDING_OWNER_SECURITY_POLICY
VK_TS_OFFICIAL_REQUIRED_TTL = UNRESOLVED
LAUNCH_FRESHNESS_POLICY = PENDING_OWNER_SECURITY_POLICY
MINIAPP_SCAFFOLD = BLOCKED_ON_REGISTERED_APP_IDENTITY
M3_CALENDAR_ARCHITECTURE_GATE = PASS
M3_CALENDAR_LIVE_STAGING_GATE = BLOCKED_PENDING_REGISTERED_MINI_APP_IDENTITY
```

No Mini App, `open_app` button, frontend, app setting, URL, or protected key is
created or changed by this decision.

## Handoff and authenticated bootstrap

When a future date button is enabled, the Bot creates a Python `secrets` random
opaque bearer token and places only that token in `open_app.hash`. Storage keeps
only its SHA-256 (or stronger deterministic) lookup hash with `vk_group_id`,
`peer_id`, `expected_vk_user_id`, `expected_state=WAITING_DATE`,
`expected_state_version`, `created_at`, `expires_at`, and `used_at`. Raw token,
birth date, gender, product, result, and IDs do not travel in the hash.

`POST /internal/vk-miniapp/bootstrap` receives the original signed launch
parameter material and token. It verifies the official HMAC-SHA256 signature
with the server-only protected key using constant-time comparison, expected
`vk_app_id`, expected VK user, unused/unexpired token, and current Bot state
and version. It then issues an explicit opaque backend Mini App bearer session;
no third-party cookie and no repeated raw launch parameters.

The date endpoint accepts only `{ "birth_date": "YYYY-MM-DD" }`. It strictly
parses Gregorian ISO date, rejects future dates, converts to the shared
day/month/year date boundary, and atomically consumes the handoff, advances the
same Bot session to `WAITING_GENDER`, increments state version, and enqueues one
normal gender prompt with the production keyboard. A stale state/version rejects
as `STALE_HANDOFF` without mutation. Replay cannot produce another prompt.

```text
TYPED_AND_CALENDAR_DATE_SHARED_BACKEND_SEMANTICS = yes
TEXT_CALENDAR_DATE_PARITY = future acceptance required
```

## Future first screen and tests

The first reusable Mini App screen is `BirthDatePicker`: VKUI `Calendar` with
mobile `size="s"`, one date, no time/range, preview, `Продолжить`, loading,
success/close, stale/expired/authentication, and retry-safe network states.
It contains no recommendation or marketplace logic.

Mandatory future tests include stale handoff, replay, cross-user signed launch
rejection, wrong app ID rejection, one outbox row, and typed/calendar parity.

## Owner action

In VK's developer/application management UI, create/register a Mini App for
this community, bind the intended community, and set the approved staging and
production HTTPS URLs. Report only these non-secret facts: `app_id`, app owner
and bound-community identifiers, and approved staging/production origins/URLs.
Place the protected key directly in the existing protected server secrets
location; never paste it into chat or source control.
## M3 calendar handoff implementation — 2026-08-29

`VK_MINIAPP_APP_ID = 54743026` (owner-registered ID).  The backend uses a v3
SQLite migration with SHA-256-only handoff/session persistence, a 600 second
single-use handoff boundary, and 900 second Mini App sessions.  Raw handoff
capabilities are permitted only inside a pending/retry open_app outbox keyboard
and are scrubbed at terminal delivery; they are never long-term storage.

The first UI adapter is `recommendations/miniapp`: VKUI + Bridge + React +
Vite, with no Router and no recommendation business logic.  It preserves the
original query string for verification, uses `window.location.hash` directly,
and uses VKUI Calendar in single-date, `size="s"`, `enableTime={false}` mode.

Official reconciliation: VKUI master package is 8.3.0; Bridge is pinned to
3.0.2; create-vk-mini-app is 3.0.0. Router 1.8.6 was checked only as a
compatibility reference and deliberately is not installed.  The older 8.4.0
project statement was stale.

`APP_AUTHOR_OWNER_ID` and `OPEN_APP_OWNER_ID` remain unresolved. They are not
derived from the app ID, bot community ID, or each other. `VK_TS` has no
established VK-required TTL here; staging policy is
`SIGNED_LAUNCH_PLUS_10_MINUTE_SINGLE_USE_HANDOFF_BOUNDARY`.
