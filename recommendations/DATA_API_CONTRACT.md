# Data & API Contract — recommendation system V2

Версия: 0.2  
Статус: **V2 SALES-WEIGHTED contract authority**

## 1. Назначение

Зафиксировать machine-readable contracts, которые связывают:

- versioned recommendation data;
- Recommendation Core;
- marketplace override layer;
- UI adapters;
- destination/availability layer.

Business authority remains `RECOMMENDATION_MATRIX.md` and `PRODUCT_CLASSIFICATION.md`.

## 2. Version identifiers

```text
calendar_version = KIP_CHERTOG_CALENDAR_V1
product_policy_version = KIP_PRODUCT_POLICY_V2_SALES_WEIGHTED
matrix_version = KIP_RECOMMENDATION_MATRIX_V2_SALES_WEIGHTED
marketplace_override_version = KIP_MARKETPLACE_OVERRIDE_V1
copy_version = KIP_REASON_COPY_V2_SALES_WEIGHTED
api_version = v1
```

Every result must return all versions used.

## 3. Target machine-readable configuration

```text
recommendations/data/
  chertog_calendar.v1.json
  product_policy.v2.json
  recommendation_matrix.v2.json
  marketplace_overrides.v1.json
  reason_copy.v2.json
```

Markdown is current human-readable authority until these files are implemented and validated.

## 4. Calendar schema

Calendar stays V1.

Example:

```json
{
  "calendar_version": "KIP_CHERTOG_CALENDAR_V1",
  "entries": [
    {
      "chertog_id": "rasa",
      "chertog_name": "Раса",
      "patron_name": "Даждьбог",
      "start": { "month": 8, "day": 4 },
      "end": { "month": 8, "day": 26 }
    }
  ]
}
```

Invariants:

- exactly 16 Chertogs;
- every valid MM-DD covered exactly once;
- 29.02 → Волк;
- year does not affect recommendation.

## 5. Product policy V2

Example `Печать Велеса` record:

```json
{
  "product_policy_version": "KIP_PRODUCT_POLICY_V2_SALES_WEIGHTED",
  "products": [
    {
      "product_key": "bear_paw",
      "sku": "1636048691",
      "marketplace_name": "Печать Велеса",
      "recommendation_identity": "Медвежья лапа",
      "customer_label": "Печать Велеса — Медвежья лапа",
      "gender_policy": "any",
      "allowed_chertogs": ["medved"],
      "active_for_recommendation": true
    }
  ]
}
```

Supported V2 `gender_policy`:

```text
male
female
any
```

Critical policies:

```text
bear_paw.allowed_chertogs = [medved]
svarog.gender_policy = male
dazhdbog automatic matrix use = rasa only
```

## 6. Recommendation matrix V2

Every base `chertog + gender` has exactly one rank-1 product. Rank 2 is not supported by V2 business policy.

Example:

```json
{
  "matrix_version": "KIP_RECOMMENDATION_MATRIX_V2_SALES_WEIGHTED",
  "entries": [
    {
      "chertog_id": "medved",
      "gender": "male",
      "product_key": "bear_paw",
      "relation_type": "DIRECT_CHERTOG_SYMBOL",
      "selection_basis": "SEMANTIC_DIRECT_SALES_PRIORITIZED",
      "reason_code": "BEAR_PAW_DIRECT_SYMBOL",
      "active": true
    },
    {
      "chertog_id": "medved",
      "gender": "female",
      "product_key": "bear_paw",
      "relation_type": "DIRECT_CHERTOG_SYMBOL",
      "selection_basis": "SEMANTIC_DIRECT_SALES_PRIORITIZED",
      "reason_code": "BEAR_PAW_DIRECT_SYMBOL",
      "active": true
    }
  ]
}
```

Base invariants:

- exactly 32 active base entries;
- one per `16 × 2`;
- no secondary entries;
- product key must exist and be active;
- gender policy must allow the row;
- allowed_chertogs must contain the row Chertog.

## 7. Semantic and commercial fields

`relation_type` describes meaning only:

```text
DIRECT_PATRON
DIRECT_DERIVED
DIRECT_CHERTOG_SYMBOL
CURATED_GENDER_SUBSTITUTE
CURATED_MEANING_SUBSTITUTE
```

