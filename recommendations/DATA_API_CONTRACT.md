# Data & API Contract — recommendation system V2

Версия: 0.3  
Статус: **V2 SALES-WEIGHTED contract authority**  
Revision: **2026-08-29 M2 HTTP contract freeze**

## 1. Authority

Business authority:

- `RECOMMENDATION_MATRIX.md`;
- `PRODUCT_CLASSIFICATION.md`;
- `CUSTOMER_RECOMMENDATION_COPY_GUIDE.md`.

HTTP/application architecture additionally follows:

- `VK_IMPLEMENTATION_ARCHITECTURE.md`;
- `M2_BACKEND_DEPENDENCY_ADR.md`;
- `VK_IMPLEMENTATION_GATE_MATRIX.md`.

## 2. Version identifiers

```text
calendar_version = KIP_CHERTOG_CALENDAR_V1
product_policy_version = KIP_PRODUCT_POLICY_V2_SALES_WEIGHTED
matrix_version = KIP_RECOMMENDATION_MATRIX_V2_SALES_WEIGHTED
marketplace_override_version = KIP_MARKETPLACE_OVERRIDE_V1
copy_version = KIP_REASON_COPY_V2_SALES_WEIGHTED
api_version = v1
```

## 3. Target machine-readable configuration

```text
recommendations/data/
  chertog_calendar.v1.json
  product_policy.v2.json
  recommendation_matrix.v2.json
  marketplace_overrides.v1.json
  reason_copy.v2.json
```

## 4. Calendar schema

Calendar stays V1. Exactly 16 Chertogs, no gaps/overlaps, 29.02 → Волк.

`birth_year` **does not affect Chertog selection**, but if the caller/customer supplied a year it must be preserved for customer-facing rendering.

## 5. Product policy V2

Example `Печать Велеса` record:

```json
{
  "product_policy_version": "KIP_PRODUCT_POLICY_V2_SALES_WEIGHTED",
  "products": [
    {
      "product_key": "bear_paw",
      "sku": "1636048691",
      "marketplace_name": "Печать Велеса",
      "recommendation_identity": "Печать Велеса",
      "customer_label": "Печать Велеса",
      "gender_policy": "any",
      "allowed_chertogs": ["medved"],
      "active_for_recommendation": true
    }
  ]
}
```

`product_key` is internal and must never be rendered to the customer.

Critical product policies:

```text
bear_paw.allowed_chertogs = [medved]
bear_paw.customer_label = "Печать Велеса"
svarog.gender_policy = male
chernobog.gender_policy = male
mara.gender_policy = female
zvezda_lady.gender_policy = female
dazhdbog automatic matrix use = rasa only
```

## 6. Recommendation matrix V2

Exactly one active base product per `chertog + gender`.

Required owner rows include:

```text
medved + male   → bear_paw
medved + female → bear_paw
lisa + male     → chernobog
lisa + female   → mara
orel + male     → perun
orel + female   → zvezda_lady
```

Base invariants:

- exactly 32 active base entries;
- no secondary entries;
- product key exists and is active;
- gender policy allows row;
- allowed_chertogs allows row.

## 7. Semantic and commercial fields

`relation_type`:

```text
DIRECT_PATRON
DIRECT_DERIVED
DIRECT_CHERTOG_SYMBOL
CURATED_GENDER_SUBSTITUTE
CURATED_MEANING_SUBSTITUTE
```

`selection_basis`:

```text
SEMANTIC_DIRECT
SEMANTIC_DIRECT_SALES_PRIORITIZED
SEMANTIC_CURATED_SALES_WEIGHTED
SEMANTIC_CURATED_GENDER_FIT
MARKETPLACE_OVERRIDE_SALES_WEIGHTED
```

Sales figures are approval evidence, not runtime inputs.

## 8. Marketplace override V1

Current override set contains exactly one entry:

```json
{
  "marketplace": "wildberries",
  "chertog_id": "voron",
  "gender": "male",
  "base_product_key": "kolyadnik",
  "effective_product_key": "alatyr",
  "relation_type": "CURATED_MEANING_SUBSTITUTE",
  "selection_basis": "MARKETPLACE_OVERRIDE_SALES_WEIGHTED",
  "reason_code": "VORON_CHANGE_INNER_SUPPORT"
}
```

Supported marketplaces: `ozon`, `wildberries`.

## 9. Domain request

