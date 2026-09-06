# CAP-20 Run 01 — provider rate limit

Status: `FAIL_PROVIDER_RATE_LIMIT__RETRY_REQUIRED`

Benchmark row: `CAP-20 — Bridge + external-world investigation`
Bridge: `ozon-llm-api-bridge v0.1.19`
Operation: `analytics_data`

Command:

```json
{"operation":"analytics_data","params":{"date_from":"2026-09-03","date_to":"2026-09-04","dimension":["day"],"metrics":["revenue","ordered_units"],"limit":100}}
```

Observed execution:
- request_id: `cce6128e-8795-4da8-9c0d-822f42bee720`
- external_request_executed: `true`
- HTTP: `429`
- query planner: `logical_business_result_count=1`, `physical_business_request_count=1`
- automatic_retry: `false`
- provider category: `rate_limit`
- provider code: `8`
- quota family: `seller.analytics_data.v1`
- modeled minimum interval: `60000 ms`
- last_provider_request_at: `1788664476081`
- next_allowed_at: `1788664541081`
- entitlement: `SUPPORTED_AND_ENTITLED`
- requested metrics: `revenue`, `ordered_units`
- physical metrics: `revenue`, `ordered_units`
- acquisition profile: `analytics_basic_metrics_v1`
- command_transformed: `true`
- exact_request_preserved: `false`

Full delivered result:

```text
OZON_BATCH_RESULT_V1  {   "bridge": "ozon-llm-api-bridge",   "version": "0.1.19",   "delivery_mode": "sequential_batch_single_delivery",   "result_count": 1,   "capability_probe": {     "performed": false,     "status": "not_needed",     "subscription_type": "UNKNOWN",     "http_status": 0,     "error_code": null   },   "query_planner": {     "status": "complete",     "coalesced_group_count": 0,     "coalesced_logical_count": 0,     "logical_business_result_count": 1,     "physical_business_request_count": 1   } }  ===== OZON RESULT 1/1 =====  OZON_RESULT_V1 {   "bridge": "ozon-llm-api-bridge",   "version": "0.1.19",   "request_id": "cce6128e-8795-4da8-9c0d-822f42bee720",   "operation": "analytics_data",   "command": {     "operation": "analytics_data",     "fingerprint": "83c85903"   },   "request_meta": {     "provider": "ozon",     "host_alias": "seller_api",     "http_method": "POST",     "path_alias": "analytics_data",     "external_request_executed": true,     "capability_probe_executed": false,     "capability_probe_http_status": 0   },   "http_status": 429,   "elapsed_ms": 1355,   "pagination": null,   "rate_limit": {     "quota_family": "seller.analytics_data.v1",     "min_interval_ms": 60000,     "last_provider_request_at": 1788664476081,     "next_allowed_at": 1788664541081,     "automatic_retry": false   },   "planning": {     "capability": {       "is_premium": null,       "probe_error_code": null,       "probe_http_status": 0,       "probe_performed": false,       "status": "not_needed",       "subscription_type": "UNKNOWN"     },     "entitlement": {       "capability_required": false,       "entitlement_key": "POST /v1/analytics/data",       "exact_request_preserved": false,       "partial": false,       "reason": "all_accounts",       "rule_source": "reviewed-openapi-463-2026-08-19",       "status": "SUPPORTED_AND_ENTITLED"     },     "acquisition": {       "profile_id": "analytics_basic_metrics_v1",       "prefetch_applied": false,       "requested_metrics": [         "revenue",         "ordered_units"       ],       "physical_metrics": [         "revenue",         "ordered_units"       ]     },     "execution": {       "logical_command_fingerprint": "83c85903",       "physical_command_fingerprint": "cd413d0f",       "command_transformed": true     }   },   "result": {     "error": {       "source": "provider",       "category": "rate_limit",       "http_status": 429,       "code": "8",       "message": "Ozon API request failed. Raw provider error text is withheld from AI output; inspect local sanitized diagnostics.",       "automatic_retry": false,       "external_request_executed": true     }   } }
```

Diagnosis:
- The operation contract/entitlement did not fail.
- The provider rejected this physical request with HTTP 429.
- The Bridge preserved the one-command/one-business-request invariant and correctly did not auto-retry.
- CAP-20 remains open under `NO_SKIP_ON_FAILURE`; retry the same logical request only after the provider quota window has elapsed.
