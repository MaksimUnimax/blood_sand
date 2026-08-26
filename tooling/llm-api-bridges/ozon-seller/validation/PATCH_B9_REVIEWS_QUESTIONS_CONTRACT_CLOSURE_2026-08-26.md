# Patch B9 Reviews / Questions — contract closure

Date: 2026-08-26

B9 closes roadmap priority `P2_reviews_questions` on accepted B8 authority `600a6922fd3f339fb2d57bc3828d51ecba1670d7`.

## Enabled current reads

- `review_list` -> `POST /v2/review/list`
- `review_info` -> `POST /v2/review/info`
- `question_list` -> `POST /v1/question/list`

All are fixed `seller_api`, `READ`, `single_read`, JSON-body operations. Caller-controlled URL, host, path, method, headers and authorization material are rejected.

## Currentness

Deprecated queue-era review v1 routes are not enabled:
- `/v1/review/list`
- `/v1/review/info`

B9 uses their exact current v2 replacements. Review/comment mutations, review status mutations, question answer mutations and question status mutations stay outside the executable read allowlist.

## Pagination

`last_id` is caller-controlled only. B9 never automatically follows continuation tokens, retries, fans out SKUs/IDs, or turns one logical command into multiple physical business requests.

## Personal-data boundary

All three B9 reads are:
- `safety_class: PERSONAL_DATA_READ_GATED`
- `privacy_policy: operator_personal_data_gate`
- `policy_group: personal_data_read`
- `default_allowed: false`
- `guidance_visibility: conditional`

The existing service-worker policy gate runs before any provider business request. Only after the operator has enabled the existing personal-data setting can buyer-generated review/question text or question author names be returned to the AI.

The gate implementation itself is unchanged in B9.

## Entitlements

Reviews: exact Swagger says `Управление отзывами` OR `Premium Pro`. Because `/v1/seller/info` cannot represent the first entitlement, B9 marks this exact endpoint restriction as unrepresentable/unknown rather than falsely narrowing it to Premium Pro. No capability probe is required for an unknown review entitlement; Ozon remains authoritative after the personal-data policy gate.

Questions: exact Swagger says `Premium Plus`. B9 compiles `question_list` to `SUBSCRIPTION_RESTRICTED` with `PREMIUM_PLUS` and preserves the existing single capability-probe planning model.

## Protected behavior

B8 supply semantics and B7 entitlement parsing are carried forward. Autorun, Work-session lifecycle, Manual mode, service worker, provider, transport, credentials and analytics quota runtime are unchanged.