```ts
type ResolveRecommendationInput = {
  birthDay: number;
  birthMonth: number;
  birthYear?: number; // display/audit context only; MUST NOT affect selection
  gender: "male" | "female";
  marketplace?: "ozon" | "wildberries";
};
```

Rules:

- `birthDay + birthMonth` determine the Chertog;
- `birthYear`, when supplied, is preserved unchanged for copy/UI;
- selection must be identical for the same day/month regardless of year;
- do not drop a supplied year before the copy layer;
- do not invent a year when it was not supplied.

## 10. Domain response

```ts
type RecommendationResult = {
  calendarVersion: string;
  productPolicyVersion: string;
  matrixVersion: string;
  marketplaceOverrideVersion: string;
  copyVersion: string;
  birthDate: {
    day: number;
    month: number;
    year: number | null;
    display: string;
  };
  chertog: {
    id: string;
    name: string;
    patronName: string;
  };
  gender: "male" | "female";
  marketplace: "ozon" | "wildberries" | null;
  recommendation: {
    productKey: string;
    sku: string;
    recommendationIdentity: string;
    customerLabel: string;
    relationType:
      | "DIRECT_PATRON"
      | "DIRECT_DERIVED"
      | "DIRECT_CHERTOG_SYMBOL"
      | "CURATED_GENDER_SUBSTITUTE"
      | "CURATED_MEANING_SUBSTITUTE";
    selectionBasis:
      | "SEMANTIC_DIRECT"
      | "SEMANTIC_DIRECT_SALES_PRIORITIZED"
      | "SEMANTIC_CURATED_SALES_WEIGHTED"
      | "SEMANTIC_CURATED_GENDER_FIT"
      | "MARKETPLACE_OVERRIDE_SALES_WEIGHTED";
    reasonCode: string;
  };
};
```

Exactly one `recommendation` is returned.

The TypeScript-style camelCase notation in this section is conceptual domain documentation. Python/domain implementations may use internal snake_case dictionaries. Section 11 is authoritative for M2 HTTP JSON field names and uses snake_case only.

## 11. M2 HTTP API — exact transport contract

### 11.1 Public routes

M2 exposes exactly these application routes:

```text
POST /v1/recommendations/resolve
GET  /healthz
GET  /readyz
```

M2 must not expose FastAPI documentation/schema routes as additional public surface:

```text
/docs
/redoc
/openapi.json
```

They are disabled for M2.

Unknown route → `404 NOT_FOUND` using the error envelope in section 14.

Known route with unsupported HTTP method → `405 METHOD_NOT_ALLOWED` using the same envelope.

### 11.2 Resolve media type

`POST /v1/recommendations/resolve` requires a JSON content type.

Accepted base media type:

```text
application/json
```

Media-type parameters are allowed, for example:

```text
application/json; charset=utf-8
```

Missing or different base media type → `415 UNSUPPORTED_MEDIA_TYPE`.

All JSON responses use:

```text
Content-Type: application/json; charset=utf-8
```

Customer-facing Cyrillic is emitted as UTF-8 text, not intentionally ASCII-escaped.

### 11.3 Request body size

Maximum resolve request body:

```text
16384 bytes
```

The limit applies to actual received body bytes, not only `Content-Length`.

Body larger than the limit →:

```text
413 PAYLOAD_TOO_LARGE
```

Do not perform an unbounded request-body read.

### 11.4 Resolve request shape

Request must be exactly one JSON object.

Required fields:

```text
birth_day
birth_month
gender
```

Optional fields:

```text
birth_year
marketplace
```

No other fields are allowed.

Examples of rejected unknown semantic/non-semantic fields:

```text
channel
availability
destination
product_key
chertog
secondary
fallback
score
```

Primitive/type rules are strict, not coercive:

```text
birth_day   = JSON integer, bool forbidden
birth_month = JSON integer, bool forbidden
birth_year  = JSON integer when present, bool/null forbidden

gender      = exactly "male" or "female"
marketplace = "ozon" | "wildberries" | null when present
```

`marketplace` omission and explicit JSON `null` both mean no marketplace override.

`birth_year` omission means no year was supplied. Explicit `birth_year: null` is invalid.

Syntactically valid JSON that is not an object → `422 INVALID_REQUEST`.

Missing required field, unknown field, wrong primitive type, invalid date, invalid gender, invalid marketplace or explicit null `birth_year` → `422 INVALID_REQUEST`.

Domain validity remains owned by `RecommendationCore`; transport validation must not create a competing date/business rule set.

