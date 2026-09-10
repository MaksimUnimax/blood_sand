(() => {
  "use strict";

  const IGNORABLE_SEPARATOR = /[\s\u200B\u2060\u00AD]/u;

  function nextMarker(source, fromIndex, markers) {
    let selected = null;
    for (const marker of markers) {
      const index = source.indexOf(marker.prefix, fromIndex);
      if (index < 0) continue;
      if (!selected || index < selected.index || (index === selected.index && marker.prefix.length > selected.prefix.length)) {
        selected = { ...marker, index };
      }
    }
    return selected;
  }

  function balancedObjectEnd(source, objectStart) {
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let index = objectStart; index < source.length; index += 1) {
      const char = source[index];
      if (inString) {
        if (escaped) {
          escaped = false;
          continue;
        }
        if (char === "\\") {
          escaped = true;
          continue;
        }
        if (char === '"') inString = false;
        continue;
      }
      if (char === '"') {
        inString = true;
        continue;
      }
      if (char === "{") depth += 1;
      else if (char === "}") {
        depth -= 1;
        if (depth === 0) return index + 1;
        if (depth < 0) return -1;
      }
    }
    return -1;
  }

  function envelopeSlice(source, marker, markers) {
    const afterPrefix = marker.index + marker.prefix.length;
    let objectStart = afterPrefix;
    while (objectStart < source.length && IGNORABLE_SEPARATOR.test(source[objectStart])) objectStart += 1;

    if (source[objectStart] === "{") {
      const objectEnd = balancedObjectEnd(source, objectStart);
      if (objectEnd > objectStart) {
        return Object.freeze({
          text: source.slice(marker.index, objectEnd),
          end: objectEnd
        });
      }
    }

    const following = nextMarker(source, afterPrefix, markers);
    const end = following ? following.index : source.length;
    return Object.freeze({
      text: source.slice(marker.index, Math.max(end, afterPrefix)).trimEnd(),
      end: Math.max(end, afterPrefix)
    });
  }

  function discover(text, options = {}) {
    const source = String(text || "").replace(/\u00a0/g, " ");
    const commandPrefix = String(options.commandPrefix || "OZON_API_V1");
    const helpPrefixV1 = String(options.helpPrefixV1 || "OZON_HELP_V1");
    const helpPrefixV2 = String(options.helpPrefixV2 || "OZON_HELP_V2");
    const apiDiscover = options.apiDiscover;
    const parseHelp = options.parseHelp;
    if (typeof apiDiscover !== "function") throw Object.assign(new Error("apiDiscover is required"), { code: "MIXED_BATCH_API_DISCOVERY_REQUIRED" });
    if (typeof parseHelp !== "function") throw Object.assign(new Error("parseHelp is required"), { code: "MIXED_BATCH_HELP_PARSER_REQUIRED" });

    const markers = Object.freeze([
      Object.freeze({ kind: "api", prefix: commandPrefix, version: null }),
      Object.freeze({ kind: "help", prefix: helpPrefixV2, version: 2 }),
      Object.freeze({ kind: "help", prefix: helpPrefixV1, version: 1 })
    ]);

    const discovered = [];
    let cursor = 0;
    while (cursor < source.length) {
      const marker = nextMarker(source, cursor, markers);
      if (!marker) break;
      const envelope = envelopeSlice(source, marker, markers);

      if (marker.kind === "api") {
        const rows = apiDiscover(envelope.text);
        const discovery = Array.isArray(rows) ? rows.find((row) => Number(row?.marker_index) === 0) : null;
        if (!discovery) {
          discovered.push(Object.freeze({
            kind: "api",
            marker_index: marker.index,
            discovery: Object.freeze({
              ok: false,
              marker_index: marker.index,
              code: "COMMAND_DISCOVERY_FAILED_CLOSED",
              message: "OZON_API_V1 marker could not be converted into a command discovery record."
            })
          }));
        } else {
          discovered.push(Object.freeze({
            kind: "api",
            marker_index: marker.index,
            discovery: Object.freeze({ ...discovery, marker_index: marker.index })
          }));
        }
      } else {
        let help;
        try {
          help = parseHelp(envelope.text);
        } catch (error) {
          help = Object.freeze({ ok: false, code: String(error?.code || "HELP_DISCOVERY_FAILED_CLOSED") });
        }
        discovered.push(Object.freeze({
          kind: "help",
          marker_index: marker.index,
          version: marker.version,
          help,
          command_text: envelope.text
        }));
      }

      cursor = Math.max(envelope.end, marker.index + marker.prefix.length);
    }

    return Object.freeze(discovered);
  }

  globalThis.OzonMixedBatchDiscovery = Object.freeze({ discover });
})();
