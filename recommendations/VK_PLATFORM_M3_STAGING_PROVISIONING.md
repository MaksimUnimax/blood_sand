# VK Platform M3 staging provisioning

Status: **PRE-M3 DEDICATED CALLBACK PROVISIONING — PASS; REAL TRANSPORT EVIDENCE CAPTURED**
Captured: 2026-08-29

```text
AUTHORIZED_CALLBACK_URL = https://api.autopostmanager.ru/vk-staging/callback
PROJECT_CALLBACK_HOSTNAME = api.autopostmanager.ru
PROJECT_CALLBACK_PATH = /vk-staging/callback

RECEIVER_SERVICE = kip-vk-staging-callback.service
RECEIVER_BIND_ADDRESS = 127.0.0.1
RECEIVER_BIND_PORT = 18787
NGINX_CONFIG_PATH = /etc/nginx/sites-available/autopostmanager_api.conf
PUBLIC_HTTPS_ROUTE = PASS

LEGACY_CALLBACK_SERVER_ID = 3
LEGACY_CALLBACK_SERVER_MUTATED = no
PROJECT_CALLBACK_SERVER_CREATED = yes
PROJECT_CALLBACK_SERVER_ID = 4
PROJECT_CALLBACK_STATUS = ok
PROJECT_CALLBACK_API_VERSION = 5.199
PROJECT_MESSAGE_NEW_SETTING = 1
CALLBACK_CONFIRMATION = PASS

COMMUNITY_MESSAGES_SET = yes
COMMUNITY_BOTS_CAPABILITIES_SET = yes
GROUP_TOKEN_PERMISSION_NAMES = messages, manage

CONFIRMATION_CODE_STORED_SECURELY = yes
CONFIRMATION_CODE_EXPOSED = no
SECRETS_COMMITTED = no

REAL_MESSAGE_NEW = PASS
REAL_MESSAGE_NEW_SELECTION = UNAMBIGUOUS
REAL_MESSAGE_NEW_SOURCE = real VK Callback after persistence repair
REAL_MESSAGE_NEW_SHAPE = nested_current
REAL_EVENT_PERSISTENCE = PASS
DEDUP_STATE_PERSISTENCE = PASS
VK_DELIVERY_DUPLICATES_OBSERVED = no
LOGICAL_EVENT_RECORDS = 1
REAL_MESSAGE_NEW_FIXTURE = tests/fixtures/vk/staging/message_new.v5_199.sanitized.json

MESSAGES_SEND_CALLED = yes
MESSAGES_SEND_SUCCESS = PASS
MESSAGES_SEND_LOGICAL_MESSAGES = 1
MESSAGES_SEND_RETRY_COUNT = 0
MESSAGES_SEND_SUCCESS_FIXTURE = tests/fixtures/vk/staging/messages_send_success.v5_199.sanitized.json
ONE_LOGICAL_MESSAGE_ONE_RANDOM_ID = VERIFIED_STAGING

PROVISIONING_REQUIRED_PERMISSIONS = messages, manage (TESTED PROFILE; minimality not claimed)
RUNTIME_TOKEN_POLICY = same tested credential may be used for initial M3 V1 deployment; runtime method authority is separately restricted
RUNTIME_MINIMAL_NAMED_PERMISSION_SET = UNRESOLVED_NON_BLOCKING_HARDENING
FINAL_REQUIRED_PERMISSION_NAMES = messages, manage
FINAL_REQUIRED_PERMISSION_POLICY = TESTED_OPERATIONAL_PROFILE

TRANSPORT_UNKNOWN_RETRY_REUSES_RANDOM_ID = PROJECT_POLICY
EXPLICIT_SUCCESS_IS_TERMINAL = PROJECT_POLICY
EXPLICIT_DETERMINISTIC_ERROR_NO_BLIND_RETRY = PROJECT_POLICY
RETRY_ERROR_ALLOWLIST = 6, 10, 36 (one automatic retry maximum; same persisted random_id)
RETRY_POLICY = FROZEN_BOUNDED_V1
PERMANENT_ERROR_FIXTURE = PENDING_NON_BLOCKING
```

The receiver is intentionally staging-only and separate from Recommendation
Core. It accepts only POST requests, binds only to localhost, validates the
configured group and Callback secret, returns the confirmation code only to a
valid `confirmation` event, persists valid ordinary events under protected
local state, and returns `ok`. It has no recommendation or outbound-message
behavior.

The exact nginx route is the sole public proxy surface. The service and event
spool are outside Git. Public metadata only: `kip-vk-staging-callback.service`,
`127.0.0.1:18787`, `/etc/nginx/sites-available/autopostmanager_api.conf`, and
the authorized URL above.

## Captured sanitized evidence

- `tests/fixtures/vk/staging/project_callback_server.v5_199.sanitized.json`
- `tests/fixtures/vk/staging/project_callback_settings.v5_199.sanitized.json`

All four fixtures are real VK staging responses at API `5.199` against schema
commit `333481bd082ad747d4873ef4a77f9247097eeef0`; secrets and actor identity
are removed. The inbound fixture preserves the observed nested Callback shape
and primitive types while replacing all identifiers and private text. The send
fixture preserves the successful response shape while replacing its integer
identifier with `0`.

The controlled direct-text send used one random identifier persisted under the
protected staging state root before the API call. It succeeded on the first
attempt. This proves one logical message / one persisted random identifier in
staging; it does not establish a VK error-code retry allowlist or token
permission minimality. No permanent error was induced because safely
reproducible error evidence is not mandatory under the current gate wording.
