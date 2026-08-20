# Live test 7.2 — posting_fbo_list basic ordinary-account access

Date: 2026-08-20
Bridge: `ozon-llm-api-bridge` `0.1.19`
Account: ordinary Seller account, no Premium entitlement required for this operation
Status: **PASS**

## Command

```text
OZON_API_V1
{"operation":"posting_fbo_list","params":{"filter":{"since":"2026-08-18T00:00:00Z","to":"2026-08-20T00:00:00Z"},"limit":100}}
```

## Observed batch evidence

- `result_count=1`
- capability probe: `performed=false`, `status=not_needed`
- `logical_business_result_count=1`
- `physical_business_request_count=1`

## Observed result evidence

- `operation=posting_fbo_list`
- request accepted
- provider: `ozon`
- host alias: `seller_api`
- HTTP method: `POST`
- `external_request_executed=true`
- `capability_probe_executed=false`
- HTTP status: `200`
- elapsed: `1557 ms`
- entitlement: `SUPPORTED_AND_ENTITLED`
- entitlement reason: `operation_not_subscription_sensitive`
- `command_transformed=false`
- `has_next=false`
- `cursor=""`
- non-empty `postings` array returned for the requested period

## Response-field evidence

Returned postings included real operational fields such as:

- `posting_number`
- `order_id`
- `order_number`
- `status`
- `substatus`
- `cancellation`
- product `offer_id`, `name`, `sku`, `quantity`, `price`
- `external_order`
- `cancel_reason_id`
- `created_at`
- `in_process_at`

Observed statuses included `delivered`, `delivering`, and `awaiting_deliver`; observed substatuses included `posting_received`, `posting_on_way_to_city`, `posting_in_pickup_point`, and `posting_transferring_to_delivery`.

## Privacy/redaction evidence

Sensitive paths were not exposed to the AI-facing result:

- every shown `products[].digital_codes` value was `[REDACTED]`
- every shown `legal_info` value was `[REDACTED]`

No customer identity/address/phone data was surfaced in the submitted result.

## Narrow verdict

PASS for real ordinary-account execution of the implemented `posting_fbo_list` operation over a two-day period, one-request execution semantics, non-subscription planning, provider HTTP success, operational posting/product fields, and the observed PII-sensitive redaction paths.

This result does not by itself validate cursor pagination because `has_next=false` and `cursor` was empty for this period/result size.