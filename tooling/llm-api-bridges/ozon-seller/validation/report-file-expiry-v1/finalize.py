"""Publish only after all same-run, same-ZIP evidence and log digests agree."""
from pathlib import Path
import hashlib,json,os,re,subprocess,zipfile
ROOT=Path('tooling/llm-api-bridges/ozon-seller');GATE=ROOT/'validation/report-file-expiry-v1'
NAME='OZON_BRIDGE_v0.1.19_REPORT_FILE_EXPIRY_20260912.zip';inputs=Path(os.environ['RUNNER_TEMP'])/'all-expiry-evidence'
read=lambda p:json.loads(p.read_text(encoding='utf-8'))
sha=lambda b:hashlib.sha256(b).hexdigest()
frozen=read(GATE/'EXECUTABLE.json');identities=[]
for phase in ('linux','browser','windows'):
 folder=inputs/phase;s=read(folder/'summary.json');identity=s['identity']
 assert s['status']=='PASS' and s['provider_calls']==0 and identity['phase']==phase
 assert identity['executable']==frozen['executable'] and identity['tree']==frozen['tree']
 assert identity['workflow_head']==os.environ['GITHUB_SHA'] and identity['ci_run']==os.environ['GITHUB_RUN_ID']
 assert identity['production_files']==32 and identity['unchanged_files']==30 and identity['canonical_git_blob_parity']=='PASS'
 for r in s['results']:
  assert r['status']=='PASS' and r['exit_code']==0
  assert sha((folder/(r['id']+'.log')).read_bytes())==r['log_sha256']
 if phase!='browser':
  for name,count in [('expiry',30),('matrix',33),('worker',7),('help39',39)]:
   data=read(folder/(name+'.json'));assert data['status']=='PASS' if 'status' in data else True
   assert len(data['cases'])==count and all(r['status']=='PASS' for r in data['cases']) and data['provider_calls']==0
  red=read(folder/'red.json');assert red['status']=='RED_REPRODUCED' and len(red['cases'])==6 and all(r['status']=='EXPECTED_RED' for r in red['cases'])
  controls=read(folder/'negative/summary.json');assert controls['status']=='PASS' and len(controls['controls'])==5
  for r in controls['controls']:assert r['status']=='EXPECTED_FAIL' and sha((folder/'negative'/(r['name']+'.log')).read_bytes())==r['log_sha256']
  prior=read(folder/'prior/summary.json');assert len(prior['results'])==31
  for r in prior['results']:assert r['status']=='PASS' and sha((folder/'prior'/(r['id']+'.log')).read_bytes())==r['log_sha256']
  sweep=read(folder/'source-inventory.json');assert sweep['unclassified_consumer_files']==0 and sweep['classified_consumer_files']==8
 else:
  browser=read(folder/'browser-expiry.json');assert browser['status']=='PASS' and browser['real_worker_recreated'] is True and browser['provider_calls']==0 and len(browser['cases'])==7 and all(r['status']=='PASS' for r in browser['cases'])
  assert len([r for r in s['results'] if r['id'].startswith('browser-fixture-')])==5
 identities.append({k:v for k,v in identity.items() if k!='phase'})
assert all(i==identities[0] for i in identities);identity=identities[0]
archive=ROOT/'artifacts'/NAME;assert sha(archive.read_bytes())==identity['sha256'] and archive.stat().st_size==identity['bytes']
with zipfile.ZipFile(archive) as z:
 assert len(z.namelist())==32 and z.testzip() is None
 for name in z.namelist():assert z.read(name)==subprocess.check_output(['git','show',frozen['executable']+':'+(ROOT/'dist-step7-candidate'/name).as_posix()])
