# Marketplace Question Operator C1

Standalone SQLite-backed Telegram-first moderation core. No live polling, Telegram polling, marketplace writes, or Codex generation are started in C1. The operator must explicitly choose Send before an adapter may send an exact reviewed revision.

Run `python -m app.cli init-db`, `doctor --offline`, or `selftest` using `.venv/bin/python`.
# Marketplace Question Operator

The daemon is deliberately Telegram-first: it only sends marketplace answers after
an authenticated operator uses a revision-bound Telegram Send control.

## Controlled deployment (not performed by tests)

`deploy/install-runtime.sh` installs the unit and creates the state/job directories;
it does not enable or start the service. `deploy/install-secrets.sh` interactively
creates `/etc/marketplace-question-operator/secrets.env` with mode `0600`; never put
that file in this repository. Once secrets have been installed, the controlled live
bring-up may manually enable `marketplace-question-operator.service`.

The committed `deploy/secrets.env.example` contains names only. Required variables
are `TELEGRAM_BOT_TOKEN`, `TELEGRAM_OPERATOR_USER_ID`, `WB_API_TOKEN`,
`OZON_CLIENT_ID`, and `OZON_API_KEY`.
