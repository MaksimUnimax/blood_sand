# STD-10 Run 4 — fresh aggregate product state and final closure

Date: 2026-09-02
Question: `На складе Ozon был пожар или авария. Был ли там мой товар, что с ним сейчас и что мне нужно контролировать?`
Target incident warehouse: `САМАРА_РФЦ`, warehouse_id `23128509046000`.
Historically exposed SKUs from Run 2:
- `2271188511` — `Знак зодиака "Лев" (Символы)`;
- `1720141903` — `Знак зодиака "Водолей"`.

## Bridge run

Operation: `seller_product_info_list`
Request id: `349175bb-12a0-47dc-bb19-de53d45bc9bc`
Endpoint: `POST /v3/product/info/list`
HTTP: `200`
Elapsed: `1404 ms`
Physical business requests: `1`
External request executed: `true`
Entitlement: `SUPPORTED_AND_ENTITLED / all_accounts`
Exact request preserved: `true`
Command transformed: `false`
Bridge pagination metadata: `null`

## SKU 2271188511 — Лев (Символы)

Current product state:
- `is_archived=false`;
- `is_autoarchived=false`;
- `status_name=Продается`;
- `moderate_status=approved`;
- `validation_status=success`;
- `errors=[]`;
- `visibility_details.has_price=true`;
- `visibility_details.has_stock=true`;
- availability `AVAILABLE` with no reasons;
- `stocks.has_stock=true`.

Current stock:
- FBO: `present=4`, `reserved=0`;
- FBS: `present=43`, `reserved=0`.

Using the project convention `free = present - reserved`:
- free FBO = `4`;
- free FBS = `43`;
- total present = `47`;
- total reserved = `0`;
- total free = `47`.

Run 3 already proved the incident warehouse itself is explicitly `present=0,reserved=0` for this SKU while the 4 FBO units are distributed across other warehouses.

Interpretation: this historically Samara-exposed SKU is currently healthy and sellable outside Samara. There is no current total-stockout or listing/availability failure.

## SKU 1720141903 — Водолей

Current product state:
- `is_archived=false`;
- `is_autoarchived=false`;
- `status_name=Продается`;
- `moderate_status=approved`;
- `validation_status=success`;
- `errors=[]`;
- `visibility_details.has_price=true`;
- `visibility_details.has_stock=true`;
- availability `AVAILABLE` with no reasons;
- `stocks.has_stock=true`.

Current stock:
- FBO: `present=1`, `reserved=1`;
- FBS: `present=43`, `reserved=0`.

Using the project convention `free = present - reserved`:
- free FBO = `0`;
- free FBS = `43`;
- total present = `44`;
- total reserved = `1`;
- total free = `43`.

Run 3 already proved the incident warehouse itself is explicitly `present=0,reserved=0` for this SKU.

Interpretation: this historically Samara-exposed SKU is **not** in a total-stockout. The current issue is FBO placement/scarcity only: the single FBO unit is reserved, while 43 free FBS units remain. The card is still sellable and available.

## Final STD-10 business answer

### Was seller product at the affected warehouse?

**YES, at the evidence level supported by Seller API historical FBO postings.**

Run 2 found two seller postings attributed to the exact affected `САМАРА_РФЦ` / warehouse `23128509046000` immediately before the 2026-08-22 incident:
- `2271188511` Лев (Символы), created 2026-08-20, later delivered;
- `1720141903` Водолей, created 2026-08-21, later cancelled by Ozon with reason 695 `Не удалось доставить заказ`.

The cancellation must not be causally attributed to the incident because the Seller API evidence does not expose a cancellation timestamp or incident marker.

### What is the current state?

As of the current 2026-09-02 reads:
- both exposed SKUs have explicit `0/0` current FBO stock at `САМАРА_РФЦ`;
- both cards are active, approved, validation-successful, priced, stocked and `AVAILABLE`;
- Лев (Символы): 4 FBO + 43 FBS, total free 47;
- Водолей: 1 FBO reserved + 43 FBS free, total free 43.

Thus there is no evidence of a current total inventory loss for either SKU. The meaningful current operational concern is `Водолей`'s FBO allocation: zero free FBO despite healthy FBS stock.

### What should the seller control?

Evidence-backed controls:
1. Do not treat `ozon_warehouse_list.is_active=true` as proof of normal post-incident operation; the incident warehouse must be checked via operational/current business surfaces rather than registry state alone.
2. Keep `САМАРА_РФЦ` exposure separate from current placement: both exposed SKUs are zero at Samara now.
3. Monitor/replenish FBO allocation for `Водолей` if FBO availability is commercially important; current free FBO is zero while FBS is healthy.
4. Treat Ozon cancellation reason 695 on the pre-incident `Водолей` posting as an incident-relevant correlation to watch, not proof of incident causality.
5. If the business requires proof of physical units destroyed/damaged inside the warehouse, write-off compensation, or incident-caused loss, current evidence is insufficient: no historical 2026-08-22 stock snapshot or causal compensation/write-off record has been established in this test.

## Coverage boundary

STD-10 proves that Bridge + public incident evidence can answer:
- exact warehouse incident match;
- historical seller exposure via postings;
- current per-SKU warehouse placement;
- current aggregate FBO+FBS availability and sellability.

It does **not** prove from the collected surfaces:
- exact physical inventory remaining inside the building at incident time;
- destruction/damage of specific physical units;
- causal link between incident and a specific cancellation;
- compensation/write-off attributable to the incident.

Those are preserved as coverage limits rather than guessed conclusions.

## Final classification

Business answerability: `PASS_WITH_EXPLICIT_INCIDENT_CAUSALITY_AND_HISTORICAL_SNAPSHOT_LIMITS`.
Operational reliability: `PASS_ALL_STD10_PROVIDER_READS`.
Operator business steering: `NO`.
Provider/API incidents during STD-10: `NONE`.
Runs: `4`.

STD-10 is complete under `NO_SKIP_ON_FAILURE`.

Checkpoint:
`STD_10_COMPLETE_EXPOSURE_PROVEN_CURRENT_PRODUCTS_HEALTHY_SAMARA_ZERO_AQUARIUS_FBO_ALLOCATION_RISK_STD_11_READY`
