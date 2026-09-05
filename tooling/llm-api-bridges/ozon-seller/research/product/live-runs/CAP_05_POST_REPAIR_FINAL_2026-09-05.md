# CAP-05 — Stock turnover / stock analytics — FINAL

Status: PASS_WITH_PROVIDER_OMISSION_LIMIT

Canonical job:

`Какие товары у меня сейчас в дефиците, какие лежат с избытком или без продаж, и на сколько дней хватит запасов? Отсортируй самые проблемные позиции и используй отдельную аналитику оборачиваемости Ozon, а не рассчитывай это только из текущего остатка.`

## Evidence

Run 1: `stock_turnover_analytics` over all 76 current catalog SKUs returned HTTP 200, external request executed, exactly one logical and one physical business request, exact request preserved, no command transformation. The dedicated turnover surface returned 72 SKU rows.

Run 2: the four omitted SKUs were queried alone with the same dedicated surface and again returned HTTP 200 with `items:[]`, exact request preserved, one logical and one physical request. Therefore omission is provider-surface coverage behavior, not an API error and not a business zero.

Omitted SKUs: `1602711278`, `1602711870`, `2186856503`, `2559817779`. CAP-04 proves `2186856503` and `2559817779` currently have stock, so the empty turnover response cannot be interpreted as no stock/no sales/zero days.

## Findings from the 72 returned rows

Use provider-returned grades rather than inventing thresholds.

- Explicit no-sales case: SKU `2186802133` has `current_stock=7`, `ads=0`, `idc=null`, `turnover=null`, `idc_grade=GRADES_NOSALES`, `turnover_grade=GRADES_NOSALES`.
- Highest provider-critical turnover values include:
  - `2186852750` — turnover `794`, `GRADES_CRITICAL`;
  - `1640326230` — `723`, `GRADES_CRITICAL`;
  - `2184168890` — `595`, `GRADES_CRITICAL`;
  - `2271246783` — `466`, `GRADES_CRITICAL`;
  - `1720155616` — `441.67`, `GRADES_CRITICAL`.
- There are 12 returned rows with `current_stock=0`: `1611643847`, `1640330072`, `1720144370`, `1720148880`, `2186857668`, `1720124782`, `1720141903`, `2183921966`, `1720153914`, `1720160556`, `2186836116`, `2271210394`.
- Do not relabel those 12 as provider `DEFICIT` when the returned provider grade itself is different; report the factual zero current stock separately from Ozon's grade.

## Classification

- capability_recognition: PASS
- operation_or_cluster_selection: PASS
- discovery_help_usage_when_needed: NOT_NEEDED
- multi_run_orchestration: PASS
- business_answer: PASS_WITH_PROVIDER_OMISSION_LIMIT
- operator_intervention_required: NO
- bridge_guidance_gap: COVERAGE
- operational_reliability: PASS

The worker correctly preserved the business job after detecting incomplete 72/76 coverage and verified the four missing SKUs instead of hallucinating zeros.

Checkpoint: `CAP_05_PASS_WITH_PROVIDER_OMISSION_LIMIT_CAP_06_READY`
