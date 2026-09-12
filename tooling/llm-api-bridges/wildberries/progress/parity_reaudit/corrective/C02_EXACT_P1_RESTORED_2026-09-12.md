# C02 — фактическое восстановление P1 без повторной разработки

Дата: 2026-09-12. Работа продолжается сразу после сохранения этого блока.

Проверены 1216 файлов существующего artifact 10295908178 по SNAPSHOT_MANIFEST.json: размеры и SHA-256 совпали, расхождений 0. Это проверка целостности, не утверждение о прочтении всех MD.

WB021 ZIP проверен: ceeadd4d4302de5fe8989f27fe0be1f0363665e49ef19b56d8e4075e8a956a23. В отдельную копию последовательно применены INITIAL_ERRORS.patch, P1_SURFACE.patch, затем capsule_restore.py с SOURCE.json и runtime.patch. Капсулы evidence_parts, p1_surface, p1_popup_work декодированы целиком, их SHA-256 совпали с ранее опубликованными checkpoint. Fuzzy patching не применялся. Исходный baseline сохранён.

Полученные runtime SHA-256:
- popup.html e1f638d5fb09c62b78250bb7ba100548e80edf51b804e782bcb4aaccc4fa5867
- popup.css 0ed99ad9d50ce8339f9bbe081906884557ac8bf4be6bbef389546ab9beea1872
- popup.js 937733bda7ef6e75b5e90fa25f34cce218dc3cb07eb9b731f469874f29bee3a9
- service_worker.js f93ffd9250f49e8146091e7c8a6e6d2b119485c21f5bbcd7ad4bb3012f44c46c
- shared/runtime_worker.js 220f1a08a9c6e33f9153b20a67fc1f21dee41a4c3b9d395b63d6559417fc69fb
- content_script.js f83056a6ff604a3315822c7d0da69df0b15f5bf34ab0f5060e1ecd5236e9759b

Локально создан Git baseline и commit восстановленного WIP в /mnt/data/wb_continuation_20260912/candidate; отдельная неизменённая копия restored_P1. Новый код ещё не внесён, прежние 269 проверки заново не прогонялись.

Прочитаны P1 checkpoints, P4_START_ENTRY_CHECKPOINT и P4_P7_CONTINUATION. Изучен применимый OZON_PATCH_DELIVERY_GATE: GATE-01..35 и граница LIVE-GATE, запрещено выдавать isolated PASS за интегрированный или установленный PASS. Superseding authority прочитана по разделам P1–P9 и требованиям differential QA. Обрезанные части дополнительно перечитаны.

Late Ozon buildinfo указывает на artifact OZON_BRIDGE_v0.1.19_GLOBAL_IDLE_WORK_RESTART_20260912.zip, SHA-256 78ff3b6681759a308e8aac1debfb8832fa04cc28599859a0979341cce3e4e2ac, 259583 байта, workflow run 34665593546, executable 1b3f0961ff9399430c9e5b3b70a4188f1282429d. Далее скачивается этот существующий artifact, читаются реальные Start helpers/handlers, исправляется P4/P7. Новых owner-тестов и marketplace-запросов нет.
