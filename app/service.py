from app.state_machine import StaleState
class QuestionService:
 def __init__(self,repo,adapters,transport): self.repo,self.adapters,self.transport,self.busy=repo,adapters,transport,set()
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
  await self.repo.mark_send_unknown(qid); return 'SEND_UNKNOWN'
