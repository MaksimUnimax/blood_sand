# Direct browser SERP observation — `подарок автомобилисту`

Observed: 2026-08-26; exact clock/timezone not independently confirmed from the Yandex UI  
Surface: Yandex Search desktop browser UI  
Evidence mode: direct user-provided full-page copied SERP text  
Exact query: `подарок автомобилисту`  
Device: DESKTOP

## Provenance / localization

Copied Yandex URLs contain `lr=10466`. This numeric browser localization parameter is directly observed. Its human-readable geography is not resolved here and must not be silently relabeled as Search API region `225`.

## Directly observed top composition

The supplied full-page copy begins with:

1. ordinary Ozon commerce result `Подарок автолюбителю купить на OZON по низкой цене`;
2. large embedded `Быстрый ответ Алисы AI`;
3. Wildberries result for `Подарок автомобилисту мужчине на день рождения`;
4. `poryadok.ru` gift category;
5. `kp.ru` editorial `50+ идей, что подарить автомобилисту`.

The embedded Alice block is stored separately in:

`marketing/data/raw/alice/20260826__podarok_avtomobilistu__embedded.md`

It contains the full answer, 11 exact source URLs and 3 direct fan-out prompts.

## Broader result mix

Further directly observed results include:

- `sima-land.ru` — gifts/souvenirs for motorists;
- `ac-studio.ru` — original gifts for motorists;
- `colapsar.ru` — gifts for a man/husband in the car;
- `journal.citilink.ru` — non-banal gifts / wishlist for an experienced driver;
- `autofanatik.ru` — auto-fan accessories/souvenirs;
- `telegraf-spb.ru` — gifts for motorists/drivers.

The page also contains multiple lower-page `Промо` / ad placements, including both relevant auto-accessory ads and clearly off-topic ad noise such as real-estate offers. Ads remain separate from organic/commercial-result evidence.

## Product-family evidence relevant to Blood & Sand

The broad Wildberries result snippet directly contains:

`Подвеска автомобилисту Волк, подарок близкому.`

This is direct evidence that a pendant can surface inside the broad gift marketplace universe. However, it appears as one product mention inside a very broad generic gift result set, while both the embedded Alice answer and the surrounding organic results are dominated by practical/generic gifts.

No direct `Кровь и Песок` brand mention was confidently observed in the supplied copied page.

## Other UI branches in the supplied full-page copy

- embedded `Быстрый ответ Алисы AI`: `OBSERVED`;
- rich `Популярные товары` product-card block: `NOT_OBSERVED` in the supplied full-page copy;
- dedicated `Картинки` block: `NOT_OBSERVED` in the supplied full-page copy;
- dedicated `Видео` block: `NOT_OBSERVED` in the supplied full-page copy;
- `Люди ищут`: `NOT_OBSERVED` in the supplied full-page copy;
- lower-page `Промо`: `OBSERVED`.

These statuses apply only to this supplied capture and are not claims that the modules can never appear for the query.

## Evidence-safe interpretation

- The browser SERP is broad gift-commerce/editorial rather than narrowly automotive-symbolic.
- Ozon/Wildberries and independent gift retailers are prominent.
- Alice is injected very high in the result sequence and performs a broad recommendation job.
- A pendant SKU can participate in marketplace results, but the generic gift root does not center the category.
- This matches the Search-provider and clean Alice evidence that broad gift demand is weakly aligned with the Blood & Sand product family by default.
- Final Page Job / IA remains deferred to Roadmap 05.