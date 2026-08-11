(() => {
  "use strict";

  const PREFIX = "WORDSTAT_API_V1";
  const VERSION = "1.1.1";
  const DEFAULT_FOLDER_ID = "b1gqfm5c5vn6aingakbe";
  const DEVICES = new Set(["DEVICE_ALL", "DEVICE_DESKTOP", "DEVICE_PHONE", "DEVICE_TABLET"]);
  const PERIODS = new Set(["PERIOD_MONTHLY", "PERIOD_WEEKLY", "PERIOD_DAILY"]);
  const REGION_LEVELS = new Set(["REGION_ALL", "REGION_CITIES", "REGION_REGIONS"]);
  const METHODS = Object.freeze({
    getTop: { endpoint: "/v2/wordstat/topRequests" },
    getDynamics: { endpoint: "/v2/wordstat/dynamics" },
    getRegionsDistribution: { endpoint: "/v2/wordstat/regions" },
    getRegionsTree: { endpoint: "/v2/wordstat/getRegionsTree" }
  });

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

  function normalizeStringArray(value, name, maxItems) {
    if (value === undefined) return undefined;
    if (!Array.isArray(value)) fail("INVALID_FIELD", `${name} должен быть массивом.`);
    if (value.length > maxItems) fail("TOO_MANY_ITEMS", `${name}: максимум ${maxItems} значений.`);
    return value.map((item) => String(item));
  }

  function normalizeDevices(value) {
    const devices = normalizeStringArray(value === undefined ? ["DEVICE_ALL"] : value, "devices", 3);
    for (const device of devices) if (!DEVICES.has(device)) fail("INVALID_DEVICE", `Неизвестное устройство: ${device}`);
    return devices;
  }

  function parseCommand(text) {
    const source = String(text || "").replace(/\u00a0/g, " ").trim();
    if (!source.startsWith(PREFIX)) fail("NOT_WORDSTAT_COMMAND", `Команда должна начинаться с ${PREFIX}`);
    const rest = source.slice(PREFIX.length).trim();
    if (!rest) fail("MISSING_JSON", "После WORDSTAT_API_V1 должен идти JSON-объект.");
    let raw;
    try { raw = JSON.parse(rest); }
    catch (error) { fail("INVALID_JSON", `Некорректный JSON: ${error.message}`); }
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) fail("INVALID_JSON_ROOT", "Команда должна быть JSON-объектом.");
    return normalizeCommand(raw);
  }

  function normalizeCommand(raw) {
    const method = asString(raw.method, "method", { required: true, max: 80 });
    if (!METHODS[method]) fail("UNSUPPORTED_METHOD", `Метод ${method} не разрешён.`);

    if (method === "getRegionsTree") return Object.freeze({ method });

    const phrase = asString(raw.phrase, "phrase", { required: true, max: 400 });
    const devices = normalizeDevices(raw.devices);

    if (method === "getTop") {
      const num = raw.numPhrases === undefined ? 100 : Number(raw.numPhrases);
      if (!Number.isInteger(num) || num < 1 || num > 2000) fail("INVALID_NUM_PHRASES", "numPhrases должен быть целым числом от 1 до 2000.");
      const regions = normalizeStringArray(raw.regions === undefined ? ["225"] : raw.regions, "regions", 100);
      return Object.freeze({ method, phrase, numPhrases: num, regions, devices });
    }

    if (method === "getDynamics") {
      const period = asString(raw.period, "period", { required: true, max: 40 });
      if (!PERIODS.has(period)) fail("INVALID_PERIOD", `Неизвестный period: ${period}`);
      const fromDate = asString(raw.fromDate, "fromDate", { required: true, max: 80 });
      const toDate = asString(raw.toDate, "toDate", { required: true, max: 80 });
      if (Number.isNaN(Date.parse(fromDate)) || Number.isNaN(Date.parse(toDate))) fail("INVALID_DATE", "fromDate/toDate должны быть RFC3339 датами.");
      const regions = normalizeStringArray(raw.regions === undefined ? ["225"] : raw.regions, "regions", 100);
      return Object.freeze({ method, phrase, period, fromDate, toDate, regions, devices });
    }

    if (method === "getRegionsDistribution") {
      const region = asString(raw.region === undefined ? "REGION_ALL" : raw.region, "region", { max: 40 });
      if (!REGION_LEVELS.has(region)) fail("INVALID_REGION_LEVEL", `Неизвестный region: ${region}`);
      return Object.freeze({ method, phrase, region, devices });
    }

    fail("UNSUPPORTED_METHOD", method);
  }

  function buildRequest(command, folderId) {
    const folder = asString(folderId, "folderId", { required: true, max: 50 });
    const meta = METHODS[command.method];
    if (!meta) fail("UNSUPPORTED_METHOD", command.method);
    const body = { ...command };
    delete body.method;
    body.folderId = folder;
    return Object.freeze({
      url: `https://searchapi.api.cloud.yandex.net${meta.endpoint}`,
      body
    });
  }

  function commandFingerprint(command) {
    const json = JSON.stringify(command);
    let hash = 2166136261;
    for (let i = 0; i < json.length; i += 1) {
      hash ^= json.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16).padStart(8, "0");
  }

  function safeErrorPayload(status, rawText, parsed) {
    const candidate = parsed && typeof parsed === "object" ? parsed : null;
    return {
      http_status: Number(status || 0),
      code: String(candidate?.code || candidate?.error?.code || candidate?.status || "YANDEX_API_ERROR").slice(0, 160),
      message: String(candidate?.message || candidate?.error?.message || candidate?.error || rawText || "Yandex API error").slice(0, 2000)
    };
  }

  function formatResultReport({ requestId, command, httpStatus, result, elapsedMs }) {
    const envelope = {
      bridge: "wordstat-manual-bridge",
      version: VERSION,
      request_id: requestId,
      command,
      http_status: httpStatus,
      elapsed_ms: elapsedMs,
      result
    };
    return `WORDSTAT_RESULT_V1\n${JSON.stringify(envelope, null, 2)}`;
  }

  function isCommandText(text) {
    return String(text || "").replace(/\u00a0/g, " ").trim().startsWith(PREFIX);
  }

  globalThis.WordstatProtocol = Object.freeze({
    PREFIX,
    DEFAULT_FOLDER_ID,
    METHODS,
    parseCommand,
    normalizeCommand,
    buildRequest,
    commandFingerprint,
    safeErrorPayload,
    formatResultReport,
    isCommandText
  });
})();
