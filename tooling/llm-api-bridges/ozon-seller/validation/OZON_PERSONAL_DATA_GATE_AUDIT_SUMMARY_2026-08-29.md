# Ozon Personal Data gate audit — 2026-08-29

Status: `CURRENT_ACCEPTED_SELLER_READ_SURFACE_GATE_ATTACHMENT_AUDITED`

## Counts

- Seller master rows: **463**.
- Accepted Step 3 Seller aliases: **191**.
- Accepted aliases behind `operator_personal_data_gate`: **10**.
- Accepted aliases using `safe_projection` without the operator gate: **181**.
- Master rows without an accepted Step 3 alias: **272**; privacy requirement remains pending later exact-schema classification.

## Runtime gate

- Registry-driven `personal_data_read` policy is evaluated before capability planning, query planning and provider execution.
- Blocked entries become local `policy_error` results with `external_request_executed:false`.
- The runtime gate does not hard-code the ten aliases.
- Saving Personal Data ON/OFF changes only persisted settings/state; it does not replay a blocked command. Explicit resubmit remains required, consistent with accepted B0 browser evidence.

## Currently gated accepted aliases

- `fbs_posting_list` — `POST /v4/posting/fbs/list` — `orders_postings / fbs_postings`
- `fbs_unfulfilled_list` — `POST /v4/posting/fbs/unfulfilled/list` — `orders_postings / fbs_postings`
- `posting_fbs_get` — `POST /v3/posting/fbs/get` — `orders_postings / fbs_postings`
- `question_answer_list` — `POST /v1/question/answer/list` — `reviews_questions / answers`
- `question_info` — `POST /v1/question/info` — `reviews_questions / questions`
- `question_list` — `POST /v1/question/list` — `reviews_questions / questions`
- `review_comment_list` — `POST /v1/review/comment/list` — `reviews_questions / review_comments`
- `review_info` — `POST /v2/review/info` — `reviews_questions / reviews`
- `review_list` — `POST /v2/review/list` — `reviews_questions / reviews`
- `rfbs_returns_list` — `POST /v2/returns/rfbs/list` — `returns_cancellations / returns`

## Boundary

`safe_projection` and the operator Personal Data gate are distinct controls. The 272 rows without an accepted Step 3 alias are not declared safe by this audit. Final privacy classification for those rows remains pending exact-schema work in later roadmap steps.

No fresh Seller or Performance business API request is used by this audit.
