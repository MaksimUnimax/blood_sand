(() => {
  "use strict";

  function base64ToBytes(value) {
    const input = String(value || "").replace(/\s+/g, "");
    if (!input) return new Uint8Array(0);
    if (input.length % 4 !== 0) throw Object.assign(new Error("Invalid base64 chunk length."), { code: "ATTACHMENT_BASE64_INVALID" });
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    const lookup = new Map([...alphabet].map((character, index) => [character, index]));
    const output = [];
    for (let index = 0; index < input.length; index += 4) {
      const a = lookup.get(input[index]);
      const b = lookup.get(input[index + 1]);
      const c = input[index + 2] === "=" ? 0 : lookup.get(input[index + 2]);
      const d = input[index + 3] === "=" ? 0 : lookup.get(input[index + 3]);
      if ([a, b, c, d].some((item) => item === undefined)) throw Object.assign(new Error("Invalid base64 chunk alphabet."), { code: "ATTACHMENT_BASE64_INVALID" });
      const triple = (a << 18) | (b << 12) | (c << 6) | d;
      output.push((triple >> 16) & 255);
      if (input[index + 2] !== "=") output.push((triple >> 8) & 255);
      if (input[index + 3] !== "=") output.push(triple & 255);
    }
    return new Uint8Array(output);
  }

  function createFile(bytes, descriptor = {}) {
    const source = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
    const filename = String(descriptor.filename || "ozon-bridge-file.bin");
    const mime = String(descriptor.mime_type || descriptor.mimeType || "application/octet-stream").split(";", 1)[0].trim() || "application/octet-stream";
    return new File([source], filename, { type: mime, lastModified: Date.now() });
  }

  function inputAcceptsFiles(input) {
    return input instanceof HTMLInputElement && String(input.type || "").toLowerCase() === "file" && input.isConnected;
  }

  function setInputFiles(input, files) {
    if (!inputAcceptsFiles(input)) throw Object.assign(new Error("Target AI attachment surface is not a live file input."), { code: "ATTACHMENT_FILE_INPUT_INVALID" });
    const list = Array.isArray(files) ? files : [];
    if (!list.length || list.some((file) => !(file instanceof File))) throw Object.assign(new Error("Attachment file list is empty or invalid."), { code: "ATTACHMENT_FILE_LIST_INVALID" });
    const transfer = new DataTransfer();
    for (const file of list) transfer.items.add(file);
    input.files = transfer.files;
    const actual = [...(input.files || [])];
    if (actual.length !== list.length || actual.some((file, index) => file.name !== list[index].name || file.size !== list[index].size)) {
      throw Object.assign(new Error("Browser file input did not accept the complete attachment set."), { code: "ATTACHMENT_FILE_INPUT_SET_FAILED" });
    }
    input.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    return actual;
  }

  function dispatchFileDrop(target, files) {
    if (!(target instanceof EventTarget) || !target.isConnected) throw Object.assign(new Error("Target AI drag-drop surface is not connected."), { code: "ATTACHMENT_DROP_TARGET_INVALID" });
    const list = Array.isArray(files) ? files : [];
    if (!list.length || list.some((file) => !(file instanceof File))) throw Object.assign(new Error("Attachment file list is empty or invalid."), { code: "ATTACHMENT_FILE_LIST_INVALID" });
    const transfer = new DataTransfer();
    for (const file of list) transfer.items.add(file);
    const actual = [...(transfer.files || [])];
    if (actual.length !== list.length || actual.some((file, index) => file.name !== list[index].name || file.size !== list[index].size || String(file.type || "") !== String(list[index].type || ""))) {
      throw Object.assign(new Error("Browser DataTransfer did not preserve the complete attachment set."), { code: "ATTACHMENT_DROP_FILESET_MISMATCH" });
    }
    const eventOptions = { bubbles: true, cancelable: true, composed: true, dataTransfer: transfer };
    for (const type of ["dragenter", "dragover", "drop"]) target.dispatchEvent(new DragEvent(type, eventOptions));
    return Object.freeze({
      dispatched: 3,
      file_count: actual.length,
      files: Object.freeze(actual.map((file) => Object.freeze({ name: file.name, size: file.size, type: file.type || "" })))
    });
  }

  function fileListSnapshot(input) {
    if (!inputAcceptsFiles(input)) return [];
    return [...(input.files || [])].map((file) => ({ name: file.name, size: file.size, type: file.type || "" }));
  }

  globalThis.OzonWebFileAttachment = Object.freeze({
    base64ToBytes,
    createFile,
    inputAcceptsFiles,
    setInputFiles,
    dispatchFileDrop,
    fileListSnapshot
  });
})();
