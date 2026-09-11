#!/usr/bin/env python3
from __future__ import annotations
import hashlib, urllib.request
URL='https://yastatic.net/s3/alicestatic/_/v2/main-chunk.51931803b8138641.js'
req=urllib.request.Request(URL,headers={'User-Agent':'Mozilla/5.0 OzonBridgePublicContractProbe/1.0'})
with urllib.request.urlopen(req,timeout=30) as r: data=r.read()
text=data.decode('utf-8','replace')
print('ASSET_SHA256='+hashlib.sha256(data).hexdigest())
needles=['el=(0,m.useMemo)', 'em=(0,m.useCallback)', 'children:eo?', 'StandaloneOknyx:click']
for needle in needles:
    i=text.find(needle)
    print('=== NEEDLE',needle,'OFFSET',i,'===')
    if i<0: continue
    s=max(0,i-5000); e=min(len(text),i+7000)
    frag=text[s:e].replace('\n',' ')
    print(frag)
