# Direct browser SERP observation — `оберег в машину`

Observed: 2026-08-26; exact clock time not independently captured  
Surface: Yandex Search desktop browser UI  
Evidence mode: direct user-provided full-page copied SERP text + screenshots  
Exact query: `оберег в машину`  
Device: DESKTOP

## Provenance / localization

Copied Search URLs contain `lr=11202`. This numeric browser localization parameter is directly observed. Its human-readable geography is not resolved here and must not be silently relabeled as Search API region `225`.

## Directly observed SERP composition

The supplied full-page browser copy directly contains:

- a top `Промо` result for `pod-znakom-sim-pobedish.clients.site`, `Оберег в машину «Чур»`;
- a dedicated `Картинки` block;
- a large `Популярные товары по запросу «оберег в машину»` shopping/rich block;
- product cards from Yandex Market and Ozon, including automotive icons, `Удача в пути`, `Святой Христофор` and a later card for `Славянский оберег - Подвеска на зеркало в машину "Печать Велеса"`;
- ordinary commercial results from Wildberries, Ozon and Yandex Market;
- independent/specialist commerce results including `happywitch.ru`, `slavyarmarka.ru`, `veles.bz`, `radugakamnya.ru`;
- informational/social results including VK and automotive informational pages;
- further `Промо` placements lower in the copied page.

The copied page begins with the accessibility label `Быстрый ответ`, but that label points to the e-commerce `Популярные товары` surface, not to Alice.

## Embedded Alice status

No `Быстрый ответ Алисы AI` / Alice marker is present in the supplied full-page copied SERP text. For this capture, embedded Alice is recorded as `NOT_OBSERVED` — this is not a claim that Alice can never appear for the query.

Because embedded Alice was not observed in this Search capture, the consumer Alice measurement for the same exact input was taken separately in a standalone Alice chat.

Stored separately in:

`marketing/data/raw/alice/20260826__obereg_v_mashinu__consumer_chat.md`

## Rich shopping evidence

The browser SERP is unusually commerce-heavy for this root:

- Yandex product shopping block appears directly in the result page;
- marketplace category/results from Wildberries, Ozon and Yandex Market are prominent;
- product-level cards span religious automotive icons, generic protection/road-luck talismans and a Slavic `Печать Велеса` mirror pendant.

This is direct evidence that Yandex interprets the root as a shopping/use-case query, not only as an informational symbol query.

## Other UI branches

- `Картинки`: OBSERVED.
- `Видео`: NOT_OBSERVED in supplied full-page copy.
- `Люди ищут`: NOT_OBSERVED in supplied full-page copy.

## Evidence-safe interpretation

- Search browser UI is strongly shopping-first and marketplace-rich.
- The exact root spans religious, Slavic, esoteric and generic driver-protection product forms rather than one narrowly defined symbol class.
- Independent specialist commerce is present, but marketplaces and Yandex's own product surface create strong pressure.
- No final Page Job or IA decision is assigned at this stage.
