#!/usr/bin/env python3
from __future__ import annotations
import hashlib, re, urllib.request
URL='https://yastatic.net/s3/alicestatic/_/v2/main-chunk.51931803b8138641.js'
req=urllib.request.Request(URL,headers={'User-Agent':'Mozilla/5.0 OzonBridgePublicContractProbe/1.0'})
with urllib.request.urlopen(req,timeout=30) as r: data=r.read()
text=data.decode('utf-8','replace')
print('ASSET_SHA256='+hashlib.sha256(data).hexdigest())
for needle in ['disabled:er','let{state:e','inputFilesStore','isUploading','isProcessing','uploading','processing','submitTextInInput']:
    positions=[m.start() for m in re.finditer(re.escape(needle),text,re.I)]
    print(f'=== {needle} MATCHES={len(positions)} ===')
    for i in positions[:8]:
        print(text[max(0,i-2200):min(len(text),i+2600)].replace('\n',' '))
        print('\n---\n')
