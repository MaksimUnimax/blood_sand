# M0 Domain Freeze Audit — recommendation matrix V1

Статус: **DOMAIN_MATRIX_FREEZE_PASS**  
Дата фиксации: 2026-08-27  
Матрица: `KIP_RECOMMENDATION_MATRIX_V1`  
Календарь: `KIP_CHERTOG_CALENDAR_V1`

## 1. Цель аудита

Перед переходом к machine-readable Recommendation Core отдельно проверить не только прямые связи `Чертог → покровитель`, но и все curated-строки, где в ассортименте нет прямого товара либо действует гендерная политика.

Этот документ фиксирует продуктовую согласованность V1. Он **не утверждает историческую доказанность** системы 16 Чертогов и современных амулетных соответствий. Для продукта используется зафиксированная curated-конвенция, описанная в `RECOMMENDATION_MATRIX.md` и `PRODUCT_CLASSIFICATION.md`.

## 2. Проверенные invariants

Подтверждены следующие правила:

- 16 Чертогов покрывают весь год без runtime-поиска внешних таблиц;
- первый день нового диапазона принадлежит новому Чертогу;
- `29.02 → Волк`;
- существует ровно 32 primary-case: `16 Чертогов × 2 пола`;
- по умолчанию выдаётся ровно один товар;
- единственный approved secondary-case: `Медведь + мужчина → Сварог + Медвежья лапа`;
- ни один другой сценарий не получает второй товар;
- `Печать Велеса` нормализуется как recommendation identity `Медвежья лапа`;
- `Медвежья лапа` запрещена для Волка;
- gender hard filters применяются до выдачи результата;
- продажи, популярность, CTR, остатки и рекламный приоритет не меняют semantic recommendation;
- marketplace availability не создаёт новую смысловую рекомендацию.

## 3. Прямые и производные строки

Следующие строки считаются достаточно сильными для V1 и не требуют curated-замены:

| Чертог | Пол | Результат | Тип связи | Решение |
|---|---|---|---|---|
| Дева | female | Жива | DIRECT_PATRON | KEEP |
| Лебедь | female | Макошь | DIRECT_PATRON | KEEP |
| Змей | male | Семаргл | DIRECT_PATRON | KEEP |
| Змей | female | Семаргл | DIRECT_PATRON | KEEP |
| Ворон | male | Колядник | DIRECT_DERIVED | KEEP |
| Медведь | male | Сварог | DIRECT_PATRON | KEEP |
| Медведь | male | Медвежья лапа | DIRECT_CHERTOG_SYMBOL | KEEP secondary |
| Медведь | female | Сварог | DIRECT_PATRON | KEEP |
| Волк | male | Велес | DIRECT_PATRON | KEEP |
| Волк | female | Велес | DIRECT_PATRON | KEEP |
| Лиса | male | Мара | DIRECT_DERIVED | KEEP |
| Лиса | female | Мара | DIRECT_DERIVED | KEEP |
| Лось | female | Звезда Лады | DIRECT_DERIVED | KEEP |
| Орёл | male | Перун | DIRECT_PATRON | KEEP |
| Орёл | female | Перун | DIRECT_PATRON | KEEP |
| Раса | male | Даждьбог | DIRECT_PATRON | KEEP |
| Раса | female | Даждьбог | DIRECT_PATRON | KEEP |

Примечание: из-за единственного secondary-case число строк в этом разделе больше числа direct primary-case.

## 4. Curated mapping audit

Оценка здесь относится к **внутренней согласованности продукта**, а не к исторической достоверности.

Уровни:

- `STRONG_CURATED` — связь понятна и легко объясняется клиенту;
- `ACCEPTABLE_CURATED` — связь не прямая, но достаточно согласована по смыслу для V1;
- `WEAK_BUT_APPROVED_V1` — прямого аналога нет; оставляем как осознанный продуктовый fallback и не маскируем его под покровителя.

