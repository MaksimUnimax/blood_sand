from .base import MarketplaceAdapter
class OzonAdapter(MarketplaceAdapter):
 base_url='https://api-seller.ozon.ru'
 async def fetch_unanswered_questions(self): raise RuntimeError('live integration disabled in C1')
 async def send_answer(self,question,text): raise RuntimeError('explicit live integration required')
 async def reconcile_answer(self,question,expected_text,send_started_at): raise RuntimeError('live integration disabled in C1')
