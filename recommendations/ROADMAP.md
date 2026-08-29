# Roadmap — VK recommendation system

Версия: 0.2  
Статус: **V2 SALES-WEIGHTED implementation roadmap**  
Бренд: «Кровь и Песок»

Current matrix: `KIP_RECOMMENDATION_MATRIX_V2_SALES_WEIGHTED`  
Current product policy: `KIP_PRODUCT_POLICY_V2_SALES_WEIGHTED`  
Calendar: `KIP_CHERTOG_CALENDAR_V1`  
Marketplace override: `KIP_MARKETPLACE_OVERRIDE_V1`

## 1. Цель roadmap

Довести текущую owner-approved V2 recommendation authority до production-системы внутри VK без отдельной логики в Bot/Mini App и без возврата к superseded V1 semantics.

Стратегия:

```text
V2 authority
→ machine-readable configuration
→ deterministic Recommendation Core
→ Recommendation API
→ VK Community Bot MVP
→ product destinations / availability overlay
→ VK Mini App
→ shared analytics / operator handoff
→ production hardening
→ controlled launch
```

Bot и Mini App должны быть двумя UI-каналами одного core/API.

## 2. Current authority freeze

До разработки использовать current source-of-truth в таком порядке:

1. `RECOMMENDATION_MATRIX.md`;
2. `PRODUCT_CLASSIFICATION.md`;
3. `CUSTOMER_RECOMMENDATION_COPY_GUIDE.md`;
4. `DATA_API_CONTRACT.md`;
5. `ARCHITECTURE.md`;
6. `VK_UX_FLOW.md` — channel UX only.

Historical docs:

- `RECOMMENDATION_SYSTEM_TZ.md`;
- `M0_DOMAIN_FREEZE_AUDIT.md`;
- старые V1 implementation prompts

не могут переопределять V2.

Current semantic invariants:

```text
exactly 32 base cases = 16 chertogs × 2 genders
exactly 1 active base recommendation per case
secondary recommendation = forbidden

Медведь male/female → Печать Велеса
Волк male/female → Велес
Лиса male → Чернобог
Лиса female → Мара
Орёл male → Перун
Орёл female → Звезда Лады
Раса male/female → Даждьбог
```

Current marketplace override:

```text
Ворон + male:
Ozon        → Колядник
Wildberries → Алатырь
```

Full DOB rule:

```text
если пользователь указал DD.MM.YYYY
→ год не влияет на selection
→ customer-facing copy сохраняет DD.MM.YYYY полностью
```

## 3. Milestone map

```text
M0  V2 domain authority freeze
 ↓
M1  Machine-readable V2 configuration + Recommendation Core
 ↓
M2  Recommendation API
 ↓
M3  VK Community Bot MVP
 ↓
M4  Product destinations + availability overlay
 ↓
M5  VK Mini App MVP
 ↓
M6  Bot/Mini App hybrid integration
 ↓
M7  Analytics / operator / production hardening
 ↓
M8  Controlled launch
```

## M0 — V2 domain authority freeze

### Статус

Markdown authority сформирована и является входом для разработки.

### Gate перед M1

Проверить, что current docs согласованы минимум по следующим правилам:

- 16 Chertogs, calendar V1;
- 32 base cases;
- одна recommendation на case;
- no secondary;
- current gender policies;
- current marketplace override;
- `Печать Велеса` customer label exact;
- supplied year preserved for copy;
- Chertog-first customer copy.

Gate:

```text
VK_V2_DOMAIN_AUTHORITY_PASS
```

## M1 — Machine-readable V2 configuration + Recommendation Core

### M1.1 — Versioned configuration

Создать:

```text
recommendations/schemas/chertog_calendar.v1.schema.json
recommendations/schemas/product_policy.v2.schema.json
recommendations/schemas/recommendation_matrix.v2.schema.json
recommendations/schemas/marketplace_overrides.v1.schema.json
recommendations/schemas/reason_copy.v2.schema.json

recommendations/data/chertog_calendar.v1.json
recommendations/data/product_policy.v2.json
recommendations/data/recommendation_matrix.v2.json
recommendations/data/marketplace_overrides.v1.json
recommendations/data/reason_copy.v2.json
```

Data files must encode current authority, not historical V1.

Hard invariants:

