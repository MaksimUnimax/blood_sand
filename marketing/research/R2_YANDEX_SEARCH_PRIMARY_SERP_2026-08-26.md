# R2 — Yandex Search primary evidence set — 2026-08-26

Статус: **PRIMARY SEARCH PROVIDER EVIDENCE CAPTURED — 10/10**  
Рынок/регион: **Россия / region 225**  
Источник: прямые ответы Yandex Search API через рабочий канал проекта  
Формат ответа: `SEARCH_RESULT_V1`, `FORMAT_XML`  
Граница доказательства: это **direct Search provider evidence**, но не browser/UI SERP snapshot и не consumer Alice UI.

## 1. Зачем выполнен этот съём

Цель R2 — не собрать ещё один список ключей, а проверить, **что Яндекс реально считает ответом на разные пользовательские задачи вокруг ассортимента бренда**:

- marketplace vs independent sites;
- commercial/category/product vs informational/guide intent;
- какие типы страниц получают Top-10;
- где независимый тематический сайт вообще способен конкурировать;
- какие запросы требуют отдельной проверки Alice;
- какие secondary queries должны появляться только из наблюдаемого evidence.

Этот документ фиксирует первый полный primary-набор прямых Search-наблюдений. Он **не назначает Page Jobs и не утверждает архитектуру сайта**.

## 2. Общие ограничения наблюдения

Для всех десяти measurements непосредственно наблюдались:

- query text;
- region `225`;
- Top-10 URL/domain/title/snippet;
- порядок результатов;
- HTTP status и факт реального выполнения запроса.

Не наблюдались этим методом:

- browser SERP layout;
- рекламные блоки;
- визуальные товарные/rich blocks как UI-компоненты;
- mobile vs desktop SERP composition;
- consumer Alice answer;
- consumer Alice source selection/fan-out.

Поэтому эти поля должны оставаться `NOT_OBSERVED`, а не восстанавливаться по предположению.

---

# 3. Primary queries — прямые результаты и интерпретация

## 3.1 `славянские обереги`

Request ID: `search-09aa3f63-f501-4dd7-903d-62223aff930a`

Top-10:

1. Ozon — category — marketplace.
2. `slavyanskieoberegi.ru` — специализированный независимый сайт.
3. Wildberries — tag/category — marketplace.
4. `simvolroda.ru` — специализированный независимый сайт.
5. `slavyanskieoberegi.ru` — каталог.
6. `slavyanskieoberegi.ru` — informational/meaning page.
7. `altay-strong.ru` — commercial category.
8. `slavyanskieoberegi.ru` — product category.
9. `ruyan-master.ru` — специализированный магазин.
10. `veles.bz` — commercial category.

Наблюдение:

- marketplaces занимают #1 и #3, но не монополизируют выдачу;
- специализированные independent sites занимают большую часть Top-10;
- один тематический домен (`slavyanskieoberegi.ru`) занимает сразу #2/#5/#6/#8;
- commercial/category intent доминирует, но informational support присутствует.

Рабочая интерпретация: **commercial/category-first с доказанной достижимостью независимыми тематическими сайтами**.

## 3.2 `печать велеса`

Request ID: `search-12a4010f-75a2-4748-8a39-27561f73ffbc`

Top-10:

1. Wildberries.
2. `slavyanskieoberegi.ru` — специализированная страница.
3. Yandex Market — серебро.
4. Yandex Market — category.
5. Yandex Market — знаки Велеса.
6. Avito.
7. Arcanum blog — meaning/article.
8. Ozon.
9. Livemaster.
10. Yandex Market — подвеска/поисковая выдача.

Наблюдение:

- торговые площадки/marketplaces занимают 8 из 10 результатов;
- Yandex Market получает четыре позиции;
- специализированный independent site удерживает #2;
- отдельный чисто informational result присутствует только на #7;
- в сниппетах явно проявлены варианты `волчья лапа` / `медвежья лапа`.

Рабочая интерпретация: **strong transactional/product intent**.

## 3.3 `оберег в машину`

Request ID: `search-7236a7d2-9cb5-462d-aa90-49668e4b6c69`

Top-10:

1. Ozon.
2. Amber Land — автомобильная икона-триптих.
3. Wildberries.
4. Amber Land — автомобильная икона-триптих.
5. Wildberries — конкретный товар `Автодомовой`.
6. HappyWitch — guide `Какой выбрать оберег в машину`.
7. VK — informational post.
8. Innercare — product page.
9. Avito.
10. Dzen — informational article.

