import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const [runnerArg,...runnerArgs]=process.argv.slice(2);
const runnerPath=path.resolve(runnerArg||'');
if(!fs.existsSync(runnerPath)) throw new Error('usage: node FINAL_PREFREEZE_COMPLETION_RERUN_WRAPPER.mjs <exact-original-final-runner.mjs> <original-runner-args...>');

const EXPECTED_RUNNER_BLOB='bdf242f5cb78e506e67adb7b4d06fd0f585824f3';
const gitBlob=(buf)=>createHash('sha1').update(Buffer.concat([Buffer.from(`blob ${buf.length}\0`),buf])).digest('hex');
const raw=fs.readFileSync(runnerPath);
const actual=gitBlob(raw);
if(actual!==EXPECTED_RUNNER_BLOB) throw new Error(`original final runner Git blob mismatch: expected ${EXPECTED_RUNNER_BLOB}, got ${actual}`);

let src=raw.toString('utf8');
const anchor="console.log('FINAL_BROWSER_EXTENSION_DEBUG_LAUNCH_CORRECTION_PASS');";
const oldBrowser="const extensionId=await browser.installExtension(candidateDir);\n  const swTarget=await browser.waitForTarget(t=>t.type()==='service_worker'&&t.url().startsWith(`chrome-extension://${extensionId}/`),{timeout:10000});";
const newBrowser="const extensionId=await browser.installExtension(candidateDir);\n  const swTargetPromise=browser.waitForTarget(t=>t.type()==='service_worker'&&t.url().startsWith(`chrome-extension://${extensionId}/`),{timeout:20000});\n  const wakePage=await browser.newPage();\n  let wakeError=null;\n  try {\n    await wakePage.goto(`chrome-extension://${extensionId}/popup.html`,{waitUntil:'domcontentloaded',timeout:10000});\n    try {\n      await wakePage.evaluate(async()=>{\n        try { await chrome.runtime.sendMessage({type:'__OZ_PREFREEZE_WAKE__'}); } catch (_) {}\n      });\n    } catch (error) { wakeError=String(error?.stack||error); }\n  } catch (error) { wakeError=String(error?.stack||error); }\n  let swTarget;\n  try {\n    swTarget=await swTargetPromise;\n  } catch (error) {\n    const targets=browser.targets().map(t=>({type:t.type(),url:t.url()}));\n    throw new Error('extension service worker target timeout; wakePage='+String(wakeError||'none')+'; targets='+JSON.stringify(targets)+'; cause='+String(error?.stack||error));\n  } finally {\n    try { await wakePage.close(); } catch (_) {}\n  }";
const injected=[
  anchor,
  '',
  'browserText=replaceExactlyOnce(browserText,',
  `  ${JSON.stringify(oldBrowser)},`,
  `  ${JSON.stringify(newBrowser)},`,
  "  'browser native MV3 runtime-message wake');",
  "console.log('FINAL_BROWSER_SERVICE_WORKER_WAKE_CORRECTION_PASS');"
].join('\n');
const count=src.split(anchor).length-1;
if(count!==1) throw new Error(`final runner correction anchor count ${count}`);
src=src.replace(anchor,injected);

const tempDir=fs.mkdtempSync(path.join(os.tmpdir(),'ozon-final-prefreeze-rerun-'));
const corrected=path.join(tempDir,'FINAL_PREFREEZE_COMPLETION_RUNNER_CORRECTED.mjs');
fs.writeFileSync(corrected,src,'utf8');
console.log(`FINAL_RERUN_ORIGINAL_RUNNER_GIT_BLOB=${actual}`);
console.log('FINAL_RERUN_SERVICE_WORKER_WAKE_PATCH_ONLY=PASS');

const chk=spawnSync(process.execPath,['--check',corrected],{encoding:'utf8'});
if(chk.stdout)process.stdout.write(chk.stdout);
if(chk.stderr)process.stderr.write(chk.stderr);
if(chk.status!==0) process.exit(chk.status??1);

const run=spawnSync(process.execPath,[corrected,...runnerArgs],{encoding:'utf8',timeout:240000,maxBuffer:12*1024*1024});
if(run.stdout)process.stdout.write(run.stdout);
if(run.stderr)process.stderr.write(run.stderr);
if(run.error)console.error(run.error.stack||run.error);
try{fs.rmSync(tempDir,{recursive:true,force:true});}catch(_){}
process.exit(run.status??1);
