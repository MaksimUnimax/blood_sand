# Direct browser SERP observation — `печать велеса`

Observed: 2026-08-26 ~07:34Z  
Surface: Yandex Search desktop browser UI  
Evidence mode: direct user-provided browser screenshot + copied SERP text  
Exact query: `печать велеса`
Device: DESKTOP

## Provenance / localization

The copied SERP URLs contain `lr=11202`. This numeric browser localization parameter is directly observed, but its human-readable geography is not resolved here. It must not be silently relabeled as Search API region `225`.

## Above-the-fold composition

Directly observed in screenshot:

1. Promo result: `logovo-volka.ru` — `Печать Велеса` / silver and brass offer.
2. Large embedded `Быстрый ответ Алисы AI` immediately below the Promo result.
3. Alice block includes multiple image thumbnails.
4. Large right-column `Картинки` visual block.
5. First visible result below Alice: `slavyanskieoberegi.ru` — `Печать велеса`.
6. Then visible commercial/platform results: Wildberries and Yandex Market.

This browser layout mixes paid commerce, AI explanation, image discovery and shopping/organic results in the same top viewport.

## Additional directly observed SERP results / blocks from copied page

Visible/returned result domains include:

- `slavyanskieoberegi.ru`
- `wildberries.ru`
- `market.yandex.ru`
- `ozon.ru`
- `livemaster.ru`
- `blog.arcanum.ru`
- `avito.ru`
- `славяне.сайт`
- `logovo-volka.ru`
- `simvolroda.ru`
- `ru.pinterest.com`
- `beregy.ru`
- `veseliyviking.ru`
- `pod-znakom-sim-pobedish.clients.site`
- `magazin-zoloto.ru`

Additional `Промо` results are present farther down the page; they are not mixed with organic ranking.

## `Люди ищут` — direct UI observation

1. `печать велеса значение`
2. `печать велеса тату`
3. `печать велеса фото`
4. `печать велеса серебро купить`
5. `печать велеса из золота`
6. `печать велеса медвежья лапа значение`
7. `печать велеса это`
8. `печать велеса значение для мужчин`
9. `печать велеса что это значит`
10. `печать велеса медвежья`

This materially strengthens `печать велеса значение` as an evidence-driven secondary candidate. It is not executed before the primary Alice set is completed.

## Image block

A dedicated `Картинки` block is directly present. The copied page contains 13 image entries plus `Все картинки`. Image URLs visibly include marketplace/product and user-generated source origins such as Ozon image CDN, Wildberries basket image CDN, Livemaster and Pinterest/Pikabu-origin images.

This is recorded as a visual discovery surface, not as organic ranking.

## Embedded Alice

The full embedded Alice answer, exact 17-source list and three follow-up prompts are stored in:

`marketing/data/raw/alice/20260826T0734Z__pechat_velesa__embedded.md`

## Evidence-safe interpretation

- This query differs materially from `славянские обереги`: Alice is surfaced directly in the ordinary SERP above the first organic results.
- The top viewport combines commercial promotion, AI explanation, image discovery and transactional results.
- Search API XML did not expose this UI composition, so the browser observation is decision-useful.
- Visual identity/form is clearly part of the search task, but this is not yet a Page Job/IA decision.
