# Marketplace Question Operator — A1 Marketplace API Contracts

Status: **FROZEN FOR INITIAL IMPLEMENTATION; LIVE-CREDENTIAL ACCEPTANCE REQUIRED BEFORE WRITE ENABLE**  
Date: 2026-08-27

This document defines the exact Ozon/Wildberries question API surface used by the V1 service.

It does not reuse the old browser bridge runtime. The new service calls marketplace APIs directly from the server with its own credentials.

## 1. Sources and currentness

### Wildberries

Primary authority: current official WB API documentation / knowledge base:

- `https://dev.wildberries.ru/ru/openapi/user-communication`
- `https://dev.wildberries.ru/knowledge-base/.../obshchenie-s-pokupateliami`
- `https://dev.wildberries.ru/.../sistema-avtorizatsii-wb-api`

Current official docs confirm:

- `GET /api/v1/questions` — list questions;
- `GET /api/v1/question` — one question by ID;
- `GET /api/v1/questions/count-unanswered` — unanswered count;
- `PATCH /api/v1/questions` — view/reject/answer/edit question;
- Feedbacks and Questions category token;
- authorization header `Authorization: Bearer <token>`;
- category rate limit normally 3 requests/sec, 333 ms interval, burst 6 for Personal/Service-class flows; Basic token rules may be stricter.

### Ozon

Current question endpoints are present in current Ozon Seller API OpenAPI material sourced from `docs.ozon.ru/api/seller/swagger.json`, and Ozon's official Seller API notification channel confirms continued maintenance of `/v1/question/list` and `/v1/question/answer/create`.

Initial implementation contract uses:

- `POST /v1/question/list`;
- `POST /v1/question/answer/create`;
- `POST /v1/question/answer/list` only for ambiguous-send reconciliation.

Before enabling real writes, the A8 live credential smoke must prove these exact requests against the real seller account.

## 2. Common adapter interface

V1 adapters implement:

```text
fetch_unanswered_questions() -> list[NormalizedQuestion]
send_answer(question, text) -> SendResult
reconcile_answer(question, expected_text, send_started_at) -> ReconcileResult
```

Optional diagnostic methods:

```text
check_credentials()
get_question(external_question_id)
```

`fetch_unanswered_questions()` may make bounded pagination requests internally because polling all required pages is the service's explicit responsibility.

No adapter may publish anything during a read poll.

## 3. Normalized question

Both marketplaces normalize to:

```text
marketplace                 ozon | wildberries
external_question_id        string
sku_or_nm_id                string/integer normalized to string in DB if convenient
product_url                 nullable
product_title               nullable
product_article             nullable
question_text               string
question_created_at         nullable timestamp
raw_status                  nullable
raw_payload                  optional short JSON for debugging; do not require long-term retention
```

The marketplace's external question ID is immutable.

## 4. Ozon authentication

Base host:

```text
https://api-seller.ozon.ru
```

Seller API key authorization:

```http
Client-Id: <OZON_CLIENT_ID>
Api-Key: <OZON_API_KEY>
Content-Type: application/json
```

Therefore the secret installer must support **both** Ozon fields:

```text
OZON_CLIENT_ID
OZON_API_KEY
```

If the owner colloquially refers to the Ozon credential as one "key", implementation must still request/store Client-Id separately because the verified Seller API contract requires both headers.

Question methods are documented as available to sellers with **Premium Plus**. If the real account does not satisfy that entitlement, the service must report the Ozon error in Telegram; it must not attempt scraping/browser fallback.

## 5. Ozon — fetch unanswered questions

Endpoint:

```http
POST https://api-seller.ozon.ru/v1/question/list
```

Request body for polling:

```json
{
  "filter": {
    "status": "UNPROCESSED"
  },
  "limit": 100,
  "last_id": "",
  "sort_dir": "DESC"
}
```

Relevant status values in current schema:

```text
NEW
ALL
VIEWED
PROCESSED
UNPROCESSED
```

For V1 polling we use `UNPROCESSED`.

Current request contract:

- `filter` optional object;
- `filter.date_from` optional timestamp;
- `filter.date_to` optional timestamp;
- `filter.status` optional status;
- `last_id` optional cursor;
- `limit` optional int64, maximum 100;
- `sort_dir` `ASC|DESC`, default `DESC`.

Relevant response:

```json
{
  "has_next": true,
  "questions": [
    {
      "answers_count": 1,
      "author_name": "...",
      "id": "...",
      "sku": 646399170,
      "product_url": "https://www.ozon.ru/product/.../",
      "published_at": "...",
      "question_link": "...",
      "text": "...",
      "status": "UNPROCESSED"
    }
  ],
  "last_id": "..."
}
```

