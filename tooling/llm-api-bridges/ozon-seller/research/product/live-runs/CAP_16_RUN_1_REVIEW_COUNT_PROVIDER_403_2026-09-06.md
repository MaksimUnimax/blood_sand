# CAP-16 Run 1 — review_count provider 403

Status: ACTIVE / FAILURE_DIAGNOSTIC_REQUIRED

Canonical CAP-16 job remains active.

Command:

```json
{"operation":"review_count","params":{}}
```

Full delivered result:

```text
OZON_BATCH_RESULT_V1  {   "bridge": "ozon-llm-api-bridge",   "version": "0.1.19",   "delivery_mode": "sequential_batch_single_delivery",   "result_count": 1,   "capability_probe": {     "performed": false,     "status": "not_needed",     "subscription_type": "UNKNOWN",     "http_status": 0,     "error_code": null   },   "query_planner": {     "status": "complete",     "coalesced_group_count": 0,     "coalesced_logical_count": 0,     "logical_business_result_count": 1,     "physical_business_request_count": 1   } }  ===== OZON RESULT 1/1 =====  OZON_RESULT_V1 {   "bridge": "ozon-llm-api-bridge",   "version": "0.1.19",   "request_id": "3b5e3de2-f2f7-41e9-9afe-02486765e4b7",   "operation": "review_count",   "command": {     "operation": "review_count",     "fingerprint": "99caf794"   },   "request_meta": {     "provider": "ozon",     "host_alias": "seller_api",     "http_method": "POST",     "path_alias": "review_count",     "external_request_executed": true,     "capability_probe_executed": false,     "capability_probe_http_status": 0   },   "http_status": 403,   "elapsed_ms": 1348,   "pagination": null,   "rate_limit": null,   "planning": {     "capability": {       "is_premium": null,       "probe_error_code": null,       "probe_http_status": 0,       "probe_performed": false,       "status": "not_needed",       "subscription_type": "UNKNOWN"     },     "entitlement": {       "capability_required": false,       "entitlement_key": "POST /v2/review/count",       "exact_request_preserved": true,       "partial": false,       "reason": "entitlement_rule_unknown",       "rule_source": "reviewed-openapi-463-2026-08-19",       "status": "ENTITLEMENT_UNKNOWN"     },     "execution": {       "logical_command_fingerprint": "99caf794",       "physical_command_fingerprint": "99caf794",       "command_transformed": false     }   },   "result": {     "error": {       "source": "provider",       "category": "auth_or_permission",       "http_status": 403,       "code": "7",       "message": "Ozon API request failed. Raw provider error text is withheld from AI output; inspect local sanitized diagnostics.",       "automatic_retry": false,       "external_request_executed": true     }   } }
```

Observed:
- one logical / one physical request;
- exact request preserved;
- external request executed;
- provider HTTP 403 code 7, category `auth_or_permission`;
- Bridge entitlement status `ENTITLEMENT_UNKNOWN`, reason `entitlement_rule_unknown`;
- no evidence that aggregate review count is zero;
- no personal-data read was attempted.

Next requirement: diagnose provider entitlement/role boundary before continuing CAP-16.
