# BRIDGE_RESPONSE_FORMS_CURRENT

Status: CURRENT Ozon Seller Bridge response/envelope authority.

## Source and envelope boundaries

A code block is not a command boundary. An assistant response is not a command boundary. Manual UI capture is not a command boundary. The parser discovers explicit envelopes from admitted source text and preserves source order.

### API envelope

```text
OZON_API_V1
{"operation":"allowed_alias","params":{}}
```

One explicit API envelope may cause at most one physical Ozon business request. No hidden retry, pagination, polling or fan-out.

### HELP envelope

```text
OZON_HELP_V2
{"cluster":"stocks_inventory"}
```

HELP is resolved locally and contributes zero physical provider business requests.

### HELP and API in the same assistant response

```text
OZON_HELP_V2
{"cluster":"finance"}

OZON_API_V1
{"operation":"seller_product_list","params":{"filter":{},"limit":1}}
```

HELP and API may coexist in the same assistant response. They enter one typed ordered batch and are processed in source order. A malformed envelope becomes a local/pre-execution error for that envelope and must not erase later independent envelopes.

## Result and accounting forms

- `OZON_GUIDANCE_RESULT_V2`: local guidance result; no provider business request.
- `OZON_RESULT_V1`: one logical API result.
- `OZON_BATCH_RESULT_V1`: ordered aggregate; aggregate cardinality is not provider-request cardinality.

Logical and physical work are reported separately. `N` explicit independent API commands imply at most `N` physical business requests. HELP entries do not increase the physical count.

## Dependent chains

A chain such as `create → fresh code → info → fresh file_ref → file_get` is emitted step by step. Never reconstruct, reuse from an unrelated chain, or pre-invent opaque dependencies.

## Delivery forms

- Small complete generated result → ordinary text.
- Large complete generated result → complete generated-text attachment plus short marker.
- Original provider file → original provider bytes as attachment; do not substitute generated text and do not expose raw base64 in the ordinary result.
