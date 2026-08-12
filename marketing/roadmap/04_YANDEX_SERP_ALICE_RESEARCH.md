# 04 — Исследовать реальный Yandex SERP и Alice AI

Статус: **[~] IN PROGRESS**  
Дата старта: 2026-08-12  
Оценка: **8–15 содержательных ранов**

## Цель пункта

Получить прямое, воспроизводимое evidence о том, что реально показывает Яндекс по приоритетным human-demand запросам после закрытия Wordstat R1:

- состав Yandex SERP;
- marketplace / independent / informational presence;
- типы ранжируемых страниц;
- товарные и иные rich blocks;
- dominant intent SERP;
- наличие/отсутствие Alice AI answer;
- наблюдаемые Alice sources / URLs / fanout;
- различия mobile/desktop там, где они decision-useful.

Результат 04 не является окончательным решением о структуре сайта. Его задача — дать прямой SERP/Alice слой для последующего объединения с Wordstat и marketplace/customer/commerce evidence в пункте 05.

## Жёсткие правила evidence

1. **Только прямой Yandex SERP считается Yandex SERP evidence.** Bing, Google, generic web-search, SEO snippets и сторонние агрегаторы не переименовываются в Yandex Top-10.
2. **Только реально наблюдённый Alice answer считается Alice evidence.** Нельзя выводить наличие ответа или source domains по косвенным данным.
3. Для каждого observation фиксируются:
   - query;
   - дата/время observation;
   - регион;
   - device;
   - logged-in / anonymous context, если известно;
   - URL/entry point;
   - organic result positions;
   - rich/product blocks;
   - Alice state;
   - raw/screenshot/text evidence reference.
4. Если direct observation технически недоступен, статус = `BLOCKED` / `NOT_OBSERVED`, а не inferred replacement.
5. Mobile — primary environment, потому что Wordstat R1 показал сильный mobile-first signal на двух независимых roots.
6. Не считать рекламные, товарные, organic и AI-блоки одной общей «позицией»; тип выдачи сохраняется отдельно.
7. Не считать один домен одним intent: фиксируется конкретный page type и фактический result URL.
8. Secondary queries добавляются только если primary pass показывает отдельный SERP/Page Job, который может изменить архитектурное решение.

## Primary query set

Authority: `marketing/research/R1_WORDSTAT_FINAL_REPORT_2026-08-12.md`.

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

Secondary only if evidence warrants:
- `шлем ужаса оберег`;
- `оберег по знаку зодиака`;
- `оберег чур`;
- `сварог оберег`;
- `печать велеса значение`.

## Ожидаемая схема выходных данных

Для каждой query минимум:

- query_id;
- query_text;
- observed_at;
- region;
- device;
- serp_status;
- organic_top10_status;
- organic results 1..10 where directly observable;
- marketplace_presence;
- independent_presence;
- informational_presence;
- product/rich block status;
- dominant_serp_intent;
- alice_status;
- alice_answer_present;
- alice_source_domains;
- alice_source_urls;
- alice_fanout_observed;
- raw_ref / source_ref;
- notes / blockers.

Query Evidence Ledger обновляется только по фактически observed полям.

## Критерий завершения пункта

Пункт 04 считается завершённым, когда:

- все 10 primary queries имеют direct mobile Yandex SERP observation либо явный documented blocker;
- decision-useful desktop comparison выполнен на representative roots либо документировано, почему он не нужен/недоступен;
- все 10 primary queries имеют direct Alice observation либо явный documented blocker;
- secondary expansion выполнен только по evidence и закрыт;
- raw/observation artifacts сохранены;
- normalized SERP/Alice dataset собран;
- Query Evidence Ledger обновлён;
- выпущен final R2/Yandex SERP + Alice report;
- сформирован handoff в пункт 05 без преждевременного Page Job verdict.

## Зависимости

