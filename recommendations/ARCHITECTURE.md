# Архитектура системы рекомендаций во VK

Версия: 0.1  
Статус: проект архитектуры до начала реализации  
Бренд: «Кровь и Песок»

## 1. Цель архитектуры

Построить один детерминированный recommendation core для подбора славянского оберега по дню/месяцу рождения и полу, а поверх него дать клиенту два VK-интерфейса:

1. **VK Community Bot** — быстрый разговорный вход через сообщения сообщества;
2. **VK Mini App** — основной визуальный интерфейс подбора внутри VK.

Оба интерфейса обязаны использовать одну и ту же матрицу и один и тот же backend. Никакой отдельной логики подбора в боте или Mini App быть не должно.

Главный продуктовый принцип:

> Пользователь остаётся внутри VK на всём этапе подбора. Recommendation result не зависит от канала и не меняется из-за продаж, рекламы, остатков или поведения клиента.

## 2. Архитектурный вариант

Выбран гибрид:

```text
                    ┌───────────────────────────┐
                    │ Recommendation Core       │
                    │ deterministic / versioned │
                    └─────────────┬─────────────┘
                                  │
                      ┌───────────┴───────────┐
                      │                       │
              ┌───────▼───────┐       ┌──────▼─────────┐
              │ VK Bot Adapter│       │ Mini App API   │
              └───────┬───────┘       └──────┬─────────┘
                      │                       │
              VK Community Messages       VK Mini App
                      │                       │
                      └───────────┬───────────┘
                                  │
                            Клиент во VK
```

### Почему не только бот

Бот хорош как быстрый MVP и естественный вход из «Написать сообщение», но хуже подходит для визуальных карточек, выбора пола и аккуратного объяснения результата.

### Почему не только Mini App

Mini App даёт лучший UX, но сообщения сообщества всё равно нужны:

- пользователь может написать напрямую;
- через сообщения проще продолжить контакт;
- возможна передача менеджеру;
- Mini App может предлагать сохранить/получить результат в сообщениях.

### Итог

**Bot = conversational entry + fallback + handoff.**  
**Mini App = основной визуальный интерфейс.**  
**Recommendation Core = единственный источник решения.**

## 3. Компоненты

### 3.1. Recommendation Core

Чистая детерминированная библиотека без VK-зависимостей.

Ответственность:

1. принять `birth_day`, `birth_month`, `gender`;
2. валидировать дату;
3. определить Чертог по `KIP_CHERTOG_CALENDAR_V1`;
4. выбрать утверждённую строку `KIP_RECOMMENDATION_MATRIX_V1`;
5. применить product policy;
6. вернуть 1 результат, либо 2 только в разрешённом кейсе;
7. вернуть стабильные `relation_type` и `reason_code`;
8. вернуть версии календаря, матрицы и product policy.

Core не умеет:

- ходить в интернет;
- вызывать LLM;
- смотреть продажи;
- выбирать «похожий» SKU;
- менять результат по наличию;
- генерировать маркетинговый текст.

### 3.2. Configuration Registry

Runtime-источником должны стать **машиночитаемые versioned-файлы**, а Markdown остаётся документацией для человека.

Предлагаемая структура:

```text
recommendations/
  data/
    chertog_calendar.v1.json
    product_policy.v1.json
    recommendation_matrix.v1.json
    reason_copy.v1.json
```

Каждый файл проходит schema validation при старте приложения и в CI.

Если конфигурация невалидна, сервис не должен стартовать.

### 3.3. Recommendation API

Тонкий HTTP-слой поверх Recommendation Core.

Назначение:

- единый контракт для Bot Adapter и Mini App;
- аудит версий;
- централизованная обработка ошибок;
- telemetry;
- отсутствие дублирования domain logic.

Основной endpoint:

```text
POST /v1/recommendations/resolve
```

Подробный контракт фиксируется в `DATA_API_CONTRACT.md`.

### 3.4. VK Bot Adapter

Адаптер сообщений сообщества.

Ответственность:

- принять событие VK;
- проверить подлинность/секрет события согласно выбранному VK transport;
- разобрать пользовательский ввод;
- хранить минимальное состояние диалога;
- запросить пол кнопками, а не угадывать его;
- вызвать Recommendation API;
- отрендерить результат;
- дать команды `Подобрать снова` и `Связаться с продавцом`;
- передать диалог человеку при необходимости.

