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

class Wb(A):
 def __init__(s,outcomes,write='ACCEPTED_UNVERIFIED'): super().__init__(status=write); s.outcomes=list(outcomes); s.reads=0
 async def inspect_answer(s,q,t): s.reads+=1; return s.outcomes.pop(0)
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

async def prepared_service(tmp_path, outcomes, write='ACCEPTED_UNVERIFIED'):
 d=await connect(tmp_path/'x'); await init(d); r=Repository(d); q,_=await r.insert_question({'marketplace':'wildberries','external_question_id':'x','question_text':'q'}); rid=await r.create_answer_revision(q['id'],'manual',' exact '); await r.set_current_answer_revision(q['id'],rid); await r.transition(q['id'],'NEW','MANUAL_INPUT'); await r.transition(q['id'],'MANUAL_INPUT','REVIEW'); a=Wb(outcomes,write); return d,r,q,rid,a,QuestionService(r,{'wildberries':a},T())

@pytest.mark.asyncio
@pytest.mark.parametrize('preflight,final,writes,status', [('MATCHED',None,0,'SENT'),('DIFFERENT',None,0,'ANSWERED_EXTERNALLY'),('UNKNOWN',None,0,'SEND_FAILED'),('ABSENT','MATCHED',1,'SENT'),('ABSENT','ABSENT',1,'SEND_UNKNOWN'),('ABSENT','UNKNOWN',1,'SEND_UNKNOWN'),('ABSENT','DIFFERENT',1,'ANSWERED_EXTERNALLY')])
async def test_wb_preflight_and_readback_semantics(tmp_path,preflight,final,writes,status):
 d,r,q,rid,a,s=await prepared_service(tmp_path,[preflight]+([final] if final else [])); assert await s.send(q['id'],rid)==status; assert len(a.writes)==writes; await d.close()

@pytest.mark.asyncio
@pytest.mark.parametrize('readback,status', [('MATCHED','SENT'),('ABSENT','SEND_UNKNOWN'),('UNKNOWN','SEND_UNKNOWN')])
async def test_ambiguous_write_reads_once_never_retries(tmp_path,readback,status):
 d,r,q,rid,a,s=await prepared_service(tmp_path,['ABSENT',readback],'AMBIGUOUS'); assert await s.send(q['id'],rid)==status; assert a.writes==[' exact ']; await d.close()

@pytest.mark.asyncio
async def test_clear_failure_is_retryable(tmp_path):
 d,r,q,rid,a,s=await prepared_service(tmp_path,['ABSENT'],'CLEAR_FAILURE'); assert await s.send(q['id'],rid)=='SEND_FAILED'; assert await s.claim_retry_send(q['id'],rid); await d.close()
