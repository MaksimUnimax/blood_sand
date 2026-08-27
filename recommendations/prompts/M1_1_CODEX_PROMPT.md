# Codex prompt — M1.1 machine-readable recommendation data

Use this prompt on the development server with the repository checked out.

```text
You are working in repository MaksimUnimax/blood_sand.

Task: implement ONLY milestone M1.1 for the recommendation system: JSON Schemas + four versioned machine-readable data files. Do not start VK integration, HTTP API, deployment, database work, or availability logic.

First inspect the current repository state and read these files as authoritative inputs:

- recommendations/README.md
- recommendations/M0_DOMAIN_FREEZE_AUDIT.md
- recommendations/RECOMMENDATION_MATRIX.md
- recommendations/PRODUCT_CLASSIFICATION.md
- recommendations/RECOMMENDATION_SYSTEM_TZ.md
- recommendations/DATA_API_CONTRACT.md
- recommendations/CUSTOMER_RECOMMENDATION_COPY_GUIDE.md
- recommendations/OZON_PRODUCT_LINKS.md
- recommendations/WILDBERRIES_PRODUCT_LINKS.md

Authority / conflict order for semantic decisions:
1. M0_DOMAIN_FREEZE_AUDIT.md
2. RECOMMENDATION_MATRIX.md
3. PRODUCT_CLASSIFICATION.md
4. RECOMMENDATION_SYSTEM_TZ.md
5. DATA_API_CONTRACT.md
6. copy / marketplace link docs

Do not silently reinterpret the recommendation matrix.

Create:

recommendations/schemas/chertog_calendar.v1.schema.json
recommendations/schemas/product_policy.v1.schema.json
recommendations/schemas/recommendation_matrix.v1.schema.json
recommendations/schemas/reason_copy.v1.schema.json

recommendations/data/chertog_calendar.v1.json
recommendations/data/product_policy.v1.json
recommendations/data/recommendation_matrix.v1.json
recommendations/data/reason_copy.v1.json

Requirements:

1. Use JSON Schema draft 2020-12 unless the existing repository already has a clearly established newer/other JSON Schema convention. If an existing convention exists, follow it and report that choice.

2. chertog_calendar.v1.json must encode exactly KIP_CHERTOG_CALENDAR_V1:
- all 16 Chertogs;
- exact start/end day/month boundaries from RECOMMENDATION_MATRIX.md;
- patron display name;
- stable chertog_id;
- calendar version;
- enough structure for a deterministic resolver without external web data;
- 29.02 must resolve to Wolf by the calendar ranges, not by a hidden special-case in this data file unless the existing contract explicitly requires a leap-day marker.

3. product_policy.v1.json must encode all 25 Slavic recommendation identities from PRODUCT_CLASSIFICATION.md, including reserve/not-active products. Preserve:
- stable product_key;
- marketplace observed/display identity where needed;
- recommendation_identity;
- gender_policy;
- V1 role / active_for_recommendation;
- hard restrictions needed by the core.

Critical identity rule:
marketplace "Печать Велеса" => recommendation identity "Медвежья лапа".
It must never become a Wolf recommendation because of the marketplace name.

Do not put marketplace URLs, stock state, sales, CTR, ranking, or availability into semantic recommendation logic. Product destinations are a later milestone. If DATA_API_CONTRACT currently contains product_id/SKU as catalog identity fields, preserve them only if they are already verified by OZON_PRODUCT_LINKS.md; do not invent IDs.

4. recommendation_matrix.v1.json must encode KIP_RECOMMENDATION_MATRIX_V1 exactly:
- 32 primary cases = 16 chertogs x 2 genders;
- exactly one secondary row, only medved + male => Медвежья лапа;
- therefore exactly 33 active matrix rows total;
- rank only 1 or 2;
- stable relation_type enum:
  DIRECT_PATRON
  DIRECT_DERIVED
  DIRECT_CHERTOG_SYMBOL
  CURATED_GENDER_SUBSTITUTE
  CURATED_MEANING_SUBSTITUTE
- include stable reason_code for every row;
- no additional fallback rows;
- Wolf male/female => only Велес;
- no female result may reference a male-only product;
- no male result may reference a female-only product.

5. reason_copy.v1.json is presentation metadata, not recommendation logic.
It should provide stable reason_code entries usable later by renderers. Keep it concise and neutral. It may include short title/explanation templates or structured semantic phrases, but it must NOT duplicate or redefine the matrix.

Follow the current customer-copy direction:
- first explain Chertog, then recommendation;
- do not use internal CURATED_* terms in customer-facing copy;
- use cautious wording such as "связывают с" / "считается покровителем" where appropriate;
- do not promise guaranteed magical, medical, financial, or physical effects.

The three weak-but-approved V1 curated mappings from M0 audit must remain explicit as curated fallbacks and must NOT be described as direct patrons:
- voron + female => Белобог
- tur + male => Чур
- tur + female => Чур

Also keep deva + male => Даждьбог as an explicitly curated gender substitute, not a direct patron.

6. Schemas must reject at minimum:
- unknown versions/enums where the version is fixed for V1;
- malformed dates / impossible day/month boundary fields;
- invalid gender values;
- invalid rank values;
- invalid relation types;
- missing required IDs/names;
- duplicate identity keys where JSON Schema can express it; where JSON Schema cannot enforce cross-row uniqueness, document that this will be enforced by validateConfiguration() in M1.2.

7. Do not implement resolveChertog(), resolveRecommendation(), API endpoints, VK code, database code, server configuration, Docker, CI, or deployment in this task.

8. Inspect the repository's formatting and naming conventions before writing files. Do not introduce a package manager or runtime dependency merely to create these JSON files.

9. Validate every generated JSON file for syntactic correctness locally. If a JSON Schema validator is already available in the repository, validate data against schemas. If not, do not add a dependency yet; report that schema-runtime validation is deferred to M1.2.

10. Perform deterministic self-checks and report them:
- chertog count = 16
- Slavic product_policy count = 25
- primary matrix rows = 32
- secondary matrix rows = 1
- total active matrix rows = 33
- medved+male ranks = [1,2]
- every other chertog+gender ranks = [1]
- volk+male = Велес only
- volk+female = Велес only
- bear_paw / Медвежья лапа appears only at medved+male rank 2
- all 32 primary rows reference a valid active/allowed product identity according to gender policy
- every matrix reason_code exists in reason_copy.v1.json

11. If you find a genuine contradiction in the authoritative docs that prevents deterministic implementation, STOP and report it instead of choosing a new business rule yourself.

12. Commit the completed M1.1 work to the current branch with a clear commit message.

At the end output:
- commit SHA
- exact list of files created/changed
- validation commands run and their results
- all self-check counts/results
- any assumptions made
- explicit statement whether M1.1 is PASS or BLOCKED

Do not proceed to M1.2 in the same run.
```
