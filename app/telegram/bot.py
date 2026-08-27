"""Telegram edge: authenticate, correlate and acknowledge; SQLite is authoritative."""
import asyncio

from telegram import ForceReply, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import CallbackQueryHandler, CommandHandler, MessageHandler, filters

from app.state_machine import StaleState
from app.telegram.callbacks import decode, encode
from app.telegram import render


class OperatorBot:
 def __init__(self,operator_user_id,service): self.operator_user_id,self.service=str(operator_user_id),service
 def authorized(self,update):
  user=update.effective_user; chat=update.effective_chat
  return bool(user and chat and str(user.id)==self.operator_user_id and str(chat.id)==self.operator_user_id and getattr(chat,'type',None)=='private')
 async def _denied(self,u):
  if self.authorized(u): return False
  if getattr(u,'callback_query',None): await u.callback_query.answer('Access denied',show_alert=True)
  # Do not reply to arbitrary chats: authorization is deliberately silent for messages.
  return True
 def buttons(self,q,state=None):
  state=state or q['status']; qid=q['id']; rid=q['current_answer_revision_id']
  if state=='NEW': rows=[[InlineKeyboardButton('✍️ Ответить самому',callback_data=encode('manual',qid)),InlineKeyboardButton('🤖 Отправить в Codex',callback_data=encode('codex',qid))],[InlineKeyboardButton('🚫 Игнорировать',callback_data=encode('ignore',qid))]]
  elif state=='REVIEW': rows=[[InlineKeyboardButton('✅ Отправить',callback_data=encode('send',qid,rid)),InlineKeyboardButton('✏️ Редактировать',callback_data=encode('edit',qid,rid))],[InlineKeyboardButton('🔄 Сгенерировать заново',callback_data=encode('regenerate',qid,rid)),InlineKeyboardButton('🚫 Игнорировать',callback_data=encode('ignore',qid,rid))]]
  elif state=='CODEX_ERROR': rows=[[InlineKeyboardButton('🔄 Повторить',callback_data=encode('retry_codex',qid)),InlineKeyboardButton('🤖 Сменить Codex',callback_data=encode('choose_codex',arg='menu'))],[InlineKeyboardButton('✍️ Ответить самому',callback_data=encode('manual',qid)),InlineKeyboardButton('🚫 Игнорировать',callback_data=encode('ignore',qid))]]
  elif state=='SEND_FAILED': rows=[[InlineKeyboardButton('🔄 Повторить отправку',callback_data=encode('retry_send',qid,rid))]]
  else: rows=[]
  return InlineKeyboardMarkup(rows) if rows else None
 async def cards(self,message,cards,markup=None):
  for i,text in enumerate(cards): await message.reply_text(text,reply_markup=markup if i==0 else None)
 async def command(self,u,c):
  if await self._denied(u): return
  cmd=u.message.text.split()[0]
  if cmd=='/codex':
   active=await self.service.repo.active_codex_profile(); keys=[[InlineKeyboardButton(f'{x}{" ✓" if x==active else ""}',callback_data=encode('choose_codex',arg=x))] for x in ('codex1','codex2','codex3')]; await u.message.reply_text(f'🤖 CODEX\nАктивен: {active}',reply_markup=InlineKeyboardMarkup(keys))
  elif cmd=='/questions':
   rows=await self.service.repo.list_open_questions(); await u.message.reply_text('\n'.join(f"{q['public_id']} · {q['marketplace']} · {q['status']}" for q in rows) or 'Open questions: 0')
  elif cmd=='/errors':
   rows=await self.service.repo.recent_errors(); await u.message.reply_text('\n'.join(f"{x['component']}: {x['error_type']} ({x['occurrence_count']})" for x in rows) or 'No recent errors')
  else: await u.message.reply_text(f"DB available\nOpen questions: {len(await self.service.repo.list_open_questions())}\nActive Codex: {await self.service.repo.active_codex_profile()}")
 async def prompt(self,message,q,mode,revision_id=None):
  # A replay after the state change but before sending the ForceReply must finish
  # the prompt, while a replay after its durable correlation must not duplicate it.
  if await self.service.repo.get_telegram_input_for(q['id'],mode): return
  current=await self.service.repo.get_current_answer_revision(q['id']); extra=f"\n\nТекущий ответ:\n{current['text']}" if mode=='edit_answer' and current else ''
  if mode=='edit_answer' and (not current or current['id'] != revision_id): raise StaleState('STALE_STATE')
  sent=await message.reply_text(f"ID: {q['public_id']}\nMarketplace: {q['marketplace']}\n\nВопрос:\n{q['question_text']}{extra}\n\nОтветьте Reply на ЭТО сообщение.",reply_markup=ForceReply(selective=True))
  await self.service.repo.create_telegram_input(sent.message_id,q['id'],mode,revision_id if mode=='edit_answer' else None)
 async def show_codex(self,message,qid):
  q=await self.service.repo.get_question(qid); active=await self.service.repo.active_codex_profile()
  if q['status']=='REVIEW':
   rev=await self.service.repo.get_current_answer_revision(qid); attempt=await self.service.repo.get_draft_attempt(rev['draft_attempt_id']) if rev and rev['draft_attempt_id'] else None; await self.cards(message,render.review(q,rev,active,attempt['codex_profile'] if attempt else None),self.buttons(q))
  elif q['status']=='CODEX_ERROR':
   attempt=await self.service.repo.get_current_draft_attempt(qid); await self.cards(message,render.codex_error(q,attempt['codex_profile'],attempt['error_type'],attempt['error_message'],active),self.buttons(q))
 async def run_codex(self,message,qid,claim):
  try: await self.service.codex(qid,claim=claim)
  except Exception: pass
  await self.show_codex(message,qid)
 async def _disable(self,query):
  try: await query.message.edit_reply_markup(reply_markup=None)
  except Exception as exc: await self.service.repo.record_error('telegram','UI_EDIT_FAILED',str(exc))
 async def callback(self,u,c):
  query=u.callback_query
  if await self._denied(u): return
  try: x=decode(query.data)
  except ValueError: await query.answer('Invalid action',show_alert=True); return
  action,qid,rid=x['action'],x['question_id'],x['revision_id']
  try:
   if action=='choose_codex':
    await query.answer()
    if x['arg'] in {'codex1','codex2','codex3'}: await self.service.repo.set_active_codex_profile(x['arg']); await query.message.reply_text(f"Активный Codex: {x['arg']}")
    return
   if not qid: raise StaleState('STALE_STATE')
   q=await self.service.repo.get_question(qid)
   if not q: raise StaleState('STALE_STATE')
   if action in {'codex','regenerate','retry_codex'}:
    claim=await self.service.repo.claim_codex(qid,rid if action=='regenerate' else None)
    await query.answer('Codex started')
    await self._disable(query)
    asyncio.create_task(self.run_codex(query.message,qid,claim)); return
   # All non-Codex actions are short. State/revision checks happen before acknowledgement.
   if action=='manual':
    if q['status']=='NEW': await self.service.begin_manual(qid)
    elif q['status']!='MANUAL_INPUT': raise StaleState('STALE_STATE')
    await query.answer(); await self._disable(query); await self.prompt(query.message,await self.service.repo.get_question(qid),'manual_answer')
   elif action=='edit':
    if q['status']=='REVIEW': q=await self.service.begin_edit(qid,rid)
    elif q['status']!='EDITING' or q['current_answer_revision_id']!=rid: raise StaleState('STALE_STATE')
    await query.answer(); await self._disable(query); await self.prompt(query.message,q,'edit_answer',rid)
   elif action=='ignore':
    if rid is not None and (q['status']!='REVIEW' or q['current_answer_revision_id']!=rid): raise StaleState('STALE_STATE')
    await self.service.ignore(qid); await query.answer('Ignored'); await self._disable(query)
   elif action=='send':
    outcome=await self.service.send(qid,rid); await query.answer(); current=await self.service.repo.get_question(qid); rev=await self.service.repo.get_answer_revision(rid); await self.cards(query.message,render.delivery(current,rev,outcome),self.buttons(current)); await self._disable(query)
   elif action=='retry_send':
    outcome=await self.service.retry_send(qid,rid); await query.answer(); current=await self.service.repo.get_question(qid); rev=await self.service.repo.get_answer_revision(rid); await self.cards(query.message,render.delivery(current,rev,outcome),self.buttons(current)); await self._disable(query)
   else: raise StaleState('STALE_STATE')
  except (StaleState,ValueError): await query.answer('This action is stale',show_alert=True)
  except Exception as exc:
   await self.service.repo.record_error('telegram','CALLBACK_ERROR',str(exc)); await query.answer('Action failed',show_alert=True)
 async def reply(self,u,c):
  if await self._denied(u) or not u.message.reply_to_message: return
  try: rid=await self.service.reply(u.message.reply_to_message.message_id,u.message.text)
  except StaleState: return
  rev=await self.service.repo.get_answer_revision(rid); q=await self.service.repo.get_question(rev['question_id']); await self.cards(u.message,render.review(q,rev,await self.service.repo.active_codex_profile()),self.buttons(q))
 async def _tracked(self, method, update, context):
  await method(update,context)
  # Completion is deliberately after the callback returns. Exceptions leave the
  # receipt pending for startup replay.
  await self.service.repo.complete_telegram_update(getattr(update,'update_id',None))
 def handlers(self):
  return [CommandHandler(['questions','codex','errors','status'],lambda u,c:self._tracked(self.command,u,c)),CallbackQueryHandler(lambda u,c:self._tracked(self.callback,u,c)),MessageHandler(filters.REPLY & filters.TEXT,lambda u,c:self._tracked(self.reply,u,c))]
