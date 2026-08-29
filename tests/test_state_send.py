import pytest
from app.db.database import connect,init
from app.db.repository import Repository
from app.state_machine import StaleState
@pytest.fixture
async def r(tmp_path):
 d=await connect(tmp_path/'x.db'); await init(d); x=Repository(d); q,_=await x.insert_question({'marketplace':'ozon','external_question_id':'x','question_text':'q'}); yield x,q; await d.close()
async def review(x,q,text='old'):
 rid=await x.create_answer_revision(q['id'],'manual',text); await x.set_current_answer_revision(q['id'],rid); await x.transition(q['id'],'NEW','MANUAL_INPUT'); await x.transition(q['id'],'MANUAL_INPUT','REVIEW'); return rid
async def test_answer_revision_is_immutable(r):
 x,q=r; a=await review(x,q); b=await x.create_answer_revision(q['id'],'edited','new',based_on_revision_id=a); await x.set_current_answer_revision(q['id'],b); assert (await x.get_answer_revision(a))['text']=='old'
async def test_claim_send_returns_exact_bound_revision(r): x,q=r; a=await review(x,q); assert (await x.claim_send(q['id'],a))['text']=='old'
async def test_stale_and_cross_rejected(r):
 x,q=r; a=await review(x,q); b=await x.create_answer_revision(q['id'],'edited','new'); await x.set_current_answer_revision(q['id'],b)
 with pytest.raises(StaleState): await x.claim_send(q['id'],a)
async def test_double_send_and_completion(r):
 x,q=r; a=await review(x,q); await x.claim_send(q['id'],a)
 with pytest.raises(StaleState): await x.claim_send(q['id'],a)
 await x.mark_sent(q['id'],'reply'); z=await x.get_question(q['id']); assert z['status']=='SENT' and z['external_reply_id']=='reply'

async def test_send_unknown_cannot_transition_to_sending_and_external_is_terminal(r):
 x,q=r; a=await review(x,q); await x.claim_send(q['id'],a); await x.mark_send_unknown(q['id'])
 assert not __import__('app.state_machine', fromlist=['allowed']).allowed('SEND_UNKNOWN','SENDING')
 await x.mark_answered_externally(q['id'], 'SEND_UNKNOWN')
 assert (await x.get_question(q['id']))['status']=='ANSWERED_EXTERNALLY'
