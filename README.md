# Marketplace Question Operator C1

Standalone SQLite-backed Telegram-first moderation core. No live polling, Telegram polling, marketplace writes, or Codex generation are started in C1. The operator must explicitly choose Send before an adapter may send an exact reviewed revision.

Run `python -m app.cli init-db`, `doctor --offline`, or `selftest` using `.venv/bin/python`.
