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
 d=await connect(tmp_path/'x'); await init(d); r=Repository(d); t=T(); a=A([{'marketplace':'ozon','external_question_id':'x','question_text':'q'}]); s=QuestionService(r,{'ozon':a},t); await s.poll('ozon'); q=t.cards[0]; await s.manual(q['id'],10); rid=await s.reply(10,'answer'); assert await s.send(q['id'],rid)=='SENT' and a.writes==['answer']; await d.close()
