# R1 — Wordstat Measurement Specification

Дата: 2026-08-04  
Версия: 1.1  
Статус: **методика готова; авторизованный Wordstat API доступен через Manual Bridge; числовой съём выполняется в roadmap 03**

## 1. Зачем этот документ

Качественная семантическая карта уже создана. Следующий шаг — не придумывать частотность, а снимать её непосредственно из Яндекс Wordstat по России.

Этот файл фиксирует:
- какие типы запросов измерять;
- какие типы частотности нужны;
- какие временные и региональные срезы нужны;
- как данные должны быть сохранены в репозитории;
- почему числа не подменяются публичным web search.

Фактическое исполнение теперь ведётся по:

- `marketing/roadmap/03_WORDSTAT_DEMAND_MEASUREMENT.md`;
- `marketing/research/R1_WORDSTAT_EXECUTION_PLAN_2026-08-04.md`.

## 2. Подтверждённые возможности Wordstat

Официальная документация Яндекса подтверждает:

1. Wordstat API требует авторизацию.  
   https://aistudio.yandex.ru/docs/ru/search-api/concepts/wordstat.html

2. Top Requests возвращает данные за последние 30 дней; Dynamics — динамику во времени.  
   https://aistudio.yandex.ru/docs/ru/search-api/api-ref/Wordstat/index.html

3. Регион `225` соответствует России.  
   https://aistudio.yandex.ru/docs/en/search-api/reference/regions.html

4. GetTop поддерживает phrase, numPhrases, regions и devices; phrase поддерживает поисковые операторы.  
   https://aistudio.yandex.ru/docs/ru/search-api/operations/wordstat-gettop.html

## 3. Почему нельзя подменять Wordstat веб-поиском

Публичный web search подтверждает существование конкуренции и интентов, но не даёт корректного числа запросов Яндекса.

Следовательно:

- найденные карточки Ozon/BEREGY/других магазинов = подтверждение коммерческого интента;
- найденные статьи = подтверждение информационного интента;
- **они не являются заменой Wordstat frequency**.

## 4. Исходный Tier 1 scope

Исходный seed-list остаётся в:

`marketing/data/wordstat_seed_queries.csv`

Он содержит товарное ядро, автомобильное ядро, информационно-коммерческий слой и подарок.

Важно: версия 1.1 больше не требует механически снимать одинаковый полный набор measurement для каждой seed-фразы. Execution plan использует staged design, чтобы получить decision-grade evidence без десятков бесполезных дублей.

## 5. Требуемые типы measurement

В зависимости от роли запроса используются:

1. broad / GetTop;
2. operator variants для high-value queries;
3. Top Requests / связанные реальные формулировки;
4. Dynamics для репрезентативных cluster leaders;
5. device split выборочно;
6. region distribution выборочно;
7. Россия (`225`) как основной scope.

Какие именно фразы получают каждый measurement, определяется `R1_WORDSTAT_EXECUTION_PLAN_2026-08-04.md` и фактическими результатами предыдущих measurements.

## 6. Формат данных

Wordstat evidence хранится по каноническим документам:

- `marketing/data/DATA_ARCHITECTURE.md`;
- `marketing/data/DATA_SCHEMA_CONTRACT.md`;
- `marketing/data/DATA_WORKFLOW_AND_QUALITY.md`.

Raw, normalized, Ledger и derived analysis не смешиваются.

Числа сохраняются как полученные данные, без округления «для красоты» в raw.

## 7. Как определять приоритет после получения чисел

Частотность сама по себе не определяет ценность страницы.

Wordstat формирует прежде всего **H — Human demand**. Коммерческий смысл, Alice importance и owned-asset value подтверждаются отдельными evidence layers.

Поэтому Wordstat-этап не принимает финальное решение о странице только на основании самого большого числа.

## 8. Уже полученный live baseline

Первый live GetTop:

- phrase: `печать велеса`;
- Россия `225`;
- all devices;
- `totalCount = 3350`;
- `печать велеса значение = 617`;
- `печать велеса медвежья лапа = 343`;
- `оберег печать велеса = 198`;
- `печать велеса купить = 120`;
- `подвеска печать велеса = 80`.

Raw:

`marketing/data/wordstat/2026-08-04_gettop_pechat_velesa_ru_all.json`

Counts дочерних phrases пересекаются и не суммируются как уникальный спрос. Associations могут содержать lexical noise.

## 9. Текущий статус доступа

Старый блокер «нет авторизованного доступа» закрыт.

Wordstat Manual Bridge уже успешно провёл live GetTop request и вернул HTTP 200. Дальнейшие запросы выполняются вручную пользователем через локальный bridge.

Жёсткое operational rule:

> перед каждым executable `WORDSTAT_API_V1` command заново проверить официальную текущую цену Яндекса, объяснить конкретный request и стоимость одного вызова, и только затем показать command.

API key остаётся локально и не передаётся в чат.

R1 остаётся `IN PROGRESS` до завершения roadmap 03 и итогового Wordstat report.
