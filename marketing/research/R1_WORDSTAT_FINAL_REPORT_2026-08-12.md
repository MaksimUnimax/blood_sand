# R1 — Wordstat final report — 2026-08-12

Статус: **FINAL — WORDSTAT R1 COMPLETE**  
Рынок: **Россия / region 225**  
Базовый device scope: **DEVICE_ALL**  
Назначение: decision-grade human-demand layer для последующего сопоставления с Yandex Search/SERP и Alice.

> Backfill note: этот итоговый отчёт фиксирует в GitHub уже завершённый рабочий R1, который ранее существовал в рабочей сессии, но не был внесён в `main`. Для части поздних measurements exact raw/normalized payload-файлы требуют отдельного backfill, если понадобится полный byte-level audit. Итоговые принятые значения и выводы ниже являются канонической точкой продолжения для SEO-исследования.

## 1. Что измерено

R1 охватывает товарные, символические, автомобильные, zodiac, Norse/runic и gift query families.

Итоговый рабочий набор: **44 unique root/query rows**.

Основные измерения включают:

- broad demand;
- quoted/phrase precision для ключевых roots;
- representative Dynamics/seasonality;
- representative device split;
- related/child formulations только как отдельные observations, без суммирования пересекающихся counts.

---

# 2. Slavic / symbol demand

Основные broad values:

| Query | Broad 30d |
|---|---:|
| `славянские обереги` | 25,737 |
| `алатырь оберег` | 1,878 |
| `оберег велес` | 1,507 |
| `оберег чур` | 903 |
| `сварог оберег` | 761 |
| `славянский оберег перуна` | 130 |
| `славянский оберег звезда лады` | 118 |
| `славянские обереги триглав` | 105 |
| `славянский оберег молвинец` | 82 |
| `славянский оберег мара` | 49 |
| `славянский оберег громовик` | 43 |

Наблюдение:

- broad thematic Slavic demand значителен;
- отдельные символы образуют самостоятельные subclusters;
- частотность сама по себе не назначает отдельную страницу: Page Job остаётся pending Search/Alice evidence.

---

# 3. Pechat Velesa / meaning layer

Ключевые значения:

| Query | Broad 30d | Quoted / phrase |
|---|---:|---:|
| `печать велеса` | 3,330 | 802 |
| `печать велеса значение` | meaningful informational root observed in R1 | — |

Ранее pilot evidence также подтверждал отдельные bear/wolf meaning variants.

Главное:

- `печать велеса` имеет реальный товарный спрос;
- meaning/informational layer существует отдельно и не должен автоматически сливаться с product query;
- окончательное разделение product page vs guide/meaning page требует Search + Alice evidence.

---

# 4. Automotive / form-factor demand

Основные broad values:

| Query | Broad 30d |
|---|---:|
| `оберег в машину` | 1,405 |
| `подвеска на зеркало в машину` | 1,074 |
| `амулет в машину` | 404 |
| `талисман в машину` | 177 |
| `славянский оберег в машину` | historical signal 72 |
| `герб россии в машину` | 55 |
| `спаси и сохрани в машину` | 48 |
| `православный оберег в машину` | 22 |
| `инь ян в машину` | 5 |
| `печать велеса в машину` | 5 |

Наблюдение:

- **use-case/form demand намного сильнее точной symbol+car wording**;
- `печать велеса в машину` как exact broad root очень мала;
- `оберег в машину` и `подвеска на зеркало в машину` являются существенно более крупными человеческими формулировками задачи.

Это не доказывает, что одна страница должна таргетировать оба запроса: Search intent проверяется отдельно в R2.

---

# 5. Zodiac demand

Основные значения:

| Query | Broad 30d |
|---|---:|
| `талисман знак зодиака` | 3,422 |
| `оберег по знаку зодиака` | 710 |
| `знак зодиака в машину` | 149 |
| `талисман знака зодиака близнецы` | 160 |

Precision check:

- `талисман знак зодиака`: broad `3,422` → quoted `21`.

Наблюдение:

