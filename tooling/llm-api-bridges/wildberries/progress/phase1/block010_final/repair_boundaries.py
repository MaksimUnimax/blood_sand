from pathlib import Path
import sys
root=Path(sys.argv[1]).resolve()
p=root/'shared/ai_adapters.js';s=p.read_text()
s=s.replace('    const candidates = [];\n    for (const selector of selectors)', '    const candidates = [], seen = new Set();\n    for (const selector of selectors)',1)
s=s.replace('        const form = composer.closest("form");','        if (seen.has(composer)) continue;\n        seen.add(composer);\n        const form = composer.closest("form");',1)
s=s.replace('    return candidates[0]?.context || null;', '    const best = candidates[0];\n    if (!best || candidates.filter(item => item.score === best.score).length !== 1) return null;\n    return best.context;',1)
a=s.index('  function chatgptFileInput() {');b=s.index('\n  function chatgptAttachmentPreview',a)
s=s[:a]+'''  function chatgptFileInput() {
    // The input must belong to the same unique composer, never a global/other form.
    const context = chatgptComposerContext();
    if (!context?.form) return null;
    const candidates = [...context.form.querySelectorAll('input[type="file"]')]
      .filter(item => item instanceof HTMLInputElement && item.isConnected && !chatgptInsideAssistantEditor(item));
    return candidates.length === 1 ? candidates[0] : null;
  }
'''+s[b:]
old='    attachFiles(surface,files) { if(surface?.kind!=="file_input_v1"||!surface.input?.isConnected)throw Object.assign(new Error("Attachment surface missing"),{code:"TARGET_AI_ATTACHMENT_SURFACE_UNAVAILABLE"});return WBWebFileAttachment.setInputFiles(surface.input,files); },'
new='''    attachFiles(surface,files) {
      const live = this.attachmentSurface();
      if (!live || surface?.kind !== "file_input_v1" || surface.input !== live.input || surface.root !== live.root)
        throw Object.assign(new Error("Attachment surface changed"), {code:"TARGET_AI_ATTACHMENT_SURFACE_CHANGED"});
      return WBWebFileAttachment.setInputFiles(live.input,files);
    },'''
assert s.count(old)==1;s=s.replace(old,new);p.write_text(s)
p=root/'shared/file_delivery.js';s=p.read_text()
needle="     const context=ai.composerContext();if(!context)throw err('COMPOSER_NOT_FOUND');"
add=needle+"\n     const verifyComposer=()=>{active(conversationKey);const fresh=ai.composerContext();if(!fresh || fresh.composer!==context.composer || fresh.root!==context.root)throw err('ATTACHMENT_COMPOSER_CHANGED');};"
assert s.count(needle)==1;s=s.replace(needle,add)
s=s.replace("       active(conversationKey);const surface=ai.attachmentSurface();", "       verifyComposer();const surface=ai.attachmentSurface();",1)
s=s.replace("active(conversationKey);const fresh=ai.composerContext();if(fresh?.composer!==context.composer)throw err('ATTACHMENT_COMPOSER_CHANGED');if(ai.attachmentReady(descriptors))", "verifyComposer();if(ai.attachmentReady(descriptors))",1)
s=s.replace("if(!ack?.ok)throw err(ack?.code||'ATTACHMENT_ACK_FAILED');return {attached:true", "if(!ack?.ok)throw err(ack?.code||'ATTACHMENT_ACK_FAILED');verifyComposer();return {attached:true",1)
p.write_text(s)
for name in ['manifest.json','content_script.js','service_worker.js','popup.js','popup.html','shared/wb_contract.js','shared/runtime_names.js']:
 p=root/name;s=p.read_text();assert '0.2.0' in s,name;p.write_text(s.replace('0.2.0','0.2.1'))
print('FOUR_BOUNDARY_DEFECTS_PATCHED; VERSION0.2.1; FINAL_TESTS_REQUIRED')