### 11.5 Input echo

The success `input` object preserves supplied optional fields.

If `birth_year` was supplied:

```text
input.birth_year = supplied integer
birth_date.year = supplied integer
birth_date.display = DD.MM.YYYY
```

If `birth_year` was omitted:

```text
input.birth_year is omitted
birth_date.year = null
birth_date.display = DD.MM
```

If `marketplace` was omitted:

```text
input.marketplace is omitted
top-level marketplace = null
```

If explicit `marketplace: null` was supplied:

```text
input.marketplace = null
top-level marketplace = null
```

Do not invent a year and do not assume Ozon.

### 11.6 Exact success response

HTTP status:

```text
200 OK
```

Example for Медведь:

```json
{
  "api_version": "v1",
  "input": {
    "birth_day": 16,
    "birth_month": 1,
    "birth_year": 1986,
    "gender": "male",
    "marketplace": "ozon"
  },
  "versions": {
    "calendar_version": "KIP_CHERTOG_CALENDAR_V1",
    "product_policy_version": "KIP_PRODUCT_POLICY_V2_SALES_WEIGHTED",
    "matrix_version": "KIP_RECOMMENDATION_MATRIX_V2_SALES_WEIGHTED",
    "marketplace_override_version": "KIP_MARKETPLACE_OVERRIDE_V1",
    "copy_version": "KIP_REASON_COPY_V2_SALES_WEIGHTED"
  },
  "birth_date": {
    "day": 16,
    "month": 1,
    "year": 1986,
    "display": "16.01.1986"
  },
  "chertog": {
    "id": "medved",
    "name": "Медведь",
    "patron_name": "Сварог"
  },
  "gender": "male",
  "marketplace": "ozon",
  "recommendation": {
    "product_key": "bear_paw",
    "sku": "1636048691",
    "recommendation_identity": "Печать Велеса",
    "customer_label": "Печать Велеса",
    "relation_type": "DIRECT_CHERTOG_SYMBOL",
    "selection_basis": "SEMANTIC_DIRECT_SALES_PRIORITIZED",
    "reason_code": "MEDVED_MALE"
  }
}
```

The success body contains exactly one `recommendation` object.

M2 success body does not contain:

```text
availability
destination
secondary
alternatives
fallback
score
sales
channel
request_id
result_id
```

`patron_name` is calendar metadata and does not force patron-product selection.

## 12. Correlation contract

### 12.1 Request ID

Every M2 HTTP response, including errors, contains:

```text
X-Request-Id
```

M2 generates a fresh server-side UUIDv4 per received HTTP request.

An inbound `X-Request-Id` is not trusted/adopted as the canonical server request identifier in M2.

### 12.2 Result ID

Every successful `POST /v1/recommendations/resolve` response additionally contains:

```text
X-Result-Id
```

`X-Result-Id` is a fresh UUIDv4 generated for the successful logical recommendation resolution outside semantic selection.

Health/readiness/error responses do not carry `X-Result-Id`.

Neither ID may affect Chertog/product/reason selection.

The IDs remain transport/application metadata and are intentionally absent from the owner-approved success JSON body.

## 13. Health and readiness contract

### 13.1 `GET /healthz`

Purpose: process liveness only.

It must not call VK and must not require Recommendation Core success.

Healthy process response:

```text
200 OK
```

```json
{
  "api_version": "v1",
  "status": "ok"
}
```

### 13.2 `GET /readyz`

Purpose: local recommendation-service readiness.

M2 readiness means:

```text
canonical configuration can be loaded and validated
AND
RecommendationCore can be initialized
```

Ready response:

```text
200 OK
```

```json
{
  "api_version": "v1",
  "status": "ready"
}
```

If canonical configuration/Core initialization is unavailable:

```text
503 SERVICE_UNAVAILABLE
CONFIGURATION_UNAVAILABLE
```

using the exact error envelope in section 14.

A configuration-unavailable service may remain alive so `/healthz` can still report liveness and `/readyz` can fail closed. A valid resolve request while the canonical Core is unavailable also returns `503 CONFIGURATION_UNAVAILABLE`.

`/readyz` does not perform a live VK API call.

## 14. M2 exact error contract

### 14.1 Error envelope

Every application-generated M2 error response body uses exactly this envelope shape:

```json
{
  "api_version": "v1",
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Request body is invalid."
  }
}
```

No FastAPI/Pydantic default `detail` envelope is allowed on these routes/errors.

Do not return:

