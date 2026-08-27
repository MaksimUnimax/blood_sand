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
 async def transition(self,qid,expected,new):
  if not allowed(expected,new): raise StaleState('STALE_STATE')
  c=await self.db.execute('UPDATE questions SET status=?,updated_at=? WHERE id=? AND status=?',(new,now(),qid,expected)); await self.db.commit()
  if not c.rowcount: raise StaleState('STALE_STATE')
