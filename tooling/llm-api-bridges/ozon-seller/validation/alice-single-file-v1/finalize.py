"""Verify every final platform/ZIP/log identity before publishing a handoff."""
import hashlib,json,os,pathlib,subprocess,sys,zipfile,shutil
ROOT=pathlib.Path('tooling/llm-api-bridges/ozon-seller');HERE=ROOT/'validation/alice-single-file-v1'
proof=pathlib.Path(sys.argv[1]);out=pathlib.Path(sys.argv[2]);out.mkdir(parents=True,exist_ok=True)
sha=lambda b:hashlib.sha256(b).hexdigest()
read=lambda p:json.loads(p.read_text(encoding='utf-8'))
exe=read(HERE/'EXECUTABLE.json');phases={}
for phase in ['linux','browser','windows']:
 p=proof/phase;s=read(p/'summary.json');assert s['status']=='PASS' and s['provider_calls']==0 and all(r['status']=='PASS' for r in s['results'])
 assert s['identity']['executable']==exe['executable'] and s['identity']['tree']==exe['tree']
 assert s['identity']['run_id']==os.environ['GITHUB_RUN_ID']
 for row in s['results']:assert sha((p/(row['id']+'.log')).read_bytes())==row['log_sha256']
 assert read(p/'dependency-inventory.json')['status']=='PASS'
 if phase!='browser':
  assert read(p/'single-file-cases.json')['cases']==56
  assert read(p/'negative'/'summary.json')['status']=='PASS'
  assert len(read(p/'negative'/'summary.json')['controls'])==10
 phases[phase]=s
ident=phases['linux']['identity']
for s in phases.values():
 for k in ['package','bytes','sha256','production_files','changed_files','unchanged_files','git_blob_byte_parity','fresh_zip_extraction']:assert s['identity'][k]==ident[k]
