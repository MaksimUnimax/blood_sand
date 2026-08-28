# Wildberries product links registry

Статус: рабочий реестр публичных ссылок Wildberries для оберегов, используемых при ручной выдаче рекомендаций и последующей интеграции.

## Scope

В реестр включаются **только карточки Wildberries с `subjectName = "Обереги"`**.

Не включаются:

- `Четки`;
- `Украшения для автомобиля`;
- знаки зодиака и другие карточки, находящиеся в категории `Четки`;
- открытки и другие несвязанные товары.

Источник: `cards_list` Wildberries Content API, bridge `wildberries-llm-api-bridge v0.1.2`, выгрузка 2026-08-27.

Пагинация пройдена полностью:

- первая страница: 100 карточек, из них 24 с `subjectName = "Обереги"`;
- вторая страница: 8 карточек, оберегов нет;
- следовательно, текущий реестр оберегов содержит 24 карточки.

## Формат публичной ссылки

```text
https://www.wildberries.ru/catalog/{nmID}/detail.aspx
```

## Обереги

| WB observed name | recommendation identity | nmID | Wildberries URL | Примечание |
|---|---|---:|---|---|
| Макошь | Макошь | 428251291 | https://www.wildberries.ru/catalog/428251291/detail.aspx | — |
| Родимич | Родимич | 267829272 | https://www.wildberries.ru/catalog/267829272/detail.aspx | — |
| Хорс | Хорс | 428256332 | https://www.wildberries.ru/catalog/428256332/detail.aspx | reserve V1 |
| Мара | Мара | 428260533 | https://www.wildberries.ru/catalog/428260533/detail.aspx | — |
| Стрибог | Стрибог | 428247858 | https://www.wildberries.ru/catalog/428247858/detail.aspx | reserve V1 |
| Семаргл | Семаргл | 428253224 | https://www.wildberries.ru/catalog/428253224/detail.aspx | — |
| Всеславец | Всеславец | 267824123 | https://www.wildberries.ru/catalog/267824123/detail.aspx | — |
| Сварог | Сварог | 428237614 | https://www.wildberries.ru/catalog/428237614/detail.aspx | — |
| Чур | Чур | 481133505 | https://www.wildberries.ru/catalog/481133505/detail.aspx | — |
| Чернобог | Чернобог | 267822360 | https://www.wildberries.ru/catalog/267822360/detail.aspx | reserve V1 |
| Боговник | Боговник | 267824122 | https://www.wildberries.ru/catalog/267824122/detail.aspx | — |
| Триглав | Триглав | 267829273 | https://www.wildberries.ru/catalog/267829273/detail.aspx | reserve V1 |
| Звезда Лады | Звезда Лады | 428267039 | https://www.wildberries.ru/catalog/428267039/detail.aspx | — |
| Ратиборец | Ратиборец | 267829271 | https://www.wildberries.ru/catalog/267829271/detail.aspx | reserve V1 |
| Белобог | Белобог | 267822359 | https://www.wildberries.ru/catalog/267822359/detail.aspx | — |
| Даждьбог | Даждьбог | 428241264 | https://www.wildberries.ru/catalog/428241264/detail.aspx | — |
| Алатырь (Крест Сварога) | Алатырь | 267696742 | https://www.wildberries.ru/catalog/267696742/detail.aspx | — |
| Знак Велеса | Велес | 267696740 | https://www.wildberries.ru/catalog/267696740/detail.aspx | WB display name differs from recommendation identity |
| Жива | Жива | 428230545 | https://www.wildberries.ru/catalog/428230545/detail.aspx | — |
| Молвинец | Молвинец | 267829270 | https://www.wildberries.ru/catalog/267829270/detail.aspx | reserve V1 |
| Знич | Знич | 267824125 | https://www.wildberries.ru/catalog/267824125/detail.aspx | — |
| Печать Велеса | Медвежья лапа | 267696739 | https://www.wildberries.ru/catalog/267696739/detail.aspx | В recommendation logic используется как Медвежья лапа; для Волка запрещена |
| Перун | Перун | 428244941 | https://www.wildberries.ru/catalog/428244941/detail.aspx | — |
| Звезда Руси | Звезда Руси | 267696741 | https://www.wildberries.ru/catalog/267696741/detail.aspx | WB-only относительно текущего Ozon master; не используется в матрице V1 |

## Важные расхождения с текущей Ozon/recommendation номенклатурой

### Велес

Wildberries:

```text
Знак Велеса
nmID = 267696740
```

Для recommendation system связывается с identity `Велес`.

### Печать Велеса

Wildberries:

```text
Печать Велеса
nmID = 267696739
```

Для recommendation system нормализуется как:

```text
Медвежья лапа
```

и **не используется для Чертога Волка**.

### Звезда Руси

Карточка существует в категории `Обереги` Wildberries, но отсутствует в текущем Ozon master и в `KIP_RECOMMENDATION_MATRIX_V1`. Поэтому наличие ссылки не делает её автоматически допустимой рекомендацией.

### Нет в категории `Обереги` текущей WB-выгрузки

В текущих карточках с `subjectName = "Обереги"` не найдены:

- `Колядник`;
- `Громовик`.

Они не добавляются из категории `Четки`, поскольку scope этого реестра намеренно ограничен только категорией `Обереги`.

Следствие для ручной рекомендации: если матрица выдаёт товар, отсутствующий в этом WB-реестре, использовать доступную ссылку другого маркетплейса (например Ozon), а не подменять рекомендацию другим товаром.
