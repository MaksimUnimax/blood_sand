# Ozon manual semantic review — checkpoint after block 03

Date: 2026-09-12

## Progress

- total READY candidates: 321
- total READY SKUs: 63
- completed blocks: B01, B02, B03
- reviewed candidates: 114 / 321
- reviewed SKUs: 24 / 63
- cumulative APPROVE: 0
- cumulative REJECT: 107
- cumulative HOLD: 7

## Block 03

- rows reviewed: 43
- APPROVE: 0
- REJECT: 42
- HOLD: 1

Block 03 covered zodiac SKUs. Most machine READY rows were false positives caused by the sign name being shared with another product type (`брелок`, `брошка`, `кулон`, `свитшот`, `картина`, `молд`, `фигурка`) or by homonyms (`весы`, `водолей`, `рыбы`, `лев`). Exact zodical intents already present in title/description were rejected as `NO_CHANGE_ALREADY_COVERED`, not promoted into duplicate keyword additions.

HOLD:
- `для машины лев` → SKU 1720151850 — «Лев» can mean zodiac sign or lion-themed auto decor; query is too ambiguous for safe assignment.

No card mutation and no provider call was performed.

## Continuation

Next block: B04. Resume from `MANUAL_REVIEW_CURSOR_2026-09-12.json`.
