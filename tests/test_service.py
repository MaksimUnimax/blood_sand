import pytest
from app.db.database import connect,init
from app.db.repository import Repository
from app.service import QuestionService
class T:
 def __init__(s): s.cards=[]
 async def question(s,q): s.cards.append(q); return len(s.cards)
class A:
 def __init__(s,qs=[],status='SUCCESS'): s.qs,s.status,s.writes=qs,status,[]
 async def fetch_unanswered_questions(s): return s.qs
 async def send_answer(s,q,t): s.writes.append(t); return {'status':s.status,'answer_id':'x'}
@pytest.mark.asyncio
async def test_manual_e2e(tmp_path):
 d=await connect(tmp_path/'x'); await init(d); r=Repository(d); t=T(); a=A([{'marketplace':'ozon','external_question_id':'x','question_text':'q'}]); s=QuestionService(r,{'ozon':a},t); await s.poll('ozon'); q=t.cards[0]; await s.manual(q['id'],10); rid=await s.ordinary_text('answer'); assert await s.send(q['id'],rid)=='SENT' and a.writes==['answer']; await d.close()
@pytest.mark.asyncio
async def test_poll_failure_does_not_block_other(tmp_path):
 d=await connect(tmp_path/'x'); await init(d); r=Repository(d); t=T(); bad=A()
 async def fail(): raise RuntimeError('x')
 bad.fetch_unanswered_questions=fail
 good=A([{'marketplace':'wildberries','external_question_id':'x','question_text':'q'}])
 s=QuestionService(r,{'ozon':bad,'wildberries':good},t); z=await s.poll_all()
 assert isinstance(z['ozon'],Exception) and len(t.cards)==1; await d.close()
