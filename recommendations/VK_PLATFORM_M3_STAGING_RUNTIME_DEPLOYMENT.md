# VK Platform M3 staging runtime deployment

Decision: `KIP_VK_M3_STAGING_RUNTIME_DEPLOYMENT_V1`.

```text
CODE_HEAD = 2d7f0134ceed0bb357b3aa35cb4d7cf188de36f1
SERVICE = kip-vk-runtime-staging.service
BIND = 127.0.0.1:18788
PUBLIC_CALLBACK_URL = https://api.autopostmanager.ru/vk-staging/callback
INTERNAL_CALLBACK_ROUTE = POST /internal/vk/callback
STATE_DB = /var/lib/kip-vk-runtime-staging/state.sqlite3
STATE_OWNER_MODE = kip-vk-staging:kip-vk-staging / 0700 directory
STAGING_UVICORN_WORKERS = 1
DEPLOYED_WORKER_LIFECYCLE = ACTIVE
CLAIM_LEASE_SECONDS = 300
RAW_PAYLOAD_RETENTION_SECONDS = 86400
SESSION_RETENTION_SECONDS = 86400
WORKER_POLL_SECONDS = 1
NGINX_TEST = PASS
NGINX_RELOAD = PASS
PUBLIC_CALLBACK_CONFIRMATION_PROBE = PASS
PUBLIC_CALLBACK_WRONG_SECRET_REJECTED = PASS
TEMP_RECEIVER_ROUTE_ACTIVE = no
TEMP_RECEIVER_SERVICE_ACTIVE = yes
TEMP_RECEIVER_ROLE = STANDBY_ROLLBACK
REAL_E2E = PENDING_USER_ACTION
```

The lease, payload/session retention, and polling values are application
staging policies, not VK platform limits. No real user message or VK send was
performed during this deployment.
