# P4/P7 — точные сохранённые входы восстановлены

Дата: 2026-09-12. Это восстановление входов, НЕ новый PASS продукта.

Прямой git-доступ из текущего container не работает: Could not resolve host github.com. Вместо ручного перепечатывания десятков Base64-частей опубликован узкий read-only recovery workflow `.github/workflows/wb-p4-p7-recovery-snapshot-20260912.yml` (commit 8772518395beb9ccfce11345a3ad39a17107703c). Он копирует уже сохранённые байты, не изменяет runtime и не исполняет marketplace-команды. Permissions: contents read; checkout persist-credentials false.

Workflow run 34687226585 завершился success. Artifact 10295908178 `wb-p4-p7-recovery-snapshot`, 3766992 байта, SHA-256 `841b14f9b1ce9ee916e5f7de59713d6f95d84029715a57e45546f9f0880ecde6`, получен через GitHub connector и действительно находится в mounted runtime.

Snapshot WB ref: cac314e4e2deeec38dd1d4806dbb7fddf03ab9e6. Ozon reference ref: 97f1abc0ecaa04c6e24d0c32f8525b126b05d0e1. Этот ref — вход для чтения late repair/validation цепочки, а не объявление всех его изменений live-accepted.

Локально проверены размеры и SHA-256 всех 1216 файлов snapshot по manifest. Три существующие капсулы декодированы без изменения и проверены:
- initial errors: 12190 байт, b3cfb84b58b78cba8522cf86da4373fb81895a6a3fdb960d70922a4d007a9a60;
- owned surface: 14079 байт, 6a1356c68078f6f7270ebc3cb45431659453808e208c6964fbd2552ce2d13935;
- popup Work: 34388 байта, 92eebb3eab5c35fb1eb7cee98dd4ebeebd7fdb8dbfd7e0dfc49479fc4353b6bc.

Точный исходный mounted WB021 ZIP также проверен: 128734 байта, ceeadd4d4302de5fe8989f27fe0be1f0363665e49ef19b56d8e4075e8a956a23.

Полностью прочитаны superseding parity authority и P4_START_ENTRY_CHECKPOINT.md. GitHub-ответ DEVELOPMENT_WORKFLOW был обрезан; полное чтение будет выполнено из проверенного snapshot вместе с OZON_PATCH_DELIVERY_GATE.md. Хеш-проверка/копирование файлов не считаются прочтением их содержания.

Следующее действие: проверить capsule_restore.py, восстановить exact current WB WIP по трём слоям и сверить шесть target SHA из cursor; затем прочитать actual late Ozon Work Start model/handlers и применимые patch rules. Не создавать капсулы P1 заново, не повторять её реализацию.

Runtime-изменений в этом блоке: 0; новых продуктовых тестов: 0; WB/Ozon provider calls: 0. Recovery artifacts не являются установочной сборкой.
