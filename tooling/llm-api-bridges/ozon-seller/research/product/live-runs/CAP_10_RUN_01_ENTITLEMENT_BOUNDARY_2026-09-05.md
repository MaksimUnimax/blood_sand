# CAP-10 Run 01 — Premium Pro entitlement boundary

Date: 2026-09-05
Branch: `repair/ozon-date-contract-2026-09-04`
Bridge: `ozon-llm-api-bridge` `0.1.19`

## Intended capability

CAP-10 — Prices / price details.

Canonical question:

> Какие текущие цены установлены на товары моего каталога? Покажи цену по каждому SKU и выдели позиции, где Ozon отдаёт разные типы цены, скидочные или иные ценовые признаки. Используй отдельные данные Ozon о ценах, а не продажи или ручной экспорт.

## Run 01 command

```text
OZON_API_V1
{"operation":"product_price_details","params":{"skus":["1602711278","1602711870","1602715556","1602717077","1602722942","1611643847","1611695246","1623753672","1629493686","1629553898","1630033296","1630040194","1636041142","1636048691","1640251697","1640264403","1640276582","1640306007","1640326205","1640326230","1640330072","1640334195","1640337426","1720124782","1720131759","1720137256","1720141903","1720144370","1720147059","1720148880","1720151850","1720153914","1720155616","1720160556","1720161841","1842444165","1943215793","2183808182","2183921966","2183985513","2184098058","2184133137","2184153852","2184168890","2184199958","2184234912","2184932293","2186766628","2186796339","2186802133","2186836116","2186839757","2186843798","2186846833","2186848313","2186850644","2186852750","2186856503","2186857668","2186865070","2271188511","2271210394","2271219774","2271234726","2271240621","2271246783","2271251938","2271262133","2271270261","2271275793","2271285786","2271292556","2326866320","2559437928","2559748332","2559817779"]}}
```

## Full delivered result

```json
{
  "bridge": "ozon-llm-api-bridge",
  "version": "0.1.19",
  "delivery_mode": "sequential_batch_single_delivery",
  "result_count": 1,
  "capability_probe": {
    "performed": true,
    "status": "known",
    "subscription_type": "UNSPECIFIED",
    "http_status": 200,
    "error_code": null
  },
  "query_planner": {
    "status": "complete",
    "coalesced_group_count": 0,
    "coalesced_logical_count": 0,
    "logical_business_result_count": 0,
    "physical_business_request_count": 0
  }
}

===== OZON RESULT 1/1 =====

{
  "bridge": "ozon-llm-api-bridge",
  "version": "0.1.19",
  "request_id": "capability-33ed0f0d-94e2-4c59-87bf-9d18e07dc5fb",
  "operation": "product_price_details",
  "command": {
    "operation": "product_price_details",
    "fingerprint": "77ada4e1"
  },
  "request_meta": {
    "provider": "ozon",
    "host_alias": "seller_api",
    "http_method": "POST",
    "path_alias": "product_price_details",
    "external_request_executed": false,
    "capability_probe_executed": true,
    "capability_probe_http_status": 200
  },
  "http_status": 0,
  "elapsed_ms": 0,
  "pagination": null,
  "rate_limit": null,
  "planning": {
    "capability": {
      "is_premium": false,
      "probe_error_code": null,
      "probe_http_status": 200,
      "probe_performed": true,
      "status": "known",
      "subscription_type": "UNSPECIFIED"
    },
    "entitlement": {
      "entitlement_key": "POST /v1/product/prices/details",
      "exact_request_preserved": true,
      "partial": false,
      "reason": "endpoint_subscription_restriction",
      "required_subscription_types": [
        "PREMIUM_PRO"
      ],
      "rule_source": "reviewed-openapi-463-2026-08-19",
      "status": "SUPPORTED_BUT_NOT_ENTITLED"
    }
  },
  "result": {
    "error": {
      "source": "bridge",
      "category": "bridge_error",
      "http_status": 0,
      "code": "SUBSCRIPTION_REQUIRED",
      "message": "Этот запрос доступен только для Ozon Premium Pro.",
      "automatic_retry": false,
      "external_request_executed": false,
      "stage": "capability_planning"
    }
  }
}
```

## Diagnosis

This is an explicit capability/entitlement boundary, not a provider transport failure and not a business-request failure.

Evidence:

- capability probe succeeded: HTTP 200;
- detected subscription type: `UNSPECIFIED`;
- entitlement key: `POST /v1/product/prices/details`;
- required subscription: `PREMIUM_PRO`;
- entitlement status: `SUPPORTED_BUT_NOT_ENTITLED`;
- Bridge stopped at `capability_planning` before calling the business endpoint;
- `external_request_executed=false`;
- logical business result count = 0;
- physical business request count = 0;
- exact request preserved = true.

The active operation registry also contains the distinct all-account price surface `product_prices_bulk` -> `POST /v5/product/info/prices`, whose bundled entitlement rule is `ALL_ACCOUNTS`. CAP-10 therefore remains active and must continue through that surface rather than being skipped.

Checkpoint: `CAP_10_RUN_01_ENTITLEMENT_BOUNDARY_RECORDED_CONTINUE_WITH_ALL_ACCOUNT_PRICE_SURFACE`