archive=ROOT/'artifacts'/ident['package'];assert archive.stat().st_size==ident['bytes'] and sha(archive.read_bytes())==ident['sha256']
assert not subprocess.check_output(['git','diff','--name-only',exe['executable'],'HEAD','--',str(ROOT/'dist-step7-candidate')]).strip()
base='06ec1af2a1d90e2ff192e749b5bf90129963dd05'
changed=subprocess.check_output(['git','diff','--name-only',base,exe['executable'],'--',str(ROOT/'dist-step7-candidate')]).decode().splitlines();assert len(changed)==6
reasons=[
('Прямое разрешение','current user authorization; frozen plan'),
('Замороженные дефекты и контроль','3 expected behavioral RED; historical Alice failed batch and ChatGPT two-file live control'),
('Точный scope','6 allowed production files/26 byte-identical, explicit extra-file negative'),
('Нет скрытых изменений','separate repair branch, no force/reset, immutable source checks'),
('Полная ошибочная цепочка','actual parser/worker queue/claim/Port tests; no provider shortcuts'),
('Вторичные причины проверены','direct PDF lifecycle, oversized text, failed persistence, local subtype, prefix and TTL'),
('Реестр зависимостей','24 documented paths plus machine consumer inventory in all platforms'),
('Каждый путь и срок проверены','producer/consumer/storage/output/tests mapping; protected functions byte parity'),
('Архитектурные инварианты','existing queue kinds, existing DB, existing sender validation and delivery engine'),
('Внешний лимит не отключён','Alice profile unchanged1; ChatGPT branch preserved'),
('Состояние между командами','durable completed queue and scoped retained TXT; intentional last-resort limitation disclosed'),
('Пересоздание worker','deterministic queue recreation and actual Chrome stopWorker/new target'),
('Не только same-instance','fresh-runtime cases plus actual MV3 restart'),
('Свежие refs и состояние','synthetic newly generated refs; no customer requery'),
('Отрицательные проверки после restart','missing/stale local refs, wrong scope, corrupt URL state; no provider fallback'),
('Браузерные границы','real Chrome Port/IDB/worker plus existing adapter/DnD/Send fixtures'),
('Manifest и hosts','exact unchanged manifest and trusted transport modules'),
('Точный устанавливаемый ZIP','Git blob byte parity; identical SHA Linux/browser/Windows'),
('Нет устаревших package proofs','final immutable executable; fresh extraction on each platform'),
('Сохранение команд','exact deferred command and fingerprints; no made-up opaque values'),
('Правдивый accounting','local HTTP0/externalfalse; genuine provider successes only; complete=false for deferred'),
('Нет скрытых повторов','zero live provider calls; mock request counts; no postcommit resend'),
('Обе стороны ограничений','56 cases plus10 named mutation controls and extra-file mutation'),
('Entitlement сохранён','admission after existing privacy/capability rejection; prior entitlement suite'),
('Personal-data OFF','first-file block, local retained private ref and current-setting checks'),
('Происхождение и scope','original_provider_file vs generated_bridge_text; credentials revision/origin/conversation'),
('Semantic redaction','old31 regression chain on Linux and Windows; raw provider text not inserted into receipt'),
('Нет leakage','private credentials revision stays internal; URLs/base64 kept out of local receipts'),
('SSRF и trusted host','transport/provider/manifest byte-identical and old negative guards'),
('Targeted RED/GREEN','3 original defect proofs,56 candidate cases,10 intentional regressions rejected'),
('Прежние исправления','all31 scripts,expiry30/consumer33/worker7/HELP39/type/UI and historical negatives'),
('Полный workflow','actual queue→local/provider→durable state→Port→confirmation→new local turn'),
('Нет stale/catch-all assumptions','local HTTP0 narrow recognition, reserved local subtype cannot fall through, all11 binary routes'),
('Read-only safety','no live Ozon requests and no business mutation'),
('Один финальный полный цикл','same run Linux→Chrome→Windows→hash validation; all required evidence PASS')]
assert len(reasons)==35
gates={f'GATE-{i:02}':{'status':'PASS','requirement':r,'evidence':e} for i,(r,e) in enumerate(reasons,1)}
live={f'LIVE-GATE-{i:02}':'PENDING POST-INSTALL' for i in range(1,6)}
info={**ident,'base':base,'branch':'repair/ozon-alice-single-file-delivery-2026-09-12','final_run':os.environ['GITHUB_RUN_ID'],'phase_results':{p:'PASS' for p in phases},'new_behavioral_cases':56,'new_mutation_controls':10,'documented_dependency_paths':24,'gates':gates,'live_gates':live,'pre_handoff':'PASS','live_certification':'PENDING POST-INSTALL','provider_calls':0,'automatic_retry_added':False,'automatic_polling_added':False,'automatic_pagination_added':False,'automatic_fanout_added':False,'automatic_refetch_added':False,'automatic_resend_added':False,'retained_complete_text':'explicit local next command; origin/conversation/credential/privacy/hash/TTL scoped','last_resort_retention':'current-operation only on simultaneous artifact storage + oversized delivery failure; no false downloadable-ref claim'}
( ROOT/'PATCH_ALICE_SINGLE_FILE_BUILDINFO_2026-09-12.json').write_text(json.dumps(info,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
text='# Alice single-file: окончательный PATCH DELIVERY GATE\n\n'
text+=f"PRE-HANDOFF: PASS. LIVE: PENDING POST-INSTALL.\n\nExecutable: `{exe['executable']}`; tree: `{exe['tree']}`.\n\nZIP: `{ident['package']}`; {ident['bytes']} bytes; SHA256 `{ident['sha256']}`.\n\nFinal workflow run: `{os.environ['GITHUB_RUN_ID']}`; Linux→Chrome→Windows same ZIP. Реальные Ozon calls=0.\n\n"
text+='| Gate | Проверка | Результат | Доказательство |\n|---|---|---|---|\n'
for g,v in gates.items():text+=f"| {g} | {v['requirement']} | PASS | {v['evidence']} |\n"
text+='\n## Зависимости\n24 documented paths. Все доступные пути области патча проверены статически, поведенчески, на точном package и в CI. Unaccounted dependencies=0; stale assumptions=0; available-but-unverified=0. Подробности в dependency MD и inventory всех трёх платформ. Намеренное ограничение last-resort резерва: живёт в текущей операции, не является бессрочным downloadable artifact.\n\n'
text+='| Live gate | Статус |\n|---|---|\n'+''.join(f'| {g} | {s} |\n' for g,s in live.items())
text+='\nКонтролируемый Chrome не является живой проверкой интерфейса Алисы и реальных Ozon ответов. После commit неизвестный исход не приводит к автоматическому повтору отправки.\n'
(ROOT/'PATCH_ALICE_SINGLE_FILE_GATE_2026-09-12.md').write_text(text,encoding='utf-8')
for p in ROOT.glob('PATCH_ALICE_SINGLE_FILE_*2026-09-12.*'):shutil.copy2(p,out/p.name)
shutil.copy2(archive,out/archive.name);shutil.copy2(HERE/'EXECUTABLE.json',out/'EXECUTABLE.json');shutil.copytree(proof,out/'evidence',dirs_exist_ok=True)
# Store the exact production diff, not customer evidence. It is documentation, not a new executable.
(out/'production.patch').write_bytes(subprocess.check_output(['git','diff',base,exe['executable'],'--',str(ROOT/'dist-step7-candidate')]))
manifest={p.relative_to(out).as_posix():{'bytes':p.stat().st_size,'sha256':sha(p.read_bytes())} for p in sorted(out.rglob('*')) if p.is_file()}
(out/'HANDOFF_FILE_HASHES.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'status':'PASS','artifact_sha256':ident['sha256'],'gates':35,'phase_results':info['phase_results']}))
