#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import html
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = 'https://alice.yandex.ru/'
TOKENS = [
    'oknyx', 'oknyx-button', 'alice-oknyx-button', 'StandaloneOknyx',
    'Отправить', 'начни слушать', 'Алиса, стоп', 'aria-label',
]


def get(url: str) -> bytes:
    req = urllib.request.Request(url, headers={'User-Agent':'Mozilla/5.0 OzonBridgePublicContractProbe/1.0'})
    with urllib.request.urlopen(req, timeout=30) as r:
        data = r.read()
        ctype = str(r.headers.get('content-type',''))
        if len(data) > 15_000_000:
            raise RuntimeError(f'asset too large: {url} {len(data)}')
        print(f'FETCH url={url} bytes={len(data)} sha256={hashlib.sha256(data).hexdigest()} content_type={ctype}')
        return data


def normalize(base: str, ref: str) -> str | None:
    ref = html.unescape(ref.strip())
    if not ref or ref.startswith(('data:','blob:','javascript:')):
        return None
    return urllib.parse.urljoin(base, ref)


def snippets(text: str, token: str, radius: int = 320):
    out=[]
    lower=text.lower(); needle=token.lower(); start=0
    while True:
        i=lower.find(needle,start)
        if i<0: break
        s=max(0,i-radius); e=min(len(text),i+len(token)+radius)
        frag=re.sub(r'\s+',' ',text[s:e])
        out.append(frag)
        start=i+len(token)
        if len(out)>=6: break
    return out


def main():
    page=get(ROOT).decode('utf-8','replace')
    refs=[]
    for m in re.finditer(r'''(?:src|href)=["']([^"']+)["']''', page, flags=re.I):
        u=normalize(ROOT,m.group(1))
        if not u: continue
        p=urllib.parse.urlparse(u)
        if not (p.hostname or '').endswith(('yandex.ru','yandex.net','yastatic.net')):
            continue
        if '.js' not in p.path and '_crpd' not in p.path and 'bundle' not in p.path:
            continue
        if u not in refs: refs.append(u)
    print(f'PUBLIC_PAGE_ASSET_CANDIDATES={len(refs)}')

    matched=0
    for url in refs[:120]:
        try:
            data=get(url)
        except Exception as exc:
            print(f'FETCH_FAIL url={url} error={type(exc).__name__}:{exc}')
            continue
        text=data.decode('utf-8','replace')
        local=[]
        for token in TOKENS:
            ss=snippets(text,token)
            if ss:
                local.append((token,ss))
        if not local:
            continue
        matched += 1
        print(f'=== MATCHED_ASSET {url} sha256={hashlib.sha256(data).hexdigest()} ===')
        for token,ss in local:
            print(f'-- TOKEN {token} count_shown={len(ss)} --')
            for frag in ss:
                # Prevent enormous output while preserving the component contract vicinity.
                print(frag[:1200])
    print(f'MATCHED_ASSET_COUNT={matched}')
    if matched == 0:
        raise SystemExit('NO_PUBLIC_OKNYX_SOURCE_MATCHES')

if __name__=='__main__':
    main()
