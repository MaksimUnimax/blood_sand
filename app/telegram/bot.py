from telegram.ext import CommandHandler,CallbackQueryHandler,MessageHandler,filters
from app.telegram.callbacks import decode
class OperatorBot:
 def __init__(self,operator_user_id,service): self.operator_user_id,self.service=operator_user_id,service
 def authorized(self,user_id): return str(user_id)==str(self.operator_user_id)
 async def command(self,u,c):
  if not self.authorized(u.effective_user.id): return
  if u.message.text.startswith('/codex'): await u.message.reply_text('🤖 CODEX: '+await self.service.repo.active_codex_profile())
  elif u.message.text.startswith('/status'): await u.message.reply_text('DB available')
  else: await u.message.reply_text('Operator command accepted')
 async def callback(self,u,c):
  if not self.authorized(u.effective_user.id): return
  try: x=decode(u.callback_query.data)
  except ValueError: return
  if x['action']=='ignore': await self.service.ignore(x['question_id'])
  elif x['action']=='codex': await u.callback_query.message.reply_text('Codex generation will be enabled in the next integration stage.')
  elif x['action']=='choose_codex': await self.service.repo.set_active_codex_profile(x['arg'])
 async def reply(self,u,c):
  if not self.authorized(u.effective_user.id) or not u.message.reply_to_message: return
  await self.service.reply(u.message.reply_to_message.message_id,u.message.text)
 def handlers(self): return [CommandHandler(['questions','codex','errors','status'],self.command),CallbackQueryHandler(self.callback),MessageHandler(filters.REPLY & filters.TEXT,self.reply)]
