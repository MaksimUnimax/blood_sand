# STD-10 post-repair Run 1 — empty-params Ozon warehouse list provider 400

Date: 2026-09-05
Question: `На складе Ozon был пожар или авария. Был ли там мой товар, что с ним сейчас и что мне нужно контролировать?`

## Live Bridge run

Command:

```json
{"operation":"ozon_warehouse_list","params":{}}
```

Observed:
- bridge: `ozon-llm-api-bridge`
- version: `0.1.19`
- request_id: `a377617f-a410-4f8c-95ae-8e549bfc64d8`
- operation: `ozon_warehouse_list`
- logical fingerprint: `66bea32b`
- physical fingerprint: `66bea32b`
- endpoint: `POST /v1/warehouse/ozon/list`
- external request executed: `true`
- HTTP: `400`
- provider error code: `3`
- logical business results: `1`
- physical business requests: `1`
- exact_request_preserved: `true`
- command_transformed: `false`
- entitlement: `SUPPORTED_AND_ENTITLED / all_accounts`
- automatic_retry: `false`

## Classification

`PROVIDER_400 / CONTRACT_DRIFT_CANDIDATE`

The Bridge accepted `{}` because the repaired contract currently allows `ozon_warehouse_list.params.warehouse_types` to be omitted. The provider nevertheless rejected the exact request with HTTP 400. This differs from the successful historical STD-10 Run 1 on 2026-09-02, so the current live run must not reuse that historical success as a current read.

This does not yet prove a Bridge defect because the provider raw error text is intentionally withheld from AI output. The next safe recovery is to retry the same read with an explicit supported warehouse type filter rather than skipping STD-10.

The target incident warehouse was historically identified as `САМАРА_РФЦ` and `warehouse_type=FULL_FILLMENT`; therefore the next explicit live command uses `warehouse_types:["FULL_FILLMENT"]`.

Checkpoint:
`STD_10_RUN1_EMPTY_PARAMS_PROVIDER_400_RETRY_EXPLICIT_FULL_FILLMENT_NEXT`
