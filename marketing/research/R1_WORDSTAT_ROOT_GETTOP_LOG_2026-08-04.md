# R1 — Wordstat Measurement Log

Дата начала: 2026-08-04  
Re-baseline: 2026-08-12  
Статус: **COMPLETE — roadmap 03 measurement layer closed**

Этот файл фиксирует итог измерительного прохода Wordstat R1. Counts из пересекающихся RESULT/ASSOCIATION не суммируются. ASSOCIATION используется только как discovery evidence. Пустой HTTP-200 объект не трактуется как нулевой спрос.

## Coverage

- historical pilot roots сохранены: 13;
- consolidated unique root/query rows после re-baseline: 44;
- новый family/Tier2 GetTop pass: 31 roots;
- operator precision: 6 quoted measurements;
- monthly Dynamics: 4 representative leaders;
- device split: 2 roots × PHONE/DESKTOP = 4 calls;
- region layer: 1 `getRegionsDistribution` + 1 `getRegionsTree` lookup;
- отдельный consolidated dataset: `marketing/data/normalized/wordstat/20260812__wordstat__r1-demand-summary__russia.csv`;
- decision-oriented Query Evidence Ledger: `marketing/data/ledger/query_evidence_ledger.csv`.

## High-value broad roots

- `славянские обереги` — 25737;
- `вегвизир` — 5938;
- `талисман знак зодиака` — 3422;
- `печать велеса` — latest broad RESULT 3330; historical pilot broad 3350;
- `алатырь оберег` — 1878;
- `оберег велес` — 1507;
- `оберег в машину` — latest broad RESULT 1405; historical pilot broad 1388;
- `подарок автомобилисту` — 1192;
- `подвеска на зеркало в машину` — latest broad RESULT 1074; historical pilot broad 973;
- `подарок мужчине в машину` — 1070;
- `оберег чур` — 903;
- `сварог оберег` — 761;
- `оберег по знаку зодиака` — 710;
- `шлем ужаса оберег` — 474;
- `амулет в машину` — 404.

## Operator precision

Quoted operator `totalCount` хранится отдельно от broad RESULT row:

- `"славянские обереги"` — 2987 против broad 25737;
- `"печать велеса"` — 802 против broad RESULT 3330;
- `"оберег в машину"` — 96 против broad RESULT 1405;
- `"подвеска на зеркало в машину"` — 266 против broad RESULT 1074;
- `"вегвизир"` — 1541 против broad RESULT 5938;
- `"талисман знак зодиака"` — 21 против broad-form RESULT 3422.

Вывод: broad root volume часто существенно шире ядра формулировки; особенно сильное narrowing у zodiac и automotive generic wording. Operator value не заменяется broad RESULT и не складывается с ним.

## Seasonality / Dynamics

Период: 2025-08 .. 2026-07, `PERIOD_MONTHLY`, Россия 225, DEVICE_ALL.

### `славянские обереги`
23625, 20275, 21650, 22630, 21417, 21596, 19232, 19992, 20850, 18663, 21668, 25472.

Устойчивый крупный кластер; локальная просадка весной и сильный июльский возврат.

### `талисман знак зодиака`
3781, 3972, 3701, 4077, 4596, 3655, 3156, 3209, 2625, 2305, 2958, 3324.

Пик в декабре, выраженная весенняя просадка, частичное восстановление летом.

### `вегвизир`
8674, 7773, 7676, 6784, 6879, 6255, 5618, 5604, 6037, 5416, 5437, 5892.

Тренд ниже уровня августа 2025; broad volume остаётся заметным, но смысловой/информационный слой велик.

### `оберег в машину`
835, 769, 893, 812, 732, 675, 868, 772, 779, 851, 910, 1293.

Явное усиление к лету 2026, максимум серии в июле.

## Device

`славянские обереги`:
- PHONE 22563;
- DESKTOP 2869.

`оберег в машину`:
- PHONE 1297;
- DESKTOP 100.

Оба независимых roots дают сильный mobile-first signal. Device counts используются как сравнительный срез и не суммируются механически с DEVICE_ALL.

## Region

Репрезентативный root: `славянские обереги`.

Федеральные/крупные области с заметным affinity:
- Юг — 127.6;
- Центр — 114.0;
- Сибирь — 113.9;
- Дальний Восток — 106.2;
- Москва и область — 106.2;
- Северо-Запад — 105.2;
- Урал — около 100.1;
- Поволжье — 78.6;
- Северный Кавказ — 72.8.

Крупные территории с повышенным affinity включают Краснодарский край 146.3, Алтайский край 132.5, Ставропольский край 124.6, Ростовскую область 122.9, Воронежскую область 116.2, Новосибирскую область 115.7. Мелкие high-affinity регионы с единичными counts не повышаются до стратегических приоритетов.

## Tier 2 / gap closure

Evidence-backed Slavic/Norse variants измерены выборочно, без механического прохода по всему ассортименту:
- `шлем ужаса оберег` — 474;
- `валькнут амулет` — 70;
- `гунгнир амулет` — 17;
- `славянский оберег звезда лады` — 118;
- `славянский оберег громовик` — 43;
- `славянский оберег мара` — 49;
- `славянский оберег перуна` — 130;
- `славянский оберег молвинец` — 82;
- `славянские обереги триглав` — 105.

`гунгнир амулет = 17` не дал основания продолжать Norse tail.

Gift-gap закрыт root `подарок мужчине в машину = 1070`; внутри RESULT есть `аксессуары для машины в подарок мужчине = 169`, `набор для машины = 65`, `гаджеты = 37`, `что купить = 30`, `подарок ... подвеска в машину = 7`. Это подтверждает самостоятельный gift/recipient слой, но не доказывает спрос именно на конкретный SKU без SERP/commerce validation.

## Empty-response measurements

HTTP 200 с пустым result object получен для:
- `скандинавский оберег в машину`;
- `древо жизни в машину`;
- `бусидо талисман`.

Статус — `MISSING`, не `0`; автоматические retries не выполнялись.

## Audit / recovery notes

Несколько результатов были получены расширением, но исходный provider raw не был закоммичен в момент вызова. Они восстановлены без повторного API и явно маркированы `RECOVERED`, а не выданы за byte-for-byte raw:
- broad `вегвизир`;
- Slavic PHONE/DESKTOP auxiliary split;
- Slavic region distribution;
- `getRegionsTree` lookup metadata.

Полные decision values сохранены. Для region recovery сохранены только decision-useful region rows; мелкий granular хвост не представлен как полный raw.

## Closure

Wordstat human-demand measurement layer R1 завершён. Дополнительный Wordstat API call не требуется. Следующий research layer — roadmap 04: direct Yandex SERP + Alice evidence на приоритетных roots, после чего можно соединять human demand с SERP/Alice/commerce evidence и принимать Page Job / IA / CTA решения.
