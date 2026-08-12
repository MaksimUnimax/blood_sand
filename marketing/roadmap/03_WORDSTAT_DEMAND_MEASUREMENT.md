# 03 — Полностью измерить поисковый спрос / Wordstat

Статус: **[!] READY_FOR_WORDSTAT_EXTENSION — re-baseline выполнен, API-вызов не запускать до сигнала владельца**  
Дата начала: 2026-08-04  
Re-baseline: 2026-08-12  
Оценка исходного pilot: **примерно 37–54 рана**; остаток пересчитывается по evidence нового family scope.  
Фактически выполнено до re-baseline: **03.1 закрыт; в 03.2 выполнены 12 новых API measurement, валидных root GetTop вместе с historical baseline — 13 pilot roots**.

## Цель пункта

Получить decision-grade картину человеческого поискового спроса в Яндексе по России для фактических product families текущего магазина, сохранить raw/normalized evidence и обновить Query Evidence Ledger без смешивания Wordstat с Search/Alice/commerce evidence.

## Критерий завершения пункта

Пункт закрывается, когда основные root-кластеры по re-baselined assortment измерены через GetTop, для high-value запросов сняты operator variants, для репрезентативных лидеров проверена сезонность, device/region измерены там, где это влияет на решение, Tier 2 расширен только по evidence, все measurements имеют raw/normalized, Ledger обновлён и выпущен итоговый R1 report.

## Re-baseline 2026-08-12 — current authority для продолжения 03

Owner execution rule от 2026-08-12 сделал Wildberries неблокирующим для текущего critical path. Текущий ассортиментный baseline строится по Ozon.

Подготовлены:

- `marketing/data/normalized/marketplace/ozon/20260812__ozon__product-master__current-plus-90d.csv`;
- `marketing/data/normalized/marketplace/ozon/OZON_PRODUCT_FAMILY_BASELINE_2026-08-12.md`;
- `marketing/data/normalized/marketplace/ozon/OZON_TO_WORDSTAT_REBASELINE_2026-08-12.md`.

Ozon current product-level snapshot содержит **76 current SKU**. 90-day analytics `2026-05-13..2026-08-10` содержит **1519 ordered units**. Research-family weighting:

- slavic symbols / oberegs — 928 / 61.1%;
- zodiac combined — 356 / 23.4%;
- norse/runic — 128 / 8.4%;
- patriotic — 33 / 2.2%;
- orthodox — 28 / 1.8%;
- universal symbols — 27 / 1.8%;
- warrior talismans — 19 / 1.3%.

Это seller evidence только для sequencing coverage. Оно не является Wordstat demand и не превращается в окончательный site/category verdict.

Старый незапущенный root **`подарок мужчине в машину` больше не является следующим автоматическим measurement**. Он отложен и может вернуться только по evidence нового family pass.

**Первый новый measurement после явного запуска владельцем Wordstat extension:**

`знак зодиака в машину` / GetTop / Россия `225` / все устройства.

Причина выбора: zodiac — крупнейший полностью непокрытый новым Wordstat слоем family group: 356 Ozon ordered units / 23.4% за 90 дней. Slavic/automotive layer уже имеет substantial pilot evidence.

# Шаги

## [x] 03.1 — Зафиксировать decision-grade scope и план измерений

**Оценка:** 1 ран.  
**Статус:** исходный pilot plan выполнен 2026-08-04; 2026-08-12 scope re-baselined по current Ozon assortment.

Артефакты:

- `marketing/research/R1_WORDSTAT_EXECUTION_PLAN_2026-08-04.md` — исходный execution plan;
- `marketing/data/normalized/marketplace/ozon/OZON_TO_WORDSTAT_REBASELINE_2026-08-12.md` — authority для нового family-level root scope.

## [!] 03.2 — Снять GetTop по root-кластерам и сформировать фактическую карту формулировок

**Текущий gate:** re-baseline готов; ожидается запуск Wordstat extension владельцем. Никакой новый API request до этого не выполняется.

### Existing pilot evidence — сохраняется и не повторяется без причины

Измерено:

- `печать велеса` — `3350` (historical baseline);
- `оберег печать велеса` — `198`;
- `подвеска печать велеса` — `80`;
- `печать велеса медвежья лапа` — `343`;
- `печать велеса волчья лапа` — `129`;
- `печать велеса в машину` — `5`;
- `оберег в машину` — `1388`;
- `славянский оберег в машину` — `72`;
- `подвеска на зеркало в машину` — `973`;
- `печать велеса значение` — `617`;
- `медвежья и волчья печать велеса отличие` — `1`;
- `какой оберег выбрать в машину` — `12`;
- `подарок автомобилисту` — `1192`.

Для каждого measurement сохранены raw/normalized evidence и обновлён Ledger. Running log: `marketing/research/R1_WORDSTAT_ROOT_GETTOP_LOG_2026-08-04.md`.

Текущий automotive pilot evidence: прямая связка `печать велеса в машину` мала (`5`), широкий use-case `оберег в машину` крупнее (`1388`), а близкий к фактической форме товара root `подвеска на зеркало в машину` дал `973`. Counts пересекаются и не суммируются.

Meaning-layer подтверждён root `печать велеса значение = 617`. Exact comparison wording `медвежья и волчья печать велеса отличие` дало `totalCount=1`. Automotive-choice root `какой оберег выбрать в машину` дал `12`. Gift-root `подарок автомобилисту` дал `1192`, но general gift associations не повышаются автоматически до спроса на конкретный товар.

### Новый family-level GetTop scope

Authority: `marketing/data/normalized/marketplace/ozon/OZON_TO_WORDSTAT_REBASELINE_2026-08-12.md`.

Wave 1 включает unmeasured family anchors и representative roots:

- zodiac: `знак зодиака в машину`, `талисман знак зодиака`, `оберег по знаку зодиака`;
- slavic expansion: `славянские обереги`, `алатырь оберег`, `оберег чур`, `колядник оберег`, `оберег велес`, `сварог оберег`;
- norse/runic: `вегвизир`, `вегвизир в машину`, `скандинавский оберег в машину`;
- remaining families/form anchors: `герб россии в машину`, `православный оберег в машину`, `спаси и сохрани в машину`, `древо жизни в машину`, `инь ян в машину`, `талисман в машину`, `амулет в машину`, `бусидо талисман`.

Wave 2 формируется только из фактического Wave 1 Wordstat evidence. Все 76 SKU не превращаются автоматически в 76 roots.

## [ ] 03.3 — Измерить operator variants для high-value запросов

**Оценка:** пересчитать после нового 03.2 root discovery.  
Ожидаемый результат: broad и более узкие operator-values не смешиваются.

## [ ] 03.4 — Снять сезонность по репрезентативным cluster leaders

**Оценка:** примерно 4–6 ранов, уточнить по family leaders.  
Ожидаемый результат: пики/просадки и проверка устойчивости snapshot.

## [ ] 03.5 — Проверить device и region differences там, где они decision-useful

**Оценка:** примерно 4–7 ранов.  
Ожидаемый результат: определить, влияет ли device/geo специфика на приоритизацию.

## [ ] 03.6 — Расширить Tier 2 и закрыть пробелы по evidence

**Оценка:** зависит от Wave 1/2 discovery.  
Ожидаемый результат: измерить только существенные новые формулировки, а не весь возможный хвост.

## [ ] 03.7 — Нормализовать полный R1 dataset, обновить Ledger и закрыть Wordstat-этап

**Оценка:** 2–3 аналитических рана после завершения measurements.  
Ожидаемый результат: полный normalized dataset, обновлённый Ledger, итоговый R1 report и список запросов для roadmap 04.

# Текущее состояние

- [x] 03.1 — scope/execution plan + Ozon assortment re-baseline;
- [!] 03.2 — existing pilot 13 roots preserved; новый full-assortment root scope готов и ожидает запуска Wordstat extension;
- [ ] 03.3 — operator precision;
- [ ] 03.4 — dynamics/seasonality;
- [ ] 03.5 — device/region samples;
- [ ] 03.6 — Tier 2/gap closure;
- [ ] 03.7 — normalized dataset/Ledger/final R1.

Текущий следующий measurement **подготовлен, но не запущен**:

**`знак зодиака в машину` / GetTop / Россия `225` / DEVICE_ALL.**

Gate: владелец запускает Wordstat extension и сообщает о готовности; только после этого выполняется первый новый API request.