# Архитектура системы рекомендаций

Версия: 0.2  
Статус: **V2 SALES-WEIGHTED architecture authority**  
Бренд: «Кровь и Песок»

Current matrix: `KIP_RECOMMENDATION_MATRIX_V2_SALES_WEIGHTED`  
Current product policy: `KIP_PRODUCT_POLICY_V2_SALES_WEIGHTED`  
Calendar: `KIP_CHERTOG_CALENDAR_V1`  
Marketplace override: `KIP_MARKETPLACE_OVERRIDE_V1`

## 1. Цель

Построить один deterministic Recommendation Core для подбора славянского оберега по:

- дню рождения;
- месяцу рождения;
- полу;
- целевому marketplace, если он известен.

Результат должен быть воспроизводимым, versioned и одинаковым для любого UI при одинаковых входах.

V2 отличается от V1: коммерческие данные теперь используются **офлайн при утверждении конфигурации** как сильный фактор выбора среди семантически допустимых товаров. Runtime не должен сам ходить за продажами и динамически менять результат.

## 2. Главная модель

```text
sales evidence + semantic review + owner decisions
                    │
                    ▼
        versioned V2 configuration
                    │
                    ▼
          Recommendation Core
                    │
       ┌────────────┴─────────────┐
       │                          │
 marketplace/UI adapters    internal tools
       │
 Ozon / Wildberries / VK / Telegram / other
```

Ключевой принцип:

> Продажи влияют на **утверждение versioned matrix**, но не являются live runtime input.

Это позволяет одновременно:

- использовать реальные seller sales для коммерчески жизнеспособной матрицы;
- не делать результат случайным из-за дневных колебаний;
- сохранять reproducibility и auditability.

## 3. Recommendation Core

Core принимает нормализованный input:

```text
birth_day
birth_month
gender
marketplace
```

и выполняет:

1. `validateBirthDate()`;
2. `resolveChertog()` по `KIP_CHERTOG_CALENDAR_V1`;
3. `resolveBaseRecommendation()` по `KIP_RECOMMENDATION_MATRIX_V2_SALES_WEIGHTED`;
4. `applyMarketplaceOverride()` по `KIP_MARKETPLACE_OVERRIDE_V1`;
5. `validateProductPolicy()` по `KIP_PRODUCT_POLICY_V2_SALES_WEIGHTED`;
6. вернуть **ровно один** effective product.

Core не должен:

- вызывать LLM;
- искать трактовки в интернете;
- читать live sales;
- читать live stock для пересчёта матрицы;
- выбирать новый похожий SKU на лету;
- подмешивать reserve products;
- выдавать второй товар.

## 4. Sales-weighted policy

Коммерческая оптимизация происходит до runtime в процессе пересборки матрицы.

Evidence 2026-08-28:

- Wildberries: actual bought units, `2026-01-01 — 2026-08-28`;
- Ozon: `analytics_data`, `ordered_units`, SKU dimension, `2026-06-01 — 2026-08-28`.

Полный audit: `SALES_WEIGHTED_MATRIX_V2_AUDIT_2026-08-28.md`.

Approval sequence:

```text
candidate products
   ↓
remove clearly unrelated / visually contradictory
   ↓
compare remaining semantic candidates
   ↓
strongly weight actual sales
   ↓
owner approval
   ↓
new versioned matrix
```

Live popularity is therefore **not** an API parameter.

## 5. Marketplace-aware result

V1 architecture treated channel/marketplace as irrelevant to semantic output. V2 allows explicit marketplace overrides because sales and practical assortment differ.

Current approved override:

```text
Ворон + male:
  Ozon        → Колядник
  Wildberries → Алатырь
```

All other V2 rows currently produce the same product on Ozon and Wildberries.

`channel` and `marketplace` are different:

- `channel` = UI/transport (`vk_bot`, `telegram`, etc.); does not change result;
- `marketplace` = requested commerce destination (`ozon`, `wildberries`); may apply an explicit versioned override.

## 6. Product policy

`PRODUCT_CLASSIFICATION.md` is the human-readable authority for current product roles and gender policy.

Critical V2 invariants:

```text
Даждьбог → only Раса male + female
Печать Велеса / Медвежья лапа → only Медведь male + female
Печать Велеса / Медвежья лапа → Волк FORBIDDEN
Волк → Велес
Сварог → male only in V2
secondary recommendation → forbidden
```

The marketplace card `Печать Велеса` is the **bear-paw visual form**. Stable internal recommendation identity may remain `Медвежья лапа` for destination compatibility, while customer-facing label is:

```text
Печать Велеса — Медвежья лапа
```

## 7. Configuration Registry

Target machine-readable structure:

```text
recommendations/
  data/
    chertog_calendar.v1.json
    product_policy.v2.json
    recommendation_matrix.v2.json
    marketplace_overrides.v1.json
    reason_copy.v2.json
```

