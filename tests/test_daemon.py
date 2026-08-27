import pytest
from types import SimpleNamespace
from app.config import Config
from app.daemon import TelegramTransport, live_config
from app.db.database import connect, init
from app.db.repository import Repository
def test_missing_config_redacts_values():
 with pytest.raises(RuntimeError) as e: live_config({'TELEGRAM_BOT_TOKEN':'secret'})
 assert 'secret' not in str(e.value) and 'WB_API_TOKEN' in str(e.value)

def test_live_config_accepts_complete_values_without_repr_leak():
 values={key:'value-'+key for key in ('TELEGRAM_BOT_TOKEN','TELEGRAM_OPERATOR_USER_ID','WB_API_TOKEN','OZON_CLIENT_ID','OZON_API_KEY')}
 assert live_config(values)==values and 'value-' not in repr(Config())

@pytest.mark.asyncio
async def test_question_transport_persists_first_message_id_even_when_falsey():
 class Repo:
  async def active_codex_profile(self): return 'codex1'
 class Bot:
  async def send_message(self, **kwargs): return SimpleNamespace(message_id=0)
 app=SimpleNamespace(bot=Bot())
 q={'id':1,'public_id':'Q-000001','marketplace':'ozon','question_text':'x'}
 transport=TelegramTransport(app, 1, Repo())
 assert await transport.question(q)==0
 assert transport.last_question_send == {'executed': True, 'response_type': 'SimpleNamespace', 'message_id': 0}

@pytest.mark.asyncio
async def test_question_transport_renders_persisted_sqlite_row(tmp_path):
 db=await connect(tmp_path/'state.sqlite3'); await init(db); repo=Repository(db)
 q,_=await repo.insert_question({'marketplace':'ozon','external_question_id':'x','question_text':'x'})
 class Bot:
  async def send_message(self, **kwargs): return SimpleNamespace(message_id=1)
 assert await TelegramTransport(SimpleNamespace(bot=Bot()), 1, repo).question(q)==1
 await db.close()
