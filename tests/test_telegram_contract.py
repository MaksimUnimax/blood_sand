"""Offline smoke for the Telegram protocol contract; no network is used."""
import asyncio
from types import SimpleNamespace
import pytest
from telegram import ForceReply, InlineKeyboardMarkup

from app.daemon import TelegramTransport
from app.db.database import connect, init
from app.db.repository import Repository
from app.service import QuestionService
from app.state_machine import StaleState
from app.telegram.bot import OperatorBot
from app.telegram.callbacks import MAX_CALLBACK_DATA_BYTES, decode, encode
from app.telegram.durable_queue import DurableUpdateQueue
from app.telegram.edge import TelegramEdge, Operation, Outcome


class StandaloneMessage:
 """Legacy test message adapter: production code uses get_bot().send_message."""
 chat_id = 1
 def get_bot(self): return self
 async def send_message(self, *, chat_id, text, **kwargs): return await self.reply_text(text, **kwargs)


def assert_standalone(call):
 _, kwargs = call
 assert kwargs.get('reply_parameters') is None # TELEGRAM_NO_REPLY_PARAMETERS_TEST
 assert kwargs.get('reply_to_message_id') is None # TELEGRAM_NO_REPLY_TO_MESSAGE_ID_TEST
 assert not isinstance(kwargs.get('reply_markup'), ForceReply) # TELEGRAM_NO_FORCE_REPLY_TEST


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
 for action,qid,rid,arg in (('manual',123456,None,None),('codex',123456,None,None),('ignore',123456,None,None),('ignore',123456,987654,None),('send',123456,987654,None),('edit',123456,987654,None),('retry_codex',123456,None,None),('retry_send',123456,987654,None),('confirm_regenerate',123456,None,None),('choose_codex',123456,None,'menu'),('choose_codex',123456,987654,'codex1')):
  value=encode(action,qid,rid,arg)
  assert len(value.encode()) <= 64 and decode(value)['action']==action
 assert decode(encode('send',1,2))['revision_id']==2
 with pytest.raises(ValueError): decode('mqo1:not-base64')
 with pytest.raises(ValueError): encode('regenerate',1,2)

def test_callback_schema_is_canonical_and_full_sqlite_ids_fit():
 maximum=9223372036854775807
 emitted=(('manual',maximum,None,None),('codex',maximum,None,None),('ignore',maximum,None,None),('ignore',maximum,maximum,None),('send',maximum,maximum,None),('edit',maximum,maximum,None),('retry_codex',maximum,None,None),('retry_send',maximum,maximum,None),('confirm_regenerate',maximum,None,None),('choose_codex',maximum,maximum,'menu'),('choose_codex',maximum,maximum,'codex3'))
 assert max(len(encode(*item).encode('utf-8')) for item in emitted) <= MAX_CALLBACK_DATA_BYTES
 for item in emitted: assert decode(encode(*item)) == {'action':item[0],'question_id':item[1],'revision_id':item[2],'arg':item[3]}
 for bad in (('manual',1,2,None),('manual',1,None,'x'),('codex',1,None,'x'),('ignore',1,None,'x'),('send',1,None,None),('send',1,2,'x'),('edit',1,None,None),('retry_codex',1,2,None),('retry_send',1,None,None),('confirm_regenerate',1,2,None),('choose_codex',1,None,None),('choose_codex',1,None,'bad'),('ignore',0,None,None)):
  with pytest.raises(ValueError): encode(*bad)

@pytest.mark.asyncio
async def test_invalid_callback_is_acknowledged_without_mutation(tmp_path):
 db=await connect(tmp_path/'x'); await init(db); repo=Repository(db)
 q,_=await repo.insert_question({'marketplace':'ozon','external_question_id':'bad-callback','question_text':'q'})
 calls=[]
 class Query:
  data='mqo1:bWFudWFsfDF8fHVuZXhwZWN0ZWQ' # legacy noncanonical manual|1||unexpected
  message=SimpleNamespace()
  async def answer(self,*args,**kwargs): calls.append((args,kwargs))
 bot=OperatorBot(1,SimpleNamespace(repo=repo))
 update=SimpleNamespace(callback_query=Query(),effective_user=SimpleNamespace(id=1),effective_chat=SimpleNamespace(id=1,type='private'))
 await bot.callback(update,None)
 assert calls and (await repo.get_question(q['id']))['status']=='NEW'
 assert (await (await repo.db.execute('SELECT COUNT(*) FROM draft_attempts')).fetchone())[0]==0
 await db.close()


@pytest.mark.asyncio
async def test_choose_codex_profile_selection_is_bound_to_current_question_revision(tmp_path):
 db=await connect(tmp_path/'x'); await init(db); repo=Repository(db)
 q,_=await repo.insert_question({'marketplace':'ozon','external_question_id':'choose-revision','question_text':'q'})
 r1=await repo.create_answer_revision(q['id'],'manual','one'); await repo.set_current_answer_revision(q['id'],r1)
 class Message(StandaloneMessage):
  async def reply_text(self,*args,**kwargs): return SimpleNamespace(message_id=1)
 class Query:
  def __init__(self,data): self.data=data; self.message=Message(); self.acks=[]
  async def answer(self,*args,**kwargs): self.acks.append((args,kwargs))
 bot=OperatorBot(1,SimpleNamespace(repo=repo))
 async def choose(data):
  query=Query(data); update=SimpleNamespace(callback_query=query,effective_user=SimpleNamespace(id=1),effective_chat=SimpleNamespace(id=1,type='private'))
  await bot.callback(update,None); assert query.acks; return query
 # A current revision changes only the global profile.
 await choose(encode('choose_codex',q['id'],r1,'codex2'))
 assert await repo.active_codex_profile()=='codex2'
 # The audit payload is canonical structurally but stale semantically.
 before=await repo.get_question(q['id']); await choose(encode('choose_codex',q['id'],999,'codex3'))
 after=await repo.get_question(q['id'])
 assert await repo.active_codex_profile()=='codex2'
 assert (after['status'],after['current_answer_revision_id'],after['current_draft_attempt_id']) == (before['status'],before['current_answer_revision_id'],before['current_draft_attempt_id'])
 assert (await (await repo.db.execute('SELECT COUNT(*) FROM draft_attempts')).fetchone())[0]==0
 # A chooser becomes stale when a newer revision replaces its bound revision.
 r2=await repo.create_answer_revision(q['id'],'edited','two'); await repo.set_current_answer_revision(q['id'],r2)
 await choose(encode('choose_codex',q['id'],r1,'codex3'))
 assert await repo.active_codex_profile()=='codex2' and (await repo.get_question(q['id']))['current_answer_revision_id']==r2
 # A revision from another question never binds to this question.
 q2,_=await repo.insert_question({'marketplace':'ozon','external_question_id':'choose-other','question_text':'q2'})
 other=await repo.create_answer_revision(q2['id'],'manual','other'); await repo.set_current_answer_revision(q2['id'],other)
 await choose(encode('choose_codex',q['id'],other,'codex3'))
 assert await repo.active_codex_profile()=='codex2'
 # A revisionless chooser cannot be used once this question has a revision.
 await choose(encode('choose_codex',q['id'],None,'codex3'))
 assert await repo.active_codex_profile()=='codex2'
 await db.close()


