# CAP-21 — Product queries 403 evidence

Status: `FAILED_PROVIDER_AUTH_OR_PERMISSION__DIAGNOSIS_REQUIRED`

Date: 2026-09-06

## Intended step

Read recent own-product search-query summary for SKU `1636048691` within the non-history-gated window `2026-08-07T00:00:00Z`..`2026-09-05T23:59:59Z`.

## Command

```text
OZON_API_V1
{"operation":"product_queries","params":{"date_from":"2026-08-07T00:00:00Z","date_to":"2026-09-05T23:59:59Z","page_size":1000,"skus":["1636048691"]}}
```

## Full result

```text
OZON_BATCH_RESULT_V1  {   "bridge": "ozon-llm-api-bridge",   "version": "0.1.19",   "delivery_mode": "sequential_batch_single_delivery",   "result_count": 1,   "capability_probe": {     "performed": false,     "status": "not_needed",     "subscription_type": "UNKNOWN",     "http_status": 0,     "error_code": null   },   "query_planner": {     "status": "complete",     "coalesced_group_count": 0,     "coalesced_logical_count": 0,     "logical_business_result_count": 1,     "physical_business_request_count": 1   } }  ===== OZON RESULT 1/1 =====  OZON_RESULT_V1 {   "bridge": "ozon-llm-api-bridge",   "version": "0.1.19",   "request_id": "0e898395-9af6-4899-a341-bc33800b4eef",   "operation": "product_queries",   "command": {     "operation": "product_queries",     "fingerprint": "5351e107"   },   "request_meta": {     "provider": "ozon",     "host_alias": "seller_api",     "http_method": "POST",     "path_alias": "product_queries",     "external_request_executed": true,     "capability_probe_executed": false,     "capability_probe_http_status": 0   },   "http_status": 403,   "elapsed_ms": 1035,   "pagination": null,   "rate_limit": null,   "planning": {     "capability": {       "is_premium": null,       "probe_error_code": null,       "probe_http_status": 0,       "probe_performed": false,       "status": "not_needed",       "subscription_type": "UNKNOWN"     },     "entitlement": {       "capability_required": false,       "entitlement_key": "POST /v1/analytics/product-queries",       "exact_request_preserved": true,       "partial": false,       "reason": "provider_may_return_subscription_dependent_scope",       "rule_source": "reviewed-openapi-463-2026-08-19",       "status": "SUPPORTED_AND_ENTITLED"     },     "execution": {       "logical_command_fingerprint": "5351e107",       "physical_command_fingerprint": "5351e107",       "command_transformed": false     }   },   "result": {     "error": {       "source": "provider",       "category": "auth_or_permission",       "http_status": 403,       "code": "7",       "message": "Ozon API request failed. Raw provider error text is withheld from AI output; inspect local sanitized diagnostics.",       "automatic_retry": false,       "external_request_executed": true     }   } }
```

## Immediate interpretation

The request itself passed Bridge validation and preserved the one-command/one-request invariant:

- exact request preserved;
- one logical result -> one physical business request;
- no transformation;
- no capability probe;
- provider actually executed the call;
- provider rejected it with HTTP 403 / code 7 `auth_or_permission`.

This contradicts the Bridge planning model which marked the request `SUPPORTED_AND_ENTITLED` with reason `provider_may_return_subscription_dependent_scope`. The current entitlement model says all accounts may receive a partial response and only history older than one month is feature-gated, but this request stayed inside the recent one-month window.

Do not retry the same request blindly and do not move to CAP-22. Next diagnostic: call the safe `/v1/roles` operation to verify whether the current API key explicitly includes `/v1/analytics/product-queries`. This separates key-method permission from subscription/provider entitlement behavior.

Checkpoint: `CAP_21_PRODUCT_QUERIES_403_ROLES_DIAGNOSTIC_NEXT`