В Bot Adapter запрещено иметь собственную таблицу Чертогов.

### 3.5. VK Mini App

Основной визуальный UX.

Минимальные экраны:

1. старт;
2. выбор дня/месяца;
3. выбор `Мужчине / Женщине`;
4. результат;
5. карточка/действие по товару;
6. повторный подбор.

Mini App не вычисляет результат локально как источник истины. Он отправляет входы API и отображает ответ.

Локальный расчёт допускается только в будущем как offline-cache и обязан быть byte-for-byte эквивалентен backend core; для V1 не нужен.

### 3.6. Product Destination Adapter

Recommendation result и место покупки/просмотра — разные сущности.

Для каждой `recommendation_identity` можно хранить несколько destination:

```text
vk_market_item_id
vk_market_url
community_message_action
ozon_product_id
ozon_url
wb_product_id
wb_url
```

Приоритет V1:

1. внутренняя VK-карточка/действие, если реально настроено;
2. сообщение сообществу;
3. внешний marketplace link — только как явное действие пользователя и не как часть самого алгоритма подбора.

Это позволяет сохранить подбор внутри VK даже если checkout позднее ведёт на Ozon/WB.

## 4. Разделение semantic result и availability

Наличие товара **не меняет смысловую рекомендацию**.

Core сначала возвращает semantic result:

```text
13.08 + female
→ rasa
→ Даждьбог
```

После этого отдельный слой может приложить статус:

```text
availability = AVAILABLE | UNAVAILABLE | UNKNOWN
```

Если товар недоступен:

- исходная рекомендация сохраняется;
- другой товар автоматически не подставляется;
- UI показывает нейтральный unavailable state;
- клиенту можно дать `Написать продавцу`;
- будущий approved fallback допускается только отдельной versioned policy.

Запрещено:

```text
Даждьбог отсутствует
→ взять самый продаваемый Алатырь
```

## 5. Bot conversation state

Минимальный state machine:

```text
NEW
  ↓
WAITING_DATE
  ↓
WAITING_GENDER
  ↓
RESOLVED
  ├── START_OVER → WAITING_DATE
  └── HUMAN_HANDOFF
```

### Дата

Бот должен понимать как минимум:

```text
13.10
13.10.1976
13/10
13/10/1976
13-10
13-10-1976
```

Если передан год, он может быть использован только для парсинга корректности полной даты и после этого **не участвует в рекомендации**.

Сохранять год без отдельной необходимости не следует.

### Пол

Пол выбирается явной кнопкой:

```text
Мужчине
Женщине
```

Нельзя определять его по имени, профилю, аватару или текстовой догадке.

## 6. Session storage

Recommendation Core stateless.

Состояние требуется только Bot Adapter.

Минимальная модель:

```text
vk_peer_id
state
birth_day
birth_month
gender
last_matrix_version
updated_at
expires_at
```

Рекомендуемый TTL незавершённой сессии: 24 часа.

После завершения подбора персональные вводы не нужны для работы алгоритма. Для аналитики лучше хранить агрегированные/псевдонимизированные события, а не полную дату рождения.

## 7. Analytics

Recommendation result нельзя оптимизировать по коммерческим данным, но поведение воронки измерять нужно.

События V1:

```text
recommendation_flow_started
birthdate_submitted
gender_selected
recommendation_resolved
recommendation_result_shown
product_action_clicked
start_over_clicked
human_handoff_requested
validation_error
product_unavailable_shown
```

К событию `recommendation_resolved` логируются:

```text
channel
chertog_id
gender
product_identity[]
relation_type[]
calendar_version
matrix_version
product_policy_version
```

Не нужно логировать полный год рождения.

## 8. Copy layer

Формулировка ответа отделяется от recommendation matrix.

Матрица хранит:

```text
reason_code = PATRON_EXACT
```

Copy layer превращает его в утверждённый текст.

Это позволяет переписать:

```text
«Эта дата относится к Чертогу...»
```

без изменения алгоритма и версии результата.

В V1 LLM для клиентских ответов не используется: тексты должны быть шаблонными и предсказуемыми.

