# Roadmap — VK recommendation system

Версия: 0.1  
Статус: proposed implementation roadmap  
Бренд: «Кровь и Песок»

## 1. Цель roadmap

Довести текущую продуктовую матрицу до production-системы внутри VK без потери детерминизма и без преждевременного усложнения.

Стратегия реализации:

> Сначала доказать correctness recommendation core, затем запустить простой VK-бот как MVP, после этого построить Mini App поверх уже проверенного API и объединить оба канала.

Не начинать с красивого Mini App до появления протестированного core.

## 2. Milestone map

```text
M0  Domain freeze
 ↓
M1  Machine-readable recommendation core
 ↓
M2  Recommendation API + automated tests
 ↓
M3  VK Community Bot MVP
 ↓
M4  Product destinations + availability policy
 ↓
M5  VK Mini App MVP
 ↓
M6  Hybrid bot + Mini App integration
 ↓
M7  Analytics / operator / production hardening
 ↓
M8  Controlled launch and validation
```

## M0 — Domain freeze

### Цель

Не писать production-код поверх незафиксированной бизнес-логики.

### Работы

1. Финально просмотреть `RECOMMENDATION_MATRIX.md`.
2. Финально просмотреть `PRODUCT_CLASSIFICATION.md`.
3. Подтвердить `KIP_CHERTOG_CALENDAR_V1`.
4. Подтвердить hard rule `1 result default / max 2`.
5. Подтвердить `Медвежья лапа != Волк`.
6. Проверить реальные Ozon product_id/SKU всех **используемых** в matrix recommendation identities.
7. Зафиксировать client display names.
8. Отдельно отметить строки с `CURATED_*`, чтобы не выдавать их за прямые исторические соответствия.

### Gate M0

```text
DOMAIN_MATRIX_FREEZE_PASS
```

Критерий:

- 32 primary-cases утверждены;
- один approved secondary-case утверждён;
- нет спорных SKU identity.

## M1 — Machine-readable Recommendation Core

### Цель

Перевести Markdown-решения в исполняемые versioned data contracts.

### Создать

```text
recommendations/data/chertog_calendar.v1.json
recommendations/data/product_policy.v1.json
recommendations/data/recommendation_matrix.v1.json
recommendations/data/reason_copy.v1.json
```

И package:

```text
packages/recommendation-core/
```

### Core functions

Минимум:

```text
validateBirthDate(day, month)
resolveChertog(day, month)
resolveRecommendation(day, month, gender)
validateConfiguration()
```

### Tests

Обязательные группы:

1. все 16 диапазонов;
2. все граничные даты;
3. 29.02;
4. все 32 `chertog × gender` primary cases;
5. `medved + male` → ровно 2;
6. все остальные → ровно 1;
7. `volk` → никогда `bear_paw`;
8. gender hard filters;
9. duplicate/gap/overlap config failures.

### Gate M1

```text
RECOMMENDATION_CORE_CONTRACT_PASS
RECOMMENDATION_MATRIX_32_CASES_PASS
RECOMMENDATION_MAX_TWO_PASS
CHERTOG_BOUNDARIES_PASS
```

Нельзя двигаться к VK до полного PASS.

## M2 — Recommendation API

### Цель

Сделать один backend contract для бота и Mini App.

### Реализовать

```text
POST /v1/recommendations/resolve
GET  /healthz
GET  /readyz
```

Опционально internal diagnostic:

```text
GET /internal/config/version
```

Production endpoint не должен отдавать весь content matrix публично без необходимости.

### Требования

- input validation;
- typed response;
- version metadata;
- stable error codes;
- request/result correlation id;
- structured logs;
- channel не влияет на recommendation result.

### Differential tests

Один и тот же case вызывается:

1. напрямую через core;
2. через HTTP API.

Результат semantic fields должен совпадать.

### Gate M2

```text
RECOMMENDATION_API_PARITY_PASS
RECOMMENDATION_API_ERROR_CONTRACT_PASS
```

## M3 — VK Community Bot MVP

### Цель

Как можно быстрее проверить реальное пользовательское поведение внутри VK без разработки полноценного Mini App.

### Перед coding

Проверить актуальный VK transport и выбрать один production-механизм получения событий сообщества.

Решение должно быть зафиксировано коротким ADR перед implementation.

### Bot flow

```text
START
→ WAITING_DATE
→ WAITING_GENDER
→ RESOLVED
```

### Функции

- стартовый сценарий;
- date parser;
- validation;
- gender buttons;
- вызов общего API;
- result renderer;
- `Подобрать снова`;
- `Написать продавцу` / operator handoff;
- dedup входных событий;
- session TTL;
- structured telemetry.

### Обязательный парсинг

```text
13.10
13.10.1976
13/10/1976
13-10-1976
```

### Не делать

- AI chat;
- свободное определение пола;
- несколько рекомендаций «на всякий случай»;
- Telegram redirect.

### Gate M3

```text
VK_BOT_DATE_PARSE_PASS
VK_BOT_STATE_MACHINE_PASS
VK_BOT_RECOMMENDATION_PARITY_PASS
VK_BOT_EVENT_DEDUP_PASS
VK_BOT_MAX_TWO_PASS
```

### Первый реальный validation

После запуска на ограниченной аудитории собрать:

- started;
- date valid;
- gender selected;
- result shown;
- repeat selection;
- handoff.

На этом этапе не менять semantic matrix автоматически по конверсии.

## M4 — Product destinations и availability

### Цель

После рекомендации дать человеку полезное действие, не смешав покупку с semantic selection.

### Product mapping

Для используемых identity собрать:

```text
product_key
product_id
sku
VK destination (если есть)
Ozon destination
availability source/status
```

### Availability V1

Реализовать только overlay:

