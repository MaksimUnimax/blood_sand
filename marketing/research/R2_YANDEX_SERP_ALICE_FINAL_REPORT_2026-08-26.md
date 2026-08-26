# R2 — Yandex Search / SERP / Alice final report — 2026-08-26

Status: **FINAL — ROADMAP 04 EVIDENCE COMPLETE / READY FOR ROADMAP 05**

Scope: decision-grade evidence for Blood & Sand search-commerce strategy. This report intentionally stops before final Page Jobs / IA; those decisions belong to Roadmap 05.

## 1. Evidence completed

### Human demand / Wordstat R1
Canonical input:
- `marketing/research/R1_WORDSTAT_FINAL_REPORT_2026-08-12.md`

### Direct Yandex Search provider
Primary: **10/10** roots, region `225`, Top-10 returned, HTTP 200.

Primary roots:
1. `славянские обереги`
2. `печать велеса`
3. `оберег в машину`
4. `подвеска на зеркало в машину`
5. `вегвизир`
6. `талисман знак зодиака`
7. `алатырь оберег`
8. `оберег велес`
9. `подарок мужчине в машину`
10. `подарок автомобилисту`

Secondary evidence-driven Search: **5/5**:
- A1 `оберег по знаку зодиака`
- A2 `печать велеса значение`
- A3 `амулет в машину`
- B1 `вегвизир значение`
- B2 `шлем ужаса оберег`

Paid secondary expansion is **STOPPED** because all remaining planned uncertainty classes were answered.

### Browser SERP / UI
Desktop fixed representative set: **5/5**.
Additional desktop captures: `вегвизир`, `алатырь оберег`, `подарок автомобилисту`.

Mobile representative set: **2/2**, classified honestly as `YANDEX_TOUCH / EMULATED_MOBILE` because a physical phone was unavailable:
- `славянские обереги`
- `оберег в машину`

Observed localization token `lr=10466` is preserved as numeric evidence; human-readable geography is not inferred.

### Consumer Alice
Accepted canonical primary: **10/10**.
One earlier `подарок мужчине в машину` run with explicit conversation carry-over is preserved for audit but excluded; a clean rerun is canonical.

### Canonical Query Evidence Ledger
- repaired and atomically rewritten;
- 23 query rows;
- 15 Search-measured rows;
- 10 Alice-measured rows;
- CSV structure validated exact-match after GitHub write.

Validation:
- `marketing/data/ledger/QUERY_EVIDENCE_LEDGER_R2_FINAL_VALIDATION_2026-08-26.md`

---

# 2. Core cross-surface findings

## 2.1 Named symbols have two recurring jobs: understand and evaluate/buy

This is the strongest repeated structural finding in R2.

`печать велеса`:
- base Search is strongly transactional/product and marketplace-heavy;
- Alice is meaning/history/use-first;
- explicit secondary `печать велеса значение` flips Search itself into a meaning-first Top-10 while specialist commerce remains competitive.

`вегвизир`:
- base Search is mixed entity + commercial;
- Alice is history/meaning-first;
- explicit `вегвизир значение` produces an overwhelmingly informational/history/origin SERP with no Ozon/Wildberries/Yandex Market in Top-10.

Therefore the `значение` layer is not a one-query anomaly. It repeats across two different named-symbol families.

**Roadmap 05 input:** named-symbol opportunities must be evaluated with both explanatory and commercial jobs in mind. Whether those jobs become separate pages or one hybrid content-commerce page is still undecided.

## 2.2 Specialist independent sites are real competitors and real Alice/Search sources

Independent specialist domains repeatedly rank and/or qualify as Alice sources for symbol roots. This is important because the opportunity is not limited to fighting marketplaces on marketplace terms.

Examples across captured evidence include:
- `slavyanskieoberegi.ru`
- `simvolroda.ru`
- `ruyan-master.ru`
- `veles.bz`
- `slavyarmarka.ru`
- `oberegi-runi.ru`
- other niche explanatory/product sites.

`печать велеса значение` is especially strong evidence: `slavyanskieoberegi.ru` occupies #1, #7, #9 and #10 while generic marketplaces disappear from the returned Top-10.

**Roadmap 05 input:** a useful owned specialist asset can compete in both explanation and commerce, rather than serving only as a thin marketplace redirect page.

