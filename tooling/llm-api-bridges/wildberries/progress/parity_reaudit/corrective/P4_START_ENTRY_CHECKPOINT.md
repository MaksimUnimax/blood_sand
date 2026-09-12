# P4/P7 Work Start — вход в следующий связный блок
Дата: 2026-09-12. Статус: SOURCE_COMPARISON_IN_PROGRESS / NO_START_CODE_CHANGE_YET.

Предыдущий фактический код сохранён в P1_POPUP_WORK_CHECKPOINT.md, commit 434bf12a5886e12b7022ae2a0bfa735451c05387. Общий cursor v9 прочитан обратно на d382c5e636b08109aab1d4b509d80e18da4f9048, blob 6ad498993f4a1adfa405282a35980189641d9a1c. WORK_LOG новые строки 15–19 прочитаны обратно, blob ec7f791817f80505a32d4b161f2b2cc61ec46b32. Это точка с 269 targeted PASS, не полный parity и не установленная новая версия.

## Требуемое поведение
Перенести точную причинную цепочку позднего Ozon: долговечный intent/revision до dispatch; commit перед единственным Send; доказанный новый user turn либо unknown_no_retry; новый завершённый assistant response того же запуска; только затем active_visible. Перезапуск worker/refresh не разрешает повторную отправку. Нельзя заменять эту цепочку мгновенной сменой Work state.

## Реальные источники в workspace
Exact late Ozon package находится в ozon_latest/. Проверен перечень 32 файлов. Отдельного shared/pending_work_start_model.js НЕТ: первоначальная попытка прочитать такое имя остановилась на ls, никакой код не изменён. Искать реальную модель в shared/work_session_model.js и worker, не создавать доказательство из вымышленного имени. Это исправление навигации по источнику, не новый runtime defect.

WB shared/work_session_model.js прочитан целиком: normalize сохраняет ограниченный набор Work fields, включая start_intent_id, но не всю pending Send proof. Требуется отдельная долговечная pending-запись или доказанно эквивалентное расширение по источнику Ozon. Запрет на небезопасное cross-chat связывание сохраняется.

## Следующие чтения
Ozon shared/work_session_model.js; exact worker pending Start helpers и handlers; WB runtime_worker Start и content message/identity/composer helpers. Записать diff причинного сопоставления и RED tests до правки production. Не повторять уже закрытый popup/own-button блок. Реальных provider calls и бизнес-изменений в этом блоке: 0.