```text
AVAILABLE
UNAVAILABLE
UNKNOWN
```

Никакого auto-rerank.

### UX

Если `UNAVAILABLE`:

- сохранить исходную рекомендацию;
- показать unavailable state;
- предложить написать продавцу.

### Future option

Только после отдельного решения можно добавить:

```text
KIP_AVAILABILITY_FALLBACK_V1
```

Это должна быть отдельная матрица, а не эвристика.

### Gate M4

```text
PRODUCT_DESTINATION_MAPPING_PASS
AVAILABILITY_DOES_NOT_RERANK_PASS
```

## M5 — VK Mini App MVP

### Цель

Сделать основной визуальный канал подбора внутри VK.

### Экраны

1. Start;
2. Day/month;
3. Gender;
4. Result;
5. Product action;
6. Start over.

### Требования

- адаптивный мобильный layout;
- стилистика «Кровь и Песок»;
- доступность текста;
- loading/error states;
- нельзя вычислять independent recommendation на frontend;
- один API endpoint — источник результата.

### Result display

Default:

```text
1 product card
```

Medved + male:

```text
2 product cards
```

Никогда не показывать catalogue carousel после recommendation result в V1.

### Gate M5

```text
MINIAPP_CORE_FLOW_PASS
MINIAPP_API_PARITY_PASS
MINIAPP_MAX_TWO_PASS
MINIAPP_ERROR_STATE_PASS
```

## M6 — Hybrid integration

### Цель

Bot и Mini App становятся двумя входами в один продукт, а не двумя отдельными сервисами.

### Реализовать

1. Bot CTA `Открыть подбор` → Mini App, если это полезно для конкретного сценария.
2. Mini App → сообщения сообщества для handoff/save result, если выбранный VK-механизм это поддерживает.
3. Общий `result_id`/version metadata.
4. Одинаковые product destinations.
5. Cross-channel analytics.

### Паритет

Для набора canonical cases Bot и Mini App должны показывать один и тот же:

```text
chertog
product_key(s)
rank(s)
relation_type(s)
```

Copy может отличаться по длине, semantic result — нет.

### Gate M6

```text
VK_HYBRID_RESULT_PARITY_PASS
VK_HYBRID_DESTINATION_PARITY_PASS
```

## M7 — Production hardening

### Security

- secrets вне repo;
- VK event validation;
- Mini App launch/auth validation;
- rate limits;
- input limits;
- idempotency;
- CORS/CSP;
- dependency audit.

### Reliability

- health/readiness;
- graceful restart;
- retries только там, где безопасны;
- dead-letter/error visibility для inbound events;
- no duplicate user replies;
- rollback configuration.

### Observability

Минимальные dashboards/log queries:

```text
resolve success/error rate
bot inbound errors
result distribution by chertog
flow completion
product action CTR
unavailable rate
human handoff rate
```

Важно: distribution по Чертогам используется для мониторинга, а не для автоматической перекройки recommendation matrix.

### Gate M7

```text
PRODUCTION_SECURITY_PASS
PRODUCTION_RELIABILITY_PASS
OBSERVABILITY_BASELINE_PASS
```

## M8 — Controlled launch

### Этап 1

Только сообщения сообщества / ограниченный bot CTA.

Проверить:

- люди понимают запрос даты;
- пол выбирается без путаницы;
- result copy не вызывает массовых уточнений;
- нет случаев >2;
- нет неправильных boundary results.

### Этап 2

Подключить Mini App как основной CTA сообщества.

### Этап 3

Подключить внешние входы:

- рекламные материалы;
- QR;
- карточки/контент;
- сайт при необходимости.

### Launch gate

```text
CONTROLLED_LAUNCH_PASS
```

После этого система считается V1 production-ready.

## 3. Что сознательно отложено после V1

### V1.1 candidate

- approved availability fallback;
- сохранение результата;
- более полные product cards;
- редактор copy без deploy;
- admin preview всех 32 cases.

### V1.2 candidate

- внутренний инструмент для менеджера: ввести дату → получить готовый нейтральный ответ для ручной отправки;
- экспорт recommendation analytics;
- A/B тест **формулировок**, но не semantic recommendation.

### V2 candidate

Только после отдельного продуктового решения:

- дополнительные вопросы о цели;
- новые типы рекомендаций;
- другие продуктовые семьи.

Ни одно расширение V2 не должно незаметно менять V1 semantics.

## 4. Очерёдность разработки

Приоритет:

```text
P0: M0 → M1 → M2
P1: M3
P1: M4
P1: M5
P1: M6
P0 before public launch: M7
P0: M8 controlled launch
```

Bot идёт раньше Mini App намеренно: так быстрее выявляются ошибки матрицы, текста, ввода дат и реального поведения клиентов.

## 5. Definition of Done V1

V1 считается завершённой только если одновременно выполнено:

- machine-readable config существует и валидируется;
- 32 primary cases покрыты автотестами;
- max-two invariant покрыт автотестом;
- Bot работает внутри VK;
- Mini App работает внутри VK;
- оба используют один API/core;
- Telegram не требуется для подбора;
- availability не меняет semantic result;
- product destinations настроены;
- операторский handoff определён;
- analytics показывает полную воронку;
- production security/reliability gates пройдены.

## 6. Ближайший следующий execution step

Не начинать с интерфейса.

Следующий технический шаг после утверждения roadmap:

```text
M1.1 — создать JSON schemas и четыре versioned data-файла
M1.2 — реализовать validateConfiguration()
M1.3 — реализовать resolveChertog()
M1.4 — реализовать resolveRecommendation()
M1.5 — прогнать canonical 32-case test suite
```

После `RECOMMENDATION_CORE_CONTRACT_PASS` переходить к API и VK-боту.
