import pytest
from types import SimpleNamespace

from app.config import Config
from app.daemon import (
    TelegramTransport,
    configure_operator_menu,
    live_config,
    PollingConflictExit,
    POLLING_CONFLICT_EXIT_CODE,
    make_marketplace_adapters,
)
from app.marketplaces.wildberries import classify_token
from tests.test_wildberries_adapter import jwt
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
        'WB_API_ENABLED': False,
    }
    assert 'value-' not in repr(Config())
    assert str(Config().reference_dir).endswith('/opt/marketplace-question-operator/references')


def test_wb_enabled_requires_redacted_eligible_token_before_client_creation():
    env = {'TELEGRAM_BOT_TOKEN': 'telegram-secret', 'TELEGRAM_OPERATOR_USER_ID': '1', 'WB_API_ENABLED': '1'}
    with pytest.raises(RuntimeError) as exc:
        live_config(env)
    assert 'telegram-secret' not in str(exc.value)
    env['WB_API_TOKEN'] = 'bad.token.value'
    with pytest.raises(RuntimeError) as exc:
        live_config(env)
    assert env['WB_API_TOKEN'] not in str(exc.value)


def test_wb_disabled_constructs_no_client_and_eligible_token_registers_adapter():
    disabled = live_config({'TELEGRAM_BOT_TOKEN': 't', 'TELEGRAM_OPERATOR_USER_ID': '1', 'WB_API_ENABLED': '0'})
    assert make_marketplace_adapters(disabled, lambda: (_ for _ in ()).throw(AssertionError())) == ({}, None)
    token = jwt({'acc': 3, 'for': 'self', 't': False, 'exp': 4000000000, 's': 1 << 7})
    enabled = live_config({'TELEGRAM_BOT_TOKEN': 't', 'TELEGRAM_OPERATOR_USER_ID': '1', 'WB_API_ENABLED': '1', 'WB_API_TOKEN': token})
    adapters, client = make_marketplace_adapters(enabled, lambda: object())
    assert set(adapters) == {'wildberries'} and client is not None


def test_polling_conflict_has_dedicated_non_restart_exit_contract():
    assert PollingConflictExit().code == POLLING_CONFLICT_EXIT_CODE == 75
    unit = open('deploy/marketplace-question-operator.service').read()
    assert 'Restart=on-failure' in unit and 'RestartPreventExitStatus=75' in unit


@pytest.mark.asyncio
async def test_operator_menu_registers_only_primary_question_action_for_operator_chat():
    calls = []

    class Bot:
        async def set_my_commands(self, commands, scope=None):
            calls.append(('commands', commands, scope))
            return True

        async def set_chat_menu_button(self, chat_id=None, menu_button=None):
            calls.append(('menu', chat_id, menu_button))
            return True

    await configure_operator_menu(Bot(), '286579139')
    assert len(calls) == 2
    commands = calls[0][1]
    scope = calls[0][2]
    assert [(x.command, x.description) for x in commands] == [
        ('ozon', '➕ Отправить вопрос'), ('questions', '🔎 Проверить вопросы')
    ]
    assert scope.chat_id == 286579139
    assert calls[1][1] == 286579139
    assert type(calls[1][2]).__name__ == 'MenuButtonCommands'


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
