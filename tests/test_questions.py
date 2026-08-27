import pytest
from app.db.database import connect,init
from app.db.repository import Repository
@pytest.fixture
async def repo(tmp_path):
 d=await connect(tmp_path/'x.db'); await init(d); yield Repository(d); await d.close()
async def add(r,m='ozon',x='abc'):
 return await r.insert_question({'marketplace':m,'external_question_id':x,'question_text':'q'})
async def test_question_insert_generates_public_qid(repo):
 q,i=await add(repo); assert i and q['id']==1 and q['public_id']=='Q-000001' and q['status']=='NEW'
async def test_question_dedup_same_marketplace_external_id(repo):
 a,_=await add(repo); b,i=await add(repo); assert not i and a['id']==b['id']
async def test_question_same_external_id_different_marketplace(repo):
 a,_=await add(repo); b,_=await add(repo,'wildberries'); assert a['public_id']!=b['public_id']
async def test_question_lookup_by_public_id(repo):
 a,_=await add(repo); assert (await repo.get_question_by_public_id(a['public_id']))['id']==a['id']
async def test_list_open_questions_excludes_terminal(repo):
 a,_=await add(repo,'ozon','1'); b,_=await add(repo,'ozon','2'); await repo.db.execute("UPDATE questions SET status='SENT' WHERE id=?",(b['id'],)); await repo.db.commit(); assert [x['id'] for x in await repo.list_open_questions()]==[a['id']]
async def test_unique_constraint_exists(repo):
 await add(repo)
 with pytest.raises(Exception): await repo.db.execute("INSERT INTO questions(marketplace,external_question_id,question_text,status,created_at,updated_at) VALUES('ozon','abc','x','NEW','x','x')")
