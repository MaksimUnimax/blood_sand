import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const input=path.resolve(process.argv[2]||'.');
const dist=fs.existsSync(path.join(input,'content_script.js'))?input:path.join(input,'tooling/llm-api-bridges/ozon-seller/dist-step7-candidate');
const read=rel=>fs.readFileSync(path.join(dist,rel),'utf8').replace(/\r\n/g,'\n');
function walk(p){return fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(p,e.name)):[path.join(p,e.name)]);}
const files=walk(dist), references=[];
for(const p of files.filter(p=>p.endsWith('.js'))){const rel=path.relative(dist,p).replaceAll('\\','/');for(const [i,line] of read(rel).split('\n').entries())if(/helpPrefix|HELP_PREFIX|OZON_HELP_V[12]|autorunCommandMarkerPresent/.test(line))references.push({file:rel,line:i+1,text:line.trim()});}
assert.deepEqual([...new Set(references.map(r=>r.file))].sort(),['content_script.js','service_worker.js','shared/mixed_batch_discovery.js','shared/ozon_guidance.js','shared/runtime_names.js'].sort(),'all active marker consumers are inventoried');
const content=read('content_script.js'),worker=read('service_worker.js'),names=read('shared/runtime_names.js'),mixed=read('shared/mixed_batch_discovery.js'),guidance=read('shared/ozon_guidance.js'),entry=read('service_worker_entry.js');
assert.equal((content.match(/autorunCommandMarkerPresent\s*\(/g)||[]).length,3,'definition + exactly two consumers');
assert.equal((content.match(/OzonRuntime\.RUNTIME\.helpPrefixV2/g)||[]).length,1,'no consumer-local marker lists');
assert.equal((content.match(/OzonRuntime\.RUNTIME\.helpPrefix(?!V2)/g)||[]).length,1,'old static-only guards removed');
assert(!/messageText\.includes\(Ozon|latestText\.includes\(Ozon/.test(content),'old duplicate ingress checks removed');
assert(content.includes('typeof prefix === "string" && prefix.length > 0 && text.includes(prefix)'),'no empty-prefix or generic OZON acceptance');
assert(names.includes('helpPrefixV2: "OZON_HELP_V2"'));
assert(names.includes('helpPrefix: "OZON_HELP_V1"'));
assert(mixed.includes('kind: "help", prefix: helpPrefixV2, version: 2'));
assert(mixed.includes('kind: "help", prefix: helpPrefixV1, version: 1'));
assert(guidance.includes('const HELP_PREFIX_V2 ='));
assert(worker.includes('helpPrefixV2: OzonRuntime.RUNTIME.helpPrefixV2 || "OZON_HELP_V2"'));
assert(worker.includes('helpPrefixV1: OzonRuntime.RUNTIME.helpPrefix'));
assert(!worker.includes('MIXED_HELP_AND_API'));
assert(entry.indexOf('shared/mixed_batch_discovery.js')<entry.indexOf('service_worker.js'));
const manifest=JSON.parse(read('manifest.json')), scripts=manifest.content_scripts.flatMap(x=>x.js);
assert.equal(manifest.manifest_version,3);assert.equal(manifest.background.service_worker,'service_worker_entry.js');
for(const script of scripts)assert(fs.existsSync(path.join(dist,script)));
assert(scripts.indexOf('shared/runtime_names.js')<scripts.indexOf('content_script.js'));
assert(scripts.indexOf('shared/ozon_contract.js')<scripts.indexOf('content_script.js'));
assert.equal(scripts.filter(x=>x==='content_script.js').length,1);
assert.equal(files.length,32,'no test hooks/files in package');
assert(!content.includes('__autorunTest'),'no behavioral test exports leaked to production');
for(const guard of ['candidate.waiting || !candidate.complete || !candidate.has_marker || !candidate.assistant_text','sameConversation(activeAutoWatch.origin, activeAutoWatch.conversation_id)','conversationKeyFromLocation() !== activeAutoWatch.conversation_key','latestFingerprint !== candidate.message_fingerprint','if (!current() || !activeAutoWatch || autoTickInFlight) return;'])assert(content.includes(guard),guard);
// Independently pin every unchanged production file to the accepted exact baseline.
const manifestPath=process.env.OZON_BASELINE_MANIFEST;
if(manifestPath){const m=JSON.parse(fs.readFileSync(manifestPath,'utf8'));const base=m.files.filter(r=>r.path.includes('/dist-step7-candidate/'));assert.equal(base.length,32);for(const r of base){const rel=r.path.split('/dist-step7-candidate/')[1];if(rel==='content_script.js')continue;assert.equal(createHash('sha256').update(fs.readFileSync(path.join(dist,rel))).digest('hex'),r.sha256,'unchanged '+rel);}console.log('UNCHANGED_PRODUCTION_FILES_BYTE_PARITY=31/31');}
if(process.env.OZON_SWEEP_REPORT)fs.writeFileSync(process.env.OZON_SWEEP_REPORT,JSON.stringify({files:files.length,marker_consumer_files:5,autorun_consumers:2,references,unknown_active_consumers:0,scope:'exact installable runtime'},null,2)+'\n');
console.log('AUTORUN_MARKER_CLOSED_SET=2/2');console.log('ACTIVE_MARKER_DEPENDENCY_FILES=5/5');console.log('BOOTSTRAP_MANIFEST_PARITY=PASS');console.log('OLD_STATIC_ONLY_INGRESS_GUARDS=0');console.log('SECONDARY_DEPENDENCY_SWEEP=PASS');
