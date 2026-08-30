# VK UX Flow — подбор оберега внутри VK

Версия: 0.2  
Статус: **V2 SALES-WEIGHTED product UX authority**  
Бренд: «Кровь и Песок»

Current matrix: `KIP_RECOMMENDATION_MATRIX_V2_SALES_WEIGHTED`  
Current product policy: `KIP_PRODUCT_POLICY_V2_SALES_WEIGHTED`  
Calendar: `KIP_CHERTOG_CALENDAR_V1`  
Marketplace override: `KIP_MARKETPLACE_OVERRIDE_V1`

## 1. Цель

Сделать подбор максимально коротким и понятным внутри VK:

```text
вход → дата → пол → результат
```

Без перехода в Telegram и без длинной анкеты.

VK Bot и VK Mini App — два интерфейса одного deterministic recommendation core. Они не имеют собственной матрицы и не принимают самостоятельных semantic decisions.

Клиенту не показываются внутренняя матрица, sales-weighting, scoring, relation types, selection basis, резервные товары и технические ключи.

## 2. Authority и hard rules

Для semantic result использовать текущие authority в таком порядке:

1. `RECOMMENDATION_MATRIX.md`;
2. `PRODUCT_CLASSIFICATION.md`;
3. `CUSTOMER_RECOMMENDATION_COPY_GUIDE.md`;
4. `DATA_API_CONTRACT.md`;
5. `ARCHITECTURE.md`.

`RECOMMENDATION_SYSTEM_TZ.md`, `M0_DOMAIN_FREEZE_AUDIT.md` и старые V1 prompts являются historical/superseded и не могут переопределять V2.

Текущие V2 invariants:

```text
ровно 1 recommendation на Чертог × пол × marketplace
secondary recommendation = forbidden
Медведь male/female → Печать Велеса
Волк male/female → Велес
Лиса male → Чернобог
Лиса female → Мара
Орёл male → Перун
Орёл female → Звезда Лады
Раса male/female → Даждьбог
```

Marketplace override:

```text
Ворон + male:
Ozon        → Колядник
Wildberries → Алатырь
```

Если VK flow не связан с конкретным marketplace destination, semantic resolver не должен сам выбирать marketplace-specific override. Marketplace должен быть передан явно или оставаться `null` согласно `DATA_API_CONTRACT.md`.

Для `Печать Велеса` customer-facing имя всегда ровно:

```text
Печать Велеса
```

Никакие internal aliases в UI не выводятся.

## 3. Общие UX-правила

1. Пользователь получает результат максимум за 2 осмысленных шага после входа.
2. Для semantic selection нужны день/месяц и пол.
3. Год рождения не влияет на выбор Чертога или товара.
4. Если пользователь прислал полный год, он сохраняется в session/result context и в customer-facing copy выводится как полная дата `DD.MM.YYYY`.
5. Если год не указан, бот его не спрашивает только ради recommendation и не придумывает.
6. Пол не угадывается — только явный выбор пользователя.
7. По умолчанию и во всех текущих V2 cases показывается ровно 1 товар.
8. Никаких secondary/fallback recommendations в result.
9. Не показывать «ещё 5 подходящих».
10. Не добавлять автоматически призыв «узнать больше» в каждый ответ.
11. Ошибка наличия не должна превращать подбор в другой оберег.
12. Semantic result не должен зависеть от канала `bot`/`mini_app`.

## 4. Точки входа во VK

### A. Кнопка/пункт сообщества

Основной CTA:

```text
Подобрать оберег
```

### B. Сообщения сообщества

Пользователь может написать:

```text
13.10
13.10.1976
```

или фразу с однозначно распознаваемой датой.

### C. VK Mini App

Открывается из сообщества и использует тот же Recommendation API/Core.

### D. Ссылка/QR из внешних материалов

Если карточки товара, упаковка, реклама или сайт ведут на подбор, целевая точка — VK/Mini App либо сообщения сообщества, не Telegram.

## 5. Bot flow

### 5.1. Новый диалог

Первое сообщение:

```text
Укажите дату рождения — день и месяц.
Например: 13.10
```

