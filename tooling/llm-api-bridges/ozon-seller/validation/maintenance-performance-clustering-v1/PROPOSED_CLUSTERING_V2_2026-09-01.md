# Proposed Ozon command clustering V2

Date: 2026-09-01
Status: PROPOSAL_ONLY — no production clustering or advertising sorting patch applied yet.

## Design principles

1. Preserve existing top-level cluster IDs where possible for backward compatibility.
2. Make `OZON_HELP_V2` the primary documented guidance path: cluster -> section -> exact operation/template.
3. Guidance never executes Ozon business requests.
4. A returned guidance/refinement choice is only a suggestion. AI must send a NEW explicit `OZON_API_V1` command to execute it.
5. Valid broad results may include post-result `refinement_choices`, but Bridge must not execute any of them automatically.
6. Keep one explicit business command -> at most one physical provider business request.
7. No hidden pagination, retry, fan-out, polling or command chaining.

## Proposed top-level clusters

Keep the current 13 top-level IDs. The major change is section granularity, because renaming all top-level IDs creates unnecessary compatibility risk.

### `account_access`

Proposed sections:
- `roles_access` — roles / API access.
- `seller_profile` — seller identity and safe account data.
- `notifications` — `notification_list`, `notification_push_type_list`.
- `logistics_settings` — seller logistics settings.

### `catalog_products`

Proposed sections:
- `product_list_info`
- `attributes_categories`
- `content_media` — descriptions + pictures.
- `certification`
- `visibility_quant_placement`
- `limits_diagnostics`

### `prices_promotions`

Proposed sections:
- `prices`
- `pricing_strategy`
- `promotions_catalog`
- `discount_requests` — including `discount_task_list_v2`.

### `stocks_inventory`

Proposed sections:
- `current_aggregate`
- `warehouse_fbo`
- `warehouse_fbs`
- `analytics_turnover`

### `sales_analytics`

Proposed sections:
- `core_metrics`
- `seller_ratings`
- `fbs_quality_errors`

### `search_visibility`

Proposed sections:
- `product_queries`
- `query_details`
- `marketplace_search_queries`

### `orders_postings`

Proposed sections:
- `fbo_postings`
- `fbs_postings`
- `fbp_postings`
- `assembly_carriage`
- `pickup_handover`
- `exemplars_marking` — exemplar status/create/validate and posting marks.
- `digital_international` — digital postings and ETGB/international document reads.
- `labels_documents`

### `supplies_fbo`

Proposed sections:
- `supply_orders`
- `fbp_orders_archive` — FBP order/archive list/get operations.
- `drafts`
- `passes` — including `arrival_pass_list` and supply pass/status reads where semantically applicable.
- `timeslots`
- `cargoes`
- `acts_labels`

### `warehouse_logistics`

Proposed sections:
- `seller_warehouses`
- `ozon_warehouses_clusters`
- `delivery_methods`
- `delivery_points_maps`
- `delivery_checkout_checks` — Personal Data gated phone/buyer delivery calculations.
- `warehouse_diagnostics`

### `returns_cancellations`

Proposed sections:
- `returns_fbs_rfbs`
- `return_giveout`
- `removals_utilization`
- `cancellations_checks`

### `finance`

Proposed sections:
- `accruals_balance`
- `transactions`
- `realization`
- `reports_documents`
- `receipts_invoices_b2b`

### `reviews_questions`

Proposed sections:
- `reviews`
- `questions_answers`
- `chats`

### `advertising_performance`

This cluster needs the largest rework.

Proposed sections:

#### `campaign_discovery`
- `performance_campaigns`

Command/refinement variants presented to AI should include exact new-command templates for:
- bounded page: `page` + `pageSize`;
- active campaigns: `state=CAMPAIGN_STATE_RUNNING` + page/pageSize;
- specific campaigns: `campaignIds`;
- campaign type: `advObjectType`;
- latest/newest: a future explicit Bridge result-view option based on documented response fields `createdAt` / `updatedAt` / `fromDate`; Ozon's campaign-list endpoint itself documents no sort parameter.

#### `campaign_products_objects`
- `performance_campaign_objects`
- `performance_campaign_products`
- `performance_search_promo_products`
- `performance_products_with_bonuses`

#### `bids`
- `performance_bid_limits`
- `performance_min_bid_by_sku`
- `performance_competitive_bids`
- `performance_cpo_min_bids`

#### `statistics_json`
- `performance_expense`
- `performance_daily`
- `performance_campaign_product`
- `performance_media`
- `performance_sku_statistics`

#### `statistics_exports`
- `performance_expense_csv`
- `performance_daily_csv`
- `performance_campaign_product_csv`
- `performance_media_csv`
- `performance_statistics_report_download`

#### `report_workflow`
- `performance_statistics_status`
- `performance_statistics_list_ui`
- `performance_statistics_list_api`

#### `external_traffic`
- `performance_vendor_statistics_list`
- `performance_vendor_statistics_status`
- `performance_vendor_tag`

## Advertising two-step refinement flow

Two guidance modes should coexist.

### A. Existing pre-execution guidance

Used when the command is invalid/underspecified before provider execution:

AI -> Bridge guidance -> exact next command -> Bridge -> Ozon.

Provider requests during guidance: `0`.

### B. New post-result refinement guidance for broad valid reads

Used after an exact broad read such as `performance_campaigns`:

1. AI sends an exact broad `performance_campaigns` command.
2. Bridge performs exactly one Performance API business request.
3. Bridge receives the Ozon response.
4. Bridge emits a bounded model-visible result plus `refinement_choices` containing exact NEW-command templates that are valid for this operation/domain.
5. AI chooses one refinement and sends a new explicit command.
6. Bridge executes exactly that new command with at most one provider request.

Bridge must never auto-run the refinement choice.

Example refinement cards after campaigns result:

```json
{
  "refinement_choices": [
    {
      "id": "campaigns_page",
      "command": {"operation":"performance_campaigns","params":{"page":1,"pageSize":100}}
    },
    {
      "id": "campaigns_active",
      "command": {"operation":"performance_campaigns","params":{"state":"CAMPAIGN_STATE_RUNNING","page":1,"pageSize":100}}
    },
    {
      "id": "campaigns_specific_ids",
      "command": {"operation":"performance_campaigns","params":{"campaignIds":["CAMPAIGN_ID"]}}
    },
    {
      "id": "campaign_products",
      "command": {"operation":"performance_campaign_products","params":{"campaignId":"CAMPAIGN_ID","page":1,"pageSize":100}}
    },
    {
      "id": "campaign_product_statistics",
      "command": {"operation":"performance_campaign_product","params":{"dateFrom":"YYYY-MM-DD","dateTo":"YYYY-MM-DD"}}
    }
  ]
}
```

The future `latest/newest` choice must be implemented only after owner review of the complete command inventory. It should be explicit about whether ordering is provider-native or local. Current official `/api/client/campaign` parameters are only `campaignIds`, `advObjectType`, `state`, `page`, `pageSize`; there is no documented server sort parameter. The response does document `createdAt`, `updatedAt`, `fromDate`, and `toDate`, so deterministic local ordering is technically possible after the single provider response.

## Documentation changes proposed after inventory review

- Replace the stale six-item startup cluster list with all current top-level clusters.
- Document `OZON_HELP_V2` as primary help command.
- Keep V1 support only for backward compatibility.
- Add examples showing cluster -> section -> operation selection.
- Document distinction between `266` authority endpoint reads and `270` executable command aliases (4 Performance JSON variants).

## Patch gate

No production code in clustering or Performance result sorting is to be changed until the owner downloads/reviews the complete current command JSON and confirms the inventory.
