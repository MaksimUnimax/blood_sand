# R1 Wordstat Autorun Checkpoint — 2026-08-12

Status: **PAUSED_BY_OWNER**  
Branch: `work/ozon-data-collection-2026-08-11`  
Active roadmap: `marketing/roadmap/03_WORDSTAT_DEMAND_MEASUREMENT.md`

## Purpose

This checkpoint records the exact stop point of the current Wordstat Wave 1 autorun so the collection can resume without repeating completed API calls.

## Completed new Wave 1 root measurements in this autorun

All measurements below used `GetTop`, region `225` (Russia), `DEVICE_ALL`, `numPhrases=2000`, and returned HTTP 200.

1. `знак зодиака в машину` — `totalCount=149`  
   request_id: `fa37e008-58bf-4ffa-bd2f-07ee2a3d0cbb`

2. `талисман знак зодиака` — `totalCount=3422`  
   request_id: `20e0e31f-c027-44e0-a294-f4837fa68694`

3. `оберег по знаку зодиака` — `totalCount=710`  
   request_id: `aaa429a1-786b-4741-bae0-30b99a4451bc`

4. `славянские обереги` — `totalCount=25737`  
   request_id: `8c80465f-b850-4d67-81ed-fad63cad5713`

5. `алатырь оберег` — `totalCount=1878`  
   request_id: `bbdee5f7-146c-4734-9f7c-fe65c1b400c3`

6. `оберег чур` — `totalCount=903`  
   request_id: `d8a2d9a2-77f0-4d6f-bfe4-1658703dbc20`

7. `колядник оберег` — `totalCount=162`  
   request_id: `690b864c-8d84-45df-8789-cf6961bca794`

8. `оберег велес` — `totalCount=1507`  
   request_id: `35db3a4f-7942-4c23-95ec-c92fbdaf6a07`

For completed roots, raw/normalized evidence has been persisted during the run. Associations remain discovery evidence and are not promoted to direct demand without separate justification.

## Important observed signals retained for later analysis

- `талисман знак зодиака`: broad root `3422`, multiple sign-specific branches.
- `оберег по знаку зодиака`: `710`; explicit Slavic crossover `славянский оберег по знаку зодиака=77`.
- `славянские обереги`: `25737`; explicit commercial child `славянские обереги купить=1517`; automotive child `славянский оберег в машину=72`.
- `алатырь оберег`: `1878`; `алатырь оберег купить=137`.
- `оберег чур`: `903`; `оберег чур купить=57`.
- `колядник оберег`: `162`; no explicit `купить` child returned in the result slice.
- `оберег велес`: `1507`; `оберег велеса купить=108`; `оберег велеса серебро=50`; `оберег велес золото=54`.

Counts overlap and must not be summed across parent/child queries.

## Exact resume point

**Do not repeat any of the eight completed roots above.**

The next planned Wave 1 measurement from the active roadmap is:

`сварог оберег` / `GetTop` / region `225` / `DEVICE_ALL` / `numPhrases=2000`.

After `сварог оберег`, continue the remaining fixed Wave 1 roots from `marketing/roadmap/03_WORDSTAT_DEMAND_MEASUREMENT.md` in order, unless new live governance changes the plan.

## Pause rule

Autorun was explicitly stopped by the owner on 2026-08-12. No further Wordstat API request should be issued until the owner explicitly resumes the collection.