Допустимо принимать полный формат `13.10.1976` без требования удалить год.

### 5.2. После валидной даты

Следующий шаг:

```text
Для кого подбираем оберег?

[ Мужчине ] [ Женщине ]
```

Бот не должен угадывать пол по имени, аватару или текстовым признакам.

### 5.3. Результат

Owner-approved customer-copy порядок для date-based recommendation:

```text
полная указанная дата → Чертог → темы Чертога

оберег → почему подходит

product action
```

Если год был указан, первая фраза сохраняет его полностью.

Пример структуры:

```text
Дата 08.11.1983 относится к Чертогу Лебедя. Этот Чертог связывают с гармонией, семьёй, внутренним равновесием и сохранением связи с близкими.

Женщине рекомендуем оберег «Макошь». Макошь считается покровительницей Чертога Лебедя. Её связывают с судьбой, женской силой, семейным благополучием и домашней гармонией, поэтому это наиболее прямое соответствие этой дате.
```

Bot renderer должен использовать current `CUSTOMER_RECOMMENDATION_COPY_GUIDE.md`, а не держать отдельную устаревающую библиотеку semantic copy.

### 5.4. Actions после результата

Минимум:

```text
[ Посмотреть оберег ]
[ Подобрать снова ]
```

Дополнительно при необходимости:

```text
[ Написать продавцу ]
```

Не добавлять 5–7 кнопок.

## 6. Mini App flow

### Экран 1 — старт

```text
КРОВЬ И ПЕСОК

Подобрать оберег
по дате рождения

[ Начать подбор ]
```

### Экран 2 — дата

Основной UI спрашивает день и месяц.

Допустимые реализации:

- два select/input `День` и `Месяц`;
- date input/picker, если год необязателен и не влияет на selection.

Если пользователь вводит полный `DD.MM.YYYY`, год нужно сохранить в display context.

CTA:

```text
[ Продолжить ]
```

### Экран 3 — пол

```text
Для кого подбираем?

[ Мужчине ]
[ Женщине ]
```

Никаких предвыбранных значений.

### Экран 4 — результат

Показывается ровно одна recommendation card.

Пример:

```text
Ваш Чертог — Раса

Даждьбог

Дата 13.08 относится к Чертогу Раса. Этот Чертог связывают с достатком, созиданием, ответственностью и благополучием.

Рекомендуем оберег «Даждьбог». Для Чертога Раса это прямой выбор по текущей утверждённой матрице.

[ Посмотреть оберег ]
[ Подобрать снова ]
```

Фактический финальный reason copy должен браться из current authority, а не из этого иллюстративного примера.

### Удалённый старый сценарий «два результата»

V1-сценарий:

```text
Медведь + мужчина → Сварог + Медвежья лапа
```

является superseded и запрещён в V2.

Текущий результат:

```text
Медведь + мужчина → Печать Велеса
Медведь + женщина → Печать Велеса
```

ровно одна карточка.

## 7. Manual answer mode

Manual owner/manager helper может принять текст вопроса и вернуть current deterministic recommendation/copy, но не должен иметь отдельную матрицу.

Если пол неизвестен, автоматический VK bot flow спрашивает пол. Не угадывать и не выдавать случайную ветку.

Если в будущем появится отдельный manual operator mode, его multi-branch behavior должен быть явно согласован с current owner policy и не должен незаметно менять consumer bot flow.

## 8. Parsing rules для Bot Adapter

Минимально поддерживаемые формы:

```text
13.10
13.10.1976
13/10
13/10/1976
13-10
13-10-1976
```

Допускается whitespace вокруг даты.

Если в сообщении две даты, не угадывать.

Пример:

```text
Я 13.10, жена 20.11
```

→ попросить выбрать одну дату/одного человека.

Для валидной полной даты сохранить год как display context.

## 9. Validation UX

### Некорректная дата

```text
Не удалось распознать дату. Укажите день и месяц, например 13.10.
```

### Несуществующая дата

```text
Такой даты нет. Проверьте день и месяц и отправьте ещё раз.
```

