# R1 — Wordstat Final Report / Roadmap 04 Handoff

Дата: 2026-08-12  
Статус: **FINAL — Wordstat R1 complete**  
Регион: Россия / `225`  
Основной device baseline: `DEVICE_ALL`

## 1. Цель и границы

R1 измеряет human-search demand в Yandex Wordstat по фактическому re-baselined ассортименту Ozon. Wordstat evidence не подменяет прямой Yandex SERP, Alice AI, customer evidence или commerce evidence. Counts из пересекающихся формулировок не суммируются как уникальный спрос.

Authority scope: `marketing/data/normalized/marketplace/ozon/OZON_TO_WORDSTAT_REBASELINE_2026-08-12.md`.

Каноническая decision-summary таблица R1: `marketing/data/normalized/wordstat/20260812__wordstat__r1-demand-summary__russia.csv`.

Decision-oriented Query Evidence Ledger: `marketing/data/ledger/query_evidence_ledger.csv`.

## 2. Coverage result

R1 закрывает:

- historical pilot stack вокруг Печати Велеса / automotive — сохранён;
- полный обязательный Wave 1 family scope;
- evidence-conditioned Wave 2;
- operator precision для high-value roots;
- seasonality/Dynamics для четырёх representative leaders;
- device comparison для двух independent roots;
- region distribution для dominant Slavic family;
- final gap closure по Norse и gift/recipient layer.

Consolidated summary содержит 44 уникальных root/query rows.

## 3. Family-level human demand

### Slavic

Сильнейший и наиболее ассортиментно релевантный слой.

- `славянские обереги` — broad 25737;
- `алатырь оберег` — 1878;
- `оберег велес` — 1507;
- `оберег чур` — 903;
- `сварог оберег` — 761;
- `славянский оберег перуна` — 130;
- `славянский оберег звезда лады` — 118;
- `славянские обереги триглав` — 105;
- `славянский оберег молвинец` — 82;
- `славянский оберег мара` — 49;
- `славянский оберег громовик` — 43.

Это подтверждает отдельный human-demand layer для Slavic symbols, но не означает, что всем символам нужна отдельная landing page.

### Zodiac

- `талисман знак зодиака` — broad 3422;
- `оберег по знаку зодиака` — 710;
- `знак зодиака в машину` — 149;
- representative `талисман знака зодиака близнецы` — 160.

Broad root сильно загрязнён informational/stones/women intent. Quote operator для `"талисман знак зодиака"` дал только 21, поэтому broad volume нельзя читать как прямой спрос на автомобильную подвеску со знаком зодиака.

### Norse / runic

- `вегвизир` — broad 5938;
- `шлем ужаса оберег` — 474;
- `валькнут амулет` — 70;
- `гунгнир амулет` — 17;
- `вегвизир в машину` — 4;
- `скандинавский оберег в машину` — HTTP 200 empty result object / MISSING.

Vegvisir имеет большой human-interest layer, но meaning/tattoo/compass intent значителен. Direct automotive wording очень мало. Gungnir 17 закрывает Norse-tail gap без основания продолжать измерять все symbol variants.

### Automotive / form

- `оберег в машину` — current broad RESULT 1405;
- `подвеска на зеркало в машину` — current broad RESULT 1074;
- `амулет в машину` — 404;
- `талисман в машину` — 177;
- historical `славянский оберег в машину` — 72;
- `герб россии в машину` — 55;
- `спаси и сохрани в машину` — 48;
- `православный оберег в машину` — 22;
- `инь ян в машину` — 5;
- `печать велеса в машину` — 5.

Главный вывод: product form/use case `подвеска на зеркало в машину` и общий автомобильный protective/use-case layer намного сильнее прямого exact symbol + car wording.

### Gift

- historical `подарок автомобилисту` — 1192;
- current `подарок мужчине в машину` — 1070.

Внутри `подарок мужчине в машину` observed:
- `аксессуары для машины в подарок мужчине` — 169;
- `набор для машины в подарок мужчине` — 65;
- `гаджеты в машину в подарок мужчине` — 37;
- `что купить для машины в подарок мужчине` — 30;
- `подарок мужчине от женщины подвеска в машину` — 7.

Gift/recipient layer реальный и достаточно крупный для проверки в SERP, но Wordstat не доказывает, что подвеска-оберег является dominant answer внутри этого intent.

## 4. Operator precision

Quote operator показал систематическое narrowing:

| Root | Broad RESULT / broad root | Quoted totalCount |
|---|---:|---:|
| славянские обереги | 25737 | 2987 |
| печать велеса | 3330 | 802 |
| оберег в машину | 1405 | 96 |
| подвеска на зеркало в машину | 1074 | 266 |
| вегвизир | 5938 | 1541 |
| талисман знак зодиака | 3422 | 21 |

Operator `totalCount` и broad RESULT — разные observations. Они не заменяют друг друга и не суммируются.

Decision implication: high broad volume сам по себе не достаточен для page/IA decision. Приоритет в roadmap 04 должен учитывать operator narrowing и SERP composition.

