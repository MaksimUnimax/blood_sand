# R1 — Wordstat Root GetTop Log

Дата начала: 2026-08-04  
Статус: **ACTIVE — roadmap 03.2**

Этот файл ведёт последовательный журнал root-level `GetTop` measurements. Каждый вывод ниже относится только к Wordstat human-demand evidence и не подменяет Yandex SERP, Alice AI или commerce evidence.

## Прогресс root set

- root measurements с валидным GetTop: **13/14**;
- из них выполнено непосредственно в roadmap 03: **12**;
- historical baseline: **1** (`печать велеса`).

## 1. `печать велеса`

- historical live measurement;
- `totalCount = 3350`;
- raw: `marketing/data/wordstat/2026-08-04_gettop_pechat_velesa_ru_all.json`.

Ключевые observed child results: `значение=617`, `медвежья лапа=343`, `оберег печать велеса=198`, `купить=120`, `подвеска=80`. Child counts пересекаются и не суммируются как уникальный спрос.

## 2. `оберег печать велеса`

- `query_id = q_a7bcbc7f088c`;
- `measurement_id = m_wordstat_20260804_0ec6b952`;
- Россия `225`, `DEVICE_ALL`;
- `totalCount = 198`;
- 13 `RESULT`, 15 `ASSOCIATION`.

Артефакты: raw `marketing/data/raw/wordstat/20260804__wordstat__gettop__obereg-pechat-velesa__225__all.json`, normalized `marketing/data/normalized/wordstat/20260804__wordstat__gettop__obereg-pechat-velesa__225__all.csv`.

Вывод: отдельный human-demand кластер подтверждён; meaning/slavic ветки заметны, автомобильный use case не проявился, associations в основном шумовые.

## 3. `подвеска печать велеса`

- `query_id = q_45793464bf62`;
- `measurement_id = m_wordstat_20260805_12d50a1c`;
- `totalCount = 80`;
- 6 `RESULT`, 11 `ASSOCIATION`.

Ключевые `RESULT`: `серебряная подвеска=20`, `купить подвеску=8`, `подвеска оберег=5`.

Вывод: product-form demand подтверждён; есть прямой purchase-oriented child и отдельная серебряная ветка.

## 4. `печать велеса медвежья лапа`

- `query_id = q_b3389c7563b6`;
- `measurement_id = m_wordstat_20260805_946e9aeb`;
- `totalCount = 343`;
- 10 `RESULT`, 7 `ASSOCIATION`.

Ключевые `RESULT`: `значение=147`, `значение для мужчин=34`, `тату=28`, `купить=23`, `серебро купить=17`, `оберег=16`.

Вывод: самостоятельный заметный variant-root; meaning-ветка сильная, коммерческий child существует, tattoo-intent отделяется от товарного.

## 5. `печать велеса волчья лапа`

- `query_id = q_31806ca53d61`;
- `measurement_id = m_wordstat_20260805_8799de8a`;
- `totalCount = 129`;
- 5 `RESULT`, 8 `ASSOCIATION`.

Ключевые `RESULT`: `значение=58`, `для мужчин=30`, `для женщин=12`, `тату=4`.

Вывод: wolf-root заметно меньше bear-root в том же типе измерения; explicit `купить` в returned RESULT отсутствует, что не доказывает отсутствие коммерческого спроса.

## 6. `печать велеса в машину`

- `query_id = q_4ab5a09494a0`;
- `measurement_id = m_wordstat_20260805_5ea42d6a`;
- `totalCount = 5`;
- HTTP 200 response содержал только `totalCount`; `results` и `associations` отсутствовали.

Артефакты: raw `marketing/data/raw/wordstat/20260805__wordstat__gettop__pechat-velesa-v-mashinu__225__all.json`, normalized `marketing/data/normalized/wordstat/20260805__wordstat__gettop__pechat-velesa-v-mashinu__225__all.csv`.

Вывод: прямая связка Печати Велеса с автомобилем имеет очень малый broad signal; automotive cluster этим не закрывается.

## 7. `оберег в машину`

Measurement:

