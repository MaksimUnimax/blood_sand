import pytest
from types import SimpleNamespace

from app.config import Config
from app.daemon import TelegramTransport, live_config, PollingConflictExit, POLLING_CONFLICT_EXIT_CODE
from app.db.database import connect, init
from app.db.repository import Repository


def test_missing_config_redacts_values():
    with pytest.raises(RuntimeError) as e:
        live_config({'TELEGRAM_BOT_TOKEN': 'secret'})
    assert 'secret' not in str(e.value)
    assert 'TELEGRAM_OPERATOR_USER_ID' in str(e.value)
    assert 'OZON_API_KEY' not in str(e.value)
    assert 'WB_API_TOKEN' not in str(e.value)


def test_live_config_manual_ozon_requires_only_telegram_without_repr_leak():
    values = {
        'TELEGRAM_BOT_TOKEN': 'value-token',
        'TELEGRAM_OPERATOR_USER_ID': 'value-user',
        'OZON_API_KEY': 'unused-ozon',
        'WB_API_TOKEN': 'unused-wb',
    }
    assert live_config(values) == {
        'TELEGRAM_BOT_TOKEN': 'value-token',
        'TELEGRAM_OPERATOR_USER_ID': 'value-user',
    }
    assert 'value-' not in repr(Config())
    assert str(Config().reference_dir).endswith('/opt/marketplace-question-operator/references')


def test_polling_conflict_has_dedicated_non_restart_exit_contract():
    assert PollingConflictExit().code == POLLING_CONFLICT_EXIT_CODE == 75
    unit = open('deploy/marketplace-question-operator.service').read()
    assert 'Restart=on-failure' in unit and 'RestartPreventExitStatus=75' in unit


@pytest.mark.asyncio
async def test_question_transport_rejects_non_positive_message_id():
    class Repo:
        async def active_codex_profile(self):
            return 'codex1'

    class Bot:
        async def send_message(self, **kwargs):
            return SimpleNamespace(message_id=0)

    app = SimpleNamespace(bot=Bot())
    q = {'id': 1, 'public_id': 'Q-000001', 'marketplace': 'ozon', 'question_text': 'x'}
    transport = TelegramTransport(app, 1, Repo())
    with pytest.raises(RuntimeError, match='positive message_id'):
        await transport.question(q)


@pytest.mark.asyncio
async def test_question_transport_renders_persisted_sqlite_row(tmp_path):
    db = await connect(tmp_path / 'state.sqlite3')
    await init(db)
    repo = Repository(db)
    q, _ = await repo.insert_question({'marketplace': 'ozon', 'external_question_id': 'x', 'question_text': 'x'})

    class Bot:
        async def send_message(self, **kwargs):
            return SimpleNamespace(message_id=1)

    assert await TelegramTransport(SimpleNamespace(bot=Bot()), 1, repo).question(q) == 1
    await db.close()
