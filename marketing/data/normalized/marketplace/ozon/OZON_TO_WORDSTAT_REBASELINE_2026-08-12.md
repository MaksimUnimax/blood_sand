# Ozon → Wordstat Re-baseline — 2026-08-12

Статус: **READY_FOR_WORDSTAT_EXTENSION**  
Basis: current Ozon assortment + 90-day seller analytics  
Execution gate: **не выполнять новый Wordstat API request до явного запуска Wordstat extension владельцем**.

## Зачем изменён scope

Старый Wordstat pilot был построен вокруг `Печать Велеса / автомобильные обереги`. После Ozon ingestion доказан current assortment из 76 SKU и несколько самостоятельных research families. Поэтому старые 13 measurements сохраняются как валидный pilot evidence, но новый pass должен закрыть весь текущий Ozon assortment на уровне product families, а не повторять старый pilot или превращать каждый SKU в отдельный root.

Seller-weighting для порядка исследования берётся из Ozon 90-day `ordered_units` и не подменяет Wordstat demand:

- slavic symbols / oberegs — 928 / 61.1%;
- zodiac combined — 356 / 23.4%;
- norse/runic — 128 / 8.4%;
- patriotic — 33 / 2.2%;
- orthodox — 28 / 1.8%;
- universal symbols — 27 / 1.8%;
- warrior talismans — 19 / 1.3%.

Authority: `OZON_PRODUCT_FAMILY_BASELINE_2026-08-12.md`.

## Уже измерено — НЕ повторять без отдельной причины

Existing pilot GetTop roots remain evidence:

1. `печать велеса`;
2. `оберег печать велеса`;
3. `подвеска печать велеса`;
4. `печать велеса медвежья лапа`;
5. `печать велеса волчья лапа`;
6. `печать велеса в машину`;
7. `оберег в машину`;
8. `славянский оберег в машину`;
9. `подвеска на зеркало в машину`;
10. `печать велеса значение`;
11. `медвежья и волчья печать велеса отличие`;
12. `какой оберег выбрать в машину`;
13. `подарок автомобилисту`.

Старый незапущенный root `подарок мужчине в машину` **снимается как автоматический следующий вызов**. Он может вернуться позже только если новый family-level evidence подтвердит необходимость gift-layer expansion.

## Новый принцип измерения

1. Сначала закрыть broad family/form anchors через GetTop.
2. Использовать `RESULT` и релевантные `ASSOCIATION` как discovery evidence, не суммируя пересекающиеся counts.
3. Только затем добавлять representative SKU/symbol roots, если broad family root не даёт достаточного покрытия.
4. Operator variants, Dynamics, device/region выполняются после root discovery и только для high-value/evidence-backed queries.
5. Один API command = один Wordstat request; pagination/continuation — отдельный command.

## Wave 1 — обязательное новое family coverage

### A. Zodiac layer — самый крупный непокрытый family layer

Порядок:

1. `знак зодиака в машину`
2. `талисман знак зодиака`
3. `оберег по знаку зодиака`

После этих roots решение о variant roots принимается по фактическому Wordstat output. Representative Ozon sellers для возможной проверки: `Овен`, `Близнецы`, `Лев`; все 37 current zodiac SKU не измеряются автоматически по отдельности.

### B. Slavic family — расширение уже сильного pilot layer

Новые roots, не дублирующие существующий pilot:

4. `славянские обереги`
5. `алатырь оберег`
6. `оберег чур`
7. `колядник оберег`
8. `оберег велес`
9. `сварог оберег`

`Печать Велеса` повторно не измерять: по ней уже есть отдельный pilot stack.

### C. Norse / runic family

10. `вегвизир`
11. `вегвизир в машину`
12. `скандинавский оберег в машину`

`шлем ужаса оберег`, `гунгнир амулет` и variant roots — Wave 2 только если broad discovery показывает самостоятельный спрос.

### D. Остальные текущие families — broad coverage

13. `герб россии в машину`
14. `православный оберег в машину`
15. `спаси и сохрани в машину`
16. `древо жизни в машину`
17. `инь ян в машину`
18. `талисман в машину`
19. `амулет в машину`
20. `бусидо талисман`

## Wave 2 — evidence-conditioned expansion

Wave 2 не является фиксированным списком API calls. Кандидаты запускаются только когда Wave 1 показывает meaningful standalone wording/association или когда family остаётся непокрытым:

- zodiac representative signs/variants;
- `шлем ужаса оберег`;
- `гунгнир амулет`;
- `валькнут амулет`;
- slavic symbols `громовик`, `звезда лады`, `мара`, `перун` и другие — только по evidence;
- patriotic/orthodox/universal child formulations;
- gift/recipient formulations, включая ранее отложенный `подарок мужчине в машину`, только если family discovery возвращает релевантный gift intent.

## После GetTop root discovery

Дальнейший roadmap 03:

- operator precision для high-value roots;
- seasonality/Dynamics для representative family leaders;
- device/region checks там, где они decision-useful;
- Tier 2 gap closure только по evidence;
- нормализация полного R1 dataset и Query Evidence Ledger;
- затем переход к roadmap 04 SERP/Alice.

## Первый следующий measurement

**Не запущен.**

Первый новый measurement после запуска расширения владельцем:

- provider: Yandex Wordstat;
- method: GetTop;
- phrase: `знак зодиака в машину`;
- region: Russia / `225`;
- devices: all;
- purpose: открыть самый крупный полностью непокрытый family layer (zodiac: 356 Ozon ordered units / 23.4% за 90 дней), не повторяя уже измеренный slavic/automotive pilot.

После получения результата следующий command определяется по evidence и выполняется отдельно.