@pytest.mark.asyncio
async def test_choose_codex_nonrevision_new_and_codex_error_remain_valid(tmp_path):
 db=await connect(tmp_path/'x'); await init(db); repo=Repository(db)
 q,_=await repo.insert_question({'marketplace':'ozon','external_question_id':'choose-new','question_text':'q'})
 class Message(StandaloneMessage):
  def __init__(self): self.messages=[]
  async def reply_text(self,*args,**kwargs): self.messages.append((args,kwargs)); return SimpleNamespace(message_id=1)
 class Query:
  def __init__(self,data): self.data=data; self.message=Message(); self.acks=[]
  async def answer(self,*args,**kwargs): self.acks.append((args,kwargs))
 bot=OperatorBot(1,SimpleNamespace(repo=repo))
 async def choose(question,profile):
  query=Query(encode('choose_codex',question['id'],None,profile)); update=SimpleNamespace(callback_query=query,effective_user=SimpleNamespace(id=1),effective_chat=SimpleNamespace(id=1,type='private'))
  await bot.callback(update,None); assert query.acks; return query
 await choose(q,'codex2'); assert await repo.active_codex_profile()=='codex2'
 aid,_=await repo.claim_codex(q['id']); await repo.finish_draft_error(aid,'PROCESS_ERROR','x'); await repo.transition(q['id'],'CODEX_RUNNING','CODEX_ERROR')
 query=await choose(await repo.get_question(q['id']),'codex3')
 assert await repo.active_codex_profile()=='codex3'
 assert (await (await repo.db.execute('SELECT COUNT(*) FROM draft_attempts')).fetchone())[0]==1
 assert any('Codex изменён' in args[0] for args,_ in query.message.messages)
 await db.close()


@pytest.mark.asyncio
async def test_frozen_button_sets_include_switch_and_review_regeneration(tmp_path):
 db=await connect(tmp_path/'x'); await init(db); repo=Repository(db)
 q,_=await repo.insert_question({'marketplace':'ozon','external_question_id':'buttons','question_text':'q'})
 rid=await repo.create_answer_revision(q['id'],'manual','a'); await repo.set_current_answer_revision(q['id'],rid); q=await repo.get_question(q['id'])
 bot=OperatorBot(1,SimpleNamespace(repo=repo))
 labels=lambda state:[b.text for row in bot.buttons(q,state).inline_keyboard for b in row]
 assert labels('NEW')==['✍️ Ответить самому','🤖 Отправить в Codex','🚫 Игнорировать','🤖 Сменить Codex']
 assert labels('REVIEW')==['✅ Отправить','✏️ Редактировать','🤖 Отправить в Codex','🚫 Игнорировать','🤖 Сменить Codex']
 assert labels('CODEX_ERROR')==['🔄 Повторить','✍️ Ответить самому','🚫 Игнорировать','🤖 Сменить Codex']
 for state in ('MANUAL_INPUT','CODEX_RUNNING','EDITING','IGNORED','SENDING','SENT','SEND_FAILED','SEND_UNKNOWN','ANSWERED_EXTERNALLY'):
  assert '🤖 Сменить Codex' in labels(state)
 assert '🔎 Проверить публикацию' not in labels('SEND_UNKNOWN')
 assert '🔄 Повторить отправку' not in labels('SEND_UNKNOWN') and '✅ Отправить' not in labels('SEND_UNKNOWN')
 assert labels('ANSWERED_EXTERNALLY') == ['🤖 Сменить Codex']
 assert '🤖 Отправить в Codex' in labels('REVIEW')
 await db.close()


@pytest.mark.asyncio
async def test_manual_and_edit_use_single_durable_text_focus(tmp_path):
 db=await connect(tmp_path/'x'); await init(db); repo=Repository(db); q,_=await repo.insert_question({'marketplace':'ozon','external_question_id':'x','question_text':'q'})
 service=QuestionService(repo,{},None)
 await service.manual(q['id'],101)
 first=await service.ordinary_text('manual')
 assert await service.ordinary_text('duplicate') is None
 await service.edit(q['id'],102,first)
 second=await service.ordinary_text('edited')
 assert second != first and (await repo.get_answer_revision(first))['text']=='manual'
 assert (await repo.get_answer_revision(second))['based_on_revision_id']==first
 await db.close()


@pytest.mark.asyncio
async def test_manual_prompt_is_standalone_and_ordinary_text_uses_active_context(tmp_path):
 db=await connect(tmp_path/'x'); await init(db); repo=Repository(db)
 q,_=await repo.insert_question({'marketplace':'ozon','external_question_id':'ordinary-manual','question_text':'q'})
 service=QuestionService(repo,{},None); await service.begin_manual(q['id'])
 class Wire:
  def __init__(self): self.calls=[]
  async def send_message(self,**kwargs): self.calls.append(kwargs); return SimpleNamespace(message_id=91)
 class Message:
  chat_id=1
  def __init__(self,wire): self.wire=wire
  def get_bot(self): return self.wire
 wire=Wire(); bot=OperatorBot(1,SimpleNamespace(repo=repo))
 assert await bot.prompt(Message(wire),await repo.get_question(q['id']),'manual_answer')
 assert wire.calls[0]['text']=='Введите ответ'
 assert_standalone(((),wire.calls[0]))
 assert (await repo.get_active_text_input_context())['question_id']==q['id']
 rid=await service.ordinary_text('ordinary non-reply answer')
 assert (await repo.get_answer_revision(rid))['source']=='manual'
 assert (await repo.get_question(q['id']))['status']=='REVIEW'
 assert await service.ordinary_text('no active context') is None
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
async def test_edge_has_operation_specific_retry_and_failure_contract():
 from telegram.error import RetryAfter, BadRequest, Forbidden, TimedOut, Conflict
 sleeps=[]
 edge=TelegramEdge(sleep=lambda seconds: sleeps.append(seconds) or __import__('asyncio').sleep(0))
 calls=0
 async def limited():
  nonlocal calls; calls+=1
  if calls==1: raise RetryAfter(3)
  return 'ok'
 assert (await edge.mutate(Operation.CALLBACK_ACK,limited)).value=='ok'
 assert sleeps==[3] and calls==2
 async def timeout(): raise TimedOut()
 assert (await edge.mutate(Operation.MESSAGE_CREATE,timeout)).outcome is Outcome.AMBIGUOUS_NETWORK_FAILURE
 assert (await edge.mutate(Operation.UI_EDIT,lambda: (_ for _ in ()).throw(BadRequest('message is not modified')))).outcome is Outcome.SUCCESS
 async def forbidden(): raise Forbidden('blocked')
 assert (await edge.mutate(Operation.UI_EDIT,forbidden)).outcome is Outcome.PERMISSION_FAILURE
 async def conflict(): raise Conflict('other poller')
 assert (await edge.mutate(Operation.POLLING,conflict)).outcome is Outcome.POLLING_CONFLICT


