# Ozon semantic review — owner decision packet

Date: 2026-09-12

## Decision state

`OWNER_DECISION_PENDING`

All machine READY candidates and the subsequent HOLD queue have been reviewed. No Ozon card write has been performed.

## One change ready for owner approval

SKU: `1640330072`

Current product: `Славянский оберег - Подвеска на зеркало в машину "Громовик"`

Destination: `LONG_DESCRIPTION`

Placement: near the first explanatory paragraph about the symbol, without modifying title or structured attributes.

Approved wording direction:

> Громовик также встречается под названием «Громовое колесо» — защитный символ, связанный с Перуном.

Reason: the query `громовик колесо` was observed in the Ozon search evidence; current card confirms `Громовик`; external terminology review supports `Громовое колесо` as an alternate name/corresponding name for the same thunder-wheel symbol.

## Do not apply — unresolved HOLD

1. SKU `1636048691` — `печать велеса медвежья лапа в машину`: do not add `медвежья лапа` until the exact bear-vs-wolf variant of this SKU is proven.
2. SKU `1640251697` — `звезда сварога подвеска`: do not add `Звезда Сварога` while sources conflict on whether it is the same symbol as this `Алатырь (Крест Сварога)`.
3. SKU `2184234912` — `амулет звезда руси`: do not add `Звезда Руси` while sources conflict on its equivalence to `Звезда Лады`.

## Rejected population

- 312 of the original 321 machine READY rows were rejected in manual review;
- 5 of the 9 subsequent HOLD rows were also rejected;
- none of those rejected rows may be restored to an Ozon write set without a new explicit evidence review.

## Execution boundary

No provider recollection is needed for the approved `Громовик` change. Actual Ozon write execution requires owner approval and a write-capable Ozon channel/session. Until then the approved change remains staged only.
