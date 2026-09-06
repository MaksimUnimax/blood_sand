# CAP-14 — Run 2 provider rate-limit evidence

Status: TRANSIENT_PROVIDER_RATE_LIMIT__RETRY_REQUIRED

Operation: `finance_accrual_types`
Request ID: `bb0dc017-e6c3-4ece-afdb-36ea830f0b3d`

## Diagnosis

- entitlement: `SUPPORTED_AND_ENTITLED`
- exact request preserved: true
- command transformed: false
- external request executed: true
- logical business result count: 1
- physical business request count: 1
- provider HTTP status: 429
- retry-after: 1 second
- automatic retry: false
- provider error code: `8`

This is a transient provider rate-limit, not an entitlement failure and not evidence that the finance accrual type surface is unsupported. Under `NO_SKIP_ON_FAILURE`, CAP-14 remains active and the same logical command must be retried before moving to CAP-15.

## Full raw result

```text
OZON_BATCH_RESULT_V1  {   "bridge": "ozon-llm-api-bridge",   "version": "0.1.19",   "delivery_mode": "sequential_batch_single_delivery",   "result_count": 1,   "capability_probe": {     "performed": false,     "status": "not_needed",     "subscription_type": "UNKNOWN",     "http_status": 0,     "error_code": null   },   "query_planner": {     "status": "complete",     "coalesced_group_count": 0,     "coalesced_logical_count": 0,     "logical_business_result_count": 1,     "physical_business_request_count": 1   } }  ===== OZON RESULT 1/1 =====  OZON_RESULT_V1 {   "bridge": "ozon-llm-api-bridge",   "version": "0.1.19",   "request_id": "bb0dc017-e6c3-4ece-afdb-36ea830f0b3d",   "operation": "finance_accrual_types",   "command": {     "operation": "finance_accrual_types",     "fingerprint": "405f0634"   },   "request_meta": {     "provider": "ozon",     "host_alias": "seller_api",     "http_method": "POST",     "path_alias": "finance_accrual_types",     "external_request_executed": true,     "capability_probe_executed": false,     "capability_probe_http_status": 0   },   "http_status": 429,   "elapsed_ms": 1350,   "pagination": null,   "rate_limit": {     "retry_after": "1",     "automatic_retry": false   },   "planning": {     "capability": {       "is_premium": null,       "probe_error_code": null,       "probe_http_status": 0,       "probe_performed": false,       "status": "not_needed",       "subscription_type": "UNKNOWN"     },     "entitlement": {       "capability_required": false,       "entitlement_key": "POST /v1/finance/accrual/types",       "exact_request_preserved": true,       "partial": false,       "reason": "all_accounts",       "rule_source": "reviewed-openapi-463-2026-08-19",       "status": "SUPPORTED_AND_ENTITLED"     },     "execution": {       "logical_command_fingerprint": "405f0634",       "physical_command_fingerprint": "405f0634",       "command_transformed": false     }   },   "result": {     "error": {       "source": "provider",       "category": "rate_limit",       "http_status": 429,       "code": "8",       "message": "Ozon API request failed. Raw provider error text is withheld from AI output; inspect local sanitized diagnostics.",       "automatic_retry": false,       "external_request_executed": true     }   } }
```
