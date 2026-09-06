# CAP-22 Run 02 — pricing_strategy_ids_by_product_ids — provider 403 permission boundary

Date: 2026-09-06
Status: `PROVIDER_PERMISSION_BOUNDARY_CONTINUE`

Target own product authority:
- SKU `1636048691`
- Seller product_id `1119965443`
- offer_id `Печать Велеса`

Operation: `pricing_strategy_ids_by_product_ids`
Request ID: `7150e242-422d-4f58-9510-2d6f9524b332`
Provider surface: Seller API `POST /v1/pricing-strategy/strategy-ids-by-product-ids`

Execution evidence:
- HTTP `403`
- provider error category: `auth_or_permission`
- provider error code: `7`
- external request executed: `true`
- automatic retry: `false`
- capability probe: not needed / not executed
- exact request preserved: `true`
- command transformed: `false`
- logical business result count: `1`
- physical business request count: `1`

Bridge entitlement metadata at execution time:
- status: `SUPPORTED_AND_ENTITLED`
- reason: `all_accounts`
- capability_required: `false`
- rule source: `reviewed-openapi-463-2026-08-19`

Interpretation:
- Run 02 is a real provider execution, not a local validation/guidance failure;
- the provider denied this exact endpoint for the active seller/API-key context with HTTP 403;
- HTTP 403 MUST NOT be interpreted as an empty strategy linkage, so no conclusion can be made that product `1119965443` has no pricing strategy;
- no competitor was discovered by this run;
- the live provider result contradicts the Bridge's static `all_accounts / SUPPORTED_AND_ENTITLED` projection for this endpoint and is therefore entitlement-boundary evidence that must be preserved explicitly;
- no automatic retry, hidden fanout, or manual competitor selection is allowed;
- CAP-22 remains open and may continue only through the alternate read-only pricing-strategy discovery surfaces already authorized by the CAP-22 setup.

Commercial-value significance:
- direct own-product competitor discovery is not reliably available through this endpoint in the tested seller context;
- this reduces the proven coverage of competitor-analysis automation unless an alternate current Bridge surface can discover an Ozon-proven competitor;
- the boundary is commercially material because the product must distinguish a real competitor-discovery capability from unsupported/manual competitor selection.

Frozen next step:
- probe `pricing_strategy_list` with explicit `page=1`, `limit=20` as the minimum alternate strategy-discovery read permitted by the CAP-22 setup;
- if a strategy is returned, continue only with explicit strategy evidence;
- if alternate pricing-strategy surfaces are also denied/unavailable and no Ozon competitor can be proven, close CAP-22 with `COMPETITOR_DISCOVERY_COVERAGE_BOUNDARY` rather than inventing a competitor.
