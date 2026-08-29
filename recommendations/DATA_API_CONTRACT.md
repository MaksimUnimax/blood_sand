# Data & API Contract — recommendation system V2

Версия: 0.2  
Статус: **V2 SALES-WEIGHTED contract authority**  
Revision: **2026-08-29 owner update**

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

`birth_year` **does not affect Chertog selection**, but if the caller/customer supplied a year it must be preserved for customer-facing rendering.

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
zvezda_lady.gender_policy = female
dazhdbog automatic matrix use = rasa only
```

## 6. Recommendation matrix V2

Exactly one active base product per `chertog + gender`.

Required owner rows include:

```text
medved + male   → bear_paw
medved + female → bear_paw
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
  birthYear?: number; // display/audit context only; MUST NOT affect selection
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
  copyVersion: string;
  birthDate: {
    day: number;
    month: number;
    year: number | null;
    display: string; // DD.MM.YYYY when year exists, otherwise only supplied date parts
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

The TypeScript-style camelCase notation in this section is conceptual domain
documentation. Python/domain implementations may use internal snake_case
dictionaries. Section 11 is authoritative for M2 HTTP JSON field names and
uses snake_case only.

## 11. HTTP API

```text
POST /v1/recommendations/resolve
Content-Type: application/json
```

Example request with a full birth date:

```json
{
  "birth_day": 16,
  "birth_month": 1,
  "birth_year": 1986,
  "gender": "male",
  "marketplace": "ozon"
}
```

Required request fields: `birth_day`, `birth_month`, `gender`.

Optional request fields: `birth_year`, `marketplace`. `gender` supports
`male` and `female`; `marketplace` supports `ozon`, `wildberries`, or
omitted/`null`. `channel` is not semantic input, and availability is not an
input.

The following is the exact owner-approved M2 HTTP success response shape.
It returns the semantic recommendation only; it contains exactly one
`recommendation` and no `availability` or `destination` fields.

Success example for Медведь:

```json
{
  "api_version": "v1",

  "input": {
    "birth_day": 16,
    "birth_month": 1,
    "birth_year": 1986,
    "gender": "male",
    "marketplace": "ozon"
  },

  "versions": {
    "calendar_version": "KIP_CHERTOG_CALENDAR_V1",
    "product_policy_version": "KIP_PRODUCT_POLICY_V2_SALES_WEIGHTED",
    "matrix_version": "KIP_RECOMMENDATION_MATRIX_V2_SALES_WEIGHTED",
    "marketplace_override_version": "KIP_MARKETPLACE_OVERRIDE_V1",
    "copy_version": "KIP_REASON_COPY_V2_SALES_WEIGHTED"
  },

  "birth_date": {
    "day": 16,
    "month": 1,
    "year": 1986,
    "display": "16.01.1986"
  },
  "chertog": {
    "id": "medved",
    "name": "Медведь",
    "patron_name": "Сварог"
  },

  "gender": "male",
  "marketplace": "ozon",

  "recommendation": {
    "product_key": "bear_paw",
    "sku": "1636048691",
    "recommendation_identity": "Печать Велеса",
    "customer_label": "Печать Велеса",
    "relation_type": "DIRECT_CHERTOG_SYMBOL",
    "selection_basis": "SEMANTIC_DIRECT_SALES_PRIORITIZED",
    "reason_code": "MEDVED_MALE"
  }
}
```

The `input` object preserves whether optional values were supplied:

- when `birth_year` was supplied, `input.birth_year` is present with that integer;
- when it was omitted, `input.birth_year` may be omitted and `birth_date.year` is `null`;
- when `marketplace` was supplied, `input.marketplace` is present;
- when it was omitted, `input.marketplace` may be omitted and top-level `marketplace` is `null`.

Do not invent a birth year or assume Ozon.

`patron_name` is calendar metadata and does not force selection of the patron product.

## 12. Channel vs marketplace

`channel` is telemetry/UI only and is not semantic input. `marketplace` may
change a result only through explicit override config.

## 13. Availability

M2 Recommendation API returns the semantic recommendation only:
`availability` and `destination` are not present yet. The later M4 product
destinations / availability overlay may enrich an API/channel-facing result,
but it must never change semantic product selection.

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

## 14. M2 error contract boundary

M2 must define deterministic HTTP error mapping for:

- malformed JSON/request shape;
- `RecommendationInputError`;
- `ConfigurationValidationError` / unavailable valid configuration;
- unexpected internal `RecommendationCoreError`.

The exact HTTP status and error-envelope contract will be implemented and
documented as part of M2. This authority correction does not define status
codes or error JSON.

## 15. Semantic serialization invariants

HTTP serialization must not change Core semantics:

```text
voron + male + marketplace omitted/null → kolyadnik → VORON_MALE_KOLYADNIK
voron + male + ozon                   → kolyadnik → VORON_MALE_KOLYADNIK
voron + male + wildberries            → alatyr    → VORON_CHANGE_INNER_SUPPORT
medved + male/female                  → customer_label exactly "Печать Велеса"
```

There is no secondary result, hidden fallback, or selection effect from year;
year remains display/audit context only.

## 16. Customer-label and date-render contract

The UI/copy layer must render `customerLabel`, not internal aliases or product keys.

Hard assertion for `product_key = bear_paw`:

```text
rendered customer label == "Печать Велеса"
```

No suffix, prefix, parenthetical clarification or secondary alias is allowed.

Hard assertion for supplied full DOB:

```text
input.birth_year != null
→ customer-facing first sentence contains birth_date.display in DD.MM.YYYY form
```

Example:

```text
19.11.1988 → "Дата 19.11.1988 относится к Чертогу Лебедя."
```

The renderer must not shorten this to `19.11`.

## 17. Validation gates

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
12. `orel + male` is not Перун;
13. `orel + female` is not Звезда Лады;
14. Чернобог in female row;
15. Мара in male row;
16. supplied `birth_year` is lost before customer rendering;
17. unapproved marketplace override exists;
18. reserve product auto-appears without owner decision.

## 18. Contract tests

```text
25.03.1993 + male + ozon → lisa / Чернобог; rendered date includes 1993
25.03.1993 + female + ozon → lisa / Мара; rendered date includes 1993
16.01.1986 + male + ozon → medved / Печать Велеса; rendered date includes 1986
16.01.1990 + female + wildberries → medved / Печать Велеса; rendered date includes 1990
19.07.1988 + male → orel / Перун
19.07.1988 + female → orel / Звезда Лады
15.03.1988 + male → volk / Велес
15.03.1988 + female → volk / Велес
13.08.1988 + male → rasa / Даждьбог
13.08.1988 + female → rasa / Даждьбог
```

Decision marker:

```text
KIP_DATA_API_CONTRACT_V2_SALES_WEIGHTED_APPROVED
```
