# Ozon manual semantic review — final report

Date: 2026-09-12

## Final verdict

All **321 / 321** machine `READY_CANDIDATE` rows across **63 / 63** SKUs were manually reviewed.

- APPROVE: **0**
- REJECT: **312**
- HOLD: **9**
- direct Ozon card mutations performed: **0**
- new Ozon provider calls performed: **0**

The approved change set is intentionally empty. This is a valid analytical result: none of the machine READY rows was both substantively new and sufficiently supported to authorize a direct card change from the current bounded evidence.

## Main rejection pattern

The machine pass frequently promoted symbol/sign token overlap while ignoring a conflicting product type, use case, material, placement, brand, or variant. A second large class consisted of useful intents already explicitly present in the current title/description; those are `NO_CHANGE`, not new keyword additions.

## Reason-code distribution

- `DIFFERENT_PRODUCT_TYPE`: 133
- `NO_CHANGE_ALREADY_COVERED`: 52
- `USE_CASE_MISMATCH`: 19
- `USE_CASE_OR_PRODUCT_TYPE_MISMATCH`: 15
- `MATERIAL_MISMATCH`: 13
- `HOMONYM_FALSE_POSITIVE`: 6
- `NO_DEFENSIBLE_PRODUCT_INTENT`: 4
- `MATERIAL_OR_PRODUCT_MISMATCH`: 3
- `AMBIGUOUS_VARIANT`: 3
- `MATERIAL_OR_VARIANT_MISMATCH`: 3
- `GENDER_SEGMENT_NOT_PRODUCT_FEATURE`: 3
- `DIFFERENT_MOTIF`: 2
- `AMBIGUOUS_RELATED_SYMBOL`: 2
- `UNSUPPORTED_VARIANT`: 2
- `DIFFERENT_MOTIF_OR_PRODUCT`: 2
- `PLACEMENT_OR_PRODUCT_MISMATCH`: 2
- `DIFFERENT_PRODUCT_OR_USE_CASE`: 2
- `TOO_BROAD_NO_CHANGE`: 2
- `OTHER_BRAND_OR_VARIANT`: 2
- `NO_CHANGE_MODEL_SEGMENT_NOT_FEATURE`: 2
- `OTHER_BRAND_OR_ENTITY`: 2
- `DIFFERENT_PRODUCT_TYPE_OR_ENTITY`: 2
- `UNSUPPORTED_LIGHTING_VARIANT`: 2
- `DIFFERENT_PRODUCT_TYPE_AND_MATERIAL`: 1
- `LEXICAL_FALSE_POSITIVE`: 1
- `AMBIGUOUS_MOTIF`: 1
- `DIFFERENT_PRODUCT_TYPE_AND_DIMENSION`: 1
- `DIFFERENT_PRODUCT_MODIFIER`: 1
- `AMBIGUOUS_OR_UNRELATED_ENTITY`: 1
- `DIFFERENT_PRODUCT_OR_MATERIAL`: 1
- `UNSUPPORTED_MATERIAL_DETAIL`: 1
- `DIFFERENT_SYMBOL`: 1
- `MATERIAL_OR_COLOR_MISMATCH`: 1
- `DIFFERENT_ENTITY`: 1
- `NON_PRODUCT_OR_OTHER_ENTITY`: 1
- `DIFFERENT_PRODUCT_TYPE_OR_VARIANT`: 1
- `AMBIGUOUS_HOMONYM`: 1
- `VARIANT_OR_MATERIAL_MISMATCH`: 1
- `PRODUCT_FORMAT_MISMATCH`: 1
- `TOO_BROAD_OR_OTHER_DECOR`: 1
- `DIFFERENT_PERSON_OR_ENTITY`: 1
- `DIFFERENT_PRODUCT_AND_ENTITY`: 1
- `DIFFERENT_CONTENT_ENTITY`: 1
- `UNEXPLAINED_NUMERIC_ENTITY`: 1
- `OTHER_ENTITY_OR_NAVIGATIONAL`: 1
- `AMBIGUOUS_AUTOMOTIVE_INTENT`: 1
- `DIFFERENT_PRODUCT_AND_MULTI_SIGN`: 1
- `AMBIGUOUS_INCOMPLETE_QUERY`: 1
- `ORIGIN_OR_VARIANT_MISMATCH`: 1
- `AMBIGUOUS_DIFFERENT_FORMAT`: 1
- `HARDWARE_VARIANT_MISMATCH`: 1
- `MATERIAL_AND_PLACEMENT_MISMATCH`: 1
- `OTHER_ENTITY_OR_NUMERIC_IDENTIFIER`: 1
- `NO_DEFENSIBLE_PRODUCT_CHANGE`: 1
- `GIFT_SEGMENT_NOT_PRODUCT_FEATURE`: 1
- `UNSUPPORTED_PACKAGING_DETAIL`: 1
- `PLACEMENT_MISMATCH`: 1
- `UNSUPPORTED_DIFFERENT_MOTIF`: 1
- `DIFFERENT_PRODUCT_TYPE_OR_FORMAT`: 1
- `PLACEMENT_OR_PRODUCT_FORMAT_MISMATCH`: 1
- `DIFFERENT_ENTITY_OR_MOTIF`: 1
- `NAVIGATIONAL_OR_OTHER_ENTITY`: 1
- `MATERIAL_OR_FINISH_MISMATCH`: 1
- `MATERIAL_AND_USE_CASE_MISMATCH`: 1
- `OTHER_BRAND_OR_UNRELATED_ENTITY`: 1
- `DIFFERENT_PRODUCT_TYPE_OR_PLACEMENT`: 1

## HOLD queue

- SKU `1611643847` — `копье бога` — `AMBIGUOUS_MOTIF`
- SKU `1636041142` — `велес оберег волк` — `AMBIGUOUS_VARIANT`
- SKU `1636041142` — `велес. красная кровь` — `AMBIGUOUS_OR_UNRELATED_ENTITY`
- SKU `1636048691` — `печать велеса медвежья лапа в машину` — `AMBIGUOUS_VARIANT`
- SKU `1640251697` — `звезда сварога подвеска` — `AMBIGUOUS_RELATED_SYMBOL`
- SKU `1640330072` — `громовик колесо` — `AMBIGUOUS_VARIANT`
- SKU `1720151850` — `для машины лев` — `AMBIGUOUS_HOMONYM`
- SKU `2184234912` — `амулет звезда руси` — `AMBIGUOUS_RELATED_SYMBOL`
- SKU `2186802133` — `весы в машину лексус` — `AMBIGUOUS_AUTOMOTIVE_INTENT`

HOLD means separate evidence/review is required before any use in Ozon content. HOLD is not approval.

## Authority

- machine source: `08_SEMANTIC_OPPORTUNITY_REGISTER.tsv`
- block decisions: `manual_review_2026-09-12/MANUAL_REVIEW_BLOCK_*`
- master human authority: `13_MANUAL_REVIEW_MASTER.tsv`
- approved mutations: `14_APPROVED_CHANGE_SET.tsv`
- unresolved review: `15_MANUAL_REVIEW_HOLD_QUEUE.tsv`

## Boundary

The four Ozon query slices are bounded observations (maximum 15 queries per SKU per slice). The empty approved set does not prove that no future card improvement exists; it proves that the **321 machine READY candidates in this pass** do not justify a direct mutation after human review.
