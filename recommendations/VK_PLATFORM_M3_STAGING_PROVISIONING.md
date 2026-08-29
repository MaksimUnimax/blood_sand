# VK Platform M3 staging provisioning

Status: **PRE-M3 DEDICATED CALLBACK PROVISIONING — PASS; REAL EVENT PENDING**
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

REAL_MESSAGE_NEW = PENDING_USER_ACTION
MESSAGES_SEND_SUCCESS = NOT_RUN
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

Both fixtures are real VK staging responses at API `5.199` against schema
commit `333481bd082ad747d4873ef4a77f9247097eeef0`; secrets and actor identity
are removed. No real `message_new` has arrived after activation, so no inbound
or `messages.send` fixture is claimed.
