# R4 — Stage 06 current assortment → opportunity mapping — 2026-08-26

Status: **06.3 MAPPING PASS COMPLETE**

## Scope

Map the fresh proven-current 76 Ozon listing identities to accepted R3 opportunity lanes without inventing product facts, buyer motives or final site architecture.

Canonical relation file:
- `marketing/data/normalized/products/product_opportunity_map.csv`

Fresh identity basis:
- `marketing/data/normalized/marketplace/ozon/20260826__ozon__product-master__fresh-current76.csv`
- fresh terminal proof: `marketing/data/raw/marketplace/ozon/20260826__ozon__stocks-current__fresh-terminal.md`

R3 boundary basis:
- `marketing/research/R3_OPPORTUNITY_MAP_FINAL_2026-08-26.md`
- `marketing/research/R3_OPPORTUNITY_OVERLAP_AND_JOB_BOUNDARIES_2026-08-26.md`

## 1. Coverage validation

- fresh current marketplace identities: **76**;
- identities represented in `product_opportunity_map.csv`: **76/76**;
- relation/unmapped rows: **93**;
- identities with at least one accepted/reopen relation: **67**;
- identities with no accepted R3 relation: **9**;
- unresolved identity joins: **0**.

Opportunity relation counts below are identity counts, not additive populations; one SKU may satisfy multiple jobs.

| Opportunity | Current identities related | Historical 90d ordered units on those identities* | Relation interpretation |
|---|---:|---:|---|
| OU01 Slavic category | 25 | 928 | `CATEGORY_MEMBER` |
| OU02 Печать Велеса | 1 | 385 | `DIRECT_NAMED_SYMBOL` |
| OU03 automotive symbolic/use-case | 10 | 695 | `USE_CASE_FIT` |
| OU04 mirror-pendant form factor | 7 | 676 | `FORM_FACTOR_FIT` where explicit historical listing title exists |
| OU05 Алатырь | 1 | 84 | `DIRECT_NAMED_SYMBOL` |
| OU06 broader Veles | 1 | 48 | `DIRECT_NAMED_SYMBOL` |
| OU07 Vegvisir | 1 | 84 | `DIRECT_NAMED_SYMBOL` |
| OU08 Шлем Ужаса | 1 | 22 | `DIRECT_NAMED_SYMBOL` |
| OU09 zodiac reopen test | 37 | 356 | `REOPEN_TEST`, not primary acquisition acceptance |

\* Historical ordered-units values are period evidence from the accepted earlier analytics window. Because opportunity relations overlap, these values must **not** be summed across rows/opportunities.

Nine current identities with no accepted R3 opportunity relation account for 110 historical 90d ordered units: Gungnir, Valknut, three universal-symbol listings, two Orthodox listings, and two patriotic listings. They remain real assortment, not discarded data.

## 2. OU02 vs OU06 — Veles split

Fresh current identity evidence preserves two separate seller identities:

- `Печать Велеса` — product_id `1119965443`, SKU `1636048691` → OU02;
- `Велес` — product_id `1119957837`, SKU `1636041142` → OU06.

Both are also category members of OU01.

Decision for Stage 06:
- the R3 OU02/OU06 distinction is **supported by current assortment identity structure**;
- do **not** merge them;
- however, two identities alone do not prove that Blood & Sand has enough distinct Veles forms to support a rich family chooser. Product detail/attributes must determine actual variant/form differences before `DECISION_GRADE` passport status.

## 3. OU03 vs OU04 — use-case and form-factor stay separate

Direct evidence currently supports two different relation strengths.

### OU03 — automotive symbolic/use-case

Ten identities have a supportable relation:
- three fresh seller offers explicitly say `Талисман в машину`;
- seven stable identities have directly observed historical seller listing titles explicitly framing them as car amulet/talisman products.

This is `USE_CASE_FIT`. It does **not** upgrade the seller wording into a verified physical-protection claim.

### OU04 — mirror-pendant form factor

