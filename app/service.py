from app.state_machine import StaleState
import asyncio
class QuestionService:
 def __init__(self,repo,adapters,transport,runner=None,prompts=None): self.repo,self.adapters,self.transport,self.runner,self.prompts,self.busy=repo,adapters,transport,runner,prompts,set()
 async def poll(self,name):
  if name in self.busy: return False
  self.busy.add(name)
  try:
   for raw in await self.adapters[name].fetch_unanswered_questions():
    q,new=await self.repo.insert_question(raw)
    if new:
     mid=await self.transport.question(q); await self.repo.db.execute('UPDATE questions SET telegram_question_message_id=? WHERE id=?',(mid,q['id'])); await self.repo.db.commit()
   return True
  finally: self.busy.discard(name)
 async def manual(self,qid,prompt_id):
  await self.repo.transition(qid,'NEW','MANUAL_INPUT'); await self.repo.create_telegram_input(prompt_id,qid,'manual_answer')
 async def edit(self,qid,prompt_id):
  q=await self.repo.get_question(qid); await self.repo.transition(qid,'REVIEW','EDITING'); await self.repo.create_telegram_input(prompt_id,qid,'edit_answer',q['current_answer_revision_id'])
 async def reply(self,prompt_id,text):
  inp=await self.repo.consume_telegram_input(prompt_id)
  if not inp: raise StaleState('STALE_STATE')
  q=await self.repo.get_question(inp['question_id']); rid=await self.repo.create_answer_revision(q['id'],'manual' if inp['mode']=='manual_answer' else 'edited',text,based_on_revision_id=inp['based_on_revision_id']); await self.repo.set_current_answer_revision(q['id'],rid); await self.repo.transition(q['id'],'MANUAL_INPUT' if inp['mode']=='manual_answer' else 'EDITING','REVIEW'); return rid
 async def ignore(self,qid):
  q=await self.repo.get_question(qid); await self.repo.transition(qid,q['status'],'IGNORED')
 async def send(self,qid,rid):
  rev=await self.repo.claim_send(qid,rid); q=await self.repo.get_question(qid); result=await self.adapters[q['marketplace']].send_answer(q,rev['text'])
  if result['status']=='SUCCESS': await self.repo.mark_sent(qid,result.get('answer_id')); return 'SENT'
  if result['status']=='CLEAR_FAILURE': await self.repo.mark_send_failed(qid); return 'SEND_FAILED'
  await self.repo.mark_send_unknown(qid); outcome=await self.adapters[q['marketplace']].reconcile_answer(q,rev['text'],None)
  if outcome=='MATCHED': await self.repo.transition(qid,'SEND_UNKNOWN','SENT',{'sent_at':__import__('app.db.repository',fromlist=['now']).now()}); return 'SENT'
  return 'SEND_UNKNOWN' if outcome=='UNKNOWN' else 'NOT_FOUND'
 async def retry_send(self,qid,rid):
  q=await self.repo.get_question(qid)
  if q['status']=='SEND_FAILED': await self.repo.transition(qid,'SEND_FAILED','REVIEW')
  elif q['status']=='SEND_UNKNOWN': await self.repo.transition(qid,'SEND_UNKNOWN','REVIEW')
  else: raise StaleState('STALE_STATE')
  return await self.send(qid,rid)
 async def codex(self,qid):
  q=await self.repo.get_question(qid)
  if not q or q['status'] not in {'NEW','REVIEW','CODEX_ERROR'}: raise StaleState('STALE_STATE')
  profile=await self.repo.active_codex_profile(); await self.repo.transition(qid,q['status'],'CODEX_RUNNING'); aid=await self.repo.create_draft_attempt(qid,profile)
  try:
   text=await self.runner.run(profile,self.prompts.build(q),str(aid)); current=await self.repo.get_question(qid)
   if current['current_draft_attempt_id']!=aid or current['status']!='CODEX_RUNNING': return None
   await self.repo.finish_draft_success(aid,text); rid=await self.repo.create_answer_revision(qid,'codex',text,draft_attempt_id=aid); await self.repo.set_current_answer_revision(qid,rid); await self.repo.transition(qid,'CODEX_RUNNING','REVIEW'); return rid
  except Exception as e:
   current=await self.repo.get_question(qid)
   if current['current_draft_attempt_id']==aid and current['status']=='CODEX_RUNNING': await self.repo.finish_draft_error(aid,getattr(e,'kind','PROCESS_ERROR'),str(e)); await self.repo.transition(qid,'CODEX_RUNNING','CODEX_ERROR')
   raise
 async def poll_all(self):
  results=await asyncio.gather(*(self.poll(n) for n in self.adapters),return_exceptions=True); return dict(zip(self.adapters,results))
