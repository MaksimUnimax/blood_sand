from datetime import datetime,timezone
from app.state_machine import allowed,StaleState
def now(): return datetime.now(timezone.utc).isoformat()
class Repository:
 def __init__(self,db): self.db=db
 async def insert_question(self,q):
  t=now(); c=await self.db.execute("INSERT OR IGNORE INTO questions(marketplace,external_question_id,product_id,product_article,product_title,question_text,question_created_at,raw_status,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?, 'NEW',?,?)",(q['marketplace'],str(q['external_question_id']),q.get('product_id'),q.get('product_article'),q.get('product_title'),q['question_text'],q.get('question_created_at'),q.get('raw_status'),t,t))
  if c.rowcount:
   await self.db.execute('UPDATE questions SET public_id=? WHERE id=?',(f'Q-{c.lastrowid:06d}',c.lastrowid)); await self.db.commit(); return await self.get_question(c.lastrowid),True
  r=await (await self.db.execute('SELECT id FROM questions WHERE marketplace=? AND external_question_id=?',(q['marketplace'],str(q['external_question_id'])))).fetchone(); return await self.get_question(r[0]),False
 async def get_question(self,i): return await (await self.db.execute('SELECT * FROM questions WHERE id=?',(i,))).fetchone()
 async def get_question_by_public_id(self,p): return await (await self.db.execute('SELECT * FROM questions WHERE public_id=?',(p,))).fetchone()
 async def list_open_questions(self): return await (await self.db.execute("SELECT * FROM questions WHERE status NOT IN ('SENT','IGNORED') ORDER BY id DESC")).fetchall()
 async def transition(self,qid,expected,new,mutation_fields=None):
  if not allowed(expected,new): raise StaleState('STALE_STATE')
  mutation_fields=mutation_fields or {}; sets=['status=?','updated_at=?']; values=[new,now()]
  for key,value in mutation_fields.items(): sets.append(key+'=?'); values.append(value)
  c=await self.db.execute('UPDATE questions SET '+','.join(sets)+' WHERE id=? AND status=?',values+[qid,expected]); await self.db.commit()
  if not c.rowcount: raise StaleState('STALE_STATE')
 async def create_answer_revision(self,qid,source,text,draft_attempt_id=None,based_on_revision_id=None):
  if source not in {'manual','codex','edited'}: raise ValueError('source')
  c=await self.db.execute('INSERT INTO answer_revisions(question_id,source,text,draft_attempt_id,based_on_revision_id,created_at) VALUES(?,?,?,?,?,?)',(qid,source,text,draft_attempt_id,based_on_revision_id,now())); await self.db.commit(); return c.lastrowid
 async def get_answer_revision(self,rid): return await (await self.db.execute('SELECT * FROM answer_revisions WHERE id=?',(rid,))).fetchone()
 async def set_current_answer_revision(self,qid,rid):
  r=await self.get_answer_revision(rid)
  if not r or r['question_id']!=qid: raise StaleState('STALE_STATE')
  await self.db.execute('UPDATE questions SET current_answer_revision_id=? WHERE id=?',(rid,qid)); await self.db.commit()
 async def get_current_answer_revision(self,qid):
  return await (await self.db.execute('SELECT r.* FROM answer_revisions r JOIN questions q ON q.current_answer_revision_id=r.id WHERE q.id=?',(qid,))).fetchone()
 async def claim_send(self,qid,rid):
  await self.db.execute('BEGIN IMMEDIATE'); q=await self.get_question(qid); r=await self.get_answer_revision(rid)
  if not q or not r or q['status']!='REVIEW' or q['current_answer_revision_id']!=rid or r['question_id']!=qid: await self.db.rollback(); raise StaleState('STALE_STATE')
  c=await self.db.execute("UPDATE questions SET status='SENDING',updated_at=? WHERE id=? AND status='REVIEW'",(now(),qid))
  if not c.rowcount: await self.db.rollback(); raise StaleState('STALE_STATE')
  await self.db.commit(); return r
 async def mark_sent(self,qid,reply): await self.transition(qid,'SENDING','SENT',{'external_reply_id':reply,'sent_at':now()})
 async def mark_send_failed(self,qid): await self.transition(qid,'SENDING','SEND_FAILED')
 async def mark_send_unknown(self,qid): await self.transition(qid,'SENDING','SEND_UNKNOWN')
