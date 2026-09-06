# CAP-16 — Reviews / questions aggregate surface — FINAL

Status: `PASS_WITH_ENTITLEMENT_BOUNDARIES_AND_REVIEW_ENTITLEMENT_GUIDANCE_GAP`

Canonical job:

`Сколько отзывов и вопросов сейчас есть в моём кабинете Ozon? Сначала используй безопасные агрегированные счётчики без чтения пользовательских текстов. Если детальные отзывы или вопросы требуют отдельного доступа, подписки или настройки личных данных — явно покажи эту границу и не выдавай отсутствие доступа за ноль.`

## Run 1 — review_count

Request id: `3b5e3de2-f2f7-41e9-9afe-02486765e4b7`
Operation: `review_count`
Provider call: `POST /v2/review/count`
Result: `HTTP 403`, provider code `7`, category `auth_or_permission`.
Execution: external request executed; exact request preserved; one logical business result / one physical business request.
Bridge entitlement state: `ENTITLEMENT_UNKNOWN`, reason `entitlement_rule_unknown`.

This is not evidence of zero reviews.

## Diagnostic — roles

Request id: `d0fd1f4a-eddb-4083-a1c3-a1cb243a14ea`
Operation: `roles`
Result: `HTTP 200`.

Current API key exposes `Review read only` and explicitly includes:
- `/v2/review/count`
- `/v2/review/info`
- `/v2/review/list`
- corresponding v1 review methods.

Therefore the Run-1 403 is not explained by the API key lacking the review method/role.

Current Bridge entitlement authority already records `/v2/review/count` as unresolved because the provider subscription alternative is not representable by the current entitlement model (`endpoint_subscription_alternative_unrepresentable`). The strongest supported classification is therefore an account/subscription/provider entitlement boundary plus a Bridge entitlement-guidance gap. Do not invent the exact required review subscription without stronger provider evidence.

## Run 2 — question_count

Request id: `capability-dd071263-ad2d-406d-b332-c9c36857cddc`
Operation: `question_count`
Provider endpoint: `POST /v1/question/count`

Bridge capability probe:
- performed: true
- HTTP 200
- subscription_type: `UNSPECIFIED`
- is_premium: false

Entitlement result:
- `SUPPORTED_BUT_NOT_ENTITLED`
- reason: `endpoint_subscription_restriction`
- required subscription: `PREMIUM_PLUS`
- external business request executed: false
- logical business result count: 0
- physical business request count: 0
- bridge error: `SUBSCRIPTION_REQUIRED`

This is correct pre-execution entitlement handling. It must not be reported as zero questions.

## Privacy boundary

Registry authority distinguishes safe aggregates from personal-text reads:
- `review_count` and `question_count` are aggregate/no-body reads;
- `review_list`, `review_info`, `question_list`, `question_info`, and answer/comment text reads are governed by personal-data or subscription gates.

No personal customer text was requested in this row.

## Business conclusion

The worker correctly treated reviews/questions as a dedicated Ozon capability surface and preserved uncertainty instead of fabricating business zeros:
- review aggregate: unavailable on this account at live call; exact subscription cause unresolved in current Bridge authority; API key role itself includes the method;
- question aggregate: known Premium Plus entitlement boundary, correctly blocked by Bridge before business execution;
- no user text was read unnecessarily.

## Score

- capability_recognition: PASS
- operation_or_cluster_selection: PASS
- discovery_help_usage_when_needed: NOT_NEEDED
- multi_run_orchestration: PASS
- business_answer: PASS
- operator_intervention_required: NO
- bridge_guidance_gap: ENTITLEMENT
- reliability note: review entitlement model is not deterministic enough; question entitlement model is deterministic and correctly enforced.

Checkpoint: `CAP_16_PASS_WITH_ENTITLEMENT_BOUNDARIES_CAP_17_READY`
