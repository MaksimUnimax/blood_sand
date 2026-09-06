# CAP-21 — Run 1 error evidence — identifier mismatch

Status: `FAILED_INPUT_IDENTIFIER_MISMATCH__RECOVERY_REQUIRED`

Date: 2026-09-06

## Intended step

Read the exact current description of the selected own product whose **SKU** is `1636048691`.

## Command that was executed

```text
OZON_API_V1
{"operation":"product_info_description","params":{"product_id":1636048691}}
```

## Full live result

```text
OZON_BATCH_RESULT_V1  {   "bridge": "ozon-llm-api-bridge",   "version": "0.1.19",   "delivery_mode": "sequential_batch_single_delivery",   "result_count": 1,   "capability_probe": {     "performed": false,     "status": "not_needed",     "subscription_type": "UNKNOWN",     "http_status": 0,     "error_code": null   },   "query_planner": {     "status": "complete",     "coalesced_group_count": 0,     "coalesced_logical_count": 0,     "logical_business_result_count": 1,     "physical_business_request_count": 1   } }  ===== OZON RESULT 1/1 =====  OZON_RESULT_V1 {   "bridge": "ozon-llm-api-bridge",   "version": "0.1.19",   "request_id": "12004fa2-da95-4b82-8323-bb43c0ddd241",   "operation": "product_info_description",   "command": {     "operation": "product_info_description",     "fingerprint": "5b681fe6"   },   "request_meta": {     "provider": "ozon",     "host_alias": "seller_api",     "http_method": "POST",     "path_alias": "product_info_description",     "external_request_executed": true,     "capability_probe_executed": false,     "capability_probe_http_status": 0   },   "http_status": 404,   "elapsed_ms": 1323,   "pagination": null,   "rate_limit": null,   "planning": {     "capability": {       "is_premium": null,       "probe_error_code": null,       "probe_http_status": 0,       "probe_performed": false,       "status": "not_needed",       "subscription_type": "UNKNOWN"     },     "entitlement": {       "capability_required": false,       "entitlement_key": "POST /v1/product/info/description",       "exact_request_preserved": true,       "partial": false,       "reason": "all_accounts",       "rule_source": "reviewed-openapi-463-2026-08-19",       "status": "SUPPORTED_AND_ENTITLED"     },     "execution": {       "logical_command_fingerprint": "5b681fe6",       "physical_command_fingerprint": "5b681fe6",       "command_transformed": false     }   },   "result": {     "error": {       "source": "provider",       "category": "provider_request",       "http_status": 404,       "code": "5",       "message": "Ozon API request failed. Raw provider error text is withheld from AI output; inspect local sanitized diagnostics.",       "automatic_retry": false,       "external_request_executed": true     }   } }
```

## Diagnosis

The Bridge/runtime invariants behaved correctly:

- `logical_business_result_count = 1`;
- `physical_business_request_count = 1`;
- external request executed;
- no capability probe;
- entitlement was `SUPPORTED_AND_ENTITLED`;
- exact request was preserved;
- `command_transformed = false`;
- automatic retry was false.

The failure is in the benchmark input, not evidence of a Bridge routing defect: preserved CAP-01/CAP-19 evidence identifies `1636048691` as the product **SKU**, while `product_info_description` accepts `offer_id` or `product_id`, and the setup incorrectly supplied that SKU value as `product_id`.

Provider therefore returned HTTP `404` for the wrong identifier namespace.

## Recovery

Do not skip CAP-21 and do not advance to query analytics.

Resolve the selected SKU to its actual Seller API identifiers with one explicit `seller_product_info_list` call using the `sku` identifier group. Then rerun the original description step with the returned `product_id` (or exact returned `offer_id` if that is the reliable identifier).

Classification: `BENCHMARK_INPUT_IDENTIFIER_MISMATCH`, not `BRIDGE_DEFECT`.

Checkpoint: `CAP_21_RUN_1_RECOVERY_RESOLVE_SKU_NEXT`
