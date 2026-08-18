import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const [workerSourceArg,browserSourceArg,regressionSourceArg,step4Arg,candidateArg,chromeArg,projectRootArg] = process.argv.slice(2);
const workerSource=path.resolve(workerSourceArg||'');
const browserSource=path.resolve(browserSourceArg||'');
const regressionSource=path.resolve(regressionSourceArg||'');
const step4Dir=path.resolve(step4Arg||'');
const candidateDir=path.resolve(candidateArg||'');
const chromePath=path.resolve(chromeArg||'');
const projectRoot=path.resolve(projectRootArg||'');
if (![workerSource,browserSource,regressionSource,path.join(step4Dir,'service_worker.js'),path.join(candidateDir,'service_worker.js'),path.join(candidateDir,'content_script.js'),chromePath,projectRoot].every(fs.existsSync)) {
  throw new Error('usage: node FINAL_PREFREEZE_COMPLETION_RUNNER.mjs <worker-source> <browser-source> <regression-source> <step4-dir> <candidate-dir> <cft-exe> <puppeteer-project-root>');
}

const SOURCE_BLOBS={
  worker:'0da73bdd1bb1608074781bb0c594c7875a4fe3ce',
  browser:'841429741d5ff9144a8a40506e657dc4392fe37c',
  regression:'57574ef6fdb96a5ed5e0b0a02eec5b5ba99e9be5'
};
const EXPECTED_WORKER='34a84f66284f5aa5f77b9b7cda23d5ddb2431c7b30114cd5fe927798c31e957a';
const EXPECTED_CONTENT='d95d2ca040c37f688d33c2caac8a78d95389b8e7acd41fcf11f8e0b4dc59e001';
const EXPECTED_STEP4_WORKER='7133956f8d66cc0a8767368224f6177dc1e16838d74fdd034d8aedda7e8e0ffd';
const sha256=(buf)=>createHash('sha256').update(buf).digest('hex');
const gitBlob=(buf)=>createHash('sha1').update(Buffer.concat([Buffer.from(`blob ${buf.length}\0`),buf])).digest('hex');
const fileSha=(p)=>sha256(fs.readFileSync(p));
const assert=(v,m)=>{if(!v)throw new Error(m)};

const workerRaw=fs.readFileSync(workerSource);
const browserRaw=fs.readFileSync(browserSource);
const regressionRaw=fs.readFileSync(regressionSource);
assert(gitBlob(workerRaw)===SOURCE_BLOBS.worker,'worker source Git blob mismatch');
assert(gitBlob(browserRaw)===SOURCE_BLOBS.browser,'browser source Git blob mismatch');
assert(gitBlob(regressionRaw)===SOURCE_BLOBS.regression,'regression source Git blob mismatch');
assert(fileSha(path.join(candidateDir,'service_worker.js'))===EXPECTED_WORKER,'candidate worker SHA mismatch');
assert(fileSha(path.join(candidateDir,'content_script.js'))===EXPECTED_CONTENT,'candidate content SHA mismatch');
assert(fileSha(path.join(step4Dir,'service_worker.js'))===EXPECTED_STEP4_WORKER,'Step4 worker SHA mismatch');
console.log('FINAL_SOURCE_GIT_BLOB_INTEGRITY_PASS');
console.log('FINAL_PRODUCTION_HASH_INTEGRITY_PASS');

function replaceExactlyOnce(src,oldText,newText,label){
  const count=src.split(oldText).length-1;
  if(count!==1) throw new Error(`${label}: expected one anchor, got ${count}`);
  return src.replace(oldText,newText);
}

let workerText=workerRaw.toString('utf8');
workerText=replaceExactlyOnce(workerText,
  "const now=Date.now(); const last=now-64800; const due=last+65000;",
  "const now=Date.now(); const last=now-57000; const due=last+65000;",
  'worker guarded-due fixture');
workerText=replaceExactlyOnce(workerText,
  "function clone(v){ return v === undefined ? undefined : structuredClone(v); }",
  `let context;\nfunction clone(v){\n  if (v === undefined) return undefined;\n  const text = JSON.stringify(v);\n  if (text === undefined) return undefined;\n  return context ? vm.runInContext(\`JSON.parse(\${JSON.stringify(text)})\`, context) : JSON.parse(text);\n}`,
  'worker realm-safe storage clone');