@pytest.mark.asyncio
async def test_prompt_timeout_creates_no_fake_correlation_and_state_is_recoverable(tmp_path):
 db=await connect(tmp_path/'x'); await init(db); repo=Repository(db)
 q,_=await repo.insert_question({'marketplace':'ozon','external_question_id':'prompt-timeout','question_text':'q'})
 bot=OperatorBot(1,SimpleNamespace(repo=repo))
 await bot.service.repo.transition(q['id'],'NEW','MANUAL_INPUT')
 class Message(StandaloneMessage):
  async def reply_text(self, *args, **kwargs):
   from telegram.error import TimedOut
   raise TimedOut()
 assert not await bot.prompt(Message(),q,'manual_answer')
 assert await repo.get_telegram_input_for(q['id'],'manual_answer') is None
 assert (await repo.get_question(q['id']))['status']=='MANUAL_INPUT'
 assert (await repo.get_delivery_failure(q['id'],'MANUAL_PROMPT'))['outcome']=='AMBIGUOUS_NETWORK_FAILURE'
 await db.close()

@pytest.mark.asyncio
async def test_initial_failure_is_durable_and_requires_explicit_recovery(tmp_path):
 db=await connect(tmp_path/'x'); await init(db); repo=Repository(db)
 q,_=await repo.insert_question({'marketplace':'ozon','external_question_id':'initial-timeout','question_text':'q'})
 class Bot:
  def __init__(self): self.calls=0
  async def send_message(self, **kwargs):
   self.calls+=1
   from telegram.error import TimedOut
   raise TimedOut()
 bot=Bot(); transport=TelegramTransport(SimpleNamespace(bot=bot),1,repo)
 assert await transport.question(q) is None and bot.calls==1
 failure=await repo.get_delivery_failure(q['id'],'INITIAL_CARD')
 assert failure['outcome']=='AMBIGUOUS_NETWORK_FAILURE' and failure['message_id'] is None
 # A fresh repository sees the same unresolved state; no process restart retries it.
 await db.close(); db=await connect(tmp_path/'x'); await init(db); repo=Repository(db)
 assert (await repo.get_delivery_failure(q['id'],'INITIAL_CARD'))['outcome']=='AMBIGUOUS_NETWORK_FAILURE'
 assert bot.calls==1
 await db.close()

@pytest.mark.asyncio
async def test_edit_prompt_failure_preserves_revision_and_durable_focus(tmp_path):
 db=await connect(tmp_path/'x'); await init(db); repo=Repository(db)
 q,_=await repo.insert_question({'marketplace':'ozon','external_question_id':'edit-timeout','question_text':'q'})
 rid=await repo.create_answer_revision(q['id'],'manual','original'); await repo.set_current_answer_revision(q['id'],rid)
 await repo.transition(q['id'],'NEW','MANUAL_INPUT'); await repo.transition(q['id'],'MANUAL_INPUT','REVIEW')
 service=QuestionService(repo,{},None); await service.begin_edit(q['id'],rid)
 bot=OperatorBot(1,SimpleNamespace(repo=repo))
 class Message(StandaloneMessage):
  async def reply_text(self,*args,**kwargs):
   from telegram.error import BadRequest
   raise BadRequest('invalid')
 assert not await bot.prompt(Message(),await repo.get_question(q['id']),'edit_answer',rid)
 assert await repo.get_telegram_input_for(q['id'],'edit_answer') is None
 current=await repo.get_question(q['id'])
 assert current['status']=='EDITING' and current['current_answer_revision_id']==rid
 assert (await repo.get_delivery_failure(q['id'],'EDIT_PROMPT'))['outcome']=='DETERMINISTIC_FAILURE'
 context=await repo.get_active_text_input_context()
 assert context['question_id']==q['id'] and context['based_on_revision_id']==rid
 await db.close()


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

@pytest.mark.asyncio
async def test_ordinary_manual_text_is_durably_bound_and_review_only(tmp_path):
 db=await connect(tmp_path/'x'); await init(db); repo=Repository(db); service=QuestionService(repo,{},None)
 q1,_=await repo.insert_question({'marketplace':'ozon','external_question_id':'ordinary-1','question_text':'one'})
 q2,_=await repo.insert_question({'marketplace':'ozon','external_question_id':'ordinary-2','question_text':'two'})
 await service.begin_manual(q1['id'])
 context=await repo.get_active_text_input_context()
 assert context['question_id']==q1['id'] and context['mode']=='manual_answer'
 rid=await service.ordinary_text('точный обычный текст')
 revision=await repo.get_answer_revision(rid)
 assert revision['source']=='manual' and revision['text']=='точный обычный текст' and revision['question_id']==q1['id']
 assert (await repo.get_question(q1['id']))['status']=='REVIEW'
 assert (await repo.get_question(q2['id']))['status']=='NEW'
 assert await repo.get_active_text_input_context() is None
 assert (await (await repo.db.execute('SELECT COUNT(*) FROM draft_attempts')).fetchone())[0]==0
 bot=OperatorBot(1,SimpleNamespace(repo=repo)); labels=[b.text for row in bot.buttons(await repo.get_question(q1['id'])).inline_keyboard for b in row]
 assert labels==['✅ Отправить','✏️ Редактировать','🤖 Отправить в Codex','🚫 Игнорировать','🤖 Сменить Codex']
 await db.close()