Наблюдение:

- одновременно присутствуют marketplace, independent product pages и informational choice content;
- выдача расширяет понятие `оберег в машину` за пределы славянской символики: православные иконы, домовой, эзотерические/восточные символы;
- запрос описывает **use-case и выбор решения**, а не один конкретный символ.

Рабочая интерпретация: **mixed commercial + choice/use-case intent**.

## 3.4 `подвеска на зеркало в машину`

Request ID: `search-f667a06f-56ba-4ba3-8c7b-c353ee83fccc`

Top-10:

1. Ozon.
2. Wildberries.
3. Avito.
4. AliExpress.
5. Yandex Market.
6. Yandex Market.
7. Yandex Market.
8. Livemaster.
9. Yandex Market.
10. Avito.

Наблюдение:

- 10/10 результатов — commercial marketplace/platform/catalog pages;
- самостоятельных informational pages в Top-10 нет;
- выдача включает игрушки, JDM, религиозную символику, подарки, handmade и обереги;
- `подвеска на зеркало` распознаётся прежде всего как **form-factor/auto accessory**, а не как смысловой кластер оберегов.

Рабочая интерпретация: **pure/near-pure product-form transactional intent**.

## 3.5 `вегвизир`

Request ID: `search-ab2de857-7959-4968-a9f3-8b5d75cc51b2`

Top-10:

1. Avito.
2. Yandex Market.
3. Avito.
4. `ruyan-master.ru` — informational article.
5. translated Wikipedia page.
6. Yandex Market.
7. Ozon.
8. Wildberries.
9. Pikabu — informational.
10. Livemaster.

Наблюдение:

- 7 commercial/platform results + 3 informational results;
- даже без `купить` коммерция очень сильна;
- одновременно Яндекс считает важным отвечать на вопрос `что такое Вегвизир / рунический компас`.

Рабочая интерпретация: **mixed entity + commercial intent**.

## 3.6 `талисман знак зодиака`

Request ID: `search-a59d7e42-69d4-4e10-9fcf-ff7108e6d415`

Top-10:

1. Yandex Market.
2. AllTime blog — подбор талисмана.
3. Wildberries.
4. Chronos — guide.
5. Ozon.
6. Violet Jewelry blog — камни/талисман.
7. Sunlight catalog.
8. Dzen — камни-талисманы.
9. `v-kosmose.com` — informational.
10. Sunlight Wiki — guide.

Наблюдение:

- примерно 6 informational/guide результатов против 4 коммерческих;
- сильный соседний intent — **камни по знаку зодиака**, а не только физические талисманы нашего типа;
- выдача отвечает прежде всего на `как выбрать / что подходит`, затем продаёт.

Рабочая интерпретация: **guide/selection-first; broad query semantically contaminated for direct product demand**.

## 3.7 `алатырь оберег`

Request ID: `search-bd9baea9-119c-4ec2-93db-5302893f8996`

Top-10:

1. Wildberries.
2. Legenti — meaning article.
3. Ozon.
4. Livemaster.
5. `slavyanskieoberegi.ru` — commercial category.
6. Livemaster.
7. VK — informational.
8. Yandex Market.
9. Yandex Market.
10. Dzen — informational.

Наблюдение:

- commercial-first, но meaning layer удерживает заметные позиции (#2/#7/#10);
- independent specialized site входит в Top-5;
- **в сниппете результата #1 Wildberries непосредственно наблюдался товар бренда `Кровь и Песок / Славянский оберег в машину "Алатырь (Крест Сварога)"`, 593 оценки**.

Важно: это marketplace visibility товара бренда, а не organic visibility собственного сайта.

Рабочая интерпретация: **commercial-first + meaningful symbol/meaning support layer**.

## 3.8 `оберег велес`

Request ID: `search-de6f1c2c-d7c3-406a-84ad-a2a43a3bbe1d`

Top-10:

1. Ozon.
2. Wildberries.
3. `slavyanskieoberegi.ru` — category.
4. Livemaster.
5. AllTime — meaning article.
6. `veles.bz` — catalog.
7. Wildberries — product.
8. `dommagii.com` — product.
9. `slavyanskieoberegi.ru` — Pechat Velesa content/hybrid page.
10. `simvolroda.ru` — catalog.

Наблюдение:

- commercial intent доминирует;
- в отличие от `печать велеса`, специализированные independent commerce sites представлены значительно сильнее;
- присутствует отдельный informational result и гибридная meaning/product страница.

Рабочая интерпретация: **commercial-first with strong niche independent competition**.

## 3.9 `подарок мужчине в машину`

Request ID: `search-2e6f5d82-da75-4421-add8-8ffa0b880b20`

Top-10:

1. Ozon.
2. Avito.
3. Wildberries.
4. Poryadok — gift catalog.
5. Yandex Market.
6. Yandex Market.
7. Sima-land.
8. Colapsar — gift catalog.
9. Yandex Market.
10. Hasvik — article `ТОП-20 полезных подарков`.

Наблюдение:

- почти полностью shopping/gift SERP;
- доминируют practical automotive gifts: наборы, автохимия, держатели, технические/универсальные аксессуары;
- оберег/подвеска не проявляется как dominant default answer.

Рабочая интерпретация: **strong gift-shopping intent, but weak direct product-category fit for our pendant type**.

## 3.10 `подарок автомобилисту`

Request ID: `search-70e6be3e-d119-41d3-9657-ec6f48d993be`

Top-10:

1. Ozon.
2. Wildberries.
3. Gifts.ru.
4. Colapsar.
5. KP — editorial ideas article.
6. Poryadok.
7. Yandex Market.
8. Yandex Market.
9. Yandex Market.
10. AC Studio — gift catalog.

Наблюдение:

- commercial catalogs/platforms overwhelmingly dominate;
- один сильный editorial ideas result (#5);
- в WB snippet непосредственно наблюдалась формулировка `Подвеска автомобилисту Волк, подарок близкому`, то есть pendant может быть одним из gift-options, но не dominant category.

Рабочая интерпретация: **shopping + gift idea-selection; our product is a possible angle, not the default category answer**.

---

# 4. Что уже доказано этим набором

## 4.1 SERP intent нельзя сводить к одной модели

Наблюдаются разные классы:

- broad thematic category — `славянские обереги`;
- product/symbol transactional — `печать велеса`;
- use-case + choice — `оберег в машину`;
- pure form-factor commerce — `подвеска на зеркало в машину`;
- entity + commerce — `вегвизир`;
- guide/selection — `талисман знак зодиака`;
- symbol commercial + meaning support — `алатырь оберег`, `оберег велес`;
- broad gift shopping — gift queries.

Следствие: **одинаковый Page Job для всех этих запросов был бы преждевременным и, вероятно, ошибочным**.

## 4.2 Marketplace pressure различается по кластеру

- `подвеска на зеркало в машину` — фактически platform-only Top-10;
- `печать велеса` — очень высокая marketplace/platform концентрация;
- `славянские обереги` и `оберег велес` — independent specialized sites конкурентоспособны;
- informational/selection queries допускают strong guide pages.

## 4.3 Independent site opportunity реально существует

Прямая Search evidence показывает, что специализированные independent domains входят высоко по нескольким query families. Это подтверждает feasibility собственной тематической Search surface, но **не доказывает**, что любая будущая страница бренда сможет ранжироваться без дальнейшего анализа quality/competition/content gap.

## 4.4 Form-factor и symbolic meaning — разные search jobs

`подвеска на зеркало в машину` и `оберег/символ` не следует автоматически считать одним кластером. Первый SERP — чисто товарный автоаксессуарный; второй может содержать meaning/choice слой.

## 4.5 Gift demand — соседний коммерческий путь, а не доказанный core category

Оба gift SERP согласованно показывают широкий набор практических автомобильных подарков. Подвеску можно позиционировать как gift use-case, но direct Search evidence пока не делает её главным ответом на gift query.

---

# 5. Что этим набором НЕ доказано

Не принято никаких финальных решений по:

- IA сайта;
- числу страниц;
- отдельным Page Jobs;
- URL structure;
- content plan;
- direct vs marketplace checkout priority;
- Alice optimization;
- mobile SERP strategy.

Причина: Roadmap требует свести **Wordstat + Search + Alice + commercial/customer evidence** до принятия таких решений.

---

# 6. Следующий корректный шаг

1. сохранить URL-level normalized evidence для этих 10 measurements;
2. пометить Search primary set как `OBSERVED`, а rich/UI/device/Alice поля как `NOT_OBSERVED`;
3. провести primary Alice observation по тому же decision-useful query set;
4. только после объединения Wordstat + Search + Alice выбрать evidence-driven secondary queries;
5. затем закрыть R2 финальным evidence report и передать его в opportunity/Page Job stage.

Не запускать secondary Search просто потому, что он кажется логичным: secondary expansion должен быть следствием наблюдаемого evidence.