Seven stable identities have directly observed historical seller listing titles explicitly saying `Подвеска на зеркало в машину`:
- Печать Велеса;
- Велес;
- Алатырь;
- Vegvisir;
- Шлем Ужаса;
- zodiac Овен classic;
- zodiac Близнецы classic.

The current 2026-08-26 identity census proves those product_id/SKU identities still exist, but the fresh stock endpoint does not itself re-measure listing title/form-factor fields. Therefore the mapping is explicitly marked `MAPPED_HISTORICAL_LISTING_TITLE` rather than silently treated as a fresh physical-product observation.

No other current SKU is mapped to OU04 merely because similar products look likely to hang from a mirror. That would violate the passport evidence rules.

## 4. Priority named symbols

Fresh current identities directly confirm:
- OU02 Печать Велеса — present;
- OU05 Алатырь — present;
- OU06 Велес — present;
- OU07 Vegvisir — present;
- OU08 Шлем Ужаса — present.

All five also had non-zero historical 90d ordered units. This proves real seller assortment + historical transactions, not current conversion rate or buyer motive.

## 5. Zodiac reopen test

Fresh current assortment contains **37/37** previously classified zodiac identities across three seller variant families:
- 12 classic;
- 12 symbols;
- 13 antique;
- combined historical 90d ordered units: **356**.

Stage 06 conclusion:
- the **assortment-side reopen trigger is met**: a coherent, substantial zodiac product set exists and remains current by identity;
- marketplace performance also proves historical purchases of this product lane;
- this does **not** overturn R3's Search/Alice result that broad zodiac acquisition intent is contaminated by stones/jewelry and is weak for Blood & Sand as a primary organic lane;
- OU09 therefore moves only to **REOPEN_TEST / product-buyer investigation**, not to KEEP/primary acquisition.

Buyer motive, variant preference and economics remain separate questions.

## 6. Unmapped current products

Nine current listings have no accepted R3 relation under present evidence:
- Gungnir;
- Valknut;
- Древо Жизни;
- Ом / Аум;
- Инь и Ян;
- Молитва Иоанн Златоуст;
- Спаси и Сохрани;
- Герб России;
- Герб России (Логотип).

This is not a rejection of the products. It means Stage 05 did not establish an evidence-backed search opportunity for them, so Stage 06 must not invent one retroactively.

## 7. Targeted passport-enrichment queue

The next Ozon detail/attribute work should be narrow and decision-driven.

### Tier A — required named/opportunity boundary set

1. Печать Велеса — `1119965443` / `1636048691`
2. Велес — `1119957837` / `1636041142`
3. Алатырь — `1124658338` / `1640251697`
4. Vegvisir — `1082862005` / `1602722942`
5. Шлем Ужаса — `1082855228` / `1602717077`

Need to resolve current listing state/title, actual form/variant, mirror-hanging construction, key dimensions/material/content fields where provider data supports them.

### Tier B — automotive-only contrast

6. Бусидо / Талисман в машину — `1082852354` / `1602715556`

Use as a contrast SKU because its current seller offer explicitly says `Талисман в машину` but current stock evidence does not prove mirror-hanging form.

### Tier C — zodiac family representatives

Choose one representative from each real current family, not all 37 initially:

7. classic: Овен — `1217137863` / `1720148880`
8. antique: Лев (Античность) — `1835050645` / `2186857668`
9. symbols: Близнецы (Символы) — `1948032144` / `2271210394`

This is enough to test whether the three seller naming families correspond to materially different products/attributes before expanding collection.

## 8. 06.3 decision

The current 76-item assortment is now mapped to R3 opportunities at the strongest evidence level available without new product-detail calls.

Resolved:
- Veles split: **keep OU02 and OU06 separate**;
- OU03 vs OU04: **keep separate, with explicit relation provenance**;
- priority named symbols: **all current**;
- zodiac: **reopen product/buyer test, do not promote broad acquisition lane**;
- unmapped products: **9 explicitly retained as no accepted R3 relation**.

The remaining gaps are passport enrichment and buyer/performance evidence, not assortment identity mapping.

Next: verify the current v0.1.19 read-only operation contract and run the smallest supported detail/attribute request for the Tier A set before expanding to Tier B/C.