The service needs at minimum:

```text
id
sku
text
published_at
product_url/question_link when present
status
```

Do not rely on `author_name` for logic.

### Ozon pagination

Start with `last_id=""` and `limit=100`, newest-first (`DESC`).

If `has_next=true`, continue using returned `last_id`.

V1 safety bound:

```text
max 10 pages per scheduled poll
```

This bound is application-defined to prevent accidental unbounded loops. If still `has_next=true` after the bound, record/log backlog and continue on the next poll.

Deduplication remains `(ozon, external_question_id)`.

## 6. Ozon — send approved answer

Endpoint:

```http
POST https://api-seller.ozon.ru/v1/question/answer/create
```

Request:

```json
{
  "question_id": "<external question id>",
  "sku": 646399170,
  "text": "<approved text>"
}
```

All three fields are required.

Text length:

```text
2..3000 characters
```

The `sku` used for sending is the same SKU captured from the marketplace question. Do not guess/reconstruct it from URLs.

Successful response:

```json
{
  "answer_id": "..."
}
```

Store `answer_id` as `external_reply_id`.

## 7. Ozon — ambiguous send reconciliation

If the network fails after request transmission and the service cannot prove whether Ozon created the answer, do **not** blindly repeat `answer/create`.

Use:

```http
POST https://api-seller.ozon.ru/v1/question/answer/list
```

Request:

```json
{
  "last_id": "",
  "question_id": "<external question id>",
  "sku": 646399170
}
```

Response answer records contain:

```text
id
author_name
published_at
question_id
sku
status_publication
text
```

Reconciliation rule:

1. read answers for the same `question_id + sku`;
2. look for the exact text submitted by this send attempt, with publication time compatible with the attempt window;
3. if matched, treat as `SENT` and store answer ID;
4. if no match, operator may be offered an explicit retry;
5. if result remains ambiguous, keep `SEND_UNKNOWN` and do not auto-resend.

## 8. Wildberries authentication

Production host for Questions/Feedbacks:

```text
https://feedbacks-api.wildberries.ru
```

Authorization:

```http
Authorization: Bearer <WB_API_TOKEN>
```

The token must include the **Feedbacks and Questions / Вопросы и отзывы** category and must permit write operations for answering.

V1 target is an on-premise seller integration; a Personal token is appropriate when issued under current WB rules. Exact real token type is validated during A8 smoke.

## 9. Wildberries — fetch unanswered questions

Endpoint:

```http
GET https://feedbacks-api.wildberries.ru/api/v1/questions
```

Required query parameters:

```text
isAnswered=false
take=<n>
skip=<n>
```

Optional:

```text
nmId
order=dateAsc|dateDesc
dateFrom=<unix timestamp>
dateTo=<unix timestamp>
```

V1 polling request:

```text
isAnswered=false
take=100
skip=0
order=dateDesc
```

WB documents a maximum of 10,000 questions per query window and requires `take + skip <= 10000`.

The service extracts at minimum:

```text
question id
question text
question created date
nmId/product identity when present
answer state/status when present
product details when present
```

The exact real response projection is recorded during A8 read smoke. Parser implementation must be strict for identity/text but tolerant of optional product presentation fields.

### WB pagination

Use `take=100` and increment `skip` by the number requested/received while pages are full, bounded by the documented 10,000 window.

Application V1 bound:

```text
max 20 pages per poll
```

Newest-first ensures the most recent questions are discovered first.

Deduplication remains `(wildberries, external_question_id)`.

## 10. Wildberries — optional counts

Diagnostic endpoint:

```http
GET https://feedbacks-api.wildberries.ru/api/v1/questions/count-unanswered
```

It returns all-time and today's unanswered counts.

This endpoint is optional for dashboard/status UI. Polling correctness must not depend on it.

## 11. Wildberries — get one question

Endpoint:

```http
GET https://feedbacks-api.wildberries.ru/api/v1/question?id=<external question id>
```

Use for diagnostics/reconciliation when needed.

It is not required before every Telegram display because the list endpoint already supplies the question payload needed for V1.

## 12. Wildberries — send approved answer

Endpoint:

```http
PATCH https://feedbacks-api.wildberries.ru/api/v1/questions
```

For public answer / edit, current official WB guidance specifies:

```json
{
  "id": "<external question id>",
  "text": "<approved text>",
  "state": "wbRu"
}
```

