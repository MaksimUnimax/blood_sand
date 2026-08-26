# Yandex Search secondary A3 — `амулет в машину`

Observed: 2026-08-26  
Evidence mode: direct Yandex Search API provider result  
Region: 225  
Response format: FORMAT_XML

## Request

- request_id: `search-aee9a6d6-fa5c-4bd3-ac72-dd682acf08c7`
- queryText: `амулет в машину`
- HTTP: 200
- elapsed: 1234 ms
- result_count: 10
- request_executed: true
- automatic_retry: false
- estimated_rub: 0.488
- bridge-reported tariff_checked_at: 2026-08-19

## Direct Top-10

1. `www.ozon.ru` — **От сглаза оберег в машину купить на OZON по низкой цене** — https://www.ozon.ru/category/ot-sglaza-obereg-v-mashinu/
2. `global.wildberries.ru` — **Оберег в машину от аварий - Купить в интернет магазине...** — https://global.wildberries.ru/catalog/tags/obereg-v-mashinu-ot-avarii
3. `happywitch.ru` — **Какой выбрать оберег в машину - Блог интернет магазина...** — https://happywitch.ru/blog/obereg-v-mashinu/
4. `market.yandex.ru` — **Обереги в машину - купить по низкой цене на Яндекс Маркете** — https://market.yandex.ru/category/oberegi-v-mashinu
5. `market.yandex.ru` — **Обереги в машину от аварий и сглаза - купить по низкой цене на...** — https://market.yandex.ru/category/oberegi-v-mashinu-ot-avariy-i-sglaza
6. `www.livemaster.ru` — **Оберег в авто - купить в интернет-магазине уникальные товары...** — https://www.livemaster.ru/tag/item/1299135/obereg-v-avto
7. `www.livemaster.ru` — **Славянский оберег в машину – купить на Ярмарке Мастеров** — https://www.livemaster.ru/popular/80115-slavyanskij-obereg-v-mashinu
8. `www.avito.ru` — **оберег в машину - Авито | Объявления во всех регионах...** — https://www.avito.ru/all?q=%D0%BE%D0%B1%D0%B5%D1%80%D0%B5%D0%B3+%D0%B2+%D0%BC%D0%B0%D1%88%D0%B8%D0%BD%D1%83
9. `vk.ru` — **Самые сильные обереги в машину для защиты...** — https://vk.ru/wall-150633958_245589
10. `amber-land.ru` — **Икона в машину триптих Amber Land: янтарь, золочение, освящена** — https://amber-land.ru/products/ikona-v-mashinu-triptih-avtomobilnaya-ikona-obereg-4-163169

## Direct observations

- Search rewrites the lexical surface toward **`оберег в машину`**: most titles/URLs in the returned Top-10 use `оберег`, not `амулет`.
- Marketplace/platform commerce dominates: Ozon #1, Wildberries #2, Yandex Market #4/#5, Livemaster #6/#7, Avito #8.
- Specialist / explanatory commerce remains present via Happy Witch #3 and Amber Land #10.
- A Slavic-specific branch is directly visible at Livemaster #7 (`Славянский оберег в машину`).
- Avito #8 snippet directly exposes `скандинавский амулет руна Феху` as one product example.
- VK #9 provides informational/community content about protective car amulets.

## A3 decision answer

**`амулет в машину` does not form a clearly separate Search job. It is largely normalized by Yandex into the same semantic cluster as `оберег в машину`, but with a stronger transactional/marketplace tilt in this Top-10.**

It is therefore better treated as a lexical variant / supporting query of the automotive-protection cluster, not as a provisional independent Page Job.

This is Search-provider evidence only; browser/UI and Alice are not inferred from this measurement.
