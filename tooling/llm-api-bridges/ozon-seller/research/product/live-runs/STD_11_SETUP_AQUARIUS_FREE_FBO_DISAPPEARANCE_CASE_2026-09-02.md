# STD-11 setup — Aquarius free-FBO disappearance forensic case

Date: 2026-09-02
Canonical question: `У меня исчез товар с FBO, а продаж с этого склада не было. Разберись, куда он мог деться и какие доказательства есть в данных.`

## Real account case selected

Use SKU `1720141903`, offer `Знак зодиака "Водолей"`.

This case is selected from evidence already produced during the live gate; no synthetic disappearance is invented.

Earlier STD-07 Run 2 on 2026-09-02 observed aggregate stock:
- FBO `present=1`;
- FBO `reserved=0`;
- FBS `present=43`.

Later STD-10 Run 3 on the same day observed the current FBO-by-warehouse state:
- total FBO `present=1`;
- total FBO `reserved=1`;
- the only non-zero FBO row is warehouse_id `1020001007805000` with `present=1,reserved=1`;
- `САМАРА_РФЦ` and all other returned warehouses are zero for the SKU.

STD-10 Run 4 immediately confirmed aggregate current state:
- FBO `present=1,reserved=1`;
- FBS `present=43,reserved=0`;
- product remains `Продается`, approved, validation success, `errors=[]`, `AVAILABLE`.

## Why this is a valid STD-11 forensic case

The commercially visible **free FBO** changed from 1 to 0 during the test day, but FBO `present` did not fall from 1 to 0. Instead `reserved` changed from 0 to 1.

Therefore the first evidence-backed hypothesis is:

`FREE_FBO_DISAPPEARANCE_MAY_BE_RESERVATION_NOT_PHYSICAL_STOCK_LOSS`

This is exactly the type of stock-forensics distinction STD-11 should test: a weak model must not call an item "lost" merely because free stock disappeared or because no completed sale is yet visible.

The next read should attempt to identify a newly created FBO posting for this SKU during 2026-09-02 and inspect its current posting status and `analytics_data.warehouse_id/warehouse_name`.

If such a posting exists and is not yet a completed sale, it can directly explain the reserved unit without any physical disappearance.

If no relevant posting exists, continue the same active job into removal/return/supply/inconsistency surfaces under `NO_SKIP_ON_FAILURE` rather than guessing.

## First read

Operation: `posting_fbo_list`
Window: `2026-09-02T00:00:00Z..2026-09-02T23:59:59Z`
Include `analytics_data=true`.

Target evidence:
- SKU `1720141903` / offer `Знак зодиака "Водолей"`;
- warehouse_id `1020001007805000` if the reservation is attributable to the currently non-zero FBO warehouse;
- posting status/substatus;
- creation timestamp;
- whether the posting is active/in-process versus already delivered/cancelled.

STD-11 status: `READY_FOR_RUN1`.

Checkpoint:
`STD_11_SETUP_REAL_AQUARIUS_FREE_FBO_1_TO_0_VIA_RESERVED_0_TO_1_RECENT_FBO_POSTING_CORRELATION_NEXT`
