# VK Mini App M5 pause checkpoint — 2026-08-30

This is a durable owner-directed pause checkpoint. It records the current
state without changing, reinterpreting, or superseding historical evidence.

```text
STATUS=PAUSED_BY_OWNER
PAUSE_REASON=PROJECT_PRIORITY_SWITCH_TO_VK_BOT_ILLUSTRATIONS
DEVELOPMENT_HEAD=cb68ecaacdaa936afb57a4b3da97a0ceef2d40b4
REMOTE_HEAD_AT_PAUSE=cb68ecaacdaa936afb57a4b3da97a0ceef2d40b4
STAGING_HEAD_AT_PAUSE=cb68ecaacdaa936afb57a4b3da97a0ceef2d40b4
```

## Completed M5 evidence

```text
M5_PRECODE_GATE=PASS
M5_BACKEND_FOUNDATION_IMPLEMENTATION=PASS_LOCAL_HARDENED
M5_BACKEND_DEPLOYED_TO_STAGING=yes
LIVE_DB_SCHEMA_VERSION=8
M5_STANDALONE_SESSION_TABLE=present
M5_ENABLED_AT_PAUSE=yes
M5_STAGING_HEALTH=PASS
M2_UNCHANGED=yes
BOT_UNCHANGED=yes
PRODUCTION_STATIC_MINIAPP_UNCHANGED=yes
RETIRED_BOOTSTRAP_ROUTE_ACTIVE=no
RETIRED_BIRTH_DATE_ROUTE_ACTIVE=no
```

This is not full M5 acceptance.

## Staging deployment permission convention

```text
STAGING_SERVICE=kip-vk-runtime-staging.service
STAGING_WORKDIR=/opt/blood-sand-vk-recommendations
STAGING_SERVICE_USER=kip-vk-staging
STAGING_SERVICE_GROUP=kip-vk-staging
ROOT_DEPLOY_UMASK=0027 for the successful deployment convention
TRACKED_NONEXEC_FILE_CONVENTION=root:kip-vk-staging mode 0640
TRACKED_DIRECTORY_CONVENTION=root:kip-vk-staging mode 0750
TRACKED_EXEC_FILE_CONVENTION=root:kip-vk-staging mode 0750 when Git mode is 100755
DEPLOYMENT_RULE=root fast-forward plus narrow reconciliation of changed/added tracked files only; never recursive blanket chmod/chown.
PREVIOUS_FAILURE_CAUSE=root umask 0077 created root:root 0600 checkout files which were unreadable by kip-vk-staging.
```

This is an operational deployment finding, not a VK contract.

## Real backend acceptance state

```text
M5_BACKEND_REAL_ACCEPTANCE=INCOMPLETE_PAUSED
FIRST_REAL_ACCEPTANCE_RESULT=FAILED_AT_BOOTSTRAP_A
REAL_BOOTSTRAP_A_REQUEST_SEEN=yes
REAL_BOOTSTRAP_A_HTTP_STATUS=401
REAL_BOOTSTRAP_A_UPSTREAM_STATUS=401
INITIAL_FAILURE_CLASS=AUTH_OR_ORIGIN_REJECTION
HARNESS_RAW_QUERY_SOURCE=window.location.search.slice(1)
HARNESS_RECONSTRUCTS_LAUNCH=no
HARNESS_BASE64URL_PADDING_REMOVED=yes
HARNESS_BASE64URL_SYNTHETIC_PARITY=PASS
HARNESS_AUTH_SCHEME=VKLaunch
HARNESS_SESSION_PATH=/v1/vk/miniapp/session
HARNESS_AND_API_SAME_ORIGIN=yes
BOOTSTRAP_REDIRECT=none
SERVER_NTP_SYNCHRONIZED=yes
SERVER_CLOCK_STATE=healthy
LIVE_M5_CONFIG_SANITIZED=PASS
CLEAR_HARNESS_DEFECT_FOUND=no
BACKEND_SOURCE_DEFECT_PROVEN=no
```

## Prepared sanitized retry diagnostics

```text
TEMP_HARNESS_MODIFIED=yes
SANITIZED_FAILURE_TELEMETRY_ADDED=yes
FAILURE_REPORT_PATH=/var/lib/kip-vk-runtime-staging/m5-acceptance-b5a8dfad097558defe18fb0ae96bf5ea/real_backend_acceptance_failure.sanitized.json
NGINX_VALIDATION=PASS
```

The report is deliberately unread in this documentation-only pause pass and
must not be altered before the resume procedure calls for it.

