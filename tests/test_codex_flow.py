import pytest
from app.db.database import connect,init
from app.db.repository import Repository
from app.service import QuestionService
from app.codex.prompt_builder import PromptBuilder
from app.state_machine import StaleState, allowed
class R:
 async def run(self,prompt,profile,job): return 'draft'
class T: pass
@pytest.mark.asyncio
async def test_codex_fake_success(tmp_path):
 d=await connect(tmp_path/'x'); await init(d); r=Repository(d); q,_=await r.insert_question({'marketplace':'ozon','external_question_id':'x','question_text':'date 12'}); p=tmp_path/'p'; p.mkdir(); (p/'base.md').write_text('base'); (p/'references.md').write_text('refs'); s=QuestionService(r,{},T(),R(),PromptBuilder(p,p)); rid=await s.codex(q['id']); assert (await r.get_answer_revision(rid))['text']=='draft' and (await r.get_question(q['id']))['status']=='REVIEW'; await d.close()

@pytest.mark.asyncio
async def test_review_codex_regeneration_is_revision_bound_and_preserves_history(tmp_path):
 d=await connect(tmp_path/'x'); await init(d); r=Repository(d); q,_=await r.insert_question({'marketplace':'wildberries','external_question_id':'regen','question_text':'q'})
 r1=await r.create_answer_revision(q['id'],'manual','old'); await r.set_current_answer_revision(q['id'],r1); await r.transition(q['id'],'NEW','MANUAL_INPUT'); await r.transition(q['id'],'MANUAL_INPUT','REVIEW'); await r.set_active_codex_profile('codex2')
 assert allowed('REVIEW','CODEX_RUNNING')
 aid,profile=await r.claim_codex(q['id'],r1); current=await r.get_question(q['id']); assert profile=='codex2' and current['status']=='CODEX_RUNNING' and current['current_answer_revision_id']==r1
 with pytest.raises(StaleState): await r.claim_codex(q['id'],r1)
 await r.finish_draft_success(aid,'new'); r2=await r.create_answer_revision(q['id'],'codex','new',draft_attempt_id=aid); await r.set_current_answer_revision(q['id'],r2); await r.transition(q['id'],'CODEX_RUNNING','REVIEW')
 assert (await r.get_answer_revision(r1))['text']=='old' and (await r.get_question(q['id']))['current_answer_revision_id']==r2
 with pytest.raises(StaleState): await r.claim_codex(q['id'],r1)
 await d.close()
