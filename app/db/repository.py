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
 async def persist_question_message_id(self,qid,message_id):
  if not isinstance(message_id,int) or message_id <= 0: raise ValueError('positive Telegram message_id required')
  await self.db.execute('UPDATE questions SET telegram_question_message_id=?,telegram_current_message_id=? WHERE id=?',(message_id,message_id,qid)); await self.db.commit()
 async def record_delivery_failure(self,qid,operation,outcome,detail):
  if operation not in {'INITIAL_CARD','MANUAL_PROMPT','EDIT_PROMPT'}: raise ValueError('operation')
  t=now(); await self.db.execute("INSERT INTO telegram_delivery_failures(question_id,operation,outcome,message_id,detail,created_at,updated_at) VALUES(?,?,?,?,?,?,?) ON CONFLICT(question_id,operation) DO UPDATE SET outcome=excluded.outcome,message_id=NULL,detail=excluded.detail,updated_at=excluded.updated_at",(qid,operation,outcome,None,detail,t,t)); await self.db.commit()
 async def clear_delivery_failure(self,qid,operation):
  await self.db.execute('DELETE FROM telegram_delivery_failures WHERE question_id=? AND operation=?',(qid,operation)); await self.db.commit()
 async def get_delivery_failure(self,qid,operation): return await (await self.db.execute('SELECT * FROM telegram_delivery_failures WHERE question_id=? AND operation=?',(qid,operation))).fetchone()
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
 async def active_codex_profile(self):
  r=await (await self.db.execute("SELECT value FROM settings WHERE key='active_codex_profile'")).fetchone(); return r[0] if r else 'codex1'
 async def set_active_codex_profile(self,p):
  if p not in {'codex1','codex2','codex3'}: raise ValueError('invalid profile')
  await self.db.execute("INSERT OR REPLACE INTO settings(key,value,updated_at) VALUES('active_codex_profile',?,?)",(p,now())); await self.db.commit()
 async def create_draft_attempt(self,qid,p):
  if p not in {'codex1','codex2','codex3'}: raise ValueError('invalid profile')
  c=await self.db.execute("INSERT INTO draft_attempts(question_id,codex_profile,status,started_at) VALUES(?,?, 'RUNNING',?)",(qid,p,now())); await self.db.execute('UPDATE questions SET current_draft_attempt_id=? WHERE id=?',(c.lastrowid,qid)); await self.db.commit(); return c.lastrowid
 async def claim_codex(self,qid,expected_revision_id=None):
  await self.db.execute('BEGIN IMMEDIATE'); q=await self.get_question(qid)
  if not q or q['status'] not in {'NEW','REVIEW','CODEX_ERROR'} or (expected_revision_id is not None and (q['status']!='REVIEW' or q['current_answer_revision_id']!=expected_revision_id)):
   await self.db.rollback(); raise StaleState('STALE_STATE')
  profile=await self.active_codex_profile(); c=await self.db.execute("INSERT INTO draft_attempts(question_id,codex_profile,status,started_at) VALUES(?,?, 'RUNNING',?)",(qid,profile,now()))
  changed=await self.db.execute("UPDATE questions SET status='CODEX_RUNNING',current_draft_attempt_id=?,updated_at=? WHERE id=? AND status=?",(c.lastrowid,now(),qid,q['status']))
  if not changed.rowcount: await self.db.rollback(); raise StaleState('STALE_STATE')
  await self.db.commit(); return c.lastrowid,profile
 async def get_draft_attempt(self,i): return await (await self.db.execute('SELECT * FROM draft_attempts WHERE id=?',(i,))).fetchone()
 async def get_current_draft_attempt(self,qid): return await (await self.db.execute('SELECT d.* FROM draft_attempts d JOIN questions q ON q.current_draft_attempt_id=d.id WHERE q.id=?',(qid,))).fetchone()
 async def finish_draft_success(self,i,text): await self.db.execute("UPDATE draft_attempts SET status='SUCCESS',answer_text=?,finished_at=? WHERE id=?",(text,now(),i)); await self.db.commit()
 async def finish_draft_error(self,i,typ,msg): await self.db.execute("UPDATE draft_attempts SET status='ERROR',error_type=?,error_message=?,finished_at=? WHERE id=?",(typ,msg,now(),i)); await self.db.commit()
 async def create_telegram_input(self,msg,qid,mode,based=None,expires='2999-01-01T00:00:00+00:00'):
  if mode not in {'manual_answer','edit_answer'}: raise ValueError('mode')
  await self.db.execute('INSERT INTO telegram_inputs VALUES(?,?,?,?,?,?)',(msg,qid,mode,based,now(),expires)); await self.db.commit()
 async def get_telegram_input(self,msg): return await (await self.db.execute('SELECT * FROM telegram_inputs WHERE telegram_prompt_message_id=?',(msg,))).fetchone()
 async def get_telegram_input_for(self,qid,mode): return await (await self.db.execute('SELECT * FROM telegram_inputs WHERE question_id=? AND mode=?',(qid,mode))).fetchone()
 async def consume_telegram_input(self,msg):
  # DELETE ... RETURNING makes duplicate/replayed replies consume exactly once.
  c=await self.db.execute('DELETE FROM telegram_inputs WHERE telegram_prompt_message_id=? RETURNING *',(msg,)); r=await c.fetchone(); await self.db.commit(); return r
 async def consume_reply(self,msg,text):
  """Atomically consume a prompt and create its revision/state transition."""
  await self.db.execute('BEGIN IMMEDIATE')
  inp=await (await self.db.execute('DELETE FROM telegram_inputs WHERE telegram_prompt_message_id=? RETURNING *',(msg,))).fetchone()
  if not inp: await self.db.rollback(); raise StaleState('STALE_STATE')
  q=await self.get_question(inp['question_id']); expected='MANUAL_INPUT' if inp['mode']=='manual_answer' else 'EDITING'
  if not q or q['status']!=expected: await self.db.rollback(); raise StaleState('STALE_STATE')
  c=await self.db.execute('INSERT INTO answer_revisions(question_id,source,text,based_on_revision_id,created_at) VALUES(?,?,?,?,?)',(q['id'],'manual' if inp['mode']=='manual_answer' else 'edited',text,inp['based_on_revision_id'],now()))
  rid=c.lastrowid
  await self.db.execute('UPDATE questions SET current_answer_revision_id=?,status=?,updated_at=? WHERE id=? AND status=?',(rid,'REVIEW',now(),q['id'],expected))
  await self.db.commit(); return rid
 async def receipt_telegram_update(self,update_id,update_json):
  await self.db.execute('INSERT OR IGNORE INTO telegram_updates(update_id,update_json,received_at) VALUES(?,?,?)',(update_id,update_json,now())); await self.db.commit()
 async def complete_telegram_update(self,update_id):
  if update_id is not None: await self.db.execute('UPDATE telegram_updates SET completed_at=? WHERE update_id=?',(now(),update_id)); await self.db.commit()
 async def pending_telegram_updates(self): return await (await self.db.execute('SELECT * FROM telegram_updates WHERE completed_at IS NULL ORDER BY update_id')).fetchall()
 async def record_error(self,component,typ,msg):
  fp='|'.join((component,typ,msg.strip().lower())); t=now(); await self.db.execute("INSERT INTO recent_errors(component,error_type,message,fingerprint,first_seen_at,last_seen_at,occurrence_count) VALUES(?,?,?,?,?,?,1) ON CONFLICT(fingerprint) DO UPDATE SET occurrence_count=occurrence_count+1,last_seen_at=excluded.last_seen_at",(component,typ,msg,fp,t,t)); await self.db.commit()
 async def recent_errors(self): return await (await self.db.execute('SELECT * FROM recent_errors ORDER BY id DESC')).fetchall()
 async def cleanup_retention(self,days=5,at=None):
  cutoff=(at or datetime.now(timezone.utc)).timestamp()-days*86400
  iso=datetime.fromtimestamp(cutoff,timezone.utc).isoformat(); counts={}
  for key,sql in {
   'attempts':"DELETE FROM draft_attempts WHERE finished_at<? AND status IN ('SUCCESS','ERROR') AND id NOT IN (SELECT COALESCE(current_draft_attempt_id,-1) FROM questions)",
   'revisions':"DELETE FROM answer_revisions WHERE created_at<? AND id NOT IN (SELECT COALESCE(current_answer_revision_id,-1) FROM questions)",
   'inputs':"DELETE FROM telegram_inputs WHERE expires_at<?",
   'errors':"DELETE FROM recent_errors WHERE last_seen_at<?"}.items():
   c=await self.db.execute(sql,(iso,)); counts[key]=c.rowcount
  await self.db.commit(); return counts
