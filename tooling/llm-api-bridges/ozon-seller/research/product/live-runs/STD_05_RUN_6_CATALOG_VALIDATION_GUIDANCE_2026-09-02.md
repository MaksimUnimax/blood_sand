# STD-05 Run 6 — Catalog validation / Guidance V2

Date: 2026-09-02
Benchmark: `STD-05`
Question: `Почему вчера продажи резко просели? Найди наиболее вероятные причины, а не просто покажи цифру продаж.`

## Intended evidence step

Check current catalog/listing state for the 24 SKUs that had non-zero sales on 2026-08-31.

Attempted operation: `seller_product_list` with `filter.skus` and `limit=100`.

## Observed Bridge result

- result marker: `OZON_GUIDANCE_RESULT_V2`;
- status: `cluster_suggested`;
- suggested cluster: `catalog_products`;
- error: `INVALID_OPERATION_PARAMS`;
- descriptor intent operation: `seller_product_list`;
- descriptor parameter keys: `[filter, limit]`;
- `external_request_executed=false`;
- `physical_business_request_count=0`;
- no Ozon provider request occurred.

Guidance choices contained catalog sections such as `product_list_info`, `attributes_categories`, `limits_diagnostics`, etc., but did not expose the exact parameter-validation failure or corrected command shape.

## Exact local root cause

Accepted Bridge contract `shared/ozon_contract.js` validates `seller_product_list.filter.skus` through `validateIdentifierArray(..., { int64: true })`.

For `int64: true`, each identifier is passed to `requireInt64String(...)`, which requires a **string** containing an int64 value.

The attempted command used numeric JSON values such as:

```json
"skus": [1602722942, 1623753672]
```

The accepted contract requires:

```json
"skus": ["1602722942", "1623753672"]
```

Therefore the operation choice was correct; only identifier representation was wrong.

## Product finding

`GUIDANCE_KNOWS_OPERATION_BUT_DOES_NOT_EXPOSE_ACTIONABLE_PARAMETER_REPAIR`

Positive behavior:
- fail-closed locally;
- zero provider requests;
- correct semantic cluster suggested;
- attempted operation identity preserved.

Weak-model portability gap:
- exact validation message was not returned to the AI;
- the AI was shown broad catalog sections even though operation identity was already known;
- no machine-readable field/path/value-type repair was exposed;
- no exact safe retry-command echo was exposed.

A weak AI may now guess a different catalog operation instead of preserving the correct `seller_product_list` business step.

## Required future guidance behavior

When the operation is known and the validation error is deterministically repairable, guidance should preserve the operation and expose a local actionable repair, for example:

```text
validation_recovery: {
  operation_valid: true,
  retryable_locally: true,
  action: "REPEAT_SAME_OPERATION_WITH_PARAMETER_REPAIR",
  field_path: "params.filter.skus[0]",
  expected_type: "string_int64",
  received_type: "number",
  external_request_executed: false,
  exact_operation_required: "seller_product_list"
}
```

An optional sanitized corrected-command echo is desirable when the repair is mechanical and cannot change user intent.

This must still preserve:

`ONE EXPLICIT AI COMMAND = AT MOST ONE PHYSICAL BUSINESS API REQUEST`

and must never automatically execute the repaired command.

## Next exact live step

Repeat the same intended `seller_product_list` read with every SKU encoded as a JSON string.

Checkpoint:
`STD_05_RUN6_LOCAL_VALIDATION_GUIDANCE_GAP_ROOT_CAUSED_REPEAT_SAME_OPERATION_WITH_STRING_INT64_READY`
