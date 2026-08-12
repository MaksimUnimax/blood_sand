(() => {
  "use strict";

  const base = globalThis.WordstatProtocol;
  if (!base) throw new Error("WordstatProtocol base must be loaded before Yandex Search overlay.");

  const SEARCH_PREFIX = "YANDEX_SEARCH_API_V1";
  const SEARCH_RESULT_PREFIX = "YANDEX_SEARCH_RESULT_V1";
  const SEARCH_VERSION = "0.1.0";
  const SEARCH_METHODS = Object.freeze({
    webSearch: { endpoint: "/v2/web/search" },
    genSearch: { endpoint: "/v2/gen/search" }
  });
  const SEARCH_DEVICES = new Set(["DEVICE_PHONE", "DEVICE_DESKTOP"]);
  const SEARCH_FORMATS = new Set(["FORMAT_XML", "FORMAT_HTML"]);
  const MOBILE_UA = "Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36";
  const DESKTOP_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36";

  function fail(code, message) {
    const error = new Error(message || code);
    error.code = code;
    throw error;
  }

  function asString(value, name, { required = false, max = 400 } = {}) {
    if (value === undefined || value === null || value === "") {
      if (required) fail("MISSING_FIELD", `Отсутствует обязательное поле: ${name}`);
      return undefined;
    }
    const text = String(value);
    if (text.length > max) fail("FIELD_TOO_LONG", `${name}: превышена максимальная длина ${max}`);
    return text;
  }

  function canonicalText(value) {
    return String(value || "").replace(/\u00a0/g, " ").trim();
  }

  function isSearchCommandText(text) {
    return canonicalText(text).startsWith(SEARCH_PREFIX);
  }

  function normalizeSearchCommand(raw) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) fail("INVALID_JSON_ROOT", "Команда должна быть JSON-объектом.");
    const method = asString(raw.method, "method", { required: true, max: 80 });
    if (!SEARCH_METHODS[method]) fail("UNSUPPORTED_METHOD", `Метод ${method} не разрешён для Yandex Search overlay.`);
    const phrase = asString(raw.phrase, "phrase", { required: true, max: 400 });

    if (method === "webSearch") {
      const region = asString(raw.region === undefined ? "225" : raw.region, "region", { required: true, max: 100 });
      const device = asString(raw.device, "device", { required: true, max: 40 });
      if (!SEARCH_DEVICES.has(device)) fail("INVALID_DEVICE", `Для webSearch разрешены только DEVICE_PHONE и DEVICE_DESKTOP; получено: ${device}`);
      const responseFormat = asString(raw.responseFormat === undefined ? "FORMAT_XML" : raw.responseFormat, "responseFormat", { required: true, max: 40 });
      if (!SEARCH_FORMATS.has(responseFormat)) fail("INVALID_RESPONSE_FORMAT", `Неизвестный responseFormat: ${responseFormat}`);
      const groupsOnPage = raw.groupsOnPage === undefined ? 10 : Number(raw.groupsOnPage);
      if (!Number.isInteger(groupsOnPage) || groupsOnPage < 1 || groupsOnPage > 100) {
        fail("INVALID_GROUPS_ON_PAGE", "groupsOnPage должен быть целым числом от 1 до 100.");
      }
      return Object.freeze({ method, phrase, region, device, responseFormat, groupsOnPage });
    }

    if (method === "genSearch") {
      const unexpected = ["region", "device", "responseFormat", "groupsOnPage"].filter((key) => raw[key] !== undefined);
      if (unexpected.length) {
        fail("UNSUPPORTED_GEN_SEARCH_FIELD", `GenSearch не принимает недокументированные region/device/SERP fields: ${unexpected.join(", ")}`);
      }
      return Object.freeze({ method, phrase });
    }

    fail("UNSUPPORTED_METHOD", method);
  }

  function parseSearchCommand(text) {
    const source = canonicalText(text);
    if (!source.startsWith(SEARCH_PREFIX)) fail("NOT_YANDEX_SEARCH_COMMAND", `Команда должна начинаться с ${SEARCH_PREFIX}`);
    const rest = source.slice(SEARCH_PREFIX.length).trim();
    if (!rest) fail("MISSING_JSON", `После ${SEARCH_PREFIX} должен идти JSON-объект.`);
    let raw;
    try { raw = JSON.parse(rest); }
    catch (error) { fail("INVALID_JSON", `Некорректный JSON: ${error.message}`); }
    return normalizeSearchCommand(raw);
  }

  function parseCommand(text) {
    return isSearchCommandText(text) ? parseSearchCommand(text) : base.parseCommand(text);
  }

  function normalizeCommand(raw) {
    return raw && SEARCH_METHODS[String(raw.method || "")] ? normalizeSearchCommand(raw) : base.normalizeCommand(raw);
  }

  function buildSearchRequest(command, folderId) {
    const folder = asString(folderId, "folderId", { required: true, max: 50 });
    if (command.method === "webSearch") {
      const query = {
        searchType: "SEARCH_TYPE_RU",
        queryText: command.phrase,
        familyMode: "FAMILY_MODE_MODERATE",
        page: "0"
      };
      const groupSpec = { groupsOnPage: String(command.groupsOnPage) };
      const body = {
        query,
        groupSpec,
        region: command.region,
        folderId: folder,
        responseFormat: command.responseFormat,
        userAgent: command.device === "DEVICE_PHONE" ? MOBILE_UA : DESKTOP_UA
      };
      if (command.responseFormat === "FORMAT_XML") {
        query.fixTypoMode = "FIX_TYPO_MODE_ON";
        groupSpec.groupMode = "GROUP_MODE_FLAT";
        groupSpec.docsInGroup = "1";
        body.maxPassages = "2";
        body.l10n = "LOCALIZATION_RU";
      }
      return Object.freeze({
        url: "https://searchapi.api.cloud.yandex.net/v2/web/search",
        body
      });
    }

    if (command.method === "genSearch") {
      return Object.freeze({
        url: "https://searchapi.api.cloud.yandex.net/v2/gen/search",
        body: {
          messages: [{ content: command.phrase, role: "ROLE_USER" }],
          folderId: folder,
          searchType: "SEARCH_TYPE_RU",
          fixMisspell: true,
          getPartialResults: false,
          enableRichStructuredAnswer: false
        }
      });
    }

    fail("UNSUPPORTED_METHOD", command.method);
  }

  function buildRequest(command, folderId) {
    return SEARCH_METHODS[command?.method] ? buildSearchRequest(command, folderId) : base.buildRequest(command, folderId);
  }

  function formatResultReport({ requestId, command, httpStatus, result, elapsedMs }) {
    if (!SEARCH_METHODS[command?.method]) {
      return base.formatResultReport({ requestId, command, httpStatus, result, elapsedMs });
    }
    const envelope = {
      bridge: "yandex-search-manual-overlay",
      version: SEARCH_VERSION,
      request_id: requestId,
      command,
      http_status: httpStatus,
      elapsed_ms: elapsedMs,
      result
    };
    return `${SEARCH_RESULT_PREFIX}\n${JSON.stringify(envelope, null, 2)}`;
  }

  function isCommandText(text) {
    return isSearchCommandText(text) || base.isCommandText(text);
  }

  globalThis.WordstatProtocol = Object.freeze({
    ...base,
    METHODS: Object.freeze({ ...base.METHODS, ...SEARCH_METHODS }),
    SEARCH_PREFIX,
    SEARCH_RESULT_PREFIX,
    SEARCH_VERSION,
    SEARCH_METHODS,
    parseCommand,
    normalizeCommand,
    buildRequest,
    formatResultReport,
    isCommandText,
    isSearchCommandText
  });
})();
