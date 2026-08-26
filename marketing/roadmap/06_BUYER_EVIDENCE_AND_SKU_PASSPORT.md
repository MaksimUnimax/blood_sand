# 06 — Buyer evidence + полный паспорт SKU

Статус: **[~] IN PROGRESS — PLAN FIXED; NEXT 06.1**  
Дата старта: **2026-08-26**

## Цель

Связать opportunity map R3 с **реальным ассортиментом Blood & Sand**, seller-side marketplace facts и покупательским evidence, чтобы перед конкурентами/экономикой понимать:

- какие реальные SKU закрывают OU01–OU08;
- какие product families действительно существуют в ассортименте;
- чем отличаются близкие SKU/варианты;
- что покупателю важно при выборе и использовании;
- какие товарные факты уже доказаны, а какие ещё отсутствуют;
- какие seller/platform facts можно использовать дальше без подмены их гипотезами.

Пункт 06 **не назначает финальную IA/Page Jobs** и **не считает экономику канала**. Эти решения остаются за последующими stages.

## Canonical inputs

- `marketing/research/R3_OPPORTUNITY_MAP_FINAL_2026-08-26.md`
- `marketing/data/ledger/query_evidence_ledger.csv`
- `marketing/research/CUSTOMER_EVIDENCE_AUTO_PENDANTS_2026-08-01.md`
- `marketing/data/registry/marketplace_measurements.csv`
- `marketing/data/raw/marketplace/ozon/`
- `marketing/data/DATA_SCHEMA_CONTRACT.md`

## Evidence discipline

1. Product identity, listing identity, marketplace SKU and seller offer/article are separate fields.
2. Dynamic facts (price, stock, orders, revenue, rating) are always dated/period-scoped.
3. Revenue is not margin/profit.
4. Sales/performance do not prove buyer motivation.
5. Product title can support identity/form-factor facts, but not unobserved material/quality/meaning claims.
6. Customer reasons require customer/review/question evidence; they are not inferred from order counts.
7. Missing physical/product facts remain `NOT_MEASURED` / `NOT_AVAILABLE`; they are never reconstructed from competitors.
8. Marketplace evidence is separated by platform. Ozon facts do not imply Wildberries facts.
9. No personal data is collected or persisted beyond what is necessary for aggregate research.
10. Extension/bridge engineering is not Stage 06 work; existing tooling is only a collection channel.
11. Every completed evidence pass is committed before moving on.
12. No final IA/Page Job is frozen in Stage 06.

---

# 06.1 — Existing evidence inventory + passport schema

Status: **[ ] NEXT**  
Estimated: **1 run**

Work:
- inventory all already-committed Ozon seller measurements, customer evidence and SKU-relevant artifacts;
- distinguish direct current/historical facts from gaps;
- define canonical Product/SKU/Listing/Passport schema;
- create provisional mapping of directly identifiable high-priority SKUs to OU01–OU08;
- identify which dynamic facts require a fresh snapshot.

Expected result:
- Stage 06 evidence/gap matrix;
- canonical SKU passport schema;
- no unnecessary API calls for facts already present.

Completion criterion:
- exact list of reusable evidence and exact missing fields is fixed in GitHub.

# 06.2 — Fresh Ozon assortment/listing baseline

Status: **[ ] WAIT**  
Estimated: **1–3 runs depending on explicit pagination/operations**

Work:
- verify the exact current v0.1.19 bridge command contract from the repository before execution;
- obtain a fresh explicit seller-side enumeration/current listing identity snapshot;
- obtain only the additional product/listing facts required by the passport and supported by the current bridge;
- preserve explicit pagination and request provenance;
- normalize Product ↔ Listing ↔ SKU ↔ offer/article identity.

Expected result:
- current Ozon assortment baseline;
- historical Aug-11 stock/analytics evidence retained rather than overwritten.

Completion criterion:
- every listing returned by the chosen canonical fresh enumeration has stable identity or explicit unresolved identity status.

# 06.3 — Map real assortment to opportunities / product families

Status: **[ ] WAIT**  
Estimated: **1–2 runs**

Work:
- map actual sellable/current SKUs to OU01–OU08;
- resolve real Veles hierarchy: broad `Велес` family vs `Печать Велеса` specific form/variants;
- separate automotive protection/use-case from mirror-pendant form factor at product level;
- confirm actual Алатырь, Vegvisir and Шлем Ужаса variants;
- evaluate whether a coherent zodiac SKU family exists in the actual assortment;
- identify products that do not map cleanly to the current opportunity set.

