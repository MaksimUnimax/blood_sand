# Wildberries product links registry

Статус: рабочий реестр публичных ссылок Wildberries для оберегов, используемых при ручной выдаче рекомендаций и последующей интеграции.  
Current recommendation authority: `KIP_RECOMMENDATION_MATRIX_V2_SALES_WEIGHTED`.

## Scope

В реестр включаются только карточки Wildberries с `subjectName = "Обереги"`.

Источник: `cards_list` Wildberries Content API, bridge `wildberries-llm-api-bridge v0.1.2`, выгрузка 2026-08-27.

## Формат публичной ссылки

```text
https://www.wildberries.ru/catalog/{nmID}/detail.aspx
```

### Hard customer naming rule

Для `nmID = 267696739` customer-facing название всегда ровно:

```text
Печать Велеса
```

Никакие внутренние aliases или технические пояснения к названию не добавляются.

## Обереги

| WB observed name | recommendation identity | nmID | Wildberries URL | Current V2 note |
|---|---|---:|---|---|
| Макошь | Макошь | 428251291 | https://www.wildberries.ru/catalog/428251291/detail.aspx | active Лебедь female |
| Родимич | Родимич | 267829272 | https://www.wildberries.ru/catalog/267829272/detail.aspx | active male rows |
| Хорс | Хорс | 428256332 | https://www.wildberries.ru/catalog/428256332/detail.aspx | reserve |
| Мара | Мара | 428260533 | https://www.wildberries.ru/catalog/428260533/detail.aspx | active Лиса female |
| Стрибог | Стрибог | 428247858 | https://www.wildberries.ru/catalog/428247858/detail.aspx | reserve |
| Семаргл | Семаргл | 428253224 | https://www.wildberries.ru/catalog/428253224/detail.aspx | active Змей |
| Всеславец | Всеславец | 267824123 | https://www.wildberries.ru/catalog/267824123/detail.aspx | inactive automatic |
| Сварог | Сварог | 428237614 | https://www.wildberries.ru/catalog/428237614/detail.aspx | active male Дева/Конь |
| Чур | Чур | 481133505 | https://www.wildberries.ru/catalog/481133505/detail.aspx | active Тур |
| Чернобог | Чернобог | 267822360 | https://www.wildberries.ru/catalog/267822360/detail.aspx | **active Лиса male** |
| Боговник | Боговник | 267824122 | https://www.wildberries.ru/catalog/267824122/detail.aspx | inactive automatic |
| Триглав | Триглав | 267829273 | https://www.wildberries.ru/catalog/267829273/detail.aspx | reserve |
| Звезда Лады | Звезда Лады | 428267039 | https://www.wildberries.ru/catalog/428267039/detail.aspx | active female rows |
| Ратиборец | Ратиборец | 267829271 | https://www.wildberries.ru/catalog/267829271/detail.aspx | reserve |
| Белобог | Белобог | 267822359 | https://www.wildberries.ru/catalog/267822359/detail.aspx | inactive automatic |
| Даждьбог | Даждьбог | 428241264 | https://www.wildberries.ru/catalog/428241264/detail.aspx | active only Раса |
| Алатырь (Крест Сварога) | Алатырь | 267696742 | https://www.wildberries.ru/catalog/267696742/detail.aspx | active V2 |
| Знак Велеса | Велес | 267696740 | https://www.wildberries.ru/catalog/267696740/detail.aspx | active Волк; WB display differs |
| Жива | Жива | 428230545 | https://www.wildberries.ru/catalog/428230545/detail.aspx | active female Дева/Конь |
| Молвинец | Молвинец | 267829270 | https://www.wildberries.ru/catalog/267829270/detail.aspx | active Бусел male |
| Знич | Знич | 267824125 | https://www.wildberries.ru/catalog/267824125/detail.aspx | inactive automatic |
| Печать Велеса | Печать Велеса | 267696739 | https://www.wildberries.ru/catalog/267696739/detail.aspx | active Медведь both; Волк forbidden |
| Перун | Перун | 428244941 | https://www.wildberries.ru/catalog/428244941/detail.aspx | active Орёл |
| Звезда Руси | Звезда Руси | 267696741 | https://www.wildberries.ru/catalog/267696741/detail.aspx | not in automatic V2 |

## Важные расхождения

### Велес

Wildberries card:

```text
Знак Велеса
nmID = 267696740
```

Recommendation identity: `Велес`.

### Печать Велеса

Wildberries card:

```text
Печать Велеса
nmID = 267696739
```

Recommendation identity и customer-facing label: `Печать Велеса`.

Используется только для Чертога Медведя. Для Волка запрещён; Волк получает отдельный `Велес`.

### Чернобог

Current V2:

```text
Лиса + мужчина → Чернобог
```

WB:

```text
https://www.wildberries.ru/catalog/267822360/detail.aspx
```

### Звезда Руси

Карточка существует, но наличие ссылки само по себе не делает её automatic recommendation.

### Нет в категории `Обереги` текущей WB-выгрузки

Не найдены:

- Колядник;
- Громовик.

Current matrix resolves `Ворон + мужчина + Wildberries → Алатырь`; реестр ссылок не должен сам подменять любой другой matrix result.

## Recommendation usage rule

Сначала применяется `RECOMMENDATION_MATRIX.md`, затем из этого registry берётся ссылка. Нельзя выбирать товар из registry по остатку/цене/продажам на лету.

Актуальные примеры:

```text
25.03 + male
→ Лиса
→ Чернобог
→ https://www.wildberries.ru/catalog/267822360/detail.aspx
```

```text
25.03 + female
→ Лиса
→ Мара
→ https://www.wildberries.ru/catalog/428260533/detail.aspx
```

```text
16.01 + male/female
→ Медведь
→ Печать Велеса
→ https://www.wildberries.ru/catalog/267696739/detail.aspx
```