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
2. Официальный Yandex Search API WebSearch считается прямым Yandex SERP evidence: XML используется для organic extraction; HTML — для composition/rich blocks, потому что официальный HTML соответствует выдаче Яндекса в incognito mode.
3. **Только реально наблюдённый consumer Alice answer считается consumer Alice UI evidence.** Нельзя выводить наличие ответа или source domains по косвенным данным.
4. Официальный Search API GenSearch сохраняется отдельным evidence type `YANDEX_GENERATIVE_ALICE_TECH`; он не переименовывается в consumer Alice UI observation, потому что его documented request schema не предоставляет тот же region/device UI context.
5. Для каждого observation фиксируются query, дата/время, регион/device где применимо, entry point/API method, organic positions, rich/product blocks, AI/generative state и raw/source reference.
6. Если direct observation технически недоступен, статус = `BLOCKED` / `NOT_OBSERVED`, а не inferred replacement.
7. Mobile — primary environment, потому что Wordstat R1 показал сильный mobile-first signal на двух независимых roots.
8. Не считать рекламные, товарные, organic и AI-блоки одной общей «позицией»; тип выдачи сохраняется отдельно.
9. Secondary queries добавляются только если primary pass показывает отдельный SERP/Page Job, который может изменить архитектурное решение.

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
- generative_api_status;
- generative_source_urls;
- raw_ref / source_ref;
- notes / blockers.

Query Evidence Ledger обновляется только по фактически observed полям.

## Критерий завершения пункта

Пункт 04 считается завершённым, когда:

- все 10 primary queries имеют direct mobile Yandex SERP observation либо явный documented blocker;
- decision-useful desktop comparison выполнен на representative roots либо документировано, почему он не нужен/недоступен;
- все 10 primary queries имеют consumer Alice observation либо явный documented blocker;
- официальный Alice-tech/GenSearch слой измерен отдельно, если он decision-useful;
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
- [x] Official direct Yandex SERP channel проверен: `POST /v2/web/search`.
- [x] Official generative Alice-tech channel проверен: `POST /v2/gen/search`, с отдельной semantics от consumer UI.
- [x] Narrow Search API overlay реализован поверх accepted Wordstat lifecycle.
- [x] Static/CI acceptance overlay пройден; GitHub Actions run `31574779725` = success.
- [!] Local installed extension должен быть обновлён/reloaded перед первым live provider probe.

Authority/acceptance artifacts:
- `marketing/research/R2_YANDEX_SEARCH_API_CHANNEL_AUDIT_2026-08-12.md`;
- `marketing/research/R2_YANDEX_SERP_ALICE_CHAT_HANDOFF_2026-08-12.md`;
- `tooling/llm-api-bridges/yandex-wordstat/r2-search-overlay/ACCEPTANCE_2026-08-12.md`;
- `tooling/llm-api-bridges/yandex-wordstat/r2-search-overlay/APPEND_ONLY_DOCUMENTATION_1.1.6.md`.

## Текущий блокер

Единственный blocker для продолжения 04.2 — локальный execution boundary:

- текущая установленная unpacked extension 1.1.5 должна получить Search overlay и быть Reloaded в Chrome;
- предпочтителен in-place update той же папки, чтобы не создавать новый Chrome extension identity/storage namespace;
- patch/build не читает, не экспортирует и не изменяет API key;
- после Reload выполняется ровно один live `webSearch` probe;
- перед probe тариф заново проверяется по официальному Yandex source;
- failed/unknown request автоматически не повторяется.

Consumer Alice UI остаётся потенциальным отдельным blocker 04.4; GenSearch не используется как ложная подмена consumer UI.

---

## [x] 04.1 — Зафиксировать protocol, scope и acceptance rules

Результат:
- primary/secondary query sets зафиксированы;
- mobile-first policy зафиксирована;
- direct-observation-only rule зафиксировано;
- поля evidence и completion criterion зафиксированы;
- blockers перечислены.

Критерий шага выполнен.

## [~] 04.2 — Проверить канал прямого Yandex SERP и снять primary mobile SERP

Выполнено:
- generic web-search отвергнут как невалидная подмена Yandex Top-10;
- официальный direct channel подтверждён через Yandex Search API WebSearch;
- mobile context задаётся фиксированным mobile User-Agent, region = 225;
- narrow `YANDEX_SEARCH_API_V1` overlay реализован и CI-accepted;
- derived 1.1.6 package и in-place patch path подготовлены;
- append-only documentation chain для 1.1.6 зафиксирован в GitHub;
- chat-handoff checkpoint зафиксирован в GitHub.

Осталось:
- Reload локального extension с overlay;
- один live primary `webSearch` probe;
- после успешного probe последовательно снять 10 primary mobile queries;
- XML сохранять для organic Top-10; HTML использовать для composition/rich-block evidence там, где требуется.

Ожидаемый результат:
- 10 direct mobile SERP observations либо documented provider/blocker matrix.

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
- consumer Alice answer present / absent либо documented UI blocker;
- observed answer surface/type;
- cited/source domains and URLs where directly observable;
- observed fanout/questions;
- отдельно, без смешивания semantics, официальный `YANDEX_GENERATIVE_ALICE_TECH` pass через GenSearch с answer + source URLs.

Ожидаемый результат:
- consumer Alice observation/blocker matrix;
- отдельный official generative evidence layer, если измерение выполнено.

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
- normalized consumer Alice dataset/blocker matrix;
- normalized generative API evidence отдельно, если получено;
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
- где consumer Alice отвечает либо где UI observation заблокирован;
- какие domains/pages используются consumer Alice, если наблюдаемы;
- что показывает отдельный official Alice-tech/GenSearch evidence layer;
- какие queries имеют distinct page jobs, требующие проверки в пункте 05;
- какие выводы пока запрещены из-за отсутствия evidence.

Ожидаемый результат:
- final R2/Yandex SERP + Alice report;
- закрытие 04;
- приоритетный handoff в 05.

Оценка: 1–2 рана.

## Chat handoff checkpoint — 2026-08-12

Передача в новый чат зафиксирована в:

`marketing/research/R2_YANDEX_SERP_ALICE_CHAT_HANDOFF_2026-08-12.md`

Новый чат обязан сначала перечитать live HEAD/commit metadata и этот файл вместе с roadmap 04, Search API channel audit, overlay acceptance и append-only continuation. SHA из handoff — только checkpoint, а не authority, потому что branch shared с параллельным Ozon track.
