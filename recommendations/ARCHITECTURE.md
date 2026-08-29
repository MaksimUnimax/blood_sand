# Архитектура системы рекомендаций

Версия: 0.2  
Статус: **V2 SALES-WEIGHTED architecture authority**  
Бренд: «Кровь и Песок»

Current matrix: `KIP_RECOMMENDATION_MATRIX_V2_SALES_WEIGHTED`  
Current product policy: `KIP_PRODUCT_POLICY_V2_SALES_WEIGHTED`  
Calendar: `KIP_CHERTOG_CALENDAR_V1`  
Marketplace override: `KIP_MARKETPLACE_OVERRIDE_V1`

## 1. Цель

Recommendation Core детерминированно выбирает один оберег по:

- дню;
- месяцу;
- полу;
- marketplace, если известен.

Год рождения не влияет на выбор Чертога, но если он указан покупателем, он должен пройти через pipeline как display/audit context и быть сохранён в customer-facing ответе.

Продажи используются офлайн при утверждении versioned matrix, но не являются live runtime input.

## 2. Pipeline

```text
sales evidence + semantic review + gender fit + owner decisions
                            │
                            ▼
                versioned V2 configuration
                            │
                            ▼
                  Recommendation Core
                            │
                   marketplace override
                            │
                    destination/copy
```

## 3. Recommendation Core

Input:

```text
birth_day
birth_month
birth_year?   # display-only, не участвует в selection
gender
marketplace
```

Flow:

1. validate supplied birth date;
2. resolve Chertog by day/month via `KIP_CHERTOG_CALENDAR_V1`;
3. preserve supplied `birth_year` unchanged for the response/copy context;
4. resolve one base row by `KIP_RECOMMENDATION_MATRIX_V2_SALES_WEIGHTED`;
5. apply explicit marketplace override;
6. validate `KIP_PRODUCT_POLICY_V2_SALES_WEIGHTED`;
7. return exactly one product plus birth-date display context.

Core must not:

- use birth year to change Chertog/product selection;
- drop a supplied birth year before rendering;
- invent a year that customer did not provide;
- call LLM for selection;
- read live sales/stock to change result;
- invent similar SKU;
- auto-promote reserve products;
- return a secondary product.

## 4. Sales-weighted approval

Evidence baseline 2026-08-28:

- Wildberries: bought units, 2026-01-01 — 2026-08-28;
- Ozon: `ordered_units`, 2026-06-01 — 2026-08-28.

Approval sequence:

```text
candidate products
   ↓
remove unrelated/contradictory
   ↓
semantic + gender-fit review
   ↓
strongly weight sales among acceptable candidates
   ↓
owner approval
   ↓
versioned matrix
```

## 5. Marketplace-aware result

Current explicit override:

```text
Ворон + male:
Ozon        → Колядник
Wildberries → Алатырь
```

All other rows currently match between Ozon and Wildberries.

## 6. Critical product-policy invariants

```text
Даждьбог → only Раса male + female
Печать Велеса → only Медведь male + female
Печать Велеса → Волк FORBIDDEN
Печать Велеса → Орёл FORBIDDEN
Волк → Велес
Лиса male → Чернобог
Лиса female → Мара
Орёл male → Перун
Орёл female → Звезда Лады
Сварог → male only
secondary recommendation → forbidden
```

### Customer-facing naming boundary

The `Печать Велеса` product may keep a legacy/internal technical key such as `bear_paw`, but **customer-facing name is always exactly**:

```text
Печать Велеса
```

Internal keys/aliases must never leak into UI, Telegram/VK text, marketplace answer drafts, templates or reason copy.

## 7. Configuration Registry

Target:

```text
recommendations/data/
  chertog_calendar.v1.json
  product_policy.v2.json
  recommendation_matrix.v2.json
  marketplace_overrides.v1.json
  reason_copy.v2.json
```

## 8. Validation

Startup/CI must fail if:

1. calendar gap/overlap;
2. one of 32 base cases missing;
3. more than one product per case;
4. unknown/inactive product key;
5. gender-policy conflict;
6. `bear_paw` outside `medved`;
7. customer label for `bear_paw` is not exactly `Печать Велеса`;
8. Даждьбог outside Раса or count != 2;
9. Сварог in female row;
10. Лиса male != Чернобог;
11. Лиса female != Мара;
12. Орёл male != Перун;
13. Орёл female != Звезда Лады;
14. Чернобог in female row;
15. Мара in male row;
16. supplied birth year is lost before customer rendering;
17. unapproved marketplace override;
18. reserve product appears automatically.

## 9. API

Canonical endpoint:

```text
POST /v1/recommendations/resolve
```

Detailed contract: `DATA_API_CONTRACT.md`.

The response returns one recommendation plus configuration versions and preserved birth-date display context.

## 10. Availability

Availability is an overlay and never changes semantic result:

```text
approved recommendation
   ↓
marketplace destination
   ↓
availability enrichment
   ↓
UI
```

No hidden replacement because of stock.

## 11. Copy layer

Copy receives the already selected product and produces:

```text
полная указанная дата → Чертог → темы → выбранный символ → почему подходит → marketplace link
```

Hard date rule:

```text
если customer input содержит DD.MM.YYYY
→ первая фраза customer-facing ответа повторяет DD.MM.YYYY полностью
```

Например:

```text
19.11.1988 → "Дата 19.11.1988 относится к Чертогу Лебедя."
```

Нельзя сокращать до `19.11`. Год не влияет на recommendation, но обязан сохраняться в copy. Если год не был дан, его не придумывать.

Copy must not expose:

- sales;
- ranking;
- fallback/substitute terminology;
- relation/selection enums;
- internal product keys;
- missing stock/card/link.

Hard render rule:

```text
product_key = bear_paw
→ customerLabel = "Печать Велеса"
```

## 12. Owner-approved current special cases

### Медведь

Both genders → `Печать Велеса` only.

### Волк

Both genders → `Велес`.

### Лиса

- male → `Чернобог`;
- female → `Мара`.

### Орёл

- male → `Перун`;
- female → `Звезда Лады`.

`Печать Велеса` intentionally remains unavailable to Орёл because its actual visual execution is tied to Медведь; high sales do not override that visual contradiction.

### Раса

Both genders → `Даждьбог`; these are the only Dazhdbog base rows.

Decision marker:

```text
KIP_ARCHITECTURE_V2_SALES_WEIGHTED_APPROVED
```