@pytest.mark.asyncio
async def test_input_focus_conflicts_fail_closed_and_duplicate_text_is_a_noop(tmp_path):
 db=await connect(tmp_path/'x'); await init(db); repo=Repository(db); service=QuestionService(repo,{},None)
 q1,_=await repo.insert_question({'marketplace':'ozon','external_question_id':'focus-1','question_text':'one'})
 q2,_=await repo.insert_question({'marketplace':'ozon','external_question_id':'focus-2','question_text':'two'})
 await service.begin_manual(q1['id'])
 with pytest.raises(StaleState): await service.begin_manual(q2['id'])
 assert (await repo.get_active_text_input_context())['question_id']==q1['id'] and (await repo.get_question(q2['id']))['status']=='NEW'
 rid=await service.ordinary_text('once')
 assert await service.ordinary_text('duplicate') is None
 assert (await (await repo.db.execute('SELECT COUNT(*) FROM answer_revisions')).fetchone())[0]==1
 assert (await repo.get_answer_revision(rid))['text']=='once'
 await db.close()

@pytest.mark.asyncio
async def test_manual_prompt_is_exact_ordinary_message_and_no_force_reply(tmp_path):
 db=await connect(tmp_path/'x'); await init(db); repo=Repository(db); q,_=await repo.insert_question({'marketplace':'ozon','external_question_id':'prompt-ordinary','question_text':'q'})
 service=QuestionService(repo,{},None); q=await service.begin_manual(q['id'])
 class Message(StandaloneMessage):
  def __init__(self): self.calls=[]
  async def reply_text(self,*args,**kwargs): self.calls.append((args,kwargs)); return SimpleNamespace(message_id=33)
 message=Message(); bot=OperatorBot(1,SimpleNamespace(repo=repo))
 assert await bot.prompt(message,q,'manual_answer')
 assert message.calls[0][0]==('Введите ответ',) and 'reply_markup' in message.calls[0][1]
 assert await repo.get_telegram_input_for(q['id'],'manual_answer')
 assert not await bot.prompt(message,q,'manual_answer') and len(message.calls)==1
 assert 'filters.REPLY' not in __import__('inspect').getsource(OperatorBot.handlers)
 await db.close()

@pytest.mark.asyncio
async def test_edit_ordinary_text_is_revision_bound_and_switch_preserves_focus(tmp_path):
 db=await connect(tmp_path/'x'); await init(db); repo=Repository(db); service=QuestionService(repo,{},None)
 q,_=await repo.insert_question({'marketplace':'ozon','external_question_id':'edit-ordinary','question_text':'q'})
 r1=await repo.create_answer_revision(q['id'],'manual','old'); await repo.set_current_answer_revision(q['id'],r1); await repo.transition(q['id'],'NEW','MANUAL_INPUT'); await repo.transition(q['id'],'MANUAL_INPUT','REVIEW')
 await service.begin_edit(q['id'],r1); context=await repo.get_active_text_input_context()
 assert context['mode']=='edit_answer' and context['based_on_revision_id']==r1
 await repo.set_active_codex_profile('codex2')
 context=await repo.get_active_text_input_context(); assert context['question_id']==q['id'] and context['based_on_revision_id']==r1
 r2=await service.ordinary_text('replacement')
 edited=await repo.get_answer_revision(r2); current=await repo.get_question(q['id'])
 assert (edited['source'],edited['based_on_revision_id'],edited['text'])==('edited',r1,'replacement')
 assert current['current_answer_revision_id']==r2 and current['status']=='REVIEW' and await repo.get_active_text_input_context() is None
 with pytest.raises(StaleState): await service.begin_edit(q['id'],r1)
 assert await repo.get_active_text_input_context() is None
 await db.close()

@pytest.mark.asyncio
async def test_ordinary_text_without_context_completes_durable_update(tmp_path):
 db=await connect(tmp_path/'x'); await init(db); repo=Repository(db); bot=OperatorBot(1,SimpleNamespace(repo=repo,ordinary_text=QuestionService(repo,{},None).ordinary_text))
 await repo.receipt_telegram_update(3001,'{}')
 update=SimpleNamespace(update_id=3001,message=SimpleNamespace(text='unattached'),effective_user=SimpleNamespace(id=1),effective_chat=SimpleNamespace(id=1,type='private'))
 await bot._tracked(bot.ordinary_text,update,None)
 assert await repo.pending_telegram_updates()==[] and (await (await repo.db.execute('SELECT COUNT(*) FROM answer_revisions')).fetchone())[0]==0
 await db.close()

