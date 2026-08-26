# Patch B9 Reviews / Questions — operator Swagger evidence

Date: 2026-08-26

## Queue authority

`OZON_IMPLEMENTATION_CONTRACT_QUEUE_V1.json` defines the final ordered priority after `P1_supply_replenishment` as `P2_reviews_questions`.

The queue names three required operations:
- `review_list` -> historical queue path `/v1/review/list`
- `review_info` -> historical queue path `/v1/review/info`
- `question_list` -> `/v1/question/list`

The queue itself states that currentness is not a full contract and exact current Ozon-owned evidence is required before provider allowlisting.

## Exact Seller Swagger authority

B9 uses the original operator-supplied Seller `swagger.json`:
- byte length: `3933043`
- SHA-256: `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`
- OpenAPI: `3.0.0`
- paths: `463`

No third-party contract or replacement Swagger is used.

## Currentness correction

The exact current Swagger marks:
- `POST /v1/review/list` as deprecated and directs callers to `/v2/review/list`;
- `POST /v1/review/info` as deprecated and directs callers to `/v2/review/info`.

Therefore B9 implements the current replacements:
- `review_list` -> `POST /v2/review/list` (`ReviewListV2`);
- `review_info` -> `POST /v2/review/info` (`ReviewInfoV2`).

`POST /v1/question/list` (`Question_List`) is current and is retained as the queue target.

The operator role-surface inventory dated 2026-08-25 observed the API key permission surface for:
- `/v2/review/list` under `Admin read only` and `Review read only`;
- `/v2/review/info` under `Admin read only` and `Review read only`;
- `/v1/question/list` under `Admin read only` and `Question read only`.

Role presence is used only as permission-surface evidence; read-only semantics and request contracts are established from the exact current Swagger.

## Exact request contracts

### POST /v2/review/list
Request schema `review.v2.ReviewListV2Request`:
- required: `limit`;
- `limit`: integer, 20..100;
- optional `last_id`;
- optional `sort_dir`: `ASC` / `DESC`;
- optional `filters`:
  - `order_status`: `ALL` / `DELIVERED` / `CANCELLED`;
  - `published_from`, `published_to`: RFC3339 date-time;
  - `skus`: max 1000, string `int64`;
  - `status`: `ALL` / `NEW` / `VIEWED` / `PROCESSED`.

No automatic `last_id` continuation is authorized.

### POST /v2/review/info
Request schema `review.v2.ReviewInfoV2Request`:
- required `review_id`;
- `review_id`: string.

The response exposes review text and media metadata.

### POST /v1/question/list
Request schema `v1QuestionListRequest` has no required properties:
- optional `filter.date_from`, `filter.date_to`: RFC3339 date-time;
- optional filter `status`: documented values `NEW`, `ALL`, `VIEWED`, `PROCESSED`, `UNPROCESSED`;
- optional `last_id`;
- optional integer `limit`, exact Swagger maximum 100;
- optional `sort_dir`: `DESC` / `ASC`.

No undocumented lower bound is invented for the optional question `limit`.

The response exposes buyer-generated `text` and `author_name`, which is why B9 places all three operations behind the existing operator personal-data gate.

## Entitlement evidence

Current review list/info descriptions say access is available with either:
- subscription `Управление отзывами`; OR
- `Premium Pro`.

`/v1/seller/info` can expose only the fixed subscription enum `UNKNOWN`, `UNSPECIFIED`, `PREMIUM`, `PREMIUM_LITE`, `PREMIUM_PLUS`, `PREMIUM_PRO`. It cannot represent the separate `Управление отзывами` entitlement.

B9 therefore must not compile review access into the false narrower rule `Premium Pro only`. Exact review restrictions are marked `UNKNOWN` / unresolved alternative entitlement so the bridge does not pre-reject a legitimately entitled `Управление отзывами` seller. After the local personal-data gate, Ozon remains authoritative for the exact safe read request.

Current `/v1/question/list` explicitly requires `Premium Plus`; that requirement is representable by the existing capability model and remains fail-closed when the current tier cannot be confirmed.