- дата capture: `2026-08-05` (точность DATE; bridge не передал точное время);
- версия bridge: `1.1.0`;
- `query_id = q_16798cf404fd`;
- `measurement_id = m_wordstat_20260805_60f98dd1`;
- Россия `225`, `DEVICE_ALL`, `numPhrases=100`;
- HTTP 200;
- `totalCount = 1388`;
- 48 `RESULT`;
- 11 `ASSOCIATION`.

Артефакты:

- raw: `marketing/data/raw/wordstat/20260805__wordstat__gettop__obereg-v-mashinu__225__all.json`;
- normalized: `marketing/data/normalized/wordstat/20260805__wordstat__gettop__obereg-v-mashinu__225__all.csv`;
- Ledger: `marketing/data/ledger/query_evidence_ledger.csv`.

Ключевые `RESULT`:

- `оберег в машину` — 1388;
- `оберег от сглаза в машину` — 122;
- `обереги в машину купить` — 121;
- `оберег в дорогу на машине` — 73;
- `славянский оберег в машину` — 72;
- `оберег в машину от аварий` — 69;
- `подвеска оберег в машину` — 65;
- `обереги в машину какой лучше выбрать` — 12;
- `оберег в машину из серебра` — 11.

### Что это позволяет утверждать сейчас

1. Общий automotive root `оберег в машину` существенно крупнее прямой связки `печать велеса в машину` (`1388` против `5`).
2. Внутри root есть явный purchase-intent (`купить=121`) и product-form (`подвеска оберег=65`).
3. Славянская ветка наблюдается как реальный RESULT (`72`), а не только association.
4. Значительная часть хвоста относится к религиозным, DIY, защитным и иным поднамерениям; их нельзя механически объединять в одну коммерческую страницу.
5. Associations не считаются child demand и не суммируются с RESULT.

## 8. `славянский оберег в машину`

Measurement:

- дата capture: `2026-08-05` (точность DATE; bridge не передал точное время);
- версия bridge: `1.1.0`;
- `query_id = q_dec36683e8e1`;
- `measurement_id = m_wordstat_20260805_a164a34f`;
- Россия `225`, `DEVICE_ALL`, `numPhrases=100`;
- HTTP 200;
- `totalCount = 72`;
- 3 `RESULT`;
- 13 `ASSOCIATION`.

Артефакты:

- raw: `marketing/data/raw/wordstat/20260805__wordstat__gettop__slavyanskiy-obereg-v-mashinu__225__all.json`;
- normalized: `marketing/data/normalized/wordstat/20260805__wordstat__gettop__slavyanskiy-obereg-v-mashinu__225__all.csv`;
- Ledger: `marketing/data/ledger/query_evidence_ledger.csv`.

Ключевые `RESULT`:

- `славянский оберег в машину` — 72;
- `славянский оберег в машину чур` — 7;
- `славянский оберег в машину для семьи` — 5.

### Что это позволяет утверждать сейчас

1. Славянский automotive subcluster существует, но broad signal (`72`) намного уже общего `оберег в машину` (`1388`).
2. Returned RESULT set очень короткий; explicit purchase-формулировка в нём не появилась. Это не доказывает нулевой commercial intent.
3. Associations в основном уходят в широкую славянскую/амулетную тематику и не повышаются до спроса на наш SKU автоматически.
4. Этот root подтверждает нишу для славянского позиционирования, но page/offer решение остаётся pending operator + SERP/Alice evidence.

## 9. `подвеска на зеркало в машину`

Measurement:

- дата capture: `2026-08-05` (точность DATE; payload не содержит точного времени);
- bridge package под тестом: `1.1.5`; raw envelope сообщает `version=1.1.1` из-за подтверждённого stale protocol-version metadata defect;
- режим: controlled manual live-test с явной привязкой диалога и настроенным report prefix;
- `query_id = q_cc67e8b8507f`;
- `measurement_id = m_wordstat_20260805_fce8e6bb`;
- `request_id = 867c50e6-a8a3-4940-bc66-0d4e3b00d873`;
- Россия `225`, `DEVICE_ALL`, `numPhrases=100`;
- HTTP 200, `elapsed_ms=520`;
- `totalCount = 973`;
- 22 `RESULT`;
- 13 `ASSOCIATION`.

Артефакты:

