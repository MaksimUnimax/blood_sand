from __future__ import annotations
import json, hmac
from fastapi import Request
from starlette.responses import PlainTextResponse
from .normalization import normalize_callback
async def bounded_body(request:Request,limit:int):
 chunks=[];total=0
 async for part in request.stream():
  total+=len(part)
  if total>limit:return None
  chunks.append(part)
 return b''.join(chunks)
async def callback(request:Request):
 runtime=request.app.state.vk_runtime; config=runtime['config']; raw=await bounded_body(request,config.callback_max_body_bytes)
 if raw is None:return PlainTextResponse('payload too large',413)
 try: payload=json.loads(raw.decode('utf-8'))
 except (UnicodeDecodeError,json.JSONDecodeError):return PlainTextResponse('bad request',400)
 if not isinstance(payload,dict):return PlainTextResponse('bad request',400)
 if payload.get('group_id')!=config.group_id or not hmac.compare_digest(str(payload.get('secret','')),config.callback_secret):return PlainTextResponse('forbidden',403)
 if payload.get('type')=='confirmation':return PlainTextResponse(config.confirmation_code)
 try: normalize_callback(payload)
 except ValueError:return PlainTextResponse('bad request',400)
 runtime['storage'].accept(payload)
 return PlainTextResponse('ok')
