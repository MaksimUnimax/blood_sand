"""The python-telegram-bot edge. Business decisions stay in QuestionService."""
import asyncio

from telegram import InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import CallbackQueryHandler, CommandHandler, MessageHandler, filters

from app.state_machine import StaleState
from app.telegram.callbacks import decode, encode
from app.telegram import render


class OperatorBot:
 def __init__(self,operator_user_id,service): self.operator_user_id,self.service=str(operator_user_id),service
 def authorized(self,user_id): return str(user_id)==self.operator_user_id
 async def _denied(self,u):
  if u.effective_user and self.authorized(u.effective_user.id): return False
  if getattr(u,'callback_query',None): await u.callback_query.answer('Access denied',show_alert=True)
  elif getattr(u,'message',None): await u.message.reply_text('Access denied')
  return True
 def buttons(self,q,state=None):
  state=state or q['status']; qid=q['id']
  if state=='NEW': rows=[[InlineKeyboardButton('✍️ Ответить самому',callback_data=encode('manual',qid)),InlineKeyboardButton('🤖 Отправить в Codex',callback_data=encode('codex',qid))],[InlineKeyboardButton('🚫 Игнорировать',callback_data=encode('ignore',qid))]]
  elif state=='REVIEW': rows=[[InlineKeyboardButton('✅ Отправить',callback_data=encode('send',qid,q['current_answer_revision_id'])),InlineKeyboardButton('✏️ Редактировать',callback_data=encode('edit',qid))],[InlineKeyboardButton('🔄 Сгенерировать заново',callback_data=encode('regenerate',qid)),InlineKeyboardButton('🚫 Игнорировать',callback_data=encode('ignore',qid))]]
  elif state=='CODEX_ERROR': rows=[[InlineKeyboardButton('🔄 Повторить',callback_data=encode('retry_codex',qid)),InlineKeyboardButton('🤖 Сменить Codex',callback_data=encode('choose_codex',qid,arg='menu'))],[InlineKeyboardButton('✍️ Ответить самому',callback_data=encode('manual',qid)),InlineKeyboardButton('🚫 Игнорировать',callback_data=encode('ignore',qid))]]
  elif state=='SEND_FAILED': rows=[[InlineKeyboardButton('🔄 Повторить отправку',callback_data=encode('retry_send',qid,q['current_answer_revision_id']))]]
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
 async def prompt(self,message,q,mode):
  current=await self.service.repo.get_current_answer_revision(q['id']); extra=f"\n\nТекущий ответ:\n{current['text']}" if mode=='edit_answer' and current else ''
  sent=await message.reply_text(f"ID: {q['public_id']}\nMarketplace: {q['marketplace']}\n\nВопрос:\n{q['question_text']}{extra}\n\nОтветьте Reply на ЭТО сообщение.")
  if mode=='manual_answer': await self.service.manual(q['id'],sent.message_id)
  else: await self.service.edit(q['id'],sent.message_id)
 async def show_codex(self,message,qid):
  q=await self.service.repo.get_question(qid); active=await self.service.repo.active_codex_profile()
  if q['status']=='REVIEW':
   rev=await self.service.repo.get_current_answer_revision(qid); attempt=await self.service.repo.get_draft_attempt(rev['draft_attempt_id']) if rev and rev['draft_attempt_id'] else None; await self.cards(message,render.review(q,rev,active,attempt['codex_profile'] if attempt else None),self.buttons(q))
  elif q['status']=='CODEX_ERROR':
   attempt=await self.service.repo.get_current_draft_attempt(qid); await self.cards(message,render.codex_error(q,attempt['codex_profile'],attempt['error_type'],attempt['error_message'],active),self.buttons(q))
 async def run_codex(self,message,qid):
  try: await self.service.codex(qid)
  except Exception: pass
  await self.show_codex(message,qid)
 async def callback(self,u,c):
  if await self._denied(u): return
  query=u.callback_query
  try: x=decode(query.data)
  except ValueError: await query.answer('Invalid action',show_alert=True); return
  await query.answer(); action,qid=x['action'],x['question_id']
  try:
   if action=='choose_codex':
    if x['arg'] in {'codex1','codex2','codex3'}: await self.service.repo.set_active_codex_profile(x['arg']); await query.message.reply_text(f"Активный Codex: {x['arg']}")
    return
   if not qid: return
   q=await self.service.repo.get_question(qid)
   if not q: return
   if action=='manual': await self.prompt(query.message,q,'manual_answer')
   elif action=='edit': await self.prompt(query.message,q,'edit_answer')
   elif action=='ignore': await self.service.ignore(qid); await query.message.reply_text(f"{q['public_id']}: ignored locally")
   elif action in {'codex','regenerate','retry_codex'}: asyncio.create_task(self.run_codex(query.message,qid))
   elif action=='send':
    outcome=await self.service.send(qid,x['revision_id']); current=await self.service.repo.get_question(qid); rev=await self.service.repo.get_answer_revision(x['revision_id']); await self.cards(query.message,render.delivery(current,rev,outcome),self.buttons(current))
   elif action=='retry_send':
    outcome=await self.service.retry_send(qid,x['revision_id']); current=await self.service.repo.get_question(qid); rev=await self.service.repo.get_answer_revision(x['revision_id']); await self.cards(query.message,render.delivery(current,rev,outcome),self.buttons(current))
  except (StaleState,ValueError): await query.answer('This action is stale',show_alert=True)
 async def reply(self,u,c):
  if await self._denied(u) or not u.message.reply_to_message: return
  try: rid=await self.service.reply(u.message.reply_to_message.message_id,u.message.text)
  except StaleState: return
  rev=await self.service.repo.get_answer_revision(rid); q=await self.service.repo.get_question(rev['question_id']); await self.cards(u.message,render.review(q,rev,await self.service.repo.active_codex_profile()),self.buttons(q))
 def handlers(self): return [CommandHandler(['questions','codex','errors','status'],self.command),CallbackQueryHandler(self.callback),MessageHandler(filters.REPLY & filters.TEXT,self.reply)]
