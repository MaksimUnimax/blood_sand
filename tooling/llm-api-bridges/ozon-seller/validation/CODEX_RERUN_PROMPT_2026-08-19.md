# Codex rerun prompt — Ozon Bridge v0.1.19

Use this prompt verbatim for the next Codex validation run.

```text
@GitHub

Репозиторий:
MaksimUnimax/blood_sand

Ветка:
dev/ozon-v0.1.19-manual-delivery-composer-wait-2026-08-18

Validation authority commit before this prompt file:
5049fe6d579b41f94069d7f2d2a8d3f5d1198c62

Production candidate authority remains:
9c224401c4b12bdbdb46ce57504c8009b1994f67

Сначала полностью прочитай:

tooling/llm-api-bridges/ozon-seller/validation/CODEX_PRE_OPERATOR_TEST_CHECKLIST_2026-08-19.md

Затем полностью прочитай:

tooling/llm-api-bridges/ozon-seller/validation/READY_TESTS_CURRENT_RUNBOOK_2026-08-19.md

ВАЖНО:

1. Это повторная проверка exact current candidate Ozon Bridge v0.1.19 после предыдущего результата OZON_PRE_OPERATOR_TESTS_REJECTED.

2. Production-код не менять.

3. Не создавать, не изменять, не адаптировать и не чинить никакие test/validator/runner/harness/fixture/helper файлы.

4. Не создавать новую тестовую инфраструктуру и новые RERUN-планы.

5. Использовать только уже готовые файлы из:

tooling/llm-api-bridges/ozon-seller/validation/ready-tests/

6. Перед запуском каждого ready-test проверить, что его файл byte-identical текущему GitHub blob, указанному в READY_TESTS_CURRENT_RUNBOOK_2026-08-19.md.

7. B01 выполнить заново по основному checklist.

8. После успешного B01 использовать один exact reconstructed candidate directory как <CANDIDATE> для всех ready-tests.

9. Запустить без изменений все восемь готовых файлов, перечисленных в READY_TESTS_CURRENT_RUNBOOK_2026-08-19.md:

- B02_B03_CONTRACT_CURRENT.mjs
- B04_CAPABILITY_CURRENT.mjs
- B05_B07_B08_ANALYTICS_CURRENT.mjs
- B06_WORKER_QUOTA_CURRENT.mjs
- B09_COMMON_BATCH_CURRENT.mjs
- B10_B13_B15_BROWSER_CURRENT.mjs
- B11_B12_COMPOSER_WAIT_CURRENT.mjs
- B14_PERFORMANCE_CURRENT.mjs

10. Для browser ready-test использовать только уже существующую квалифицированную Windows QA среду:
- Node v24.12.0
- Puppeteer 25.4.0
- CFT 151.0.7922.47
- fresh disposable profile
- real Seller/Performance/ChatGPT network blocked/intercepted.

11. Реальные Seller/Performance credentials не использовать.

12. Реальные запросы к Ozon, Performance и ChatGPT в synthetic browser checks запрещены.

13. Не останавливайся после первого FAIL или BLOCKED. Выполни все независимые проверки.

14. Для B01–B15 итоговый статус только:
PASS
FAIL
BLOCKED

15. FAIL ставить только если наблюдается ошибка production behavior на exact current candidate.

16. Если готовый test-файл или уже существующая QA-среда физически не запускаются без правок, ничего не исправлять. Зафиксировать точную причину как BLOCKED и продолжить остальные независимые проверки.

17. Для каждого FAIL/BLOCKED указать:
- какой exact ready-test/действие выполнялось;
- фактическую команду;
- фактическую ошибку/наблюдение;
- почему это FAIL production или BLOCKED environment.

18. Итоговый report создать в:

tooling/llm-api-bridges/ozon-seller/validation/reports/

19. Разрешено изменить в GitHub только итоговый report-файл.
Production modifications by Codex = 0.
Test-file modifications by Codex = 0.

20. В отчёте обязательно указать:
- tested branch;
- tested HEAD commit;
- production candidate authority commit;
- checklist blob/commit;
- ready-tests runbook blob/commit;
- exact candidate hashes;
- список всех 8 ready-test файлов и их фактические SHA/blob;
- фактические команды запуска;
- результаты B01–B15;
- PASS/FAIL/BLOCKED отдельно;
- REAL_OZON_REQUESTS;
- REAL_PERFORMANCE_REQUESTS;
- REAL_CHATGPT_REQUESTS;
- production modifications by Codex;
- test-file modifications by Codex.

21. ZIP не собирать.

22. Если B01–B15 все PASS, terminal marker:

OZON_PRE_OPERATOR_TESTS_PASS

Если хотя бы один FAIL или BLOCKED — marker PASS не ставить.

23. После публикации итогового отчёта STOP.
Ничего не исправлять.
ZIP не собирать.
```