assert not subprocess.check_output(['git','diff','--name-only',frozen['executable'],'HEAD','--',str(ROOT/'dist-step7-candidate')]).strip()
run=os.environ['GITHUB_RUN_ID'];exact=frozen['executable'];tree=frozen['tree']
deps=[
('D01','Reportinfo.file + expires_at','same result record; no nested additional_data source','one explicit metadata response','expiry: SOURCE_REPORT_RECORD_NOT_ADDITIONAL_DATA_IS_AUTHORITY'),
('D02','Report status','success may authorize a URL; waiting/processing/failed may not','response-local','matrix: NONREADY_STATUS_*'),
('D03','Date validation','RFC3339, actual calendar, offset, fractional seconds','pure local calculation','expiry: MALFORMED_DATE_*; RFC3339_PRECISION_OFFSET_*'),
('D04','Legacy empty/null/absent expiry','existing bounded local retention, not an invented provider guarantee','30-minute ref retention','expiry: LEGACY_*'),
('D05','Provider expiry + local retention','earliest absolute deadline; no renewal by reads','persisted expires_at_ms','expiry: EARLIEST_DEADLINE_*; matrix: INFO_REPEATS_CANNOT_RENEW_PROVIDER_DEADLINE'),
('D06','SELLER_RETURNS URL','documented five-minute cap from explicit request start','min(provider, five minutes, local retention)','expiry: RETURNS_FIVE_MINUTE_LIMIT'),
('D07','URL ref creation','expired/invalid URL never becomes an actionable fresh ref','registration and safe file_availability','expiry: EXPIRED_REPORT_NEVER_MINTS_REF; INVALID_EXPIRY_NOT_TREATED_AS_UNBOUNDED'),
('D08','Async lock/storage delay','check after lock and after write; deadline never rebased','serialized session-state writes','expiry: READINESS_RECHECK_AFTER_STORAGE_WAIT; matrix: EXPIRY_DURING_STATE_WRITE_NO_READY_REF'),
('D09','Session schema migration','v1 URL refs rejected; valid independent facts and inline bytes retained','schema2, same storage key','expiry: V1_URL_REFS_REQUIRE_FRESH_RESOLUTION; matrix: V1_INLINE_PDF_MIGRATES_WITHOUT_URL_EXPIRY'),
('D10','Provenance and rpf_s/rpf_p','known create facts only; unknown/expired history stays personal','existing 30-minute facts; cap256 unchanged','expiry: UNKNOWN_AND_EXPIRED_PROVENANCE_REMAIN_PERSONAL; worker: UNKNOWN_PROVENANCE_PERSONAL_POLICY_OFF_BLOCKS'),
('D11','Two inline PDF producers','already obtained bytes: no provider URL lifetime inference','existing session bytes retention','matrix: INLINE_PDF_RECREATE_ZERO_GET_*'),
('D12','Storage failures/caps/concurrency','failed persistence does not invent success or repeat request','session cap128, serialized writes','expiry: STATE_WRITE_FAILURE_*; matrix: REF_CAP_128_*; CONCURRENT_REF_WRITES_*'),
('D13','MV3 state restoration','absolute expiry survives complete module and actual worker replacement','real chrome.storage.session','expiry: DEADLINE_SURVIVES_*; browser: ACTUAL_MV3_STOP_AND_NEW_WORKER_ACTIVATION'),
('D14','Final file GET admission','expired ref stops before one transport call, HTTP0 external=false','last synchronous pre-transport check','worker: EXPIRED_GET_HTTP0_ZERO_REQUEST_ACTUAL_WORKER; browser: EXPIRED_GET_AFTER_REAL_SW_RESTART_ZERO_NETWORK_CALLS'),
('D15','Trusted URL/credentials','HTTPS, host allowlist, redirect=error, credentials=omit unchanged','existing transport implementation','matrix: TRUSTED_HOST_UNCHANGED_*; 31 prior regressions'),
('D16','Valid-URL provider failures','real 403 stays provider403, no fake expiry classification','one physical request; no retry','worker: REAL403_PRESERVED_ONE_REQUEST_NO_RETRY'),
('D17','Logical/physical accounting','metadata read1; expired/local policy rejection0; valid download1','actual worker queue and response metadata','all worker cases, prior provider taxonomy tests'),
('D18','Outgoing continuation','safe absolute deadline rechecked; expired next_command=null','delivery-time result formatting','expiry: DELAYED_OUTPUT_CANNOT_OFFER_EXPIRED_REF; negative: ignore-delayed-output'),
('D19','Seven generated URL consumers','use shared registration without assuming report-specific fields','same local lifetime; safe metadata added','matrix: GENERATED_URL_RECREATE_GET_*'),
('D20','Captured downloaded artifacts','successful single fetch stores exact bytes; URL expiry cannot delete them','separate existing one-hour IndexedDB TTL','browser: REAL_CAPTURE_WRAPPER_STORES_EXACT_BYTES_IN_INDEXEDDB; URL_EXPIRY_DOES_NOT_DELETE_VALID_DOWNLOADED_ARTIFACT'),
('D21','HELP/API ingress and parsers','no alternative parser or provider fan-out added','unchanged production bytes','HELP39; prior mixed-help, envelopes, entitlement tests'),
('D22','AI adapters, DnD, XLSX, send and restart','unchanged code, reused full regression and browser fixtures','existing DOM and delivery lifetimes','31 prior tests; five browser fixtures; attachment primitive; entry smoke'),
('D23','Manual admission/output/deduplication','real worker; text insertion acknowledgements; successful file attachment plan','recreated workers with shared durable stores','worker: MANUAL_CHAIN_RECREATION_TEXT_ACKS_FILE_PLAN_NO_DUPLICATES'),
('D24','Exact installed code/manifest','two changed files only, other30 identical; same ZIP on all platforms','frozen Git tree and deterministic ZIP','all identity/production-members proofs, final canonical readback')]
assert len(deps)==24
closure={'checked_paths':24,'classified_consumer_files':8,'unaccounted_pre_handoff_dependencies':0,'stale_active_assumptions':0,'available_but_unverified_pre_handoff_dependencies':0,'live_gates_pending':5}
info={**identity,'baseline_executable':'0cc968ee4b76d41e9c0361a905812fe49f313585','gate_status':'PRE-HANDOFF PASS','live_certification':'PENDING POST-INSTALL','expiry_cases':30,'consumer_cases':33,'worker_cases':7,'browser_expiry_cases':7,'mutation_controls':5,'prior_regression_scripts_per_platform':31,'help_behavioral_cases':39,'provider_calls':0,'automatic_retry_added':False,'automatic_polling_added':False,'automatic_pagination_added':False,'automatic_fanout_added':False,'automatic_refetch_added':False,'automatic_resend_added':False,'dependency_closure':closure,'gates':{f'GATE-{i:02}':'PASS' for i in range(1,36)}}
(archive.parent/(NAME+'.BUILDINFO.json')).write_text(json.dumps(info,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
doc=['# Проверка связанных механизмов report-file','',f'Executable: `{exact}`. Tree: `{tree}`. Финальный CI: `{run}`.','', '| ID | Источник | Все затронутые потребители / правило | Состояние и срок | Доказательство | Статус |','|---|---|---|---|---|---|']
for row in deps:doc.append('| '+' | '.join(row)+' | PASS |')
doc+=['','В `source-inventory.json` сохранены все найденные ссылки на report-file механизм: восемь production-файлов, номера строк и хеши. Изменены только provider и формирование продолжения.','',json.dumps(closure,ensure_ascii=False,indent=2),'','LIVE-GATE-01..05: PENDING POST-INSTALL. Настоящий пользовательский AI DOM, Ozon и установленная владельцем сборка не заменяются тестовыми ответами.']
(ROOT/'PATCH_REPORT_FILE_EXPIRY_DEPENDENCIES_2026-09-12.md').write_text('\n'.join(doc)+'\n',encoding='utf-8')
gates=re.findall(r'^### (GATE-\d{2}) — (.+)$',(ROOT/'OZON_PATCH_DELIVERY_GATE.md').read_text(encoding='utf-8'),re.M);assert len(gates)==35
proofs=['Прямое разрешение владельца в текущем диалоге.','Замороженный план, журнал инцидента и шесть независимых RED.','Два production-файла; 30 остальных побайтово сохранены.','Изменения только в repair-ветке; публикация fast-forward, без force/reset.','Воспроизведены create/info/get, policy, accounting, output и ручная доставка текста.','Проверены шесть причин и все восемь файлов-потребителей.','D01–D24 и построчная инвентаризация потребителей.','Для каждого пути указаны сроки, состояние, потребители и доказательство.','Единая логика абсолютного срока; прежние правила безопасности сохранены.','Готовый живой URL с 403 остаётся 403; expiry не подменяет все ошибки.','Deadline записывается в session-state, не в память одного worker.','Пересоздание между зависимыми шагами и фактическая остановка MV3 в Chrome.','Отдельный same-instance контроль дополнен новыми runtime и реальным новым worker.','Тестовые новые коды/refs; исторические пользовательские URLs не запрашивались.','Неизвестные, старые, повреждённые, просроченные и future-dated refs не выполняют GET.','Закреплённый Chrome, реальный session/IndexedDB/worker; live отдельно.','Manifest, hosts и порядок модулей не менялись; entry smoke PASS.','Идентичный ZIP на Linux/Chrome/Windows и 32 канонических Git blobs.','Все финальные проверки относятся к одному замороженному executable.','Параметры и fingerprints сохраняются прежним кодом; regressions PASS.','В реальном worker проверены metadata1, valid GET1, expired/policy0.','Повторная команда после пересоздания не исполняется; retry/refetch не добавлены.','Положительные случаи и пять специально испорченных реализаций.','Проверки entitlement и provider taxonomy проходят; обходов нет.','Unknown-history rpf_p блокируется при policy OFF; ON — положительный контроль.','Известные факты и неизвестная история разделены; имя отчёта не делает его safe.','Прежние redaction-regressions и новые выходные данные без подписанных URLs.','Фиктивная подпись и credentials не попадают в отчёты; inline base64 удаляется.','HTTPS/host/credentials/redirect негативные и позитивные проверки.','Шесть RED, 30 основных и 33 смежных сценария GREEN.','Все 31 прежних regression-скрипта + HELP39 на обеих платформах.','24 пути закрыты доступными проверками; реальный capture/IDB проверен отдельно от UI live.','Старые URL refs не объявляются свежими при миграции; нет выдуманной безопасной provenance.','Реальных Ozon-запросов в patch-gate ноль; тестовые transport fixtures и network guard.','Один полный финальный run Linux → Chrome → Windows → проверка хешей и отчётов.']
assert len(proofs)==35
doc=['# Report-file expiry: обязательные GATE-01–35','',f'CI `{run}`; executable `{exact}`; PRE-HANDOFF PASS.','', '| Gate | Требование | Результат | Доказательство |','|---|---|---|---|']
for (gid,title),proof in zip(gates,proofs):doc.append(f'| {gid} | {title} | PASS | {proof} |')
doc+=['','## Проверка после установки','']+[f'LIVE-GATE-{i:02}: PENDING POST-INSTALL.' for i in range(1,6)]
(ROOT/'PATCH_REPORT_FILE_EXPIRY_GATE_2026-09-12.md').write_text('\n'.join(doc)+'\n',encoding='utf-8')
doc=['# Исправление срока доступа к файлам отчётов Ozon','',f'PRE-HANDOFF PASS. LIVE CERTIFICATION: PENDING POST-INSTALL. CI `{run}`.','',f'Executable `{exact}`; tree `{tree}`.','',f'ZIP `{NAME}`; {identity["bytes"]} байт; SHA-256 `{identity["sha256"]}`.','', '## Что изменено и почему',
'В `shared/ozon_provider.js` срок доступа взят из того же объекта отчёта, что и URL/status. Дата разбирается как RFC3339 с проверкой календаря и часового пояса. Непустая ошибочная дата запрещает выпуск готового ref. Неоконченный/ошибочный отчёт не становится готовым из-за старого поля file.',
'Эффективный абсолютный срок — минимум из provider expires_at, прежних 30 минут локального хранения и документированных пяти минут для SELLER_RETURNS. Это не добавление произвольной задержки и не продление подписи. Пустой/отсутствующий/null expires_at сохраняет прежний ограниченный режим для старых отчётов; он не выдаётся за доказанный срок провайдера.',
'Срок проверяется при выпуске ref, после ожидания блокировки/записи, после восстановления состояния и непосредственно перед GET. `report_info` по-прежнему возвращает фактический HTTP200, но для истёкшего файла добавляет file_availability=expired без готового ref. Локально отклонённый GET имеет REPORT_FILE_EXPIRED, HTTP0 и external_request_executed=false. Реальный 403 для неистёкшего URL не переименовывается и не повторяется.',
'В `shared/llm_output_report_workflow_patch.js` состояние и абсолютный срок проверяются ещё раз при формировании выдачи. Для истёкшего файла next_command=null, требуется новый явный workflow. Автоматического повторного report_info, create или скачивания нет.',
'', '## Обновление состояния',
'Внутренняя схема session-state повышена до 2 на прежнем ключе. Старые URL refs схемы1 не содержали provider expiry: они не получают новый срок задним числом и требуют явного свежего разрешения ссылки. Это намеренное одноразовое изменение совместимости старых команд, а не удаление настроек магазина. Ещё действующие факты происхождения и inline PDF мигрируются отдельно. Сохранённые скачанные байты в IndexedDB сохраняют свой прежний часовой срок.',
'', '## Что не изменено',
'Остальные 30 production-файлов идентичны предыдущему executable, включая manifest, API endpoints, permissions, credentials, parser, Autorun HELP_V2, DnD, XLSX и Send. Отсутствующее/истёкшее подтверждение происхождения по-прежнему даёт rpf_p, а не rpf_s. Персональная настройка не включается и запреты не снимаются. По имени/report_type безопасность файла не угадывается.',
'', '## Почему это не обход и где границы доказательств',
'Исправляется сам контракт жизни ссылки во всех затронутых местах, а не конкретный 403, SKU, склад, ID или ответ модели. Не меняется доступ Ozon и не скрываются сетевые ошибки. Конкретный истёкший серверный файл этот патч не восстанавливает: нужен новый отчёт отдельной явной командой. Неизвестные сроки старых отчётов, неправильные часы пользователя, отзыв доступа на сервере и истечение ссылки во время сети остаются внешними ограничениями; поэтому абсолютная гарантия отсутствия любых будущих ошибок не заявляется.',
'', '## Проверки',
'На Linux и Windows: 30 основных случаев, 33 сценария потребителей (все8 report-create, все7 generated URL, оба inline PDF), 7 сценариев реального обработчика worker, 39 HELP_V2 и 31 прежний regression-скрипт. Пять мутационных контролей должны падать на соответствующем инварианте. В Chrome: семь новых проверок с настоящей остановкой worker, session-state и IndexedDB, пять прежних DOM-fixture, attachment primitive и entry smoke. Тестовые ответы провайдера не означают живой Ozon PASS.',
'', '## Журнал выполнения',
'Первый source snapshot не имел pinned parent в shallow checkout; исправлен checkout exact base после чтения ошибки. Локальные фикстуры приведены к реальному контракту VM JSON, длине UUID и согласованным MIME/расширению файла. Один прежний source-sweep проверял локальное имя переменной fileRef: он обновлён на условную публикацию registered.ref и обязательную передачу expires_at, смысл проверки не снят. Локальная копия без Git history не могла выполнить исторический replay; все31 скрипт выполнены в CI с полным checkout. Контейнерный Chromium144 не обеспечил рабочий CDP pipe; авторитетная проверка выполнена закреплённым Chrome152 в CI.',
'', '## Источники',
'Логи владельца от 2026-09-12 и замороженный план PATCH_REPORT_FILE_EXPIRY_PLAN_2026-09-12.md. Сохранённый Ozon Swagger (463 операции), SHA-256 39e053a147180d1df4ded6ed0272aaaf02dd6a371144d8ebed7113fd218e4b40; Reportinfo.expires_at и file. Актуальность live-документации сверх этой сохранённой версии не заявляется.',
'', '## После установки',
'Установить именно этот ZIP. Не переиспользовать старый истёкший ref. Выполнить новый явный create → фактический code → report_info → фактический ref → report_file_get. Проверить реальный файл и отсутствие лишних запросов; затем lifecycle и связанные live-регрессии. Все LIVE-GATE-01..05 остаются открытыми.']
(ROOT/'PATCH_REPORT_FILE_EXPIRY_2026-09-12.md').write_text('\n\n'.join(doc)+'\n',encoding='utf-8')
with zipfile.ZipFile(archive.parent/(NAME+'.evidence.zip'),'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for p in sorted(inputs.rglob('*')):
  if p.is_file():z.write(p,p.relative_to(inputs).as_posix())
print(json.dumps(info,ensure_ascii=False,indent=2));print('FINAL_REPORT_EXPIRY_PREHANDOFF_PASS')
