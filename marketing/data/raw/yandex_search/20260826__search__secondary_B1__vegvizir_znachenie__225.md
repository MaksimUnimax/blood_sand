# Yandex Search secondary B1 — `вегвизир значение`

Observed: 2026-08-26  
Evidence mode: direct Yandex Search API provider result  
Region: 225  
Response format: FORMAT_XML

## Request

- request_id: `search-9739861a-3871-47de-a904-0a9049c1a663`
- queryText: `вегвизир значение`
- HTTP: 200
- elapsed: 1627 ms
- result_count: 10
- request_executed: true
- automatic_retry: false
- estimated_rub: 0.488
- bridge-reported tariff_checked_at: 2026-08-19

## Direct Top-10

1. `ruyan-master.ru` — **Компас Вегвизир - скандинавский рунический компас викингов...** — https://ruyan-master.ru/stati/runicheskij-kompas-vegvizir
2. `tr-page.yandex.ru` — **Вегвизир - Vegvísir - Википедия** — translated Wikipedia result
3. `runarium.ru` — **Вегвизир – указатель пути** — http://runarium.ru/vegvizir
4. `zevira.ru` — **Вегвизир: значение символа, история компаса викингов (2026)** — https://zevira.ru/ru-ru/information/articles/vegvizir-vikingskij-kompas-znachenie
5. `pikabu.ru` — **Вегвизир – указатель пути | Пикабу** — https://pikabu.ru/story/vegvizir__ukazatel_puti_7241329
6. `www.bikerringshop.com` — **Vegvísir: истинное происхождение символа-компаса** — https://www.bikerringshop.com/ru/blogs/articles/vegvisir-meaning-viking-compass
7. `vk.ru` — **Что такое Вегвизир Это символ, родиной которого принято...** — https://vk.ru/wall-103323911_77378
8. `elarus.ru` — **Рунический компас Вегвизир: значение символа (тату)** — https://elarus.ru/blog/runicheskiy-kompas/
9. `stramiloff.ru` — **Вегвизир** — https://stramiloff.ru/tpost/4r3yrryj71-vegvizir
10. `www.youtube.com` — **Вегвизир - Указатель Пути - YouTube** — https://www.youtube.com/watch?v=IBpoN10pl6o

## Direct observations

- The returned Top-10 is overwhelmingly **meaning/history/origin/explanation-led**.
- No Ozon, Wildberries or Yandex Market result appears in the Top-10.
- The set includes specialist/editorial pages, a translated Wikipedia result, community sources (Pikabu, VK) and a YouTube explanation.
- `ruyan-master.ru` is #1 with an article explicitly framed around the meaning of the Vegvisir symbol.
- Several results directly foreground historical/origin interpretation, including the important correction that Vegvísir is not actually a Viking-age symbol.
- Commercial intent is weak and indirect in this measurement; even commerce-connected domains appear through editorial/article URLs.

## B1 decision answer

**YES — `вегвизир значение` creates a distinct informational / meaning-first Search job relative to the mixed base query `вегвизир`.**

This independently reproduces the pattern already observed for `печать велеса` → `печать велеса значение`: an explicit `значение` modifier materially changes Search composition from mixed/commercial toward explanation/history/meaning.

Therefore the meaning-layer split is not a one-query anomaly; it is now observed across two different named-symbol families.

This is Search-provider evidence only; browser/UI and Alice are not inferred from this measurement.