## 9. Error model

Минимальные коды:

```text
INVALID_DATE
INVALID_GENDER
NO_CHERTOG_MATCH
MATRIX_ENTRY_MISSING
PRODUCT_POLICY_MISSING
RESULT_PRODUCT_UNAVAILABLE
CONFIG_VERSION_MISMATCH
INTERNAL_ERROR
```

`NO_CHERTOG_MATCH`, `MATRIX_ENTRY_MISSING` и `PRODUCT_POLICY_MISSING` считаются ошибками конфигурации и должны быть невозможны после CI validation.

## 10. Security boundaries

### Bot

- принимать только корректные события VK;
- секреты не хранить в репозитории;
- idempotency/deduplication по event id;
- rate limit на peer/user;
- не исполнять HTML/команды из пользовательского текста.

### Mini App

- backend не доверяет произвольному `vk_user_id` из JSON body;
- пользовательский контекст подтверждается launch/auth данными VK согласно актуальному выбранному механизму интеграции;
- CORS ограничивается production origin;
- CSP и безопасная работа с внешними ссылками.

### Domain

Даже полностью скомпрометированный UI не должен иметь endpoint вида `recommend_product=<любое значение>`; результат вычисляет backend по матрице.

## 11. Deployment units

Для V1 достаточно двух deployable units:

```text
1. recommendation-backend
   - Recommendation Core
   - Recommendation API
   - VK Bot Adapter
   - session store adapter

2. vk-mini-app
   - frontend
```

Bot и API сознательно объединены в один backend на старте: домен маленький, отдельный microservice для бота не даёт пользы.

При росте нагрузки adapter можно отделить без изменения Core/API contract.

## 12. Рекомендуемый стек

Это reference stack, а не неизменяемое бизнес-правило:

### Backend

```text
Node.js LTS
TypeScript
Fastify или эквивалентный минимальный HTTP framework
Zod / JSON Schema для конфигурации и API contracts
Vitest/Jest для domain tests
```

### Mini App

```text
TypeScript
React
VKUI
VK Bridge
Vite
```

### Session / persistence

MVP:

```text
PostgreSQL либо совместимое простое persistent storage
```

Если бот запускается в одном экземпляре, возможен более простой storage adapter, но domain contract не должен зависеть от конкретной БД.

## 13. Repository layout для реализации

Предлагаемая структура:

```text
recommendations/
  README.md
  RECOMMENDATION_SYSTEM_TZ.md
  RECOMMENDATION_MATRIX.md
  PRODUCT_CLASSIFICATION.md
  ARCHITECTURE.md
  DATA_API_CONTRACT.md
  VK_UX_FLOW.md
  ROADMAP.md
  data/
    chertog_calendar.v1.json
    product_policy.v1.json
    recommendation_matrix.v1.json
    reason_copy.v1.json

apps/
  vk-recommendation-backend/
  vk-recommendation-miniapp/

packages/
  recommendation-core/
  recommendation-contracts/
```

Если позднее будет принято решение держать весь VK-проект внутри `recommendations/`, roadmap может адаптировать layout. Важнее сохранить границу `core / adapters / UI`.

## 14. Основные инварианты

1. Один input при одной версии матрицы всегда даёт один и тот же semantic result.
2. Bot и Mini App дают одинаковый результат.
3. Клиент видит максимум два товара.
4. Наличие не меняет semantic result.
5. Popularity не меняет semantic result.
6. LLM не участвует в выборе.
7. UI не содержит независимую матрицу.
8. Marketplace name не переопределяет recommendation identity.
9. `Печать Велеса` в recommendation domain = `Медвежья лапа`.
10. `Волк` никогда не получает `Медвежью лапу` в V1.
11. Любое изменение результата требует новой версии конфигурации.

## 15. Что нужно утвердить до coding milestone

Перед написанием production-кода должны быть завершены:

1. machine-readable JSON-конфиги V1;
2. JSON/API schema;
3. unavailable UX;
4. карта destination для используемых recommendation identities;
5. точные client copy templates;
6. Bot transport choice (Callback API или иной актуальный VK-механизм) после технической проверки;
7. Mini App registration/deployment details;
8. roadmap и acceptance gates.
