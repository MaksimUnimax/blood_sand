# Ozon Product Family Baseline — 2026-08-12

Статус: **normalized research baseline**  
Marketplace: **Ozon**  
Назначение: подготовить re-baseline поискового исследования после owner decision сделать Wildberries неблокирующим для текущего critical path.

## Authority / provenance

Baseline построен только из уже сохранённого Ozon evidence:

- current product-level stock snapshot: `marketing/data/raw/marketplace/ozon/20260811T1025Z__ozon__stocks-current__all.json`;
- terminal stock continuation, подтверждающий полноту текущего product-level snapshot на 76 items: `marketing/data/raw/marketplace/ozon/20260812T0148Z__ozon__stocks-current__terminal.json`;
- 90-day SKU analytics `ordered_units + revenue`, период `2026-05-13..2026-08-10`: `marketing/data/raw/marketplace/ozon/20260811T104232Z__ozon__analytics-data__sku__20260513_20260810.json`;
- Stage-06 restored current-only row master: `marketing/data/normalized/marketplace/ozon/20260812__ozon__product-master__current76.csv`.

Никакие значения продаж, SKU или товарные identities не реконструировались из внешнего поиска.

## Scope и ограничения

Полный доказанный current stock snapshot содержит **76 Ozon product identities**. Исторический branch master также содержал несколько analytics-only identities, отсутствующих в текущем 76-item stock snapshot; они не входят в текущий assortment count и не расширяют его автоматически.

Текущий historical bridge snapshot не дал catalog list/info/attributes/category taxonomy. Поэтому `product_family` ниже — **исследовательская классификация по Ozon-observed product/offer naming**, а не утверждение об официальной Ozon category/type taxonomy.

Также не заполнены догадками отсутствующие price, moderation, category, attributes, media, warehouse-level stock, finance, dedicated returns и advertising fields.

## Current assortment: research families

| Product family | Current SKU count | 90d ordered units | Share of 1519 units |
|---|---:|---:|---:|
| `slavic_symbols_oberegs` | 25 | 928 | 61.1% |
| `zodiac_classic` | 12 | 171 | 11.3% |
| `zodiac_symbols` | 12 | 102 | 6.7% |
| `zodiac_antique` | 13 | 83 | 5.5% |
| `norse_runic` | 4 | 128 | 8.4% |
| `patriotic` | 2 | 33 | 2.2% |
| `orthodox_christian` | 2 | 28 | 1.8% |
| `universal_symbols` | 3 | 27 | 1.8% |
| `warrior_talismans` | 3 | 19 | 1.3% |
| **TOTAL** | **76** | **1519** | **100.0%** |

Три zodiac families вместе дают **356 ordered units / 23.4%** 90-day seller volume. Они остаются раздельными variant families в master.

## Seller-weighted research sequencing

90-day `ordered_units` используется только для определения порядка покрытия исследования — не как окончательная оценка рыночного спроса и не как решение о структуре сайта.

Последовательность покрытия:

1. `slavic_symbols_oberegs` — 928 units / 61.1%;
2. zodiac layer (`classic + symbols + antique`) — 356 / 23.4%;
3. `norse_runic` — 128 / 8.4%;
4. `patriotic` — 33 / 2.2%;
5. `orthodox_christian` — 28 / 1.8%;
6. `universal_symbols` — 27 / 1.8%;
7. `warrior_talismans` — 19 / 1.3%.

Это означает только, что более крупные seller-observed families должны получить достаточное исследовательское внимание. Внешний спрос может отличаться от seller sales mix.

## High-signal current SKU examples

- `Печать Велеса` — 385 ordered units;
- `Вегвизир - Рунический компас` — 84;
- `Алатырь (Крест Сварога)` — 84;
- `Чур` — 77;
- `Колядник` — 67;
- `Велес` — 48;
- `Сварог` — 34;
- `Герб России` — 33;
- classic zodiac `Овен` — 32;
- `Звезда Лады` — 30;
- zodiac symbols `Близнецы` — 30;
- `Громовик` — 29;
- `Мара` — 28;
- zodiac antique `Лев` — 26;
- `Шлем ужаса - Эгисхьяльм` — 22;
- `Спаси и Сохрани` — 22.

Низкопродаваемый или zero-sale SKU не объявляется «плохим»: baseline не содержит полного exposure/traffic/ad-delivery контекста.

## Stage 06 interpretation

This baseline proves that R3 opportunities map to a real, broad seller assortment:
- OU01 Slavic category has substantial actual depth;
- OU02 `Печать Велеса`, OU05 `Алатырь`, OU07 `Vegvisir`, OU08 `Шлем Ужаса` have direct current-snapshot identities;
- OU06 broader Veles has a separate `Велес` SKU in addition to `Печать Велеса`;
- zodiac is a real assortment layer with three variant families despite broad Search contamination.

Dynamic currentness still needs refresh before Stage 06 declares a 2026-08-26 current master.