Required versions:

```text
calendar_version = KIP_CHERTOG_CALENDAR_V1
product_policy_version = KIP_PRODUCT_POLICY_V2_SALES_WEIGHTED
matrix_version = KIP_RECOMMENDATION_MATRIX_V2_SALES_WEIGHTED
marketplace_override_version = KIP_MARKETPLACE_OVERRIDE_V1
copy_version = KIP_REASON_COPY_V2_SALES_WEIGHTED
```

Markdown remains the owner-readable specification; runtime should eventually consume validated machine-readable equivalents.

## 8. Configuration validation

Startup/CI must fail if:

1. calendar has gaps/overlaps;
2. any of 32 base `Chertog × gender` rows is missing;
3. a base case returns more than one product;
4. unknown product key is referenced;
5. gender policy conflicts with a row;
6. `bear_paw` appears outside `medved`;
7. `bear_paw` appears in `volk`;
8. Даждьбог appears outside Раса or not exactly twice in base rows;
9. Сварог appears in a female V2 row;
10. reserve product appears without active V2 classification;
11. marketplace override references an unapproved marketplace/chertog/gender tuple;
12. duplicate effective rows exist.

## 9. Recommendation API

Canonical endpoint remains:

```text
POST /v1/recommendations/resolve
```

V2 request includes marketplace:

```json
{
  "birth_day": 8,
  "birth_month": 11,
  "gender": "male",
  "marketplace": "wildberries",
  "channel": "telegram"
}
```

`marketplace` is a domain input because it can select a versioned override. `channel` is telemetry/UI only.

The response returns one recommendation and all configuration versions used.

Detailed contract: `DATA_API_CONTRACT.md`.

## 10. Availability and stock

Availability is still an overlay and must **not** silently change the V2 result.

```text
approved V2 recommendation
          ↓
marketplace destination lookup
          ↓
availability enrichment
          ↓
UI
```

Do not do at runtime:

```text
recommended SKU unavailable
→ choose another SKU because it has stock
```

Commercial changes belong in a reviewed V3/V2.x matrix rebuild, not ad-hoc runtime fallback.

Customer copy has an additional hard rule: the finished customer message must not announce absence of a product/card/link/stock. Operator handling stays internal.

## 11. Customer copy layer

Copy is separate from matrix selection.

The selection layer may know:

```text
selection_basis = SEMANTIC_CURATED_SALES_WEIGHTED
```

but the customer must receive only the positive semantic explanation:

```text
Чертог → темы → выбранный символ → почему смысл подходит
```

Never expose:

- sales figures;
- rank;
- seller analytics;
- weak sales of replaced products;
- internal fallback/substitution language;
- availability absence.

Current copy authority: `CUSTOMER_RECOMMENDATION_COPY_GUIDE.md`.

## 12. Interfaces

Any UI — VK Bot, VK Mini App, Telegram operator, marketplace-question worker or future frontend — must call the same core or reproduce the exact same versioned contract.

No adapter may maintain its own independent Chertog/product table.

If marketplace is unknown, a product flow may either:

- resolve the base matrix result and omit destination;
- or ask for marketplace when a marketplace-specific link/result is needed.

It must never guess a marketplace based on user profile or location.

## 13. Analytics

Runtime analytics may record:

```text
channel
marketplace
chertog_id
gender
product_key
relation_type
selection_basis
calendar_version
matrix_version
product_policy_version
marketplace_override_version
```

Do not log unnecessary personal data or full birth year.

Analytics may inform a **future reviewed matrix version**, but cannot mutate current V2 behavior automatically.

## 14. Security / determinism

- no user-controlled arbitrary product key;
- no endpoint such as `recommend_product=<anything>`;
- marketplace must be from an allowlist;
- matrix/product policy is immutable for one deployed version;
- configuration mismatch must fail closed;
- UI cannot override hard rules such as bear-paw outside Медведь.

## 15. Current owner-locked matrix highlights

```text
Медведь male   → Печать Велеса — Медвежья лапа
Медведь female → Печать Велеса — Медвежья лапа
Волк male      → Велес
Волк female    → Велес
Раса male      → Даждьбог
Раса female    → Даждьбог
```

Dazhdbog therefore has exactly two automatic gender rows.

## 16. Migration from V1

V1 architecture statements that are retired:

- “recommendation does not change because of sales” as a product-policy rule;
- channel-independent matrix without marketplace override;
- two-product Медведь male exception;
- male-only bear paw;
- Svarog as automatic Медведь result.

Replacement authority:

- `RECOMMENDATION_MATRIX.md`;
- `PRODUCT_CLASSIFICATION.md`;
- `SALES_WEIGHTED_MATRIX_V2_AUDIT_2026-08-28.md`;
- this architecture document.

Decision marker:

```text
KIP_RECOMMENDATION_ARCHITECTURE_V2_SALES_WEIGHTED
```
