import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");
const CANDIDATE = join(ROOT, "dist-step7-candidate");
const chromePath = process.argv[2] || process.env.CHROME_PATH || "google-chrome";

function script(path) {
  return readFileSync(join(CANDIDATE, path), "utf8").replace(/<\/script/gi, "<\\/script");
}

const temp = mkdtempSync(join(tmpdir(), "ozon-file-attachment-browser-"));
const htmlPath = join(temp, "fixture.html");
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
body{font-family:sans-serif}form{display:block;width:700px;height:140px}textarea{display:block;width:600px;height:60px}button{display:block;width:120px;height:32px}
</style></head><body>
<form id="composer-form" data-testid="composer-root">
  <textarea id="prompt-textarea"></textarea>
  <input id="upload-files" type="file" multiple style="display:none">
  <button id="composer-submit-button" data-testid="send-button" type="button" aria-label="Send">Send</button>
</form>
<div id="result">PENDING</div>
<script>${script("shared/ai_delivery_capabilities.js")}</script>
<script>${script("shared/ai_adapters.js")}</script>
<script>${script("shared/composer_send.js")}</script>
<script>${script("shared/web_file_attachment.js")}</script>
<script>
(async()=>{
  const fail=(message)=>{document.querySelector('#result').textContent='FAIL:'+message;};
  try{
    const adapter=OzonAIAdapters.ADAPTERS.chatgpt;
    if(!adapter) throw new Error('chatgpt adapter missing');
    const input=document.querySelector('#upload-files');
    let inputEvents=0, changeEvents=0;
    input.addEventListener('input',()=>inputEvents++);
    input.addEventListener('change',()=>changeEvents++);
    const payload=new TextEncoder().encode('полный файл 😀');
    const file=OzonWebFileAttachment.createFile(payload,{filename:'ozon-browser-test.txt',mime_type:'text/plain;charset=utf-8'});
    OzonWebFileAttachment.setInputFiles(input,[file]);
    if(inputEvents!==1||changeEvents!==1) throw new Error('standard input/change events not observed exactly once');
    if(input.files.length!==1||input.files[0].name!=='ozon-browser-test.txt'||input.files[0].size!==payload.byteLength) throw new Error('FileList integrity mismatch');
    const surface=adapter.attachmentSurface();
    if(!surface||surface.input!==input) throw new Error('adapter did not resolve its own upload input');
    if(adapter.attachmentReady([{filename:'ozon-browser-test.txt'}])) throw new Error('attachment ready before preview');
    const preview=document.createElement('div'); preview.setAttribute('role','group'); preview.setAttribute('aria-label','ozon-browser-test.txt'); document.body.appendChild(preview);
    if(!adapter.attachmentReady([{filename:'ozon-browser-test.txt'}])) throw new Error('adapter did not recognize attachment preview');
    const context=adapter.composerContext();
    if(!context||context.composer.id!=='prompt-textarea') throw new Error('composer context mismatch');
    const marker='OZON_BATCH_RESULT_V1\\n{"delivery_id":"browser-fixture"}';
    adapter.setComposerText(context.composer,marker);
    if(adapter.readComposerText(context.composer)!==marker) throw new Error('adapter composer marker mismatch');
    const button=adapter.sendButton(context);
    if(!button||button.id!=='composer-submit-button') throw new Error('adapter send resolver mismatch');
    const validation=BB2ComposerSend.validateTarget({context,button},marker,{
      visible:OzonAIAdapters.visible,
      readComposerText:(composer)=>adapter.readComposerText(composer),
      candidateButtons:(ctx)=>adapter.sendButtonCandidates(ctx),
      fingerprint:(node)=>adapter.sendButtonFingerprint(node)
    });
    if(!validation.ok) throw new Error('composer send validation failed:'+validation.code);
    document.querySelector('#result').textContent='BROWSER_FILE_ATTACHMENT_PRIMITIVE_PASS';
  }catch(error){fail(error&&error.message?error.message:String(error));}
})();
</script></body></html>`;
writeFileSync(htmlPath, html, "utf8");

try {
  const output = execFileSync(chromePath, [
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--disable-background-networking",
    "--allow-file-access-from-files",
    "--dump-dom",
    pathToFileURL(htmlPath).href
  ], { encoding: "utf8", timeout: 60_000, maxBuffer: 16 * 1024 * 1024 });
  assert.match(output, /BROWSER_FILE_ATTACHMENT_PRIMITIVE_PASS/);
  assert.doesNotMatch(output, /<div id="result">FAIL:/);
  console.log("REG_CHROME_NATIVE_FILE_DATATRANSFER_PASS");
  console.log("REG_CHROME_CHATGPT_ADAPTER_ATTACHMENT_SURFACE_PASS");
  console.log("REG_CHROME_ATTACHMENT_PREVIEW_READY_PASS");
  console.log("REG_CHROME_ATTACHMENT_MARKER_SEND_PREFLIGHT_PASS");
  console.log("FILE_ATTACHMENT_BROWSER_PRIMITIVE_PASS");
} finally {
  rmSync(temp, { recursive: true, force: true });
}