- [x] Wordstat R1 / roadmap 03 закрыт.
- [x] Priority query set сформирован.
- [x] Query Evidence Ledger schema уже содержит SERP/Alice поля.
- [ ] Direct Yandex SERP observation channel проверен.
- [ ] Direct Alice observation channel проверен.

## Блокеры

Потенциальные блокеры:

- Yandex может отдавать CAPTCHA / anti-bot / region-dependent выдачу;
- обычный web-search tool не гарантирует Yandex и не может подменять прямое observation;
- Alice может требовать авторизованный/интерактивный UI, недоступный текущему execution channel;
- персонализация/гео/экспериментальные блоки могут менять SERP, поэтому контекст observation обязателен;
- если exact Top-10 нельзя надежно наблюдать, нельзя заменять его generic public-web snapshot.

---

## [x] 04.1 — Зафиксировать protocol, scope и acceptance rules

Результат:
- primary/secondary query sets зафиксированы;
- mobile-first policy зафиксирована;
- direct-observation-only rule зафиксировано;
- поля evidence и completion criterion зафиксированы;
- blockers перечислены.

Критерий шага выполнен этим документом.

## [~] 04.2 — Проверить канал прямого Yandex SERP и снять primary mobile SERP

Выполнить:
- проверить, можно ли через текущую среду получить именно `yandex.ru/search` / эквивалентный прямой Yandex SERP без подмены другим поисковиком;
- зафиксировать регион Россия и device context;
- если доступ подтверждён — последовательно снять 10 primary queries;
- если возникает CAPTCHA/anti-bot/невалидная выдача — сохранить blocker evidence и не фальсифицировать Top-10.

Ожидаемый результат:
- 10 direct mobile SERP observations либо documented blocker matrix.

Оценка: 3–5 ранов.

## [ ] 04.3 — Снять decision-useful desktop comparison

Representative roots:
- `славянские обереги`;
- `оберег в машину`;
- `печать велеса`;
- при необходимости ещё один root с отличающимся SERP intent.

Ожидаемый результат:
- сравнение composition mobile vs desktop без механического расширения на все queries.

Оценка: 1–2 рана.

## [ ] 04.4 — Проверить Alice AI на primary queries

Для тех же 10 primary roots:
- answer present / absent;
- observed answer surface/type;
- cited/source domains;
- cited/source URLs;
- observed fanout/questions;
- невозможность observation фиксировать как blocker, не inference.

Ожидаемый результат:
- 10 Alice observations либо documented blocker matrix.

Оценка: 2–4 рана.

## [ ] 04.5 — Evidence-driven secondary expansion

Запускать secondary roots только если primary SERP/Alice pass показывает distinct page job / source pattern / commercial-vs-informational split, способный изменить решение пункта 05.

Ожидаемый результат:
- короткий закрытый набор secondary observations либо аргументированный `NOT_NEEDED`.

Оценка: 0–2 рана.

## [ ] 04.6 — Нормализовать evidence и обновить Query Evidence Ledger

Выполнить:
- raw/observation artifacts;
- normalized SERP dataset;
- normalized Alice dataset или combined schema, если это соответствует существующей data architecture;
- update Ledger только observed фактами;
- проверить deterministic IDs / source refs / status vocabulary.

Ожидаемый результат:
- audit-ready data layer для пункта 05.

Оценка: 1–2 рана.

## [ ] 04.7 — Выпустить final SERP/Alice report и handoff в 05

Report должен отвечать:
- какие типы страниц реально занимают Yandex SERP;
- где доминируют marketplaces;
- где независимые магазины реально присутствуют;
- где доминирует informational intent;
- где есть product/rich blocks;
- где Alice отвечает;
- какие domains/pages Alice использует;
- какие queries имеют distinct page jobs, требующие проверки в пункте 05;
- какие выводы пока запрещены из-за отсутствия evidence.

Ожидаемый результат:
- final R2/Yandex SERP + Alice report;
- закрытие 04;
- приоритетный handoff в 05.

Оценка: 1–2 рана.
