# Data & API Contract — recommendation system V2

Версия: 0.2  
Статус: **V2 SALES-WEIGHTED contract authority**  
Revision: **2026-08-28 owner update**

## 1. Authority

Business authority:

- `RECOMMENDATION_MATRIX.md`;
- `PRODUCT_CLASSIFICATION.md`;
- `CUSTOMER_RECOMMENDATION_COPY_GUIDE.md`.

## 2. Version identifiers

```text
calendar_version = KIP_CHERTOG_CALENDAR_V1
product_policy_version = KIP_PRODUCT_POLICY_V2_SALES_WEIGHTED
matrix_version = KIP_RECOMMENDATION_MATRIX_V2_SALES_WEIGHTED
marketplace_override_version = KIP_MARKETPLACE_OVERRIDE_V1
copy_version = KIP_REASON_COPY_V2_SALES_WEIGHTED
api_version = v1
```

## 3. Target machine-readable configuration

```text
recommendations/data/
  chertog_calendar.v1.json
  product_policy.v2.json
  recommendation_matrix.v2.json
  marketplace_overrides.v1.json
  reason_copy.v2.json
```

## 4. Calendar schema

Calendar stays V1. Exactly 16 Chertogs, no gaps/overlaps, 29.02 → Волк, year does not affect result.

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
      "recommendation_identity": "Печать Велеса",
      "customer_label": "Печать Велеса",
      "gender_policy": "any",
      "allowed_chertogs": ["medved"],
      "active_for_recommendation": true
    }
  ]
}
```

`product_key` is internal and must never be rendered to the customer.

Critical product policies:

```text
bear_paw.allowed_chertogs = [medved]
bear_paw.customer_label = "Печать Велеса"
svarog.gender_policy = male
chernobog.gender_policy = male
mara.gender_policy = female
dazhdbog automatic matrix use = rasa only
```

## 6. Recommendation matrix V2

Exactly one active base product per `chertog + gender`.

Required owner rows:

```text
medved + male   → bear_paw
medved + female → bear_paw
lisa + male     → chernobog
lisa + female   → mara
```

Example:

```json
{
  "matrix_version": "KIP_RECOMMENDATION_MATRIX_V2_SALES_WEIGHTED",
  "entries": [
    {
      "chertog_id": "lisa",
      "gender": "male",
      "product_key": "chernobog",
      "relation_type": "CURATED_GENDER_SUBSTITUTE",
      "selection_basis": "SEMANTIC_CURATED_GENDER_FIT",
      "reason_code": "LISA_MALE_RESILIENCE_CHANGE",
      "active": true
    },
    {
      "chertog_id": "lisa",
      "gender": "female",
      "product_key": "mara",
      "relation_type": "DIRECT_DERIVED",
      "selection_basis": "SEMANTIC_DIRECT",
      "reason_code": "LISA_MARENA_DERIVED",
      "active": true
    }
  ]
}
```

Base invariants:

- exactly 32 active base entries;
- no secondary entries;
- product key exists and is active;
- gender policy allows row;
- allowed_chertogs allows row.

## 7. Semantic and commercial fields

`relation_type`:

```text
DIRECT_PATRON
DIRECT_DERIVED
DIRECT_CHERTOG_SYMBOL
CURATED_GENDER_SUBSTITUTE
CURATED_MEANING_SUBSTITUTE
```

`selection_basis`:

```text
SEMANTIC_DIRECT
SEMANTIC_DIRECT_SALES_PRIORITIZED
SEMANTIC_CURATED_SALES_WEIGHTED
SEMANTIC_CURATED_GENDER_FIT
MARKETPLACE_OVERRIDE_SALES_WEIGHTED
```

Sales figures are approval evidence, not runtime inputs.

## 8. Marketplace override V1

Current override set contains exactly one entry:

```json
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
```

Supported marketplaces: `ozon`, `wildberries`.

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
      | "SEMANTIC_CURATED_GENDER_FIT"
      | "MARKETPLACE_OVERRIDE_SALES_WEIGHTED";
    reasonCode: string;
  };
};
```

Exactly one `recommendation` is returned.

## 11. HTTP API

```text
POST /v1/recommendations/resolve
Content-Type: application/json
```

Success example for Медведь:

```json
{
  "input": {
    "birth_day": 16,
    "birth_month": 1,
    "gender": "male",
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
    "recommendation_identity": "Печать Велеса",
    "customer_label": "Печать Велеса",
    "relation_type": "DIRECT_CHERTOG_SYMBOL",
    "selection_basis": "SEMANTIC_DIRECT_SALES_PRIORITIZED",
    "reason_code": "MEDVED_DIRECT_SYMBOL",
    "availability": "UNKNOWN",
    "destination": null
  }
}
```

`patron_name` is calendar metadata and does not force selection of the patron product.

## 12. Channel vs marketplace

`channel` is telemetry/UI only. `marketplace` may change a result only through explicit override config.

## 13. Availability

Availability is post-processing and never causes hidden replacement.

```text
V2 matrix
   ↓
marketplace override
   ↓
destination lookup
   ↓
availability enrichment
   ↓
UI
```

Customer-facing copy must not announce missing stock/card/link.

## 14. Customer-label contract

The UI/copy layer must render `customerLabel`, not internal aliases or product keys.

Hard assertion for `product_key = bear_paw`:

```text
rendered customer label == "Печать Велеса"
```

No suffix, prefix, parenthetical clarification or secondary alias is allowed.

## 15. Validation gates

CI/startup must fail if:

1. calendar has gap/overlap;
2. any of 32 base rows missing;
3. more than one product returned per base case;
4. unknown/inactive product key used;
5. gender policy conflict;
6. `bear_paw` outside `medved`;
7. rendered label for `bear_paw` differs from `Печать Велеса`;
8. Даждьбог outside Раса or not exactly twice;
9. Сварог in female row;
10. `lisa + male` is not Чернобог;
11. `lisa + female` is not Мара;
12. Чернобог in female row;
13. Мара in male row;
14. unapproved marketplace override exists;
15. reserve product auto-appears without owner decision.

## 16. Contract tests

```text
25.03 + male + ozon → lisa / Чернобог
25.03 + female + ozon → lisa / Мара
16.01 + male + ozon → medved / Печать Велеса
16.01 + female + ozon → medved / Печать Велеса
15.03 + male → volk / Велес
15.03 + female → volk / Велес
13.08 + male → rasa / Даждьбог
13.08 + female → rasa / Даждьбог
```

Decision marker:

```text
KIP_DATA_API_CONTRACT_V2_SALES_WEIGHTED_APPROVED
```