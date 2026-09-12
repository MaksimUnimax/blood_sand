# Полная проверка связанных механизмов: Alice single-file

База: 06ec1af2a1d90e2ff192e749b5bf90129963dd05. Область: 6 изменённых исполняемых файлов, 26 побайтово неизменённых. Эта таблица — реестр проверяемых путей; окончательный PASS появляется только после финального CI в GATE/BUILDINFO.

| ID | Сущность | Полная цепочка | Хранение/граница | Проверка |
|---|---|---|---|---|
| P01 | Профиль Алисы и лимит | ai_delivery_capabilities.profile → aliceFileBudget → fileBudgetDecision → очередь | Профиль неизменён; completed batch хранится chrome.storage.local | 56 cases: Alice/ChatGPT, ordered, three files, first failure; audit protected profiles |
| P02 | Реестровые бинарные операции | operation registry.response_style → fileProducingCommand → completedFileAcquisitionKey | Реестр неизменён; все 11 бинарных операций | 56 cases: 11 registry binary routes, legacy PDF explicit retrieval |
| P03 | Локальная отсрочка | processBatchQueue после privacy/planning → localFileDeliveryResult → сохранение status=complete → buildBatchText → LLM continuation | Тот же durable batch, HTTP0, externalfalse; нет нового kind/status | 56 cases: two API+HELP, exact next_command, accounting, source audit |
| P04 | Порядок и ошибка первого файла | completedFileAcquisitionKey → durable earlier entries → новый budget decision | Нет нового счётчика в памяти; ошибочный ответ не потребляет слот | 56 cases: first 403, policy rejected, duplicates, queue recreation |
| P05 | Manual и Autorun | Общая processBatchQueue → соответствующий owner writer → claimDelivery | Оба хранилища владельцев прежние | 56 cases: manual/autorun mixed and two files |
| P06 | Короткий текст | claimDelivery → inline_result_text → markerForDelivery → existing content/Port delivery | Полный текст в owner до commit; окончательная длина с маркером | 56 cases: byte/full text equality, HELP, final90000/+1 |
| P07 | UTF-16 предел | generatedTextDecision unchanged → final marker length → text retention | 90 000, неизменённый профиль; supplementary characters accounted | 56 cases: exact boundary, supplementary-plane negative |
| P08 | Создание локального TXT | claim stable ref → retainCompleteText → putArtifact → transaction.oncomplete → next_command | Existing IDB store, no new DB schema; max1h from claimed_at | 56 cases: write failure, idempotence; actual Chrome transaction |
| P09 | Reserved local ref | rpf_[sp]_local_UUID → readRetainedText → local receipt → reportFileRefsFromBatch → Port | Обычные refs returnnull before IDB; missing local refs never provider fallback | 56 cases: missing local record, corrupt URL session, ordinary capture fault |
| P10 | Область локального TXT | owner origin/conversation + private credentials digest → local_delivery scope → read → recheck at Portcommit | IDB private scope; no credential/hash-revision in LLM | 56 cases: wrong origin/conversation/account/current policy, Port recheck |
| P11 | Точный следующий шаг | normalized original command → private semantic command SHA-256 → readRetainedText; continuation validates again | No reconstructed opaque fields; changed offset/sheet blocked | 56 cases: exact deferred command, tampered local command |
| P12 | Срок локального TXT | original claimed_at → stored created/expires → read and commit → cleanup | Absolute, not renewable; separate from Ozon URL deadline | 56 cases: fresh worker, repeated claim, independent TTL check; mutant |
| P13 | Целостность TXT | UTF8 bytes → SHA/length/type → IDB → read checksum → Port descriptors/chunks | Full raw text retained, not compressed/truncated | 56 cases: altered bytes/hash/type/length; actual Chrome exact hash |
| P14 | HTTP0 local-file accounting | local receipt → localFileRefFromEntry → reportFileRefsFromBatch → attachment source_kind | No fakeHTTP200; zero physical calls; source generated_bridge_text | 56 cases: local output after new worker; actual Chrome Port; mutation |
| P15 | Частичный результат | deferred_file_count/full_text_deferred → marker complete=false/attachments_complete=true → LLM receipt | Complete original attachment not complete whole requested workflow | 56 cases: markers partial, exact guidance preserved |
| P16 | Report prefix | claim → overflow/fallback → report_prefix_applied=false → existing confirmation | Deferred prefix is not claimed delivered | 56 cases: prefix deferred; dedicated mutant; old prefix suite |
| P17 | Ошибка до commit | failDelivery → ownerForMessage → fallbackBeforeAttachment → existing text mode → attempt delivery | Full batch preserved; current phase/id compared again in mutation | 56 cases: artifact missing, failed storage, stale id, concurrency; old ownership regressions |
| P18 | Ошибка после commit | fallback guard CLAIMED-only → old unknown-outcome terminal path | No retry/resend; cannot promise delivery with unavailable browser | 56 cases: aftercommit guard; protected sendcommit/ownership bytes; LIVE05 |
| P19 | Last-resort oversized storage failure | retention throws → bounded failure receipt + owner.retained_delivery_failure | Explicit current-operation lifetime; next operation may replace, no fake download ref | 56 cases: simultaneous IDB failure + long body, text not lost in current owner |
| P20 | Конкурирующие Port вызовы | ownerForMessage → phase/id lock → mutateOwner → commit/fallback single winner | Existing owner lock and checks retained | 56 cases: concurrent attach/fallback; actual Port handler; old single-flight |
| P21 | Восстановление worker | durable batch/IDB → recreate → read/ref budget → new worker receipt | No reliance on same-instance maps | 56 cases: queue recreation, confirmation then new runtime; real stopWorker |
| P22 | ChatGPT | unchanged profile → unchanged claim branch/companion → multiple descriptors | 26 files exact baseline, non-Alice route preserved | 56 cases: two original files, mixed companion; owner live old control |
| P23 | Исходные bytes и trust | unchanged provider/transport/magic/SSRF/privacy → captured artifact → preserved Port/chunk | No new endpoint/permission; protected function byte equality | Old31+expiry30/consumer33/worker7+type MIME tests; audit32files |
| P24 | Тестовые assumptions и package | old IDB call-site audit updated 3/3→4/5; new audit/run → git blobs → deterministic ZIP → all phases | Only test assertion counts expanded; negative writer tests preserved | 8 mutants, extra-file mutation, all31 scripts, final same ZIP SHA across platforms |