- raw: `marketing/data/raw/wordstat/20260805__wordstat__gettop__podveska-na-zerkalo-v-mashinu__225__all.json`;
- normalized: `marketing/data/normalized/wordstat/20260805__wordstat__gettop__podveska-na-zerkalo-v-mashinu__225__all.csv`;
- Ledger: `marketing/data/ledger/query_evidence_ledger.csv`.

Ключевые `RESULT`:

- `подвеска на зеркало в машину` — 973;
- `подвеска в машину на зеркало заднего` — 127;
- `подвеска в машину на зеркало заднего вида` — 127;
- `купить подвеску в машину на зеркало` — 65;
- `подвеска на зеркало в машину своими руками` — 33;
- `подвеска в машину на зеркало с гравировкой` — 15;
- `подвеска на зеркало в машину из бусин` — 5;
- `подвеска в машину на зеркало с кисточкой` — 5.

### Что это позволяет утверждать сейчас

1. Product-form/use-case root `подвеска на зеркало в машину` имеет крупный broad signal (`973`) и по масштабу близок к общему `оберег в машину` (`1388`).
2. Внутри root есть явный purchase-intent: `купить подвеску в машину на зеркало = 65`.
3. Есть отдельные observed формулировки про конструкцию/визуальную форму, непосредственно полезные для нашего SKU: `с гравировкой=15`, `из бусин=5`, `с кисточкой=5`.
4. DIY-ветка (`своими руками=33`) существует и должна отделяться от коммерческого purchase-intent.
5. Associations в этом measurement в основном являются нерелевантным автомобильным/лексическим шумом (`пневмоподвеска`, `стойка автомобиля`, `клиренс` и т. п.) и не повышаются до demand evidence для товара.
6. Этот root усиливает основание рассматривать способ размещения на зеркале и product-form как самостоятельный human-demand слой, но решение о Page Job остаётся pending operator + SERP/Alice evidence.

## 10. `печать велеса значение`

Measurement:

- дата capture: `2026-08-05` (точность DATE; payload не содержит точного времени);
- `query_id = q_ddc00bf51857`;
- `measurement_id = m_wordstat_20260805_6660bfb5`;
- `request_id = 5b73676c-555e-44f0-bced-961e694d0596`;
- Россия `225`, `DEVICE_ALL`, `numPhrases=100`;
- HTTP 200, `elapsed_ms=290`;
- `totalCount = 617`;
- 18 `RESULT`;
- 6 `ASSOCIATION`.

Артефакты:

- raw: `marketing/data/raw/wordstat/20260805__wordstat__gettop__pechat-velesa-znachenie__225__all.json`;
- normalized: `marketing/data/normalized/wordstat/20260805__wordstat__gettop__pechat-velesa-znachenie__225__all.csv`;
- Ledger: `marketing/data/ledger/query_evidence_ledger.csv`.

Ключевые `RESULT`:

- `печать велеса значение` — 617;
- `печать велеса лапа значение` — 219;
- `печать велеса медвежья значение` — 156;
- `печать велеса медвежья лапа значение` — 147;
- `печать велеса значение для мужчин` — 137;
- `печать велеса волчья значение` — 58;
- `печать велеса для женщин значение` — 57;
- `оберег печать велеса значение` — 44.

### Что это позволяет утверждать сейчас

1. Meaning-root имеет существенный broad signal (`617`) и является самостоятельным human-demand слоем, а не только хвостом товарного root.
2. Медвежья ветка заметно сильнее волчьей внутри meaning-intent (`156/147` против `58`).
3. Есть выраженная аудитория формулировок про мужчин (`137`) и отдельная женская ветка (`57`); эти counts пересекаются и не суммируются.
4. `оберег печать велеса значение = 44` связывает informational meaning с товарно-обережным контекстом, но сам по себе не доказывает purchase intent.
5. Associations в основном лексический шум и не повышаются до demand evidence.

## 11. `медвежья и волчья печать велеса отличие`

Measurement:

- дата capture: `2026-08-06` (точность DATE; payload не содержит точного времени);
- режим: controlled manual live-test;
- raw envelope: `bridge=wordstat-manual-bridge`, `version=1.1.1`;
- `query_id = q_f87efd71ce50`;
- `measurement_id = m_wordstat_20260806_d82b2010`;
- `request_id = 6fc46a4a-01f2-48d4-9e08-74551242f32a`;
- Россия `225`, `DEVICE_ALL`, `numPhrases=100`;
- HTTP 200, `elapsed_ms=404`;
- `totalCount = 1`;
- поля `results` и `associations` в ответе отсутствовали.

