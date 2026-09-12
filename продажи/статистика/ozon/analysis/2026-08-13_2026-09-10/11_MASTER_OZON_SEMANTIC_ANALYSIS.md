# Ozon semantic analysis — full-volume analytical pass

Date: 2026-09-12

## Executive result

This pass processed all 76 canonical SKUs and all 4,440 successful Ozon query observations after the repaired product-card source passed Phase A. No Ozon provider call and no product-card mutation was made.

## Data boundary

The query data are four bounded Ozon slices, each limited to at most 15 queries per SKU per slice. Absence from the observed slices is not proof that a query does not exist in the wider Ozon search universe.

## Method

FACT FROM DATA: canonical assortment, query metrics, current titles/offers/attributes/descriptions.

DERIVED CLASSIFICATION: conservative rule-based query→SKU relevance using specific identities, zodiac signs, product families, generic class/use-case terms and current card evidence.

ANALYST INFERENCE: semantic clusters, ownership/overlap risk and candidate destination fields.

HOLD / UNCERTAINTY: queries without defensible evidence are retained as `AMBIGUOUS_HOLD`; partial single-token matches are not promoted to ready changes.

## Counts

- canonical SKUs: 76
- raw observations: 4,440
- unique raw `(sku, query)` pairs: 4,310
- unique raw queries: 2,238
- unique normalized queries: 2221
- semantic clusters: 240
- EXACT_PRODUCT: 413
- STRONG_PRODUCT: 129
- FAMILY_RELEVANT: 390
- GENERIC_RELEVANT: 2828
- PARTIAL_RELEVANCE: 49
- NEIGHBOR_PRODUCT: 165
- IRRELEVANT: 1
- AMBIGUOUS_HOLD: 258
- READY_CANDIDATE: 326
- FAMILY_CANDIDATE: 3176
- NO_CHANGE: 258
- HOLD_AMBIGUOUS: 307

## Interpretation

Specific zodiac/sign/symbol identities are separated before generic family terms. A query naming another canonical sign or motif is treated as `NEIGHBOR_PRODUCT`, not as a keyword opportunity for the current SKU. Generic car-mirror / amulet / talisman intent may legitimately be shared.

Coverage is evaluated separately for title, offer ID, structured attributes and long description. These are content-presence checks only; the analysis makes no unsupported claim about Ozon ranking weights.

Ownership is conservative: unique exact/strong matches can become SKU-specific; multi-owner specific intent is flagged for overlap review; broad generic intent remains shared.

Candidate recommendations are not approved copy. Any READY/FAMILY candidate still requires human review before an Ozon card change. Structured-attribute changes are deliberately not proposed from search phrases alone.

## Next human-review priorities

Review `03_QUERY_SKU_RELEVANCE.tsv`, `06_QUERY_OWNERSHIP_AND_OVERLAP.tsv`, `08_SEMANTIC_OPPORTUNITY_REGISTER.tsv`, and `09_SKU_CARD_RECOMMENDATIONS.tsv`, focusing first on HIGH overlap risk and READY/FAMILY candidates.
