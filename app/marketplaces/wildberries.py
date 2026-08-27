import httpx
class WildberriesAdapter:
 base_url='https://feedbacks-api.wildberries.ru'
 def __init__(self,client,token=''): self.client,self.headers=client,{'Authorization':'Bearer '+token}
 @staticmethod
 def normalize_questions(payload):
  """Normalize both documented object responses and WB's list response."""
  if isinstance(payload,list): return payload
  if not isinstance(payload,dict): return []
  rows=payload.get('data',payload.get('questions',[]))
  return rows if isinstance(rows,list) else []
 async def fetch_unanswered_questions(self):
  out=[]
  for page in range(20):
   skip=page*100
   if skip+100>10000: break
   r=await self.client.get(self.base_url+'/api/v1/questions',headers=self.headers,params={'isAnswered':'false','take':100,'skip':skip,'order':'dateDesc'}); r.raise_for_status(); rows=self.normalize_questions(r.json())
   for x in rows: out.append({'marketplace':'wildberries','external_question_id':str(x.get('id')),'question_text':x.get('text',''),'question_created_at':x.get('createdDate'),'raw_status':str(x.get('isAnswered')),'product_id':x.get('nmId'),'product_article':x.get('supplierArticle'),'product_title':x.get('productName')})
   if len(rows)<100: break
  return out
 async def send_answer(self,q,text):
  try:
   r=await self.client.patch(self.base_url+'/api/v1/questions',headers=self.headers,json={'id':q['external_question_id'],'text':text,'state':'wbRu'}); r.raise_for_status(); return {'status':'SUCCESS'}
  except (httpx.TimeoutException,httpx.TransportError): return {'status':'AMBIGUOUS'}
  except httpx.HTTPStatusError: return {'status':'CLEAR_FAILURE'}
 async def reconcile_answer(self,q,text,send_started_at):
  r=await self.client.get(self.base_url+'/api/v1/question',headers=self.headers,params={'id':q['external_question_id']}); d=r.json(); a=d.get('answer')
  return 'MATCHED' if a==text else ('NOT_FOUND' if a is not None else 'UNKNOWN')