## 2.3 Automotive protection is a genuine query-native commerce/use-case cluster

Wordstat:
- `оберег в машину` broad 1,405;
- quoted 96;
- PHONE 1,297 vs DESKTOP 100.

Search / browser / Alice converge on a real automotive protection-selection job:
- primary Search = mixed commercial + choice/use-case;
- desktop browser = promo + images + large rich shopping block with Yandex Market/Ozon product cards;
- Alice = selection/use-case guidance + 7 directly orderable products;
- touch/mobile = commerce-first organic sequence led by Livemaster, m.Avito, Happy Witch, Slavyarmarka and Wildberries, with Ozon and specialist shops later.

Secondary `амулет в машину` does **not** create a new job. Yandex largely rewrites/normalizes it back into the `оберег в машину` semantic cluster.

**Roadmap 05 input:** `амулет` belongs in semantic coverage of the automotive-protection opportunity; it is not evidence for a separate page by itself.

## 2.4 Form-factor intent is different from protection/use-case intent

`подвеска на зеркало в машину`:
- Wordstat broad 1,074; quoted 266;
- Search Top-10 is near-pure transactional/platform/catalog commerce;
- desktop has a large shopping block;
- Alice is decor/form-factor selection + shopping with 6 direct products;
- symbolic pendants are only one branch alongside generic decor, fandom, personalization and other mirror accessories.

This differs materially from `оберег в машину`, which is about protection/selection/use-case rather than only hanging form factor.

**Roadmap 05 input:** do not automatically collapse form-factor and protection intent into one Page Job solely because Blood & Sand products satisfy both.

## 2.5 Broad zodiac demand is heavily contaminated

Wordstat:
- `талисман знак зодиака` broad 3,422 → quoted only 21.

Browser:
- embedded Alice;
- marketplaces/jewelry retailers;
- People-search prompts overwhelmingly `камень + знак + талисман`.

Alice:
- informational sign-by-sign selection guide;
- stones/colors/symbols central;
- 30 exact sources;
- no direct product-card section.

Secondary `оберег по знаку зодиака` did not clean this up: Search remained a mixture of zodiac selection, stones/jewelry and marketplaces, with no Slavic-symbol specialist merchant in Top-10.

**Roadmap 05 input:** do not model zodiac opportunity from broad 3,422 volume as if it were direct pendant demand. Narrower product-qualified opportunities need separate treatment.

## 2.6 Broad gift roots are real demand but weak default product fit

`подарок мужчине в машину` and `подарок автомобилисту` both resolve primarily to broad practical gift selection.

Clean Alice evidence is decisive:
- no organic amulet/talisman/Slavic-symbol category in `подарок мужчине в машину`;
- `подарок автомобилисту` similarly centers practical/general automotive gifts.

A Wildberries snippet for `подарок автомобилисту` does expose a wolf pendant as one possible product, so the product can participate, but it is not the dominant query-native answer.

**Roadmap 05 input:** broad gift roots should not be prioritized as default acquisition landing pages for the pendant category without a stronger commerce rationale.

---

# 3. Mobile / touch findings

## `славянские обереги`
Desktop:
- 3 Promo before first organic;
- first organic `slavyanskieoberegi.ru`, then `simvolroda.ru`.

Touch/emulated-mobile:
- no Promo before first organic;
- `simvolroda.ru` #1;
- `Картинки` immediately after #1;
- `slavyanskieoberegi.ru` #2;
- first ten organic results strongly specialist-commerce dominated;
- embedded Alice and rich Popular-products block not observed.

The ordering/UI changes, but the underlying category-first specialist-commerce job does not.

## `оберег в машину`
Desktop:
- top Promo;
- Images;
- large `Популярные товары` block;
- mixed commerce + choice/use-case organic.

Touch/emulated-mobile:
- no top ad before organic;
- first five organic: Livemaster, m.Avito, Happy Witch, Slavyarmarka, Wildberries;
- first visible ad block only after those five;
- Ozon and multiple specialist merchants follow;
- no embedded Alice / rich product block observed in supplied touch copy.

Again the UI changes substantially, while commercial automotive-protection intent remains strong.

Limitation: these are `YANDEX_TOUCH / EMULATED_MOBILE`, not physical-phone measurements. They are kept separate from Wordstat PHONE data and from device-neutral Search API results.