## Temporary acceptance infrastructure snapshot

```text
ACCEPTANCE_HARNESS_URL=https://api.autopostmanager.ru/vk-m5-backend-acceptance-b5a8dfad097558defe18fb0ae96bf5ea/
ACCEPTANCE_REPORT_URL=https://api.autopostmanager.ru/vk-m5-backend-acceptance-b5a8dfad097558defe18fb0ae96bf5ea/report
ACCEPTANCE_COLLECTOR_LOCAL_BIND=127.0.0.1:18961
TEMP_ACCEPTANCE_SYSTEMD_UNIT=kip-vk-m5-acceptance-b5a8dfad097558defe18fb0ae96bf5ea.service
TEMP_ACCEPTANCE_NGINX_CONFIG=/etc/nginx/apm_locations.d/vk_m5_acceptance_b5a8dfad097558defe18fb0ae96bf5ea.conf
TEMP_ACCEPTANCE_STATIC_DIRECTORY=/var/www/kip-vk-m5-acceptance-b5a8dfad097558defe18fb0ae96bf5ea
```

These are pause-time values only. On resume, revalidate whether these resources
still exist and are safe to use; recreate stale temporary infrastructure rather
than blindly trusting it. This pass does not verify, remove, restart, or modify
any of them.

## Exact resume point

```text
M5_RESUME_ENTRYPOINT=REAL_BOOTSTRAP_A_SANITIZED_RETRY
```

The first resumed M5 action is not implementation work. The required sequence
is:

1. Verify staging still uses the recorded source commit or classify drift.
2. Verify M5 backend/service/DB/static/M2/Bot current health.
3. Verify whether the recorded temporary acceptance harness still exists and is safe to use.
4. Inspect whether stale temporary infrastructure must be recreated rather than blindly trusted.
5. Perform the owner desktop real M5 backend acceptance retry using a fresh VK launch.
6. If BOOTSTRAP_A fails again, read only the prepared sanitized failure telemetry.
7. Classify the exact failure.
8. Only then decide between acceptance continuation, temporary harness correction, operational fix, or M5 backend source fix.

Do not resume from `M5_STANDALONE_FRONTEND_FOUNDATION` until real backend
acceptance is actually PASS.

## Unreached acceptance stages and deferred owner action

```text
REAL_M5_SESSION_BOOTSTRAP=WAITING_OWNER_RETRY
REAL_M5_REPLAY_ROTATION=NOT_REACHED
REAL_M5_AUTHENTICATED_RESOLVE=NOT_REACHED
REAL_M5_VORON_NEUTRAL_RESULT=NOT_REACHED
M5_BACKEND_REAL_ACCEPTANCE=WAITING_OWNER_RETRY
M5_STANDALONE_FRONTEND_FOUNDATION=BLOCKED_ON_REAL_BACKEND_ACCEPTANCE
OWNER_DESKTOP_ACCEPTANCE_RETRY=DEFERRED_BY_OWNER
```

When M5 resumes, generate a fresh owner-action instruction only after the
temporary infrastructure has been revalidated.

## Next workstream handoff and future production target

```text
ACTIVE_PROJECT_PRIORITY=VK_BOT_ILLUSTRATION_INTEGRATION
NEXT_WORKSTREAM_ARTIFACT=/root/vk-bot-illustrations.zip
NEXT_WORKSTREAM_ARTIFACT_SHA256=89682843134ced3e84627008b06890cef394330986a41612d46c8f2e212360e1
PRODUCTION_VK_COMMUNITY_URL=https://vk.ru/amulet_v_avto
PRODUCTION_VK_COMMUNITY_STATUS=FUTURE_TARGET_ONLY
```

The artifact is recorded only as a handoff and was not inspected or modified
in this pass. Production Bot migration occurs only after illustration
integration and staging acceptance; no credentials, community configuration,
Callback API, or access token action is authorized by this checkpoint.

## Documentation-only change gate

```text
RUNTIME_CODE_CHANGED=no
BOT_CODE_CHANGED=no
M5_CODE_CHANGED=no
FRONTEND_CHANGED=no
DATA_CHANGED=no
TEST_CHANGED=no
PACKAGE_LOCK_CHANGED=no
LIVE_STAGING_CHANGED=no
LIVE_DB_CHANGED=no
ENVIRONMENT_CHANGED=no
SYSTEMD_CHANGED=no
NGINX_CHANGED=no
VK_CONTROL_PLANE_CHANGED=no
OWNER_RETRY_PERFORMED=no
```
