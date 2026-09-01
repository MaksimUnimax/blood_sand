# Ozon Bridge — Performance clustering, command inventory and bounded-response plan

Date: 2026-09-01  
Status: `SWAGGER_DELTA_FOUND_REFRESH_CURRENT_SURFACE_BEFORE_AD_PATCH`  
Scope: Ozon API behavior and command guidance only. UI excluded.

## Owner-ordered sequence — do not reorder

1. Generic advertising `campaigns` request -> use explicit `page` / `pageSize` and return a bounded result.
2. `latest` / `newest` -> deterministic local newest-first ordering only after the single provider response when Ozon has no server sort; report this fact in result metadata.
3. Campaigns/statistics by product -> use product-oriented Performance endpoints instead of dumping all campaigns.
4. Concrete campaigns -> use `campaignIds`.
5. Active campaigns -> use `state`.
6. Preserve clustering as AI -> local Bridge guidance -> NEW exact AI command -> one Ozon business request; guidance itself performs zero provider requests.
7. Audit all current operations and latest Swagger before production clustering changes.
8. Produce/review a complete current operation inventory.
9. ONLY AFTER the current operation surface is refreshed and owner-reviewed, implement advertising sorting/bounded-response behavior.
10. Persist each gate in GitHub.

## Invariants

- One explicit business command -> at most one physical Ozon business request.
- No hidden pagination.
- No hidden retry.
- No hidden fan-out.
- No autonomous follow-up provider chain.
- Guidance/refinement choices never execute themselves.
- Personal Data gate semantics remain unchanged.
- Seller and Performance provider isolation remains unchanged.
- Current operations must not silently disappear during clustering refactor.

## Completed gates

- [x] Current clustering/guidance implementation inspected.
- [x] Purpose and AI -> guidance -> AI exact command -> provider flow documented.
- [x] Production registry before Swagger refresh counted: `270` aliases = `245 Seller + 25 Performance`.
- [x] Latest pre-refresh 26 Seller aliases checked: `26/26` present.
- [x] Current cluster distribution audited: `13` top-level clusters, `50` sections.
- [x] Stale startup guidance found: only six clusters advertised; runtime already has section-aware `OZON_HELP_V2`.
- [x] Advertising under-clustering identified: 25 Performance aliases are currently split into only two sections.
- [x] `PROPOSED_CLUSTERING_V2_2026-09-01.md` created.
- [x] Reproducible operation exporter created.
- [x] Owner supplied fresh Seller and Performance Swagger files.
- [x] Fresh Swagger comparison completed and persisted in `CURRENT_SWAGGER_DELTA_AUDIT_2026-09-01.md/.json`.

## Fresh Swagger gate result

### Performance

- current uploaded Swagger operations: `48`;
- frozen 2026-08-29 authority operations: `48`;
- files are byte-for-byte identical;
- new operation keys: `0`;
- removed operation keys: `0`;
- terminal universe remains `21 read / 9 server-side generation / 16 mutation / 2 deprecated`;
- no newly discovered Performance read endpoint.

### Seller

- frozen 2026-08-25 authority operations: `463`;
- current uploaded Swagger operations: `465`;
- added operation keys: `2`;
- removed operation keys: `0`;
- existing 463 operation objects changed: `0`;
- existing component schemas changed: `0`;
- seven schemas were added only for the two new operations.

New reads missing from current production:

1. `POST /v1/description-category/dependent-attributes`
   - proposed alias: `description_category_dependent_attributes`
   - cluster/section: `catalog_products / attributes_categories`
   - classification candidate: `READ_SAFE`, `safe_projection`.

2. `POST /v1/description-category/dependent-attributes/values`
   - proposed alias: `description_category_dependent_attribute_values`
   - cluster/section: `catalog_products / attributes_categories`
   - classification candidate: `READ_SAFE`, `safe_projection`
   - explicit caller-controlled `cursor`; no hidden pagination.

## Currentness cleanup discovered

Two currently exposed read aliases remain present in current Swagger but their operation descriptions carry past shutdown dates:

- `fbs_stock_by_warehouse_v1` -> replacement `/v2/product/info/stocks-by-warehouse/fbs` is already implemented.
- `fbs_carriage_available_list` -> replacement `/v2/carriage/delivery/list` is already implemented.

Do not silently remove or count them as current. Resolve terminal/currentness status explicitly before freezing new counts.

Upcoming:
- `finance_transaction_list_v3` is documented for shutdown 2026-09-08; accrual replacements are already implemented.

## Current gate

Before any advertising production patch:

- [ ] Add/classify the two new Seller dependent-attribute reads.
- [ ] Resolve the two past-shutdown exposed read aliases as current vs sunset/replaced.
- [ ] Regenerate the complete operation inventory and cluster coverage from the refreshed surface.
- [ ] Owner reviews/accepts the refreshed inventory.

## Explicitly blocked until refreshed inventory review

- [ ] Production clustering refactor.
- [ ] Advertising post-result `refinement_choices`.
- [ ] Generic `performance_campaigns` bounded default.
- [ ] `latest/newest` local-sort result-view behavior.
- [ ] Advertising targeted regression/live retest.

## Planned advertising behavior after unblock

For a broad/underspecified advertising request Bridge returns guidance or, after one broad provider response, a bounded result plus explicit choices. AI must send a NEW exact command to execute a choice.

Supported refinement intentions:

- page: `performance_campaigns` + `page/pageSize`;
- active: `performance_campaigns` + `state`;
- specific: `performance_campaigns` + `campaignIds`;
- by product: product-oriented Performance reads;
- latest/newest: local ordering by documented response date fields after a single provider response, explicitly marked as local.

No refinement may trigger an automatic second Ozon request.

## Live reliability finding motivating advertising maintenance

`performance_campaigns` returned 1128 full campaign objects in one successful provider response. The model-visible batch was ~1.35 MB and ChatGPT displayed a connection-interrupted message. Provider correctness passed; bounded model-visible result behavior is still required.
