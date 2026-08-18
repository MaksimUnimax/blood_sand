import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const EXPECTED_SOURCE_GIT_BLOB = '841429741d5ff9144a8a40506e657dc4392fe37c';
const harnessPath = path.resolve(process.argv[2] || '');
const candidateDir = path.resolve(process.argv[3] || '');
const chromePath = path.resolve(process.argv[4] || '');
const projectRoot = path.resolve(process.argv[5] || '');
if (![harnessPath,path.join(candidateDir,'manifest.json'),chromePath,projectRoot].every(fs.existsSync)) {
  throw new Error('usage: node V3F_BROWSER_JUNCTION_RUNNER.mjs <exact-v3c-browser-harness.mjs> <exact-v3-candidate-dir> <cft-chrome.exe> <puppeteer-project-root>');
}
const gitBlobSha = (buf) => createHash('sha1').update(Buffer.concat([Buffer.from(`blob ${buf.length}\0`), buf])).digest('hex');
const raw=fs.readFileSync(harnessPath);
const actualBlob=gitBlobSha(raw);
if(actualBlob!==EXPECTED_SOURCE_GIT_BLOB) throw new Error(`browser harness Git blob mismatch: expected ${EXPECTED_SOURCE_GIT_BLOB}, got ${actualBlob}`);
const sourceNodeModules=path.join(projectRoot,'node_modules');
if(!fs.existsSync(sourceNodeModules)) throw new Error('Puppeteer QA node_modules missing');
const tempDir=fs.mkdtempSync(path.join(os.tmpdir(),'ozon-v3f-browser-'));
const linkPath=path.join(tempDir,'node_modules');
try { fs.symlinkSync(sourceNodeModules,linkPath,process.platform==='win32'?'junction':'dir'); }
catch(error){ throw new Error(`node_modules junction failed: ${error?.code||error?.message||error}`); }
const relocated=path.join(tempDir,'V3_BROWSER_COUNTDOWN_HARNESS.mjs');
fs.writeFileSync(relocated,raw);
const relocatedBlob=gitBlobSha(fs.readFileSync(relocated));
if(relocatedBlob!==EXPECTED_SOURCE_GIT_BLOB) throw new Error(`relocated browser harness Git blob changed: ${relocatedBlob}`);
console.log(`V3F_BROWSER_SOURCE_GIT_BLOB=${actualBlob}`);
console.log('V3F_BROWSER_RELOCATED_BYTES_IDENTICAL=PASS');
console.log(`V3F_BROWSER_NODE_MODULES_LINK=${linkPath}`);
const syntax=spawnSync(process.execPath,['--check',relocated],{cwd:tempDir,encoding:'utf8'});
process.stdout.write(syntax.stdout||''); process.stderr.write(syntax.stderr||'');
if(syntax.status!==0) process.exit(syntax.status??1);
const run=spawnSync(process.execPath,[relocated,candidateDir,chromePath],{cwd:tempDir,encoding:'utf8',timeout:120000});
process.stdout.write(run.stdout||''); process.stderr.write(run.stderr||'');
try{fs.rmSync(tempDir,{recursive:true,force:true});}catch(_){}
process.exit(run.status??1);
