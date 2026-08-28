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

Answers use `PATCH /api/v1/questions` with `id`, `text`, and `state=wbRu`.
Timeouts, transport failures, and 5xx writes are ambiguous and are never
automatically retried. Reconciliation reads `data.answer.text` and compares it
exactly. Actual publication still happens only after the operator explicitly
chooses Send.

WB uses the shared generic Telegram REVIEW presentation and API-question flow;
it does not have a special review UI. Production WB acceptance remains pending.