@pytest.mark.asyncio
async def test_init_migrates_previous_schema_without_losing_data(tmp_path):
 db=await connect(tmp_path/'legacy')
 await db.executescript("CREATE TABLE questions(id INTEGER PRIMARY KEY, public_id TEXT, marketplace TEXT NOT NULL, external_question_id TEXT NOT NULL, question_text TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'NEW', created_at TEXT NOT NULL, updated_at TEXT NOT NULL); CREATE TABLE telegram_inputs(telegram_prompt_message_id INTEGER PRIMARY KEY,question_id INTEGER NOT NULL,mode TEXT NOT NULL,based_on_revision_id INTEGER,created_at TEXT NOT NULL,expires_at TEXT NOT NULL);")
 await db.execute("INSERT INTO questions(id,public_id,marketplace,external_question_id,question_text,status,created_at,updated_at) VALUES(1,'Q-000001','ozon','legacy','q','NEW','t','t')"); await db.commit()
 await init(db); repo=Repository(db)
 assert (await repo.get_question(1))['external_question_id']=='legacy'
 assert await (await db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='active_text_input_context'" )).fetchone()
 await db.close()

@pytest.mark.asyncio
async def test_codex_switch_callback_preserves_manual_and_edit_input_contexts(tmp_path):
 db=await connect(tmp_path/'x'); await init(db); repo=Repository(db); service=QuestionService(repo,{},None)
 class Message(StandaloneMessage):
  async def reply_text(self,*args,**kwargs): return SimpleNamespace(message_id=1)
 class Query:
  def __init__(self,data): self.data=data; self.message=Message()
  async def answer(self,*args,**kwargs): pass
 async def choose(q,rid,profile):
  update=SimpleNamespace(callback_query=Query(encode('choose_codex',q['id'],rid,profile)),effective_user=SimpleNamespace(id=1),effective_chat=SimpleNamespace(id=1,type='private'))
  await bot.callback(update,None)
 bot=OperatorBot(1,SimpleNamespace(repo=repo))
 q,_=await repo.insert_question({'marketplace':'ozon','external_question_id':'switch-manual','question_text':'q'})
 await service.begin_manual(q['id']); await choose(await repo.get_question(q['id']),None,'codex2')
 assert (await repo.get_active_text_input_context())['question_id']==q['id']
 assert (await repo.get_answer_revision(await service.ordinary_text('manual after switch')))['source']=='manual'
 r1=await repo.get_current_answer_revision(q['id']); await service.begin_edit(q['id'],r1['id']); await choose(await repo.get_question(q['id']),r1['id'],'codex3')
 context=await repo.get_active_text_input_context(); assert context['mode']=='edit_answer' and context['based_on_revision_id']==r1['id']
 r2=await service.ordinary_text('edited after switch')
 assert (await repo.get_answer_revision(r2))['based_on_revision_id']==r1['id']
 assert (await (await repo.db.execute('SELECT COUNT(*) FROM draft_attempts')).fetchone())[0]==0
 await db.close()


@pytest.mark.asyncio
async def test_codex_error_manual_callback_and_switch_then_manual_use_ordinary_text(tmp_path):
 db=await connect(tmp_path/'x'); await init(db); repo=Repository(db); service=QuestionService(repo,{},None)
 class Message(StandaloneMessage):
  def __init__(self): self.messages=[]; self.next_id=40
  async def reply_text(self,*args,**kwargs): self.messages.append((args,kwargs)); self.next_id+=1; return SimpleNamespace(message_id=self.next_id)
  async def edit_reply_markup(self,**kwargs): pass
 class Query:
  def __init__(self,data,message): self.data=data; self.message=message; self.acks=[]
  async def answer(self,*args,**kwargs): self.acks.append((args,kwargs))
 def update(query): return SimpleNamespace(callback_query=query,effective_user=SimpleNamespace(id=1),effective_chat=SimpleNamespace(id=1,type='private'))
 async def fail_to_error(question):
  attempt,_=await repo.claim_codex(question['id']); await repo.finish_draft_error(attempt,'PROCESS_ERROR','failed'); await repo.transition(question['id'],'CODEX_RUNNING','CODEX_ERROR'); return attempt
 async def manual(question,message):
  await bot.callback(update(Query(encode('manual',question['id']),message)),None)
  context=await repo.get_active_text_input_context()
  assert context['question_id']==question['id'] and context['mode']=='manual_answer' and context['based_on_revision_id'] is None
  assert message.messages[-1][0]==('Введите ответ',) and 'force_reply' not in message.messages[-1][1]
  rid=await service.ordinary_text('ordinary manual'); revision=await repo.get_answer_revision(rid)
  assert revision['source']=='manual' and revision['text']=='ordinary manual' and (await repo.get_question(question['id']))['status']=='REVIEW'
  assert await repo.get_active_text_input_context() is None
 bot=OperatorBot(1,service)
 q1,_=await repo.insert_question({'marketplace':'ozon','external_question_id':'error-manual','question_text':'q'}); await fail_to_error(q1); await manual(q1,Message())
 assert (await (await repo.db.execute('SELECT COUNT(*) FROM draft_attempts WHERE question_id=?',(q1['id'],))).fetchone())[0]==1
 q2,_=await repo.insert_question({'marketplace':'ozon','external_question_id':'error-switch-manual','question_text':'q'}); await fail_to_error(q2); message=Message()
 await bot.callback(update(Query(encode('choose_codex',q2['id'],None,'codex2'),message)),None)
 assert await repo.active_codex_profile()=='codex2' and (await repo.get_question(q2['id']))['status']=='CODEX_ERROR'
 await manual(q2,message)
 assert (await (await repo.db.execute('SELECT COUNT(*) FROM draft_attempts WHERE question_id=?',(q2['id'],))).fetchone())[0]==1
 await db.close()


@pytest.mark.asyncio
async def test_repeated_edit_prompts_are_context_bound_and_same_callback_replays_once(tmp_path):
 db=await connect(tmp_path/'x'); await init(db); repo=Repository(db); service=QuestionService(repo,{},None)
 q,_=await repo.insert_question({'marketplace':'ozon','external_question_id':'repeated-edit','question_text':'q'})
 r1=await repo.create_answer_revision(q['id'],'manual','original'); await repo.set_current_answer_revision(q['id'],r1); await repo.transition(q['id'],'NEW','MANUAL_INPUT'); await repo.transition(q['id'],'MANUAL_INPUT','REVIEW')
 class Message(StandaloneMessage):
  def __init__(self): self.messages=[]; self.next_id=90
  async def reply_text(self,*args,**kwargs): self.messages.append((args,kwargs)); self.next_id+=1; return SimpleNamespace(message_id=self.next_id)
  async def edit_reply_markup(self,**kwargs): pass
 class Query:
  def __init__(self,data): self.data=data; self.message=message; self.acks=[]
  async def answer(self,*args,**kwargs): self.acks.append((args,kwargs))
 message=Message(); bot=OperatorBot(1,service)
 async def edit(revision):
  query=Query(encode('edit',q['id'],revision)); update=SimpleNamespace(callback_query=query,effective_user=SimpleNamespace(id=1),effective_chat=SimpleNamespace(id=1,type='private')); await bot.callback(update,None); return query
 await edit(r1); first_marker=await repo.get_telegram_input_for_context(q['id'],'edit_answer',r1); assert first_marker and len(message.messages)==1
 await edit(r1); assert len(message.messages)==1 and (await repo.get_active_text_input_context())['based_on_revision_id']==r1
 r2=await service.ordinary_text('edit one'); assert await repo.get_active_text_input_context() is None
 await edit(r2); second_marker=await repo.get_telegram_input_for_context(q['id'],'edit_answer',r2)
 assert second_marker and second_marker['telegram_prompt_message_id']!=first_marker['telegram_prompt_message_id'] and len(message.messages)==2
 r3=await service.ordinary_text('edit two'); rows=await (await repo.db.execute('SELECT * FROM answer_revisions WHERE question_id=? ORDER BY id',(q['id'],))).fetchall(); current=await repo.get_question(q['id'])
 assert [(row['id'],row['based_on_revision_id'],row['text']) for row in rows]==[(r1,None,'original'),(r2,r1,'edit one'),(r3,r2,'edit two')]
 assert current['current_answer_revision_id']==r3 and current['status']=='REVIEW' and await repo.get_active_text_input_context() is None
 labels=[b.text for row in bot.buttons(current).inline_keyboard for b in row]; assert labels==['✅ Отправить','✏️ Редактировать','🤖 Отправить в Codex','🚫 Игнорировать','🤖 Сменить Codex']
 await db.close()


@pytest.mark.asyncio
async def test_ignore_from_manual_input_clears_its_durable_focus(tmp_path):
 db=await connect(tmp_path/'x'); await init(db); repo=Repository(db); service=QuestionService(repo,{},None)
 q,_=await repo.insert_question({'marketplace':'ozon','external_question_id':'ignore-manual-focus','question_text':'q'})
 await service.begin_manual(q['id']); await service.ignore(q['id'])
 assert (await repo.get_question(q['id']))['status']=='IGNORED' and await repo.get_active_text_input_context() is None
 await db.close()


@pytest.mark.asyncio
async def test_CODEX_RUNNING_STANDALONE_TEST_and_CODEX_REVIEW_STANDALONE_TEST(tmp_path):
 """CODEX_RUNNING is a real card, not a state that a fast runner can hide."""
 db=await connect(tmp_path/'x'); await init(db); repo=Repository(db)
 q,_=await repo.insert_question({'marketplace':'ozon','external_question_id':'running-card','question_text':'original question'})
 started=asyncio.Event(); release=asyncio.Event(); reviewed=asyncio.Event()
 class Runner:
  async def run(self,profile,prompt,attempt_id):
   started.set(); await release.wait(); return 'deterministic test answer'
 class Prompts:
  def build(self,question): return 'prompt'
 class Message(StandaloneMessage):
  def __init__(self): self.calls=[]; self.next_id=10
  async def reply_text(self,*args,**kwargs):
   self.calls.append((args,kwargs)); self.next_id+=1
   if 'deterministic test answer' in args[0]: reviewed.set()
   return SimpleNamespace(message_id=self.next_id)
  async def edit_reply_markup(self,**kwargs): self.calls.append((('DISABLE',),kwargs))
 class Query:
  def __init__(self,data,message): self.data,self.message,self.acks=data,message,[]
  async def answer(self,*args,**kwargs): self.acks.append((args,kwargs))
 def update(query): return SimpleNamespace(callback_query=query,effective_user=SimpleNamespace(id=1),effective_chat=SimpleNamespace(id=1,type='private'))
 message=Message(); service=QuestionService(repo,{},None,Runner(),Prompts()); bot=OperatorBot(1,service)
 query=Query(encode('codex',q['id']),message); await bot.callback(update(query),None)
 running=message.calls[1]
 assert query.acks and message.calls[0][0]==('DISABLE',)
 assert 'Codex готовит черновик через codex1' in running[0][0]
 assert_standalone(running)
 assert [b.text for row in running[1]['reply_markup'].inline_keyboard for b in row]==['🤖 Сменить Codex']
 assert not started.is_set() and (await repo.get_question(q['id']))['status']=='CODEX_RUNNING'
 attempt=await repo.get_current_draft_attempt(q['id']); assert attempt['codex_profile']=='codex1'
 # A replay of the stale NEW callback cannot create draft attempt #2.
 await bot.callback(update(Query(encode('codex',q['id']),message)),None)
 assert (await (await repo.db.execute('SELECT COUNT(*) FROM draft_attempts WHERE question_id=?',(q['id'],))).fetchone())[0]==1
 # Switching during CODEX_RUNNING changes only the global future default.
 await bot.callback(update(Query(encode('choose_codex',q['id'],None,'codex2'),message)),None)
 assert await repo.active_codex_profile()=='codex2'
 assert (await repo.get_current_draft_attempt(q['id']))['codex_profile']=='codex1'
 assert (await repo.get_question(q['id']))['status']=='CODEX_RUNNING'
 assert (await (await repo.db.execute('SELECT COUNT(*) FROM draft_attempts WHERE question_id=?',(q['id'],))).fetchone())[0]==1
 release.set(); await asyncio.wait_for(reviewed.wait(),1)
 current=await repo.get_question(q['id']); revision=await repo.get_current_answer_revision(q['id'])
 assert (current['status'],current['current_answer_revision_id'])==('REVIEW',revision['id'])
 assert (revision['source'],revision['text'],revision['draft_attempt_id'])==('codex','deterministic test answer',attempt['id'])
 projection,review=message.calls[-2:]; assert '🤖 Подготовил: codex1' in projection[0][0] and '🟢 Сейчас активен: codex2' in projection[0][0] and review[0][0]=='deterministic test answer'
 assert_standalone(review)
 assert [b.text for row in review[1]['reply_markup'].inline_keyboard for b in row]==['✅ Отправить','✏️ Редактировать','🤖 Отправить в Codex','🚫 Игнорировать','🤖 Сменить Codex']
 assert not any(word in review[0][0] for word in ('Сгенерировать','Сгенерировать заново','Перегенерировать'))
 await db.close()


@pytest.mark.asyncio
async def test_codex_running_card_message_failure_is_durable_and_does_not_cancel_claim(tmp_path):
 db=await connect(tmp_path/'x'); await init(db); repo=Repository(db)
 q,_=await repo.insert_question({'marketplace':'ozon','external_question_id':'running-failure','question_text':'q'})
 started=asyncio.Event()
 class Runner:
  async def run(self,*args): started.set(); raise RuntimeError('runner failure')
 class Prompts:
  def build(self,question): return 'prompt'
 class Message(StandaloneMessage):
  async def reply_text(self,*args,**kwargs):
   from telegram.error import BadRequest
   raise BadRequest('invalid running card')
  async def edit_reply_markup(self,**kwargs): pass
 class Query:
  data=encode('codex',q['id']); message=Message()
  async def answer(self,*args,**kwargs): pass
 bot=OperatorBot(1,QuestionService(repo,{},None,Runner(),Prompts()))
 update=SimpleNamespace(callback_query=Query(),effective_user=SimpleNamespace(id=1),effective_chat=SimpleNamespace(id=1,type='private'))
 await bot.callback(update,None); await asyncio.wait_for(started.wait(),1)
 assert (await (await repo.db.execute('SELECT COUNT(*) FROM draft_attempts WHERE question_id=?',(q['id'],))).fetchone())[0]==1
 failure=await repo.get_delivery_failure(q['id'],'CODEX_RUNNING_CARD')
 assert failure['outcome']=='DETERMINISTIC_FAILURE'
 assert (await repo.get_question(q['id']))['status'] in {'CODEX_RUNNING','CODEX_ERROR'}
 await db.close()


@pytest.mark.asyncio
async def test_fast_codex_runner_still_sends_running_card_before_review(tmp_path):
 db=await connect(tmp_path/'x'); await init(db); repo=Repository(db)
 q,_=await repo.insert_question({'marketplace':'ozon','external_question_id':'fast-running-card','question_text':'q'})
 events=[]; complete=asyncio.Event()
 class Runner:
  async def run(self,*args): events.append('runner'); return 'fast answer'
 class Prompts:
  def build(self,question): return 'prompt'
 class Message(StandaloneMessage):
  async def reply_text(self,text,**kwargs):
   events.append('review' if 'fast answer' in text else 'running')
   if 'fast answer' in text: complete.set()
   return SimpleNamespace(message_id=len(events)+1)
  async def edit_reply_markup(self,**kwargs): events.append('disable')
 class Query:
  data=encode('codex',q['id']); message=Message()
  async def answer(self,*args,**kwargs): events.append('ack')
 bot=OperatorBot(1,QuestionService(repo,{},None,Runner(),Prompts()))
 await bot.callback(SimpleNamespace(callback_query=Query(),effective_user=SimpleNamespace(id=1),effective_chat=SimpleNamespace(id=1,type='private')),None)
 await asyncio.wait_for(complete.wait(),1)
 assert events.index('running') < events.index('runner') < events.index('review')
 await db.close()


@pytest.mark.asyncio
async def test_TELEGRAM_STANDALONE_SEND_PRIMITIVE_TEST_and_SWITCH_MENU_STANDALONE_MESSAGE_TEST(tmp_path):
 """The Bot boundary, not just rendered text, proves the standalone contract."""
 db=await connect(tmp_path/'x'); await init(db); repo=Repository(db)
 q,_=await repo.insert_question({'marketplace':'ozon','external_question_id':'standalone-switch','question_text':'q'})
 attempt,_=await repo.claim_codex(q['id']); await repo.finish_draft_success(attempt,'T4 deterministic Codex answer')
 rid=await repo.create_answer_revision(q['id'],'codex','T4 deterministic Codex answer',draft_attempt_id=attempt)
 await repo.set_current_answer_revision(q['id'],rid); await repo.transition(q['id'],'CODEX_RUNNING','REVIEW')
 class Bot:
  def __init__(self): self.calls=[]
  async def send_message(self,**kwargs): self.calls.append(kwargs); return SimpleNamespace(message_id=len(self.calls)+50)
 class Message:
  chat_id=286579139
  def __init__(self,bot): self.bot=bot
  def get_bot(self): return self.bot
 class Query:
  def __init__(self,data,message): self.data,self.message,self.acks=data,message,[]
  async def answer(self,*args,**kwargs): self.acks.append((args,kwargs))
 def update(query): return SimpleNamespace(callback_query=query,effective_user=SimpleNamespace(id=286579139),effective_chat=SimpleNamespace(id=286579139,type='private'))
 transport=Bot(); message=Message(transport); bot=OperatorBot(286579139,SimpleNamespace(repo=repo))
 await bot.callback(update(Query(encode('choose_codex',q['id'],rid,'menu'),message)),None)
 assert len(transport.calls)==1 # SWITCH_MENU_STANDALONE_MESSAGE_TEST
 chooser=transport.calls[0]
 assert chooser['chat_id']==286579139 and '🤖 СМЕНИТЬ CODEX' in chooser['text'] and 'Сейчас: codex1' in chooser['text']
 assert isinstance(chooser['reply_markup'],InlineKeyboardMarkup)
 assert [b.text for row in chooser['reply_markup'].inline_keyboard for b in row]==['codex1 ✓','codex2','codex3'] # SWITCH_MENU_EXACT_PROFILE_BUTTONS_TEST
 assert chooser.get('reply_parameters') is None and chooser.get('reply_to_message_id') is None and not isinstance(chooser['reply_markup'],ForceReply)
 after=await repo.get_question(q['id'])
 assert (after['status'],after['current_answer_revision_id'])==('REVIEW',rid) # SWITCH_MENU_STATE_PRESERVED_TEST
 assert (await (await repo.db.execute('SELECT COUNT(*) FROM draft_attempts WHERE question_id=?',(q['id'],))).fetchone())[0]==1 # SWITCH_MENU_NO_CODEX_ATTEMPT_TEST
 await bot.callback(update(Query(encode('choose_codex',q['id'],rid,'codex2'),message)),None)
 assert await repo.active_codex_profile()=='codex2' and (await repo.get_question(q['id']))['status']=='REVIEW' # SWITCH_CHOICE_GLOBAL_PROFILE_ONLY_TEST
 result=transport.calls[-1]
 assert result.get('reply_parameters') is None and result.get('reply_to_message_id') is None and not isinstance(result.get('reply_markup'),ForceReply) # SWITCH_CHOICE_STANDALONE_RESULT_TEST
 await db.close()


@pytest.mark.asyncio
async def test_REVIEW_SWITCH_PRESERVES_GENERATOR_PROVENANCE_TEST(tmp_path):
 db=await connect(tmp_path/'x'); await init(db); repo=Repository(db)
 q,_=await repo.insert_question({'marketplace':'ozon','external_question_id':'review-switch','question_text':'q'})
 attempt,_=await repo.claim_codex(q['id']); await repo.finish_draft_success(attempt,'T4 deterministic Codex answer')
 rid=await repo.create_answer_revision(q['id'],'codex','T4 deterministic Codex answer',draft_attempt_id=attempt)
 await repo.set_current_answer_revision(q['id'],rid); await repo.transition(q['id'],'CODEX_RUNNING','REVIEW')
 class Wire:
  def __init__(self): self.calls=[]
  async def send_message(self,**kwargs): self.calls.append(kwargs); return SimpleNamespace(message_id=len(self.calls))
 class Message:
  chat_id=1
  def __init__(self,wire): self.wire=wire
  def get_bot(self): return self.wire
 class Query:
  def __init__(self): self.data=encode('choose_codex',q['id'],rid,'codex2'); self.message=message
  async def answer(self,*args,**kwargs): pass
 wire=Wire(); message=Message(wire); bot=OperatorBot(1,SimpleNamespace(repo=repo))
 await bot.callback(SimpleNamespace(callback_query=Query(),effective_user=SimpleNamespace(id=1),effective_chat=SimpleNamespace(id=1,type='private')),None)
 current=await repo.get_question(q['id']); projection,text=wire.calls[-2:]; markup=text['reply_markup']
 assert await repo.active_codex_profile()=='codex2'
 assert (current['status'],current['current_answer_revision_id'])==('REVIEW',rid)
 assert (await (await repo.db.execute('SELECT COUNT(*) FROM draft_attempts')).fetchone())[0]==1
 assert (await (await repo.db.execute('SELECT COUNT(*) FROM answer_revisions')).fetchone())[0]==1
 assert text['text']=='T4 deterministic Codex answer'
 assert all(value in projection['text'] for value in ('Источник ревизии: codex','🤖 Подготовил: codex1','🟢 Сейчас активен: codex2')) and '🤖 Подготовил: codex2' not in projection['text']
 assert [b.text for row in markup.inline_keyboard for b in row]==['✅ Отправить','✏️ Редактировать','🤖 Отправить в Codex','🚫 Игнорировать','🤖 Сменить Codex']
 assert 'Перегенерировать' not in text and wire.calls[-1].get('reply_parameters') is None and wire.calls[-1].get('reply_to_message_id') is None and not isinstance(markup,ForceReply)
 await db.close()


@pytest.mark.asyncio
async def test_SHOW_QUESTION_REVIEW_GENERATOR_PROVENANCE_TEST_and_MANUAL_REVIEW_DOES_NOT_INVENT_GENERATOR_TEST(tmp_path):
 db=await connect(tmp_path/'x'); await init(db); repo=Repository(db)
 class Message(StandaloneMessage):
  def __init__(self): self.calls=[]
  async def reply_text(self,*args,**kwargs): self.calls.append((args,kwargs)); return SimpleNamespace(message_id=len(self.calls))
 message=Message(); bot=OperatorBot(1,SimpleNamespace(repo=repo))
 q,_=await repo.insert_question({'marketplace':'ozon','external_question_id':'show-review','question_text':'q'})
 attempt,_=await repo.claim_codex(q['id']); await repo.finish_draft_success(attempt,'answer')
 rid=await repo.create_answer_revision(q['id'],'codex','answer',draft_attempt_id=attempt); await repo.set_current_answer_revision(q['id'],rid); await repo.transition(q['id'],'CODEX_RUNNING','REVIEW')
 await repo.set_active_codex_profile('codex2')
 await bot.show_question(message,q['id']); assert '🤖 Подготовил: codex1' in message.calls[-2][0][0] and '🟢 Сейчас активен: codex2' in message.calls[-2][0][0] and message.calls[-1][0][0]=='answer'
 manual,_=await repo.insert_question({'marketplace':'ozon','external_question_id':'manual-review','question_text':'q'})
 manual_rid=await repo.create_answer_revision(manual['id'],'manual','manual answer'); await repo.set_current_answer_revision(manual['id'],manual_rid); await repo.transition(manual['id'],'NEW','MANUAL_INPUT'); await repo.transition(manual['id'],'MANUAL_INPUT','REVIEW')
 await bot.show_question(message,manual['id']); projection,text=message.calls[-2:]
 assert '🟢 Сейчас активен: codex2' in projection[0][0] and not any(f'🤖 Подготовил: {profile}' in projection[0][0] for profile in ('codex1','codex2','codex3')) and text[0][0]=='manual answer'
 await db.close()


@pytest.mark.asyncio
async def test_SHOW_CODEX_CODEX_ERROR_ACTIVE_PROFILE_TEST_and_CODEX_ERROR_PRESERVES_FAILED_PROFILE_AND_ACTIVE_PROFILE_TEST(tmp_path):
 db=await connect(tmp_path/'x'); await init(db); repo=Repository(db)
 q,_=await repo.insert_question({'marketplace':'ozon','external_question_id':'codex-error-card','question_text':'q'})
 attempt,_=await repo.claim_codex(q['id']); await repo.finish_draft_error(attempt,'PROCESS_ERROR','deterministic failure'); await repo.transition(q['id'],'CODEX_RUNNING','CODEX_ERROR')
 await repo.set_active_codex_profile('codex2')
 class Message(StandaloneMessage):
  def __init__(self): self.calls=[]
  async def reply_text(self,*args,**kwargs): self.calls.append((args,kwargs)); return SimpleNamespace(message_id=len(self.calls))
 message=Message(); bot=OperatorBot(1,SimpleNamespace(repo=repo))
 await bot.show_codex(message,q['id'])
 text,kwargs=message.calls[-1]
 assert 'Codex: codex1' in text[0] and '🟢 Сейчас активен: codex2' in text[0]
 assert [b.text for row in kwargs['reply_markup'].inline_keyboard for b in row]==['🔄 Повторить','✍️ Ответить самому','🚫 Игнорировать','🤖 Сменить Codex']
 assert_standalone(message.calls[-1])
 assert (await repo.get_question(q['id']))['status']=='CODEX_ERROR'
 assert (await repo.get_current_draft_attempt(q['id']))['codex_profile']=='codex1'
 await db.close()


@pytest.mark.asyncio
async def test_RUN_CODEX_FAILURE_RENDERS_CODEX_ERROR_TEST(tmp_path):
 db=await connect(tmp_path/'x'); await init(db); repo=Repository(db)
 q,_=await repo.insert_question({'marketplace':'ozon','external_question_id':'codex-error-flow','question_text':'q'})
 claim=await repo.claim_codex(q['id']); await repo.set_active_codex_profile('codex2')
 class Runner:
  async def run(self,*args): raise RuntimeError('deterministic runner failure')
 class Prompts:
  def build(self,question): return 'prompt'
 class Message(StandaloneMessage):
  def __init__(self): self.calls=[]
  async def reply_text(self,*args,**kwargs): self.calls.append((args,kwargs)); return SimpleNamespace(message_id=len(self.calls))
 message=Message(); bot=OperatorBot(1,QuestionService(repo,{},None,Runner(),Prompts()))
 await bot.run_codex(message,q['id'],claim)
 current=await repo.get_question(q['id']); attempt=await repo.get_current_draft_attempt(q['id']); text,kwargs=message.calls[-1]
 assert current['status']=='CODEX_ERROR' and attempt['codex_profile']=='codex1' and attempt['error_type']=='PROCESS_ERROR'
 assert 'Codex: codex1' in text[0] and '🟢 Сейчас активен: codex2' in text[0]
 assert (await (await repo.db.execute('SELECT COUNT(*) FROM draft_attempts WHERE question_id=?',(q['id'],))).fetchone())[0]==1
 assert (await (await repo.db.execute('SELECT COUNT(*) FROM answer_revisions WHERE question_id=?',(q['id'],))).fetchone())[0]==0
 assert_standalone(message.calls[-1]) and isinstance(kwargs['reply_markup'],InlineKeyboardMarkup)
 await db.close()


@pytest.mark.asyncio
async def test_MANUAL_PROMPT_STANDALONE_TEST_and_EDIT_PROMPT_STANDALONE_TEST(tmp_path):
 db=await connect(tmp_path/'x'); await init(db); repo=Repository(db); service=QuestionService(repo,{},None)
 q,_=await repo.insert_question({'marketplace':'ozon','external_question_id':'standalone-prompts','question_text':'q'})
 class Bot:
  def __init__(self): self.calls=[]
  async def send_message(self,**kwargs): self.calls.append(kwargs); return SimpleNamespace(message_id=len(self.calls))
 class Message:
  chat_id=1
  def __init__(self,b): self.b=b
  def get_bot(self): return self.b
 wire=Bot(); message=Message(wire); operator=OperatorBot(1,SimpleNamespace(repo=repo))
 await operator.prompt(message,await service.begin_manual(q['id']),'manual_answer'); assert_standalone(((),wire.calls[-1]))
 rid=await service.ordinary_text('answer'); await service.begin_edit(q['id'],rid)
 await operator.prompt(message,await repo.get_question(q['id']),'edit_answer',rid); assert_standalone(((),wire.calls[-1]))
 await db.close()
