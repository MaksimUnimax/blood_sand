# Wildberries Bridge v0.1.2 — security and blocked surface

## Personal-token-only credential boundary

The canonical v0.1.2 credential model accepts only a Wildberries Personal token. A non-personal token type fails closed. Supplying a client secret fails with `CLIENT_SECRET_UNSUPPORTED_PERSONAL_BUILD`; `X-Client-Secret` is not part of the active credential flow.

LLM-supplied transport/auth fields remain rejected by the fixed contract/transport boundary rather than being allowed to choose arbitrary host, method, URL, headers, credentials, or retry behavior.

## Registry boundary

The exact canonical install artifact contains **188 current read/read-derived records**:

- **172 executable**
- **13 direct-PII reads blocked**
- **3 Service-token-only reads blocked in this Personal-token-only build**

The three Service-token-only current reads are:

- `subscriptions` → `GET /api/common/v1/subscriptions`
- `seller_rating` → `GET /api/common/v1/rating`
- `tariff_constructor_options` → `GET /api/common/v1/tariff-constructor/options`

The official OpenAPI snapshot contains **98 mutation operations**; they are absent from the production read registry.

## Direct PII blocks

Execution-disabled direct identity surfaces cover seller users, DBW warehouse contacts, FBS pass identity, order buyer identity, DBW courier identity, B2B buyer identity, and Buyers Chat read/download/event surfaces classified as direct PII.

The manifest grants no host permission for `buyer-chat-api.wildberries.ru` or `user-management-api.wildberries.ru`.

## One command = one request

One accepted `WB_API_V1` command performs at most one external Wildberries request. Automatic retry, pagination loops, polling, fan-out and hidden batching are forbidden by the bridge execution model.

## Sanitized admitted customer data

Admitted order/review/question/return contours marked `customer_safe_v1` pass through recursive secret/customer-identity sanitization before `WB_RESULT_V1` delivery.
