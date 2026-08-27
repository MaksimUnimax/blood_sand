# Patch B17 Reviews / Questions Extended Reads — ACCEPTED

- Candidate: `2219c01cfd7c9a8321348cfe6b1b99e386960e7b`
- Independent validation: `e3d96686dfd0f527808e7911a02430c5b9b260e6`
- Accepted B16 authority: `b5462aa7441b8073f3c4dc69232b2b397289e1c6`
- Materialized production tree: `4577b9ac48988560caaa66e197179d76b05d35ce5f515f241a3b63e558b80e34`
- Independent result: `PATCH_B17_REVIEWS_QUESTIONS_EXTENDED_READS_INDEPENDENT_TEST_PASS`
- Seller business requests during independent validation: `0`
- Performance business requests during independent validation: `0`
- Credentials used during independent validation: `0`
- Tester production modifications: `0`

Accepted B17 read surface:
- `review_comment_list` -> `POST /v1/review/comment/list`
- `review_count` -> `POST /v2/review/count`
- `question_answer_list` -> `POST /v1/question/answer/list`
- `question_count` -> `POST /v1/question/count`
- `question_info` -> `POST /v1/question/info`
- `question_top_sku` -> `POST /v1/question/top-sku`

Personal-data gating and accepted review/question entitlement semantics remain intact. No automatic pagination, retry, fanout or chaining is enabled. Protected runtime remains unchanged.

`PATCH_B17_REVIEWS_QUESTIONS_EXTENDED_READS_ACCEPTED`