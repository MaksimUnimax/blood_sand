# WB0.2.1 — первый provider-neutral пакет готов к установке

Дата:2026-09-12. Прямое разрешение владельца на патч и продолжение. Нет новых реальных WB API-запросов.

Установочный ZIP: `wildberries-bridge-v0.2.1-extension.zip`,128734bytes,29production-files,SHA256 `ceeadd4d4302de5fe8989f27fe0be1f0363665e49ef19b56d8e4075e8a956a23`.

Финальная приёмка доступными методами:466поведенческих+58упаковочных=524PASS,0FAIL в выбранных финальных наборах. CI run34665446781 на fbb0a530 независимо восстановил ровно тот же ZIP и повторил386 детерминированных утверждений. Эти386 НЕ прибавляются к524.

## Фактический код

Полный путь восстановления закреплён в `reconstruct.py`; CI artifact10288806310 содержит исходники, все рецепты и ZIP. Первоначальная сохранённая0.2.0 восстановлена без обхода хешей; затем исправлены4воспроизведённых дефекта и заморожена0.2.1. Рецепт4исправлений — `repair_boundaries.py`. Старые reference-части не переписаны; отдельный `restore_verified_012.py` исправляет только известные6байт повреждённого транспорта и требует точный SHA пользовательского оригинала.

## Сохранённые тесты, не только пересказ

В `final-evidence/` находятся6частей xz/base64 и проверяющий восстановитель. Выполнить:

```sh
python final-evidence/RESTORE.py NEW_DIRECTORY
```

Ожидаются105UTF-8файлов, JSON417359bytes SHA256 `66a768130bf7da20f53386ed4540eb42d8bc1caf2899214a125cf94d74e357ea`.

Там фактические browser/worker/package runners; raw results всех выбранных финальных наборов; source hashes; exit receipts; pre-fix FAIL; отдельно сохранённые прерванные/исправленные harness-запуски; отчёт; все35patch gates;5live gates;53feature ledger;67TA coverage и14пунктов installed-чеклиста. Сохранённый локальный архив `WB_v0.2.1_WORK_AND_TESTS.zip` дополнительно содержит actual29production-файлов и неизменённый installationZIP.

## Честные границы

Browser proofs выполнялись в настоящем Chromium на локальном DOM с native File/DataTransfer/DOMParser/DecompressionStream, но с подставными AI origin, SHAoracle и Chrome messaging. Административные ограничения браузера не обходились. Установленный MV3, нативный IndexedDB extension-origin, текущие сайты ChatGPT/Алисы и живой WB не сертифицированы. Все LIVE-GATE остаются PENDING_POST_INSTALL.

Первый пакет включает runtime/identity/Manual/Autorun/batch/HELP/Work Session/файлы/XLSX и общие policy engines. Новые WB schema/token/Jam/quota/date/PII значения не выдуманы и не включены.188операций/172enabled/16blocked сохранены;16блокировок не снимаются Personal Data ON. WB cache/coalescing/prefetch отключены до characterization.

## Следующая работа

Передать0.2.1 владельцу, установить и проверить новый функционал по14пунктам чеклиста. Только затем R1-R8 пакетных реальныхWBтестов и адаптационный патч. Блоки001-010 не начинать заново, неизвестные старые55/404PASS не использовать.