- exactly 16 Chertogs;
- exactly 32 base matrix rows;
- exactly one active recommendation per `chertog + gender`;
- no rank-2/secondary recommendation;
- `bear_paw`/technical legacy key, if retained internally, renders only as `Печать Велеса` and is allowed only for Медведь;
- Волк never receives `Печать Велеса`;
- Орёл never receives `Печать Велеса`;
- Даждьбог automatic base use only for Раса;
- Сварог male-only;
- Чернобог male-only;
- Мара female-only;
- Звезда Лады female-only;
- marketplace override is explicit/versioned only;
- reason copy does not redefine semantic selection.

### M1.2 — Configuration validator

Implement startup/CI configuration validation for current `DATA_API_CONTRACT.md` gates.

At minimum fail on:

- calendar gap/overlap;
- missing/duplicate base case;
- more than one product per base case;
- invalid product key;
- gender-policy conflict;
- forbidden Chertog/product pair;
- wrong customer label for `Печать Велеса`;
- invalid marketplace override;
- missing reason code referenced by matrix/override;
- automatic reserve/secondary appearance.

### M1.3 — Core

Implement deterministic functions equivalent to:

```text
validateBirthDate(day, month, year?)
resolveChertog(day, month)
resolveRecommendation(day, month, gender, marketplace?)
renderBirthDateContext(day, month, year?)
```

Core must not call LLM or marketplace APIs.

Year is display/audit context only.

### M1 tests

Mandatory:

- all 16 ranges;
- all boundary dates;
- 29.02 → Волк;
- all 32 `chertog × gender` base cases;
- every base case returns exactly one product;
- no secondary recommendation anywhere;
- full DOB preserved when supplied;
- same day/month + different years => same semantic result;
- current special cases;
- marketplace override only when explicit marketplace is supplied;
- no hidden fallback.

Gate:

```text
RECOMMENDATION_V2_CONFIG_PASS
RECOMMENDATION_CORE_CONTRACT_PASS
RECOMMENDATION_MATRIX_32_CASES_PASS
RECOMMENDATION_SINGLE_RESULT_PASS
FULL_DOB_PRESERVATION_PASS
```

VK integration cannot start before M1 PASS.

## M2 — Recommendation API

### Цель

Один backend contract для Bot и Mini App.

Implement:

```text
POST /v1/recommendations/resolve
GET  /healthz
GET  /readyz
```

Optional internal diagnostic:

```text
GET /internal/config/version
```

Requirements:

- typed request/response;
- stable validation errors;
- version metadata;
- correlation/result id;
- structured logs;
- optional `birth_year` preserved;
- optional marketplace applied only via versioned override;
- channel does not alter semantic result.

Differential tests:

```text
core(input) == API(input).semantic_result
```

Gate:

```text
RECOMMENDATION_API_PARITY_PASS
RECOMMENDATION_API_ERROR_CONTRACT_PASS
```

## M3 — VK Community Bot MVP

### Цель

Проверить реальный consumer flow внутри VK до Mini App.

### Перед implementation

Проверить current VK transport/API and зафиксировать короткий ADR:

- event transport;
- community auth/secret handling;
- event validation;
- send-message API;
- button/keyboard mechanism;
- retry/idempotency constraints.

Не выбирать transport по старым docs без актуальной проверки.

### State flow

```text
START
→ WAITING_DATE
→ WAITING_GENDER
→ RESOLVED
```

Optional:

```text
RESOLVED → HUMAN_HANDOFF
```

### Bot functions

- start flow;
- date parser;
- validation;
- preserve supplied year;
- gender buttons;
- call shared API/core;
- current customer-copy renderer;
- product action;
- `Подобрать снова`;
- optional human handoff;
- event dedup;
- session TTL;
- structured telemetry.

Supported date forms at minimum:

```text
13.10
13.10.1976
13/10
13/10/1976
13-10
13-10-1976
```

### Bot result rules

- exactly one product;
- first explain date/Chertog/themes;
- recommendation follows separately;
- if year supplied, keep full date;
- no internal keys/selection enums;
- no sales language;
- no AI semantic selection;
- no Telegram redirect.

Gate:

```text
VK_BOT_DATE_PARSE_PASS
VK_BOT_STATE_MACHINE_PASS
VK_BOT_RECOMMENDATION_PARITY_PASS
VK_BOT_EVENT_DEDUP_PASS
VK_BOT_SINGLE_RESULT_PASS
VK_BOT_FULL_DOB_PASS
```

## M4 — Product destinations + availability overlay

### Цель

После semantic recommendation дать полезное действие, не меняя recommendation.

Mapping:

```text
product_key
marketplace / destination context
product_id / SKU when verified
VK destination if available
Ozon/Wildberries destination if product UX requires it
availability status/source
```