`selection_basis` describes why that semantic candidate won V2 selection:

```text
SEMANTIC_DIRECT
SEMANTIC_DIRECT_SALES_PRIORITIZED
SEMANTIC_CURATED_SALES_WEIGHTED
MARKETPLACE_OVERRIDE_SALES_WEIGHTED
```

Sales figures themselves are **not runtime config inputs**. They are evidence used to approve a versioned configuration.

## 8. Marketplace override V1

Schema example:

```json
{
  "marketplace_override_version": "KIP_MARKETPLACE_OVERRIDE_V1",
  "overrides": [
    {
      "marketplace": "wildberries",
      "chertog_id": "voron",
      "gender": "male",
      "base_product_key": "kolyadnik",
      "effective_product_key": "alatyr",
      "relation_type": "CURATED_MEANING_SUBSTITUTE",
      "selection_basis": "MARKETPLACE_OVERRIDE_SALES_WEIGHTED",
      "reason_code": "VORON_CHANGE_INNER_SUPPORT"
    }
  ]
}
```

Current V1 override set contains exactly one override.

Supported marketplaces initially:

```text
ozon
wildberries
```

Unknown marketplace must be rejected or handled as no-destination/base mode according to caller contract; never guessed.

## 9. Domain request

```ts
type ResolveRecommendationInput = {
  birthDay: number;
  birthMonth: number;
  gender: "male" | "female";
  marketplace?: "ozon" | "wildberries";
};
```

Year is not part of domain input.

If `marketplace` is omitted, return base recommendation and no marketplace-specific destination. Caller may ask user for marketplace before generating a marketplace link.

## 10. Domain response

```ts
type RecommendationResult = {
  calendarVersion: string;
  productPolicyVersion: string;
  matrixVersion: string;
  marketplaceOverrideVersion: string;
  chertog: {
    id: string;
    name: string;
    patronName: string;
  };
  gender: "male" | "female";
  marketplace: "ozon" | "wildberries" | null;
  recommendation: {
    productKey: string;
    sku: string;
    recommendationIdentity: string;
    customerLabel: string;
    relationType:
      | "DIRECT_PATRON"
      | "DIRECT_DERIVED"
      | "DIRECT_CHERTOG_SYMBOL"
      | "CURATED_GENDER_SUBSTITUTE"
      | "CURATED_MEANING_SUBSTITUTE";
    selectionBasis:
      | "SEMANTIC_DIRECT"
      | "SEMANTIC_DIRECT_SALES_PRIORITIZED"
      | "SEMANTIC_CURATED_SALES_WEIGHTED"
      | "MARKETPLACE_OVERRIDE_SALES_WEIGHTED";
    reasonCode: string;
  };
};
```

There is one `recommendation`, not an array of 1–2 products.

## 11. HTTP API

```text
POST /v1/recommendations/resolve
Content-Type: application/json
```

Request example:

```json
{
  "birth_day": 5,
  "birth_month": 1,
  "gender": "female",
  "marketplace": "ozon",
  "channel": "telegram"
}
```

Success example for Медведь:

```json
{
  "result_id": "opaque-generated-id",
  "versions": {
    "calendar": "KIP_CHERTOG_CALENDAR_V1",
    "product_policy": "KIP_PRODUCT_POLICY_V2_SALES_WEIGHTED",
    "matrix": "KIP_RECOMMENDATION_MATRIX_V2_SALES_WEIGHTED",
    "marketplace_override": "KIP_MARKETPLACE_OVERRIDE_V1",
    "copy": "KIP_REASON_COPY_V2_SALES_WEIGHTED"
  },
  "input": {
    "birth_day": 5,
    "birth_month": 1,
    "gender": "female",
    "marketplace": "ozon"
  },
  "chertog": {
    "id": "medved",
    "name": "Медведь",
    "patron_name": "Сварог"
  },
  "recommendation": {
    "product_key": "bear_paw",
    "sku": "1636048691",
    "recommendation_identity": "Медвежья лапа",
    "customer_label": "Печать Велеса — Медвежья лапа",
    "relation_type": "DIRECT_CHERTOG_SYMBOL",
    "selection_basis": "SEMANTIC_DIRECT_SALES_PRIORITIZED",
    "reason_code": "BEAR_PAW_DIRECT_SYMBOL",
    "availability": "UNKNOWN",
    "destination": null
  }
}
```

