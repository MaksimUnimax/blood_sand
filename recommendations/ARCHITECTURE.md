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
gender
marketplace
```

Flow:

1. validate date;
2. resolve Chertog by `KIP_CHERTOG_CALENDAR_V1`;
3. resolve one base row by `KIP_RECOMMENDATION_MATRIX_V2_SALES_WEIGHTED`;
4. apply explicit marketplace override;
5. validate `KIP_PRODUCT_POLICY_V2_SALES_WEIGHTED`;
6. return exactly one product.

Core must not:

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
Волк → Велес
Лиса male → Чернобог
Лиса female → Мара
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
12. Чернобог in female row;
13. Мара in male row;
14. unapproved marketplace override;
15. reserve product appears automatically.

## 9. API

Canonical endpoint:

```text
POST /v1/recommendations/resolve
```

Detailed contract: `DATA_API_CONTRACT.md`.

The response returns one recommendation plus configuration versions.

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
Чертог → темы → выбранный символ → почему подходит → marketplace link
```

It must not expose:

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

### Раса

Both genders → `Даждьбог`; these are the only Dazhdbog base rows.

Decision marker:

```text
KIP_ARCHITECTURE_V2_SALES_WEIGHTED_APPROVED
```