Артефакты:

- raw: `marketing/data/raw/wordstat/20260806__wordstat__gettop__medvezhya-i-volchya-pechat-velesa-otlichie__225__all.json`;
- normalized: `marketing/data/normalized/wordstat/20260806__wordstat__gettop__medvezhya-i-volchya-pechat-velesa-otlichie__225__all.csv`;
- Ledger: `marketing/data/ledger/query_evidence_ledger.csv`.

### Что это позволяет утверждать сейчас

1. Exact broad comparison-root имеет очень малый observed signal: `totalCount = 1`.
2. Так как `results` и `associations` отсутствовали, child/related observations из этого measurement не выводятся и не придумываются.
3. Этот exact comparison wording сам по себе не даёт основания считать comparison intent крупным самостоятельным кластером; operator, SERP и Alice evidence остаются pending.
4. Низкий count не отменяет ранее измеренный спрос на отдельные bear/wolf variant и meaning roots; это разные query entities и их counts не суммируются.

## 12. `какой оберег выбрать в машину`

Measurement:

- дата capture: `2026-08-10` (точность DATE; payload не содержит точного времени);
- режим: текущий controlled Autorun live-test;
- raw envelope: `bridge=wordstat-manual-bridge`, `version=1.1.1`;
- report prefix наблюдался как `Тест префикс` перед `WORDSTAT_RESULT_V1`, но не включается внутрь raw API envelope;
- `query_id = q_5b5d025fa1c6`;
- `measurement_id = m_wordstat_20260810_62413d0f`;
- `request_id = cdf23a53-9478-4166-9d48-85793c515423`;
- Россия `225`, `DEVICE_ALL`, `numPhrases=100`;
- HTTP 200, `elapsed_ms=198`;
- `totalCount = 12`;
- 1 `RESULT`;
- 15 `ASSOCIATION`.

Артефакты:

- raw: `marketing/data/raw/wordstat/20260810__wordstat__gettop__kakoy-obereg-vybrat-v-mashinu__225__all.json`;
- normalized: `marketing/data/normalized/wordstat/20260810__wordstat__gettop__kakoy-obereg-vybrat-v-mashinu__225__all.csv`;
- Ledger: `marketing/data/ledger/query_evidence_ledger.csv`.

Ключевой `RESULT`:

- `обереги в машину какой лучше выбрать` — 12.

### Что это позволяет утверждать сейчас

1. Direct automotive-choice intent существует, но broad signal узкий: `totalCount = 12`.
2. Returned RESULT фактически совпадает по намерению с root и имеет count `12`; отдельный более широкий relevant child в этом ответе не появился.
3. Все 15 `ASSOCIATION` относятся в основном к общему выбору/подбору автомобиля, его надёжности или подбору комплектующих и не повышаются до спроса на оберег.
4. Этот root закрывает meaning/comparison/choice часть исходного root-set; следующим остаётся gift-layer.

## 13. `подарок автомобилисту`

Measurement:

- дата capture: `2026-08-10` (точность DATE; payload не содержит точного времени);
- режим: текущий controlled Autorun live-test;
- raw envelope: `bridge=wordstat-manual-bridge`, `version=1.1.1`;
- report prefix наблюдался как `Тест префикс` перед `WORDSTAT_RESULT_V1`, но не включается внутрь raw API envelope;
- `query_id = q_c2f45c10ecf5`;
- `measurement_id = m_wordstat_20260810_81b917e1`;
- `request_id = 526c687d-8b9a-4fd2-a9e8-42f81345f4c7`;
- Россия `225`, `DEVICE_ALL`, `numPhrases=100`;
- HTTP 200, `elapsed_ms=506`;
- `totalCount = 1192`;
- 27 `RESULT`;
- 16 `ASSOCIATION`.

Артефакты:

