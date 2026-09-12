# Ozon manual semantic review — checkpoint after block 01

Date: 2026-09-12

## Scope

Human review of machine-generated `READY_CANDIDATE` rows from the completed Phase B–L analytical pass.

- total READY candidates: 321
- total SKUs with READY candidates: 63
- block policy: 8 SKUs per block (final block may be smaller)
- completed block: B01
- reviewed candidates: 34 / 321
- reviewed SKUs: 8 / 63

## Block 01 decisions

- APPROVE: 0
- REJECT: 31
- HOLD: 3

The first block exposed a systematic false-positive class in the machine pass: exact symbol-token overlap was sometimes promoted even when the query named a different product type (`браслет`, `бусина`, `коврик`, `майка`, `свечи`, `кольцо`, `молд`) or contradicted the current SKU material/format. These rows are rejected rather than converted into Ozon card changes.

Three rows remain HOLD because the motif relationship is plausible but the query does not provide enough evidence for safe assignment to the exact SKU:

- `копье бога` → SKU 1611643847 (`Гунгнир`) — ambiguous motif;
- `велес оберег волк` → SKU 1636041142 — possible Veles variant, but wolf design is not confirmed by the card;
- `велес. красная кровь` → SKU 1636041142 — relationship to the product is not defensible from current evidence.

No card mutation and no provider call was performed.

## Continuation

Next block: B02. Resume only from `MANUAL_REVIEW_CURSOR_2026-09-12.json`; do not re-review B01 unless an explicit audit requires it.