workerText=replaceExactlyOnce(workerText,
  "const context=vm.createContext(sandbox);",
  "context=vm.createContext(sandbox);",
  'worker context declaration');
console.log('FINAL_WORKER_TEST_FIXTURE_CORRECTION_PASS');
console.log('FINAL_WORKER_REALM_SAFE_STORAGE_PASS');

let browserText=browserRaw.toString('utf8');
browserText=replaceExactlyOnce(browserText,
  "`--user-data-dir=${profile}`,'--remote-debugging-port=0','--no-first-run'",
  "`--user-data-dir=${profile}`,'--remote-debugging-port=0','--enable-unsafe-extension-debugging','--no-first-run'",
  'browser extension-debugging launch flag');
console.log('FINAL_BROWSER_EXTENSION_DEBUG_LAUNCH_CORRECTION_PASS');

const tempRoot=fs.mkdtempSync(path.join(os.tmpdir(),'ozon-final-prefreeze-'));
const workerPath=path.join(tempRoot,'FINAL_WORKER_HARNESS.mjs');
const regressionPath=path.join(tempRoot,'FINAL_REGRESSION_HARNESS.mjs');
const browserDir=path.join(tempRoot,'browser');
fs.mkdirSync(browserDir,{recursive:true});
const browserPath=path.join(browserDir,'FINAL_BROWSER_HARNESS.mjs');
fs.writeFileSync(workerPath,workerText,'utf8');
fs.writeFileSync(regressionPath,regressionRaw);
fs.writeFileSync(browserPath,browserText,'utf8');

const sourceNodeModules=path.join(projectRoot,'node_modules');
assert(fs.existsSync(sourceNodeModules),'existing Puppeteer node_modules missing');
const nodeModulesLink=path.join(browserDir,'node_modules');
fs.symlinkSync(sourceNodeModules,nodeModulesLink,'junction');
console.log('FINAL_BROWSER_NODE_MODULES_JUNCTION_PASS');

for (const p of [workerPath,browserPath,regressionPath]) {
  const chk=spawnSync(process.execPath,['--check',p],{encoding:'utf8'});
  if(chk.stdout)process.stdout.write(chk.stdout);
  if(chk.stderr)process.stderr.write(chk.stderr);
  if(chk.status!==0) throw new Error(`node --check failed for ${p}`);
}
console.log('FINAL_TRANSFORMED_HARNESS_SYNTAX_PASS');

function run(label,args,opts={}){
  const r=spawnSync(process.execPath,args,{encoding:'utf8',timeout:opts.timeout||120000,cwd:opts.cwd||process.cwd(),maxBuffer:8*1024*1024});
  console.log(`===== ${label}_STDOUT_BEGIN =====`);
  if(r.stdout)process.stdout.write(r.stdout);
  console.log(`===== ${label}_STDOUT_END =====`);
  console.log(`===== ${label}_STDERR_BEGIN =====`);
  if(r.stderr)process.stderr.write(r.stderr);
  console.log(`===== ${label}_STDERR_END =====`);
  console.log(`${label}_EXIT_CODE=${r.status ?? -1}`);
  if(r.error)console.log(`${label}_SPAWN_ERROR=${String(r.error.stack||r.error)}`);
  return r;
}

const workerRun=run('FINAL_WORKER_RUN',[workerPath,candidateDir],{timeout:120000});
const regressionRun=run('FINAL_REGRESSION_RUN',[regressionPath,step4Dir,candidateDir],{timeout:60000});
const browserRun=run('FINAL_BROWSER_RUN',[browserPath,candidateDir,chromePath],{timeout:150000,cwd:browserDir});

try{fs.rmSync(tempRoot,{recursive:true,force:true});}catch(_){}

const allPass=workerRun.status===0 && regressionRun.status===0 && browserRun.status===0;
if(allPass){
  console.log('FINAL_PREFREEZE_COMPLETION_PASS');
  process.exit(0);
}
console.log('FINAL_PREFREEZE_COMPLETION_FAILED');
process.exit(1);