- raw: `marketing/data/raw/wordstat/20260810__wordstat__gettop__podarok-avtomobilistu__225__all.json`;
- normalized: `marketing/data/normalized/wordstat/20260810__wordstat__gettop__podarok-avtomobilistu__225__all.csv`;
- Ledger: `marketing/data/ledger/query_evidence_ledger.csv`.

Ключевые `RESULT`:

- `подарок автомобилисту` — 1192;
- `подарок автомобилисту мужчине` — 429;
- `подарок день автомобилиста` — 257;
- `подарок автомобилисту на день рождения` — 240;
- `подарок автомобилисту мужчине на день рождения` — 187;
- `подарок для автомобилиста мужчине на день` — 78;
- `подарок автомобилисту женщине` — 51;
- `идеи подарков автомобилисту` — 44;
- `подарки для автомобилистов в машину` — 41;
- `подарки для автомобилистов в машину мужчине` — 31;
- `что купить автомобилисту в подарок` — 25.

### Что это позволяет утверждать сейчас

1. Gift-root имеет крупный broad signal: `totalCount = 1192`, сопоставимый по масштабу с общим automotive-obereg root `1388`.
2. Мужская gift-ветка выражена явно (`429`), как и birthday-intent (`240`) и их пересечение в отдельной формулировке (`187`). Counts пересекаются и не суммируются.
3. Есть прямой product/use-case слой `подарки для автомобилистов в машину = 41` и explicit shopping-research formulation `что купить автомобилисту в подарок = 25`.
4. Женская ветка также наблюдается (`51`), поэтому gift-demand не ограничивается только мужской аудиторией.
5. Associations в основном относятся к общему подарочному спросу; они не считаются child demand для автомобилистов и не суммируются с RESULT.
6. `подарок автомобилисту` подтверждается как high-value gift root и остаётся обоснованным кандидатом для operator precision/dynamics после завершения root discovery.

## Bridge live acceptance — текущие факты

Три последовательных API measurement ранее прошли в controlled autorun live-test без ручного Copy: `печать велеса в машину` → `оберег в машину` → `славянский оберег в машину`. Во всех трёх случаях расширение автоматически захватило новый `WORDSTAT_API_V1`, выполнило один Yandex request, вернуло `WORDSTAT_RESULT_V1` с настроенным префиксом и отправило его в ChatGPT.

Controlled manual live-test на `подвеска на зеркало в машину` успешно доказал цепочку: явная работа в привязанном диалоге → manual trigger → один Yandex request → HTTP 200 → настроенный prefix + `WORDSTAT_RESULT_V1` в ChatGPT. Raw envelope сохраняет фактически полученную metadata version без вмешательства в payload.

Autorun после Start-parity hotfix успешно доставил measurement `печать велеса значение`: команда была захвачена autorun, выполнен один Yandex request, получен HTTP 200 и возвращён настроенный prefix + `WORDSTAT_RESULT_V1`.

Controlled manual live-test на `медвежья и волчья печать велеса отличие` также прошёл: один `WORDSTAT_API_V1` → один Yandex request → HTTP 200 → `WORDSTAT_RESULT_V1`; measured `totalCount=1` сохранён без восстановления отсутствующих `results`/`associations`.

Текущий controlled Autorun measurement `какой оберег выбрать в машину` прошёл: один `WORDSTAT_API_V1` → один Yandex request → HTTP 200 → report prefix + `WORDSTAT_RESULT_V1`; measured `totalCount=12`, один RESULT и 15 ASSOCIATION сохранены в raw/normalized evidence.

Следующий controlled Autorun measurement `подарок автомобилисту` также прошёл: один `WORDSTAT_API_V1` → один Yandex request → HTTP 200 → report prefix + `WORDSTAT_RESULT_V1`; measured `totalCount=1192`, 27 RESULT и 16 ASSOCIATION сохранены в raw/normalized evidence и Ledger.

После полной фиксации результата `подарок автомобилисту` оператор явно остановил Autorun. **Новый API-вызов не выполняется и следующая исполняемая команда не выдаётся.**

## Следующий root

Плановый, но не запущенный root: `подарок мужчине в машину` — GetTop / Россия / DEVICE_ALL.

Причина: после `подарок автомобилисту` root discovery имеет прогресс `13/14`; в исходном root-set остаётся один gift-root. Его выполнение отложено до отдельной команды оператора.
