"""Telegram edge: authenticate, correlate and acknowledge; SQLite is authoritative."""
import asyncio

from telegram import ForceReply, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import CallbackQueryHandler, CommandHandler, MessageHandler, filters

from app.state_machine import StaleState
from app.telegram.callbacks import decode, encode
from app.telegram import render
from app.telegram.edge import TelegramEdge, Operation, Outcome


class OperatorBot:
 def __init__(self,operator_user_id,service): self.operator_user_id,self.service=str(operator_user_id),service; self.edge=TelegramEdge()
 async def _telegram(self, operation, call):
  result=await self.edge.mutate(operation,call)
  if result.outcome is not Outcome.SUCCESS:
   await self.service.repo.record_error('telegram',result.outcome.value,str(result.error))
  return result
 async def _ack(self,query,*args,**kwargs): return await self._telegram(Operation.CALLBACK_ACK,lambda:query.answer(*args,**kwargs))
 async def _standalone_send(self,message,text,reply_markup=None,**kwargs):
  """Create an operator message without Telegram reply semantics.

  `Message.reply_text` is deliberately not used here: it derives quote/reply
  arguments from the inbound message.  Operator UX cards and prompts are new,
  standalone messages in the private operator chat.
  """
  if isinstance(reply_markup,ForceReply): raise ValueError('ForceReply is not permitted for operator messages')
  if kwargs.get('reply_parameters') is not None or kwargs.get('reply_to_message_id') is not None:
   raise ValueError('reply parameters are not permitted for operator messages')
  return await self._telegram(Operation.MESSAGE_CREATE,lambda:message.get_bot().send_message(chat_id=message.chat_id,text=text,reply_markup=reply_markup,**kwargs))
 async def _reply(self,message,text,reply_markup=None,**kwargs): return await self._standalone_send(message,text,reply_markup=reply_markup,**kwargs)
 def authorized(self,update):
  user=update.effective_user; chat=update.effective_chat
  return bool(user and chat and str(user.id)==self.operator_user_id and str(chat.id)==self.operator_user_id and getattr(chat,'type',None)=='private')
 async def _denied(self,u):
  if self.authorized(u): return False
  if getattr(u,'callback_query',None): await self._ack(u.callback_query,'Access denied',show_alert=True)
  # Do not reply to arbitrary chats: authorization is deliberately silent for messages.
  return True
 def buttons(self,q,state=None):
  state=state or q['status']; qid=q['id']; rid=q['current_answer_revision_id']
  switch=InlineKeyboardButton('🤖 Сменить Codex',callback_data=encode('choose_codex',qid,rid,'menu'))
  if state=='NEW': rows=[[InlineKeyboardButton('✍️ Ответить самому',callback_data=encode('manual',qid)),InlineKeyboardButton('🤖 Отправить в Codex',callback_data=encode('codex',qid))],[InlineKeyboardButton('🚫 Игнорировать',callback_data=encode('ignore',qid))],[switch]]
  elif state=='REVIEW': rows=[[InlineKeyboardButton('✅ Отправить',callback_data=encode('send',qid,rid)),InlineKeyboardButton('✏️ Редактировать',callback_data=encode('edit',qid,rid))],[InlineKeyboardButton('🚫 Игнорировать',callback_data=encode('ignore',qid,rid))],[switch]]
  elif state=='CODEX_ERROR': rows=[[InlineKeyboardButton('🔄 Повторить',callback_data=encode('retry_codex',qid))],[InlineKeyboardButton('✍️ Ответить самому',callback_data=encode('manual',qid)),InlineKeyboardButton('🚫 Игнорировать',callback_data=encode('ignore',qid))],[switch]]
  elif state=='SEND_FAILED': rows=[[InlineKeyboardButton('🔄 Повторить отправку',callback_data=encode('retry_send',qid,rid))],[switch]]
  else: rows=[[switch]]
  return InlineKeyboardMarkup(rows) if rows else None
 def profile_buttons(self,q,active):
  return InlineKeyboardMarkup([[InlineKeyboardButton(f'{p}{" ✓" if p==active else ""}',callback_data=encode('choose_codex',q['id'],q['current_answer_revision_id'],p))] for p in ('codex1','codex2','codex3')])
 async def show_question(self,message,qid):
  q=await self.service.repo.get_question(qid); active=await self.service.repo.active_codex_profile()
  if q['status']=='NEW': cards=render.initial(q,active)
  elif q['status']=='CODEX_RUNNING':
   attempt=await self.service.repo.get_current_draft_attempt(qid); cards=render.running(q,attempt['codex_profile'])
  elif q['status']=='CODEX_ERROR':
   attempt=await self.service.repo.get_current_draft_attempt(qid); cards=render.codex_error(q,attempt['codex_profile'],attempt['error_type'],attempt['error_message'],active)
  elif q['current_answer_revision_id']:
   cards=render.delivery(q,await self.service.repo.get_current_answer_revision(qid),q['status']) if q['status'] in {'SENDING','SENT','SEND_FAILED','SEND_UNKNOWN'} else render.review(q,await self.service.repo.get_current_answer_revision(qid),active)
  else: cards=render.split_card(q,f'Состояние: {q["status"]}\n🟢 Сейчас активен: {active}')
  await self.cards(message,cards,self.buttons(q),qid,operation='CODEX_RUNNING_CARD' if q['status']=='CODEX_RUNNING' else 'STATUS_CARD')
 async def cards(self,message,cards,markup=None,qid=None,operation='STATUS_CARD'):
  for i,text in enumerate(cards):
   outcome=await self._reply(message,text,reply_markup=markup if i==0 else None)
   if qid and outcome.outcome is not Outcome.SUCCESS: await self.service.repo.record_delivery_failure(qid,operation,outcome.outcome.value,str(outcome.error)); return False
  if qid: await self.service.repo.clear_delivery_failure(qid,operation)
  return True
 async def command(self,u,c):
  if await self._denied(u): return
  cmd=u.message.text.split()[0]
  if cmd=='/codex':
   active=await self.service.repo.active_codex_profile(); await self._reply(u.message,f'🤖 CODEX\nАктивен: {active}\nСмените профиль из меню конкретного вопроса.')
  elif cmd=='/questions':
   rows=await self.service.repo.list_open_questions(); await self._reply(u.message,'\n'.join(f"{q['public_id']} · {q['marketplace']} · {q['status']}" for q in rows) or 'Open questions: 0')
  elif cmd=='/errors':
   rows=await self.service.repo.recent_errors(); await self._reply(u.message,'\n'.join(f"{x['component']}: {x['error_type']} ({x['occurrence_count']})" for x in rows) or 'No recent errors')
  elif cmd=='/recover' and len(u.message.text.split()) in {2,3}:
   q=await self.service.repo.get_question_by_public_id(u.message.text.split()[1])
   if not q: await self._reply(u.message,'Unknown question'); return
   if await self.service.repo.get_delivery_failure(q['id'],'INITIAL_CARD'):
    if len(u.message.text.split())!=3 or u.message.text.split()[2]!='DUPLICATE_RISK_ACKNOWLEDGED': await self._reply(u.message,'Confirm duplicate risk: /recover Q-ID DUPLICATE_RISK_ACKNOWLEDGED'); return
    if await self.service.recover_initial_card(q['id']): await self._reply(u.message,'Initial card resent and delivery confirmed.')
    else: await self._reply(u.message,'Initial resend was not confirmed.')
   elif q['status'] in {'REVIEW','CODEX_ERROR'}: await self.show_codex(u.message,q['id'])
   else: await self._reply(u.message,'No recoverable card for this question state.')
  else: await self._reply(u.message,f"DB available\nOpen questions: {len(await self.service.repo.list_open_questions())}\nActive Codex: {await self.service.repo.active_codex_profile()}\nRecover an unconfirmed initial card: /recover Q-ID DUPLICATE_RISK_ACKNOWLEDGED")
 async def prompt(self,message,q,mode,revision_id=None):
  # State/focus is durable before delivery.  The legacy input row is retained as
  # a positive delivery marker, so callback replay cannot duplicate a prompt.
  based_on_revision_id=revision_id if mode=='edit_answer' else None
  if await self.service.repo.get_telegram_input_for_context(q['id'],mode,based_on_revision_id): return
  current=await self.service.repo.get_current_answer_revision(q['id']); extra=f"\n\nТекущий ответ:\n{current['text']}" if mode=='edit_answer' and current else ''
  if mode=='edit_answer' and (not current or current['id'] != revision_id): raise StaleState('STALE_STATE')
  text='Введите ответ' if mode=='manual_answer' else f"ID: {q['public_id']}\nMarketplace: {q['marketplace']}\n\nВопрос:\n{q['question_text']}{extra}\n\nВведите новый ответ"
  outcome=await self._reply(message,text,reply_markup=self.buttons(q))
  operation='EDIT_PROMPT' if mode=='edit_answer' else 'MANUAL_PROMPT'
  if outcome.outcome is not Outcome.SUCCESS:
   await self.service.repo.record_delivery_failure(q['id'],operation,outcome.outcome.value,str(outcome.error)); return False
  sent=outcome.value
  if not isinstance(sent.message_id,int) or sent.message_id <= 0:
   await self.service.repo.record_error('telegram','INVALID_MESSAGE_ID','prompt did not return positive message_id'); await self.service.repo.record_delivery_failure(q['id'],operation,'INVALID_MESSAGE_ID','prompt did not return positive message_id'); return False
  await self.service.repo.create_telegram_input(sent.message_id,q['id'],mode,revision_id if mode=='edit_answer' else None); await self.service.repo.clear_delivery_failure(q['id'],operation)
  return True
 async def show_codex(self,message,qid):
  q=await self.service.repo.get_question(qid); active=await self.service.repo.active_codex_profile()
  if q['status']=='REVIEW':
   rev=await self.service.repo.get_current_answer_revision(qid); attempt=await self.service.repo.get_draft_attempt(rev['draft_attempt_id']) if rev and rev['draft_attempt_id'] else None; await self.cards(message,render.review(q,rev,active,attempt['codex_profile'] if attempt else None),self.buttons(q),qid)
  elif q['status']=='CODEX_ERROR':
   attempt=await self.service.repo.get_current_draft_attempt(qid); await self.cards(message,render.codex_error(q,attempt['codex_profile'],attempt['error_type'],attempt['error_message'],active),self.buttons(q),qid)
 async def run_codex(self,message,qid,claim):
  try: await self.service.codex(qid,claim=claim)
  except Exception: pass
  await self.show_codex(message,qid)
 async def _disable(self,query):
  await self._telegram(Operation.UI_EDIT,lambda:query.message.edit_reply_markup(reply_markup=None))
 async def callback(self,u,c):
  query=u.callback_query
  if await self._denied(u): return
  try: x=decode(query.data)
  except ValueError: await self._ack(query,'Invalid action',show_alert=True); return
  action,qid,rid=x['action'],x['question_id'],x['revision_id']
  try:
   if action=='choose_codex':
    if not qid: raise StaleState('STALE_STATE')
    q=await self.service.repo.get_question(qid)
    if not q: raise StaleState('STALE_STATE')
    # The chooser is bound to the question snapshot that rendered it.  A
    # revision-bearing menu must still name the current revision; a
    # revisionless menu is only valid while the question has no revision.
    # Do this before opening a menu as well as before changing the global
    # setting, so a stale menu cannot be used to manufacture a fresh choice.
    if (rid is None and q['current_answer_revision_id'] is not None) or (rid is not None and q['current_answer_revision_id'] != rid): raise StaleState('STALE_STATE')
    if x['arg']=='menu':
     active=await self.service.repo.active_codex_profile(); await self._ack(query); await self._reply(query.message,f'🤖 СМЕНИТЬ CODEX\n\nСейчас: {active}',reply_markup=self.profile_buttons(q,active)); return
    if x['arg'] not in {'codex1','codex2','codex3'}: raise StaleState('STALE_STATE')
    await self.service.repo.set_active_codex_profile(x['arg']); await self._ack(query)
    if q['status']=='CODEX_ERROR':
     old=(await self.service.repo.get_current_draft_attempt(qid))['codex_profile']
     markup=InlineKeyboardMarkup([[InlineKeyboardButton('🔄 Перегенерировать',callback_data=encode('confirm_regenerate',qid))],[InlineKeyboardButton('✍️ Ответить самому',callback_data=encode('manual',qid)),InlineKeyboardButton('🚫 Игнорировать',callback_data=encode('ignore',qid))],[InlineKeyboardButton('🤖 Сменить Codex',callback_data=encode('choose_codex',qid,q['current_answer_revision_id'],'menu'))]])
     await self._reply(query.message,f'🤖 Codex изменён: {old} → {x["arg"]}',reply_markup=markup)
    else: await self.show_question(query.message,qid)
    return
   if not qid: raise StaleState('STALE_STATE')
   q=await self.service.repo.get_question(qid)
   if not q: raise StaleState('STALE_STATE')
   if action in {'codex','retry_codex','confirm_regenerate'}:
    claim=await self.service.repo.claim_codex(qid)
    await self._ack(query,'Codex started')
    await self._disable(query)
    # The claimed attempt is now observable before its runner can possibly
    # finish.  show_question resolves the profile from that persisted attempt,
    # rather than consulting the mutable global profile.  Its cards() path also
    # records MESSAGE_CREATE failures without retrying or changing the claim.
    await self.show_question(query.message,qid)
    asyncio.create_task(self.run_codex(query.message,qid,claim)); return
   # All non-Codex actions are short. State/revision checks happen before acknowledgement.
   if action=='manual':
    q=await self.service.begin_manual(qid)
    await self._ack(query); created=await self.prompt(query.message,await self.service.repo.get_question(qid),'manual_answer')
    if created: await self._disable(query)
   elif action=='edit':
    q=await self.service.begin_edit(qid,rid)
    await self._ack(query); created=await self.prompt(query.message,q,'edit_answer',rid)
    if created: await self._disable(query)
   elif action=='ignore':
    if rid is not None and (q['status']!='REVIEW' or q['current_answer_revision_id']!=rid): raise StaleState('STALE_STATE')
    await self.service.ignore(qid); await self._ack(query,'Ignored'); await self._disable(query)
   elif action=='send':
    claim=await self.service.claim_send(qid,rid); await self._ack(query); outcome=await self.service.execute_send(qid,claim); current=await self.service.repo.get_question(qid); rev=await self.service.repo.get_answer_revision(rid); await self.cards(query.message,render.delivery(current,rev,outcome),self.buttons(current)); await self._disable(query)
   elif action=='retry_send':
    claim=await self.service.claim_retry_send(qid,rid); await self._ack(query); outcome=await self.service.execute_send(qid,claim); current=await self.service.repo.get_question(qid); rev=await self.service.repo.get_answer_revision(rid); await self.cards(query.message,render.delivery(current,rev,outcome),self.buttons(current)); await self._disable(query)
   else: raise StaleState('STALE_STATE')
  except (StaleState,ValueError): await self._ack(query,'This action is stale',show_alert=True)
  except Exception as exc:
   await self.service.repo.record_error('telegram','CALLBACK_ERROR',str(exc)); await self._ack(query,'Action failed',show_alert=True)
 async def ordinary_text(self,u,c):
  if await self._denied(u): return
  try: rid=await self.service.ordinary_text(u.message.text)
  except StaleState: return
  if rid is None: return
  rev=await self.service.repo.get_answer_revision(rid); q=await self.service.repo.get_question(rev['question_id']); await self.cards(u.message,render.review(q,rev,await self.service.repo.active_codex_profile()),self.buttons(q))
 async def _tracked(self, method, update, context):
  await method(update,context)
  # Completion is deliberately after the callback returns. Exceptions leave the
  # receipt pending for startup replay.
  await self.service.repo.complete_telegram_update(getattr(update,'update_id',None))
 async def ignored_message(self,u,c):
  """Terminal handler for permitted, but non-actionable, message updates.

  Durable receipts are completed only after this handler has deliberately made
  the no-op decision.  Without it, arbitrary operator text would be replayed
  forever because it does not match the reply handler.
  """
  return None
 def handlers(self):
  return [CommandHandler(['questions','codex','errors','status'],lambda u,c:self._tracked(self.command,u,c)),CallbackQueryHandler(lambda u,c:self._tracked(self.callback,u,c)),MessageHandler(filters.TEXT & ~filters.COMMAND,lambda u,c:self._tracked(self.ordinary_text,u,c)),MessageHandler(filters.ALL,lambda u,c:self._tracked(self.ignored_message,u,c))]
