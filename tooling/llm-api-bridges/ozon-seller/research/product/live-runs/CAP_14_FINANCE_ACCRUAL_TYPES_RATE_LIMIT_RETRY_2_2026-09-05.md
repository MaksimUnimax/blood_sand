# CAP-14 — finance_accrual_types repeated provider rate-limit — retry 2

Status: ACTIVE_BLOCKED_BY_PROVIDER_RATE_LIMIT

Active row: CAP-14 — Finance transactions / reconciliation

Operation: `finance_accrual_types`

Request id: `95503d26-17cc-4e77-bfbf-fc1a079dcf27`

This is the second consecutive live attempt to read the current accrual-type dictionary after the first provider HTTP 429. The request was provider-entitled, exact-preserved and executed externally, but Ozon again returned HTTP 429 with `Retry-After: 1`. Bridge automatic retry remained disabled. This is not classified as a semantic/business zero and does not complete CAP-14.

## Full live result

```text
OZON_BATCH_RESULT_V1  {   "bridge": "ozon-llm-api-bridge",   "version": "0.1.19",   "delivery_mode": "sequential_batch_single_delivery",   "result_count": 1,   "capability_probe": {     "performed": false,     "status": "not_needed",     "subscription_type": "UNKNOWN",     "http_status": 0,     "error_code": null   },   "query_planner": {     "status": "complete",     "coalesced_group_count": 0,     "coalesced_logical_count": 0,     "logical_business_result_count": 1,     "physical_business_request_count": 1   } }  ===== OZON RESULT 1/1 =====  OZON_RESULT_V1 {   "bridge": "ozon-llm-api-bridge",   "version": "0.1.19",   "request_id": "95503d26-17cc-4e77-bfbf-fc1a079dcf27",   "operation": "finance_accrual_types",   "command": {     "operation": "finance_accrual_types",     "fingerprint": "405f0634"   },   "request_meta": {     "provider": "ozon",     "host_alias": "seller_api",     "http_method": "POST",     "path_alias": "finance_accrual_types",     "external_request_executed": true,     "capability_probe_executed": false,     "capability_probe_http_status": 0   },   "http_status": 429,   "elapsed_ms": 1358,   "pagination": null,   "rate_limit": {     "retry_after": "1",     "automatic_retry": false   },   "planning": {     "capability": {       "is_premium": null,       "probe_error_code": null,       "probe_http_status": 0,       "probe_performed": false,       "status": "not_needed",       "subscription_type": "UNKNOWN"     },     "entitlement": {       "capability_required": false,       "entitlement_key": "POST /v1/finance/accrual/types",       "exact_request_preserved": true,       "partial": false,       "reason": "all_accounts",       "rule_source": "reviewed-openapi-463-2026-08-19",       "status": "SUPPORTED_AND_ENTITLED"     },     "execution": {       "logical_command_fingerprint": "405f0634",       "physical_command_fingerprint": "405f0634",       "command_transformed": false     }   },   "result": {     "error": {       "source": "provider",       "category": "rate_limit",       "http_status": 429,       "code": "8",       "message": "Ozon API request failed. Raw provider error text is withheld from AI output; inspect local sanitized diagnostics.",       "automatic_retry": false,       "external_request_executed": true     }   } }
```

## Diagnosis

- entitlement: `SUPPORTED_AND_ENTITLED`
- exact request preserved: `true`
- external request executed: `true`
- logical business results: `1`
- physical business requests: `1`
- provider status: `429`
- provider retry hint: `Retry-After: 1`
- automatic retry: `false`
- semantic conclusion: no business conclusion may be inferred from this failure.
- benchmark action: remain on CAP-14 and retry the same required dictionary read; do not advance to CAP-15.
