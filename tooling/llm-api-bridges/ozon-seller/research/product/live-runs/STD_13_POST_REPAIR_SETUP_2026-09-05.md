# STD-13 post-repair setup — supply acceptance diagnosis

Date: 2026-09-05
Canonical question: `Я уже привёз товар на Ozon, но он не принят или не появился в продаже. Разберись, где он застрял.`

## Candidate selection

Use real order `122149074` / supply `2000062599609` as the current concrete case.

Why this is a valid candidate:

- created `2026-08-10T09:01:34.061334Z`;
- original timeslot `2026-08-11T14:00:00Z..15:00:00Z`;
- drop-off `ЗЛАТОУСТ_89`;
- crossdock `true`;
- on 2026-09-02 it was still `IN_TRANSIT` and had not changed state since 2026-08-12, making it a real acceptance-delay/stuck-supply candidate;
- fresh post-repair STD-12 proves that by 2026-09-04 it progressed to `ACCEPTANCE_AT_STORAGE_WAREHOUSE` rather than remaining in transit;
- it is still non-terminal and therefore still relevant to the user question: the goods are inside the Ozon supply lifecycle but acceptance is not yet complete.

Do not fabricate a new acceptance incident if this real current case is sufficient.

## Diagnostic objective

Determine the strongest evidence-backed current stage and whether the available supply surfaces explain:

1. where the supply currently is in the Ozon lifecycle;
2. whether it has passed drop-off/transit and is now waiting on storage-warehouse acceptance;
3. whether any detailed supply state, warehouse assignment, acceptance/report/act signal, or product-level evidence narrows the remaining delay;
4. whether the supply's products have appeared in current stock/availability or remain absent;
5. which conclusions are provider-state facts vs inference.

## Run 1 next — detailed supply-order state

Operation: `supply_order_details`
Params: `{"order_id":122149074}`

Reason for this read:

- `supply_order_get` already established the broad order state;
- `supply_order_details` is the current Bridge operation explicitly intended to return detailed information about one supply order;
- this is the least-assumptive next diagnostic before product-level stock correlation;
- exactly one explicit Bridge command must produce at most one physical provider request.

After Run 1, decide whether product composition (`supply_order_bundle`), acceptance/act status, or stock/visibility correlation is actually required. Do not issue redundant reads if the detailed response already resolves the business job.

STD-13 status: `READY_FOR_POST_REPAIR_RUN1`.

Checkpoint:
`STD_13_POST_REPAIR_SUPPLY_122149074_DETAILS_NEXT`