## 5. Seasonality

### Slavic

Диапазон 18663–25472 за 12 месяцев; устойчивый крупный спрос, июль 2026 — максимум серии.

### Zodiac talisman

Пик 4596 в декабре 2025, минимум 2305 в мае 2026, летом частичное восстановление.

### Vegvisir

Снижение от 8674 в августе 2025 к 5.4–5.9k в мае–июле 2026. Кластер остаётся крупным, но не растущим по этой серии.

### Automotive obereg

675 в январе 2026 → 910 в июне → 1293 в июле. Летнее усиление существенно и должно учитываться при timing/content prioritization.

## 6. Device

Два independent roots дали одинаковый directional result:

- `славянские обереги`: PHONE 22563, DESKTOP 2869;
- `оберег в машину`: PHONE 1297, DESKTOP 100.

R1 conclusion: demand layer strongly mobile-first. Это не означает, что desktop можно игнорировать, но mobile SERP/UX должен быть primary validation environment на следующем этапе.

## 7. Region

На dominant root `славянские обереги` meaningful macro-region affinity:

- Юг 127.6;
- Центр 114.0;
- Сибирь 113.9;
- Дальний Восток 106.2;
- Москва и область 106.2;
- Северо-Запад 105.2;
- Урал 100.1;
- Поволжье 78.6;
- Северный Кавказ 72.8.

Крупные повышенные territories: Краснодарский край 146.3, Алтайский край 132.5, Ставропольский край 124.6, Ростовская область 122.9, Воронежская область 116.2, Новосибирская область 115.7.

Small-count high-affinity outliers не используются для стратегической geo-prioritization без дополнительного evidence.

## 8. What Wordstat does NOT prove

R1 не доказывает:

- что broad query требует отдельной landing page;
- что marketplace/product pages занимают SERP;
- что Alice отвечает по этому intent;
- какие source domains Alice цитирует;
- что пользователь хочет именно наш form/material/SKU;
- что высокий informational demand конвертируется в покупку;
- что association count является child demand;
- что HTTP-200 empty object равен нулю.

Эти ограничения переносятся в roadmap 04/05.

## 9. Audit quality

Primary per-call normalized files и raw evidence сохранены. Для нескольких вызовов provider envelope не был сохранён в момент выполнения; вместо повторного API сделаны explicit recovery artifacts:

- broad `вегвизир`;
- `славянские обереги` PHONE/DESKTOP;
- Slavic region distribution;
- `getRegionsTree` lookup metadata.

Recovery artifacts маркированы `RECOVERED` и не выдаются за byte-for-byte original raw. Region recovery сохраняет decision-useful subset, а не полный granular tree/output.

Known legacy ID deviations в Vegvisir, Dynamics, quote-operator и tree-of-life normalized files исправлены под deterministic convention `SHA256(request_id)[:8]` / `SHA256(query_text)[:12]`.

## 10. Roadmap 04 handoff — priority query set

Первый SERP/Alice pass должен быть небольшим и decision-oriented. Приоритет:

1. `славянские обереги` — dominant family + commercial/info mix;
2. `печать велеса` — core SKU/family anchor;
3. `оберег в машину` — broad automotive use case, strongly mobile-first;
4. `подвеска на зеркало в машину` — фактический product-form layer;
5. `вегвизир` — крупный Norse root с высоким informational skew;
6. `талисман знак зодиака` — крупный broad root, extreme operator narrowing;
7. `алатырь оберег` — high-value Slavic symbol;
8. `оберег велес` — high-value Slavic symbol adjacent to core SKU;
9. `подарок мужчине в машину` — gift/recipient layer;
10. `подарок автомобилисту` — broad gift comparison anchor.

Secondary SERP/Alice checks only if first pass reveals distinct SERP/page jobs:
- `шлем ужаса оберег`;
- `оберег по знаку зодиака`;
- `оберег чур`;
- `сварог оберег`;
- `печать велеса значение`.

## 11. Roadmap 04 measurement requirements

Для каждого priority root требуется прямое observation, а не inference:

- Yandex SERP composition на mobile first;
- marketplace presence;
- independent-site presence;
- informational vs commercial dominance;
- product blocks / rich elements;
- top domains/pages;
- Alice answer present/absent;
- Alice cited/source domains and URLs where observable;
- fanout/questions only as observed evidence;
- region/device fixed and recorded.

После этого roadmap 05 сможет соединить Human demand H + SERP + Alice A + marketplace/customer/commerce evidence без преждевременного page verdict.

## 12. Closure verdict

Roadmap 03 completion criterion выполнен на decision-grade уровне:

- family roots measured;
- operator precision measured;
- representative seasonality measured;
- decision-useful device and region evidence measured;
- Tier2 expanded only by evidence;
- gaps closed;
- normalized R1 dataset assembled;
- Query Evidence Ledger updated;
- final report issued.

**Новый Wordstat API request для закрытия R1 не требуется.**
