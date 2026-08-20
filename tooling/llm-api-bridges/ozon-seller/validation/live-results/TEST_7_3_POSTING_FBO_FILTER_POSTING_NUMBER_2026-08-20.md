# TEST 7.3 — posting_fbo_list filter by posting_number — PASS

Date: 2026-08-20
Bridge: `ozon-llm-api-bridge` v0.1.19
Branch: `dev/ozon-v0.1.19-manual-delivery-composer-wait-2026-08-18`
Account: ordinary Seller account, no Premium dependency for this operation.

## Command

```text
OZON_API_V1
{"operation":"posting_fbo_list","params":{"filter":{"since":"2026-08-18T00:00:00Z","to":"2026-08-20T00:00:00Z","posting_numbers":["0256110785-0002-5"]},"limit":10}}
```

## Observed batch metadata

- `result_count=1`
- capability probe: `performed=false`, `status=not_needed`
- `logical_business_result_count=1`
- `physical_business_request_count=1`

## Observed result

- operation: `posting_fbo_list`
- command accepted
- logical fingerprint: `9a8ff83a`
- physical fingerprint: `a868b36c`
- `command_transformed=true`
- `external_request_executed=true`
- HTTP `200`
- elapsed `1169 ms`
- entitlement: `SUPPORTED_AND_ENTITLED`
- `has_next=false`
- `cursor=""`
- exactly one posting returned: `0256110785-0002-5`
- order id: `38713224289`
- order number: `0256110785-0002`
- status: `delivered`
- substatus: `posting_received`
- product offer: `Печать Велеса`
- SKU: `1636048691`
- quantity: `1`
- price: `1700 RUB`
- `digital_codes` redacted
- `legal_info` redacted

## Verdict

**PASS.** The reviewed `posting_numbers` filter was honored by the live Ozon provider on the ordinary Seller account. The bridge performed one physical request, returned only the targeted posting, preserved explicit transformation metadata, and retained PII-sensitive redaction.
