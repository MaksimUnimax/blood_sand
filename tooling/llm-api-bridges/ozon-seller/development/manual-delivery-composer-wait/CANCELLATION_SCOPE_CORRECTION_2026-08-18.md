# Manual OFF cancellation scope correction — 2026-08-18

Status: `AUTHORITATIVE_FOR_CURRENT_REPAIR_SCOPE`

This note narrows any earlier wording in this repair track that could be read as authorizing a broad Manual-state reset.

Manual OFF for the occupied-composer defect cancels/deletes only the current owner's pending pre-insert Manual report delivery when all of these are true:

- Manual operation status is `delivering`;
- delivery mode is `batch_watch_v1`;
- delivery phase is `claimed`;
- worker insert permission has not yet been committed.

Manual OFF does NOT use a general reset helper and does NOT delete:

- a request still executing or in `quota_waiting`;
- an `insert_committed` delivery;
- an `inserted` delivery;
- any other owner's Manual operation;
- unrelated Autorun state;
- provider quota state;
- provider cache state;
- binding/credentials/settings outside the Manual mode flag.

Safety reason: `claimed` is the last state where the report is pending but browser insertion has not been authorized. Once insert commit has occurred, broad deletion would erase evidence for an already-authorized/possibly-applied browser side effect.

Race boundary:

1. Manual OFF flag is persisted first.
2. The eligible `claimed` pending report is deleted owner-locally.
3. A late content runtime attempting `commitManualBatchDeliveryInsert` after OFF is rejected with `MANUAL_MODE_DISABLED`.

After OFF -> ON, the cancelled old report must not return. The owner may become ready for a new Manual operation. Existing provider quota/cache state still applies unchanged; in particular, an unexpired `next_allowed_at` / current 65000 ms guard is not reset by OFF -> ON.