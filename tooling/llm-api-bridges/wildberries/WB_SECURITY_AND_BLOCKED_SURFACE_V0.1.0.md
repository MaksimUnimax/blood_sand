# Wildberries Bridge v0.1.0 — security and blocked surface

## Independent read-only enforcement

Seller token permissions do not define bridge permissions. The bridge executes only operations present in the internal registry and every registry item must pass `effect=READ`, `current=true`, `execution_enabled=true`.

LLM-controlled transport fields are recursively rejected: URL/URI, host/hostname, HTTP method, headers, Authorization, token, API key, client ID/secret and related spellings.

## Mutation classes intentionally not executable

Examples include:

- product/card creation/update/delete;
- price/discount writes;
- stock PUT/DELETE;
- order status/cancel/fulfilment mutations;
- supply creation/update/delivery mutations;
- promotion campaign start/pause/stop/delete;
- advertising bid/budget mutations;
- promotion participation writes;
- feedback/question answers or edits;
- buyer-return decisions;
- user/access-management writes.

This remains true even if a seller token technically has permissions for those methods.

## Direct PII surfaces intentionally absent

Examples excluded from the executable registry include direct buyer/client information, pickup buyer information, buyer chat, DBW courier information and driver/pass identity surfaces where the contract exposes names, phone numbers, addresses or equivalent personal identifiers.

## Response sanitization

Admitted customer-content operations use recursive key/content sanitization. Sensitive field patterns include phone/email/address/recipient/customer/buyer/client-info/passport/name/FIO and precise geolocation fields. Token-like secrets are redacted before phone-like patterns to avoid partial secret leakage.

## Response bounds

Responses are byte-bounded. Structural sanitization is separately bounded while preserving legitimate wide payloads; the truncation marker reserves space inside the key budget. Binary downloads are allowed only on explicitly registered binary report operations and are returned as bounded base64 plus SHA-256.

## No retry / no hidden orchestration

Transport performs exactly one `fetch` per command. 429, timeout, network and provider errors return or create controlled result/error state without automatic external retry. Pagination/report next stages require a new explicit command.
