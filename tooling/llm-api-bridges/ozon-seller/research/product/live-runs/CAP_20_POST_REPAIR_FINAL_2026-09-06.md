# CAP-20 — Bridge + external-world investigation — POST-REPAIR FINAL

Status: `PASS_WITH_TRANSIENT_PROVIDER_RATE_LIMIT_RECOVERY`

Canonical job:

`3 сентября 2026 года рекламный DRR у меня ухудшился до 17,91%, а 4 сентября восстановился до 11,67%. Похоже ли это на внешний платформенный/рыночный фактор или на внутреннюю динамику кабинета? Сверь дневные продажи моего кабинета за 3–4 сентября с уже проверенной Performance-статистикой и публичным контекстом Ozon за эти даты. Отделяй подтверждённые факты от гипотез и не выдавай корреляцию за причинность.`

## Live Seller read

Initial `analytics_data` attempt was provider-rate-limited with HTTP 429 and was preserved separately in `CAP_20_RUN_01_RATE_LIMIT_2026-09-06.md`. No automatic retry occurred.

Successful retry:
- request_id: `b9d0a459-cb4a-41c9-aac9-db1fceb8e774`
- HTTP 200
- `external_request_executed=true`
- `logical_business_result_count=1`
- `physical_business_request_count=1`
- entitlement `SUPPORTED_AND_ENTITLED`
- exact request preserved
- requested/physical metrics: `revenue`, `ordered_units`
- 2026-09-03: Seller revenue `37,400 RUB`; ordered units `22`
- 2026-09-04: Seller revenue `44,200 RUB`; ordered units `26`
- two-day totals: revenue `81,600 RUB`; ordered units `48`

Seller revenue and ordered units each increased by about `18.18%` on September 4 versus September 3.

## Reconciliation with preserved CAP-18 Performance evidence

| Date | Seller revenue | Seller units | Performance spend | Performance attributed order value | Performance DRR |
|---|---:|---:|---:|---:|---:|
| 2026-09-03 | 37,400 RUB | 22 | 7,917.49 RUB | 44,200 RUB | 17.91% |
| 2026-09-04 | 44,200 RUB | 26 | 6,872.55 RUB | 58,888 RUB | 11.67% |

From September 3 to September 4:
- Seller revenue: `+18.18%`
- Seller ordered units: `+18.18%`
- Performance spend: about `-13.20%`
- Performance attributed order value: about `+33.23%`
- Performance DRR: `17.91% -> 11.67%` (`-6.24 pp`)

Seller revenue and Performance-attributed order value are kept as separate accounting surfaces and are not substituted for one another.

## Evidence classification

### PRIVATE_FACT
- authenticated Seller data shows higher revenue and units on September 4;
- preserved authenticated Performance data shows lower ad spend, higher attributed order value, and materially better DRR on September 4.

### PUBLIC_FACT
- preserved official Ozon status evidence in the CAP-20 setup contains no documented incident for September 3 or September 4;
- preserved public Ozon advertising communication says consumer promotion for the September sale was to begin from September 4.

### CORRELATION
- the September 4 DRR improvement coincides with stronger Seller sales and stronger Performance-attributed order value while spend fell;
- this is consistent with an internal cabinet/day-level improvement, but correlation alone does not identify the cause.

### HYPOTHESIS
- the public September-sale promotion could have contributed to demand on September 4;
- the current evidence does not prove that the promotion caused this seller's change;
- absence of a documented public outage weighs against a known platform incident explanation but cannot rule out an unreported issue.

## Business conclusion

The available evidence leans toward **internal cabinet/day-level dynamics rather than a verified external platform incident**: September 4 had higher Seller revenue and units, lower ad spend, higher Performance-attributed order value, and substantially better DRR. Public promotional context is a plausible contributing factor, but causality is not proven. No external-platform causal claim is justified from the evidence available.

## Scoring

- capability_recognition: PASS
- operation_or_cluster_selection: PASS
- discovery_help_usage_when_needed: PASS
- multi_run_orchestration: PASS
- business_answer: PASS
- operator_intervention_required: `YES_ONCE_FOR_PROVIDER_RATE_LIMIT_RETRY`
- bridge_guidance_gap: `NO_NEW_GAP_PROVEN`

CAP-20 final: `PASS_WITH_TRANSIENT_PROVIDER_RATE_LIMIT_RECOVERY`.
