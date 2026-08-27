import pytest
from app.db.database import connect,init
from app.db.repository import Repository
@pytest.fixture
async def r(tmp_path):
 d=await connect(tmp_path/'x.db'); await init(d); x=Repository(d); q,_=await x.insert_question({'marketplace':'ozon','external_question_id':'x','question_text':'q'}); yield x,q; await d.close()
async def test_active_codex_profile_default_and_switch(r): x,q=r; assert await x.active_codex_profile()=='codex1'; await x.set_active_codex_profile('codex2'); assert await x.active_codex_profile()=='codex2'
async def test_invalid_codex_profile_rejected(r):
 with pytest.raises(ValueError): await r[0].set_active_codex_profile('bad')
async def test_draft_attempt_captures_profile_immutably(r):
 x,q=r; a=await x.create_draft_attempt(q['id'],'codex1'); await x.set_active_codex_profile('codex2'); assert (await x.get_draft_attempt(a))['codex_profile']=='codex1'
async def test_retry_uses_new_active_profile_same_question(r):
 x,q=r; a=await x.create_draft_attempt(q['id'],'codex1'); await x.set_active_codex_profile('codex2'); b=await x.create_draft_attempt(q['id'],await x.active_codex_profile()); assert (await x.get_draft_attempt(b))['question_id']==q['id'] and (await x.get_draft_attempt(b))['codex_profile']=='codex2'
async def test_draft_success_and_error(r):
 x,q=r; a=await x.create_draft_attempt(q['id'],'codex1'); await x.finish_draft_success(a,'answer'); assert (await x.get_draft_attempt(a))['answer_text']=='answer'; b=await x.create_draft_attempt(q['id'],'codex1'); await x.finish_draft_error(b,'LIMIT','limit'); assert (await x.get_draft_attempt(b))['error_type']=='LIMIT'
async def test_telegram_and_errors(r):
 x,q=r; q2,_=await x.insert_question({'marketplace':'wb','external_question_id':'y','question_text':'y'}); await x.create_telegram_input(1,q['id'],'manual_answer'); await x.create_telegram_input(2,q2['id'],'edit_answer'); assert (await x.consume_telegram_input(1))['question_id']==q['id'] and await x.get_telegram_input(1) is None; await x.record_error('poll','X','bad'); await x.record_error('poll','X','bad'); assert len(await x.recent_errors())==1 and (await x.recent_errors())[0]['occurrence_count']==2
