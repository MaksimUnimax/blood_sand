import httpx,pytest
from app.marketplaces.wildberries import WildberriesAdapter
@pytest.mark.asyncio
async def test_wb_adapter():
 seen=[]
 async def h(r):
  seen.append(r)
  if r.method=='GET' and 'questions' in str(r.url): return httpx.Response(200,json={'data':[{'id':'x','nmId':7,'text':'q'}]})
  if r.method=='PATCH': return httpx.Response(200,json={})
  return httpx.Response(200,json={'answer':'exact'})
 async with httpx.AsyncClient(transport=httpx.MockTransport(h)) as c:
  a=WildberriesAdapter(c,'token'); q=(await a.fetch_unanswered_questions())[0]; assert q['product_id']==7 and seen[0].headers['Authorization']=='Bearer token'; assert (await a.send_answer(q,'exact'))['status']=='SUCCESS'; assert await a.reconcile_answer(q,'exact',None)=='MATCHED'

@pytest.mark.asyncio
async def test_wb_adapter_accepts_live_top_level_list_response():
 async def h(r):
  return httpx.Response(200,json=[{'id':'x','nmId':7,'text':'q'}])
 async with httpx.AsyncClient(transport=httpx.MockTransport(h)) as c:
  rows=await WildberriesAdapter(c,'token').fetch_unanswered_questions()
  assert rows == [{'marketplace':'wildberries','external_question_id':'x','question_text':'q','question_created_at':None,'raw_status':'None','product_id':7,'product_article':None,'product_title':None}]
