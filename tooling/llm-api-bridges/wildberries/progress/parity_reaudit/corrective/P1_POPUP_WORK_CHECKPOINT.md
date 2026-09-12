# P1 popup / Work authority — сохранённый код и проверки

Дата: 2026-09-12.
Статус: POPUP_AND_WORK_AUTHORITY_IMPLEMENTED / TARGETED_OFFLINE_PASS / NOT_A_RELEASE.
P4/P7 Start: OPEN_BLOCKS_HANDOFF. Установленная WB021 не заменена.

## 1. Что действительно изменено

Popup приведён к операторской структуре Ozon с оформлением Wildberries. Один popup.js управляет состоянием и ошибками. Вверху единый блок рабочей сессии, ниже выбор AI для вкладки, привязка, сведения о packaged-реестре и WB token, настройки доставки и стартового текста, локальные диагностика и XLSX-инспектор. Отдельный manualMode и продовые Autorun-кнопки убраны. Автоотправка результата сохранена как самостоятельная настройка, не Autorun. Неиспользуемый popup_runtime.js остаётся в рабочем дереве, но HTML его не подключает; окончательная очистка пакета ещё не выполнена.

Worker определяет разрешение ручного выполнения только через Work state. Старый boolean не оживляет hidden/inactive/error-сессию. Legacy setter отклоняется; content также отклоняет WB_APPLY_MANUAL_MODE вместо обхода Work. Show/Hide/Refresh/Finish требуют подтверждения от content; ошибка подтверждения не превращается в успешный статус. Возобновление существующего связанного диалога не запускает provider. Публичное состояние включает Work и признак активной ручной операции.

AI override теперь реально ограничен tab+origin: настройка другого origin не переносится; content не может подменить tab_id отправителя или менять popup-only настройки. Несохранённые поля popup не затираются обновлением статуса. После успешного Work-действия старый WORK_NOT_ACTIVE не перекрывает актуальное состояние. Текущая ошибка действия показывается явно. Последняя старая API-ошибка отделена как история в диагностике.

Нативный Copy по-прежнему не исполняет WB. Отдельные WB-кнопки остаются в одном extension-owned Shadow DOM overlay, реализованном предыдущим блоком.

## 2. Точные опубликованные байты

Каталог `p1_popup_work/part01.b64` … `part12.b64`.
Immutable remote ref для проверки всех частей: `b53bb788dbdb0a3b2ad39e16a239f68ba1c60ae9`.
Все 12 remote Git blob SHA сверены с локально вычисленными SHA фактических файлов. Части 01–08 проверены в ответе directory; из-за обрезания большого ответа 09–12 дополнительно прочитаны отдельно для получения blob SHA. Пустой диапазон строки 2 использован только для получения metadata SHA, не как прочитанный исходник.

| Часть | Git blob SHA |
|---|---|
| 01 | d5f9b23b213979e2c45eb9ed386344d6a992f7fe |
| 02 | 62450b2c4139c480ad92286fcf4ea7d84a1c323e |
| 03 | 0c2fcb88280fa44f10092d974e1f8e452e9fa340 |
| 04 | f2b26ef287deb21cd1b74a396a1f9d9c17cd9b37 |
| 05 | ea3cc475c9f8f896c6f33733340e71be6ee18a2c |
| 06 | bc8b6ff52d53592644577e32cc6abc37bf07f9d3 |
| 07 | ef61ac8ac7ba1d5736c94da0d889b1aa09d493e5 |
| 08 | 221f263ba94a9f7cc5940acc66a61249ad0c0d8b |
| 09 | f224fe6a50a56233a7d9c235cc078db7c1e882a7 |
| 10 | 0fc9971cd0cfba0cea513926f9f2260c93ce877c |
| 11 | 48827c32a00bad6390c98eb0e0e84752c85c37a5 |
| 12 | 08d283089b57b3cc0315224165d1763d28d5dff5 |

Соединить части в числовом порядке, удалить whitespace, декодировать Base64. Получается tar.xz, **34388 байт**, SHA-256 **92eebb3eab5c35fb1eb7cee98dd4ebeebd7fdb8dbfd7e0dfc49479fc4353b6bc**, 52 файла. Локальная реконструкция из частей побайтно совпала с исходной capsule.

Внутри: полный актуальный popup.html/css/js, точный runtime.patch для service_worker.js/shared/runtime_worker.js/content_script.js, SOURCE.json с before/after SHA, capsule_restore.py с проверкой всех входных/выходных байтов, тестовые программы и исходные RED/GREEN results.jsonl, summary.json, stdout/stderr. Восстановление выполнено в отдельный recovered_after_popup, не поверх исходного baseline.