| Чертог / покровитель | Пол | Recommendation | Оценка | Основание и решение |
|---|---|---|---|---|
| Дева / Жива | male | Даждьбог | ACCEPTABLE_CURATED | Жива запрещена мужчине; Даждьбог сохраняет линию жизненной/созидательной силы. KEEP как мужской curated fallback. |
| Вепрь / Рамхат | male | Алатырь | ACCEPTABLE_CURATED | Прямого Рамхата нет; Алатырь используется как нейтральный символ основы, порядка и устойчивости. KEEP. |
| Вепрь / Рамхат | female | Алатырь | ACCEPTABLE_CURATED | Та же универсальная смысловая линия, gender conflict отсутствует. KEEP. |
| Щука / Рожана | male | Родимич | STRONG_CURATED | Родовая, семейная, преемственная линия; соответствует мужской gender policy. KEEP. |
| Щука / Рожана | female | Макошь | STRONG_CURATED | Женская семейно-родовая линия; не выдаётся как прямой покровитель Щуки. KEEP. |
| Лебедь / Макошь | male | Всеславец | STRONG_CURATED | Прямая Макошь запрещена мужчине; Всеславец сохраняет темы согласия, семьи и гармонии. KEEP. |
| Ворон / Коляда | female | Белобог | WEAK_BUT_APPROVED_V1 | Женского прямого товара линии Коляды нет. Белобог оставляется как светлый/созидательный нейтральный fallback. В copy запрещено называть Белобога покровителем Ворона. KEEP V1, кандидат на пересмотр при расширении ассортимента. |
| Бусел / Род | male | Родимич | STRONG_CURATED | Прямая родовая линия и мужская policy. KEEP. |
| Бусел / Род | female | Звезда Лады | STRONG_CURATED | Женская семейно-родовая линия при отсутствии отдельного товара Рода. KEEP. |
| Тур / Крышень | male | Чур | WEAK_BUT_APPROVED_V1 | Прямого Крышеня нет; Чур используется по защитной линии. Не выдавать как прямое соответствие покровителю. KEEP V1, кандидат на пересмотр. |
| Тур / Крышень | female | Чур | WEAK_BUT_APPROVED_V1 | Та же защитная curated-линия; универсальная gender policy. KEEP V1, кандидат на пересмотр. |
| Лось / Лада | male | Всеславец | ACCEPTABLE_CURATED | Прямая производная `Звезда Лады` имеет female policy; Всеславец сохраняет семейно-гармоничную линию. KEEP. |
| Финист / Вышень | male | Боговник | ACCEPTABLE_CURATED | Прямого Вышеня нет; Боговник используется по духовной линии. KEEP. |
| Финист / Вышень | female | Боговник | ACCEPTABLE_CURATED | Универсальный товар, та же духовная curated-линия. KEEP. |
| Конь / Купала | male | Знич | ACCEPTABLE_CURATED | Купалы в ассортименте нет; Знич используется по огненной/жизненной линии. KEEP. |
| Конь / Купала | female | Жива | ACCEPTABLE_CURATED | Женская жизненная линия при отсутствии Купалы. KEEP. |

## 5. Что сознательно НЕ делаем перед M1

- Не заменяем слабые curated-строки популярными товарами.
- Не добавляем reserve SKU только ради покрытия ассортимента.
- Не меняем gender policy, чтобы искусственно получить более прямую пару.
- Не делаем несколько вариантов «на выбор» для слабого соответствия.
- Не используем Wildberries/Ozon availability для semantic substitution.

## 6. Curated rows, которые следует пересматривать первыми в будущей версии

Если ассортимент расширится либо появятся более подходящие recommendation identities, первой очередью пересматриваются:

1. `Ворон + female → Белобог`;
2. `Тур + male/female → Чур`;
3. затем `Дева + male → Даждьбог`.

Это **не блокеры V1**. Они оставлены осознанно и должны иметь честный клиентский copy как смысловые замены, а не как прямых покровителей.

## 7. Product identity / destination readiness

Для перехода к core зафиксированы stable recommendation identities.

Критическая нормализация:

```text
marketplace observed: Печать Велеса
recommendation identity: Медвежья лапа
```

Ozon destination registry существует для текущего ассортимента. Wildberries registry сформирован отдельно только из карточек `subjectName = "Обереги"`; отсутствие WB-карточки не меняет semantic result.

Product destination остаётся отдельным слоем от Recommendation Core.

## 8. Client copy readiness

`CUSTOMER_RECOMMENDATION_COPY_GUIDE.md` является живым документом формулировок.

Фиксированный semantic result после M0 не означает, что клиентский текст замораживается навсегда. Можно улучшать:

- порядок фраз;
- длину объяснения;
- формулировки причины;
- CTA;
- формат ссылок.

При этом copy не имеет права менять `chertog`, `product_identity`, `rank` или gender policy.

## 9. Gate result

M0 считается закрытым:

```text
DOMAIN_MATRIX_FREEZE_PASS
```

Основание:

- все 32 primary-case определены;
- единственный secondary-case определён;
- hard gender rules определены;
- критическая identity `Медвежья лапа` нормализована;
- curated-строки явно отделены от direct-связей;
- слабые V1 fallback-строки отмечены для будущего пересмотра;
- нет blocker, требующего менять матрицу до реализации.

## 10. Следующий шаг

Переход к `M1 — Machine-readable Recommendation Core`:

1. JSON schemas + четыре versioned data-файла;
2. `validateConfiguration()`;
3. `validateBirthDate()` / `resolveChertog()`;
4. `resolveRecommendation()`;
5. canonical 32-case + boundary tests.

До прохождения M1 gates VK Bot и VK Mini App не реализуются.
