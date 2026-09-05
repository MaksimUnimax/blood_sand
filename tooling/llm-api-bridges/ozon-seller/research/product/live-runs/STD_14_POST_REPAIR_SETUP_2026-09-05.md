# STD-14 post-repair setup — availability / visibility diagnosis

Date: 2026-09-05
Canonical question: `Почему товар есть в кабинете и остаток есть, а покупателю он не показывается или доставка недоступна?`

## Starting boundary

STD-13 is complete. Its 9 bundle SKUs all currently return `showcases_visibility=OZON`, so none of them is a valid current showcase-invisibility case. One bundle SKU (`1640330072`, Громовик) has current FBO zero, which also does not satisfy the canonical condition "остаток есть" for an FBO-specific invisibility diagnosis.

No pre-existing `STD_14` live-run artifact is present in the current branch directory, so STD-14 must discover a real current-account candidate instead of fabricating one.

## Discovery strategy

1. Start with `product_visibility_info` without a SKU filter. The current Bridge validator allows `skus` to be omitted; when supplied it accepts 1..350 string int64 SKUs.
2. Inspect current assortment showcase-visibility states and identify any non-`OZON` candidates.
3. For each real non-visible candidate, cross-check current stock using the appropriate stock surface.
4. Only classify a row as the canonical STD-14 case when both are true:
   - current seller/account stock exists;
   - current showcase/delivery state indicates a real availability problem.
5. If no showcase-invisibility candidate exists, continue the same business job into delivery/logistics restriction surfaces rather than inventing an invisible SKU.
6. Keep separate:
   - showcase visibility;
   - FBO/FBS stock;
   - warehouse/delivery availability;
   - product/card validation state.

## Run 1 next

Operation: `product_visibility_info`
Params: `{}`

Target evidence:
- whether the endpoint returns the current assortment when `skus` is omitted;
- current visibility state distribution;
- real candidate SKU(s) for stock cross-check;
- or evidence that showcase invisibility is not currently present and STD-14 must continue into logistics/delivery restrictions.

Checkpoint:
`STD_14_POST_REPAIR_VISIBILITY_DISCOVERY_RUN1_NEXT`