- stack traces;
- Python exception repr;
- absolute filesystem paths;
- raw configuration;
- environment values;
- request body dumps.

### 14.2 Status/code/message table

| Condition | HTTP | code | message |
|---|---:|---|---|
| invalid JSON bytes/syntax or empty resolve body | 400 | `MALFORMED_JSON` | `Request body must be valid JSON.` |
| resolve body exceeds 16384 bytes | 413 | `PAYLOAD_TOO_LARGE` | `Request body exceeds 16384 bytes.` |
| resolve media type is not application/json | 415 | `UNSUPPORTED_MEDIA_TYPE` | `Content-Type must be application/json.` |
| valid JSON but invalid request shape/type/domain input | 422 | `INVALID_REQUEST` | `Request body is invalid.` |
| canonical configuration/Core unavailable due expected configuration load/validation failure | 503 | `CONFIGURATION_UNAVAILABLE` | `Recommendation configuration is unavailable.` |
| `RecommendationCoreError` during resolution | 500 | `CORE_ERROR` | `Recommendation core failed.` |
| otherwise unexpected internal exception | 500 | `INTERNAL_ERROR` | `Internal server error.` |
| unknown route | 404 | `NOT_FOUND` | `Route not found.` |
| unsupported method on known route | 405 | `METHOD_NOT_ALLOWED` | `Method not allowed.` |

### 14.3 Exception mapping boundary

Current domain exceptions:

```text
RecommendationInputError
RecommendationCoreError
ConfigurationValidationError
```

Mapping:

```text
RecommendationInputError       → 422 INVALID_REQUEST
ConfigurationValidationError   → 503 CONFIGURATION_UNAVAILABLE
RecommendationCoreError        → 500 CORE_ERROR
```

Expected canonical configuration load/initialization failures that make a valid Core unavailable are normalized to `503 CONFIGURATION_UNAVAILABLE` without exposing filesystem/internal details.

Any other unexpected exception → `500 INTERNAL_ERROR`.

Framework validation failures that correspond to section 11.4 request-shape rules → `422 INVALID_REQUEST` with the project envelope, not FastAPI's default body.

## 15. Application-service boundary

M2 introduces one transport-neutral application service equivalent to:

```text
RecommendationApplicationService.resolve(input)
```

It must:

1. accept normalized domain/application input;
2. delegate semantic selection to the existing `RecommendationCore`;
3. return the exact Core semantic result unchanged in meaning;
4. attach/generate application metadata such as `result_id` outside semantic selection;
5. contain no FastAPI request/response object dependency.

HTTP endpoint uses this application service.

Future Bot orchestrator uses the same in-process service rather than calling our own HTTP endpoint over loopback.

Hard parity:

```text
Core semantic output
== ApplicationService semantic output
== HTTP semantic output
```

No second recommendation matrix/date resolver is allowed in API/application code.

## 16. Serialization boundary

Core currently returns version fields at domain top level. HTTP serializer nests them under:

```text
versions
```

This is transport adaptation only.

HTTP field naming is strictly:

```text
snake_case
```

The API serializer must not mutate semantic values.

No customer-facing copy renderer is introduced in M2.

## 17. Logging contract

M2 emits concise structured request-completion logs without full request body/DOB logging.

At minimum each request completion log contains:

```text
event = "http_request_completed"
request_id
method
path
status
duration_ms
```

Successful resolve additionally includes:

```text
result_id
```

Failure additionally includes:

```text
error_code
```

Do not log full request bodies by default.

Do not log configuration contents, secrets or stack traces as ordinary structured fields.

Logging failures must not change the HTTP response.

## 18. Server/runtime contract

M2 runs from the locked environment defined by `M2_BACKEND_DEPENDENCY_ADR.md`.

Canonical local command shape:

```text
UV_PYTHON_DOWNLOADS=never \
uv run --locked uvicorn recommendations.api.app:app --host 127.0.0.1 --port 8080
```

Default/local bind is loopback only.

TLS/reverse proxy/process supervision are deployment/hardening concerns outside M2.

No VK token or network call is needed by M2.

## 19. Channel vs marketplace

`channel` is telemetry/UI only and is not semantic input. `marketplace` may change a result only through explicit override config.

## 20. Availability

M2 Recommendation API returns the semantic recommendation only: `availability` and `destination` are not present yet. The later M4 product destinations / availability overlay may enrich an API/channel-facing result, but it must never change semantic product selection.

