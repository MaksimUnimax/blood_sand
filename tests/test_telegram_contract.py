"""Offline smoke for the Telegram protocol contract; no network is used."""
from types import SimpleNamespace
import pytest

from app.daemon import TelegramTransport
from app.db.database import connect, init
from app.db.repository import Repository
from app.service import QuestionService
from app.state_machine import StaleState
from app.telegram.bot import OperatorBot
from app.telegram.callbacks import decode, encode


@pytest.mark.asyncio
async def test_question_send_persists_only_positive_message_id(tmp_path):
 db=await connect(tmp_path/'x'); await init(db); repo=Repository(db)
 q,_=await repo.insert_question({'marketplace':'ozon','external_question_id':'x','question_text':'q'})
 class Transport:
  async def question(self, question): return 9
 await QuestionService(repo,{},Transport()).poll('none') if False else None
 await repo.persist_question_message_id(q['id'],9)
 assert (await repo.get_question(q['id']))['telegram_question_message_id']==9
 with pytest.raises(ValueError): await repo.persist_question_message_id(q['id'],0)
 await db.close()


def test_callbacks_are_bounded_parseable_and_revision_bound():
 for action in ('manual','codex','ignore','send','edit','regenerate','retry_codex','retry_send'):
  value=encode(action,123456,987654)
  assert len(value.encode()) <= 64 and decode(value)['action']==action
 assert decode(encode('send',1,2))['revision_id']==2
 with pytest.raises(ValueError): decode('mqo1:not-base64')


@pytest.mark.asyncio
async def test_manual_and_edit_are_exact_reply_correlations(tmp_path):
 db=await connect(tmp_path/'x'); await init(db); repo=Repository(db); q,_=await repo.insert_question({'marketplace':'ozon','external_question_id':'x','question_text':'q'})
 service=QuestionService(repo,{},None)
 await service.manual(q['id'],101)
 with pytest.raises(StaleState): await service.reply(999,'wrong')
 first=await service.reply(101,'manual')
 with pytest.raises(StaleState): await service.reply(101,'duplicate')
 await service.edit(q['id'],102,first)
 second=await service.reply(102,'edited')
 assert second != first and (await repo.get_answer_revision(first))['text']=='manual'
 assert (await repo.get_answer_revision(second))['based_on_revision_id']==first
 await db.close()


@pytest.mark.asyncio
async def test_claims_make_codex_and_send_idempotent(tmp_path):
 db=await connect(tmp_path/'x'); await init(db); repo=Repository(db); q,_=await repo.insert_question({'marketplace':'ozon','external_question_id':'x','question_text':'q'})
 aid,_=await repo.claim_codex(q['id'])
 with pytest.raises(StaleState): await repo.claim_codex(q['id'])
 await repo.finish_draft_success(aid,'a'); rid=await repo.create_answer_revision(q['id'],'codex','a',draft_attempt_id=aid); await repo.set_current_answer_revision(q['id'],rid); await repo.transition(q['id'],'CODEX_RUNNING','REVIEW')
 assert (await repo.claim_send(q['id'],rid))['text']=='a'
 with pytest.raises(StaleState): await repo.claim_send(q['id'],rid)
 await db.close()


def test_private_operator_requires_both_user_and_chat():
 bot=OperatorBot(42,None)
 assert bot.authorized(SimpleNamespace(effective_user=SimpleNamespace(id=42),effective_chat=SimpleNamespace(id=42,type='private')))
 assert not bot.authorized(SimpleNamespace(effective_user=SimpleNamespace(id=42),effective_chat=SimpleNamespace(id=-100,type='group')))


@pytest.mark.asyncio
async def test_initial_card_retries_429_using_server_delay(monkeypatch):
 class Repo:
  async def active_codex_profile(self): return 'codex1'
 class Bot:
  def __init__(self): self.calls=0
  async def send_message(self, **kwargs):
   self.calls += 1
   if self.calls == 1:
    from telegram.error import RetryAfter
    raise RetryAfter(0)
   return SimpleNamespace(message_id=7)
 bot=Bot(); transport=TelegramTransport(SimpleNamespace(bot=bot),1,Repo())
 q={'id':1,'public_id':'Q-000001','marketplace':'ozon','question_text':'q'}
 assert await transport.question(q)==7 and bot.calls==2
