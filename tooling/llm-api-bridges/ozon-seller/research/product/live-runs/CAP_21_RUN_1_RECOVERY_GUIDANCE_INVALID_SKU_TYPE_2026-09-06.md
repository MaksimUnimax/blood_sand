# CAP-21 — Recovery guidance failure — SKU identifier type

Status: `FAILED_LOCAL_PARAM_VALIDATION__RECOVERY_REQUIRED`

Date: 2026-09-06

## Intended recovery

Resolve own product SKU `1636048691` to its Seller API identifiers using `seller_product_info_list`.

## Command executed

```text
OZON_API_V1
{"operation":"seller_product_info_list","params":{"sku":[1636048691]}}
```

## Full live result

```text
OZON_BATCH_RESULT_V1  {   "bridge": "ozon-llm-api-bridge",   "version": "0.1.19",   "delivery_mode": "sequential_batch_single_delivery",   "result_count": 1,   "capability_probe": {     "performed": false,     "status": "not_resolved",     "subscription_type": null,     "http_status": 0,     "error_code": null   },   "query_planner": {     "status": "pending",     "coalesced_group_count": 0,     "coalesced_logical_count": 0,     "logical_business_result_count": 0,     "physical_business_request_count": 0   } }  ===== OZON RESULT 1/1 =====  OZON_GUIDANCE_RESULT_V2 {   "bridge": "ozon-llm-api-bridge",   "version": "0.1.19",   "guidance_version": "2",   "status": "cluster_suggested",   "cluster": "catalog_products",   "section": null,   "external_request_executed": false,   "physical_business_request_count": 0,   "error": "INVALID_OPERATION_PARAMS",   "descriptor": {     "error_code": "INVALID_OPERATION_PARAMS",     "intent": {       "operation": "seller_product_info_list"     },     "parameter_keys": [       "sku"     ]   },   "choices": [     {       "section": "product_list_info",       "description": "Списки и информация о товарах.",       "operation_count": 10     },     {       "section": "attributes_categories",       "description": "Категории и характеристики.",       "operation_count": 5     },     {       "section": "certification",       "description": "Сертификаты и справочники.",       "operation_count": 13     },     {       "section": "limits_diagnostics",       "description": "Лимиты и диагностика карточек.",       "operation_count": 3     },     {       "section": "description_content",       "description": "Описание и rich content.",       "operation_count": 1     },     {       "section": "pictures",       "description": "Изображения товаров.",       "operation_count": 1     }   ] }
```

## Diagnosis

No provider call occurred:

- `external_request_executed=false`;
- `physical_business_request_count=0`;
- `logical_business_result_count=0`;
- planner remained `pending`;
- error was local `INVALID_OPERATION_PARAMS`.

The active v0.1.19 implementation binding for `seller_product_info_list` allows exactly one identifier group among `offer_id`, `product_id`, or `sku`. For `sku`, `validateIdentifierArray(..., { int64: true })` is used, and the int64 validator requires an **int64 string**, not a JSON number.

Therefore the identifier namespace was now correct (`sku`), but the element type was wrong. The correct recovery is the same logical lookup with `"1636048691"` as a string.

Classification: `BENCHMARK_INPUT_PARAM_TYPE_MISMATCH`, not provider error and not Bridge routing defect.

Checkpoint: `CAP_21_RUN_1_RECOVERY_RESOLVE_SKU_STRING_NEXT`