Availability V1:

```text
AVAILABLE
UNAVAILABLE
UNKNOWN
```

Availability never reranks or substitutes.

No automatic fallback.

Gate:

```text
PRODUCT_DESTINATION_MAPPING_PASS
AVAILABILITY_DOES_NOT_RERANK_PASS
```

## M5 — VK Mini App MVP

### Цель

Визуальный flow поверх того же API.

Screens:

1. Start;
2. Date;
3. Gender;
4. Result;
5. Product action;
6. Start over.

Hard rules:

- frontend never computes an independent recommendation;
- exactly one recommendation card;
- same current copy semantics;
- loading/error states;
- mobile-first responsive layout;
- no catalogue carousel in recommendation result;
- no secondary recommendation.

Gate:

```text
MINIAPP_CORE_FLOW_PASS
MINIAPP_API_PARITY_PASS
MINIAPP_SINGLE_RESULT_PASS
MINIAPP_ERROR_STATE_PASS
```

## M6 — Hybrid Bot + Mini App integration

Bot and Mini App become two entry points into one product.

Implement as useful:

- Bot → Mini App CTA;
- Mini App → community messages/handoff;
- shared result/session correlation;
- same product destination mapping;
- cross-channel analytics.

Semantic parity set must match on:

```text
birth_date context
chertog
product_key
customer_label
marketplace override result
```

Gate:

```text
VK_HYBRID_RESULT_PARITY_PASS
VK_HYBRID_DESTINATION_PARITY_PASS
```

## M7 — Production hardening

### Security

- secrets outside repo;
- VK event validation;
- Mini App launch/auth validation;
- rate/input limits;
- idempotency;
- CORS/CSP where applicable;
- dependency audit.

### Reliability

- health/readiness;
- graceful restart;
- safe retries only;
- inbound error visibility;
- no duplicate user replies;
- rollback configuration.

### Observability

At minimum:

```text
resolve success/error rate
bot inbound errors
result distribution by chertog
flow completion
product action CTR
unavailable rate
human handoff rate
```

Analytics never rewrites matrix automatically.

Gate:

```text
PRODUCTION_SECURITY_PASS
PRODUCTION_RELIABILITY_PASS
OBSERVABILITY_BASELINE_PASS
```

## M8 — Controlled launch

### Stage 1

Community messages / limited Bot CTA.

Validate:

- users understand date request;
- date parser behaves correctly;
- gender selection is clear;
- copy is understandable;
- no duplicate replies;
- all results are single-product;
- canonical boundary cases are correct.

### Stage 2

Add Mini App as primary/secondary community CTA based on observed flow completion.

### Stage 3

External entry points:

- ads;
- QR;
- product content;
- website when useful.

Launch gate:

```text
CONTROLLED_LAUNCH_PASS
```

## 4. Canonical V2 acceptance set

At minimum keep these cross-layer cases:

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

Marketplace override canonical case:

```text
Ворон + male + ozon → Колядник
Ворон + male + wildberries → Алатырь
```

## 5. Что сознательно отложено после V1 production

- availability fallback matrix;
- extra recommendation questions/goals;
- free-form AI recommendation chat;
- automatic semantic A/B testing;
- multi-product recommendations;
- catalogue upsell inside semantic result;
- admin editor that changes recommendation authority without versioned review.

A/B tests may later change wording/presentation only, not semantic recommendation without owner-approved version change.

## 6. Definition of Done V1 production

V1 production считается завершённой только если одновременно:

- V2 machine-readable config exists and validates;
- all 32 base cases pass;
- single-result invariant passes;
- Recommendation Core is deterministic;
- Recommendation API parity passes;
- VK Bot works inside community messages;
- VK Mini App uses the same API/core;
- full supplied DOB survives to customer copy;
- Telegram is not required for consumer recommendation;
- availability never changes semantic result;
- product destinations are configured where needed;
- operator handoff is defined;
- analytics covers the funnel;
- security/reliability gates pass;
- controlled launch passes.

## 7. Ближайший execution step

Начинать разработку с M1, не с VK UI.

First implementation sequence:

```text
M1.1 — V2 JSON schemas + versioned data files
M1.2 — validateConfiguration()
M1.3 — resolveChertog()
M1.4 — resolveRecommendation()
M1.5 — canonical 32-case + single-result + DOB tests
M2   — Recommendation API
M3   — VK Bot
```

После `RECOMMENDATION_CORE_CONTRACT_PASS` переходить к API/VK.
