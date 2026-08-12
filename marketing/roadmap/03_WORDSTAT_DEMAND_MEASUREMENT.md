# 03 — Полностью измерить поисковый спрос / Wordstat

Статус: **[x] COMPLETE — R1 Wordstat measurement layer закрыт 2026-08-12**  
Дата начала: 2026-08-04  
Re-baseline: 2026-08-12  
Дата закрытия: 2026-08-12

## Цель пункта

Получить decision-grade картину human-search demand в Яндекс Wordstat по России для фактических product families текущего Ozon assortment, сохранить raw/normalized evidence, обновить Query Evidence Ledger и подготовить прямой handoff в Yandex SERP/Alice research.

## Критерий завершения

Пункт считается закрытым, когда:

- основные root-кластеры re-baselined assortment измерены через GetTop;
- high-value roots имеют operator precision;
- representative leaders имеют Dynamics/seasonality;
- device/region измерены там, где это влияет на решение;
- Tier 2 расширен только по evidence;
- raw/normalized audit trail сохранён или явно помечен recovery-status там, где original raw не был сохранён вовремя;
- assembled consolidated R1 dataset;
- Query Evidence Ledger обновлён;
- выпущен final R1 report / roadmap 04 handoff.

Все критерии выполнены.

## [x] 03.1 — Зафиксировать decision-grade scope и план измерений

Выполнено. Исходный pilot plan сохранён; 2026-08-12 scope re-baselined по current Ozon assortment.

Authority:
- `marketing/research/R1_WORDSTAT_EXECUTION_PLAN_2026-08-04.md`;
- `marketing/research/R1_WORDSTAT_MEASUREMENT_SPEC_2026-08-04.md`;
- `marketing/data/normalized/marketplace/ozon/OZON_TO_WORDSTAT_REBASELINE_2026-08-12.md`.

## [x] 03.2 — GetTop root discovery / family map

Выполнено.

- 13 historical pilot roots сохранены как evidence;
- обязательный new Wave 1 family coverage выполнен;
- Wave 2 расширен только по фактическому Wordstat evidence / assortment gaps;
- consolidated R1 summary содержит 44 уникальных root/query rows.

Ключевые broad signals:
- `славянские обереги` 25737;
- `вегвизир` 5938;
- `талисман знак зодиака` 3422;
- `печать велеса` latest broad RESULT 3330;
- `алатырь оберег` 1878;
- `оберег велес` 1507;
- `оберег в машину` latest broad RESULT 1405;
- `подарок автомобилисту` 1192;
- `подвеска на зеркало в машину` latest broad RESULT 1074;
- `подарок мужчине в машину` 1070.

Пустой HTTP-200 result object у `скандинавский оберег в машину`, `древо жизни в машину`, `бусидо талисман` сохраняется как `MISSING`, а не как `0`.

## [x] 03.3 — Operator precision для high-value roots

Выполнено через quoted operator measurements:

- `"славянские обереги"` 2987 vs broad 25737;
- `"печать велеса"` 802 vs broad RESULT 3330;
- `"оберег в машину"` 96 vs broad RESULT 1405;
- `"подвеска на зеркало в машину"` 266 vs broad RESULT 1074;
- `"вегвизир"` 1541 vs broad RESULT 5938;
- `"талисман знак зодиака"` 21 vs broad-form RESULT 3422.

Operator totalCount хранится отдельно от RESULT rows; overlapping observations не суммируются.

## [x] 03.4 — Seasonality / Dynamics

Выполнено для representative leaders, monthly 2025-08..2026-07:

- `славянские обереги`;
- `талисман знак зодиака`;
- `вегвизир`;
- `оберег в машину`.

Ключевые выводы:
- Slavic demand устойчив и усилился в июле 2026;
- zodiac peak — декабрь, весенняя просадка;
- Vegvisir ниже уровня августа 2025;
- automotive obereg заметно усиливается к лету, июль — максимум серии.

## [x] 03.5 — Device / region differences

Выполнено.

Device:
- `славянские обереги`: PHONE 22563, DESKTOP 2869;
- `оберег в машину`: PHONE 1297, DESKTOP 100.

Два independent roots подтверждают strong mobile-first demand environment.

Region distribution измерен на `славянские обереги`. Decision-useful macro-region signal: Юг, Центр и Сибирь выше среднего; Поволжье и Северный Кавказ ниже; small-count high-affinity outliers не повышаются до стратегических приоритетов.

## [x] 03.6 — Tier 2 / gap closure

Выполнено evidence-driven, без механического измерения всех SKU.

Закрыты representative Slavic/Norse roots, включая:
- `шлем ужаса оберег` 474;
- `валькнут амулет` 70;
- `гунгнир амулет` 17;
- `славянский оберег звезда лады` 118;
- `славянский оберег громовик` 43;
- `славянский оберег мара` 49;
- `славянский оберег перуна` 130;
- `славянский оберег молвинец` 82;
- `славянские обереги триглав` 105.

Gift gap закрыт root `подарок мужчине в машину = 1070`; direct product-form child `подарок мужчине от женщины подвеска в машину = 7` наблюдён, но не повышается автоматически до SKU-level commercial verdict.

Gungnir 17 не даёт основания продолжать Norse tail.

## [x] 03.7 — Full normalized R1 dataset / Ledger / final report

Выполнено.

Артефакты:
- `marketing/data/normalized/wordstat/20260812__wordstat__r1-demand-summary__russia.csv` — полный decision-summary R1, 44 unique roots;
- `marketing/data/ledger/query_evidence_ledger.csv` — decision-oriented Ledger с historical pilot и ключевыми re-baseline roots;
- `marketing/research/R1_WORDSTAT_ROOT_GETTOP_LOG_2026-08-04.md` — финальный measurement log;
- `marketing/research/R1_WORDSTAT_FINAL_REPORT_2026-08-12.md` — итоговый report + roadmap 04 handoff.

## Audit notes

Для части результатов original provider raw не был сохранён в GitHub в момент вызова. Повторные API calls не выполнялись; вместо этого созданы explicit `RECOVERED` audit artifacts, которые не выдаются за byte-for-byte raw:

- broad `вегвизир`;
- Slavic PHONE/DESKTOP auxiliary device measurements;
- Slavic region distribution;
- `getRegionsTree` lookup metadata.

Legacy deterministic-ID deviations в известных normalized files исправлены.

## Итоговый результат

Wordstat R1 human-demand layer закрыт. Дополнительный Wordstat API call для выполнения roadmap 03 не требуется.

Следующий пункт проекта: **04 — исследовать реальный Yandex SERP и Alice AI**. Он не запускается автоматически: сначала фиксируется его конечный список шагов, оценка ранов, критерий завершения, зависимости и blockers по правилу общего roadmap.
