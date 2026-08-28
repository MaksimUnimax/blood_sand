# M0 Domain Freeze Audit — V1 historical record

Status: **SUPERSEDED_BY_V2**  
Original freeze date: 2026-08-27  
Original matrix: `KIP_RECOMMENDATION_MATRIX_V1`  
Current matrix: `KIP_RECOMMENDATION_MATRIX_V2_SALES_WEIGHTED`

## Current authority

The V1 domain freeze has been superseded by the owner-approved sales-weighted rebuild on 2026-08-28.

Use these files as current authority:

1. `RECOMMENDATION_MATRIX.md` — effective V2 matrix;
2. `PRODUCT_CLASSIFICATION.md` — V2 product/gender policy;
3. `SALES_WEIGHTED_MATRIX_V2_AUDIT_2026-08-28.md` — commercial evidence, replacement audit and customer-facing rationale;
4. `CUSTOMER_RECOMMENDATION_COPY_GUIDE.md` — current client copy rules.

The previous V1 audit remains available in Git history and must not be treated as current runtime/product authority.

## V1 assumptions explicitly retired

The following V1 statements are no longer current:

- sales/popularity could never influence semantic product choice;
- `Медведь + мужчина` was the only two-product case;
- Медведь male returned `Сварог + Медвежья лапа`;
- Медведь female returned `Сварог`;
- `Печать Велеса / Медвежья лапа` was male-only;
- Даждьбог could be used as male curated fallback outside Раса;
- Всеславец, Боговник, Знич and Белобог were automatic outputs in their V1 rows.

## V2 invariants replacing V1

- one effective product per `Чертог × пол × marketplace`;
- sales receive strong weight among semantically acceptable candidates;
- `Даждьбог` appears exactly twice: Раса male + female;
- `Медведь` returns only `Печать Велеса — Медвежья лапа` for both sexes;
- bear-paw `Печать Велеса` is forbidden for Волк and all non-Медведь Chertogs;
- `Волк` returns `Велес` for both sexes;
- `Сварог` is male-only in V2 and is used for Дева male and Конь male;
- marketplace-specific override is allowed only when explicitly versioned; current override is `Ворон + мужчина` (Ozon Колядник / Wildberries Алатырь).

Current decision marker:

```text
KIP_RECOMMENDATION_MATRIX_V2_SALES_WEIGHTED_APPROVED
```
