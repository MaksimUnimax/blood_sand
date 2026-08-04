# R1 — Wordstat API: доступ, стоимость, квоты и рекомендуемый путь

Дата проверки: 2026-08-04  
Статус: **актуальный доступ и тарифы подтверждены официальной документацией Яндекса**

## 1. Главный вывод

Для нового подключения проекта следует ориентироваться не на старый маршрут `api.wordstat.yandex.net` через OAuth + ClientId + обращение в поддержку Директа, а на **Wordstat внутри Yandex Search API / Yandex AI Studio**.

Русская актуальная справка Вордстата прямо сообщает, что возможности API Вордстата доступны в Wordstat API сервиса Yandex Search API:

- https://yandex.ru/support2/wordstat/ru/content/api-wordstat

Текущий Wordstat API в Yandex Search API имеет REST/gRPC методы:

- `GetTop` — топ запросов за последние 30 дней;
- `GetDynamics` — динамика частоты по дням/неделям/месяцам;
- `GetRegionsDistribution` — распределение по регионам;
- `GetRegionsTree` — дерево регионов.

Документация:
- https://aistudio.yandex.ru/docs/ru/search-api/concepts/wordstat.html
- https://aistudio.yandex.ru/docs/ru/search-api/api-ref/Wordstat/

## 2. Что с инструкцией через OAuth + ClientId

В англоязычной справке всё ещё присутствует инструкция для отдельного API `https://api.wordstat.yandex.net`, где требуется:

1. OAuth token;
2. ClientId приложения;
3. обращение в поддержку Яндекс Директа для подключения;
4. персональные квоты.

Источник:
- https://yandex.ru/support2/wordstat/en/content/api-wordstat

Для нового проекта этот путь не является предпочтительным, потому что текущая русская документация Яндекса направляет пользователей в Yandex Search API, где подключение стандартизировано через Yandex Cloud / AI Studio и опубликован явный тариф.

Мы не считаем старый endpoint «закрытым» без отдельного официального сообщения о закрытии; мы лишь фиксируем, что **для нового подключения выбираем Yandex Search API**.

## 3. Что нужно для нового Wordstat API

### Шаг 1. Яндекс ID

Нужен обычный аккаунт Яндекса.

### Шаг 2. Yandex Cloud / AI Studio

Нужно создать организацию, облако и каталог в Yandex Cloud / AI Studio.

### Шаг 3. Платёжный аккаунт

Для работы с AI Studio нужен активный платёжный аккаунт, привязанный к облаку.

Официальный quickstart:
- https://aistudio.yandex.ru/docs/ru/search-api/quickstart/

### Шаг 4. API-ключ

В AI Studio можно создать API-ключ. При этом Яндекс автоматически создаёт сервисный аккаунт с нужной ролью.

Для Wordstat требуется роль:

`search-api.webSearch.user`

и API-ключ с областью действия:

`yc.search-api.execute`

Источники:
- https://aistudio.yandex.ru/docs/ru/ai-studio/operations/get-api-key.html
- https://aistudio.yandex.ru/docs/ru/search-api/operations/wordstat-gettop.html

### Шаг 5. Аутентификация

Для REST можно использовать:

`Authorization: Api-Key <API-ключ>`

или IAM token:

`Authorization: Bearer <IAM-токен>`

Источник:
- https://aistudio.yandex.ru/docs/ru/search-api/api-ref/authentication.html

## 4. Актуальные REST endpoints

### GetTop

`POST https://searchapi.api.cloud.yandex.net/v2/wordstat/topRequests`

Используется для:
- общей частоты;
- запросов, содержащих ключевую фразу;
- связанных запросов/ассоциаций;
- фильтрации по регионам и устройствам;
- операторов поиска.

Документация:
- https://aistudio.yandex.ru/docs/ru/search-api/operations/wordstat-gettop.html

### GetDynamics

`POST https://searchapi.api.cloud.yandex.net/v2/wordstat/dynamics`

Можно получать:
- daily;
- weekly;
- monthly.

Для дневной детализации поддерживаются все поисковые операторы; для недельной и месячной — только `+`.

Документация:
- https://aistudio.yandex.ru/docs/ru/search-api/operations/wordstat-getdynamics.html

### GetRegionsDistribution

`POST https://searchapi.api.cloud.yandex.net/v2/wordstat/regions`

Возвращает:
- count;
- share;
- affinityIndex;
- распределение по городам/регионам.

Документация:
- https://aistudio.yandex.ru/docs/ru/search-api/operations/wordstat-getregionsdistribution.html

### GetRegionsTree

`POST https://searchapi.api.cloud.yandex.net/v2/wordstat/getRegionsTree`

Не тарифицируется.

Россия имеет region ID `225`.

Источники:
- https://aistudio.yandex.ru/docs/ru/search-api/operations/wordstat-getregiontree.html
- https://aistudio.yandex.ru/docs/ru/search-api/reference/regions.html

## 5. Стоимость на 2026-08-04

Официальный тариф Yandex Search API, цены в рублях с НДС:

| Метод Wordstat | Цена за 1000 API-запросов | Цена 1 запроса |
|---|---:|---:|
| GetTop | 20 ₽ | 0,02 ₽ |
| GetDynamics | 20 ₽ | 0,02 ₽ |
| GetRegionsDistribution | 50 ₽ | 0,05 ₽ |
| GetRegionsTree | бесплатно | 0 ₽ |

Источник:
- https://aistudio.yandex.ru/docs/ru/search-api/pricing.html

### Важный вывод по цене

Для нашего маркетингового исследования стоимость API практически не является ограничением. Основное ограничение — квоты.

Пример для текущего списка из 37 seed-запросов:

- один `GetTop` на каждый: 37 × 0,02 ₽ = **0,74 ₽**;
- один `GetDynamics` на каждый: 37 × 0,02 ₽ = **0,74 ₽**;
- один `GetRegionsDistribution` на каждый: 37 × 0,05 ₽ = **1,85 ₽**;
- полный набор из этих трёх методов для всех 37 фраз: **3,33 ₽**.

Даже если для каждой фразы сделать три варианта GetTop (например broad/phrase/exact) плюс Dynamics и Regions, ориентировочная стоимость составит около **4,81 ₽**.

100 фраз, если для каждой выполнить GetTop + GetDynamics + GetRegionsDistribution, стоят около **9 ₽**.

## 6. Стартовый грант Yandex Cloud

Для новых пользователей Yandex Cloud действует стартовый грант при создании первого платёжного аккаунта с привязанной картой.

На текущей публичной странице Яндекса указано:

- 4 000 ₽ для физических лиц;
- 10 000 ₽ для юридических лиц.

Грант выдаётся один раз и действует ограниченный срок; в актуальной документации указан срок 60 дней.

Источники:
- https://yandex.cloud/ru/all-offers
- https://yandex.cloud/ru/docs/billing/quickstart/
- https://yandex.cloud/ru/docs/billing/concepts/bonus-account

Для Wordstat нашего масштаба грант кратно превышает необходимый бюджет.

## 7. Квоты и ограничения

Актуальные стандартные квоты Wordstat внутри Yandex Search API:

- до **10 запросов в секунду**;
- до **100 запросов в час** на получение статистики.

Квоты являются организационными и могут быть увеличены через поддержку.

Лимиты/особенности:

- Wordstat работает в Search API только синхронно;
- запрос до 400 символов;
- до 40 слов в запросе;
- для GetTop можно запросить до 2000 фраз в ответе;
- максимальное число возвращаемых ассоциаций — 20.

Источники:
- https://aistudio.yandex.ru/docs/ru/search-api/concepts/limits.html
- https://aistudio.yandex.ru/docs/ru/search-api/operations/wordstat-gettop.html

### Что квоты означают для нас

Текущий пакет из 37 фраз:

- GetTop + Dynamics = 74 API-вызова — помещается в стандартную часовую квоту;
- GetTop + Dynamics + Regions = 111 вызовов — потребует минимум двух часовых окон при стандартной квоте;
- при расширении семантики до сотен фраз лучше автоматически ставить очередь и ограничитель скорости.

Стоимость при этом останется очень низкой.

## 8. Пример первого запроса для проекта

После создания API-ключа и получения `folderId` тестировать следует фразу `печать велеса` по России (`225`).

Пример тела:

```json
{
  "phrase": "печать велеса",
  "numPhrases": 100,
  "regions": ["225"],
  "devices": ["DEVICE_ALL"],
  "folderId": "<FOLDER_ID>"
}
```

Пример запроса:

```bash
curl \
  --request POST \
  --header "Authorization: Api-Key $YANDEX_API_KEY" \
  --header "Content-Type: application/json" \
  --data @body.json \
  "https://searchapi.api.cloud.yandex.net/v2/wordstat/topRequests"
```

Секретный API-ключ **никогда не сохранять в GitHub**. Использовать переменную окружения или secret storage.

## 9. Решение для проекта

**Использовать Yandex Search API Wordstat как основной программный источник семантической статистики.**

Причины:

1. официальный текущий маршрут Яндекса;
2. автоматическая обработка JSON;
3. крайне низкая стоимость;
4. доступ к частоте, динамике и регионам;
5. можно встроить в постоянный маркетинговый pipeline;
6. данные можно регулярно обновлять и хранить в `marketing/data/`, не смешивая их с кодом будущего сайта.

## 10. Следующий практический шаг

Нужно один раз вручную выполнить пользовательскую часть подключения:

1. зайти в Yandex AI Studio / Yandex Cloud;
2. создать или выбрать организацию/облако;
3. привязать платёжный аккаунт;
4. создать API-ключ;
5. получить `folderId`;
6. проверить один GetTop-запрос.

После успешного теста можно автоматизировать выгрузку текущих 37 seed-запросов и сохранять результат в маркетинговую директорию.

### Безопасность

Ни API-ключ, ни IAM-токен не должны попадать:
- в GitHub;
- в Markdown-исследования;
- в CSV;
- в commit history.
