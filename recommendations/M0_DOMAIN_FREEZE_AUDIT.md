# M0 Domain Freeze Audit — V1 historical record

Status: **SUPERSEDED_BY_V2**  
Original freeze date: 2026-08-27  
Original matrix: `KIP_RECOMMENDATION_MATRIX_V1`  
Current matrix: `KIP_RECOMMENDATION_MATRIX_V2_SALES_WEIGHTED`

## Current authority

Use:

1. `RECOMMENDATION_MATRIX.md`;
2. `PRODUCT_CLASSIFICATION.md`;
3. `SALES_WEIGHTED_MATRIX_V2_AUDIT_2026-08-28.md`;
4. `CUSTOMER_RECOMMENDATION_COPY_GUIDE.md`;
5. `DATA_API_CONTRACT.md`.

The previous V1 freeze remains historical only.

## V1 assumptions retired

No longer current:

- sales could never influence selection;
- Медведь male had two products;
- Медведь female used Сварог;
- Dazhdbog could be used outside Раса;
- Мара was automatic for both male and female Лиса;
- Чернобог was reserve-only;
- old customer naming aliases for Печать Велеса were allowed.

## Current V2 invariants

- one effective product per `Чертог × пол × marketplace`;
- sales receive strong weight among acceptable candidates;
- Даждьбог appears exactly twice: Раса male + female;
- Медведь returns only `Печать Велеса` for both sexes;
- customer-facing product name is exactly `Печать Велеса`, with no second alias;
- `Печать Велеса` is forbidden for Волк and all non-Медведь Chertogs;
- Волк returns `Велес`;
- Лиса male returns `Чернобог`;
- Лиса female returns `Мара`;
- Сварог is male-only and used for Дева male and Конь male;
- current marketplace override: Ворон male (Ozon Колядник / Wildberries Алатырь).

Current decision marker:

```text
KIP_RECOMMENDATION_MATRIX_V2_SALES_WEIGHTED_APPROVED
```