# Журнал выполнения Alice single-file repair

## База и разрешение
Пользователь явно разрешил планирование и реализацию патча. Живая исходная ветка прочитана, HEAD06ec1af2... подтверждён. Создана новая repair/ozon-alice-single-file-delivery-2026-09-12 без reset/force. Первый remote commit d0090b2c... содержит только экспорт исходников, audit-run34692411427 SUCCESS. До подтверждения локального RED production не изменялся.

## Доказанные исходные дефекты
Сохранены три самостоятельных поведенческих воспроизведения на точных старых файлах: лишний TXT в mixed batch; второй GET выполнялся до file-limit проверки; отказ до attachment commit удалял данные без ответа модели. Эти тесты специально подтверждают старое ошибочное поведение; их exit0 означает EXPECTED_BEHAVIORAL_RED_CONFIRMED, а не исправленную версию.

## Остановки и уточнения локального кандидата
- Начальная fixture использовала слишком короткие refs; приведена к действующему реальному формату до использования как evidence. Контракт refs не ослаблялся.
- Расширение тестов на все binary routes выявило прежние двухшаговые PDF операции. Сохранён их прежний explicit retrieval; слот успешно приобретённого файла учитывается без скрытого запроса.
- Fake IDB getAll использовал map(structuredClone), что передавало индекс как options; исправлена только fixture стрелочной функцией.
- Static audit искал async function processBatchQueue, тогда как production функция возвращает Promise без async. Исправлен якорь теста, а не production.
- Прежняя IDB source-аудит проверка предполагала 3 writes и 3 readers. Новая retention добавила 1 writer и2 readers: расширено до4/5. Проверки transaction.oncomplete и оба старых broken-writer негативных контроля сохранены.
- Запуск старого regression13 локально потребовал исторический Git объект, которого нет в файловом экспорте. Для final CI предусмотрен checkout fetch-depth0; тест не исключён из списка31.
- Mutation с отключением TTL не поймался первоначальной проверкой после пересоздания: cleanup раньше удалил запись. Добавлена независимая проверка ровно срока при ещё существующей записи. Обе проверки оставлены; мутация теперь отвергается по правильной причине.
- Локальный Chrome не может загрузить расширение/CDP в управляемой среде. Проверено, что старый baseline тоже не стартует. Политики системы НЕ менялись и не обходились. Реальный Chrome перенесён в доступный GitHub Actions runner с закреплёнными версией и checksum.

## Защита от ложного зелёного результата
56 behavioral cases на действительных production functions/queue/Port handlers. 10 испорченных вариантов отвергаются по ожидаемому названию failing case, не по случайному crash. Проверяется extra-file mutation. Final проходит все доступные стадии на одном ZIP после materialization. Ранние зелёные результаты не заменяют финальный цикл. Реальные Ozon API и данные магазина в CI не используются.

## Граница результатов
Исходный ChatGPT multi-file live control относится к предыдущей установленной версии. Для новой версии он является regression target, а не автоматическим LIVE PASS. Все LIVE-GATE остаются PENDING POST-INSTALL до нового фактического приёмочного прогона.

## Recovered private semantic-key correction
Real Chrome rejected the unpublished retained TXT after worker recreation: LOCAL_DELIVERY_COMMAND_MISMATCH. The guard incorrectly hashed JSON member insertion order. A deterministic permutation scenario reproduces that failure on stage1. The replacement uses SHA-256 of the normalized command with recursively sorted object keys and unchanged array ordering/values. Global request fingerprints are untouched. New tests: 56 behavioral cases and 10 named mutations. Full prior regressions and Chrome must be repeated.

## Continuation recovery
After another session interruption only notes/evidence survived locally; the stage1 candidate was reconstructed from a hash-verified remote archive. The private-key correction is therefore reconstructed from the recorded design and proved anew, not represented as restored byte-for-byte. No production publication or handoff preceded the gates.

## Prepublication verification complete
The whole deterministic gate (56 behavioral cases,10 mutations,old31 plus expiry/consumer/worker/HELP/type/UI) and real Chrome Port/IDB/stopWorker/new target/local next-turn delivery passed before this runtime commit. The semantic ordering RED is independently reproduced against frozen stage1. Previous run34697032376 found missing ninth consumer classification;34697266876 caught an incorrect test field name.34697449141/34697638745 caught the unpublished private command-order defect. No failed run was called a ready build. Final exact-package Linux/Chrome/Windows cycle remains mandatory.
