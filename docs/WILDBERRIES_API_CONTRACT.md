# Wildberries API contract

The Feedbacks and Questions host is `https://feedbacks-api.wildberries.ru`.
MQO lists unanswered questions with `GET /api/v1/questions` and retrieves a
single question for reconciliation with `GET /api/v1/question?id=<id>`. The
documented list shape is `data.questions`; product identity is read from each
question's `productDetails` (`nmId`, `supplierArticle`, `productName`).

Each normal poll is exactly one request: `isAnswered=false`, `take=10000`,
`skip=0`, and `order=dateDesc`. This is within the API's 10,000 item query
limit. All list, answer, and reconciliation requests share a 0.4-second
start-to-start gate. A 429 uses `X-Ratelimit-Retry` (or Reset fallback) for one
bounded retry; a second 429 fails deterministically.

Production activation is explicit: only `WB_API_ENABLED=1` enables the adapter.
It is disabled by default, needs no WB token while disabled, and creates no WB
HTTP client. When enabled, a locally decoded Personal RW JWT is required:
`acc=3`, `for=self`, `t=false`, unexpired, Feedbacks/Questions bit 7 enabled,
and read-only bit 30 disabled. Classification never sends the token to WB.

## Verified public product-card publication

WB publication mode is **PUBLIC_PRODUCT_CARD_ONLY**. The sole answer write is
`PATCH /api/v1/questions` with exactly `id`, `answer.text`, and `state=wbRu`:

```json
{
  "id": "...",
  "answer": {"text": "..."},
  "state": "wbRu"
}
```

`TOP_LEVEL_TEXT` is **FORBIDDEN/OBSOLETE**. The private `state=none` is forbidden. Buyer Chat/private-message APIs (including
`/api/v1/seller/message`) are forbidden in every MQO source path.

WB seller answers undergo preliminary moderation/processing. Consequently an
HTTP 2xx only means **accepted/unverified**, never published. `SENT` means one
thing only: a later `GET /api/v1/question?id=<id>` has read the documented
`data.answer.text` and found byte-for-byte/exact-string equality with the
submitted revision (no whitespace normalization).

After the durable operator Send claim and before PATCH, MQO performs a read-only
inspection. `MATCHED` marks `SENT` without PATCH; `DIFFERENT` marks terminal
`ANSWERED_EXTERNALLY` without PATCH, preventing an overwrite; `ABSENT` permits
one PATCH; and `UNKNOWN` marks `SEND_FAILED` because no write was attempted.

After accepted/unverified or timeout/transport/5xx (ambiguous) PATCH results,
MQO always reads back. `MATCHED` becomes `SENT`, `DIFFERENT` becomes terminal
`ANSWERED_EXTERNALLY`, and `ABSENT` or `UNKNOWN` becomes `SEND_UNKNOWN` while
WB may still be processing/moderating the answer. A clear 4xx failure becomes
`SEND_FAILED`. An application JSON envelope with `error=true` is a clear
failure even under HTTP 2xx.

`SEND_UNKNOWN` never retries PATCH. `ANSWERED_EXTERNALLY` blocks all marketplace
writes. `SEND_FAILED` alone retains explicit retry.
Actual publication remains operator-explicit: poll → review → explicit Send;
there is no automatic WB Codex or marketplace send.

## 2026-08-29 payload incident

The former MQO payload (`id` + top-level `text` + `state`) received WB HTTP 200
with `error=false`, but the write was not applied. The root cause was the current
WB schema requiring the answer text under `answer.text`.

WB uses the shared generic Telegram REVIEW presentation and API-question flow;
it does not have a special review UI. Production WB acceptance remains pending.
