# CAP-21 — structured attributes PASS

Status: `PASS_ATTRIBUTES_READ`

Date: 2026-09-06

Live request: `seller_product_attributes` for resolved own Seller product `product_id = 1119965443` / SKU `1636048691`.

Request ID: `dd220558-e4d5-4060-b528-27ead3aa42d8`

Observed result:
- endpoint: `POST /v4/product/info/attributes`;
- external request executed: `true`;
- HTTP `200`;
- one logical business result -> one physical business request;
- exact request preserved: `true`;
- command transformed: `false`;
- logical fingerprint = physical fingerprint = `e5ca09dd`;
- `total = 1`, `last_id = ""`;
- returned product id `1119965443`, SKU `1636048691`, offer `Печать Велеса`.

Relevant structured card evidence:
- title/name: `Славянский оберег - Подвеска на зеркало в машину "Печать Велеса"`;
- brand: `Кровь и Песок`;
- collection/theme value: `Славянские символы`;
- type value: `Оберег`;
- materials: `Акрил`, `Дерево`;
- country: `Россия`;
- title attribute repeats the same product title;
- search/tag attribute contains factual clusters including `славянский`, `оберег`, `амулет`, `талисман`, `славянские_обереги`, `подвеска_в_авто`, `в_машину`, `аксессуары_в_машину`, `подвеска_в_машину`, `подвеска_в_машину_на_зеркало`, `оберег_от_сглаза_и_порчи`, `амулет_от_сглаза`, `амулет_защитный`, `талисман_удачи`, `обереготсглаза`;
- the same tag attribute also contains `триглав`, which does not match the selected card's title/offer `Печать Велеса` and therefore should not be treated as authority for a true product property without separate evidence;
- description attribute matches the previously read card description and explicitly contains `сглаза и порчи`, `магии`, `эзотерики`, automobile use and a possible home-decoration use case.

The attributes result completes the mandatory structured-card evidence required by the CAP-21 SEO authority. Preserved CAP-03 authority is sufficient for the content-rating component: SKU `1636048691` is one of the 74 cards at `87.5/100` with the common text/Rich-content gap.

Checkpoint: `CAP_21_READY_FOR_FINAL_SYNTHESIS`
