# VK Platform M3 Staging Discovery

Status: **PRE-M3 READ-ONLY STAGING DISCOVERY — COMPLETED**
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

GROUPS_GET_SETTINGS_CALL = FAIL
GROUPS_GET_SETTINGS_FAILURE = VK error 27: Group authorization failed: method is unavailable with group auth.
BOTS_CAPABILITIES_READBACK = not_returned
BOTS_START_BUTTON_READBACK = not_returned
BOTS_ADD_TO_CHAT_READBACK = not_returned

CALLBACK_SERVER_COUNT = 1
CALLBACK_SERVER_SELECTION = UNAMBIGUOUS
CALLBACK_SERVER_STATUS = failed

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
| BOT_CAPABILITIES | UNRESOLVED | `groups.getSettings` cannot read it with this group token. |
| CALLBACK_SERVER | ALREADY_CONFIGURED | One actual Callback server is present. |
| CALLBACK_SERVER_STATUS | VERIFIED_NOW | Actual status is `failed`, not production-ready. |
| CALLBACK_API_VERSION | VERIFIED_NOW | Actual server setting is `5.130`, not the locked `5.199`. |
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
