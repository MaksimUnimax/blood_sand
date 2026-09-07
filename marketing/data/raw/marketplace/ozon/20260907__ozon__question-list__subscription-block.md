# Ozon `question_list` — subscription block — 2026-09-07

Status: `BLOCKED_BY_SUBSCRIPTION`

Exact user-observed bridge result:

- bridge: `ozon-llm-api-bridge`
- version: `0.1.19`
- operation: `question_list`
- request_id: `capability-967db1fe-1c3c-4d84-af6d-cdc6c92ce091`
- command fingerprint: `d93cb11c`
- capability probe performed: `true`
- capability probe HTTP: `200`
- capability status: `known`
- subscription_type: `UNSPECIFIED`
- `is_premium=false`
- entitlement key: `POST /v1/question/list`
- required subscription types: `PREMIUM_PLUS`
- entitlement status: `SUPPORTED_BUT_NOT_ENTITLED`
- business request executed: `false`
- physical business request count: `0`
- bridge error code: `SUBSCRIPTION_REQUIRED`
- error stage: `capability_planning`
- message: `Этот запрос доступен только для Ozon Premium Plus.`

Interpretation:

`CURRENT_DIRECT_OZON_QUESTION_READ = BLOCKED_BY_SUBSCRIPTION`

This is not evidence of zero questions. The endpoint business request was not sent to Ozon because the bridge correctly rejected it at entitlement planning after a successful capability probe.

No retry is authorized unless subscription/capability state changes.