Порядок восстановления: COPY exact WB021 -> INITIAL_ERRORS.patch -> P1_SURFACE.patch -> текущая capsule через capsule_restore.py. Два предыдущих опубликованных checkpoint содержат точные входы и декодирование. Не накладывать diff на случайное рабочее дерево.

Текущие SHA-256 из SOURCE.json, проверенные при реконструкции:
- popup.html: e1f638d5fb09c62b78250bb7ba100548e80edf51b804e782bcb4aaccc4fa5867
- popup.css: 0ed99ad9d50ce8339f9bbe081906884557ac8bf4be6bbef389546ab9beea1872
- popup.js: 937733bda7ef6e75b5e90fa25f34cce218dc3cb07eb9b731f469874f29bee3a9
- service_worker.js: f93ffd9250f49e8146091e7c8a6e6d2b119485c21f5bbcd7ad4bb3012f44c46c
- shared/runtime_worker.js: 220f1a08a9c6e33f9153b20a67fc1f21dee41a4c3b9d395b63d6559417fc69fb
- content_script.js: f83056a6ff604a3315822c7d0da69df0b15f5bf34ab0f5060e1ecd5236e9759b

## 3. Проверки точного текущего WIP

| Suite / evidence directory | PASS | FAIL | Граница доказательства |
|---|---:|---:|---|
| popup_work_worker.mjs / green-popup-worker-r2/run | 21 | 0 | Настоящий worker/importScripts, mocked Chrome и UI acknowledgements |
| popup_browser.py / green-popup-browser-02 | 12 | 0 | Настоящие popup HTML/CSS/scripts в Chromium, synthetic runtime state |
| own_button_browser.py / green-own-after-popup | 13 | 0 | Настоящие production content scripts в Chromium, synthetic ChatGPT/Alice DOM |
| parity_error_worker.mjs / green-error-after-popup | 22 | 0 | Worker local errors, owner/recovery, extracted actual Ozon mixed-discovery oracle |
| manual_error_content.mjs / green-content-after-popup | 4 | 0 | Настоящий handleCopy control flow с подставленными worker result и delivery |
| recovered contract.mjs / green-contract-after-popup | 197 | 0 | WB ingress и mocked serialization всех 172 разрешённых операций |
| **Итого актуальных targeted assertions** | **269** | **0** | Не полный parity gate и не owner LIVE |

Синтаксис изменённых JS также проверен. Реальных WB/Ozon provider calls: 0. В Chromium suites network_attempts пуст. Никаких бизнес-изменений.

Для расширенной 21-case Work suite точный RED: red-popup-worker-r2/run, **4 PASS / 17 FAIL**, исходный worker 5919238ec62cdb74660b4368098b96e4d4601951d4a83301e58d9cc4c5c2e20c. Это отдельный расширенный run, не прежние 16 случаев. Popup RED r4: 1 PASS / 11 FAIL. Добавленный content legacy bypass RED: 12 PASS / 1 FAIL. Предыдущие 223 и 12 не прибавляются к 269 повторно.

## 4. Сохранённые причины промежуточных неудач

Старые popup fixture неправильно эмулировали callback/promise Chrome API и давали cb is not a function: не продуктовая диагностика. Исправлена fixture; RED повторён. В green-popup-browser-01 одно действие шло к свёрнутому полю — исправлена процедура открытия details; другая проверка выявила реальную потерю выбранного AI при busy-render до чтения select.value — исправлен popup.js, значение снимается до render. Полный корректный повтор — r4/green-02. Ошибочные протоколы не используются как итоговый PASS.

## 5. Чего этот checkpoint НЕ закрывает

Start Work в WB всё ещё не реализует поздний Ozon протокол: durable start intent -> commit перед единственным Send -> подтверждённый user turn или unknown_no_retry -> связанный завершённый assistant response -> active_visible. Нельзя считать мгновенное active_visible корректным переносом. Это следующий обязательный связный блок P4/P7, который блокирует выдачу установочной сборки.

Также открыты оставшиеся ранние/transport/storage/busy-ошибки P2; полный HELP V2/guidance; расширенные recovery/attachment/file-send транзакции; Multi-AI/Alice и остальные P5–P9. Выполненные module/DOM тесты не заменяют интеграцию настоящего popup с настоящим worker и delivery в одной установленной среде.

## 6. Точное продолжение

Сначала обновить WORK_LOG и EXECUTION_CURSOR на этот опубликованный code checkpoint. Далее читать/переносить точный late Ozon pending_work_start_model, worker Start commit/outcome/identity handlers и content prompt/watcher, сохраняя все незавершённые intent/callback states и RED/GREEN. Существующие verified capsules не создавать заново. Не запускать новые owner-тесты, R1–R8 или provider acquisition. Не выдавать WIP как v0.2.2.
