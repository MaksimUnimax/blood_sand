# Codex prompt — M1.1 V2 machine-readable recommendation data

Use this prompt only after current V2 recommendation authority is present on the checked-out branch.

```text
You are working in repository MaksimUnimax/blood_sand.

Task: implement ONLY milestone M1.1 for the current V2 recommendation system:
JSON Schemas + versioned machine-readable data files.

Do NOT start VK integration, HTTP API, deployment, database work, availability logic, Mini App work, or marketplace question operator work.

==================================================
1. READ CURRENT AUTHORITY FIRST
==================================================

Read these files before changing anything:

- recommendations/README.md
- recommendations/RECOMMENDATION_MATRIX.md
- recommendations/PRODUCT_CLASSIFICATION.md
- recommendations/CUSTOMER_RECOMMENDATION_COPY_GUIDE.md
- recommendations/DATA_API_CONTRACT.md
- recommendations/ARCHITECTURE.md
- recommendations/VK_UX_FLOW.md
- recommendations/ROADMAP.md
- recommendations/OZON_PRODUCT_LINKS.md
- recommendations/WILDBERRIES_PRODUCT_LINKS.md

Authority / conflict order for semantic decisions:

1. RECOMMENDATION_MATRIX.md
2. PRODUCT_CLASSIFICATION.md
3. CUSTOMER_RECOMMENDATION_COPY_GUIDE.md
4. DATA_API_CONTRACT.md
5. ARCHITECTURE.md
6. VK_UX_FLOW.md / ROADMAP.md for channel and implementation planning only
7. marketplace link registries for verified destination identity only

Historical documents such as:

- M0_DOMAIN_FREEZE_AUDIT.md
- RECOMMENDATION_SYSTEM_TZ.md
- old V1 prompts

are superseded historical records and MUST NOT override current V2 authority.

If current authority files contradict each other in a way that prevents a deterministic implementation, STOP and report the contradiction instead of choosing a new business rule.

==================================================
2. REQUIRED VERSION MARKERS
==================================================

Require current authority markers:

calendar_version = KIP_CHERTOG_CALENDAR_V1
product_policy_version = KIP_PRODUCT_POLICY_V2_SALES_WEIGHTED
matrix_version = KIP_RECOMMENDATION_MATRIX_V2_SALES_WEIGHTED
marketplace_override_version = KIP_MARKETPLACE_OVERRIDE_V1
copy_version = KIP_REASON_COPY_V2_SALES_WEIGHTED

Do not generate V1 recommendation/product-policy files.

==================================================
3. CREATE SCHEMAS
==================================================

Create:

recommendations/schemas/chertog_calendar.v1.schema.json
recommendations/schemas/product_policy.v2.schema.json
recommendations/schemas/recommendation_matrix.v2.schema.json
recommendations/schemas/marketplace_overrides.v1.schema.json
recommendations/schemas/reason_copy.v2.schema.json

Use JSON Schema draft 2020-12 unless the repository already has an established compatible convention.

Schemas must reject at minimum:

- wrong fixed version markers;
- malformed day/month boundary fields;
- invalid gender values;
- invalid marketplace values;
- invalid relation_type values;
- invalid selection_basis values;
- missing required stable IDs/labels;
- malformed marketplace override rows;
- malformed reason-copy records.

Cross-row uniqueness and semantic invariants that JSON Schema cannot express must be explicitly documented as M1.2 validateConfiguration() responsibilities.

==================================================
4. CREATE V2 DATA FILES
==================================================

Create:

recommendations/data/chertog_calendar.v1.json
recommendations/data/product_policy.v2.json
recommendations/data/recommendation_matrix.v2.json
recommendations/data/marketplace_overrides.v1.json
recommendations/data/reason_copy.v2.json

Do not create or revive:

recommendation_matrix.v1.json
product_policy.v1.json
reason_copy.v1.json

as current runtime authority.

==================================================
5. CALENDAR CONTRACT
==================================================

chertog_calendar.v1.json must encode exactly KIP_CHERTOG_CALENDAR_V1:

- exactly 16 Chertogs;
- exact start/end day-month boundaries from current RECOMMENDATION_MATRIX.md;
- stable chertog_id;
- display name;
- patron display metadata where current authority defines it;
- enough structure for deterministic resolveChertog(day, month);
- 29.02 resolves to Волк through the calendar ranges/current authority.

Birth year MUST NOT affect Chertog selection.

==================================================
6. PRODUCT POLICY V2
==================================================

product_policy.v2.json must encode current product identities and current owner-approved recommendation restrictions from PRODUCT_CLASSIFICATION.md.

Preserve stable internal product keys where the authority still uses them.

Critical current invariants include:

- Печать Велеса customer-facing label is exactly "Печать Велеса";
- a legacy/internal key such as bear_paw may remain internal only;
- Печать Велеса is allowed only for Медведь in the current automatic matrix;
- Печать Велеса is forbidden for Волк;
- Печать Велеса is forbidden for Орёл;
- Сварог is male-only;
- Чернобог is male-only;
- Мара is female-only;
- Звезда Лады is female-only;
- Даждьбог automatic matrix use is only Раса male + female;
- internal aliases never become customer labels.

Do not add stock, CTR, live sales, ranking, or availability as runtime semantic inputs.

==================================================
7. RECOMMENDATION MATRIX V2
==================================================

recommendation_matrix.v2.json must encode the current
KIP_RECOMMENDATION_MATRIX_V2_SALES_WEIGHTED exactly.

Hard invariants:

- exactly 32 base rows = 16 Chertogs × 2 genders;
- exactly ONE active base product for every chertog + gender;
- NO secondary recommendation rows;
- NO rank-2 recommendation;
- NO hidden fallback rows;
- every product key exists in product_policy.v2.json;
- every row respects gender policy and allowed Chertogs.

Current owner-approved critical rows include:

medved + male   → Печать Велеса
medved + female → Печать Велеса

volk + male     → Велес
volk + female   → Велес

lisa + male     → Чернобог
lisa + female   → Мара

orel + male     → Перун
orel + female   → Звезда Лады

rasa + male     → Даждьбог
rasa + female   → Даждьбог

Do not restore any superseded V1 rule such as:

- Медведь + мужчина → Сварог + Медвежья лапа;
- Медведь + женщина → Сварог;
- exactly 33 active matrix rows;
- any secondary recommendation.

==================================================
8. MARKETPLACE OVERRIDE V1
==================================================

marketplace_overrides.v1.json must encode only current explicit approved overrides.

Current required override:

Ворон + male:

- Ozon        → Колядник
- Wildberries → Алатырь

Represent this using the exact structure and semantic fields required by current DATA_API_CONTRACT.md.

Marketplace override must be explicit and versioned.

Do not infer additional marketplace-specific rows from sales or links.

==================================================
9. REASON COPY V2
==================================================

reason_copy.v2.json is presentation metadata only.

It MUST NOT redefine which product is selected.

Use current CUSTOMER_RECOMMENDATION_COPY_GUIDE.md as authority for customer-facing semantic copy.

Current date-based copy order:

full supplied date
→ Chertog
→ themes/qualities of the Chertog
→ recommendation
→ why that product fits
→ destination/link handled by later layer

If the customer supplied DD.MM.YYYY, reason/copy data must support rendering the same full date.

Year does NOT change semantic selection.

Do not encode marketplace URLs into semantic reason copy.

Do not expose in customer-facing copy:

- sales;
- ranking;
- relation_type;
- selection_basis;
- internal keys;
- fallback terminology;
- unavailable stock/card/link diagnostics.

==================================================
10. DATA/API COMPATIBILITY
==================================================

Generated data must support the current DATA_API_CONTRACT.md domain response:

- preserved birth-date display context;
- one Chertog;
- one recommendation;
- stable product key/SKU/label fields as currently defined;
- relation_type;
- selection_basis;
- reason_code;
- optional marketplace override metadata.

Do not implement the HTTP endpoint in M1.1.

==================================================
11. SYNTACTIC / SCHEMA VALIDATION
==================================================

Validate every generated JSON file for syntax.

If a JSON Schema validator is already available without introducing a new dependency, validate each data file against its schema.

If no validator exists, do not add a runtime dependency just for this milestone; report schema-runtime validation as deferred to M1.2.

==================================================
12. DETERMINISTIC SELF-CHECKS
==================================================

Perform and report at minimum:

CHERTOG_COUNT = 16
BASE_MATRIX_ROWS = 32
SECONDARY_MATRIX_ROWS = 0
TOTAL_ACTIVE_MATRIX_ROWS = 32
EVERY_BASE_CASE_SINGLE_RESULT = yes

MEDVED_MALE = Печать Велеса
MEDVED_FEMALE = Печать Велеса
VOLK_MALE = Велес
VOLK_FEMALE = Велес
LISA_MALE = Чернобог
LISA_FEMALE = Мара
OREL_MALE = Перун
OREL_FEMALE = Звезда Лады
RASA_MALE = Даждьбог
RASA_FEMALE = Даждьбог

PECHAT_VELESA_OUTSIDE_MEDVED = 0
PECHAT_VELESA_CUSTOMER_LABEL_EXACT = yes
DAZHDBOG_BASE_ROWS = exactly rasa male + female
SECONDARY_RECOMMENDATION_PRESENT = no

VORON_MALE_OZON = Колядник
VORON_MALE_WILDBERRIES = Алатырь
UNAPPROVED_OVERRIDES = 0

EVERY_MATRIX_PRODUCT_KEY_VALID = yes
EVERY_MATRIX_ROW_GENDER_ALLOWED = yes
EVERY_MATRIX_REASON_CODE_RESOLVES = yes

FULL_DOB_SUPPORTED_AS_DISPLAY_CONTEXT = yes
YEAR_AFFECTS_SELECTION = no

==================================================
13. NO IMPLEMENTATION BEYOND M1.1
==================================================

Do NOT implement in this run:

- validateConfiguration();
- resolveChertog();
- resolveRecommendation();
- HTTP API;
- VK Bot;
- VK Mini App;
- DB/session state;
- deployment;
- availability;
- marketplace API calls;
- Telegram/MQO changes.

==================================================
14. COMMIT
==================================================

Commit only the completed M1.1 files to the current development branch.

Suggested commit message:

recommendations: add V2 machine-readable configuration

==================================================
15. RETURN
==================================================

At the end output:

M1_1_V2_MACHINE_READABLE_CONFIG = PASS/BLOCKED

BASE_HEAD = ...
FINAL_HEAD = ...
COMMIT_SHA = ...

CREATED_FILES = ...
CHANGED_FILES = ...

CALENDAR_VERSION = ...
PRODUCT_POLICY_VERSION = ...
MATRIX_VERSION = ...
MARKETPLACE_OVERRIDE_VERSION = ...
COPY_VERSION = ...

CHERTOG_COUNT = ...
BASE_MATRIX_ROWS = ...
SECONDARY_MATRIX_ROWS = ...
TOTAL_ACTIVE_MATRIX_ROWS = ...
EVERY_BASE_CASE_SINGLE_RESULT = yes/no

MEDVED_MALE = ...
MEDVED_FEMALE = ...
VOLK_MALE = ...
VOLK_FEMALE = ...
LISA_MALE = ...
LISA_FEMALE = ...
OREL_MALE = ...
OREL_FEMALE = ...
RASA_MALE = ...
RASA_FEMALE = ...

VORON_MALE_OZON = ...
VORON_MALE_WILDBERRIES = ...
UNAPPROVED_OVERRIDES = ...

PECHAT_VELESA_OUTSIDE_MEDVED = ...
PECHAT_VELESA_CUSTOMER_LABEL_EXACT = yes/no
DAZHDBOG_BASE_ROWS = ...
SECONDARY_RECOMMENDATION_PRESENT = yes/no

FULL_DOB_SUPPORTED_AS_DISPLAY_CONTEXT = yes/no
YEAR_AFFECTS_SELECTION = yes/no

JSON_SYNTAX_VALIDATION = PASS/FAIL
SCHEMA_VALIDATION = PASS/DEFERRED/FAIL

ASSUMPTIONS = none/<exact list>
REMAINING_BLOCKER = none/<exact blocker>

Do not proceed to M1.2 in the same run.
```