Semantics:

- `state: "wbRu"` — question and answer are shown to buyers;
- `state: "none"` — reject/hide flow; this is **not** used by the V1 `Игнорировать` button;
- marking viewed uses a different body shape with `wasViewed`.

Important V1 rule:

```text
Telegram "Игнорировать" is LOCAL ONLY.
```

It must not send `state:none` and must not reject the buyer question on WB.

WB states that seller answers undergo moderation before publication. A successful API call therefore means the answer was accepted for processing, not necessarily already visibly published.

WB also states an existing answer can be edited once within 60 days. V1 does not automatically edit previously sent answers; it focuses on unanswered questions.

## 13. Wildberries ambiguous send reconciliation

On a network-ambiguous PATCH result:

1. do not blindly repeat PATCH;
2. call `GET /api/v1/question?id=<id>`;
3. inspect the question's current answer/answered state in the real response contract;
4. compare with exact submitted text where exposed;
5. mark `SENT` only when evidence confirms the answer;
6. otherwise retain `SEND_UNKNOWN` for explicit operator action.

The exact answer field names from the real seller response are frozen after the A8 smoke. Until then, implementation should encapsulate reconciliation parsing in the WB adapter rather than spread assumed fields through the application.

## 14. HTTP client policy

Use one `httpx.AsyncClient` per marketplace adapter/service lifetime where practical.

Default V1 transport policy:

```text
connect timeout: 10 s
read/write/pool timeout: 20 s
```

Read polling:

- transient transport failures are logged and surfaced in status/errors;
- next scheduled poll retries naturally;
- no aggressive retry loop is needed.

Writes:

- no generic automatic retry after an ambiguous transport failure;
- clear pre-connect/connect failures may be retried only if the request is provably not sent;
- otherwise use marketplace reconciliation.

Do not log auth headers or tokens.

## 15. Poll schedule

Nominal interval:

```text
600 seconds
```

At service startup:

1. start Telegram bot;
2. perform one initial marketplace poll after configuration validation;
3. then schedule every ~10 minutes.

If a marketplace poll is still running when the next interval arrives, do not overlap another poll for the same marketplace.

## 16. Telegram error visibility

Marketplace errors are sent to Telegram in a compact administrative notification and stored as recent errors.

Example categories:

```text
OZON_AUTH
OZON_SUBSCRIPTION_REQUIRED
OZON_RATE_LIMIT
OZON_FETCH_ERROR
OZON_SEND_ERROR
WB_AUTH
WB_RATE_LIMIT
WB_FETCH_ERROR
WB_SEND_ERROR
SEND_UNKNOWN
```

Error flood control is required: repeated identical poll errors should be coalesced rather than sending the same Telegram alert every 10 minutes indefinitely.

## 17. Secret fields frozen by A1

Interactive secrets installer must request:

```text
TELEGRAM_BOT_TOKEN
TELEGRAM_OPERATOR_USER_ID
OZON_CLIENT_ID
OZON_API_KEY
WB_API_TOKEN
```

The operator already has Telegram bot/user information and the marketplace credentials ready for the integration gate.

Input must be hidden/no-echo where appropriate.

Target file:

```text
/etc/marketplace-question-operator/secrets.env
```

Do not print secret values back after writing.

## 18. A8 live credential acceptance

Before enabling write buttons against production, run controlled real-account tests in this order:

```text
1. validate Telegram bot/user allowlist
2. Ozon question-list read
3. WB unanswered-question read
4. inspect and freeze real normalized payload mapping
5. Telegram displays one selected real question without sending
6. operator selects a harmless/appropriate real question for controlled answer test
7. send only after explicit Telegram confirmation
8. verify Ozon/WB post-send state
```

No synthetic write test should be sent to a real buyer question without operator selection.

## 19. A1 acceptance markers

```text
OZON_AUTH_CONTRACT_FROZEN
OZON_UNANSWERED_LIST_CONTRACT_FROZEN
OZON_ANSWER_CREATE_CONTRACT_FROZEN
OZON_SEND_RECONCILIATION_DEFINED
WB_AUTH_CONTRACT_FROZEN
WB_UNANSWERED_LIST_CONTRACT_FROZEN
WB_ANSWER_PATCH_CONTRACT_FROZEN
WB_IGNORE_IS_LOCAL_ONLY_FROZEN
WB_SEND_RECONCILIATION_DEFINED
SECRETS_FIELDS_FROZEN
LIVE_WRITE_REQUIRES_A8_ACCEPTANCE
```
