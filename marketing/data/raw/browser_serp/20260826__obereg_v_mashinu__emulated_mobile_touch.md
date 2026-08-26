# Yandex touch / emulated mobile SERP — `оберег в машину`

Observed: 2026-08-26  
Surface: Yandex `/search/touch`  
Evidence mode: direct browser copy supplied by user  
Device provenance: desktop browser with mobile-emulation workflow; physical phone not used; exact preset not confirmed  
Classification: `YANDEX_TOUCH / EMULATED_MOBILE`  
Observed localization token: `lr=10466` (human-readable geography not inferred)

## Query

`оберег в машину`

## Direct top organic sequence observed

1. `livemaster.ru` — **Оберег в авто - купить в интернет-магазине уникальные товары ручной работы...**
2. `m.avito.ru` — **оберег в машину - Авито...**; snippet directly exposes `Оберег в машину скандинавский амулет руна Феху`
3. `happywitch.ru` — **Оберег для автомобиля "Хранитель" купить...**
4. `slavyarmarka.ru` — **Купить обереги, ароматизаторы в машину в славянском Интернет-магазине**
5. `wildberries.ru` — **Оберег для водителя - Купить...**; snippet exposes `Оберег в машину от аварий амулет Хранитель`

After a `Может заинтересовать / Реклама` block, additional organic commerce observed:

6. `ozon.ru` — **От сглаза оберег в машину купить...**
7. `veles.bz` — **Обереги для машины, купить оберег для автомобиля...**
8. `7granei.ru` — **Оберег в машину, в автомобиль купить. Автообереги обсидиан.**
9. `oberegi-runi.ru` — **Обереги-подвески в автомобиль | Руническая мастерская**
10. `beenom.com` — **Обереги в Машину**

## Direct UI observations

- No Promo/ad block before the first organic result in this capture.
- First five organic results appear before the first visible `Может заинтересовать / Реклама` block.
- Organic surface is strongly commerce-first and product/category oriented.
- Specialist independent commerce is strong: Happy Witch, Slavyarmarka, Veles, 7granei, Oberegi Runi, Beenom.
- Marketplace/platform commerce is also present: Livemaster, Avito mobile, Wildberries, Ozon.
- `m.avito.ru` is directly mobile-specific in the observed URL.
- Embedded Alice answer: `NOT_OBSERVED`.
- Rich `Популярные товары` block: `NOT_OBSERVED`.
- `Картинки` result block inside the result stream: `NOT_OBSERVED` in supplied full copy.
- `Люди ищут`: `NOT_OBSERVED`.
- Standalone Video block: `NOT_OBSERVED`.
- Lower-page ads observed, including off-topic auto and generator advertising plus amber jewelry promo.

## Desktop comparison

Desktop capture for the same root had:
- top Promo (`Чур`);
- Images;
- large `Популярные товары` shopping block with Yandex Market/Ozon product cards;
- mixed commercial + choice/use-case organic composition.

This touch capture differs in UI composition:
- no top Promo before organic;
- no large rich product block observed;
- mobile ordering starts with platform/specialist organic commerce;
- commerce intent remains strong and query-native, but specialist catalog/product pages are more visually prominent in the copied result stream.

This is browser/UI evidence only. It is not Search API evidence and is not treated as a physical-phone measurement.
