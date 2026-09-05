# STD-20 Run 2 — analytics_data HTTP 429

Date: 2026-09-05
Branch: `repair/ozon-date-contract-2026-09-04`
Canonical question: `Почему у меня вырос ДРР? Разбери, что изменилось в рекламе и продажах.`

## Command

```text
OZON_API_V1
{"operation":"analytics_data","params":{"date_from":"2026-08-22","date_to":"2026-09-04","dimension":["day"],"metrics":["revenue","ordered_units"],"limit":100,"offset":0}}
```

## Full observed result

```text
OZON_BATCH_RESULT_V1  {   "bridge": "ozon-llm-api-bridge",   "version": "0.1.19",   "delivery_mode": "sequential_batch_single_delivery",   "result_count": 1,   "capability_probe": {     "performed": false,     "status": "not_needed",     "subscription_type": "UNKNOWN",     "http_status": 0,     "error_code": null   },   "query_planner": {     "status": "complete",     "coalesced_group_count": 0,     "coalesced_logical_count": 0,     "logical_business_result_count": 1,     "physical_business_request_count": 1   } }  ===== OZON RESULT 1/1 =====  OZON_RESULT_V1 {   "bridge": "ozon-llm-api-bridge",   "version": "0.1.19",   "request_id": "0e950fff-a4b9-435b-8e6b-8765f3036645",   "operation": "analytics_data",   "command": {     "operation": "analytics_data",     "fingerprint": "3417544a"   },   "request_meta": {     "provider": "ozon",     "host_alias": "seller_api",     "http_method": "POST",     "path_alias": "analytics_data",     "external_request_executed": true,     "capability_probe_executed": false,     "capability_probe_http_status": 0   },   "http_status": 429,   "elapsed_ms": 1361,   "pagination": null,   "rate_limit": {     "quota_family": "seller.analytics_data.v1",     "min_interval_ms": 60000,     "last_provider_request_at": 1788592764233,     "next_allowed_at": 1788592829233,     "automatic_retry": false   },   "planning": {     "capability": {       "is_premium": null,       "probe_error_code": null,       "probe_http_status": 0,       "probe_performed": false,       "status": "not_needed",       "subscription_type": "UNKNOWN"     },     "entitlement": {       "capability_required": false,       "entitlement_key": "POST /v1/analytics/data",       "exact_request_preserved": false,       "partial": false,       "reason": "all_accounts",       "rule_source": "reviewed-openapi-463-2026-08-19",       "status": "SUPPORTED_AND_ENTITLED"     },     "acquisition": {       "profile_id": "analytics_basic_metrics_v1",       "prefetch_applied": false,       "requested_metrics": [         "revenue",         "ordered_units"       ],       "physical_metrics": [         "revenue",         "ordered_units"       ]     },     "execution": {       "logical_command_fingerprint": "3417544a",       "physical_command_fingerprint": "c718533e",       "command_transformed": true     }   },   "result": {     "error": {       "source": "provider",       "category": "rate_limit",       "http_status": 429,       "code": "8",       "message": "Ozon API request failed. Raw provider error text is withheld from AI output; inspect local sanitized diagnostics.",       "automatic_retry": false,       "external_request_executed": true     }   } }
```

## Classification

- Business result: `NOT_OBTAINED`
- Operational status: `FAIL_TRANSIENT_429`
- quota family: `seller.analytics_data.v1`
- one logical command -> one physical provider request: `PASS`
- external request executed: `true`
- automatic retry: `false`
- entitlement: `SUPPORTED_AND_ENTITLED`
- same-job retry required: `YES`

This is the same known analytics-method transient quota/provider-state class previously observed in STD-01. Under `NO_SKIP_ON_FAILURE`, STD-20 remains active and the exact same business read must be retried explicitly after the provider spacing/cooldown requirement; do not switch to another row.

Checkpoint: `STD_20_RUN2_ANALYTICS_429_RETRY_SAME_JOB_REQUIRED`