Broad root сильно загрязнён соседними informational/stones/women/horoscope formulations и **не равен прямому product demand**.

---

# 6. Norse / runic demand

Основные значения:

| Query | Broad 30d |
|---|---:|
| `вегвизир` | 5,938 |
| `шлем ужаса оберег` | 474 |
| `валькнут амулет` | 70 |
| `гунгнир амулет` | 17 |
| `вегвизир в машину` | 4 |
| `скандинавский оберег в машину` | MISSING / empty |

Precision:

- `вегвизир`: broad `5,938` → quoted `1,541`.

Наблюдение:

- entity interest высокий;
- значимая часть спроса связана с meaning/tattoo/compass контекстами;
- direct car qualifier почти отсутствует.

---

# 7. Gift demand

Основные значения:

| Query | Broad / current signal |
|---|---:|
| `подарок автомобилисту` | historical 1,192 |
| `подарок мужчине в машину` | current 1,070 |

Observed child formulations для `подарок мужчине в машину`:

- `аксессуары для машины в подарок мужчине` — 169;
- `набор для машины в подарок мужчине` — 65;
- `гаджеты в машину в подарок мужчине` — 37;
- `что купить для машины в подарок мужчине` — 30;
- `подарок мужчине от женщины подвеска в машину` — 7.

Наблюдение:

Gift intent реален, но Wordstat **не доказывает**, что автомобильная подвеска является dominant answer. Это проверяется Search evidence.

---

# 8. Broad → quoted precision

| Query | Broad | Quoted |
|---|---:|---:|
| `славянские обереги` | 25,737 | 2,987 |
| `печать велеса` | 3,330 | 802 |
| `оберег в машину` | 1,405 | 96 |
| `подвеска на зеркало в машину` | 1,074 | 266 |
| `вегвизир` | 5,938 | 1,541 |
| `талисман знак зодиака` | 3,422 | 21 |

Вывод:

Broad volume нельзя напрямую использовать как оценку точного целевого спроса. Особенно критичен zodiac root.

---

# 9. Seasonality / Dynamics

Representative observations:

- `славянские обереги`: примерно 18,663–25,472; Jul 2026 — max в наблюдаемом окне;
- zodiac cluster: peak Dec 2025 около 4,596, low May 2026 около 2,305;
- `вегвизир`: снижение примерно 8,674 Aug 2025 → около 5.4–5.9k May–Jul 2026;
- automotive `оберег в машину`: рост примерно 675 Jan → 910 Jun → 1,293 Jul 2026.

Наблюдение:

- automotive demand усиливается к летнему периоду в наблюдаемом окне;
- zodiac имеет gift/seasonality component;
- Vegvisir остаётся крупным, но тренд ниже прошлогоднего уровня.

---

# 10. Device evidence

Representative Russia device split:

| Query | PHONE | DESKTOP |
|---|---:|---:|
| `славянские обереги` | 22,563 | 2,869 |
| `оберег в машину` | 1,297 | 100 |

Вывод:

Human demand по репрезентативным roots **сильно mobile-first**.

Важно: это **Wordstat device evidence**. Оно не превращает текущие Search API Top-10 в mobile SERP evidence.

---

# 11. R1 conclusions

R1 подтверждает:

1. вокруг product families бренда существует значимый внешний небрендовый спрос;
2. direct symbol+car exact wording часто существенно меньше более широких use-case/form roots;
3. informational/meaning demand существует и местами очень силён;
4. broad roots могут быть сильно семантически загрязнены, поэтому precision measurement обязателен;
5. automotive form/use-case и gift layers нельзя автоматически считать одним product cluster;
6. demand в representative clusters mobile-first;
7. следующий слой должен проверять **реальную Search composition и Alice source selection**, а не создавать IA по Wordstat alone.

## Стоп-критерий R1

**Выполнен.**

Есть достаточная decision-grade human-demand map для перехода к direct Yandex Search/Alice research. Финальные Page Jobs и IA не принимаются до R2/Roadmap 04–05.
