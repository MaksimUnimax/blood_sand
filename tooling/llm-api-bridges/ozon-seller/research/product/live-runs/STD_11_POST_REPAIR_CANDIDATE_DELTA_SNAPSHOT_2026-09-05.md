# STD-11 post-repair candidate delta snapshot — 2026-09-05

Canonical question: `У меня исчез товар с FBO, а продаж с этого склада не было. Разберись, куда он мог деться и какие доказательства есть в данных.`

## Purpose

Before reusing the historical 2026-09-02 Aquarius reservation case, first test whether a fresh same-day FBO disappearance exists in the current 2026-09-05 account state.

The candidate set is the 12 SKUs from today's STD-07 post-repair run that had non-zero FBO present stock:

- 2559748332
- 1720137256
- 1602722942
- 2183985513
- 1842444165
- 1640306007
- 1720151850
- 1640251697
- 2186766628
- 2559437928
- 1602717077
- 2271188511

STD-07 current FBO totals for these SKUs were respectively:
`1,4,14,3,2,2,2,2,1,1,4,4`.

## Fresh two-page read

Operation: `fbo_stock_by_warehouse`.

Page 1:
- request_id `9ae37ede-6172-4538-93bf-6a295e6d2450`
- HTTP 200
- one logical / one physical request
- `has_next=true`
- cursor `MTY0MDMwNjAwNzsyMzg0MzkxNzIyODAwMA==`

Page 2:
- request_id `c1f90218-f73d-47be-a8dc-e6274a46cba3`
- HTTP 200
- one logical / one physical request
- `has_next=false`

Both reads were externally executed. The Bridge transformed the transport-level command for this operation (`exact_request_preserved=false`, `command_transformed=true`), as already observed in prior successful FBO stock reads.

## Fresh reconstructed FBO totals

Across the complete two-page result:

- 2559748332 — 1
- 1720137256 — 4
- 1602722942 — 14
- 2183985513 — 3
- 1842444165 — 2
- 1640306007 — 2
- 1720151850 — 2
- 1640251697 — 2
- 2186766628 — 1
- 2559437928 — 1
- 1602717077 — 4
- 2271188511 — 4

These totals exactly equal the earlier same-day STD-07 totals.

## Conclusion

No fresh same-day aggregate FBO disappearance exists among the current non-zero FBO candidate set.

Therefore a new live disappearance case must not be fabricated from 2026-09-05 current state.

The preserved 2026-09-02 Aquarius case remains the valid real-account forensic example because it captured a contemporaneous stock-state transition `free FBO 1 -> 0` while `present` stayed 1 and `reserved` changed `0 -> 1`, followed by an exact active posting at the same warehouse.

Next post-repair step: replay the historical 2026-09-02 FBO posting window through the current Bridge runtime to verify the current operation still retrieves the exact target posting/warehouse relationship. The preserved 2026-09-02 contemporaneous stock snapshots remain the authority for the historical reservation state; current provider status must not be back-projected as if it were the historical posting status.

Checkpoint: `STD_11_CURRENT_DELTA_NOT_PRESENT_USE_PRESERVED_REAL_2026_09_02_CASE_WITH_CURRENT_RUNTIME_POSTING_REPLAY_NEXT`