## Проверка старых закрытых наборов
HTTP2xx раньше был единственным источником файлов; добавлен узко проверяемый локальный receipt, не глобальное принятие HTTP0 за успех. Нового queue kind/status не добавлялось. `_local_` — зарезервированный подтип существующего ref: reader проверяется до провайдера, нормальный ref не зависит от нового IDB чтения. Все места сборки refs, accounting, продолжений, policy, recheck, descriptors и cleanup перечислены выше и в автоматическом dependency-inventory.json.

Generated/source flags: настоящий Ozon остаётся original_provider_file; локально сохранённый текст становится generated_bridge_text. Истечение provider URL не удаляет уже полученные bytes. Локальный TXT не делает signedURL или credentials доступными модели.

## Что отдельно подтверждается только после установки
LIVE-GATE-01: настоящий смешанный batch в Алисе и два скачивания.
LIVE-GATE-02: установленный worker и сохранённый TXT между командами.
LIVE-GATE-03: реальные счётчики и частичные статусы.
LIVE-GATE-04: ChatGPT две исходные вложенные выгрузки и privacy.
LIVE-GATE-05: принятие файла именно текущим UI Алисы/ChatGPT. Контролируемый Chrome — не замена живой приёмке.

После attachment/send commit неизвестный исход не снимается автоматическим повтором. При недоступном UI отправка не гарантируется. Последний резерв при отказе IDB имеет срок жизни текущей операции; это намеренное ограничение, не незадокументированная вечная ссылка.
