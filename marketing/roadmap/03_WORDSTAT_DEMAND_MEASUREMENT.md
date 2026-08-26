# 03 — Полностью измерить поисковый спрос / Wordstat

Статус: **[x] ВЫПОЛНЕНО**  
Дата начала: 2026-08-04  
Дата закрытия: **2026-08-12**  
Финальный артефакт: `marketing/research/R1_WORDSTAT_FINAL_REPORT_2026-08-12.md`

## Цель пункта

Получить decision-grade картину человеческого поискового спроса в Яндексе по России для товарного, символического, автомобильного, informational/comparison, zodiac, Norse/runic и gift слоёв; не смешивать Wordstat с Search/Alice/commerce evidence и подготовить подтверждённый входной query set для следующего этапа.

## Критерий завершения пункта

Пункт закрывается, когда:

- основные root/query families измерены;
- для high-value roots проверена precision broad → quoted/operator логика;
- representative seasonality/dynamics снята;
- representative device split снят;
- evidence-driven Tier 2 expansion выполнен;
- принятые значения и ограничения сведены в итоговый R1 report;
- есть достаточная human-demand map для перехода к direct Yandex Search/Alice research.

Критерий выполнен.

---

# Шаги

## [x] 03.1 — Зафиксировать scope и план измерений

Результат:

- определены товарные, automotive, meaning/comparison и gift roots;
- позже scope расширен Slavic, zodiac и Norse/runic families;
- Russia `225` принята базовым регионом;
- counts разных overlapping child phrases не суммируются как уникальный спрос.

## [x] 03.2 — Снять root demand и сформировать фактическую карту формулировок

Финальный рабочий dataset включает **44 unique root/query rows**.

Ключевые accepted broad signals:

- `славянские обереги` — `25,737`;
- `печать велеса` — `3,330`;
- `оберег в машину` — `1,405`;
- `подвеска на зеркало в машину` — `1,074`;
- `вегвизир` — `5,938`;
- `талисман знак зодиака` — `3,422`;
- `алатырь оберег` — `1,878`;
- `оберег велес` — `1,507`;
- `подарок мужчине в машину` — `1,070`;
- `подарок автомобилисту` — historical signal `1,192`.

Automotive evidence:

- `печать велеса в машину` — `5`;
- broader use-case/form roots существенно сильнее exact symbol+car wording.

## [x] 03.3 — Измерить precision/operator variants для high-value roots

Accepted broad → quoted examples:

- `славянские обереги`: `25,737 → 2,987`;
- `печать велеса`: `3,330 → 802`;
- `оберег в машину`: `1,405 → 96`;
- `подвеска на зеркало в машину`: `1,074 → 266`;
- `вегвизир`: `5,938 → 1,541`;
- `талисман знак зодиака`: `3,422 → 21`.

Результат:

Broad volume не трактуется как точный target demand. Zodiac root особенно сильно загрязнён соседними informational/stones formulations.

## [x] 03.4 — Снять representative seasonality / Dynamics

Принятые наблюдения:

- Slavic demand высокий и устойчивый в наблюдаемом окне; Jul 2026 — максимум representative series;
- zodiac cluster имеет заметный winter/gift peak;
- Vegvisir остаётся крупным, но ниже уровня Aug 2025;
- automotive `оберег в машину` показывает рост к summer 2026.

Точные representative значения сохранены в финальном R1 report.

## [x] 03.5 — Проверить representative device differences

Russia device evidence:

- `славянские обереги`: PHONE `22,563` vs DESKTOP `2,869`;
- `оберег в машину`: PHONE `1,297` vs DESKTOP `100`.

Вывод:

Human demand strongly mobile-first.

Важно: Wordstat device evidence не превращает будущий Search API measurement без device selector в mobile SERP observation.

## [x] 03.6 — Выполнить evidence-driven Tier 2 expansion

Добавлены и проверены, в частности:

- Slavic symbol subclusters;
- zodiac formulations;
- Norse/runic symbols;
- gift variants;
- automotive form/use-case queries.

Expansion остановлен после получения достаточной карты спроса; длинный хвост не измеряется механически.

## [x] 03.7 — Свести R1 и закрыть Wordstat stage

Финальный артефакт:

- `marketing/research/R1_WORDSTAT_FINAL_REPORT_2026-08-12.md`.

Главные выводы R1:

1. вокруг product families существует значимый внешний небрендовый human demand;
2. exact symbol+car wording часто намного меньше broad use-case/form demand;
3. meaning/informational layer существует самостоятельно;
4. broad roots требуют precision checks;
5. form-factor, symbol meaning, use-case и gift intent нельзя автоматически назначать одной странице;
6. representative demand mobile-first;
7. финальные IA/Page Jobs должны ждать direct Search + Alice evidence.

---

# Итог пункта

**Пункт 03 закрыт.**

Следующий SEO/research stage:

> **04 — direct Yandex Search / SERP и Alice AI research.**

Каноническая текущая детализация:

- `marketing/roadmap/04_YANDEX_SERP_ALICE_RESEARCH.md`.