Expected result:
- canonical product-family/opportunity map;
- no query-demand double counting.

Completion criterion:
- every in-scope SKU is mapped to one or more opportunity/use-case relations or explicit `UNMAPPED/UNKNOWN`.

# 06.4 — Buyer/customer evidence + seller performance linkage

Status: **[ ] WAIT**  
Estimated: **1–3 runs**

Work:
- normalize existing customer-evidence themes from reviews/cards;
- add owned/seller-side customer evidence only through supported read surfaces when available;
- normalize Ozon ordered_units/revenue by exact period and SKU;
- distinguish product performance from buyer motivation;
- record recurring buyer concerns: appearance in car, size, material/finish, attachment/cord, heat/sun exposure, packaging/gift, trust/reviews;
- do not invent review themes for SKUs lacking direct customer evidence.

Expected result:
- buyer-choice/theme matrix linked to product families where supportable;
- performance facts linked to product IDs/SKUs with period provenance.

Completion criterion:
- observed customer evidence and derived analysis are explicitly separated.

# 06.5 — Cross-platform status / Wildberries gap

Status: **[ ] WAIT**  
Estimated: **1 run if evidence already accessible; otherwise blocker documentation**

Work:
- determine whether current authorized tooling/data can provide WB seller-side assortment/listing evidence;
- if yes, normalize cross-platform listing identity;
- if not, explicitly record WB as a Stage 06 evidence gap without substituting public Search snippets for seller data;
- do not start extension development inside this Stage 06 research line.

Expected result:
- explicit Ozon↔WB coverage status;
- no false claim of full cross-platform master.

Completion criterion:
- every platform is either measured or explicitly `BLOCKED/NOT_AVAILABLE` with reason.

# 06.6 — Final SKU passports + Stage 07 handoff

Status: **[ ] WAIT**  
Estimated: **1–2 runs**

Work:
- publish normalized SKU passport master;
- produce decision report by opportunity/product family;
- mark all missing technical content facts required for future product pages;
- update Query Evidence Ledger `customer_evidence_status` / `marketplace_evidence_status` only where traceable;
- hand competitor questions to Stage 07.

Expected result:
- complete-enough product/SKU research layer for competitor/economics work;
- explicit unresolved facts instead of guesses.

Completion criterion:
- every current Ozon listing in the chosen baseline has a passport row;
- OU01–OU08 have real-assortment mapping or explicit gap;
- technical/customer/performance facts have provenance and statuses;
- WB coverage status is explicit;
- no final IA/Page Jobs assigned.

---

# Canonical passport field groups

## Identity
- `product_master_id`
- `family_id`
- marketplace
- seller offer/article
- marketplace product/listing id
- marketplace SKU
- title
- listing/status state

## Classification
- symbol/name
- tradition/family (only when directly supportable)
- opportunity IDs
- use-case relations
- zodiac sign / named variant where directly explicit
- parent/variant relation

## Physical/content facts
- medallion dimensions/thickness/weight
- total pendant length
- material / finish / coating
- cord material/length/adjustment
- bead count/material/size
- attachment construction
- mirror-hanging construction
- tassel material
- packaging / contents
- media references
- claim + claim-status

Missing facts remain explicit `NOT_MEASURED` / `NOT_AVAILABLE`.

## Marketplace/commercial observations
- dated price
- dated stock by fulfillment type
- ordered units + exact period
- revenue + exact period
- rating/review count + observed date when available

## Customer evidence
- review/question/praise/complaint/usage/gift theme
- source reference
- product relation
- observed/paraphrased evidence
- confidence/status

## Provenance
- measurement IDs
- observation IDs
- raw refs
- observed_at + precision
- record status

---

# Current known Stage 06 starting condition

Direct repository evidence already exists for:
- Ozon stocks snapshot dated 2026-08-11;
- multiple Ozon SKU analytics periods, including ordered_units/revenue;
- historical customer evidence for auto pendants / Печать Велеса-like products;
- no normalized canonical product/SKU passport master yet;
- Wildberries seller bridge/tooling is not currently an available accepted data channel in `main`.

Therefore Stage 06 starts by reusing committed evidence, not by re-collecting everything blindly.

## Current continuation point

**NEXT: 06.1 — evidence inventory + canonical passport schema + provisional direct SKU↔opportunity mapping.**
