# STD-20 post-repair final

Date: 2026-09-05
Canonical question: `Почему у меня вырос ДРР? Разбери, что изменилось в рекламе и продажах.`

Status: `PASS_WITH_RECORDED_TRANSIENT_ANALYTICS_429_RECOVERY`

Business conclusion: the claimed DRR increase is not supported by the two completed 7-day periods.

- 2026-08-22..2026-08-28 Seller revenue: 253,237 RUB; ordered units: 149; ad spend: 35,280.09 RUB; blended DRR = 13.932%.
- 2026-08-29..2026-09-04 Seller revenue: 314,561 RUB; ordered units: 187; ad spend: 43,808.47 RUB; blended DRR = 13.927%.
- Revenue changed +24.22%, units +25.50%, spend +24.17%; blended DRR was effectively flat (-0.005 percentage points).
- Performance-attributed DRR improved from about 14.63% to 13.86% (-0.78 pp). Performance attribution is not treated as identical to Seller revenue accounting.
- CPC campaign inventory changed on 2026-08-27, so campaign-id-only comparison across the two periods would be misleading.

Operational record:
- `performance_daily` succeeded first attempt.
- first two identical `analytics_data` reads returned provider HTTP 429 / code 8 despite the second being after the Bridge local analytics spacing window;
- `roles` diagnostic returned HTTP 200, key valid through 2027-02-06, and `/v1/analytics/data` present in Admin read-only;
- third identical `analytics_data` read recovered with HTTP 200.
- strongest incident class: `TRANSIENT_ANALYTICS_METHOD_QUOTA_OR_PROVIDER_STATE_RECOVERED / EXACT_TRIGGER_UNRESOLVED`.

Checkpoint: `STD_20_PASS_LAYER_A_COMPLETE_CAP_01_READY`
