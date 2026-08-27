import pytest
from app.db.database import connect,init
from app.db.repository import Repository
from app.service import QuestionService
from app.codex.prompt_builder import PromptBuilder
class R:
 async def run(self,prompt,profile,job): return 'draft'
class T: pass
@pytest.mark.asyncio
async def test_codex_fake_success(tmp_path):
 d=await connect(tmp_path/'x'); await init(d); r=Repository(d); q,_=await r.insert_question({'marketplace':'ozon','external_question_id':'x','question_text':'date 12'}); p=tmp_path/'p'; p.mkdir(); (p/'base.md').write_text('base'); (p/'references.md').write_text('refs'); s=QuestionService(r,{},T(),R(),PromptBuilder(p,p)); rid=await s.codex(q['id']); assert (await r.get_answer_revision(rid))['text']=='draft' and (await r.get_question(q['id']))['status']=='REVIEW'; await d.close()
