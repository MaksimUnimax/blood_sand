from datetime import datetime,timezone
from app.state_machine import allowed,StaleState
def now(): return datetime.now(timezone.utc).isoformat()
class Repository:
 def __init__(self,db): self.db=db
 async def insert_question(self,q):
  t=now(); c=await self.db.execute("INSERT OR IGNORE INTO questions(marketplace,external_question_id,question_text,status,created_at,updated_at) VALUES(?,?,?,'NEW',?,?)",(q['marketplace'],str(q['external_question_id']),q['question_text'],t,t))
  if c.rowcount:
   await self.db.execute('UPDATE questions SET public_id=? WHERE id=?',(f'Q-{c.lastrowid:06d}',c.lastrowid)); await self.db.commit(); return c.lastrowid,True
  r=await (await self.db.execute('SELECT id FROM questions WHERE marketplace=? AND external_question_id=?',(q['marketplace'],str(q['external_question_id'])))).fetchone(); return r[0],False
 async def transition(self,qid,expected,new):
  if not allowed(expected,new): raise StaleState('STALE_STATE')
  c=await self.db.execute('UPDATE questions SET status=?,updated_at=? WHERE id=? AND status=?',(new,now(),qid,expected)); await self.db.commit()
  if not c.rowcount: raise StaleState('STALE_STATE')
