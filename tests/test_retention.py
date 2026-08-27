from datetime import datetime,timezone,timedelta
import pytest
from app.db.database import connect,init
from app.db.repository import Repository
@pytest.fixture
async def r(tmp_path):
 d=await connect(tmp_path/'x.db'); await init(d); x=Repository(d); q,_=await x.insert_question({'marketplace':'o','external_question_id':'x','question_text':'q'}); yield x,q; await d.close()
async def old(x,table,column='created_at',age=6):
 await x.db.execute(f"UPDATE {table} SET {column}=?",((datetime.now(timezone.utc)-timedelta(days=age)).isoformat(),)); await x.db.commit()
async def test_retention_keeps_4d23h_rows(r):
 x,q=r; a=await x.create_draft_attempt(q['id'],'codex1'); await x.finish_draft_success(a,'a'); await old(x,'draft_attempts','finished_at',4.958); assert (await x.cleanup_retention())['attempts']==0
async def test_retention_removes_safe_rows_older_than_5_days(r):
 x,q=r; a=await x.create_draft_attempt(q['id'],'codex1'); await x.finish_draft_success(a,'a'); await x.create_draft_attempt(q['id'],'codex1'); await old(x,'draft_attempts','finished_at'); assert (await x.cleanup_retention())['attempts']==1
async def test_retention_preserves_current_revision_and_attempt(r):
 x,q=r; rid=await x.create_answer_revision(q['id'],'manual','x'); await x.set_current_answer_revision(q['id'],rid); a=await x.create_draft_attempt(q['id'],'codex1'); await x.finish_draft_success(a,'x'); await old(x,'answer_revisions'); await old(x,'draft_attempts','finished_at'); await x.cleanup_retention(); assert await x.get_answer_revision(rid) and await x.get_draft_attempt(a)
async def test_retention_removes_expired_telegram_inputs_and_errors(r):
 x,q=r; await x.create_telegram_input(9,q['id'],'manual_answer',expires='2000-01-01T00:00:00+00:00'); await x.record_error('x','y','z'); await old(x,'recent_errors','last_seen_at'); c=await x.cleanup_retention(); assert c['inputs']==1 and c['errors']==1
