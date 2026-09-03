# RAW NEW-02 Run2 — report_info

Verbatim normalized bridge result from operator channel.

```text
OZON_BATCH_RESULT_V1
bridge=ozon-llm-api-bridge
version=0.1.19
delivery_mode=sequential_batch_single_delivery
result_count=1
capability_probe.performed=false
capability_probe.status=not_needed
capability_probe.subscription_type=UNKNOWN
query_planner.status=complete
query_planner.coalesced_group_count=0
query_planner.coalesced_logical_count=0
query_planner.logical_business_result_count=1
query_planner.physical_business_request_count=1

OZON_RESULT_V1
request_id=fe38e833-2029-4f41-8f57-49ad5a258499
operation=report_info
command.fingerprint=2d41fb57
provider=ozon
host_alias=seller_api
http_method=POST
path_alias=report_info
external_request_executed=true
http_status=200
elapsed_ms=1333
pagination=null
rate_limit=null
entitlement.capability_required=false
entitlement.entitlement_key=POST /v1/report/info
entitlement.exact_request_preserved=true
entitlement.partial=false
entitlement.reason=all_accounts
entitlement.rule_source=reviewed-openapi-463-2026-08-19
entitlement.status=SUPPORTED_AND_ENTITLED
execution.logical_command_fingerprint=2d41fb57
execution.physical_command_fingerprint=2d41fb57
execution.command_transformed=false
result.code=REPORT_seller_returns_v2_2093109_1788405276_01a06542-ddb2-7a28-85ac-cd9447fa91a6
result.status=success
result.error=(empty)
result.file=[REDACTED]
result.report_type=seller_returns_v2
result.params={}
result.created_at=2026-09-03T03:14:36.095325Z
result.expires_at=2026-09-06T03:14:36.095325Z
result.additional_data=[]
report_file_ref=rpf_c5978670-1bbe-47f5-9838-e843614a2514
```
