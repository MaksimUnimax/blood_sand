import httpx
class OzonAdapter:
 base_url='https://api-seller.ozon.ru'
 def __init__(self,client,client_id='',api_key=''):
  self.client=client; self.headers={'Client-Id':client_id,'Api-Key':api_key,'Content-Type':'application/json'}
 async def fetch_unanswered_questions(self):
  out=[]; last=''
  for _ in range(10):
   r=await self.client.post(self.base_url+'/v1/question/list',headers=self.headers,json={'filter':{'status':'UNPROCESSED'},'limit':100,'last_id':last,'sort_dir':'DESC'}); r.raise_for_status(); d=r.json(); data=d.get('result',d); rows=data.get('questions',[])
   for x in rows: out.append({'marketplace':'ozon','external_question_id':str(x.get('id') or x.get('question_id')),'question_text':x.get('text',''),'question_created_at':x.get('published_at'),'raw_status':x.get('status'),'product_id':x.get('sku'),'product_article':x.get('product_article'),'product_title':x.get('product_name'),'sku':x.get('sku'),'url':x.get('url')})
   last=data.get('last_id','')
   if not data.get('has_next',False): break
  return out
 async def send_answer(self,q,text):
  if not 2<=len(text)<=3000: return {'status':'CLEAR_FAILURE','error':'invalid answer length'}
  try:
   r=await self.client.post(self.base_url+'/v1/question/answer/create',headers=self.headers,json={'question_id':q['external_question_id'],'sku':q['sku'],'text':text}); r.raise_for_status(); return {'status':'SUCCESS','answer_id':r.json().get('answer_id')}
  except (httpx.TimeoutException,httpx.TransportError): return {'status':'AMBIGUOUS'}
  except httpx.HTTPStatusError: return {'status':'CLEAR_FAILURE'}
 async def reconcile_answer(self,q,text,send_started_at):
  r=await self.client.post(self.base_url+'/v1/question/answer/list',headers=self.headers,json={'question_id':q['external_question_id'],'sku':q['sku']}); d=r.json(); rows=d.get('result',d).get('answers')
  if not isinstance(rows,list): return 'UNKNOWN'
  return 'MATCHED' if any(x.get('text')==text for x in rows if isinstance(x,dict)) else 'NOT_FOUND'