`patron_name` remains factual calendar metadata; it does **not** mean the patron product must be the selected V2 recommendation.

## 12. Channel vs marketplace

`channel` is telemetry/UI only and cannot change product selection.

Allowed examples:

```text
vk_bot
vk_mini_app
telegram
internal_test
```

`marketplace` may change result **only through explicit override config**.

## 13. Availability overlay

```ts
type Availability = "AVAILABLE" | "UNAVAILABLE" | "UNKNOWN";
```

Flow:

```text
V2 matrix resolution
   ↓
marketplace override
   ↓
destination lookup
   ↓
availability enrichment
   ↓
UI
```

Availability must never trigger hidden replacement.

Customer-facing copy must not announce missing stock/card/link; operator handling remains internal.

## 14. Product destination

```ts
type ProductDestination = {
  productKey: string;
  ozon?: {
    productId?: string;
    url?: string;
  };
  wildberries?: {
    productId?: string;
    url?: string;
  };
  vk?: {
    marketItemId?: string;
    marketUrl?: string;
  };
};
```

Destination does not define semantic relation. Marketplace selection is applied before destination lookup.

## 15. Error model

Minimum codes:

```text
INVALID_DATE
INVALID_GENDER
INVALID_MARKETPLACE
NO_CHERTOG_MATCH
MATRIX_ENTRY_MISSING
PRODUCT_POLICY_MISSING
MARKETPLACE_OVERRIDE_INVALID
CONFIG_VERSION_MISMATCH
INTERNAL_ERROR
```

Config errors must be impossible after validation and fail closed if encountered.

## 16. Validation gates

CI/config validation must fail if:

1. calendar has gap/overlap;
2. base matrix does not have exactly 32 rows;
3. more than one base result exists for a case;
4. unknown product key is referenced;
5. gender policy conflicts;
6. allowed Chertog list conflicts;
7. `bear_paw` appears outside Медведь;
8. `bear_paw` appears in Волк;
9. `Даждьбог` does not occur exactly twice or occurs outside Раса;
10. `Сварог` occurs in a female V2 row;
11. reserve product is referenced as active;
12. unknown `relation_type` / `selection_basis` / `reason_code`;
13. marketplace override tuple duplicates another override;
14. override references unknown marketplace;
15. effective override product violates product policy.

## 17. Canonical contract tests

```text
13.08 + male + ozon        → Раса / Даждьбог
13.08 + female + wb        → Раса / Даждьбог
13.10 + male + ozon        → Щука / Родимич
13.10 + female + wb        → Щука / Звезда Лады
15.01 + male + ozon        → Медведь / Печать Велеса — Медвежья лапа
15.01 + female + wb        → Медведь / Печать Велеса — Медвежья лапа
15.03 + male + ozon        → Волк / Велес
15.03 + female + wb        → Волк / Велес
20.12 + male + ozon        → Ворон / Колядник
20.12 + male + wb          → Ворон / Алатырь
20.12 + female + ozon      → Ворон / Алатырь
20.12 + female + wb        → Ворон / Алатырь
19.09                      → Дева
20.09                      → Вепрь
10.10                      → Вепрь
11.10                      → Щука
26.08                      → Раса
27.08                      → Дева
29.02                      → Волк
```

Additional policy tests:

```text
count(base where product=dazhdbog) == 2
count(base where product=bear_paw) == 2
all(bear_paw rows chertog == medved)
no(volk row product == bear_paw)
no(female row product == svarog)
no(case has secondary result)
```

## 18. Migration note

This V2 contract supersedes V1 examples containing:

- `recommendation_matrix.v1.json` as current matrix;
- `product_policy.v1.json` as current policy;
- Svarog + bear paw two-result Медведь male;
- Svarog Медведь female;
- channel-only resolution without marketplace override support.

Current business evidence and rationale are in `SALES_WEIGHTED_MATRIX_V2_AUDIT_2026-08-28.md`.

Decision marker:

```text
KIP_DATA_API_CONTRACT_V2_SALES_WEIGHTED
```
