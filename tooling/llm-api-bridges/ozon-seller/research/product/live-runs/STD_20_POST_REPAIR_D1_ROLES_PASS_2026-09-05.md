# STD-20 post-repair D1 — roles diagnostic PASS

Date: 2026-09-05
Canonical question: `Почему у меня вырос ДРР? Разбери, что изменилось в рекламе и продажах.`

Status: PASS.

Diagnostic `roles` returned HTTP 200 with one logical -> one physical request. Current key expires at `2027-02-06T08:09:07.738279Z`. `/v1/analytics/data` is explicitly present under `Admin read only`.

Therefore the two preceding `analytics_data` HTTP 429 results are not explained by expired key, missing role, or a global Seller API outage. Active strongest class remains analytics-method/provider quota state; exact trigger unresolved.

Checkpoint: `STD_20_D1_ROLES_PASS_RETURN_TO_EXACT_ANALYTICS_RETRY`
