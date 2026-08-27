import httpx,pytest
from app.marketplaces.ozon import OzonAdapter
@pytest.mark.asyncio
async def test_ozon_read_pagination_sku_and_send():
 calls=[]
 async def h(req):
  calls.append(req)
  if 'question/list' in str(req.url):
   n=len([x for x in calls if 'list' in str(x.url)]); return httpx.Response(200,json={'questions':[{'id':'q'+str(n),'sku':7,'text':'x'}],'last_id':'next','has_next':n<2})
  return httpx.Response(200,json={'answer_id':'a1'})
 async with httpx.AsyncClient(transport=httpx.MockTransport(h)) as c:
  a=OzonAdapter(c,'id','key'); qs=await a.fetch_unanswered_questions(); assert len(qs)==2 and qs[0]['sku']==7 and calls[0].headers['Client-Id']=='id'; z=await a.send_answer(qs[0],'exact'); assert z['answer_id']=='a1'
@pytest.mark.asyncio
async def test_ozon_invalid_and_reconcile_unknown():
 async def h(req): return httpx.Response(200,json={})
 async with httpx.AsyncClient(transport=httpx.MockTransport(h)) as c:
  a=OzonAdapter(c); q={'external_question_id':'x','sku':1}; assert (await a.send_answer(q,'x'))['status']=='CLEAR_FAILURE'; assert await a.reconcile_answer(q,'ok',None)=='UNKNOWN'
