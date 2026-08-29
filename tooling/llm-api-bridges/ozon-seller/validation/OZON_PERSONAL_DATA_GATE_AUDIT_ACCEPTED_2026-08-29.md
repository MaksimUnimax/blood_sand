# Ozon Personal Data gate audit — ACCEPTED

Date: 2026-08-29  
Status: `OZON_PERSONAL_DATA_GATE_AUDIT_ACCEPTED`

## Scope

Roadmap Step 4 audits attachment and runtime ordering of the already accepted B0 operator Personal Data gate across the currently accepted Seller read surface produced by Roadmap Step 3.

This acceptance does not redesign the Personal Data mechanism and does not claim privacy classification for Seller operations that do not yet have an accepted Step 3 alias.

No new Seller or Performance business API request was made for this audit.

## Authorities

Accepted Step 3 exact production tree:

- SHA-256 `ae3f53084d7a9aff5de820503a44b2875ab0c63c6ffc14bf72d941e8d0dab24e`;
- 21 production files;
- 18 JavaScript files.

Seller master inventory authority:

- 463 current Seller operations;
- exact Seller Swagger SHA-256 `39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40`.

Accepted B0 Personal Data authority:

- accepted B0 head `a48e06b331bb959856808aff0b8697cb9834807c`;
- independent B0 result commit `cc6413d25dd794a12fd61b71728aaac9702bc6de`;
- Personal Data OFF blocks before provider execution;
- blocked execution causes zero physical business requests;
- enabling Personal Data does not replay a blocked command;
- explicit resubmit is required after enabling.

## Generated audit evidence

Evidence commit:

- `2008198a64d8144f7a45ff540eeed2977e968ba1`;
- message: `validation(ozon): record Personal Data gate attachment audit`.

Evidence files:

- `OZON_PERSONAL_DATA_GATE_AUDIT_2026-08-29.json`;
- `OZON_PERSONAL_DATA_GATE_AUDIT_2026-08-29.csv`;
- `OZON_PERSONAL_DATA_GATE_AUDIT_SUMMARY_2026-08-29.md`.

The JSON evidence records:

- 463 Seller master rows;
- 191 accepted Step 3 Seller aliases;
- 10 accepted aliases behind `operator_personal_data_gate`;
- 181 accepted aliases using `safe_projection` without the operator gate;
- 272 Seller master rows without an accepted Step 3 alias, intentionally left pending later exact-schema classification.

## Accepted gated aliases

The accepted ten-operation Personal Data gate set is:

- `fbs_posting_list` — `POST /v4/posting/fbs/list`;
- `fbs_unfulfilled_list` — `POST /v4/posting/fbs/unfulfilled/list`;
- `posting_fbs_get` — `POST /v3/posting/fbs/get`;
- `rfbs_returns_list` — `POST /v2/returns/rfbs/list`;
- `review_list` — `POST /v2/review/list`;
- `review_info` — `POST /v2/review/info`;
- `review_comment_list` — `POST /v1/review/comment/list`;
- `question_list` — `POST /v1/question/list`;
- `question_answer_list` — `POST /v1/question/answer/list`;
- `question_info` — `POST /v1/question/info`.

Every one of these aliases has accepted metadata:

- `privacy_policy: operator_personal_data_gate`;
- `policy_group: personal_data_read`;
- `default_allowed: false`;
- `safety_class: PERSONAL_DATA_READ_GATED`.

## Runtime ordering acceptance

The Step 4 audit proves the Personal Data gate is registry-driven rather than a hard-coded ten-alias branch.

For the batch execution owner, local policy is evaluated before:

1. capability/entitlement planning;
2. query planning;
3. provider execution.

A blocked Personal Data read becomes a local `policy_error` with:

- no execution command;
- no planning execution;
- `external_request_executed: false`;
- control flow terminating that entry before provider execution.

The settings save handlers persist the Personal Data setting and return state only. They do not call batch execution or provider execution and therefore do not replay a previously blocked command.

## Cross-platform CI acceptance

Final GitHub Actions run:

- run id: `33241158626`;
- head commit: `3b8f07461a7624ac3e08da024ee5875b9f6f56d6`;
- workflow: `Ozon Personal Data gate audit`;
- overall conclusion: SUCCESS.

Linux audit:

- accepted B0 browser evidence identity: PASS;
- exact Step 3 candidate materialization: PASS;
- 463-row attachment audit: PASS;
- generated evidence counts: PASS;
- evidence artifact upload: PASS.

Windows audit:

- exact Step 3 candidate materialization: PASS;
- all 18 JavaScript syntax checks: PASS;
- Personal Data metadata 10-gate / 181-safe split: PASS;
- 191-to-463 mapping: PASS;
- runtime registry-driven gate: PASS;
- policy-before-provider ordering: PASS;
- settings-enable no-replay source gate: PASS;
- evidence count verification: PASS.

The earlier Windows failure was only a validation-tool encoding defect: Python used the platform default `cp1252` while reading UTF-8 JSON. The workflow was corrected to use explicit `encoding='utf-8'`; no production file or product semantic was changed by that fix.

The final cross-platform run passes after this portability correction.

## B9/B17 carry-forward

Accepted review/question work remains valid under the already accepted B0 gate. Step 4 confirms the current accepted review/question Personal Data reads are attached to the same registry-driven gate; no second privacy mechanism is introduced.

## Boundary for later steps

`safe_projection` and `operator_personal_data_gate` are distinct controls and must remain distinct.

The 272 Seller master rows without an accepted Step 3 alias are not declared privacy-safe by Step 4. Their final Personal Data requirement must be determined from exact-schema and implementation analysis during later Seller completion work.

Step 4 therefore closes gate attachment for the currently accepted Seller read surface, not final privacy classification of all 463 Seller operations.

## Decision

The existing accepted B0 Personal Data gate is correctly attached to the currently accepted Seller read surface, executes before provider transport, produces zero business requests when blocking, and preserves no-replay / explicit-resubmit behavior on both Linux and Windows validation paths.

`OZON_PERSONAL_DATA_GATE_AUDIT_ACCEPTED`

Roadmap Step 4 is complete.

The next authorized action is Roadmap Step 5: identify and implement/classify admissible Seller read workflows, reports and document operations without hidden fanout, automatic polling, or mutation side effects. The 463-row Seller master checklist remains the controlling inventory.
