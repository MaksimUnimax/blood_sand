# Data & API Contract — recommendation system V2

Версия: 0.2  
Статус: **V2 SALES-WEIGHTED contract authority**  
Revision: **2026-08-31 owner update — Волк female → Алатырь; Змей female → Мара**

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

Calendar stays V1. Exactly 16 Chertogs, no gaps/overlaps, 29.02 → Волк.

`birth_year` does not affect Chertog selection, but if supplied it must be preserved for customer-facing rendering.

## 5. Product policy V2

Example `Печать Велеса` record:

```json
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
```

`product_key` is internal and must never be rendered to the customer.

Critical product policies:

```text
bear_paw.allowed_chertogs = [medved]
bear_paw.customer_label = "Печать Велеса"
svarog.gender_policy = male
chernobog.gender_policy = male
mara.gender_policy = female
mara allowed automatic rows = lisa + female; zmei + female
zvezda_lady.gender_policy = female
zhiva.gender_policy = female
rodimich.gender_policy = male
molvinets.active_for_recommendation = false
dazhdbog automatic matrix use = rasa only
```

## 6. Recommendation matrix V2

Exactly one active base product per `chertog + gender`.

Required owner rows include:

```text
zmei + male     → semargl
zmei + female   → mara
medved + male   → bear_paw
medved + female → bear_paw
busel + male    → rodimich
busel + female  → zvezda_lady
volk + male     → veles
volk + female   → alatyr
lisa + male     → chernobog
lisa + female   → mara
orel + male     → perun
orel + female   → zvezda_lady
```

Base invariants:

- exactly 32 active base entries;
- no secondary entries;
- product key exists and is active;
- gender policy allows row;
- allowed Chertog policy allows row.

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

Approved gender-split rows:

```json
{
  "chertog_id": "volk",
  "gender": "female",
  "product_key": "alatyr",
  "relation_type": "CURATED_GENDER_SUBSTITUTE",
  "selection_basis": "SEMANTIC_CURATED_GENDER_FIT",
  "reason_code": "VOLK_FEMALE_INNER_CENTER"
}
```

```json
{
  "chertog_id": "zmei",
  "gender": "female",
  "product_key": "mara",
  "relation_type": "CURATED_GENDER_SUBSTITUTE",
  "selection_basis": "SEMANTIC_CURATED_GENDER_FIT",
  "reason_code": "ZMEI_FEMALE_TRANSITION_RESILIENCE"
}
```

For `zmei + female`, `mara` is **not** a direct patron relation. Its `DIRECT_DERIVED` role remains `lisa + female`; the Snake row is an explicit curated gender-fit use.

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
  birthYear?: number;
  gender: "male" | "female";
  marketplace?: "ozon" | "wildberries";
};
```

Rules:

- `birthDay + birthMonth` determine the Chertog;
- `birthYear`, when supplied, is preserved unchanged for copy/UI;
- selection must be identical for the same day/month regardless of year;
- do not drop a supplied year before the copy layer;
- do not invent a year when it was not supplied.

## 10. Domain response

```ts
type RecommendationResult = {
  calendarVersion: string;
  productPolicyVersion: string;
  matrixVersion: string;
  marketplaceOverrideVersion: string;
  birthDate: {
    day: number;
    month: number;
    year: number | null;
    display: string;
  };
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

`patron_name` is calendar metadata and does not force selection of the exact patron product.

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

## 14. Customer-label and date-render contract

The UI/copy layer must render `customerLabel`, not internal aliases or product keys.

Hard assertion for `product_key = bear_paw`:

```text
rendered customer label == "Печать Велеса"
```

Hard assertion for supplied full DOB:

```text
input.birth_year != null
→ customer-facing first sentence contains birth_date.display in DD.MM.YYYY form
```

The renderer must not shorten a supplied full date to day/month only.

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
10. `zmei + male` is not Семаргл;
11. `zmei + female` is not Мара;
12. `zmei + female` uses a DIRECT relation type;
13. `volk + male` is not Велес;
14. `volk + female` is not Алатырь;
15. `busel + male` is not Родимич;
16. `busel + female` is not Звезда Лады;
17. Молвинец appears in an automatic row;
18. `lisa + male` is not Чернобог;
19. `lisa + female` is not Мара;
20. `orel + male` is not Перун;
21. `orel + female` is not Звезда Лады;
22. Чернобог in female row;
23. Мара in male row;
24. supplied `birth_year` is lost before customer rendering;
25. unapproved marketplace override exists;
26. reserve product auto-appears without owner decision.

## 16. Contract tests

```text
01.12.1988 + male + ozon → zmei / Семаргл
01.12.1988 + female + ozon → zmei / Мара / CURATED_GENDER_SUBSTITUTE
09.02.1996 + male + ozon → busel / Родимич
09.02.1996 + female + ozon → busel / Звезда Лады
15.03.1988 + male + ozon → volk / Велес
15.03.1988 + female + ozon → volk / Алатырь
25.03.1993 + male + ozon → lisa / Чернобог
25.03.1993 + female + ozon → lisa / Мара / DIRECT_DERIVED
16.01.1986 + male + ozon → medved / Печать Велеса
16.01.1990 + female + wildberries → medved / Печать Велеса
19.07.1988 + male → orel / Перун
19.07.1988 + female → orel / Звезда Лады
13.08.1988 + male → rasa / Даждьбог
13.08.1988 + female → rasa / Даждьбог
```

Decision marker:

```text
KIP_DATA_API_CONTRACT_V2_SALES_WEIGHTED_APPROVED
```
