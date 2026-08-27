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
from app.telegram.durable_queue import DurableUpdateQueue


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


@pytest.mark.asyncio
async def test_update_is_durably_receipted_before_queue_put_and_replayed_once(tmp_path):
 db=await connect(tmp_path/'x'); await init(db); repo=Repository(db); queue=DurableUpdateQueue(repo)
 update=SimpleNamespace(update_id=991,to_json=lambda: '{"update_id":991}')
 await queue.put(update)
 assert [r['update_id'] for r in await repo.pending_telegram_updates()] == [991]
 assert await queue.get() is update
 await repo.complete_telegram_update(991)
 assert await repo.pending_telegram_updates() == []
 await db.close()


@pytest.mark.asyncio
async def test_reply_consumption_revision_and_state_are_one_transaction(tmp_path):
 db=await connect(tmp_path/'x'); await init(db); repo=Repository(db)
 q,_=await repo.insert_question({'marketplace':'ozon','external_question_id':'atomic','question_text':'q'})
 await repo.transition(q['id'],'NEW','MANUAL_INPUT'); await repo.create_telegram_input(77,q['id'],'manual_answer')
 rid=await repo.consume_reply(77,'answer')
 assert (await repo.get_question(q['id']))['status']=='REVIEW'
 assert (await repo.get_answer_revision(rid))['text']=='answer'
 with pytest.raises(StaleState): await repo.consume_reply(77,'duplicate')
 await db.close()


@pytest.mark.asyncio
async def test_durable_restart_scenarios_and_receipt_failure_are_fail_closed(tmp_path):
 """T3 isolated proof using the real repository and durable queue classes."""
 db=await connect(tmp_path/'x'); await init(db); repo=Repository(db); queue=DurableUpdateQueue(repo)
 update=SimpleNamespace(update_id=1001,to_json=lambda: '{"update_id":1001}')
 # A: crash after durable handoff, before dispatch; fresh queue replays once.
 await queue.put(update)
 fresh=DurableUpdateQueue(repo)
 for row in await repo.pending_telegram_updates(): await fresh.replay_put(SimpleNamespace(update_id=row['update_id']))
 replay=await fresh.get(); assert replay.update_id==1001
 await repo.complete_telegram_update(1001); assert await repo.pending_telegram_updates()==[]
 # B/C: mutation occurred before completion; replay's idempotency guard rejects it.
 q,_=await repo.insert_question({'marketplace':'ozon','external_question_id':'restart','question_text':'q'})
 await repo.transition(q['id'],'NEW','MANUAL_INPUT'); await repo.create_telegram_input(7,q['id'],'manual_answer')
 await queue.put(SimpleNamespace(update_id=1002,to_json=lambda: '{"update_id":1002}'))
 rid=await repo.consume_reply(7,'answer')
 with pytest.raises(StaleState): await repo.consume_reply(7,'answer')
 assert (await repo.get_answer_revision(rid))['text']=='answer'
 await repo.complete_telegram_update(1002)
 # Duplicate delivery has one durable identity.
 duplicate=SimpleNamespace(update_id=1003,to_json=lambda: '{"update_id":1003}')
 await queue.put(duplicate); await queue.put(duplicate)
 assert len([r for r in await repo.pending_telegram_updates() if r['update_id']==1003])==1
 class BrokenRepo:
  async def receipt_telegram_update(self,*args): raise RuntimeError('sqlite commit failed')
 failing=DurableUpdateQueue(BrokenRepo())
 with pytest.raises(RuntimeError,match='sqlite commit failed'): await failing.put(duplicate)
 assert failing.empty()
 await db.close()


@pytest.mark.asyncio
async def test_terminal_message_handler_completes_non_actionable_receipt(tmp_path):
 db=await connect(tmp_path/'x'); await init(db); repo=Repository(db)
 bot=OperatorBot(1,SimpleNamespace(repo=repo))
 await repo.receipt_telegram_update(1004,'{"update_id":1004}')
 await bot._tracked(bot.ignored_message,SimpleNamespace(update_id=1004),None)
 assert await repo.pending_telegram_updates()==[]
 await db.close()
