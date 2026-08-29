from __future__ import annotations
import httpx
class VKTransportUnknown(Exception): pass
class VKProtocolError(Exception): pass
class VKAPIResult:
 def __init__(self,message_id=None,error_code=None):self.message_id,self.error_code=message_id,error_code
class VKAPIClient:
 """Narrow adapter: its only runtime operation is messages.send."""
 def __init__(self,config,client=None):self.config,self.client=config,client or httpx.Client(timeout=10)
 def messages_send(self,peer_id:int,message:str,random_id:int,keyboard:str|None=None)->VKAPIResult:
  data={'access_token':self.config.group_token,'v':'5.199','group_id':self.config.group_id,'peer_id':peer_id,'message':message,'random_id':random_id}
  if keyboard is not None: data['keyboard']=keyboard
  try:r=self.client.post('https://api.vk.com/method/messages.send',data=data)
  except httpx.TransportError as exc:raise VKTransportUnknown() from exc
  try:data=r.json()
  except ValueError as exc:raise VKProtocolError() from exc
  if not isinstance(data,dict): raise VKProtocolError()
  if isinstance(data.get('response'),int) and not isinstance(data['response'],bool): return VKAPIResult(message_id=data['response'])
  error=data.get('error')
  if isinstance(error,dict) and isinstance(error.get('error_code'),int) and not isinstance(error['error_code'],bool): return VKAPIResult(error_code=error['error_code'])
  raise VKProtocolError()