---

# 4. Secondary Search conclusions

### A1 `оберег по знаку зодиака`
Lexical narrowing alone did not create a clean symbolic/Slavic job.

### A2 `печать велеса значение`
Separate meaning-first job confirmed.

### A3 `амулет в машину`
Synonym collapses into existing automotive-protection cluster.

### B1 `вегвизир значение`
Meaning-first split independently replicated in a second symbol family.

### B2 `шлем ужаса оберег`
Coherent adjacent named-symbol commercial lane confirmed:
- Wildberries #1;
- Ozon #2;
- `slavyanskieoberegi.ru` #3;
- Yandex Market #4/#7/#8/#10;
- Livemaster catalog/content also present.

`Шлем Ужаса` / `Агисхьяльм` remains tightly centered on the named symbol rather than diffusing into generic Norse noise.

**Roadmap 05 input:** evaluate `Шлем Ужаса` as its own named-symbol opportunity, not merely as a Vegvisir comparison term.

---

# 5. What R2 does NOT prove

R2 does not yet establish:
- final site IA;
- final Page Jobs;
- which meaning/commercial jobs deserve separate URLs vs hybrid pages;
- commercial value C from actual owned-site orders/revenue;
- owned asset value O from Webmaster/Metrika performance;
- customer evidence from actual owned-site behavior;
- direct attribution of marketplace sales from the future site.

Those fields remain deliberately unassigned / not measured in the Ledger.

R2 also does not infer:
- human-readable geography from `lr=10466` or `lr=11202`;
- mobile Search API behavior from Wordstat PHONE values;
- exact Alice source URLs when only domain/title rows were visible;
- absence from truncated source panels as proof of non-existence.

---

# 6. Decision-ready opportunity inputs for Roadmap 05

The next stage should combine H/A/C/O and assign Page Jobs only after weighing the evidence below.

Strong candidates to evaluate:

1. **Slavic category / named-symbol content-commerce**
   - large human demand;
   - specialist independents already competitive;
   - Alice source eligibility repeatedly observed.

2. **Печать Велеса — commercial + meaning pair**
   - strong base product demand;
   - explicit, independently validated meaning split;
   - specialist commerce ranks inside meaning SERP.

3. **Automotive protection / `оберег в машину`**
   - meaningful mobile-first human demand;
   - query-native shopping + choice/use-case job;
   - direct product fit.

4. **Mirror-pendant form factor**
   - meaningful demand and strong transactional intent;
   - but broad commodity/decor contamination requires a clear differentiator.

5. **Vegvisir — entity/commercial + meaning pair**
   - high demand;
   - explicit meaning split confirmed;
   - historical accuracy is important for source-quality positioning.

6. **Шлем Ужаса / Агисхьяльм**
   - smaller demand than Vegvisir but a coherent commercial named-symbol lane;
   - worth explicit opportunity scoring.

Caution / likely lower default priority:
- broad zodiac root because of severe stones/jewelry contamination;
- generic gift roots because pendant/amulet is not the default answer;
- extra automotive synonyms because A3 shows semantic collapse.

---

# 7. Canonical artifacts

- `marketing/research/R1_WORDSTAT_FINAL_REPORT_2026-08-12.md`
- `marketing/research/R2_YANDEX_SEARCH_PRIMARY_SERP_2026-08-26.md`
- `marketing/research/R2_PRIMARY_SEARCH_ALICE_COMPARISON_2026-08-26.md`
- `marketing/research/R2_SECONDARY_SEARCH_FINAL_REVIEW_2026-08-26.md`
- `marketing/data/raw/browser_serp/20260826__slavyanskie_oberegi__emulated_mobile_touch.md`
- `marketing/data/raw/browser_serp/20260826__obereg_v_mashinu__emulated_mobile_touch.md`
- `marketing/data/ledger/query_evidence_ledger.csv`
- `marketing/data/ledger/QUERY_EVIDENCE_LEDGER_R2_FINAL_VALIDATION_2026-08-26.md`

## R2 close decision

**Roadmap 04 evidence collection and normalization are complete enough for decision handoff. Do not run more paid Search queries by default. Proceed to Roadmap 05 opportunity/Page Job decision stage using the canonical Ledger and this report.**
