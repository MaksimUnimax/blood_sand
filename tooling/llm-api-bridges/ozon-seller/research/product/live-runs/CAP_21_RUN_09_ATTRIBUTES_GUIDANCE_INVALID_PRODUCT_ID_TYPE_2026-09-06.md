# CAP-21 — seller_product_attributes local validation recovery

Status: `LOCAL_INVALID_OPERATION_PARAMS__IDENTIFIER_TYPE_RECOVERY_REQUIRED`

Date: 2026-09-06

Intended step: read structured attributes for the already resolved own Seller product `product_id = 1119965443` / SKU `1636048691`.

Attempted command:

```text
OZON_API_V1
{"operation":"seller_product_attributes","params":{"filter":{"product_id":[1119965443]},"limit":1}}
```

Observed result:
- Bridge returned `OZON_GUIDANCE_RESULT_V2`;
- `status = cluster_suggested`;
- cluster `catalog_products`;
- error `INVALID_OPERATION_PARAMS`;
- descriptor parameter keys `filter`, `limit`;
- `external_request_executed = false`;
- `physical_business_request_count = 0`;
- query planner remained pending with logical business result count `0` and physical business request count `0`.

Interpretation:
- no provider request was executed, so this is not an Ozon/provider failure;
- the operation family and intended filter are correct for the CAP-21 structured-attributes step;
- the rejected identifier was supplied as JSON-number; current Bridge identifier-array handling for this operation requires int64 identifiers in string form, consistent with the already observed v0.1.19 identifier normalization behavior;
- do not skip attributes and do not advance to CAP-22.

Recovery: repeat the same `seller_product_attributes` read with `filter.product_id = ["1119965443"]` and `limit = 1`.

Checkpoint: `CAP_21_ATTRIBUTES_STRING_PRODUCT_ID_RETRY_NEXT`
