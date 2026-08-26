# Ozon runtime evidence — `seller_product_info_list` rejected locally

Date: 2026-08-26
Observed local time: 16:39 UTC+05:00
Stage: Roadmap 06 targeted passport enrichment

## Attempted command

```text
OZON_API_V1
{"operation":"seller_product_info_list","params":{"sku":["1636048691","1636041142","1640251697","1602722942","1602717077"]}}
```

## Direct bridge result

```text
OZON_BATCH_RESULT_V1
{
  "bridge": "ozon-llm-api-bridge",
  "version": "0.1.19",
  "delivery_mode": "sequential_batch_single_delivery",
  "result_count": 1,
  "capability_probe": {
    "performed": false,
    "status": "not_resolved",
    "subscription_type": null,
    "http_status": 0,
    "error_code": null
  },
  "query_planner": {
    "status": "pending",
    "coalesced_group_count": 0,
    "coalesced_logical_count": 0,
    "logical_business_result_count": 0,
    "physical_business_request_count": 0
  }
}

===== OZON RESULT 1/1 =====

OZON_GUIDANCE_RESULT_V1
{
  "bridge": "ozon-llm-api-bridge",
  "version": "0.1.19",
  "guidance_version": "1",
  "status": "cluster_required",
  "cluster": null,
  "external_request_executed": false,
  "physical_business_request_count": 0,
  "error": "UNSUPPORTED_OPERATION",
  "choices": [
    {"cluster":"sales_analytics","description":"Sales, revenue and ordered-unit analytics."},
    {"cluster":"stock_inventory","description":"Current stock by product or offer ID."},
    {"cluster":"search_visibility","description":"Buyer search queries and visibility for selected SKUs."},
    {"cluster":"fulfillment_supply","description":"Read-only FBO postings and supply orders."},
    {"cluster":"advertising_performance","description":"Read-only advertising campaigns and statistics."},
    {"cluster":"account_access","description":"Roles available to configured Seller credentials."}
  ],
  "diagnostic": {
    "error_code": "UNSUPPORTED_OPERATION",
    "top_level_keys": ["operation","params"],
    "intent": {"operation":"seller_product_info_list"}
  }
}
```

## Evidence classification

- external Seller business request executed: **false**
- physical business request count: **0**
- Ozon HTTP response: **not reached**
- failure class: **LOCAL_RUNTIME_OPERATION_REGISTRY_MISMATCH**
- observed runtime guidance protocol: **V1 six-cluster inventory**
- attempted operation is part of accepted B1+ read core, so this result proves the running 0.1.19 build is not the accepted B8 production tree even though the manifest/version string remains `0.1.19`.

This result must not be interpreted as Ozon rejecting the endpoint, credentials lacking access, or the Seller API operation being unavailable.
