# REG-P0-PROVIDER-LIFECYCLE-01 — LIVE FAIL 2026-09-07

Status: `LIVE_FAIL__PATCH_ROLLBACK_REQUIRED`

Installed candidate:
`OZON_BRIDGE_v0.1.19_PROVIDER_LIFECYCLE_TERMINALIZATION_a81d4fba.zip`

Candidate HEAD:
`a81d4fbab7a58fb387c00a930b4376fea82fe950`

Exact reproducer:

```text
OZON_API_V1
{"operation":"finance_transaction_list_v3","params":{"filter":{"date":{"from":"2026-08-01T00:00:00Z","to":"2026-08-31T23:59:59Z"}},"page":1,"page_size":1000}}
```

Observed installed-runtime sequence:

- `MANUAL_BRIDGE_BUSY` sequence 12
- `MANUAL_BATCH_ACCEPTED` sequence 13
- `BATCH_CAPABILITY_PLANNING_COMPLETED` sequence 14
- `BATCH_QUERY_PLANNING_COMPLETED` sequence 15
- `BATCH_PROCESSOR_UNCAUGHT` sequence 16, `code=OPERATION_BLOCKED`, `source=manual_admission`
- `MANUAL_BATCH_FAILED` sequence 17, `code=OPERATION_BLOCKED`

Verdict:

The candidate removed the indefinite BUSY symptom by catching/terminalizing the processor failure, but it did **not** restore successful command execution. Therefore live acceptance is FAIL and the candidate must not remain installed or be certified.

Rollback authority: explicit operator instruction on 2026-09-07 to roll back this patch.

Next state after rollback: investigate the exact `OPERATION_BLOCKED` trigger from the restored pre-patch runtime/evidence before any new executable repair.
