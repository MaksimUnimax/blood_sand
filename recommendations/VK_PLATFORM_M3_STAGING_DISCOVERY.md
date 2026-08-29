# VK Platform M3 Staging Discovery

Status: **PRE-M3 READ-ONLY STAGING DISCOVERY — PASS**
Captured at UTC: 2026-08-29

```text
VK_API_VERSION = 5.199
VK_SCHEMA_COMMIT = 333481bd082ad747d4873ef4a77f9247097eeef0
VK_SCHEMA_PACKAGE_VERSION = 5.199.99
```

## Sanitized real staging evidence

All calls used the configured staging group token and `v=5.199`. No mutating
VK method was called. Fixtures preserve successful response structures subject to
required removal of secrets and personal data.

```text
STAGING_GROUP_IDENTITY = PASS
STAGING_GROUP_ID = 35722386
STAGING_GROUP_SCREEN_NAME = bllod_and_sand

GROUP_TOKEN_PERMISSION_CALL = PASS
GROUP_TOKEN_PERMISSION_NAMES = messages, manage
GROUP_TOKEN_PERMISSION_MASK = 266240

GROUPS_GET_SETTINGS_CALL = EXPECTED_UNAVAILABLE_WITH_GROUP_TOKEN
GROUPS_GET_SETTINGS_AUTHORITY = official VK schema says user token only
GROUPS_GET_SETTINGS_ERROR27_CLASSIFICATION = EXPECTED / CONTRACT_CONSISTENT
BOTS_CAPABILITIES_READBACK = not_available_in_current_group_token_contour
BOTS_START_BUTTON_READBACK = not_available_in_current_group_token_contour
BOTS_ADD_TO_CHAT_READBACK = not_available_in_current_group_token_contour

EXISTING_CALLBACK_SERVER_COUNT = 1
EXISTING_CALLBACK_SERVER_OWNERSHIP = UNVERIFIED
EXISTING_CALLBACK_SERVER_CLASSIFICATION = LEGACY_OR_EXTERNAL_UNKNOWN
EXISTING_CALLBACK_SERVER_MUTATION_ALLOWED = no
PROJECT_CALLBACK_SERVER = NOT_PROVISIONED
EXISTING_CALLBACK_SERVER_STATUS = failed

CALLBACK_SETTINGS_CALL = PASS
CALLBACK_API_VERSION_ACTUAL = 5.130
MESSAGE_NEW_ACTUAL = 1
MESSAGE_EVENT_ACTUAL = not_returned

CALLBACK_CONFIRMATION_CODE_CALL = PASS
CONFIRMATION_CODE_EXPOSED = no
```

The confirmation-code fixture records access only; its secret response field was
removed entirely. No configured-to-placeholder identity mapping is persisted.

## Sanitized fixtures

- `tests/fixtures/vk/staging/group_identity.v5_199.sanitized.json`
- `tests/fixtures/vk/staging/token_permissions.v5_199.sanitized.json`
- `tests/fixtures/vk/staging/callback_servers.v5_199.sanitized.json`
- `tests/fixtures/vk/staging/callback_settings.v5_199.sanitized.json`
- `tests/fixtures/vk/staging/callback_confirmation_code_access.v5_199.sanitized.json`

## Evidence classifications

| Item | Classification | Current evidence / required next stage |
|---|---|---|
| VK_API_VERSION | VERIFIED_NOW | All successful real calls used `5.199`. |
| STAGING_GROUP_IDENTITY | VERIFIED_NOW | Returned group id matches configured id and screen name is `bllod_and_sand`. |
| GROUP_TOKEN_PERMISSION_RESPONSE | VERIFIED_NOW | Real `mask` and permission names/settings captured. |
| FINAL_REQUIRED_PERMISSION_NAMES | UNRESOLVED | Read-only access is proven; later send behavior still determines final policy. |
| BOT_CAPABILITIES | NOT_AVAILABLE_IN_CURRENT_GROUP_TOKEN_CONTOUR | `groups.getSettings` is user-token-only in the official schema. |
| EXISTING_CALLBACK_SERVER | LEGACY_OR_EXTERNAL_UNKNOWN | One actual server is present, but neither title nor URL proves project ownership. |
| EXISTING_CALLBACK_SERVER_STATUS | VERIFIED_NOW | The unknown/legacy server reports `failed`; it must not be mutated. |
| EXISTING_CALLBACK_API_VERSION | VERIFIED_NOW | The unknown/legacy server reports `5.130`; this does not imply a project upgrade action. |
| MESSAGE_NEW | VERIFIED_NOW | Actual setting is enabled (`1`). |
| MESSAGE_EVENT | UNRESOLVED | No `message_event` field was returned; it is not inferred. |
| CALLBACK_CONFIRMATION_METHOD_ACCESS | VERIFIED_NOW | Access call succeeded; code was not retained. |
| CALLBACK_CONFIRMATION_HANDSHAKE | REQUIRES_WRITE_STAGE | No provisioning/handshake was attempted. |
| REAL_MESSAGE_NEW_FIXTURE | REQUIRES_REAL_EVENT | No live event was induced. |
| TEXT_KEYBOARD_FIXTURE | REQUIRES_REAL_EVENT | No live event was induced. |
| MESSAGES_SEND_SUCCESS_FIXTURE | REQUIRES_REAL_SEND | `messages.send` was not called. |
| PERMANENT_ERROR_FIXTURE | REQUIRES_REAL_SEND | No send/error experiment was made. |
| RETRY_POLICY | UNRESOLVED | Requires later real-send/error evidence and an explicit project decision. |

## Controls observed

```text
VK_MUTATING_METHODS_CALLED = no
MESSAGES_SEND_CALLED = no
CALLBACK_HANDSHAKE_ATTEMPTED = no
BOT_CODE_CREATED = no
VK_RUNTIME_CODE_CREATED = no
SECRETS_COMMITTED = no
```

The group-token read-only discovery gate passes. `groups.getSettings` error 27 is
expected because the official schema permits a user token only; it is not a token
failure. The existing Callback server and its settings are factual evidence about
an unverified legacy/external server, not authority to reuse or mutate it.

```text
PRE_M3_READ_ONLY_STAGING_DISCOVERY = PASS
```

## Controlled provisioning follow-up

The subsequent authorized write-stage created a separate Callback server id
`4` at `https://api.autopostmanager.ru/vk-staging/callback`, confirmed it as
`ok`, and set its API version to `5.199` with only `message_new=1` enabled.
The legacy server id `3` was not mutated. See
`VK_PLATFORM_M3_STAGING_PROVISIONING.md` for the current controlled state.
