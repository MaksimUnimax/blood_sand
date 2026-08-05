# 03 — Полностью измерить поисковый спрос / Wordstat

Статус: **[~] В РАБОТЕ**  
Дата начала: 2026-08-04  
Оценка: **примерно 37–54 рана**  
Фактически выполнено: **03.1 закрыт; в 03.2 выполнены 5 новых API measurement, валидных root GetTop вместе с historical baseline — 6/14**

## Цель пункта

Получить decision-grade картину человеческого поискового спроса в Яндексе по России для товарного, автомобильного, информационного/сравнительного и подарочного слоёв, сохранить raw/normalized evidence и обновить Query Evidence Ledger без смешивания Wordstat с Search/Alice/commerce evidence.

## Критерий завершения пункта

Пункт закрывается, когда основные root-кластеры измерены через GetTop, для high-value запросов сняты operator variants, для репрезентативных лидеров проверена сезонность, device/region измерены там, где это влияет на решение, Tier 2 расширен только по evidence, все measurements имеют raw/normalized, Ledger обновлён и выпущен итоговый R1 report.

# Шаги

## [x] 03.1 — Зафиксировать decision-grade scope и план измерений

**Оценка:** 1 ран.  
**Статус:** выполнено 2026-08-04.

Артефакт: `marketing/research/R1_WORDSTAT_EXECUTION_PLAN_2026-08-04.md`.

## [~] 03.2 — Снять GetTop по root-кластерам и сформировать фактическую карту формулировок

**Оценка:** примерно 13–17 API-ранов + 1 аналитический проход.  
**Текущий прогресс:** **6/14 root GetTop**, из них **5** новых API measurement выполнены внутри roadmap 03.

Измерено:

- `печать велеса` — `totalCount=3350` (historical baseline);
- `оберег печать велеса` — `198`;
- `подвеска печать велеса` — `80`;
- `печать велеса медвежья лапа` — `343`;
- `печать велеса волчья лапа` — `129`;
- `печать велеса в машину` — `5`.

Для каждого нового measurement созданы raw, normalized и Ledger evidence. Running log: `marketing/research/R1_WORDSTAT_ROOT_GETTOP_LOG_2026-08-04.md`.

Последний measurement показал: прямой root `печать велеса в машину` имеет очень малый broad signal `5`; HTTP 200 response содержал только `totalCount`, без полей `results`/`associations`, поэтому child/association observations не выдумываются. Automotive cluster не закрыт: более широкие roots всё ещё обязательны.

Следующий root: **`оберег в машину` / GetTop / Россия / все устройства**.

## [ ] 03.3 — Измерить operator variants для high-value запросов

**Оценка:** примерно 12–18 ранов.  
Ожидаемый результат: broad и более узкие operator-values не смешиваются.

## [ ] 03.4 — Снять сезонность по репрезентативным cluster leaders

**Оценка:** примерно 4–6 ранов.  
Ожидаемый результат: пики/просадки и проверка устойчивости 30-day snapshot.

## [ ] 03.5 — Проверить device и region differences там, где они decision-useful

**Оценка:** примерно 4–7 ранов.  
Ожидаемый результат: понять, влияет ли device/geo специфика на приоритизацию.

## [ ] 03.6 — Расширить Tier 2 и закрыть пробелы по evidence

**Оценка:** примерно 3–7 ранов.  
Ожидаемый результат: измерить только существенные новые формулировки, а не весь возможный хвост.

## [ ] 03.7 — Нормализовать полный R1 dataset, обновить Ledger и закрыть Wordstat-этап

**Оценка:** 2–3 аналитических рана.  
Ожидаемый результат: полный normalized dataset, обновлённый Ledger, итоговый R1 report и список запросов для roadmap 04.

# Текущее состояние

- [x] 03.1 — scope/execution plan;
- [~] 03.2 — GetTop root discovery: **6/14**;
- [ ] 03.3 — operator precision;
- [ ] 03.4 — dynamics/seasonality;
- [ ] 03.5 — device/region samples;
- [ ] 03.6 — Tier 2/gap closure;
- [ ] 03.7 — normalized dataset/Ledger/final R1.

Текущий следующий measurement: **`оберег в машину` / GetTop / Россия / DEVICE_ALL**.