### 29.02

Принимается и относится к Волку по `KIP_CHERTOG_CALENDAR_V1`.

## 10. Product destination / unavailable UX

Availability — только overlay и не меняет semantic recommendation.

Если product destination доступен:

```text
[ Посмотреть оберег ]
```

Если availability неизвестна или товар недоступен, исходная recommendation сохраняется.

Запрещено автоматически подменять её другим товаром без отдельной owner-approved fallback policy.

## 11. Human handoff

Пользователь может запросить человека после результата или при проблеме.

Bot state:

```text
HUMAN_HANDOFF
```

После handoff бот не должен автоматически продолжать recommendation conversation, пока handoff явно не завершён либо не сработал определённый product timeout.

Точная VK-механика фиксируется implementation ADR перед M3.

## 12. Возврат пользователя

Кнопка:

```text
Подобрать снова
```

очищает текущие `birth_day`, `birth_month`, `birth_year`, `gender`, marketplace/destination context текущей session и запускает новый flow.

Ранее выданный `result_id` остаётся в audit/analytics history.

## 13. Аналитическая воронка

```text
flow_started
→ date_submitted
→ gender_selected
→ result_shown
→ product_action_clicked
```

Отдельно:

```text
validation_error
human_handoff_requested
product_unavailable_shown
start_over_clicked
```

На первом этапе основной KPI — `started → result_shown`.

Analytics не меняет semantic matrix автоматически.

## 14. Не делать в V1 production

- свободный AI-chat вместо deterministic flow;
- запрос имени;
- обязательный запрос года рождения;
- угадывание пола;
- запрос города для semantic selection;
- длинный тест личности;
- нумерологию;
- зодиак;
- secondary recommendation;
- 2+ товаров на result;
- catalogue carousel после recommendation result;
- автоматический upsell внутри semantic result;
- скрытый fallback по наличию;
- уход в Telegram.

## 15. Canonical acceptance cases

Bot и Mini App должны выдавать одинаковый semantic result для одинаковых input + marketplace.

```text
25.03.1993 + male + ozon → Лиса / Чернобог
25.03.1993 + female + ozon → Лиса / Мара
16.01.1986 + male + ozon → Медведь / Печать Велеса
16.01.1990 + female + wildberries → Медведь / Печать Велеса
19.07.1988 + male → Орёл / Перун
19.07.1988 + female → Орёл / Звезда Лады
15.03.1988 + male → Волк / Велес
15.03.1988 + female → Волк / Велес
13.08.1988 + male → Раса / Даждьбог
13.08.1988 + female → Раса / Даждьбог
```

Для всех cases с указанным годом customer-facing copy сохраняет полную дату.

Дополнительный marketplace override case:

```text
Ворон + male + ozon → Колядник
Ворон + male + wildberries → Алатырь
```

## 16. Acceptance markers

```text
VK_V2_SINGLE_RESULT_PASS
VK_BOT_DATE_PARSE_PASS
VK_BOT_STATE_MACHINE_PASS
VK_BOT_RECOMMENDATION_PARITY_PASS
VK_BOT_EVENT_DEDUP_PASS
VK_FULL_DOB_PRESERVATION_PASS
VK_NO_SECONDARY_RECOMMENDATION_PASS
VK_MINIAPP_RECOMMENDATION_PARITY_PASS
```

## 17. M5 standalone product-action freeze (2026-08-30)

Authority: `VK_PLATFORM_M5_OWNER_POLICY_FREEZE_2026-08-30.md`. M5 resolves one
semantic result with `marketplace = null`. Result offers `Посмотреть оберег`
and `Подобрать снова`; the first opens a separate Product-action screen with
the same product's links in order **VK → Ozon → Wildberries**. Frontend owns no
link registry and does not re-resolve or select a marketplace-specific product.

A Wildberries click after marketplace-neutral Voron/male does not activate the
`kolyadnik → alatyr` override. Missing links hide only that destination; if all
are unavailable, retain result, show neutral temporary-unavailability copy, and
retain restart. No catalogue, secondary result, or semantic fallback.