Availability is post-processing and never causes hidden replacement.

```text
V2 matrix
   ↓
marketplace override
   ↓
destination lookup
   ↓
availability enrichment
   ↓
UI
```

Customer-facing copy must not announce missing stock/card/link.

## 21. Semantic serialization invariants

HTTP serialization must not change Core semantics:

```text
voron + male + marketplace omitted/null → kolyadnik → VORON_MALE_KOLYADNIK
voron + male + ozon                   → kolyadnik → VORON_MALE_KOLYADNIK
voron + male + wildberries            → alatyr    → VORON_CHANGE_INNER_SUPPORT
medved + male/female                  → customer_label exactly "Печать Велеса"
```

There is no secondary result, hidden fallback, or selection effect from year; year remains display/audit context only.

## 22. Customer-label and date-render contract

The UI/copy layer must render `customerLabel`, not internal aliases or product keys.

Hard assertion for `product_key = bear_paw`:

```text
rendered customer label == "Печать Велеса"
```

No suffix, prefix, parenthetical clarification or secondary alias is allowed.

Hard assertion for supplied full DOB:

```text
input.birth_year != null
→ customer-facing first sentence contains birth_date.display in DD.MM.YYYY form
```

Example:

```text
19.11.1988 → "Дата 19.11.1988 относится к Чертогу Лебедя."
```

The renderer must not shorten this to `19.11`.

## 23. Validation gates

CI/startup must fail if:

1. calendar has gap/overlap;
2. any of 32 base rows missing;
3. more than one product returned per base case;
4. unknown/inactive product key used;
5. gender policy conflict;
6. `bear_paw` outside `medved`;
7. rendered label for `bear_paw` differs from `Печать Велеса`;
8. Даждьбог outside Раса or not exactly twice;
9. Сварог in female row;
10. `lisa + male` is not Чернобог;
11. `lisa + female` is not Мара;
12. `orel + male` is not Перун;
13. `orel + female` is not Звезда Лады;
14. Чернобог in female row;
15. Мара in male row;
16. supplied `birth_year` is lost before customer rendering;
17. unapproved marketplace override exists;
18. reserve product auto-appears without owner decision.

M2 adds transport gates:

19. HTTP success body exactly matches section 11;
20. API/Core semantic parity for all 32 base cases;
21. Ozon produces 32/32 base results and zero overrides;
22. Wildberries produces exactly 31 base results plus the one approved Voron-male override;
23. request shape is strict/non-coercive;
24. all error paths use section 14 envelope/status/code;
25. every response has `X-Request-Id`;
26. successful resolve has `X-Result-Id`;
27. configuration-unavailable readiness and resolve fail closed;
28. health remains liveness-only;
29. body-size/media-type gates are enforced;
30. M2 source imports/calls no VK transport/runtime.

## 24. Contract tests

Business/domain cases:

```text
25.03.1993 + male + ozon → lisa / Чернобог; rendered date includes 1993
25.03.1993 + female + ozon → lisa / Мара; rendered date includes 1993
16.01.1986 + male + ozon → medved / Печать Велеса; rendered date includes 1986
16.01.1990 + female + wildberries → medved / Печать Велеса; rendered date includes 1990
19.07.1988 + male → orel / Перун
19.07.1988 + female → orel / Звезда Лады
15.03.1988 + male → volk / Велес
15.03.1988 + female → volk / Велес
13.08.1988 + male → rasa / Даждьбог
13.08.1988 + female → rasa / Даждьбог
```

M2 HTTP contract tests additionally cover at minimum:

```text
valid full DOB success
valid no-year success
marketplace omitted success
marketplace null success
malformed JSON
empty body
JSON array instead of object
missing required fields
unknown fields
bool day/month/year
birth_year null
invalid Gregorian date
invalid gender
invalid marketplace
wrong/missing Content-Type
body > 16384 bytes
unknown route
wrong method
health success
readiness success
readiness configuration failure
resolve configuration failure
RecommendationCoreError mapping
unexpected internal error mapping
request/result UUID headers
unique request IDs across requests
32 base API parity
32 Ozon parity / 0 overrides
32 Wildberries / exactly 1 override
Voron male exact reason semantics
Medved exact customer label
full-DOB/year invariance
absence of availability/destination/secondary/fallback
```

All existing M1 tests remain mandatory regression tests under the locked environment.

Decision marker:

```text
KIP_DATA_API_CONTRACT_V2_M2_HTTP_FROZEN
```
