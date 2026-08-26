# R2 — Yandex browser SERP + consumer Alice observation plan — 2026-08-26

Статус: **READY FOR DIRECT OBSERVATION**

## Цель

Закрыть те evidence-gaps roadmap 04, которые direct Search provider API не может подтвердить:

- browser SERP/UI composition;
- ads/product/rich blocks как реальные UI-блоки;
- representative mobile vs desktop differences;
- consumer Alice answer presence;
- consumer Alice source URLs/domains;
- directly visible follow-up/fan-out formulations.

Search API Top-10 уже снят отдельно. Browser/Alice evidence не заменяет и не перезаписывает provider evidence.

## Актуальная продуктовая проверка Яндекса

Проверено 2026-08-26 по официальной справке Яндекса:

- Алиса AI может отвечать непосредственно над результатами Поиска;
- если ответ не появился, доступна отдельная вкладка «Алиса» под поисковой строкой;
- ответы обычно содержат ссылки на источники;
- список источников можно открыть через «Источники»;
- в чате последующие вопросы используют контекст предыдущего запроса;
- порядок ссылок-источников Alice не является обычным SERP ranking.

Официальные источники:

- https://yandex.ru/support/search/ru/alice
- https://www.yandex.ru/support/webmaster/ru/alice
- https://yandex.ru/company/news/07-04-2026-02

## Правила измерения

1. Каждый root query — **новый диалог / чистый Alice context**.
2. Exact input сохраняется без перефразирования.
3. Region фиксируется как Russia / `225` только если он реально настроен/подтверждён в UI; иначе region status = `NOT_CONFIRMED`.
4. Desktop/mobile маркируются только при фактически соответствующем устройстве/viewport.
5. Alice answer text сохраняется как snapshot/paraphrase с допустимым excerpt; нельзя реконструировать отсутствующий ответ.
6. Все URLs из «Источники» сохраняются как `ALICE_SOURCE`; их порядок не интерпретируется как ranking.
7. Suggested follow-up questions сохраняются как `ALICE_FANOUT_OBSERVED` только если реально видимы.
8. Inferred fan-out хранится отдельно и не выдаётся за observed.
9. Ads, product/rich blocks, organic и Alice answer — отдельные surface fields.
10. После каждого законченного observation результат сразу сохраняется в GitHub.

---

# 04.3 — Минимальный decision-useful browser SERP set

Не повторяем UI для всех 10 запросов механически.

## Desktop representative set — 5 roots

### 1. `славянские обереги`

Почему нужен UI:

- broad category;
- Search provider показывает сильные independent sites рядом с marketplace;
- нужно понять, насколько organic Top-10 визуально вытесняется commercial/product surfaces.

### 2. `печать велеса`

Почему нужен UI:

- Search provider почти marketplace-dominated;
- нужно проверить наличие product/rich/commercial blocks до/вокруг organic.

### 3. `оберег в машину`

Почему нужен UI:

- mixed commercial + choice/use-case;
- важно увидеть, какой surface Яндекс визуально ставит первым: товары, organic guide, Alice answer и т. п.

### 4. `подвеска на зеркало в машину`

Почему нужен UI:

- provider Top-10 = 10/10 commerce/platform;
- наиболее вероятный root для сильных товарных/rich surfaces.

### 5. `талисман знак зодиака`

Почему нужен UI:

- provider выдача informational/selection-first;
- полезен как контраст к product roots и для проверки Alice/guide surface.

## Mobile comparison — 2 roots

Только:

- `славянские обереги`;
- `оберег в машину`.

Причина: Wordstat показал сильный mobile-first human demand по этим репрезентативным кластерам. Поэтому mobile/desktop composition здесь decision-useful, а механический mobile повтор всех root queries пока не оправдан.

## Для каждого browser capture фиксировать

- exact query;
- observed_at;
- region/status;
- device;
- Alice answer above SERP: present/absent;
- ads present/absent;
- product/rich blocks present/absent;
- visual order surfaces;
- organic result types, где видны;
- screenshot/evidence ref.

---

# 04.4 — Consumer Alice primary set

Для сравнимости с Search provider **выполнить все 10 primary roots**:

1. `славянские обереги`
2. `печать велеса`
3. `оберег в машину`
4. `подвеска на зеркало в машину`
5. `вегвизир`
6. `талисман знак зодиака`
7. `алатырь оберег`
8. `оберег велес`
9. `подарок мужчине в машину`
10. `подарок автомобилисту`

Для каждого root:

- start new Alice conversation / clean context;
- enter exact query;
- record `answer_present`;
- preserve answer snapshot;
- open `Источники` and record every visible source domain + URL;
- classify each source page: marketplace / independent commerce / informational / media / community / other;
- record visible suggested follow-up questions as `ALICE_FANOUT_OBSERVED`;
- do not infer missing fan-out;
- immediately persist result before starting the next root.

## Почему все 10, а не только subset

Primary Search set intentionally spans materially different intents: category, symbol/product, automotive use-case, form-factor, entity, zodiac selection and gift. Alice is a core strategy surface, not a secondary SEO decoration. Omitting intent classes before secondary expansion would make Search↔Alice comparison incomplete.

---

# Secondary gate

До завершения primary Alice observations **не запускать** secondary Search/Alice queries автоматически.

После 10 Alice roots secondary candidates выбираются из объединённого evidence:

`Wordstat H + Search composition + Alice answer/source/fan-out`.

Текущие кандидаты (`оберег по знаку зодиака`, `шлем ужаса оберег`, `печать велеса значение`) остаются кандидатами, а не утверждённым списком.

# Точка выполнения

Первый browser/Alice root: `славянские обереги`.

Сначала сохранить browser SERP snapshot для desktop; затем в чистом Alice context получить consumer Alice answer и sources по тому же exact input. После фиксации в GitHub перейти к следующему root.
