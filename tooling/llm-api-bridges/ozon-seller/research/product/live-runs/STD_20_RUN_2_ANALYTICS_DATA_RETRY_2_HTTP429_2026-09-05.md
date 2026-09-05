# STD-20 Run 2 retry 2 — analytics_data HTTP 429

Date: 2026-09-05
Branch: `repair/ozon-date-contract-2026-09-04`
Canonical question: `Почему у меня вырос ДРР? Разбери, что изменилось в рекламе и продажах.`

## Exact command

```text
OZON_API_V1
{"operation":"analytics_data","params":{"date_from":"2026-08-22","date_to":"2026-09-04","dimension":["day"],"metrics":["revenue","ordered_units"],"limit":100,"offset":0}}
```

## Full delivered result

```json
{
  "bridge": "ozon-llm-api-bridge",
  "version": "0.1.19",
  "delivery_mode": "sequential_batch_single_delivery",
  "result_count": 1,
  "capability_probe": {
    "performed": false,
    "status": "not_needed",
    "subscription_type": "UNKNOWN",
    "http_status": 0,
    "error_code": null
  },
  "query_planner": {
    "status": "complete",
    "coalesced_group_count": 0,
    "coalesced_logical_count": 0,
    "logical_business_result_count": 1,
    "physical_business_request_count": 1
  },
  "result": {
    "bridge": "ozon-llm-api-bridge",
    "version": "0.1.19",
    "request_id": "c8b9a7b7-8267-4e40-8f75-c57d7e52d8ce",
    "operation": "analytics_data",
    "command": {
      "operation": "analytics_data",
      "fingerprint": "3417544a"
    },
    "request_meta": {
      "provider": "ozon",
      "host_alias": "seller_api",
      "http_method": "POST",
      "path_alias": "analytics_data",
      "external_request_executed": true,
      "capability_probe_executed": false,
      "capability_probe_http_status": 0
    },
    "http_status": 429,
    "elapsed_ms": 1370,
    "pagination": null,
    "rate_limit": {
      "quota_family": "seller.analytics_data.v1",
      "min_interval_ms": 60000,
      "last_provider_request_at": 1788592830937,
      "next_allowed_at": 1788592895937,
      "automatic_retry": false
    },
    "planning": {
      "capability": {
        "is_premium": null,
        "probe_error_code": null,
        "probe_http_status": 0,
        "probe_performed": false,
        "status": "not_needed",
        "subscription_type": "UNKNOWN"
      },
      "entitlement": {
        "capability_required": false,
        "entitlement_key": "POST /v1/analytics/data",
        "exact_request_preserved": false,
        "partial": false,
        "reason": "all_accounts",
        "rule_source": "reviewed-openapi-463-2026-08-19",
        "status": "SUPPORTED_AND_ENTITLED"
      },
      "acquisition": {
        "profile_id": "analytics_basic_metrics_v1",
        "prefetch_applied": false,
        "requested_metrics": ["revenue", "ordered_units"],
        "physical_metrics": ["revenue", "ordered_units"]
      },
      "execution": {
        "logical_command_fingerprint": "3417544a",
        "physical_command_fingerprint": "c718533e",
        "command_transformed": true
      }
    },
    "result": {
      "error": {
        "source": "provider",
        "category": "rate_limit",
        "http_status": 429,
        "code": "8",
        "message": "Ozon API request failed. Raw provider error text is withheld from AI output; inspect local sanitized diagnostics.",
        "automatic_retry": false,
        "external_request_executed": true
      }
    }
  }
}
```

## Diagnosis

- Repeated identical business read failed with provider `HTTP 429`, code `8`.
- One logical command -> one physical request remains satisfied.
- Entitlement remains `SUPPORTED_AND_ENTITLED`.
- The previous failed call reported `last_provider_request_at=1788592764233` and `next_allowed_at=1788592829233`.
- This retry reports provider dispatch timestamp `1788592830937`, approximately `66.704 s` after the previous provider request and approximately `1.704 s` after the prior Bridge `next_allowed_at` boundary.
- Therefore simple violation of the Bridge-modeled 60 s family interval + 5 s safety boundary does not explain the repeated 429.
- Strongest current incident class: `TRANSIENT_ANALYTICS_METHOD_QUOTA_OR_PROVIDER_STATE / EXACT_TRIGGER_UNRESOLVED`.
- STD-20 remains active under `NO_SKIP_ON_FAILURE`.

Checkpoint:
`STD_20_ANALYTICS_REPEATED_429_AFTER_LOCAL_COOLDOWN_BOUNDARY_DIAGNOSTIC_ROLES_NEXT`
