# BY_SEARCHES / ASCENDING — pagination instability evidence

Date observed: 2026-09-11
Bridge: `ozon-llm-api-bridge` v0.1.19
Operation: `product_queries_details`
Analytics period: `2026-08-13` — `2026-09-10`
Target SKU set: 76
Requested shape: `page_size=100`, `limit_by_sku=15`, `sort_by=BY_SEARCHES`, `sort_dir=ASCENDING`

## Verdict

The global page sweep over all 76 SKU is **not accepted as a deterministic completeness authority**.

The provider returned `total=1110` and `page_count=12`, but the independently executed page requests contain overlapping `(sku, query)` rows when the sort metric is tied. Under `BY_SEARCHES / ASCENDING`, a very large part of the candidate set has `unique_search_users=0`. Because no stable secondary ordering is exposed by the request, separate page calls can reshuffle equal-valued rows. As a result, a nominal `query_index` range of 1–1110 does not prove 1110 unique rows were captured.

## Concrete overlap proof from the live batch

Example SKU `1623753672`:

Page 1 request `6477d987-e28b-4353-aa6a-d7eb1966deb5` returned, among others:
- `query_index=148` — `подвеска в машину на зеркало инь янь`
- `149` — `игрушка на зеркало в машину пачка сигарет`
- `150` — `подвеска в машину на зеркало из камня с древом`
- `151` — `древ машина`
- `152` — `в машину амулет`
- `153` — `подвеска в автомобиль цветок`
- `154` — `подвеска в машину на зеркало мужская евгений`
- `155` — `четки в машину те`
- `156` — `подвеска в машину на зеркало из камня с древом жизни`
- `157` — `подвеска в машину мир`
- `158` — `украшения на зеркало автомобиля автомобилист`
- `159` — `подвеска в машину на зеркало руна`
- `160` — `оберег в машину на зеркало женский`
- `161` — `древо жизни жив`
- `162` — `на зеркало в машину цвеок`

Page 2 request `0e5eec93-6a69-4538-aa72-22822d6a5788` returned the same SKU and repeated several of those exact phrases at new global positions, including:
- `201` — `подвеска в машину на зеркало из камня с древом жизни`
- `202` — `подвеска в машину мир`
- `203` — `украшения на зеркало автомобиля автомобилист`
- `204` — `подвеска в машину на зеркало руна`
- `205` — `оберег в машину на зеркало женский`
- `206` — `древо жизни жив`
- `207` — `на зеркало в машину цвеок`
- `208` — `игрушка на зеркало в машину пачка сигарет`

This is sufficient to reject the assumption that separate global pages form one stable ordered result set when many rows share the same primary sort value.

Further repeated blocks are visible for other SKU across later pages in the same batch.

## Batch request IDs observed

- page 1: `6477d987-e28b-4353-aa6a-d7eb1966deb5`
- page 2: `0e5eec93-6a69-4538-aa72-22822d6a5788`
- page 3: `7960d186-6de4-4977-b010-1e5de72ceca2`
- page 4: `5149be89-2692-4fec-b46f-01fbd1480fea`
- page 5: `19a430f4-b861-4881-89c0-f85c0b31d151`
- page 6: `63723f4e-b092-45dd-b6df-205efddc0a56`
- page 7: `9e9a5cbf-fd38-4467-aa3b-a4750e89be9d`
- page 8: `2342f158-c171-40ee-bafe-d1d75b585d19`
- page 9: `37f3658c-8f75-4fe8-b884-09aaec02ec8d`
- page 10: `b66b5a02-5816-49b9-8e0b-4850660838f2`
- page 11: `c305b2a2-bdd4-4d44-aa2c-0c66ae724fc9`

All 11 calls returned HTTP 200 and `total=1110`, `page_count=12`; the defect is not a transport/provider error. It is a reproducibility/completeness problem caused by paging an independently re-sorted tied result set.

## Corrected collection rule

Do not use global pagination over the full 76-SKU set as the completeness mechanism for these 15-per-SKU slices.

Instead:
1. split the 76 target SKU into explicit chunks small enough that `chunk_size × limit_by_sku <= page_size`;
2. with `limit_by_sku=15` and `page_size=100`, use at most 6 SKU per request (`6 × 15 = 90`);
3. request only `page=0` for each chunk;
4. persist each chunk response with exact request provenance;
5. repeat the same chunk plan for every allowed sort slice;
6. deduplicate only in a later derived layer; never mutate raw chunk evidence.

This removes the unstable global page boundary from the collection design.

## Consequence for prior state

The previously collected global `BY_SEARCHES / DESCENDING` page sweep remains preserved as historical raw evidence, but its claim of deterministic 1110-row completeness is downgraded until reproduced/validated with the chunked no-pagination method. The same rule applies to future `BY_GMV` slices.
